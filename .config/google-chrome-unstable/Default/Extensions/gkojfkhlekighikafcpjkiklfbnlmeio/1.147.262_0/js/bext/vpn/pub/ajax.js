// LICENSE_CODE ZON
'use strict'; 
define(['/util/ajax.js', '/util/storage.js', '/bext/pub/browser.js'],
    function(ajax, storage, B){
var E = wrapper(ajax);

function wrapper(o){
    var be_lib;
    require([window.hola && B.is_popup() ? '/bext/pub/popup_lib.js' :
        '/bext/pub/lib.js'], function(lib){ be_lib = lib; });
    var check_url = function(url){
        if (!be_lib || !url || !url.startsWith('http:'))
            return;
        be_lib.perr_err({id: 'ajax_http_url', rate_limit: {count: 5},
            info: {url: url}});
    };
    var res = function(opt){
        check_url(opt.url);
        return ajax(opt);
    };
    for (var f in o)
    {
        res[f] = (function(name){
            return function(opt){
                check_url(opt.url);
                return ajax[name](opt);
            };
        })(f);
    }
    return res;
}

ajax.events.on('timeout', function(){
    storage.set('ajax_timeout', storage.get_int('ajax_timeout')+1);
});

return E; });
