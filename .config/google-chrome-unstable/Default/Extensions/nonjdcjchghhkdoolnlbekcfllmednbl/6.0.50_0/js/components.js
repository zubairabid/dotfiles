// ****************************************************************************************************
// Cross-platform base methods for recording and loading user preferences, handlers for install/update.
// ****************************************************************************************************

let storage = {

    prepareKey(key) {
        return 'extensions.' + chrome.runtime.id + '.' + key;
    },

    write(key, value) {
        localStorage.setItem(this.prepareKey(key), value);
    },

    read(key) {
        let result;
        let value = localStorage.getItem(this.prepareKey(key));

        if (isNaN(value)) {
            if (value === 'true') {
                result = true;
            } else if (value === 'false') {
                result = false;
            } else {
                result = value;
            }
        } else {
            result = parseFloat(value);
        }

        return result;
    },

    remove(key) {
        localStorage.removeItem(this.prepareKey(key));
    }
};

let fileStorage = {

    getFS(onSuccessCallback, onFailureCallback) {
        const _10MB_SIZE = 1024 * 1024 * 10;
        window.webkitRequestFileSystem(window.PERSISTENT, _10MB_SIZE, onSuccessCallback, onFailureCallback);
    },

    getFile(path, createFlag, onSuccessCallback, onFailureCallback) {
        let dirname = path.slice(0, path.lastIndexOf('/') + 1);
        let filename = path.slice(dirname.length) + ".js";

        this.getDirectory(dirname, { create: createFlag }, (root) => {
            root.getFile(filename, { create: createFlag },
                onSuccessCallback, onFailureCallback);
        }, onFailureCallback);
    },

    getDirectory(path, createFlag, onSuccessCallback, onFailureCallback) {
        let folders = path.split('/');
        if (folders[0] === '.' || folders[0] === '') {
            folders = folders.slice(1);
        }

        let getDirHelper = function (dirEntry, folders) {
            if (folders.length) {
                dirEntry.getDirectory(folders[0], { create: createFlag }, (dirEntry) => {
                    getDirHelper(dirEntry, folders.slice(1));
                }, onFailureCallback);
            } else {
                onSuccessCallback(dirEntry);
            }
        };

        this.getFS((fs) => {
            getDirHelper(fs.root, folders);
        }, onFailureCallback);
    },

    getFullPath(filename, onSuccessCallback, onFailureCallback) {
        this.getFile(filename, false, (fileEntry) => {
            onSuccessCallback(fileEntry.toURL());
        }, onFailureCallback);
    },

    read(filename, onSuccessCallback, onFailureCallback) {
        this.getFile(filename, false, (fileEntry) => {
            fileEntry.file(file => {
                let reader = new FileReader();
                reader.onloadend = () => {
                    onSuccessCallback(reader.result);
                };
                reader.onerror = (err) => {
                    onFailureCallback && onFailureCallback(err);
                };
                reader.readAsText(file);
            }, onFailureCallback);
        }, onFailureCallback);
    },

    write(filename, content, onSuccessCallback, onFailureCallback) {
        this.getFile(filename, true, (fileEntry) => {
            fileEntry.createWriter(fileWriter => {
                var blob = new Blob(Array.prototype.slice.call(content), { type: 'text/plain' });
                fileWriter.onerror = err => {
                    onFailureCallback && onFailureCallback(err);
                };
                fileWriter.onwriteend = () => {
                    fileWriter.onwriteend = () => {
                        onSuccessCallback && onSuccessCallback();
                    };
                    fileWriter.write(blob);
                };
                fileWriter.truncate(0);
            }, onFailureCallback);
        }, onFailureCallback);
    },

    remove(filename, onSuccessCallback, onFailureCallback) {
        this.getFile(filename, false, fileEntry => {
            fileEntry.remove(onSuccessCallback, onFailureCallback);
        }, onFailureCallback);
    },
};

let xmlHttpRequests = {
    // Queries arguments are send to early detect user issues on install / update reason.
    sendGet(url, reason, callback) {
        const query = [
            `reason=${reason}`,
            `installTime=${settings.installTime()}`,
            `installVersion=${settings.installVersion()}`,
            `currentVersion=${settings.currentVersion()}`,
            `appVersion=${settings.appVersion}`,
            `cid=${chrome.runtime.id}`,
            `pid=${settings.pid}`,
        ];

        let xhr = new XMLHttpRequest();
        xhr.open("GET", `${url}/${settings.ubid()}?${query.join('&')}`, true);
        xhr.setRequestHeader("Content-type", "text/plain");
        xhr.onreadystatechange = function () {
            if (callback && xhr.readyState === 4 && xhr.status === 200) {
              callback(xhr.responseText);
            }
        };
        xhr.send();
    },
};