(function () {

    var module = angular.module('h265player', []);

    var SubtitlesAss = function(container, header) {
        this.destroyed = false;
        this.container = container;
        this.header = header;
        this.width = null;
        this.height = null;
        this.reset();
    };

    SubtitlesAss.prototype.reset = function() {
        this.pending_subtitles = [];
        this.timestamp = null;
        this._destroyObjects();
    };

    SubtitlesAss.prototype._destroyObjects = function() {
        if (this.renderer) {
            this.renderer.libjassSubsWrapper.parentNode.replaceChild(this.container, this.renderer.libjassSubsWrapper);
        }
        this.renderer = null;
        this.wrapper = null;
        this.clock = null;
        this.ass = null;
    };

    SubtitlesAss.prototype.destroy = function() {
        this.destroyed = true;
        this._destroyObjects();
        this.container = null;
        this.pending_subtitles = null;
    };

    SubtitlesAss.prototype.activate = function() {
        var that = this;
        libjass.ASS.fromString(that.header, libjass.Format.ASS).then(function(ass) {
            if (that.destroyed) {
                return;
            }

            that.ass = ass;
            that.clock = new libjass.renderers.ManualClock();
            that.clock.setEnabled(true);
            if (that.timestamp !== null) {
                that.clock.tick(that.timestamp);
                that.timestamp = null;
            }
            that.clock.play();
            var dest = document.createElement("div");
            var settings = {};
            var renderer = new libjass.renderers.WebRenderer(that.ass, that.clock, dest, settings);
            that.container.parentNode.replaceChild(renderer.libjassSubsWrapper, that.container);
            renderer.libjassSubsWrapper.insertBefore(that.container, renderer.libjassSubsWrapper.firstElementChild);
            if (that.width !== null && that.height !== null) {
                renderer.resize(that.width, that.height);
            }

            var i;
            for (i=0; i<that.pending_subtitles.length; i++) {
                ass.addEvent(that.pending_subtitles[i]);
            }
            that.pending_subtitles = null;
            that.renderer = renderer;
        });
    };

    SubtitlesAss.prototype.deactivate = function() {
        this._destroyObjects();
        this.pending_subtitles = [];
    };

    SubtitlesAss.prototype.setTimestamp = function(timestamp) {
        // Timestamp is in seconds
        if (this.clock) {
            this.clock.tick(timestamp);
        }
        this.timestamp = timestamp;
    };

    SubtitlesAss.prototype.addSubtitle = function(subtitle) {
        if (this.destroyed) {
            return;
        }
        if (this.pending_subtitles !== null) {
            this.pending_subtitles.push(subtitle);
            return;
        }
        this.ass.addEvent(subtitle);
    };

    SubtitlesAss.prototype.resize = function(width, height) {
        if (this.renderer) {
            this.renderer.resize(width, height);
        }
        this.width = width;
        this.height = height;
    };

    module.controller('PlayerController', ["$window", "$scope", function($window, $scope) {

        var window_title = chrome.i18n.getMessage("application_name");
        $window.document.title = window_title;

        var movie_url = null;
        var body = $("body");
        var containerElement = $("#container")[0];

        $scope.state = 'empty';
        $scope.loading = false;
        $scope.container = null;
        $scope.player = null;
        $scope.timestamp = '0:00';
        $scope.progress = 0;
        $scope.volume = 100;
        $scope.volume_visible = false;
        $scope.subtitles = {};
        $scope.subtitles_list = [];
        $scope.has_subtitles = false;
        $scope.current_subtitle = "";

        $scope.switchState = function(state) {
            $scope.state = state;
        };

        $scope.setLoading = function(loading) {
            $scope.loading = loading;
        };

        var formatTime = function(timestamp) {
            if (!timestamp) {
                return "0:00";
            }

            var minutes = Math.floor(timestamp / 60000);
            var seconds = Math.floor(timestamp / 1000) % 60;
            if (seconds < 10) {
                seconds = "0" + seconds;
            }
            var hours;
            if (minutes >= 60) {
                hours = Math.floor(minutes / 60) + ":";
                minutes = minutes % 60;
                if (minutes < 10) {
                    minutes = "0" + minutes;
                }
            } else {
                hours = "";
            }

            return hours + minutes + ":" + seconds;
        };

        var updateTime = function(timestamp, duration) {
            if (!$scope.player) {
                timestamp = duration = 0;
            }
            if (duration > 0) {
                $scope.timestamp = formatTime(timestamp) + " / " + formatTime(duration);
                $scope.progress = 100 * (timestamp / duration);
            } else {
                $scope.timestamp = formatTime(timestamp);
                $scope.progress = 0;
            }
        };

        $scope.seekMovie = function($event) {
            if (!$scope.player) {
                return;
            }

            var target = $event.target;
            if ($(target).hasClass("bar")) {
                target = target.parentNode;
            }
            var position = ($event.offsetX / target.offsetWidth) * 100;
            $scope.player.postMessage({type: "action", action: "seek", position: position});
        };

        $scope.openMovie = function() {
            if (!chrome || !chrome.fileSystem) {
                Alertify.dialog.alert(chrome.i18n.getMessage("filesystem_api_required"));
                return;
            }

            var options = {
                type: "openFile",
                accepts: [
                    {
                        description: chrome.i18n.getMessage("open_file_description"),
                        extensions: ["mkv"]
                    }
                ],
                acceptsMultiple: false
            };

            chrome.fileSystem.chooseEntry(options, function(entry) {
                if (chrome.runtime.lastError) {
                    console.log("Error while selecting:", chrome.runtime.lastError);
                    if (chrome.runtime.lastError.message !== "User cancelled") {
                        Alertify.dialog.alert(chrome.runtime.lastError.message);
                    }
                    return;
                }

                if (!entry) {
                    console.log("Nothing selected:", entry);
                    return;
                }

                if (entry.length) {
                    // Old versions of Chrome passed a list of entries.
                    entry = entry[0];
                }

                entry.file(function(file) {
                    $scope.$apply(function() {
                        $scope.loadMovie(file, entry.name);
                    });
                }, function() {
                    $window.document.title = window_title;
                    Alertify.dialog.alert(chrome.i18n.getMessage("could_not_open_file"));
                });
            });
        };

        $scope.playMovie = function() {
            if ($scope.player) {
                $scope.player.postMessage({type: "action", action: "play"});
            }
            $scope.switchState('playing');
        };

        $scope.pauseMovie = function() {
            if ($scope.player) {
                $scope.player.postMessage({type: "action", action: "pause"});
            }
            $scope.switchState('paused');
        };

        $scope.stopMovie = function(force) {
            $window.document.title = window_title;
            if ($scope.player) {
                var player = $scope.player;
                $scope.player = null;
                player.postMessage({type: "action", action: "close"});
                if (!force) {
                    setTimeout(function() {
                        player.parentNode.removeChild(player);
                    }, 100);
                } else {
                    player.parentNode.removeChild(player);
                }
            }
            if (movie_url) {
                URL.revokeObjectURL(movie_url);
                movie_url = null;
            }
            _.each($scope.subtitles, function(subtitle) {
                if (subtitle.player) {
                    subtitle.player.destroy();
                    delete subtitle.player;
                }
            });
            $scope.subtitles = {};
            $scope.subtitles_list = [];
            $scope.has_subtitles = false;
            $scope.current_subtitle = "";
            $scope.switchState('empty');
            $scope.setLoading(false);
            $scope.volume_visible = false;
            BigScreen.exit();
            updateTime(0, 0);
        };

        // hide mouse after 5 seconds of inactivity
        var triggerHideMouse = _.debounce(function() {
            body.removeClass("mouseactive");
        }, 5000);

        $scope.mouseMove = function($event) {
            body.addClass("mouseactive");
            triggerHideMouse();
        };

        $scope.toggleFullscreen = function($event) {
            if ($scope.player) {
                if (!BigScreen.enabled) {
                    Alertify.dialog.alert(chrome.i18n.getMessage("doubleclick_fullscreen"));
                    return;
                }

                BigScreen.toggle(containerElement, function() {
                    // "onEnter" callback
                    $scope.$apply(function(scope) {
                        body.addClass("fullscreen");
                    });
                }, function() {
                    // "onExit" callback
                    $scope.$apply(function(scope) {
                        body.removeClass("fullscreen");
                    });
                });
            }
        };

        $scope.isFullscreen = function() {
            return BigScreen.enabled && !!BigScreen.element;
        };

        $scope.handleResize = function() {
            _.each($scope.subtitles, function(subtitle) {
                if (subtitle.player) {
                    subtitle.player.resize(containerElement.offsetWidth, containerElement.offsetHeight);
                }
            });
        };

        $(window).resize(function() {
            $scope.$apply(function(scope) {
                scope.handleResize();
            })
        });

        $scope.loadMovie = function(file, filename) {
            if ($scope.player) {
                $scope.stopMovie(true);
            }
            $scope.setLoading(true);
            $scope.switchState('loading');
            if (filename) {
                $window.document.title = window_title + " - " + filename;
            }

            var duration = 0;
            var player = document.createElement("embed");
            var warnings = {};
            player.setAttribute("id", "h265_player");
            player.setAttribute("type", "application/x-nacl");
            player.setAttribute("src", "naclh265.nmf");
            player.addEventListener("message", function(message) {
                $scope.$apply(function() {
                    var elem = message.target;
                    var data = message.data;
                    var msg;
                    if (data.type == "resize") {
                        // no action required
                    } else if (data.type == "progress") {
                        var timestamp = data.progress.timestamp;
                        duration = data.progress.duration;
                        updateTime(timestamp, duration);
                        _.each($scope.subtitles, function(subtitle) {
                            subtitle.timestamp = timestamp / 1000.0;
                            if (subtitle.player) {
                                subtitle.player.setTimestamp(timestamp / 1000.0);
                            }
                        });
                    } else if (data.type == "start") {
                        $scope.switchState('playing');
                        $scope.setLoading(false);
                        var volume = parseInt($scope.volume, 10);
                        if (!isNaN(volume) && volume != 100) {
                            player.postMessage({type: "action", action: "volume", volume: volume});
                        }
                    } else if (data.type == "end") {
                        $scope.switchState('finished');
                        if (duration) {
                            updateTime(duration, duration);
                        }
                    } else if (data.type == "error") {
                        $scope.switchState('empty');
                        $scope.setLoading(false);
                        $scope.stopMovie();
                        msg = chrome.i18n.getMessage(data.error.message);
                        if (!msg || msg === data.error.message) {
                            msg = chrome.i18n.getMessage("unknown_playback_error");
                        }
                        Alertify.dialog.alert(msg);
                    } else if (data.type == "warning") {
                        var warning = data.warning.message;
                        msg = chrome.i18n.getMessage(warning);
                        if (msg && msg != warning && !warnings[warning]) {
                            warnings[warning] = true;
                            Alertify.log.info(msg);
                        }
                    } else if (data.type == "action") {
                        switch (data.action) {
                        case "togglefullscreen":
                            $scope.toggleFullscreen();
                            break;
                        default:
                            console.warn("Unsupported action", data);
                            break;
                        }
                    } else if (data.type == "subtitle.new") {
                        var id = data.subtitle.id;
                        var prev = $scope.subtitles[id];
                        if (prev) {
                            // Seeked, reset subtitle
                            if (prev.player) {
                                prev.player.destroy();
                                delete prev.player;
                            }
                            return;
                        }

                        var title = data.subtitle.title;
                        if (!title) {
                            title = chrome.i18n.getMessage("subtitle_idx", [_.keys($scope.subtitles).length+1]);
                        }
                        var language = data.subtitle.language;
                        if (language) {
                            title += " (" + language + ")";
                        }
                        var info = {
                            "id": id,
                            "title": title,
                            "data": data.subtitle
                        };

                        $scope.has_subtitles = true;
                        $scope.subtitles[id] = info;
                        $scope.subtitles_list.push(info);
                    } else if (data.type == "subtitle.event") {
                        if (data.subtitle && data.subtitle.type === "ass") {
                            var sub = $scope.subtitles[data.subtitle.id];
                            if (sub) {
                                if (!sub.player) {
                                    var subtitles = document.getElementById("subtitles");
                                    var subtitle = new SubtitlesAss(subtitles, sub.data.header);
                                    subtitle.resize(containerElement.offsetWidth, containerElement.offsetHeight);
                                    sub.player = subtitle;
                                    if (sub.timestamp) {
                                        subtitle.setTimestamp(sub.timestamp);
                                    }
                                    if (data.subtitle.id == $scope.current_subtitle) {
                                        subtitle.activate();
                                    }
                                }
                                sub.player.addSubtitle(data.subtitle.subtitle);
                            }
                        }
                    } else {
                        console.warn("Unsupported message", data);
                    }
                });
            }, false);

            player.addEventListener("load", function(message) {
                // plugin has been loaded, notify to start playback
                $scope.$apply(function() {
                    $scope.switchState('starting');
                    if (movie_url) {
                        URL.revokeObjectURL(movie_url);
                    }
                    movie_url = URL.createObjectURL(file);
                    player.postMessage({type: "url", url: movie_url});
                });
            }, true);

            $scope.container.appendChild(player);
            $scope.player = player;
        };

        $scope.$watch("volume", function(volume) {
            if (BigScreen.element) {
                // prevent mouse from being hidden while volume is changed
                triggerHideMouse();
            }
            volume = parseInt(volume, 10);
            if ($scope.player && !isNaN(volume)) {
                $scope.player.postMessage({type: "action", action: "volume", volume: volume});
            }
        });

        $scope.$watch("current_subtitle", function(id, prev_id) {
            var prev_sub = $scope.subtitles[prev_id];
            if (prev_sub && prev_sub.player) {
                prev_sub.player.deactivate();
            }
            var sub = $scope.subtitles[id];
            if (sub && sub.player) {
                sub.player.activate();
            }
        });

    }]);

    module.directive('videoContainer', function() {
        return function($scope, $element, $attr) {
            var container = $element[0];

            container.addEventListener('loadstart', function(event) {
                console.log("Module loading", event);
            }, true);

            container.addEventListener('progress', function(event) {
                console.log("Module loading progress:", event);
            }, true);

            container.addEventListener('error', function(event) {
                $scope.$apply(function() {
                    $scope.stopMovie();
                });
                Alertify.dialog.alert(chrome.i18n.getMessage("could_not_load_player"));
            }, true);

            container.addEventListener('crash', function(event) {
                var player = $scope.player;
                $scope.$apply(function() {
                    $scope.stopMovie();
                });
                if (event.target == player) {
                    // only notify about crashes when currently playing back
                    Alertify.dialog.alert(chrome.i18n.getMessage("player_crashed"));
                }
            }, true);

            $scope.container = container;
        };
    });

    module.filter('i18n', function() {
        return function(input) {
            var result = chrome.i18n.getMessage(input);
            if (!result) {
                result = input;
            }
            return result;
        };
    });

}());
