// LICENSE_CODE ZON
'use strict'; 
(function(){
var chrome = window.chrome;
var E = {install_details: {}};

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
        E.install_details.reason = details.reason; });
}

function _init_ga(be_bg_main, ga){
    function done(){
        var cid;
        if (!(cid = be_bg_main.get('uuid')))
            return;
        ga.init('UA-41964537-12', false, {sample_rate: '10', cid: cid,
            use_xhr: true});
    }
    if (be_bg_main.get('uuid'))
        done();
    else
        be_bg_main.listenTo(be_bg_main, 'change:uuid', done);
}

function _init(conf, zon_config){
    var now = Date.now();
    window.hola.t = {l_start: now};
    try { localStorage.setItem('up_ts', now); } catch(e){}
    window.hola.no_be_ver = true;
    window.conf = conf;
    window.zon_config = zon_config;
    window.be_bg = E;
    try {
        localStorage.removeItem('tmp_not_plugin');
        localStorage.removeItem('set_tmp_not_plugin');
    } catch(e){}
    require(['config', 'be_ver'], function(be_config, be_ver){
        be_config.init(be_ver.ver, '');
        require(['/bext/vpn/pub/bg_main.js', '/bext/pub/ga.js'],
            function(be_bg_main, ga, be_util){
                window.be_bg_main = be_bg_main; 
                be_bg_main.init();
                if (be_bg_main.get('agree_ts'))
                    _init_ga(be_bg_main, ga);
            }
        );
    });
}

function init(){
    install_listener_add();
    require.config({waitSeconds: 0, enforceDefine: true});
    require.onError = window.hola.base.require_on_error;
    require(['conf', 'zon_config'], _init);
}

init();

})();
