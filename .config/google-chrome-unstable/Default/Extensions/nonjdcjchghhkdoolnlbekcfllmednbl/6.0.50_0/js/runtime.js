// *****************************************************
// Initializer stores initial values for extension, if
// something is missed re-create and start extension.
// *****************************************************

class Initializer {
    constructor() {
        window.event = new UpdateEvent();
    }

    static generateId() {
        let rv = '';
        for (let i = 4; i > 0; i--) {
            rv += Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return rv;
    };

    static createIfMissed(key, newValue) {
        let value = storage.read(key);

        if (!value) {
            value = newValue;
            storage.write(key, value);
        }
    };

    createInstallConstants() {
        Initializer.createIfMissed("ubid", Initializer.generateId() + Initializer.generateId());
        Initializer.createIfMissed("installTime", String(Date.now()));
        Initializer.createIfMissed("installVersion", chrome.runtime.getManifest().version);
    }
}

// ************************************************************
// Startup listener. Starts extension on regular browser start.
// ************************************************************
(new Initializer()).createInstallConstants();

// ***************************************************************************************************
// Send anonymous install and retention statistics on install
// and update using provided Chrome event: https://developer.chrome.com/apps/runtime#event-onInstalled
// ***************************************************************************************************
chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === 'install') {
        xmlHttpRequests.sendGet(`${settings.url}/events`, 'install', function () {});
    } else if (details.reason === 'update') {
        xmlHttpRequests.sendGet(`${settings.url}/events`, 'update', function () {
            window.event.update(settings.url);
        });
    }
});