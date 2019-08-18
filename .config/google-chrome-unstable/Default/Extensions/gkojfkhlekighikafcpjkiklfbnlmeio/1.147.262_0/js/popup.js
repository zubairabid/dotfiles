// LICENSE_CODE ZON
'use strict'; 
define([], function(){
var E = {}, chrome = window.chrome;

function _init_ga(be_popup_main, ga){
    var be_bg_main = be_popup_main.be_bg_main;
    var done = _init_ga.bind(this, be_popup_main, ga);
    if (!be_bg_main)
        return void setTimeout(done, 500);
    if (!be_bg_main.get('uuid'))
        return void be_bg_main.listenToOnce(be_bg_main, 'change:uuid', done);
    ga.init(window.is_tpopup ? 'UA-41964537-14' : 'UA-41964537-13',
        false, {sample_rate: '10', cid: be_bg_main.get('uuid'),
        use_xhr: true});
}

function init_popup_main(){
    require(['/bext/vpn/pub/popup_main.js', '/bext/pub/ga.js'],
        function(be_popup_main, ga)
    {
        window.be_popup_main = be_popup_main;
        be_popup_main.init();
        var be_bg_main = be_popup_main.be_bg_main;
        if (be_bg_main && be_bg_main.get('agree_ts'))
            _init_ga(be_popup_main, ga);
    });
}

function _init(conf, zon_config, opt){
    opt = opt||{};
    window.hola.t = {l_start: Date.now()};
    window.hola.tpopup_opt = opt;
    window.is_popup = true; 
    if (opt.type)
        document.body.classList.add(opt.type);
    require(['config'], function(be_config){ init_popup_main(); });
}
E.init = _init;

function conf_by_msg(){
    var qs = location.search.substring(1);
    var params = {};
    qs.split('&').forEach(function(arg){
        var pair = arg.split('=');
        params[pair[0]] = decodeURIComponent(pair[1]);
    });
    var tab_id = +params.tab_id, connection_id = params.connection_id;
    chrome.runtime.onMessage.addListener(function cb(msg){
        if (!msg || msg.id!='cs_tpopup.init' ||
            msg._connection_id!=connection_id)
        {
            return;
        }
        chrome.runtime.onMessage.removeListener(cb);
        _init(msg.conf, msg.zon_config, msg);
    });
    var msg = {id: 'tpopup.init', _type: 'tpopup',
        _tab_id: tab_id, _connection_id: connection_id};
    chrome.runtime.sendMessage({type: 'be_msg_req', _type: 'tpopup',
        _tab_id: tab_id, context: {rmt: true},
        msg: {msg: 'call_api', obj: 'tpopup', func: 'send_tpopup_msg',
        args: [tab_id, msg]}});
}

function init(){
    if (location.pathname=='/js/tpopup_local.html')
        window.is_tpopup = true;
    if (!window.is_tpopup)
        window.hola.base.perr({id: 'be_popup_create'});
    require.config({waitSeconds: 0, enforceDefine: true});
    require.onError = window.hola.base.require_on_error;
    if (window.is_tpopup)
        return void conf_by_msg();
    require(['conf', 'zon_config'], _init);
}
init();
return E; });
