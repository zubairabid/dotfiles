// LICENSE_CODE ZON
'use strict'; 
define(['/bext/pub/browser.js', '/bext/pub/backbone.js', '/util/etask.js',
    '/bext/pub/lib.js', '/bext/pub/ext.js', '/util/util.js',
    '/bext/pub/util.js', 'underscore', '/util/storage.js', '/util/date.js',
    '/util/zerr.js', 'jquery', '/svc/hola/pub/svc_ipc.js', '/util/escape.js',
    '/bext/vpn/pub/bg_ajax.js', 'conf'],
    function(B, be_backbone, etask, be_lib, be_ext, zutil, be_util, _, storage,
    date, zerr, $, svc_ipc, zescape, be_bg_ajax, conf){
var chrome = window.chrome;
var E = new (be_backbone.task_model.extend({
    _defaults: function(){
    this.on('destroy', function(){
        B.backbone.server.stop('be_svc');
        E.uninit();
    });
    B.backbone.server.start(this, 'be_svc');
    },
}))();

function firefox_origin_fix(details){
    var fix = {name: 'Origin', value: 'resource://ff_ext-at-hola-dot-org'};
    if (details.requestHeaders.find(function(header){
        return header.name.toLowerCase()=='origin'; }))
    {
        return;
    }
    return {requestHeaders: [fix].concat(details.requestHeaders)};
}

E.init = function(be_vpn){
    if (conf.firefox_web_ext)
    {
        chrome.webRequest.onBeforeSendHeaders.addListener(
            firefox_origin_fix, {urls: ['*://127.0.0.1/*',
            '*://localhost.h-local.org/*']}, ['blocking', 'requestHeaders']);
    }
    E.svc_monitor.init();
    if (!(E.be_vpn = be_vpn))
        return;
    E.listenTo(E.be_vpn, 'change:protect_pc', function(){
        if (!E.be_vpn.get('protect_pc'))
            return E.stop_watch_vpn_status();
        E.svc_monitor.uninit();
        E.svc_monitor.init();
    });
};

E.uninit = function(){
    if (conf.firefox_web_ext)
    {
        chrome.webRequest.onBeforeSendHeaders.removeListener(
            firefox_origin_fix);
    }
    E.svc_monitor.uninit();
    E.clear();
};

E.svc_monitor = (function(){
var EE = {}, inited = false, monitor;
EE.interval = 10*date.ms.MIN;
EE.init = function(){
    if (inited)
        return;
    monitor = etask('svc_init', [
        function restart(){ return E.update_info(); },
        function(){ return etask.sleep(EE.interval); },
        function(){ return this.goto('restart'); },
    ]);
    inited = true;
};

EE.uninit = function(){
    if (!inited)
        return;
    if (monitor)
    {
        monitor.return();
        monitor = null;
    }
    E.stop_watch_vpn_status();
    inited = false;
};

return EE; })();

E.update_info = function(){
    return etask('update_info', [function(){
        return E.callback({});
    }, function(info){
        if (info && E.be_vpn && E.be_vpn.get('protect_pc'))
        {
            if (info.svc)
                E.watch_vpn_status();
            else
                E.stop_watch_vpn_status();
        }
        if (_.isEqual(info, E.get('info')))
            return info;
        var change = {};
        change.info = info;
        change.ws_port = info.ws_port;
        if (info.status && info.status.protocol)
        {
            change['status.protocol.enabled'] = info.status.protocol.enabled;
            change['status.protocol.connected'] =
                info.status.protocol.connected;
        }
        if (info.status && info.status.unblocker)
        {
            change['status.unblocker.enabled'] = info.status.unblocker.enabled;
            change['status.unblocker.connected'] =
                info.status.unblocker.connected;
        }
        if (info.status && info.status.jsproxy)
            change['status.jsproxy.connected'] = info.status.jsproxy.connected;
        change.cid = info.cid;
        change.cid_js = info.cid_js;
        change.version = info.version;
        change.session_key_cid = info.session_key;
        change.session_key_cid_js = info.session_key_js;
        change.user_token = info.user_token;
        change.sync_token = info.sync_token||'';
        change.callback_raw = info.raw;
        change.callback_ts = date();
        if (E.get('status.protocol.connected') &&
            !change['status.protocol.connected'])
        {
            be_lib.perr_err({id: 'protocol_disconnect'});
        }
        E.safe_set(change);
        return info;
    }, function catch$(){
        E.safe_set({
            info: null,
            ws_port: 0,
            'status.protocol.enabled': false,
            'status.protocol.connected': false,
            'status.unblocker.enabled': false,
            'status.unblocker.connected': false,
            'status.jsproxy.connected': false,
            cid: 0,
            cid_js: '',
            session_key_cid: 0,
            session_key_cid_js: 0,
            sync_token: '',
            callback_raw: null,
            callback_ts: null,
            version: null,
        });
    }]);
};

function padhex(num){ return ('000000000'+num.toString(16)).substr(-8); }

E.ipc_cmd = function(port, cmd, opt){
    if (!(this instanceof E.ipc_cmd))
        return new E.ipc_cmd(port, cmd, opt);
    opt = this.opt = opt||{};
    this.timer = null;
    this.n = 0;
    var q = this.q = [];
    var ws = this.ws = new WebSocket('ws://127.0.0.1:'+port+'/');
    var _this = this;
    ws.onopen = function(){
        var argv = cmd.split(' ');
        var msg = padhex(4)+' '+padhex(argv.length);
        for (var i=0; i<argv.length; i++)
            msg += ' '+padhex(argv[i].length)+' '+argv[i];
        ws.send(msg);
    };
    ws.onmessage = function(e){
        this.n++;
        zerr.debug('ipc %s', e.data);
        var argv = e.data.split(' '), ret = parseInt(argv[1], 16);
        q.push({ret: ret, data: argv});
        if (opt.qlen && q.length>opt.qlen)
            q.shift();
        _this._notify();
    };
    ws.onclose = function(e){
        zerr.debug('ipc closed code: %d reason: %s clean: %s', e.code,
            e.reason, e.wasClean);
        _this.closed = true;
        _this._notify(new Error('connection closed'));
    };
    ws.onerror = function(e){
        zerr.debug('ipc error %O', e);
        _this.closed = true;
        _this._notify(e);
    };
};

E.ipc_cmd.prototype.recv = function(timeout){
    var e = this.d = etask('recv', [function(){ return this.wait(); }]);
    if (this.q.length)
        this._notify();
    else if (this.closed)
        this._notify(new Error('connection closed'));
    else if (timeout)
        this.timer = setTimeout(this._notify.bind(this, 'timeout'), timeout);
    return e;
};

E.ipc_cmd.prototype._notify = function(err){
    var d = this.d;
    if (!d)
        return;
    if (err=='timeout')
        d.continue(null);
    else if (err)
        d.throw(err);
    else
        d.continue(this.q.shift());
    this._clear_timer();
    delete this.d;
};

E.ipc_cmd.prototype._clear_timer = function(){
    this.timer = clearTimeout(this.timer); };

E.ipc_cmd.prototype.destroy = function(){
    try { this.ws.close(); }
    catch(e){ zerr(e); }
    this._clear_timer();
    delete this.q;
    delete this.d;
};

E.callback = function(opt){
    opt = opt||{};
    window.disable_svc_polling = window.disable_svc_polling||0;
    return etask('callback', [function try_catch$(){
        if (window.disable_svc_polling || !be_ext.get('r.ext.enabled'))
            return this.return(etask.err('not running'));
        return svc_ipc.ajax('callback.json' + (opt.full_vpn ? '?vpn=1' : ''));
    }, function(ret){
        var data, xhr;
        if (ret)
        {
            data = ret.ret;
            xhr = ret.xhr;
        }
        if (this.error || !data || !xhr || xhr.status!=200 ||
            typeof data.cid!='number')
        {
            console.log('Use window.disable_svc_polling = 1 to stop polling');
            return this.return(etask.err('not running'));
        }
        if (opt.raw)
            return this.return(data);
        ret = {status: {}};
        ret.raw = data;
        if (data.player)
            ret.player = data.player;
        if (data.ws_port>0)
            ret.ws_port = data.ws_port;
        if (data.has_internet!==undefined)
            ret.status.has_internet = data.has_internet;
        if (data.protocol)
        {
            ret.status.protocol = {enabled: !data.protocol.disable,
                connected: !!data.protocol.connected};
        }
        if (data.unblocker)
        {
            ret.status.unblocker = {enabled: !data.unblocker.disable,
                connected: !!data.unblocker.connected,
                pac_url: data.unblocker.pac_url};
        }
        if (data.connected_js)
            ret.status.jsproxy = {connected: true};
        if (data.full_vpn)
            ret.status.full_vpn = data.full_vpn;
        Object.assign(ret, {
            cid: data.cid>0 ? data.cid : 0,
            cid_js: data.cid_js||'',
            version: data.ver||'0.0.0',
            os_ver: data.os_ver,
            session_key:
                data.session_key=='00000000000000000000000000000000' ? null :
                data.session_key,
            session_key_js: data.session_key_js,
            user_token: data.user_token,
            sync_token: data.sync_token||'',
            ui_type: data.ui_type,
            svc: 1,
        });
        return this.return(ret);
    }]);
};

E.ensure_vpn_info = function(){
    return etask({name: 'ensure_vpn_info'}, [function try_catch$(){
        return be_bg_ajax.hola_api_call('users/ensure_vpn_info');
    }, function(info){
        if (this.error || !info)
        {
            return void be_lib.perr(zerr.L.ERR, {id: 'ensure_vpn_info_fail',
                info: zerr.e2s(this.error)});
        }
        var vpn_info = zutil.pick(info, 'login', 'password');
        E.set('vpn_info', vpn_info);
        return vpn_info;
    }]);
};

function set_status(status, country){
    if (country!==undefined)
    {
        if (country == 'uk')
            country = 'gb';
        E.set('vpn_country', country);
    }
    E.set('status', status||'ready');
    E.trigger('update_vpn_status');
}

E.vpn_connect = function(opt){
    opt = opt||{};
    var country = (opt.country||'').toLowerCase();
    return etask('vpn_connect', [function(){
        if (E.get('vpn_info'))
            return E.get('vpn_info');
        return E.ensure_vpn_info();
    }, function(vpn_info){
        if (!vpn_info)
        {
            set_status('ready', '');
            return;
        }
        set_status('busy', country);
        return svc_ipc.ajax('vpn_connect.json?'+zescape.qs({
            host: country+'.vpn.hola.org',
            username: vpn_info.login,
            password: vpn_info.password,
            country: country,
        }));
    }, function catch$(e){
        set_status('ready', '');
        be_lib.perr(zerr.L.ERR, {id: 'vpn_connect', info: zerr.e2s(e)});
    }]);
};

E.vpn_disconnect = function(){
    return etask('vpn_disconnect', [function(){
        set_status('busy', '');
        return svc_ipc.ajax('vpn_disconnect.json');
    }, function catch$(e){
        be_lib.perr(zerr.L.ERR, {id: 'vpn_disconnect', info: zerr.e2s(e)});
    }, function finally$(){
        set_status();
    }]);
};

E.vpn_change_agent = function(){
    return etask('vpn_change_agent', [function(){
        set_status('busy');
        return svc_ipc.ajax('vpn_change_agent.json');
    }, function catch$(e){
        be_lib.perr(zerr.L.ERR, {id: 'vpn_change_agent', info: zerr.e2s(e)});
    }, function finally$(){
        set_status();
    }]);
};

var ul_sp;
function update_location(){
    if (ul_sp)
        return ul_sp;
    var max_calls = 5;
    return ul_sp = etask({name: 'update_location'}, [function call_myip(){
        if (!max_calls)
            return;
        return be_bg_ajax.hola_api_call('myip.json', {timeout: 5*date.ms.SEC});
    }, function catch$(e){
        max_calls--;
        this.goto('call_myip', etask.sleep(date.ms.SEC));
    }, function(res){
        ul_sp = undefined;
        return res;
    }]);
}

var vs_sp;
E.watch_vpn_status = function(){
    if (vs_sp)
        return;
    var connecting, connected, country, active;
    vs_sp = etask({name: 'watch_vpn_status', cancel: true}, [function loop(){
        return svc_ipc.ajax({cmd: 'vpn_status.json', timeout: 30*date.ms.SEC});
    }, function(status){
        status = (status||{}).ret;
        connecting = !!status.connecting_to;
        connected = !!status.connected_to;
        country = status.connecting_to || status.connected_to || '';
        active = (connecting || status.disconnecting) && !connected;
        if (E.get('status')!='ready' && connected)
            return update_location();
    }, function(){
        set_status(active ? 'busy' : 'ready', country.toLowerCase());
        return etask.sleep(1*date.ms.SEC);
    }, function(){ return this.goto('loop');
    }, function finally$(){
        set_status('ready');
        E.stop_watch_vpn_status();
    }]);
    return vs_sp;
};

E.stop_watch_vpn_status = function(){
    if (vs_sp)
        vs_sp = void vs_sp.return();
};

var stats_interval = 6*date.ms.HOUR, collect_stats_timeout;

function collect_stats(){
    etask([function try_catch$(){
    return svc_ipc.ajax({cmd: 'stats.json', timeout: -1});
    }, function(stats){
        if (this.error)
            return zerr('failed collecting stats %s', this.error);
        stats = stats.ret;
        be_lib.perr(zerr.L.INFO, {id: 'client_stats',
            filehead: JSON.stringify(stats)});
    }, function finally$(){ schedule_collect_stats(); }]);
}

function schedule_collect_stats(){
    var offset = E.get('cid')||+E.get('cid_js').replace(/[^\d]+/g, '')||0;
    var time_offset = offset*date.ms.SEC % stats_interval;
    var next = Math.floor(Date.now()/stats_interval) * stats_interval
        + time_offset;
    if (next<Date.now())
        next += stats_interval;
    collect_stats_timeout = setTimeout(collect_stats, next-Date.now());
}

E.start_collect_stats = function(){ schedule_collect_stats(); };

E.stop_collect_stats = function(){
    collect_stats_timeout = clearTimeout(collect_stats_timeout); };

return E; });
