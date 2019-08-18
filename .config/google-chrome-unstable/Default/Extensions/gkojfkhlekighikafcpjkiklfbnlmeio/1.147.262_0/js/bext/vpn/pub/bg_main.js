// LICENSE_CODE ZON
'use strict'; 
define(['jquery', 'underscore', '/bext/pub/backbone.js', '/util/etask.js',
    '/bext/pub/util.js', '/util/zerr.js', '/bext/pub/browser.js',
    '/bext/pub/lib.js', '/util/escape.js', '/util/version_util.js',
    'config', 'bootstrap', '/util/storage.js', '/util/ajax.js',
    '/util/util.js', '/util/sprintf.js', '/util/date.js', '/util/array.js',
    '/bext/pub/ga.js', 'jquery_cookie', '/bext/vpn/pub/hybrid_mock.js',
    '/bext/vpn/pub/tabs.js', '/bext/vpn/pub/bg_ajax.js',
    '/bext/vpn/pub/icon.js', '/bext/pub/ext.js', '/bext/vpn/pub/rule.js',
    '/bext/vpn/pub/premium.js', '/bext/vpn/pub/dev_mode.js',
    '/bext/vpn/pub/trial.js', '/bext/vpn/pub/ccgi.js',
    '/bext/vpn/pub/vpn.js', '/bext/vpn/pub/info.js',
    '/bext/vpn/pub/mode.js', '/bext/vpn/pub/tpopup.js', 'conf'],
    function($, _, be_backbone, etask, be_util, zerr, B, be_lib, zescape,
    version_util, be_config, bootstrap, storage, ajax, zutil, sprintf,
    date, array, ga, jcookie, hybrid_mock, be_tabs, be_bg_ajax, be_icon,
    be_ext, be_rule, be_premium, be_dev_mode, be_trial, be_ccgi, be_vpn,
    be_info, be_mode, be_tpopup, conf){
B.assert_bg('be_bg_main');
if (!zutil.is_mocha())
    etask.set_zerr(zerr);
zerr.set_exception_handler('be', be_lib.err);
var chrome = window.chrome;
var assign = Object.assign;
var browser = be_util.browser();
var last_use, dump_log_int;
var uninstall_cb_to, new_uuid;

var E = new (be_backbone.model.extend({
    _defaults: function(){
        this.on('install', on_install);
        this.on('update', on_update);
        this.on('up', on_up);
        this.on('destroy', function(){ E.uninit(); });
        this.set('ver', conf.version);
        $(window).on('unload', function(){ E._destroy(); });
    },
}))();

E.be_util = be_util;
E.zerr = window.hola.zerr = zerr;
E.be_browser = B;
E.be_lib = be_lib;
E.zerr = zerr;
E.be_tabs = be_tabs;
E.tabs = be_tabs; 
E.be_ext = be_ext;
E.be_vpn = be_vpn;
E.be_dev_mode = be_dev_mode;
E.be_info = be_info;
E.be_rule = be_rule;
E.be_premium = be_premium;
E.be_mode = be_mode;
E.be_trial = be_trial;
E.be_tpopup = be_tpopup;
E.be_util.rmt = E; 

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

E.gclid_ga_event = function(act, lab, val){
    var cb = function(){
        if (!ga.xhr_opt)
            return zerr('gclid_ga_event failed, no xhr_opt');
        if (ga.xhr_opt.gclid)
            ga.ga_send('event', 'ppc', act, lab, val);
    };
    if (E.get('ga_inited'))
        cb();
    else
        E.once('change:ga_inited', cb);
};

function on_install(){
    storage.set('install_ts', window.hola.t.l_start);
    storage.set('install_version', be_util.version());
    send_install_perr();
    E.gclid_ga_event('install_extension');
}
function on_update(prev){
    be_lib.ok('update', prev+' > '+be_util.version());
    storage.set('update_ts', window.hola.t.l_start);
}
function on_up(){ be_lib.ok('up'); }

function ccgi_init(){
    be_ccgi.init(be_ext);
    B.tabs.query({url: conf.hola_match}, function(tabs){
        _.each(tabs, function(tab){
            B.tabs.execute_script(tab.id, {file: '/js/bext/vpn/pub/cs_hola.js',
                runAt: 'document_start'});
        });
    });
}

function get_uuid(){
    return etask({name: 'get_uuid', cancel: true}, [function(){
        return etask.all({allow_fail: true}, {
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
        if (!uuid)
            return;
        if (typeof uuid!='string' || uuid.length<8)
            throw new Error('invalid_uuid');
        return uuid;
    }, function catch$(err){
        be_lib.perr_err({id: 'unreachable', info: 'get_uuid', err: err});
    }]);
}

function persist_uuid(uuid){
    return etask({name: 'persist_uuid'}, [function(){
        return etask.all({allow_fail: true}, {
            local: be_lib.storage_local_set({uuid: uuid}),
            localStorage:
                etask([function(){ localStorage.setItem('uuid', uuid); }]),
            cookie: etask([function(){
                $.cookie('uuid', uuid, {expires: 36500, path: '/'}); }]),
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
        new_uuid = true;
        return E.gen_uuid();
    }, function(_uuid){
        zerr.assert(_uuid, 'gen_uuid() returned: '+_uuid);
        return persist_uuid(uuid = _uuid);
    }, function(ret){
        if (!ret)
            return uuid;
        uuid = 't.'+uuid.substr(2);
        be_lib.perr_err({id: 'init_tmp_uuid', info: {uuid: uuid}});
        return uuid;
    }]);
}

function handle_install(){
    return etask({name: 'handle_install', cancel: true}, [function(details){
        var reason = zutil.get(E.install_details, 'reason');
        zerr.notice('be_bg_main up reason: '+reason);
        if (new_uuid && reason!='install')
        {
            be_lib.perr_err({id: 'switch_uuid_err',
                info: {reason: ''+reason}});
        }
        if (!{install: 1, update: 1}[reason])
            return;
        be_ext.set('install_details', reason);
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
        browser:be_util.browser(), version: be_util.version()};
    if (last_use && now-last_use.ts<15*date.ms.MIN)
    {
        qs.last = btoa(last_use.name);
        if (last_use.is_mitm)
            qs.mitm = 1;
    }
    var ms;
    if (ms = be_util.get_install_ms())
        qs.inst_ms = ms;
    var url = conf.url_ccgi+'/uninstall?'+zescape.qs(qs);
    url = url.substr(0, 255); 
    B.runtime.set_uninstall_url(url);
    uninstall_cb_to = setTimeout(E.uninstall_url_cb, 6*date.ms.HOUR);
};

E.get_agree_ts = function(){
    if (!conf.check_agree_ts)
        return 1;
    var ver_install = storage.get('install_version');
    if (ver_install && version_util.cmp(ver_install, '1.131.737') < 0)
        return 1;
    return storage.get('agree_ts');
};

E.set_agree_ts = function(val){
    E.set('agree_ts', val);
    storage.set('agree_ts', val);
};

function set_upgrade_ext_interval(){
    clearInterval(set_upgrade_ext_interval.interval);
    be_util.upgrade_ext();
    set_upgrade_ext_interval.interval = setInterval(function cb(){
        be_util.upgrade_ext(); }, 24*date.ms.HOUR);
}
function ajax_do_op(o){
    var op = zutil.get(o, 'op');
    if (!op)
        return;
    switch (op)
    {
    case 'reload_ext':
        zerr.notice('do_op_reload_ext '+zerr.json(o));
        B.be.reload_ext();
        break;
    case 'upgrade_ext':
        zerr.notice('do_op_upgrade_ext '+zerr.json(o));
        be_util.upgrade_ext();
        break;
    default: zerr('unknown op '+zerr.json(o)); break;
    }
}

function storage_err_cb(){
    if (!be_util.get('storage.err'))
        return;
    E.stopListening(be_util, 'change:storage.err', storage_err_cb);
    var last = be_util.get('storage.last_error');
    be_lib.perr_err({id: 'be_storage_err',
        info: last && last.api+' '+last.key, err: last&&last.err});
}

E.init = function(opt){
    if (E.inited)
        return;
    opt = opt||{};
    E.install_details = opt.install_details;
    E.inited = true;
    E.set_perr(function(opt){ be_lib.perr_err(opt); });
    E.set('agree_ts', E.get_agree_ts());
    E.sp = etask('be_bg_main', [function(){ return this.wait(); }]);
    ajax.do_op = ajax_do_op;
    B.init();
    E.listen_to(be_util, 'change:storage.err', storage_err_cb);
    be_tabs.init();
    be_ext.init();
    ccgi_init();
    be_premium.init(be_rule);
    be_trial.init(be_rule);
    be_dev_mode.init();
    B.backbone.server.start(E, 'be_bg_main');
    storage.clr('ajax_timeout');
    zerr.notice('be_bg_main_init');
    E.on('change:inited', inited_cb);
    E.on('change:agree_ts', send_install_perr);
    if (B.have['runtime.set_uninstall_url'])
        E.on_init('change:uuid change:cid', E.uninstall_url_cb);
    start_monitor_worker();
    E.sp.spawn(etask([function(){ return ensure_uuid();
    }, function(uuid){
        zerr.notice('uuid: '+uuid);
        E.set('uuid', uuid); 
        be_ext.set('uuid', uuid);
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
    set_upgrade_ext_interval();
};

E.uninit = function(){
    if (!E.inited)
        return;
    be_lib.ok('bg_main_uninit');
    dump_log_int = void clearInterval(dump_log_int);
    E.sp.return();
    set_upgrade_ext_interval.interval = clearInterval(
        set_upgrade_ext_interval.interval);
    B.backbone.server.stop('be_bg_main');
    if (zutil.is_mocha())
    {
        be_vpn.uninit();
        be_premium.uninit();
        be_trial.uninit();
        be_icon.uninit();
        be_bg_ajax.uninit();
        be_ccgi.uninit();
        be_ext.uninit();
        be_tabs.uninit();
        B.uninit();
    }
    else
    {
        be_vpn._destroy();
        be_premium._destroy();
        be_trial._destroy();
        be_icon._destroy();
        be_bg_ajax._destroy();
        be_ccgi._destroy();
        be_ext._destroy();
        be_tabs._destroy();
        B._destroy();
    }
    if (uninstall_cb_to)
        uninstall_cb_to = clearTimeout(uninstall_cb_to);
    E.inited = false;
    E.clear();
};

function inited_cb(){
    if (!E.get('inited'))
        return;
    E.off('change:inited', inited_cb);
    etask([function(){ return storage.get('ext_state');
    }, function(state){
        E.set('enabled', state!='disabled'); 
        be_ext.set('enabled', state!='disabled');
    }, function(){
        be_icon.init();
        return E.load_local();
    }, function catch$(err){ be_lib.err('be_bg_main_init_err', '', err); }]);
}

E.ok = function(id, info){ return be_lib.ok(id, info); };
E.err = function(id, info, err){ return be_lib.err(id, info, err); };

E.set_enabled = function(on){
    if (!!E.get('enabled')==!!on)
        return;
    return etask([function(){
        E.set('enabled', !!on);
        be_ext.set('enabled', !!on); 
        return storage.set('ext_state', on ? 'enabled' : 'disabled');
    }, function catch$(err){
        be_lib.err('be_bg_main_set_enable_err', null, err);
    }]);
};

E.load_local = function(){
    hybrid_mock.init(); 
    require(['/bext/vpn/pub/tab_unblocker.js'],
        function(be_tab_unblocker){
        be_bg_ajax.init(be_tab_unblocker);
        window.RMT = E; 
        E.listen_to(be_ext, 'change:uuid change:auth.stamp', background_init);
    });
};

function background_init(){
    var req;
    return etask([function(){
        zerr.notice('background_init called %s', E.get('status'));
        if (E.get('status')=='busy' || E.get('status')=='ready')
            return this.return();
        if (!be_ext.get('uuid'))
            return this.return(void zerr.notice('background_init no uuid'));
        E.set('status', 'busy');
        req = {retry: 1, method: 'POST', data: {login: 1,
            ver: be_util.version()},
            qs: be_util.qs_ajax({uuid: be_ext.get('uuid')}),
            url: conf.url_ccgi+'/background_init', with_credentials: true};
        return be_bg_ajax.ccgi_ajax(req);
    }, function catch$(err){
        be_lib.err('be_rmt_init_fail', {req: req}, err);
        E.set('status', 'error');
        zerr.notice('rmt.init_cb failed %o', err);
        return this.return();
    }, function(info){
        be_ext.set('session_key', info.key);
        be_vpn.init(E);
        E.stopListening(be_ext, 'change:uuid change:auth.stamp',
            background_init);
        E.set('status', 'ready');
        var t = window.hola.t;
        t.r_init = Date.now();
        var start = t.new_ver||t.l_start;
        var diff = t.r_init-start;
        if (diff > 20000)
            be_lib.perr(zerr.L.ERR, {id: 'rmt_init_slow', info: {diff: diff}});
        else
            zerr[diff>2000 ? 'err' : 'notice']('background_init %sms', diff);
    }, function catch$(err){
        be_lib.err('be_rmt_init_err', {req: req}, err);
        E.set('status', 'error');
    }]);
}

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
        var m, prefix = (m = l.match(/^\[[\w[\]]+\] /)) && m[0] || '';
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
E.get_log = function(is_plus){
    dump_rmt_log();
    var idx = 0;
    var map = function(f){
        return function(l){ return {from: f, line: l, idx: idx++}; }; };
    var log = format_log([]).concat(dumped_log).map(map('ui'))
    .concat(format_log(zerr.log||[]).map(map('bg')))
    .concat(dumped_rmt_log.map(map('rmt')))
    .sort(function(a, b){
        return a.from==b.from ? a.idx-b.idx : a.line.localeCompare(b.line); })
    .map(function(c){
        return '['+(is_plus ? 'P' : 'F')+']['+(c.from=='rmt' ? 'bg' : c.from)
            +'] '+c.line;
    });
    return throttle_log(log, true);
};
E.dump_errors = function(tab_id, errors){ dumped_errors[tab_id] = errors; };
E.get_errors = function(tab_id){ return dumped_errors[tab_id]; };

E.set_bug_id = function(bug_id){
    zerr.warn('VPN BUG REPORT: http://web.hola.org/vpn_debug?id='+bug_id); };

function start_monitor_worker(){
    var worker = new Worker('bext/vpn/pub/monitor_worker.js');
    worker.onmessage = function(e){
        if (e.data.type!='ping')
            return;
        var opt = {val: e.data.val, url: conf.url_perr,
            perr: be_lib.perr_opt(zerr.L.ERR, {id: 'main_thread_stuck',
            rate_limit: {count: 1}})};
        var bext_config = be_ext.get('bext_config');
        if (bext_config && bext_config.monitor_worker)
            assign(opt, bext_config.monitor_worker);
        worker.postMessage({type: 'pong', opt: opt});
    };
}

E.reset_bg_ajax = function(){ be_bg_ajax.trigger('reset'); };

return E; });
