// LICENSE_CODE ZON
'use strict'; 
(function(){
window.require_is_remote = true;
define(['jquery', 'underscore', '/bext/pub/backbone.js', '/util/etask.js',
    'config', '/bext/pub/ext.js', '/bext/pub/util.js',
    '/bext/vpn/pub/tabs.js', '/bext/pub/browser.js', '/util/zerr.js',
    '/bext/pub/version_util.js', '/bext/vpn/pub/rule.js',
    '/bext/vpn/pub/icon.js', '/bext/vpn/pub/vpn.js', '/bext/vpn/pub/info.js',
    '/bext/vpn/pub/ajax.js', '/bext/pub/lib.js', '/bext/vpn/pub/slave.js',
    '/bext/vpn/pub/ccgi.js', '/util/date.js', '/bext/vpn/pub/premium.js',
    '/util/storage.js', '/util/url.js', '/util/util.js', 'be_ver',
    '/bext/vpn/pub/mode.js', '/bext/vpn/pub/plugin.js',
    '/bext/vpn/pub/hybrid_mock.js', '/bext/vpn/pub/dev_mode.js',
    '/bext/vpn/pub/rmt_operations.js', '/bext/vpn/pub/trial.js',
    '/bext/vpn/pub/tpopup.js'],
    function($, _, be_backbone, etask, be_config, be_ext, be_util,
    be_tabs, B, zerr, be_version_util, be_rule, be_icon, be_vpn, be_info, ajax,
    be_lib, be_slave, be_ccgi, date, be_premium, storage,
    zurl, zutil, ver, be_mode, be_plugin, hybrid_mock, be_dev_mode,
    be_rmt_operations, be_trial, be_tpopup){
B.assert_bg('be_rmt_ext');
zerr.set_exception_handler('be', be_lib.err);
var chrome = window.chrome, conf = window.conf;
var is_local_ccgi = window.is_local_ccgi;
var E = new (be_backbone.model.extend({
    ver: ver.ver, 
    _defaults: function(){
        this.set('ver', ver.ver);
        this.on('destroy', destroy_cb);
    },
}))();

E.zerr = zerr;
E.be_config = be_config;
E.be_tabs = be_tabs;
E.tabs = be_tabs; 
E.be_browser = B;
E.be_ext = be_ext;
E.be_util = be_util;
E.be_vpn = be_vpn;
E.be_info = be_info;
E.be_rule = be_rule;
E.be_icon = be_icon;
E.be_lib = be_lib;
E.be_slave = be_slave;
E.be_ccgi = be_ccgi;
E.be_premium = be_premium;
E.be_mode = be_mode;
E.be_plugin = be_plugin;
E.be_dev_mode = be_dev_mode;
E.be_trial = be_trial;
E.be_tpopup = be_tpopup;

E.ok = function(id, info){ return be_lib.ok(id, info); };
E.err = function(id, info, err){ return be_lib.err(id, info, err); };

function storage_err_cb(){
    if (!be_util.get('storage.err'))
        return;
    E.stopListening(be_util, 'change:storage.err', storage_err_cb);
    var last = be_util.get('storage.last_error');
    be_lib.perr_err({id: 'be_storage_err',
        info: last&&(last.api+' '+last.key), err: last&&last.err});
}

E.check_ver = function(){
    if (is_local_ccgi)
        return;
    clearTimeout(E.check_ver.timer);
    E.check_ver.timer = setTimeout(E.check_ver, 12*date.ms.HOUR);
    var ver;
    return etask('check_ver', [function(){
        return ajax.json({url: conf.url_ccgi+'/ver.json',
            qs: be_ext.auth()});
    }, function(info){
        ver = info.ver;
        if (ver==E.ver)
            return this.return();
        zerr.notice('server version changed, loading new version %s > %s',
            E.ver, ver);
        return E.load_new_ver(ver);
    }, function(){ return {load_ver: ver}; }]);
};

E.check_ext_ver = function(){
    var bg_main = window.be_bg_main;
    if (bg_main && bg_main.check_ext_ver_done)
        return;
    if (bg_main)
        bg_main.check_ext_ver_done = true;
    be_util.upgrade_ext();
};

E.schedule_check_ext_ver = function(){
    clearTimeout(E.schedule_check_ext_ver.timer);
    E.schedule_check_ext_ver.timer = setTimeout(function cb(){
        E.schedule_check_ext_ver.timer = setTimeout(cb, 24*date.ms.HOUR);
        be_util.upgrade_ext();
    }, 24*date.ms.HOUR);
};

function svc_version_cb(){
    var svc_ver = be_mode.get('svc.version');
    var min_ver = be_ext.get('upgrade_min_ver');
    if (!svc_ver||!min_ver)
        return;
    var already_need = storage.get_int('need_svc_upgrade');
    if (be_version_util.cmp(svc_ver, min_ver)>=0)
    {
        be_ext.unset('need_svc_upgrade');
        if (already_need)
        {
            storage.clr('need_svc_upgrade');
            be_lib.perr_ok({id: 'be_svc_upgraded'});
        }
        return;
    }
    be_ext.set('need_svc_upgrade', true);
    if (!already_need)
    {
        storage.set('need_svc_upgrade', 1);
        be_lib.perr_err({id: 'be_need_svc_upgrade'});
    }
}

function handle_invalid_init_state(msg){
    var count = storage.get_int('invalid_init_state_reload');
    var limit = count>=3;
    console.error('invalid init state '+msg+', '+
        (limit ? 'limit reached' : 'reloading extension'));
    if (limit)
    {
        be_lib.perr_err({id: 'be_invalid_init_state_limit',
            info: {msg: msg, count: count}});
    }
    else
    {
        be_lib.perr_err({id: 'be_invalid_init_state',
            info: {msg: msg, count: count}});
        be_lib.reload_ext();
    }
    storage.set('invalid_init_state_reload', count+1);
}

function check_invalid_init_state(){
    if (!chrome || !chrome.webRequest ||
        !chrome.webRequest.onBeforeRequest.hasListeners)
    {
        return;
    }
    if (chrome.webRequest.onBeforeRequest.hasListeners()
        && chrome.webRequest.onBeforeSendHeaders.hasListeners()
        && chrome.webRequest.onHeadersReceived.hasListeners()
        && chrome.webRequest.onCompleted.hasListeners()
        && chrome.webRequest.onErrorOccurred.hasListeners())
    {
        return handle_invalid_init_state('webRequest has listeners');
    }
}

E.init = function(){
    if (E.inited) 
        return zerr.notice('rmt already initied');
    hybrid_mock.init();
    if (be_util.no_proxy())
        return;
    check_invalid_init_state();
    E.inited = true;
    E.sp = etask('be_rmt_ext', [function(){ return this.wait(); }]);
    E.be_util.rmt = E;
    E.check_ver.timer = setTimeout(E.check_ver, 12*date.ms.HOUR);
    B.init();
    E.check_ext_ver();
    E.schedule_check_ext_ver();
    E.tabs.init();
    B.backbone.server.start(E, 'RMT');
    if (window.hola)
        window.hola.t.r_start = Date.now();
    E.set('conf', conf);
    zerr.notice('rmt.init '+E.ver);
    be_ext.init();
    E.be_icon.init();
    E.listen_to(be_tabs, 'change:active.url', function(){
        var prog_sites = {'github.com': true, 'bitbucket.org': true,
            'codeplex.com': true};
        var host = zurl.get_host(be_tabs.get('active.url')||'')
        .replace(/^www\./, '');
        if (prog_sites[host])
            storage.set_json('user_programmer', {timestamp: Date.now()});
    });
    be_ext.set('rmt_ver', E.ver);
    E.listen_to(be_util, 'change:storage.err', storage_err_cb);
    E.listen_to(be_ext, 'change:upgrade_min_ver', svc_version_cb);
    E.listenTo(be_mode, 'change:svc.version', svc_version_cb);
    be_slave.init(window.be_bg_main);
    be_plugin.main_init(window.be_bg_main);
    be_ccgi.init(be_ext);
    E.be_premium.init(be_rule);
    E.be_trial.init(be_rule);
    be_dev_mode.init();
    be_rmt_operations.init();
    E.listen_to(be_ext,
        'change:ext.slave change:uuid change:auth.stamp', E.init_cb);
};

E.init_cb = function(){
    var req;
    return etask([function(){
        zerr.notice('rmt.init_cb called %s', E.get('status'));
        if (E.get('status')=='busy' || E.get('status')=='ready')
            return this.return();
        if (be_ext.get('ext.slave') || !be_ext.get('uuid'))
            return this.return(void zerr.notice('rmt.init_cb waiting'));
        E.set('status', 'busy');
        req = {retry: 1, method: 'POST', data: {login: 1,
            flags: be_lib.get_flags(), ver: be_util.version()},
            qs: be_ext.qs_ajax({uuid: be_ext.get('uuid'),
            have_plugin: B.have['be.plugin']}),
            url: conf.url_ccgi+'/background_init', with_credentials: true};
        return ajax.json(req);
    }, function(info){
        if (!info)
            throw new Error('background_init failed, no info returned');
        E.ccgi_info = info;
        be_ext._set('session_key', info.key);
        if (!is_local_ccgi)
        {
            if (E.ver && E.ver!=info.ver)
            {
                setTimeout(function(){ be_lib.reload_ext(); }, 500);
                throw new Error('rmt ver mismatch '+E.ver+'/'+info.ver);
            }
        }
        var min_ver = info.upgrade_min_version;
        be_ext.set('upgrade_min_ver', min_ver);
        be_ext.set('enable_unsupported', info.enable_unsupported);
        if (min_ver && be_version_util.cmp(be_util.version(), min_ver)<0)
        {
            be_ext.set('need_upgrade', true);
            storage.set('need_upgrade', 1);
            be_lib.perr_err({id: 'be_need_upgrade'});
            be_util.upgrade_ext();
            E.set('inited', true);
            return;
        }
        else
        {
            be_ext.unset('need_upgrade');
            if (storage.get_int('need_upgrade'))
            {
                storage.clr('need_upgrade');
                be_lib.perr_ok({id: 'be_upgraded'});
            }
        }
        be_ext._set('popup.disable_no_popup', true);
        be_vpn.init(E);
        E.stopListening(be_ext,
            'change:ext.slave change:uuid change:auth.stamp', E.init_cb);
        E.set('inited', true);
        E.set('status', 'ready');
        zerr.notice('rmt.init_cb ready');
        storage.set('invalid_init_state_reload', 0);
        if (window.hola) 
        {
            var err = window.hola.err;
            var t = window.hola.t;
            t.r_init = Date.now();
            var start = t.new_ver||t.l_start;
            var s = (t.r_init-start)+'ms r '+(t.r_start-start)
                +'ms'+(t.plugin ? ' '+t.plugin+'ms' : '')+
                (t.new_ver ? ' new_ver' : '')+
                (err&&err.require ? ' require '+err.require : '');
            var diff = t.r_init-start;
            if (diff > 20000)
                be_lib.perr(zerr.L.ERR, {id: 'rmt_init_slow', info: s});
            else
                zerr[diff>2000 ? 'err' : 'notice']('rmt_init %s', s);
        }
        var enable = conf.plugin_enabled || info.enable_plugin;
        if (!B.have['be.plugin'] || enable===undefined)
            return;
        setTimeout(function(){
            zerr.notice((enable ? 'enabling' : 'disabling')+' plugin');
            storage.set('plugin.enabled', enable|0);
            be_mode.set({'plugin.enabled': !!enable});
            be_ext._set({'plugin.enabled': !!enable,
                'plugin.new_ver': info.plugin_version});
        });
    }, function(){
        var va_conf = E.ccgi_info&&E.ccgi_info.va_conf;
        if (va_conf &&
            (storage.get_int('va') || (!window.chrome&&va_conf.enabled)))
        {
            zerr.warn('va: loading');
            be_lib.perr_ok({id: 'va_loading'});
            require(['/bext/va/pub/va.js'], function(va){
                zerr.warn('va: loaded');
                be_lib.perr_ok({id: 'va_loaded'});
                if (!E.inited) 
                    return zerr.warn('va: loaded but not inited');
                va.init({va_conf: va_conf});
            });
        }
    }, function catch$(err){
        be_lib.err('be_rmt_init_err', {req: req}, err);
        E.set('status', 'error');
    }]);
};

function destroy_cb(){
    try {
        if (!E.inited)
            return zerr.notice('be_rmt not initied');
        E.inited = false;
        E.check_ver.timer = clearTimeout(E.check_ver.timer);
        E.schedule_check_ext_ver.timer = clearTimeout(
            E.schedule_check_ext_ver.timer);
        B.backbone.server.stop('RMT');
        E.be_icon._destroy();
        E.be_vpn._destroy();
        E.tabs._destroy();
        E.be_ext._destroy();
        if (E.va)
            E.va._destroy();
        E.be_slave._destroy();
        E.be_ccgi._destroy();
        E.be_premium._destroy();
        E.be_trial._destroy();
        E.sp.return();
        B._destroy();
    } catch(err){
        be_lib.perr_err({id: 'rmt_uninit_err', err: err});
        console.error('E failed to uninit, try full reload '+err);
        be_lib.reload_ext();
    }
}

E.update_rules = function(refresh){ be_rule.trigger('fetch_rules', refresh); };

E.load_new_ver = function(ver, opt){
    if (is_local_ccgi)
        return;
    try {
        if (E.load_new_ver_start)
            return;
        E.load_new_ver_start = new Date();
        if (window.hola)
            window.hola.t.new_ver = Date.now();
        be_lib.ok('be_rmt_load_new_ver', ver);
        be_config.undef();
        if (ver)
        {
            var country = E.ccgi_info && E.ccgi_info.country;
            return do_load_new_ver(ver, country, opt);
        }
        require.config({baseUrl: conf.url_bext, waitSeconds: 30,
            urlArgs: 'ext_ver='+be_util.version()+'&rand='+Math.random()});
        require(['be_ver'], function(be_ver){
            do_load_new_ver(be_ver.ver, be_ver.country, opt); }, require_err);
    } catch(err){
        console.error('background failed to uninit, try full reload '+err);
        be_lib.reload_ext();
    }
};

function do_load_new_ver(ver, country, opt){
    require.config({baseUrl: conf.url_bext, waitSeconds: 30,
        urlArgs: 'ver='+ver});
    require(['config'], function(_be_config){
        if (window.hola && window.hola.no_be_ver)
            _be_config.init(ver, country);
        require(['/bext/vpn/pub/rmt_ext.js'], function(be_rmt){
            try {
                E._destroy();
                window.RMT = null;
            } catch(err){
                console.error('RMT.uninit failed, try full reload '+
                    zerr.e2s(err));
                be_lib.reload_ext();
            }
            window.RMT = be_rmt; 
            be_rmt.opt = opt;
            be_rmt.init();
        }, require_err);
    }, require_err);
}

function require_err(err){
    console.error('background failed to uninit, try full reload '+
        zerr.e2s(err));
    etask([function(){
        var mods = err.requireModules;
        return be_lib.err('load_new_ver_err',
            'require '+(mods && mods.join(' ')), err);
    }, function finally$(){
        be_lib.reload_ext();
    }]);
}

return E; }); }());
