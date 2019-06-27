chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create('window.html', {
        'bounds': {
            'width': 1280,
            'height': 768
        }
    });
});

chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === "update") {
        var manifest = chrome.runtime.getManifest();
        if (manifest && details.previousVersion !== manifest.version) {
            console.log("Extension has been updated", details, manifest);
            window.open("changelog.html");
        }
    }
});
