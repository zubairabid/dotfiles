// LICENSE_CODE ZON
'use strict'; 
define(['/bext/pub/browser.js', '/bext/pub/backbone.js', '/util/etask.js',
    '/bext/pub/lib.js', '/bext/pub/ext.js', '/protocol/pub/pac_engine.js',
    '/bext/pub/util.js', 'underscore', '/bext/vpn/pub/svc.js', '/util/zerr.js',
    '/util/date.js', '/util/escape.js', '/util/util.js', '/util/user_agent.js',
    '/bext/vpn/pub/hybrid_mock.js', '/util/storage.js'],
    function(B, be_backbone, etask, be_lib, be_ext, pac_engine,
    be_util, _, be_svc, zerr, date, zescape, zutil, user_agent, hybrid_mock,
    storage){
var conf = window.conf, ff_webext = conf.firefox_web_ext2;
var pac_file_set, pac_file_last, chrome, is_etask_perf_on;
var is_report_once = false;
var cb_wrapper = zerr.catch_unhandled_exception;
var E = new (be_backbone.task_model.extend({
    _defaults: function(){
        this.stats = {total: 0, slow: {}};
        this.on('destroy', function(){ E.uninit(); });
    },
}))();

function update_config(){
    var prev = is_report_once;
    is_report_once = !!be_ext.get('gen.is_report_slow_once');
    if (prev!=is_report_once)
        monitor_init(date.ms.HOUR);
    is_etask_perf_on = be_ext.get('gen.is_etask_perf_on');
    if (is_etask_perf_on && !etask.perf())
        etask.perf(true);
    if (!is_etask_perf_on && etask.perf())
        etask.perf(false);
}

E.init = function(){
    chrome = window.chrome;
    E.listen_to(be_ext, 'change:bext_config', update_config);
    monitor_init();
    update_config();
};

function monitor_init(period){
    var first_reported, prev_slow, start = Date.now();
    if (E.timer)
        clearTimeout(E.timer);
    var reset = function(cb, keep_stats){
        if (!keep_stats)
        {
            if (is_etask_perf_on)
                etask.perf_stat = {};
            E.stats = {total: 0, slow: {}};
        }
        first_reported = true;
        start = Date.now();
        if (cb)
            E.timer = setTimeout(cb, date.ms.HOUR);
    };
    E.timer = setTimeout(function slow(){
        var ts = storage.get_int('install_ts') || storage.get_int('update_ts');
        if (!is_report_once && !first_reported && ts!=window.hola.t.l_start)
            return reset(slow, true);
        var send;
        for (var src in E.stats.slow)
        {
            if (E.stats.slow[src]['100'] || E.stats.slow[src]['1000'])
            {
                send = true;
                break;
            }
        }
        if (!prev_slow && send)
        {
            var info = Object.assign({period: Date.now()-start}, E.stats);
            if (is_etask_perf_on)
                info.etask_perf_stat = etask.perf_stat;
            be_lib.perr_err({id: 'be_tab_unblocker_slow',
                info: zerr.json(info)});
        }
        prev_slow = send;
        reset(!is_report_once && slow);
    }, period||5*date.ms.MIN);
}

E.uninit = function(){ E.timer = clearTimeout(E.timer); };

function get_pac_scope(){
    if (chrome && chrome.extension && chrome.extension.inIncognitoContext)
        return 'incognito_session_only';
    return 'regular_only';
}

E.set_pac = function(script){
    pac_file_set = !!script;
    if (script && !ff_webext)
        pac_file_last = script;
    var scope = get_pac_scope();
    return etask([function(){
        this.alarm(5000, {throw: 'proxy.settings timeout'});
        if (script)
        {
            return etask.cb_apply(B.proxy.settings, '.set',
                [{scope: scope,
                value: {mode: 'pac_script', pacScript: {data: script}}}]);
        }
        return etask.cb_apply(B.proxy.settings, '.clear', [{scope: scope}]);
    }, function(){
        be_ext.set('status.unblocker.effective_pac_url', script);
        E.has_pac = !!script;
    }]);
};

function check_need_ext_settings(){
    return E.rules && _.keys(E.rules.unblocker_rules).length &&
        be_ext.get('r.vpn.on');
}

E.load_pac_file = function(last, force){
    var has_pac = E.has_pac;
    E.has_pac = false;
    if (!chrome)
        return;
    if (!check_need_ext_settings() && !force)
        return E.set_pac(null);
    if (!E.rules && !pac_file_set && pac_file_last)
        return E.set_pac(pac_file_last);
    if (has_pac)
        return E.has_pac = true;
    var arr = new Uint8Array(32), key = '';
    window.crypto.getRandomValues(arr);
    _.each(arr, function(a){ key += a.toString(16); });
    E.pac_key = key;
    var json = {unblocker_rules: {}};
    var options = {do_redir: false, ext: 1, key: E.pac_key};
    if (ff_webext)
        hybrid_mock.set_pac_opt(json, options);
    E.set_pac(pac_engine.gen_pac(json, options));
    E.has_pac = true;
};

E.load_pac_cb = cb_wrapper(function(){
    E.init_tab_listeners();
    E.load_pac_file();
});

function hex_encode(s){
    s = unescape(encodeURIComponent(s));
    var h = '';
    for (var i = 0; i < s.length; i++)
        h += s.charCodeAt(i).toString(16);
    return h;
}

E.set_proxy_for_url = function(url, proxy_str, src){
    if (!E.pac_key && !zutil.is_mocha())
        return;
    var b = be_util.browser_guess, n;
    if (b.browser=='chrome' && +b.version>=52)
    {
        n = url.match(/^((https|wss):\/\/[^\/]+\/)/);
        if (n)
            url = n[1];
    }
    if (b.browser=='firefox')
    {
        n = url.match(/^(https?:\/\/[^\/]+\/)/);
        if (n)
            url = ff_webext ? n[1].slice(0, -1) : n[1];
    }
    var t0, diff, xhr = new XMLHttpRequest();
    var prefix = hex_encode(JSON.stringify({
        proxy: proxy_str,
        set: url,
        key: E.pac_key||'1',
    }));
    xhr.open('POST', 'http://'+prefix+'.local.hola/', zutil.is_mocha());
    E.stats.total++;
    t0 = Date.now();
    try { xhr.send(null); } catch(e){}
    if ((diff = Date.now()-t0) > 10)
    {
        src = src||'idle';
        var s;
        if (!(s = E.stats.slow[src]))
            s = E.stats.slow[src] = {10: 0, 100: 0, 1000: 0, max: 0};
        s[diff>1000 ? '1000' : diff>100 ? '100' : '10']++;
        s.max = Math.max(diff, s.max);
        if (diff>100)
            zerr('tab_unblocker slow %dms stats %s', diff, zerr.json(E.stats));
    }
};

return E; });
