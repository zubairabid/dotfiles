// LICENSE_CODE ZON
'use strict'; 
define(['jquery', 'underscore', '/bext/pub/backbone.js', '/util/etask.js',
    '/bext/pub/browser.js', '/util/zerr.js', '/bext/pub/util.js',
    '/bext/pub/lib.js', '/bext/pub/version_util.js', '/util/escape.js',
    '/util/util.js', '/util/storage.js', '/bext/vpn/pub/util.js',
    '/util/date.js'],
    function($, _, be_backbone, etask, B, zerr, be_util, be_lib,
    be_version_util, zescape, zutil, storage, be_vpn_util, date){
B.assert_bg('be_ext');
var assign = Object.assign;
var be_bg_main = window.be_bg_main; 
var conf = window.conf;
var E = new (be_backbone.model.extend({
    _defaults: function(){
	this.on('destroy', function(){
	    B.backbone.server.stop('be_ext');
	    uninit();
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

E._set = function(key, val){
    return be_bg_main.set.apply(be_bg_main, arguments); };

function uninit(){
    if (!E.get('inited'))
	return;
    E.sp.return();
    E.stopListening();
}

var bb_keys = zutil.bool_lookup('uuid browser session_key enabled '
    +'cid plugin.version sync_uuid '
    +'plugin.running status.unblocker.effective_pac_url ext.slave '
    +'ext.conflict install_details proxy.effective.control_level '
    +'info agent_key');
function bg_main_to_ext_init(){
    var change = {};
    _.each(bb_keys, function(v, k){ change[k] = be_bg_main.get(k); });
    E.safe_set(change);
    change = {};
    function commit_change(){
        if (_.isEmpty(change))
            return;
        var t = change;
        change = {};
        E.safe_set(t);
    }
    be_bg_main.on('all', function(key){
        if (key=='change')
            return commit_change();
        if (!key.startsWith('change:'))
            return;
        key = key.substr(7); 
        if (!bb_keys[key])
            return;
        change[key] = be_bg_main.get(key);
    });
    E.on_init('change:enabled', function(){
        E.set('state', E.get('enabled') ? 'on' : 'off'); });
}

function perr_conflict(info){
    return void be_lib.perr_err({id: 'be_ext_conflict', info: info}); }

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
                perr_conflict({
                    proxy_level: E.get('proxy.effective.control_level'),
                    proxy_value: E.get('proxy.effective.value')});
                storage.set('last_conflict', 1);
            }
            else
            {
                be_lib.perr_err({id: 'be_ext_conflict_resolved', info: {
                    proxy_level: E.get('proxy.effective.control_level'),
                    proxy_value: E.get('proxy.effective.value')}});
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
            'name', 'is_trace_cb2_on', 'dbg_log_rate', 'is_etask_perf_on',
            'peer_fallback_min_ver', 'remote_trial_min_ver',
            'is_tunnel_error_on', 'is_reload_on_update_on', 'disable_order',
            'trial_agents_min_ver', 'disable_agent_req_err_check',
            'pool_agents_min_ver']);
        var browser = be_util.browser(), ver = be_util.version();
        if (gen.peer_fallback_min_ver)
        {
            if (be_version_util.cmp(gen.peer_fallback_min_ver, ver)<=0)
                gen.peer_fallback_on = 1;
            delete gen.peer_fallback_min_ver;
        }
        if (gen.hide_ip_on && (!['opera', 'chrome'].includes(browser) ||
            be_version_util.cmp(ver, '1.122.315')<0))
        {
            gen.hide_ip_on = 0;
        }
        if (gen.remote_trial_min_ver)
        {
            if (be_version_util.cmp(ver, gen.remote_trial_min_ver)>=0)
                gen.remote_trial = 1;
            delete gen.remote_trial_min_ver;
        }
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
        if (E.get('ext.slave') || E.get('ext.conflict'))
            vpn_on = ext_enabled = false;
        else
        {
            ext_enabled = E.get('state')=='on';
            vpn_on = ext_enabled && E.get('uuid') && E.get('session_key') &&
                !(conf.check_agree_ts && !be_bg_main.get('agree_ts'));
        }
        E.safe_set({'r.vpn.on': !!vpn_on, 'r.ext.enabled': !!ext_enabled});
    }
    E.on_init('change:session_key change:state change:ext.conflict '+
        'change:ext.slave change:uuid', enabled_cb);
    be_bg_main.on('change:agree_ts', enabled_cb);
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

E.set_enabled = function(on){
    try {
	on = !!on;
        be_bg_main.set_enabled(on);
	if (!!E.get('r.ext.enabled')!=on)
	{
	    var attributes = zutil.clone(E.attributes);
	    delete attributes['status.unblocker.effective_pac_url'];
	    be_lib.perr_err({id: 'be_set_enabled_mismatch',
		info: {on: on, attributes: attributes}});
	}
    } catch(e){
	be_lib.perr_err({id: 'be_set_enabled_err', err: e});
	throw e;
    }
};

E.qs_ver_str = function(){ return 'ver='+E.get('rmt_ver'); };

E.qs_ajax = function(o){
    var info = {rmt_ver: E.get('rmt_ver'), ext_ver: be_util.version(),
        browser: E.get('browser'), product: be_util.get_product(),
        lccgi: +!!window.is_local_ccgi};
    assign(info, o);
    for (var k in info)
    {
        if (info[k]===undefined)
            delete info[k];
    }
    return info;
};

E.auth = function(o){
    var info = E.qs_ajax();
    if (be_bg_main.get('is_svc')) 
        info.svc_ver = be_bg_main.get('svc.version');
    info.uuid = E.get('auth.id');
    info.session_key = E.get('auth.key')||0;
    return assign(info, o);
};

E.tpopup_perr = function(){
    return be_lib.perr.apply(be_lib, arguments);
};

return E; });
