// LICENSE_CODE ZON
'use strict'; 
define(['jquery', 'underscore', '/bext/pub/backbone.js', '/util/etask.js',
    '/bext/pub/util.js', '/util/zerr.js', '/bext/pub/browser.js',
    '/bext/pub/lib.js', '/util/escape.js', '/bext/pub/version_util.js',
    'config', 'bootstrap', '/util/storage.js', '/util/ajax.js',
    '/util/util.js', '/util/sprintf.js', '/util/date.js', '/util/array.js',
    'jquery_cookie'],
    function($, _, be_backbone, etask, be_util, zerr, B, be_lib, zescape,
    be_version_util, be_config, bootstrap, storage, ajax, zutil, sprintf,
    date, array){
B.assert_bg('be_bg_main');
zerr.set_exception_handler('be', be_lib.err);
var chrome = window.chrome, conf = window.conf, zon_config = window.zon_config;
var assign = Object.assign;
var browser = be_util.browser();
var last_use, dump_log_int;
var uninstall_cb_to;

var E = new (be_backbone.model.extend({
    _defaults: function(){
        this.on('install', on_install);
        this.on('update', on_update);
        this.on('up', on_up);
        this.on('destroy', function(){ E.uninit(); });
    },
}))();

E.be_util = be_util;
E.zerr = window.hola.zerr = zerr;
E.be_browser = B;
E.be_lib = be_lib;

function send_install_perr(){
    if (!E.get('agree_ts') || storage.get('install_perr_ts'))
        return;
    var info;
    if (chrome && zutil.get(chrome, 'runtime.getManifest'))
    {
        var manifest = chrome.runtime.getManifest();
        info = zutil.pick(manifest, 'permissions');
    }
    be_lib.ok('install', info);
    storage.set('install_perr_ts', Date.now());
}

function on_install(){
    E.set('ext.first_run', true);
    storage.set('install_ts', window.hola.t.l_start);
    storage.set('install_version', be_util.version());
    send_install_perr();
}
function on_update(prev){
    be_lib.ok('update', prev+' > '+be_util.version());
    storage.set('update_ts', window.hola.t.l_start);
}
function on_up(){
    be_lib.ok('up');
    if (chrome)
        return;
    etask([function(){ return be_lib.storage_local_get({be_disabled: false});
    }, function(ret){
        if (!ret.be_disabled)
            return;
        be_lib.ok(be_util.is_plugin() ? 'be_plugin_enable' : 'be_ext_enable');
        return be_lib.storage_local_remove('be_disabled');
    }, function catch$(err){ zerr('on_up err: '+err); }]);
}

function ccgi_resp(msg, sender){
    _.defer(B.be.ccgi.send, msg, sender);
    return true;
}

function ccgi_ipc_handler(msg, sender){
    switch (msg.id)
    {
    case 'ping':
        msg.data = {
            uuid: E.get('uuid'),
            session_key: E.get('session_key')||0,
            ver: be_util.version(),
            type: conf.type,
            cid: E.get('svc.cid'),
            browser: E.get('browser'),
            plugin: E.get('mode')=='dll',
            build_info: {browser_build: window.conf.browser.name}
        };
        break;
    case 'get_log':
        msg.data = E.get_log();
        break;
    default:
        return;
    }
    return ccgi_resp(msg, sender);
}

function ccgi_init(){
    B.be.ccgi.add_listener(ccgi_ipc_handler);
    if (!chrome)
        return;
    B.tabs.query({url: conf.hola_match}, function(tabs){
        _.each(tabs, function(tab){
            B.tabs.execute_script(tab.id, {file: '/js/bext/vpn/pub/cs_hola.js',
                runAt: 'document_start'});
        });
    });
}

function ccgi_uninit(){ B.be.ccgi.del_listener(ccgi_ipc_handler); }

function get_uuid(){
    return etask({name: 'get_uuid', cancel: true}, [function(){
        return etask.all({allow_fail: true}, {
            sync: chrome && B.have['storage.sync'] &&
                be_lib.storage_sync_get('uuid'),
            local: be_lib.storage_local_get('uuid'),
            localStorage:
                etask([function(){ return localStorage.getItem('uuid'); }]),
            cookie: etask([function(){ return $.cookie('uuid'); }]),
            ccgi: !chrome && etask.cb_apply(B.cookies, '.get',
                [{url: conf.url_ccgi, name: 'uuid'}]),
        });
    }, function(ret){
        get_uuid.last_error = collect_errors(ret);
        var uuid = ret.local && ret.local.uuid || ret.localStorage ||
            ret.cookie || ret.ccgi && ret.ccgi.value;
        return ensure_uniq_uuid(ret.sync && ret.sync.uuid, uuid);
    }, function catch$(err){
        be_lib.perr_err({id: 'unreachable', info: 'get_uuid', err: err});
    }]);
}

function ensure_uniq_uuid(syncd, uuid){
    if (!syncd) 
        return uuid;
    if (!uuid)
    {
        E.set('sync_uuid', syncd);
        return null;
    }
    if (syncd!=uuid) 
        return uuid;
    return etask({name: 'ensure_uniq_uuid', cancel: true}, [function(){
        return etask.all({allow_fail: true}, {
            sync: B.have['storage.sync'] && be_lib.storage_sync_get('uuid2'),
            local: be_lib.storage_local_get('uuid2'),
            localStorage:
                etask([function(){ return localStorage.getItem('uuid2'); }]),
            gen: E.gen_uuid(),
        });
    }, function(ret){
        var uuid2 = ret.local && ret.local.uuid2 || ret.localStorage ||
            ret.gen;
        var syncd2 = ret.sync && ret.sync.uuid2;
        if (syncd2==uuid2) 
            return uuid;
        persist_uuid2(uuid2);
        if (!syncd2) 
        {
            if (!B.have['storage.sync'])
                be_lib.storage_local_set({uuid2: uuid2});
            else
                be_lib.storage_sync_set({uuid2: uuid2});
            be_lib.perr_ok({id: 'own_sync_uuid'});
            return uuid;
        }
        be_lib.perr_ok({id: 'owned_sync_uuid'});
        E.set('sync_uuid', uuid);
        return null;
    }]);
}

function persist_uuid(uuid){
    return etask({name: 'persist_uuid'}, [function(){
        return etask.all({allow_fail: true}, {
            local: be_lib.storage_local_set({uuid: uuid}),
            localStorage:
                etask([function(){ localStorage.setItem('uuid', uuid); }]),
            cookie: etask([function(){
                $.cookie('uuid', uuid, {expires: 365, path: '/'}); }]),
        });
    }, function(ret){
        persist_uuid.last_error = collect_errors(ret);
        return _.isEmpty(ret);
    }, function catch$(err){
        be_lib.perr_err({id: 'unreachable', info: 'persist_uuid', err: err});
    }]);
}

function persist_uuid2(uuid2){
    return etask.all({allow_fail: true}, {
        local: be_lib.storage_local_set({uuid2: uuid2}),
        localStorage:
            etask([function(){ localStorage.setItem('uuid2', uuid2); }]),
    });
}

function collect_errors(ret){
    var arr = [];
    _.each(ret, function(v, k){
        if (!etask.is_err(v))
            return;
        delete ret[k];
        var e = {};
        e[k] = ''+v.error;
        arr.push(e);
    });
    return arr;
}

E.gen_uuid = function(){
    if (!window.crypto || !window.crypto.getRandomValues)
    {
        return etask.cb_apply(B.be, '.gen_uuid', []);
    }
    var buf = new Uint8Array(16), uuid = '';
    window.crypto.getRandomValues(buf);
    for (var i=0; i<buf.length; i++)
        uuid += (buf[i]<=0xf ? '0' : '')+buf[i].toString(16);
    return uuid;
};

function ensure_uuid(){
    var uuid;
    return etask({name: 'ensure_uuid', cancel: true}, [function(){
        return get_uuid();
    }, function(_uuid){
        if (_uuid)
        {
            E.sp.spawn(persist_uuid(_uuid));
            return this.return(_uuid);
        }
        E.set('new_uuid', true);
        return E.gen_uuid();
    }, function(_uuid){
        zerr.assert(_uuid, 'gen_uuid() returned: '+_uuid);
        return persist_uuid(uuid = _uuid);
    }, function(ret){
        if (!ret)
            return uuid;
        uuid = 't.'+uuid.substr(2);
        be_lib.perr_err({id: 'init_tmp_uuid'}); 
        return uuid;
    }]);
}

function handle_install(){
    return etask({name: 'handle_install', cancel: true}, [function(){
        return etask.cb_apply(B.runtime, '.get_install_details', []);
    }, function(details){
        var reason = details&&details.reason;
        zerr.notice('be_bg_main up reason: '+reason);
        if (E.get('new_uuid') && reason!='install')
            be_lib.perr_err({id: 'switch_uuid_err'}); 
        if (E.get('sync_uuid'))
        {
            be_lib.perr_err({id: 'switch_sync_uuid',
                info: {uuid: E.get('sync_uuid'), reason: reason}});
        }
        if (!{install: 1, update: 1}[reason])
            return;
        E.set('install_details', reason); 
        E.trigger(reason, storage.get('ver'));
        storage.set('ver', be_util.version());
    }, function catch$(err){
        be_lib.perr_err({id: 'handle_install_err', err: err});
    }]);
}

E.set_rule_use = function(rule, is_mitm){
    var name = rule.name||rule.host, now = Date.now();
    var d = now-E.uninstall_url_cb.ts;
    var update = !last_use || last_use && last_use.name!=name ||
        d>15*date.ms.MIN;
    last_use = {name: name, ts: now, is_mitm: is_mitm};
    if (update || d>date.ms.HOUR)
        E.uninstall_url_cb();
};

E.uninstall_url_cb = function(){
    var now = Date.now();
    E.uninstall_url_cb.ts = now;
    var qs = {perr: 1, uuid: E.get('uuid'), cid: E.get('svc.cid'),
        browser: E.get('browser'), version: be_util.version()};
    if (be_util.is_plugin())
        qs.plugin = 1;
    if (last_use && now-last_use.ts<15*date.ms.MIN)
    {
        qs.last = btoa(last_use.name);
        if (last_use.is_mitm)
            qs.mitm = 1;
    }
    var build = be_util.build_info();
    if (build.install_ms)
        qs.inst_ms = build.install_ms;
    var url = conf.url_ccgi+'/uninstall?'+zescape.qs(qs);
    url = url.substr(0, 255); 
    B.runtime.set_uninstall_url(url);
    uninstall_cb_to = setTimeout(E.uninstall_url_cb, 6*date.ms.HOUR);
};

E.get_agree_ts = function(){
    if (!conf.check_agree_ts)
        return 1;
    var ver_install = storage.get('install_version');
    if (ver_install && be_version_util.cmp(ver_install, '1.131.737') < 0)
        return 1;
    return storage.get('agree_ts');
};
E.set_agree_ts = function(val){
    E.set('agree_ts', val);
    storage.set('agree_ts', val);
};

E.init = function(){
    if (E.inited)
        return;
    if (['chrome', 'firefox', 'opera'].includes(browser))
        window.is_local_ccgi = true;
    E.set_perr(function(opt){ be_lib.perr_err(opt); });
    E.inited = true;
    E.set('agree_ts', E.get_agree_ts());
    E.sp = etask('be_bg_main', [function(){ return this.wait(); }]);
    $(window).on('unload', function(){ E._destroy(); });
    B.init();
    ccgi_init();
    B.backbone.server.start(E, 'be_bg_main');
    storage.clr('ajax_timeout');
    if (storage.get('ext_slave'))
    {
        E.set('ext.slave', true);
        storage.clr('ext_slave');
    }
    zerr.notice('be_bg_main_init');
    E.on('change:inited', inited_cb);
    E.on('change:agree_ts', send_install_perr);
    E.on_init('change:ext.slave', E.on_slave_change);
    E.set('browser', browser);
    if (B.have['runtime.set_uninstall_url'])
        E.on_init('change:uuid change:cid change:browser', E.uninstall_url_cb);
    start_monitor_worker();
    E.sp.spawn(etask([function(){ return ensure_uuid();
    }, function(uuid){
        zerr.notice('uuid: '+uuid);
        E.set('uuid', uuid);
        return handle_install();
    }, function(e){
        E.trigger('up');
        E.set('inited', true);
    }, function catch$(err){ be_lib.err('init_err', null, err);
    }, function finally$(){
        var get = get_uuid.last_error||[];
        var set = persist_uuid.last_error||[];
        if (!get.length && !set.length)
            return;
        be_lib.perr_err({id: 'uuid_storage_err',
            info: zerr.json({get: get, set: set})});
    }]));
};

E.uninit = function(){
    if (!E.inited)
        return;
    dump_log_int = void clearInterval(dump_log_int);
    E.sp.return();
    B.backbone.server.stop('be_bg_main');
    ccgi_uninit();
    B._destroy();
    if (uninstall_cb_to)
        uninstall_cb_to = clearTimeout(uninstall_cb_to);
    E.inited = false;
};

var icon = {
    blank: {19: 'bext/vpn/pub/img/icon19_blank.png',
        38: 'bext/vpn/pub/img/icon38_blank.png'},
};
if (be_version_util.cmp(be_util.version(), '1.13.544')<0)
{
    icon = {
        blank: {19: 'img/icon19_blank.png', 38: 'img/icon38_blank.png'},
    };
}
E.on_slave_change = function(){
    try {
        var slave = E.get('ext.slave');
        B.browser_action[slave ? 'disable' : 'enable']();
        B.browser_action.set_popup(
            {popup: slave ? '' : conf.default_popup});
        if (slave)
        {
            B.browser_action.set_icon({path: icon.blank});
            B.browser_action.set_title({title: ''});
        }
    } catch(e){
        be_lib.perr_err({id: 'set_icon_err', rate_limit: {count: 1}}, e); }
};

function inited_cb(){
    if (!E.get('inited'))
        return;
    E.off('change:inited', inited_cb);
    etask([function(){ return storage.get('ext_state');
    }, function(state){ E.set('enabled', state!='disabled');
    }, function(){ return E.load_rmt();
    }, function catch$(err){ be_lib.err('be_bg_main_init_err', '', err); }]);
}

E.ok = function(id, info){ return be_lib.ok(id, info); };
E.err = function(id, info, err){ return be_lib.err(id, info, err); };

E.set_enabled = function(on){
    if (!!E.get('enabled')==!!on)
        return;
    return etask([function(){
        E.set('enabled', !!on);
        return storage.set('ext_state', on ? 'enabled' : 'disabled');
    }, function catch$(err){
        be_lib.err('be_bg_main_set_enable_err', null, err);
    }]);
};

function load_config(be_ver){
    define('be_ver', function(){ return be_ver; });
    require.config({baseUrl: conf.url_bext, waitSeconds: 30,
        urlArgs: 'ext_ver='+be_util.version()+'&ver='+be_ver.ver});
    require(['config'], function(_be_config){
        _be_config.init(be_ver.ver, be_ver.country);
        require(['/bext/vpn/pub/rmt_ext.js'], function(be_rmt){
            if (E.get('rmt_loaded'))
                return;
            E.set('rmt_loaded', true);
            window.RMT = be_rmt;
            window.RMT.init();
        });
    });
}

E.load_local = function(){
    var be_ver = {ver: zon_config.ZON_VERSION};
    be_config.undef();
    define('be_ver', function(){ return be_ver; });
    require(['config'], function(_be_config){
        _be_config.init(be_ver.ver);
        require(['/bext/vpn/pub/rmt_ext.js'], function(be_rmt){
            if (E.get('rmt_loaded'))
                return;
            E.set('rmt_loaded', true);
            window.RMT = be_rmt;
            window.RMT.init();
        });
    });
};

E.load_rmt = function(){
    if (!E.get('inited') || E.get('rmt_loaded'))
        return;
    if (!dump_log_int)
        dump_log_int = setInterval(dump_rmt_log, 30*date.ms.SEC);
    if (window.is_local_ccgi)
        return E.load_local();
    be_config.undef();
    window.require_is_remote = true; 
    var be_ver = storage.get_json('be_ver_json');
    var on_ver_load;
    var no_cache_require = require.config({context: 'no_cache',
        baseUrl: conf.url_bext, waitSeconds: 30,
        urlArgs: 'ext_ver='+be_util.version()+'&rand='+Math.random()});
    no_cache_require.undef('be_ver');
    no_cache_require(['be_ver'], function(_be_ver){
        storage.set_json('be_ver_json', _be_ver);
        if (be_ver && be_ver.ver!=_be_ver.ver)
            return void be_lib.reload_ext();
        be_ver = _be_ver;
        if (on_ver_load)
            on_ver_load(be_ver);
    });
    if (be_ver)
        return void load_config(be_ver);
    on_ver_load = load_config;
};

E.get_rmt_config = function(){
    return zutil.get(window.RMT, 'be_config.config'); };

var dumped_log = [], dumped_rmt_log = [], dumped_errors = {};
E.dump_log = function(log){
    dumped_log = dumped_log.concat(format_log(log)).slice(-zerr.log.max_size);
};
function dump_rmt_log(){
    var rmt_log = zutil.get(window.RMT, 'zerr.log', []);
    if (!rmt_log.length)
        return;
    dumped_rmt_log = throttle_log(array.unique(dumped_rmt_log
        .concat(format_log(rmt_log))).slice(-10*zerr.log.max_size));
}
function format_log(log){
    var skips = [/backbone\.\w+\./, /ajax.*(perr| url )/,
        /perr.*rate too high/, /connection.*tpopup(_int)?:[0-9]+/,
        /be_tab_unblocker.*chrome-extension/, /stop .*cws/,
        /: (tab:[\d-]+ )?[a-z.]*popup /, /fetch_rules/, /be_req_bw/,
        /update url .* is_vpn false/, /checking if site has high unblocking/,
        /impl\.init/, /be_(bw_)?req_err/, /not_working_trigger/,
        /be\.ccgi\.send/, /be_vpn_total_active_time/, /be_media_failure/,
        /be_vstat_event/];
    var formats = [{from: /(perr [\w.]+) .*$/, to: '$1'}];
    var format = function(line){
        var ret = line;
        formats.forEach(function(f){ ret = ret.replace(f.from, f.to); });
        return ret;
    };
    var map = function(line){
        if (!/]$/.test(line))
            return format(line);
        var cnt = 0, str;
        var args_len = line.split('').reverse().findIndex(function(c){
            if (c=='"')
                return void (str = !str);
            return !str && (cnt += c==']' ? 1 : c=='[' ? -1 : 0)==0;
        });
        if (args_len==-1)
            return format(line);
        args_len++;
        var fmt = line.slice(0, -args_len);
        try {
            var args = JSON.parse(line.slice(-args_len));
            line = sprintf.apply(null, [fmt].concat(args));
        } catch(e){ line += ' (truncated)'; }
        return format(line);
    };
    return (log||[]).map(map).filter(function(line){
        return !skips.find(function(s){ return s.test(line); }); });
}
function throttle_log(log, agg){
    var throttle = [{test: /tab_unblocker slow/, per: date.ms.MIN},
        {test: /media failure detected/, per: date.ms.SEC},
        {test: /popup not allowed/}, {test: /tab already attached/}];
    return log.map(function(l){
        var t = throttle.find(function(_t){ return _t.test.test(l); });
        if (!t)
            return l;
        var m, prefix = (m = l.match(/^\[\w+\] /)) && m[0] || '';
        var _l = l.replace(prefix, '');
        var date_str = _l.substr(0, 23), d = new Date(date_str);
        if (!t.last)
        {
            t.last = d;
            t.count = 0;
            return l;
        }
        var count = ++t.count;
        if (!t.per || agg && d-t.last<t.per)
            return;
        t.last = d;
        t.count = 0;
        return agg && count>1 ? prefix+date_str+' x'+count+_l.substr(23) : l;
    }).filter(function(l){ return l; });
}
E.get_log = function(ui_log){
    dump_rmt_log();
    var idx = 0;
    var map = function(f){
        return function(l){ return {from: f, line: l, idx: idx++}; }; };
    var log = format_log(ui_log||[]).concat(dumped_log).map(map('ui'))
    .concat(format_log(zerr.log||[]).map(map('bg')))
    .concat(dumped_rmt_log.map(map('rmt')))
    .sort(function(a, b){
        return a.from==b.from ? a.idx-b.idx : a.line.localeCompare(b.line); })
    .map(function(c){
        return '['+(c.from=='rmt' ? 'bg' : c.from)+'] '+c.line; });
    return throttle_log(log, true);
};
E.dump_errors = function(tab_id, errors){ dumped_errors[tab_id] = errors; };
E.get_errors = function(tab_id){ return dumped_errors[tab_id]; };

E.set_bug_id = function(bug_id){
    zerr.warn('VPN BUG REPORT: http://web.hola.org/vpn_debug?id='+bug_id); };

var F = E.flags = {
    DEV: 0x40,
    REL1: 0x80,
    NO_UPDATE: 0x200,
    TMP_UUID: 0x400,
    PLUGIN: 0x8000,
    TORCH: 0x20000,
    APK_ANDROID: 0x40000,
};
function lset(bits, logic){ return logic ? bits : 0; }

E.get_flags = function(){
    var manifest = chrome && B.runtime.manifest;
    return lset(F.PLUGIN, E.get('plugin.enabled') || be_util.is_plugin())|
        lset(F.TMP_UUID, (E.get('uuid')||'').startsWith('t.'))|
        lset(F.TORCH, E.get('browser')=='torch')|
        lset(F.DEV,
            !zon_config._RELEASE)|lset(F.REL1, zon_config._RELEASE_LEVEL==1)|
        lset(F.NO_UPDATE, manifest && !manifest.update_url);
};

function start_monitor_worker(){
    var worker = new Worker('bext/vpn/pub/monitor_worker.js');
    worker.onmessage = function(e){
        if (e.data.type!='ping')
            return;
        var opt = {val: e.data.val, url: conf.url_perr,
            perr: be_lib.perr_opt(zerr.L.ERR, {id: 'main_thread_stuck',
            rate_limit: {count: 1}})};
        var bext_config;
        if ((bext_config = window.RMT&&window.RMT.be_ext&&
            window.RMT.be_ext.get('bext_config')) &&
            bext_config.monitor_worker)
        {
            assign(opt, bext_config.monitor_worker);
        }
        worker.postMessage({type: 'pong', opt: opt});
    };
}

return E; });
