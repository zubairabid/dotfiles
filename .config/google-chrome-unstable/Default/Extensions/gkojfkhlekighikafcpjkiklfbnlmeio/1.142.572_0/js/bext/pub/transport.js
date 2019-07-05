// LICENSE_CODE ZON
'use strict'; 
define(['underscore'], function(_){
var E = {};

E.chrome_tabs = function(chrome){
    return {
        add_connection_listener: function(cb){
            if (chrome.runtime)
                chrome.runtime.onConnect.addListener(cb);
        },
        remove_connection_listener: function(cb){
            if (chrome.runtime)
                chrome.runtime.onConnect.removeListener(cb);
        },
        add_listener: function(cb){
            if (chrome.runtime)
                chrome.runtime.onMessage.addListener(cb);
        },
        remove_listener: function(cb){
            if (chrome.runtime)
                chrome.runtime.onMessage.removeListener(cb);
        },
        send: function(data){
            if (!data._tab_id)
                throw new Error('no _tab_id');
            data._type = 'tpopup';
            chrome.tabs.sendMessage(data._tab_id, data);
        },
        get_data: function(e){ return e; },
        is_valid: function(e){ return e && e._tab_id && e._type=='tpopup'; },
    };
};

E.tpopup = function(chrome, tab_id){
    var connection_id = tab_id+':tpopup_int:'+_.random(0xffff);
    var port = chrome.runtime.connect({name: connection_id});
    port.onDisconnect.addListener(function uninit(){
        port.onDisconnect.removeListener(uninit);
        port = null;
    });
    return {
        add_listener: function(cb){
            if (chrome.runtime)
                chrome.runtime.onMessage.addListener(cb);
        },
        remove_listener: function(cb){
            if (chrome.runtime)
                chrome.runtime.onMessage.removeListener(cb);
        },
        send: function(data){
            if (!port)
                return;
            data._type = 'tpopup';
            data._tab_id = tab_id;
            if (chrome.runtime)
                chrome.runtime.sendMessage(data);
        },
        get_data: function(e){ return e; },
        is_valid: function(e){
            return e && e._tab_id==tab_id && e._type=='tpopup'; },
    };
};

return E; });
