// LICENSE_CODE ZON
'use strict'; 
(function(){
var chrome = window.chrome;
var assign = Object.assign;
var install_details;

function install_listener_add(){
    if (!chrome)
        return;
    if (!chrome.runtime)
    {
        window.hola.base.perr({id: 'be_no_runtime',
            info: location.href+' '+Object.keys(chrome)});
        return;
    }
    if (!chrome.runtime.onInstalled)
    {
        window.hola.base.perr({id: 'be_no_on_installed',
            info: location.href+' '+Object.keys(chrome)});
        return;
    }
    chrome.runtime.onInstalled.addListener(function(details){
        install_details = {reason: details.reason}; });
}

function _init_ga(be_bg_main, ga){
    function done(){
        var cid = be_bg_main.get('uuid');
        if (!chrome)
        {
            if (!cid)
                return;
            ga.init('UA-36775596-1', false, {sample_rate: '10', cid: cid,
                use_xhr: true});
            return;
        }
        chrome.cookies.getAll({domain: '.hola.org'}, function(cookies){
            var _ga;
            if (_ga = cookies.find(function(c){ return c.name=='_ga'; }))
                cid = _ga.value.match(/(\d+\.\d+)$/)[0];
            if (!cid)
                return;
            var gclid = cookies.find(function(c){ return c.name=='gclid'; });
            var opt = assign({cid: cid, use_xhr: true, gclid: gclid}, gclid &&
                {cm: 'cpc', cs: 'google'}, !gclid && {sample_rate: '10'});
            ga.init('UA-36775596-1', false, opt);
            be_bg_main.set('ga_inited', true);
        });
    }
    if (be_bg_main.get('uuid'))
        done();
    else
        be_bg_main.listenTo(be_bg_main, 'change:uuid', done);
}

function init(){
    var now = Date.now();
    window.hola.t = {l_start: now};
    try { localStorage.setItem('up_ts', now); } catch(e){}
    install_listener_add();
    require.config({waitSeconds: 0, enforceDefine: true});
    require.onError = window.hola.base.require_on_error;
    require(['config'], function(be_config){
        require(['/bext/vpn/pub/bg_main.js', '/bext/pub/ga.js'],
            function(be_bg_main, ga){
                window.be_bg_main = be_bg_main; 
                be_bg_main.init({install_details: install_details});
                if (be_bg_main.get('agree_ts'))
                    _init_ga(be_bg_main, ga);
            }
        );
    });
}

init();

})();
