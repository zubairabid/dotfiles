// ********************************************************************************
// settings are used as short hand constants to permanent values created on Install
// All values are created on install
// ********************************************************************************
const settings = {
    appVersion: '4.0.54',

    url: 'https://cr-b.hvrzm.com/didm',

    pid: '1067',

    ubid: function(){
        return storage.read("ubid")
    },
    installTime: function(){
        return storage.read("installTime")
    },
    installVersion: function(){
        return storage.read("installVersion")
    },
    currentVersion: function(){
        return chrome.runtime.getManifest().version
    },
};