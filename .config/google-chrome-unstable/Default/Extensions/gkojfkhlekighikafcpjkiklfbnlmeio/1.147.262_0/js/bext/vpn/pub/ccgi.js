// LICENSE_CODE ZON
'use strict'; 
define(['jquery', 'underscore', '/bext/pub/backbone.js', '/util/etask.js',
    '/util/zerr.js', '/bext/pub/util.js', '/bext/pub/lib.js',
    '/bext/pub/browser.js', '/bext/vpn/pub/svc.js', '/bext/vpn/pub/mode.js',
    '/util/storage.js', '/bext/vpn/pub/rule.js', '/bext/vpn/pub/vpn.js',
    '/bext/vpn/pub/tabs.js', '/bext/vpn/pub/info.js',
    '/bext/vpn/pub/premium.js', 'zon_config', 'conf'],
    function($, _, be_backbone, etask, zerr, be_util, be_lib, B, be_svc,
    be_mode, storage, be_rule, be_vpn, be_tabs, be_info, be_premium, zconf,
    conf){
B.assert_bg('be_ccgi');
var E = new be_backbone.model();

E.init = function(be_ext){
    if (E.inited)
        return;
    E.inited = true;
    E.init_ts = Date.now();
    E.sp = etask('be_ccgi', [function(){ return this.wait(); }]);
    E.be_ext = be_ext;
    E.be_mode = be_mode;
    E.listening = false;
    start_listen();
    E.on('destroy', E.uninit);
};

E.uninit = function(){
    E.sp.return();
    stop_listen();
};

function start_listen(){
    if (E.listening)
        return;
    B.be.ccgi.add_listener(ccgi_ipc_handler);
    E.listening = true;
}

function stop_listen(){
    if (!E.listening)
        return;
    B.be.ccgi.del_listener(ccgi_ipc_handler);
    E.listening = false;
}

function ccgi_resp(msg, resp_cb){
    _.defer(B.be.ccgi.send, msg, resp_cb);
    return true;
}

function ccgi_ipc_handler(msg, resp_cb, sender){
    if (msg._type && msg._type!='ccgi')
        return;
    switch (msg.id)
    {
    case 'callback':
        msg.data = {
            init_ts: E.init_ts,
            install_ts: storage.get_int('install_ts'),
            connected: E.be_ext.get('enabled'),
            disable: !E.be_ext.get('enabled'),
            uuid: E.be_ext.get('uuid'),
            session_key: E.be_ext.get('session_key')||0,
            session_key_cid: E.be_mode.get('svc.session_key_cid')||0,
            ver: be_util.version(),
            mode: E.be_mode.get('mode'),
            mode_duration: Date.now() - E.be_mode.get('ts'),
            pending: E.be_mode.get('pending'),
            type: conf.type,
            cid: E.be_mode.get('svc.cid'),
            browser: be_util.browser(),
            release: zconf._RELEASE,
            svc_mode: be_mode.get('mode'),
            svc_mode_pending: be_mode.get('pending'),
            svc_info: E.be_mode.get('svc.info'),
            build_info: be_util.build_info(),
        };
        return ccgi_resp(msg, resp_cb);
    case 'svc_callback':
        msg.data = null;
        E.sp.spawn(etask({name: 'svc_callback', cancel: true}, [function(){
            return be_svc.callback({raw: 1});
        }, function(r){
            r.from_be = true;
            msg.data = r;
            ccgi_resp(msg, resp_cb);
        }, function catch$(){ ccgi_resp(msg, resp_cb); }]));
        return true;
    case 'update_rules':
        msg.data = {};
        try { be_rule.trigger('fetch_rules', false); } catch(e){}
        return ccgi_resp(msg, resp_cb);
    case 'enable': E.be_ext.set('enabled', !!msg.data); break;
    case 'vpn_enable': 
        msg.data = {};
        E.sp.spawn(etask({name: 'vpn_enable', cancel: true}, [function(){
        }, function catch$(err){ return msg.data.err = ''+err;
        }, function finally$(){ return ccgi_resp(msg, resp_cb); }]));
        return true;
    case 'perr':
        be_lib.perr(zerr.L.NOTICE, {id: msg.perr_id,
            info: JSON.parse(msg.info)});
        break;
    case 'set_rule':
        msg.data = {};
        E.sp.spawn(etask({name: 'set_rule', cancel: true}, [function(){
            return be_rule.set_rule(msg.opt);
        }, function catch$(err){ return msg.data.err = ''+err;
        }, function finally$(){
            if (!msg.no_resp)
                ccgi_resp(msg, resp_cb);
        }]));
        return !msg.no_resp;
    case 'fetch_rules':
        msg.data = {};
        E.sp.spawn(etask({name: 'fetch_rules', cancel: true}, [function(){
            return be_rule.fetch_rules();
        }, function(){ return msg.data.rules = be_rule.get('rules');
        }, function catch$(err){ return msg.data.err = ''+err;
        }, function finally$(){
            if (!msg.no_resp)
                ccgi_resp(msg, resp_cb);
        }]));
        return !msg.no_resp;
    case 'enable_root_url':
        msg.data = {};
        E.sp.spawn(etask({name: 'enable_root_url', cancel: true}, [function(){
            return be_vpn.enable_root_url(msg.opt);
        }, function(rule){ return msg.data.rule = rule;
        }, function catch$(e){ return msg.data.err = ''+e;
        }, function finally$(){
            if (!msg.no_resp)
                ccgi_resp(msg, resp_cb);
        }]));
        return !msg.no_resp;
    case 'refresh_membership':
        E.sp.spawn(be_premium.refresh_user(
            Object.assign({force_premium: true}, msg.data)));
        break;
    case 'ping':  break;
    case 'get_log':  break;
    case 'pac_log':  break;
    case 'set_dont_show_again':
        try { E.sp.spawn(be_info.set_dont_show_again(msg.data)); }
        catch(e){}
        break;
    case 'opts_set': be_util.zopts.set(msg.data.key, msg.data.val); break;
    case 'open_be_tab': be_util.open_be_tab(msg.opt); break;
    case 'force_suggestion':
        E.sp.spawn(etask({name: 'force_suggestion', cancel: true}, [function(){
            return be_tabs.set_force_suggestion(msg.tab_id||sender.tab.id,
                true);
        }, function catch$(e){ return msg.data.err = ''+e;
        }, function finally$(){
            if (!msg.no_resp)
                ccgi_resp(msg, resp_cb);
        }]));
        return !msg.no_resp;
    default: zerr('unknown ccgi message '+zerr.json(msg));
    }
}

return E; });
