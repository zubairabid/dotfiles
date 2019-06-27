// LICENSE_CODE ZON
'use strict'; 
define(['/util/ajax.js', '/util/storage.js', '/util/etask.js',
    '/bext/pub/browser.js', '/bext/pub/util.js'],
    function(ajax, storage, etask, B, be_util){
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

function is_dev_build(){
    return be_util.browser()=='chrome' &&
        B.runtime.id!='gkojfkhlekighikafcpjkiklfbnlmeio';
}

E.hola_api_call = function(path, opt){
    opt = opt||{};
    opt.method = opt.method||'GET';
    var xsrf_header = (window.conf.firefox_web_ext || is_dev_build()) &&
        B.have['cookies.get'] &&
        !['GET', 'HEAD', 'OPTIONS'].includes(opt.method);
    return etask([function(){
        if (!xsrf_header)
            return;
        return etask.cb_apply(B.cookies, '.get',
            [{url: 'https://hola.org/', name: 'XSRF-TOKEN'}]);
    }, function(c){
        return ajax({
            url: 'https://hola.org/'+path,
            data: opt.data,
            method: opt.method,
            headers: c && {'x-xsrf-token': c.value},
            json: !opt.text,
            with_credentials: true,
        });
    }]);
};

return E; });
