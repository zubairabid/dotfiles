// LICENSE_CODE ZON
'use strict'; 
define(['jquery', 'underscore', '/bext/pub/backbone.js', '/util/etask.js',
    '/bext/pub/browser.js', '/util/zerr.js', '/bext/pub/util.js',
    '/bext/pub/lib.js', '/util/version_util.js', '/util/escape.js',
    '/util/util.js', '/util/storage.js', '/bext/vpn/pub/util.js',
    '/util/date.js', 'conf'],
    function($, _, be_backbone, etask, B, zerr, be_util, be_lib,
    version_util, zescape, zutil, storage, be_vpn_util, date, conf){
B.assert_bg('be_ext');
function get_bg_main(){ return window.be_bg_main; }
var assign = Object.assign;
var E = new (be_backbone.model.extend({
    _defaults: function(){
        this.on('destroy', function(){
            B.backbone.server.stop('be_ext');
            E.uninit();
        });
        B.backbone.server.start(this, 'be_ext');
    },
}))();

E.init = function(){
    if (E.get('inited'))
        return;
    E.sp = etask('be_ext', [function(){ return this.wait(); }]);
    E.set('inited', true);
    E.set_perr(function(opt){ be_lib.perr_err(opt); });
    bg_main_to_ext_init();
    ext_init();
    vpn_init();
};

E.uninit = function(){
    if (!E.get('inited'))
        return;
    E.sp.return();
    E.stopListening();
    E.set('inited', false);
    E.clear();
};

function bg_main_to_ext_init(){
    E.on_init('change:enabled', function(){
        E.set('state', E.get('enabled') ? 'on' : 'off'); });
}

function ext_init(){
    E.on_init('change:uuid change:session_key', function(){
        var id = E.get('uuid'), key = E.get('session_key');
        var stamp = E.get('auth.stamp')||0;
        var change = {'auth.id': id, 'auth.key': key}, diff;
        if (!(diff = E.changedAttributes(change)))
            return;
        diff['auth.stamp'] = stamp+1;
        E.safe_set(diff);
    });
    E.on_init('change:ext.conflict', function(){
        var last_conflict = E.previous('ext.conflict');
        if (last_conflict===undefined)
            last_conflict = !!storage.get_int('last_conflict');
        var conflict = !!E.get('ext.conflict');
        if (conflict!=last_conflict)
        {
            if (conflict)
            {
                be_lib.perr_err({id: 'be_ext_conflict', info: {
                    proxy_level: E.get('proxy.effective.control_level'),
                    proxy_value: E.get('proxy.effective.value')},
                    rate_limit: {count: 1, ms: date.ms.DAY}});
                storage.set('last_conflict', 1);
            }
            else
            {
                be_lib.perr_err({id: 'be_ext_conflict_resolved', info: {
                    proxy_level: E.get('proxy.effective.control_level'),
                    proxy_value: E.get('proxy.effective.value')},
                    rate_limit: {count: 1, ms: date.ms.DAY}});
                storage.clr('last_conflict');
            }
        }
    });
}

function vpn_init(){
    var get_conf = function(conf, key, keys){
        var res = {};
        keys.forEach(function(n){
            res[n] = zutil.get(conf, key+'.'+n, zutil.get(conf, n)); });
        return res;
    };
    var set_gen_conf = function(conf, key){
        var gen = get_conf(zutil.get(conf, 'gen', {}), key, ['req_ip_check',
            'hide_ip_on', 'check_tunnel_error', 'is_report_slow_once',
            'report_active', 'autoreload_limit', 'autoreload_ms',
            'report_tab_load_on', 'is_tab_trace_on', 'dbg_log_on',
            'name', 'dbg_log_rate', 'is_etask_perf_on', 'is_media_direct_on',
            'peer_fallback_min_ver', 'disable_tunnel_error',
            'is_reload_on_update_on', 'disable_order', 'disable_trial_agents',
            'disable_agent_req_err_check', 'disable_pool_agents']);
        var browser = be_util.browser(), ver = be_util.version();
        if (gen.peer_fallback_min_ver)
        {
            if (version_util.cmp(gen.peer_fallback_min_ver, ver)<=0)
                gen.peer_fallback_on = 1;
            delete gen.peer_fallback_min_ver;
        }
        if (gen.hide_ip_on && (!['opera', 'chrome'].includes(browser)))
            gen.hide_ip_on = 0;
        var features = {};
        for (var e in gen)
        {
            if (gen[e] && e.endsWith('_on'))
                gen[e] = be_vpn_util.is_conf_allowed(gen[e]);
            E.set('gen.'+e, gen[e]);
            if (gen[e])
                features['test_'+e] = e!='name' ? 1 : gen[e];
        }
        E.unset('features', features);
        if (Object.keys(features).length)
            E.set('features', features);
    };
    function enabled_cb(){
        var vpn_on, ext_enabled;
        if (E.get('ext.conflict'))
            vpn_on = ext_enabled = false;
        else
        {
            ext_enabled = E.get('state')=='on';
            vpn_on = ext_enabled && E.get('uuid') && E.get('session_key') &&
                !(conf.check_agree_ts && !get_bg_main().get('agree_ts'));
        }
        E.safe_set({'r.vpn.on': !!vpn_on, 'r.ext.enabled': !!ext_enabled});
    }
    E.on_init('change:session_key change:state change:ext.conflict '+
        'change:uuid', enabled_cb);
    get_bg_main().on('change:agree_ts', enabled_cb);
    var set_conf = function(){
        var conf;
        if (!(conf = E.get('bext_config')))
            return;
        var key = E.get('is_premium') ? 'prem' : 'free';
        set_gen_conf(conf, key);
    };
    E.on('change:bext_config', set_conf);
    E.on('change:is_premium', set_conf);
}

E.auth = function(o){
    var info = be_util.qs_ajax();
    if (get_bg_main().get('is_svc'))
        info.svc_ver = get_bg_main().get('svc.version');
    info.uuid = E.get('auth.id');
    info.session_key = E.get('auth.key')||0;
    return assign(info, o);
};

return E; });
