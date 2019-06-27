// depends on underscore

function toggle() {
    if (stringToBoolean(localStorage.isOn)) {
        chrome.browserAction.setIcon({path: 'icons/icon_grey19.png'});
        localStorage.isOn = false;
    } else {
        chrome.browserAction.setIcon({path: 'icons/icon19.png'});
        localStorage.isOn = true;
    }
}

function isUndefined(val) {
    return val === undefined;
}

function stringToBoolean(str) {
    // converts strings 'true' or 'false' into boolean
    if (str === 'true') {
        return true;
    } else if (str === 'false') {
        return false;
    } else {
        throw 'unexpected string received: ' + str;
    }
}

// read the previous value for dictionary of numbers
localStorage.isOn = isUndefined(localStorage.isOn) ? true : localStorage.isOn;

// set the icon to reflect the correct state
if (stringToBoolean(localStorage.isOn)) {
    chrome.browserAction.setIcon({path: 'icons/icon19.png'});
} else {
    chrome.browserAction.setIcon({path: 'icons/icon_grey19.png'});
}

// helper function to get url
var getUrl = function(url, successCallback) {
    var req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status == 200) {
            successCallback(req.responseText);
        }
    };
    req.send(null);
};

var db = {
    init: function() {
        this.dbName = 'DictionaryOfNumbers';
        this.dbVersion = 26;
        this.objStoreName = 'quantity';
        this.primaryQueryIndexName = 'si_numeral';
        this.secondaryQueryIndexName = 'si_unit';
        this.open();
    },
    open: function() {
        // open a connection to the db and store the db in this object
        if (typeof indexedDB == 'undefined') {
            // redefine these objects globally if unprefixed not there
            indexedDB = webkitIndexedDB;
            IDBKeyRange = webkitIDBKeyRange;
        }
        var request = indexedDB.open(this.dbName, this.dbVersion);
        request.onsuccess = _.bind(function(evt) {
            this.db = request.result;
            // if the db was just upgraded there is no data so go get the data.
            // Note: this is an adhoc flag that I added. not part of the spec
            if (request.justUpgraded) {
                this.loadQuantities(this.db);
            }
        }, this);
        request.onerror = _.bind(function(evt) {
            throw evt.currentTarget.error.name;
        }, this);
        request.onupgradeneeded = _.bind(function(evt) {
            // structure db with id as key, SI numeral as index lookup
            var db = evt.target.result;

            // delete the old object store and ignore errors if it complains
            // about there not being an ObjStore with that name
            try {
                db.deleteObjectStore(this.objStoreName);
            } catch (err) {
                if (err.code !== DOMException.NOT_FOUND_ERR) {
                    throw err;
                }
            }
            // create a new quantity object store and index
            var objectStore = db.createObjectStore(this.objStoreName, { keyPath: 'id' });
            objectStore.createIndex(this.primaryQueryIndexName, "si_numeral", { unique: false });

            // mark the request as just having performed an upgrade so that the
            // onsuccess function knows to get the new data
            request.justUpgraded = true;
        }, this);
        return request;
    },
    loadQuantities: function(db) {
        // add quantities to the db
        this.getQuantities(_.bind(function(jsonData) {
            var quantities = JSON.parse(jsonData);
            var transaction = db.transaction(this.objStoreName, 'readwrite');
            var objectStore = transaction.objectStore(this.objStoreName);
            _.each(quantities, function(quantity) {
                objectStore.add(quantity);
            });
        }, this));
    },
    getQuantities: function(successCallback) {
        // gets the db as json
        var url = chrome.extension.getURL('DictionaryOfNumbers.db.json');
        getUrl(url, successCallback);
    },
    close: function() {
        this.db.close();
    },
    getTolerance: function(siNumeral, siUnit) {
        if (siUnit === 'K' && (siNumeral >= 233 && siNumeral <= 373)) {
            // if temperature is in human range, be more exacting
            return 0.99;
        } else if (siUnit === '$' && (siNumeral < 100)) {
            // don't show money under $100
            return null;
        } else {
            return 0.9;
        }
    },
    queryQuantity: function(siNumeral, siUnit, successCallback, errorCallback) {
        // get range of values to query on
        var tolerance = this.getTolerance(siNumeral, siUnit);
        if (!tolerance) {
            successCallback([]);
        }
        var lowerBound = siNumeral > 0 ? siNumeral * tolerance : siNumeral / tolerance;
        var upperBound = siNumeral > 0 ? siNumeral / tolerance : siNumeral * tolerance;
        var boundKeyRange = IDBKeyRange.bound(lowerBound, upperBound);

        // boilerplate for setting up query
        var objectStore = this.db.transaction(this.objStoreName, 'readonly').objectStore(this.objStoreName),
            index = objectStore.index(this.primaryQueryIndexName);

        // Make the query
        var indexRequest = index.openCursor(boundKeyRange);
        var quantities = [];
        indexRequest.onsuccess = _.bind(function(evt) {
            // This query was only on the numeral so here we need to filter out
            // all the quantities with the wrong units.
            var cursor = evt.target.result;
            if (cursor) {
                if (cursor.value[this.secondaryQueryIndexName] == siUnit) {
                    quantities.push(cursor.value);
                }
                cursor.continue();
            } else if (successCallback) {
                successCallback(quantities);
            }
        }, this);
        indexRequest.onerror = function(evt) {
            if (errorCallback) {
                errorCallback(evt);
            }
        };
    }
};
db.init();

// listen for incoming queries about extension state or Quantity
chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.type === 'state') {
            sendResponse({
                'isOn': stringToBoolean(localStorage.isOn)
            });
        } else if (request.type === 'change_state') {
            toggle();
            sendResponse({
                'isOn': stringToBoolean(localStorage.isOn)
            });
        } else if (request.type === 'quantity') {
            db.queryQuantity(request.si_numeral, request.si_unit, function(quantities) {
                sendResponse({'quantities': quantities});
            }, function(evt) { console.log(evt); });
        }
        // have to return true to be able to send response in async callback
        return true;
    }
);
