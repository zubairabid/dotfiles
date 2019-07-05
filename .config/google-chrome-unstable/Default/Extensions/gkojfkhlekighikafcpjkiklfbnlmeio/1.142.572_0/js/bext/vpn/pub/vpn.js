// LICENSE_CODE ZON
'use strict'; 
define(['jquery', 'underscore', 'backbone', '/bext/pub/backbone.js',
    '/util/etask.js', '/util/string.js', '/bext/pub/ext.js',
    '/util/util.js',
    '/bext/pub/util.js', '/util/zerr.js', '/bext/vpn/pub/rule.js',
    '/bext/vpn/pub/info.js', '/bext/pub/browser.js', '/bext/vpn/pub/tabs.js',
    '/bext/pub/lib.js', '/svc/vpn/pub/util.js', '/bext/pub/version_util.js',
    '/bext/vpn/pub/tpopup.js', '/util/escape.js', '/util/url.js',
    '/bext/vpn/pub/tab_unblocker.js', '/bext/vpn/pub/bg_ajax.js',
    '/util/storage.js', '/bext/vpn/pub/util.js', '/util/date.js', 'be_ver',
    '/bext/vpn/pub/agent.js', '/bext/vpn/pub/svc.js', '/bext/vpn/pub/pac.js',
    '/bext/vpn/pub/mode.js', '/bext/vpn/pub/rules.js',
    '/bext/vpn/pub/tab_perr.js', '/bext/vpn/pub/iframe.js',
    'text!bext/vpn/pub/vstat.js', '/bext/vpn/pub/premium.js',
    '/bext/vpn/pub/force_lib.js', '/protocol/pub/countries.js',
    '/bext/vpn/pub/trial.js', '/bext/vpn/pub/mitm_lib.js'],
    function($, _, Backbone, be_backbone, etask, string, be_ext,
    zutil, be_util, zerr,
    be_rule, be_info, B, be_tabs, be_lib, svc_util, be_version_util, be_tpopup,
    zescape, zurl, be_tab_unblocker, be_bg_ajax, storage, be_vpn_util, date,
    be_ver, be_agent, be_svc, be_pac, be_mode, be_rules, be_tab_perr,
    be_iframe, vstat, be_premium, force_lib, pcountries, be_trial, mitm_lib){
B.assert_bg('be_vpn');
var chrome = window.chrome, conf = window.conf, assign = Object.assign;
var E = new (be_backbone.model.extend({
    tabs: {}, active_tab_id: 0, unblocked_urls: {}, history: {},
    _defaults: function(){
        this.on('destroy', function(){
            B.backbone.server.stop('be_vpn');
            uninit();
        });
        B.backbone.server.start(this, 'be_vpn');
    },
}))();

var active_tab_timer_ms = date.ms.HOUR;
E.be_tab_unblocker = be_tab_unblocker;

function uninit(){
    if (!E.get('inited'))
        return;
    E.sp.return();
    if (chrome && B.have['web_request.on_auth_required'])
        chrome.webRequest.onAuthRequired.removeListener(zagent_conn_lob_cb);
    clearTimeout(status_cb.timer);
    E.be_rule.off('change:status', status_cb);
    E.be_info.off('change:status', status_cb);
    be_tabs.off('change:active.id', tab_vpn_on_change_active);
    be_tabs.off('change:active.url', update_mitm_state);
    be_tabs.off('change:active.url', verify_first_run);
    be_tabs.off('change:active.url', post_install_blur);
    be_tabs.off('change:active.url', update_protect_state);
    be_tabs.off('created', tab_vpn_on_created);
    be_tabs.off('updated', tab_vpn_on_updated);
    be_tabs.off('committed', tab_vpn_on_comitted);
    be_tabs.off('removed', tab_vpn_on_removed);
    be_tabs.off('replaced', tab_vpn_on_replaced);
    be_tabs.off('error_occured', tab_vpn_on_error_occured);
    be_tab_unblocker.off('change:mitm_inited', on_mitm_inited);
    be_tab_unblocker.off('mitm_block', update_mitm_state);
    proxy_settings_monitor.uninit();
    monitor_active_uninit();
    E.be_tpopup._destroy();
    E.be_rule._destroy();
    E.be_tab_unblocker._destroy();
    E.be_tab_perr._destroy();
    E.be_agent._destroy();
    E.be_pac._destroy();
    E.be_svc._destroy();
    E.be_mode._destroy();
    E.be_info._destroy();
    E.be_rules._destroy();
}

var proxy_settings_monitor = {};
proxy_settings_monitor.init = function(){
    if (this.inited || !chrome || conf.firefox_web_ext)
        return;
    this.inited = true;
    B.proxy.settings.get({}, this.changed_cb);
    B.proxy.settings.on_change.add_listener(this.changed_cb);
};
proxy_settings_monitor.uninit = function(){
    if (this.inited)
        B.proxy.settings.on_change.del_listener(this.changed_cb);
};
proxy_settings_monitor.changed_cb = function(details){
    if (!details)
        return zerr('proxy_changed no details');
    var conflict = details.levelOfControl=='controlled_by_other_extensions';
    zerr[conflict ? 'err' : 'debug'](
        'proxy changed: %s control: %s',
        !details.value.pacScript || details.value.pacScript.url ?
        zerr.json(details.value) : 'pacScript-data', details.levelOfControl);
    be_ext._set({'proxy.effective.control_level': details.levelOfControl,
        'proxy.effective.value': details.value, 'ext.conflict': conflict});
};

E.init = function(rmt){
    if (this.get('inited'))
        return;
    E.sp = etask('be_vpn', [function(){ return this.wait(); }]);
    this.set('inited', true);
    this.on('recover', function(){
        if (E.get('need_recover'))
            return;
        E.set('need_recover', true);
        status_cb();
    });
    zerr.on_unhandled_exception = function(err){
        be_lib.perr_err({id: 'unhandled_exception', err: err}); };
    E.rmt = rmt;
    E.be_pac = be_pac;
    E.be_tab_perr = be_tab_perr;
    E.be_rule = be_rule;
    E.be_tpopup = be_tpopup;
    E.be_info = be_info;
    E.be_svc = be_svc;
    E.be_agent = be_agent;
    E.be_mode = be_mode;
    E.be_rules = be_rules;
    be_info.init(rmt, be_bg_ajax);
    be_svc.init(this);
    be_mode.init();
    be_pac.init();
    be_agent.init(this, be_premium);
    be_tab_unblocker.init();
    be_tab_perr.init(E);
    be_rules.init();
    be_rule.init(this);
    be_tpopup.init();
    proxy_settings_monitor.init();
    E.be_rule.on('change:status', status_cb);
    E.be_info.on('change:status', status_cb);
    be_tabs.on('change:active.id', tab_vpn_on_change_active);
    be_tabs.on('change:active.url', update_mitm_state);
    be_tabs.on('change:active.url', update_protect_state);
    be_tabs.on('created', tab_vpn_on_created);
    be_tabs.on('updated', tab_vpn_on_updated);
    be_tabs.on('committed', tab_vpn_on_comitted);
    be_tabs.on('removed', tab_vpn_on_removed);
    be_tabs.on('replaced', tab_vpn_on_replaced);
    be_tabs.on('error_occured', tab_vpn_on_error_occured);
    be_tab_unblocker.on('change:mitm_inited', on_mitm_inited);
    be_tab_unblocker.on('mitm_block', update_mitm_state);
    B.tabs.query({}, function(tabs){
        for (var i=0; i<tabs.length; i++)
            tab_vpn_on_created({tab: tabs[i]});
    });
    E.used_vpn = true;
    if (chrome && B.have['web_request.on_auth_required'])
    {
        chrome.webRequest.onAuthRequired.addListener(zagent_conn_lob_cb,
            {urls: ['<all_urls>']});
    }
    E.sp.spawn(etask({cancel: true}, [function(){
        return load_conf();
    }, function(){
        B.tabs.query({lastFocusedWindow: true, active: true}, function(tabs){
            first_run(tabs&&tabs[0]&&tabs[0].url); });
        return be_lib.storage_local_get('used_vpn');
    }, function(res){
        E.used_vpn = res.used_vpn;
    }]));
    E.sp.spawn(E.update_vpn_countries());
    bext_config_init();
    monitor_active_init();
    E.set('protected_ui_state', storage.get_json('protected_ui_state')||{});
};

function vstat_init(use_vstat){
    E.use_vstat = use_vstat;
    if (!E.use_vstat)
        return;
    B.be.ccgi.add_listener(msg_cb);
}

function vstat_uninit(){
    if (!E.use_vstat)
        return;
    B.be.ccgi.del_listener(msg_cb);
}

function on_vstat_conf(conf){
    conf = zutil.get(conf, 'vstat', {});
    var domains = {};
    for (var e in conf.domains)
    {
        var rule = conf.domains[e], res = _.omit(rule, 'url');
        if (rule.url)
        {
            res.url = (Array.isArray(rule.url) ? rule.url : [rule.url]).map(
                function(u){ return new RegExp('^'+zurl.http_glob_url(u)); });
        }
        domains[e] = res;
    }
    E.vstat = assign({domains: domains}, _.omit(conf, 'domains'));
    if (conf.enable!=E.use_vstat)
    {
        vstat_uninit();
        vstat_init(conf.enable);
    }
}

function ts_in_range(begin_ts, ts_ar, end_ts){
    return ts_ar.some(function(ts){
        return ts && begin_ts < ts && ts <= end_ts; });
}

function update(info, data, ts, pref, expire_ts){
    if (!info || !info.last_req_ts)
        return;
    ts[pref+'req_ts'] = Math.max(ts[pref+'req_ts'], info.last_req_ts);
    var to_remove = [];
    for (var host in info.agents)
    {
        if (info.agents[host]>expire_ts)
            data[pref+'agents'][host] = info.agents[host];
        else
            to_remove.push(host);
    }
    for (var i = 0; i<to_remove.length; i++)
        delete data[pref+'agents'][to_remove[i]];
}

function get_active_agents(agents, begin_ts, end_ts){
    var res = [];
    for (var host in agents)
    {
        if (ts_in_range(begin_ts, [agents[host]], end_ts))
            res.push(host);
    }
    return res;
}

var monitor_active = {};
function monitor_active_init(){
    var period = date.ms.HOUR, n = 0;
    E.sp.spawn(monitor_active.sp = etask({name: 'monitor_active',
        cancel: true}, [function loop()
    {
        n++;
        if (n<60)
            return etask.sleep(date.ms.MIN);
        n = 0;
        var data = storage.get_json('monitor_active')||{};
        var ts = Date.now(), end_ts = ts, begin_ts = end_ts-period;
        var active_ts_ar = [data.unblocker_tab_ts, data.ui_close_ts,
            data.ui_open_ts, data.req_ts, data.mitm_tab_ts, data.mitm_req_ts];
        if (ts_in_range(begin_ts, active_ts_ar, end_ts))
        {
            var agents = get_active_agents(data.agents, begin_ts, end_ts);
            var mitm_agents = get_active_agents(data.mitm_agents, begin_ts,
                end_ts);
            be_lib.perr_ok({id: 'be_active', info: {agents: agents,
                mitm_agents: mitm_agents, begin: begin_ts, end: end_ts,
                req_ts: data.req_ts, unblocker_tab_ts: data.unblocker_tab_ts,
                ui_close_ts: data.ui_close_ts, ui_open_ts: data.ui_open_ts,
                mitm_tab_ts: data.mitm_tab_ts,
                mitm_req_ts: data.mitm_req_ts}});
        }
        data.agents = {};
        data.mitm_agents = {};
        storage.set_json('monitor_active', data);
        return etask.sleep(date.ms.MIN);
    }, function(){
        var tabs = Object.keys(be_tabs.get_nav_tabs());
        if (!tabs.length)
            return this.goto('loop');
        var now = Date.now(), tu = be_tab_unblocker.tab_unblockers||{};
        var data = storage.get_json('monitor_active')||{};
        var expire_ts = now-period, ts = {req_ts: 0, mitm_req_ts: 0};
        data.agents = data.agents||{};
        data.mitm_agents = data.mitm_agents||{};
        tabs.forEach(function(id){
            var u;
            if ((u = tu[id]) && data.unblocker_tab_ts!=now)
                data.unblocker_tab_ts = now;
            update(u, data, ts, '', expire_ts);
            if (mitm_lib._is_mitm_active(id) && data.mitm_tab_ts!=now)
                data.mitm_tab_ts = now;
            update(mitm_lib.tab_get_req_info(id), data, ts, 'mitm_',
                expire_ts);
        });
        data.req_ts = ts.req_ts||undefined;
        data.mitm_req_ts = ts.mitm_req_ts||undefined;
        storage.set_json('monitor_active', data);
        return this.goto('loop');
    }, function finally$(){
        delete monitor_active.sp;
    }]));
}

function monitor_active_uninit(){
    if (monitor_active.sp)
        monitor_active.sp.return();
    monitor_active = {};
}

function set_bext_config(bext_config){
    if (!bext_config)
    {
        if (!(bext_config = storage.get_json('bext_config_last')))
            return;
    }
    else
        storage.set_json('bext_config_last', bext_config);
    var hola_conf = storage.get_json('hola_conf')||{};
    if (hola_conf)
        bext_config = zutil.extend_deep(bext_config, hola_conf);
    var protect_ui = bext_config.protect_ui2;
    if (protect_ui && (!protect_ui.min_version ||
        be_version_util.cmp(be_util.version(), protect_ui.min_version)>=0))
    {
        var protect_pc_min_ver = protect_ui.protect_pc_min_ver;
        E.set('protect_pc', be_util.os_win() &&
            (protect_ui.protect_pc || protect_pc_min_ver &&
            be_version_util.cmp(be_util.version(), protect_pc_min_ver)>=0));
        E.set('protect_browser', protect_ui.protect_browser);
        E.set('protect_tooltips', protect_ui.tooltips);
        update_protect_state();
    }
    force_lib.convert_blob2check(bext_config, 'force_premium');
    force_lib.convert_blob2check(bext_config, 'get_privacy');
    be_ext.set('bext_config', bext_config);
}

var config_update_sleep;
var config_stats = {n: 0, err: false, attempt: 0};
function bext_config_init(){
    E.listen_to(be_ext, 'change:bext_config', function(){
        var bext_conf = be_ext.get('bext_config');
        on_vstat_conf(bext_conf);
    });
    return etask({cancel: true, name: 'bext_config_init'},
    [function try_catch$loop(){
        config_update_sleep = null;
        return be_bg_ajax.ccgi_ajax({timeout: 20000, method: 'GET',
            url: conf.url_ccgi+'/bext_config.json?browser='+be_util.browser()+
            '&ver='+((window.RMT||{}).ver||be_util.version())});
    }, function(e){
        config_stats.n++;
        config_stats.attempt++;
        var pause = 2*date.ms.HOUR;
        var err = this.error || e&&e.err, err_info;
        if (err || !e)
        {
            if (config_stats.attempt==1)
                set_bext_config();
            err_info = (err ? err.hola_info : undefined) || {};
            be_lib.perr_err({id: 'be_bext_config_err', err: err,
                info: {n: config_stats.n, after_err: config_stats.err,
                status: err_info.status, exists: !!be_ext.get('bext_config'),
                attempt: config_stats.attempt,
                stamp: zutil.get(be_ext.get('bext_config'), 'stamp')}});
            pause = 5*date.ms.MIN;
        }
        else
        {
            be_lib.perr_ok({id: 'be_bext_config_success',
                info: {n: config_stats.n, after_err: config_stats.err,
                attempt: config_stats.attempt}});
            set_bext_config(e);
            config_stats.attempt = 0;
        }
        config_stats.err = !!err;
        this.set_state('loop');
        return config_update_sleep = etask.sleep(pause);
    }]);
}

E.update_vpn_countries = function(){
    return etask([function try_catch$(){
        return be_bg_ajax.ccgi_ajax({timeout: 20000, method: 'GET',
            url: conf.url_ccgi+'/vpn_countries.json?browser='+
            be_util.browser()+'&ver='+
            ((window.RMT||{}).ver||be_util.version())});
    }, function(res){
        if (this.error || !Array.isArray(res))
        {
            be_lib.perr_err({id: 'be_vpn_countries_err'});
            res = storage.get_json('vpn_countries')||[];
            be_ext.set('vpn_countries', res);
            return res;
        }
        be_lib.perr_ok({id: 'be_vpn_countries'});
        be_ext.set('vpn_countries', res);
        if (res.includes('uk'))
            res.push('gb');
        storage.set_json('vpn_countries', res);
        return res;
    }]);
};

E.force_bext_config_update = function(){
    if (!config_update_sleep)
        return;
    config_update_sleep.return();
};

function load_conf(){
    return etask({cancel: true, name: 'load_conf'}, [function try_catch$(){
        return be_bg_ajax.ccgi_ajax({timeout: 20000, method: 'POST',
            url: conf.url_ccgi+'/win_install_init.json'});
    }, function(e){
        if (this.error || e.err)
        {
            be_ext.set('install_conf', null);
            if (this.error)
                be_lib.perr_err({id: 'be_load_conf_err', err: this.error});
            return;
        }
        be_ext.set('install_conf', e);
    }]);
}

var first_run_timer;
function first_run(active){
    var details = be_ext.get('install_details');
    if (!details)
        return;
    be_ext._set('install_details', null);
    var install = details=='install';
    var inst_conf = be_ext.get('install_conf');
    var br = inst_conf && inst_conf.browser && inst_conf.browser.browser;
    var svc_install = inst_conf && inst_conf.name=='exe' && br &&
        br=='chrome'==!!chrome ||
        /^https?:\/\/hola\.org\/bext_install(\.html)?/.test(active) ||
        /^https?:\/\/hola\.org\/(login.*)?(browser_welcome|vpn_config)/
        .test(active);
    var ext_skip_first_run = inst_conf && inst_conf.item &&
        inst_conf.item.ext_skip_first_run;
    var skip_first_run = !!(conf.browser.torch || svc_install ||
        !install || ext_skip_first_run);
    if (skip_first_run)
    {
        be_lib.perr_ok({id: 'be_first_run_skip', info: {
            svc_install: svc_install, skip_first_run: skip_first_run,
            active: active, browser: conf.browser, details: details,
            ext_skip_first_run: ext_skip_first_run}});
        return;
    }
    be_lib.perr_ok({id: 'be_first_run', info: {
        svc_install: svc_install, skip_first_run: skip_first_run,
        active: active}});
    first_run_timer = setTimeout(function(){
        be_lib.perr_err({id: 'be_first_run_never'});
        first_run_stop();
    }, 5*date.ms.MIN);
    E.listenTo(be_mode, 'change:is_svc', first_run_cb);
    E.listen_to(be_ext, 'change:enabled', first_run_cb);
}
function first_run_stop(){
    E.stopListening(be_mode, 'change:is_svc', first_run_cb);
    E.stopListening(be_ext, 'change:enabled', first_run_cb);
    first_run_timer = clearTimeout(first_run_timer);
}

function first_run_cb(){
    if (!be_mode.get('is_svc') && !be_ext.get('enabled'))
        return;
    var be_bg_main = window.be_bg_main;
    if (!be_bg_main.get('agree_ts'))
        return;
    be_lib.perr_ok({id: 'be_first_run_open_tab'});
    first_run_stop();
    be_tabs.on('change:active.url', verify_first_run);
    be_util.open_hola_tab({url: get_post_instll_url(), force_active: true});
}

function get_post_instll_url(){
    return zescape.uri('https://hola.org/unblock/install',
        assign({ext_ver: be_util.version(),
        uuid: window.be_bg_main.get('uuid')}, be_ext.auth()));
}

function zagent_conn_lob_cb(details){
    if (details.isProxy && details.realm=='Hola Unblocker')
    {
        var conn_log = E.get('zagent_conn_log')||[];
        conn_log.push({host: details.challenger.host,
            port: details.challenger.port, ts: Date.now()});
        if (conn_log.length>5)
            conn_log.shift();
        E.set('zagent_conn_log', conn_log);
    }
    return {};
}

E.enable = function(reload){};

function status_cb(){
    var script = E.be_rule.get('status');
    var info = E.be_info.get('status');
    var status = [script, info];
    if (status.includes('error'))
        E.set('status', 'error');
    else if (status.includes('busy'))
        E.set('status', 'busy');
    else
    {
        E.set('status', 'ready');
        tabs_update();
    }
    if (status.includes('busy') || !E.get('need_recover'))
        return;
    if (E.get('status')=='ready')
        return E.set('need_recover', false);
    clearTimeout(status_cb.timer);
    status_cb.timer = setTimeout(function(){
        zerr.notice('be_vpn try recover');
        E.set('need_recover', false);
        if (E.be_rule.get('status')=='error')
            E.be_rule.recover();
        if (E.be_info.get('status')=='error')
            E.be_info.recover();
    });
}

function active_stop_measure(tab){
    if (!tab.active_ts)
        return;
    tab.active_time += Date.now()-tab.active_ts;
    tab.active_ts = 0;
    active_timer_clr(tab);
}

function active_reset(tab){
    active_stop_measure(tab);
    tab.active_time = 0;
}

function active_start_measure(tab){
    if (tab.active_ts)
        return;
    tab.active_ts = Date.now();
    active_timer_add(tab, active_tab_timer_ms);
}

function active_timer_clr(tab){
    if (!tab.active_timer)
        return;
    tab.active_timer = clearTimeout(tab.active_timer);
}

function active_timer_add(tab, ms){
    active_timer_clr(tab);
    tab.active_timer = setTimeout(function(){
        tab.active_timer = null;
        total_active_report(tab);
    }, ms);
}

function total_active_report(tab){
    active_stop_measure(tab);
    if (tab.active_reported)
        return;
    tab.active_reported = true;
    var rule;
    var loc_country = (zutil.get(be_info.get('location'), 'country')||'')
    .toLowerCase();
    if (rule = tab.rule)
    {
        var first_per_time =
            Date.now()-(E.unblocked_urls[tab.root_url]||0)>24*3600000;
        var stats = assign(_.pick(rule, 'name', 'type', 'md5'),
            {proxy_country: (rule.country||'').toLowerCase()});
        be_lib.stats('be_vpn_total_active_time', JSON.stringify(
            assign(stats, {root_url: tab.root_url, src_country: loc_country,
            total_active_time: tab.active_time/1000,
            first_per_time: first_per_time})));
        if (first_per_time)
            E.unblocked_urls[tab.root_url] = Date.now();
        return;
    }
    if (!tab.root_url || tab.had_rule || Math.random()*50>=1)
        return;
    be_lib.stats('be_total_active_time', JSON.stringify(
        {root_url: tab.root_url, src_country: loc_country,
        total_active_time: tab.active_time/1000}));
}

function vpn_first_use_report(tab){
    if (!tab.rule || E.used_vpn)
        return;
    be_lib.stats('be_vpn_first_use');
    be_lib.storage_local_set({used_vpn: true});
    E.used_vpn = true;
}

function tab_vpn_add(tab, rule){
    tab.had_rule = true;
    tab.rule = zutil.clone(rule);
    active_reset(tab);
    if (E.active_tab_id==tab.id)
        active_start_measure(tab);
    vpn_first_use_report(tab);
    set_privacy_conf(true);
}

function tab_add(tabid, url){
    var tab = E.tabs[tabid];
    var rule = E.rule_get(url);
    if (tab)
        return;
    zerr.debug('tab:%d add url %s root %s', tabid, url.slice(0, 200),
        svc_util.get_root_url(url));
    tab = {url: url, root_url: svc_util.get_root_url(url),
        active: 0, active_time: 0, rule: rule, id: tabid};
    E.tabs[tabid] = tab;
    if (E.active_tab_id==tabid)
        active_start_measure(tab);
    if (rule)
        tab_vpn_add(tab, rule);
}

function tab_vpn_del(tab){
    if (!tab.rule)
        return;
    total_active_report(tab);
    tab.rule = null;
    set_privacy_conf();
}

function tab_del(tabid){
    var tab = E.tabs[tabid];
    if (!tab)
        return;
    total_active_report(tab);
    tab_vpn_del(tab);
    delete E.tabs[tabid];
}

function tab_update(tab){
    var rule = E.rule_get(tab.url);
    zerr.debug('tab:%d update url %s is_vpn %O', tab.id, tab.root_url, !!rule);
    if (rule && !tab.rule)
        tab_vpn_add(tab, rule);
    else if (!rule && tab.rule)
        tab_vpn_del(tab);
}

function tabs_update(){
    for (var tab in E.tabs)
        tab_update(E.tabs[tab]);
}

E.rule_get = function(url){
    var rule;
    if (!be_ext.get('r.vpn.on'))
        return null;
    if ((rule = be_rule.get_rules(url)[0]) && rule.enabled)
        return rule;
    return null;
};

var MAX_HISTORY = 5;
function tab_history_update(id, url, del){
    var tab = E.history[id];
    if (!tab)
    {
        if (del)
            return;
        tab = E.history[id] = {history: []};
    }
    else if (del)
        return void delete E.history[id];
    var host = zurl.get_host(url);
    if (!host)
        return;
    if (tab.history.length && host==tab.history[0])
        return;
    tab.history.unshift(host);
    if (tab.history.length>MAX_HISTORY)
        tab.history.pop();
}

E.tab_history_get = function(id){
    if (!(id = id||be_tabs.get('active.id')))
        return;
    var t = E.history[id];
    if (!t)
        return;
    return t.history;
};

function tab_vpn_on_created(o){
    var tab = o.tab;
    if (!tab.url)
        return;
    tab_history_update(tab.id, tab.url);
    tab_add(tab.id, tab.url);
}

function to_form_data(o){
    var data = new FormData();
    for (var k in o)
        data.append(k, o[k]);
    return data;
}

function send_beacon(url, data){
    data.send_type = 'POST';
    var req = new XMLHttpRequest();
    req.open('POST', url);
    req.send(to_form_data(data));
}

function msg_cb(msg, resp_cb, sender){
    var id = msg.id;
    if (msg._type!='be_vstat')
        return;
    var tab_id = sender&&sender.tab&&sender.tab.id;
    if (!be_ext.get('is_premium') && tab_id)
    {
        var utab = be_tab_unblocker.tab_unblockers[tab_id];
        if (utab&&utab.force_premium)
            return;
        var tab = E.tabs[tab_id];
        var root_url = tab.root_url||svc_util.get_root_url(sender.tab.url);
        if (be_premium.get_force_premium_rule(root_url))
            return;
    }
    id = id.replace(/^vstat\./, '');
    switch (id)
    {
    case 'send_beacon':
        if (msg.data)
            msg.data.build = be_util.build();
        send_beacon(E.vstat.url||msg.url, msg.data);
        break;
    case 'send_event':
        zerr.notice('tab:%d video event %O', tab_id, zutil.omit(msg.data,
            ['customer', 'country']));
        be_lib.perr_ok({id: 'be_vstat_event', info:
            {data: msg.data, hola_uid: be_ext.get('hola_uid')},
            rate_limit: {count: 250}});
        break;
    case 'send_progress':
        be_tab_unblocker.trigger('video_progress', assign({tab_id: tab_id},
            msg));
        break;
    default: zerr('unknown be_mp message '+zerr.json(msg));
    }
}

function vstat_inject_init(id, root_url){
    var info, tab = E.tabs[id];
    if (!tab || tab.vstat_inited || !tab.rule || !E.vstat)
        return;
    root_url = root_url||tab.root_url;
    if (!(info = (E.vstat.domains||{})[root_url]))
        return;
    var utab = be_tab_unblocker.tab_unblockers[id];
    if (!be_ext.get('is_premium') && (utab&&utab.force_premium ||
        be_premium.get_force_premium_rule(root_url)))
    {
        return;
    }
    var tab_url;
    if (info.url && !((tab_url = be_tabs.get_url(id)) &&
        info.url.some(function(re){ return re.test(tab_url); })))
    {
        return;
    }
    var prefix = '';
    if (info && info.customer)
    {
        var opt = {customer: info.customer, debug: info.debug,
            ver: (window.RMT||{}).ver||be_util.version(), tab_id: id,
            country: tab.rule.country, debug_progress: info.debug_progress};
        if (info.report)
            opt.report = info.report;
        prefix = 'window.hola_vstat_conf = '+JSON.stringify(opt)+';\n';
    }
    var details = {};
    if (!chrome)
        details.ccgi = true;
    E.sp.spawn(etask({cancel: true}, [function(){
        return be_iframe.inject(id, prefix+vstat,
            {no_func_wrap: true, func_is_str: true}, details);
    }, function catch$(err){
        be_lib.perr_err({id: 'vstat_inject_failed', info: err});
    }]));
    tab.vstat_inited = true;
}

function tab_vpn_on_comitted(o){
    if (!E.use_vstat)
        return;
    var id = o.id, info = o.info;
    vstat_inject_init(id, svc_util.get_root_url(info.url));
}

function set_privacy_conf(enabled){
    set_privacy_conf.n = (set_privacy_conf.n||0)+(enabled ? 1 : -1);
    if (set_privacy_conf.n<0)
        set_privacy_conf.n = 0;
    if (!chrome || !be_ext.get('gen.hide_ip_on') ||
        !zutil.get(chrome, 'privacy.network.webRTCIPHandlingPolicy'))
    {
        return;
    }
    var value = set_privacy_conf.n ? 'disable_non_proxied_udp' : 'default';
    if (set_privacy_conf.value!=value)
    {
        set_privacy_conf.value = value;
        chrome.privacy.network.webRTCIPHandlingPolicy.set({value: value,
            scope: chrome.extension.inIncognitoContext ?
            'incognito_session_only' : 'regular'}, function(){});
    }
}

function tab_vpn_on_updated(o){
    var id = o.id, info = o.info;
    var tab = E.tabs[id];
    if (tab)
        delete tab.vstat_inited;
    if (!info || !info.url)
        return;
    tab_history_update(id, info.url);
    var root_url = svc_util.get_root_url(info.url);
    if (tab && tab.root_url==root_url)
    {
        tab.url = info.url;
        if (E.use_vstat)
            vstat_inject_init(id, svc_util.get_root_url(info.url));
        return;
    }
    if (tab)
        tab_del(id);
    tab_add(id, info.url);
    if (E.use_vstat)
        vstat_inject_init(id, svc_util.get_root_url(info.url));
}

function tab_vpn_on_removed(tab){
    tab_history_update(tab.id, null, true);
    tab_del(tab.id);
}

function tab_vpn_on_replaced(o){
    var added = o.added, removed = o.removed;
    tab_history_update(removed, null, true);
    tab_vpn_del(removed);
    B.tabs.get(added, function(tab){
        if (!tab || !tab.url)
            return;
        tab_history_update(added, tab.url);
        var root_url = svc_util.get_root_url(tab.url);
        if (!root_url)
            return;
        tab_add(added, tab.url);
    });
}

function tab_vpn_on_change_active(){
    var id = be_tabs.get('active.id');
    update_mitm_state();
    if (!id)
        return;
    var tab = E.active_tab_id ? E.tabs[E.active_tab_id] : null;
    if (tab)
        active_stop_measure(tab);
    E.active_tab_id = id;
    if (tab = E.tabs[id])
        active_start_measure(tab);
}

function tab_vpn_on_error_occured(o){
    var info = o.info||{};
    if (info.http_status_code!=0)
        return;
    var last = tab_vpn_on_error_occured.info||{};
    if (last.error==info.error && last.url==info.url && last.tabId==info.tabId)
        return;
    tab_vpn_on_error_occured.info = info;
    var domain = zurl.get_host(''+info.url);
    if (!zurl.is_valid_domain(domain))
        return;
    var rule, perr_info = {domain: domain, err: info.error||''};
    if (!(rule = E.rule_get(info.url)) || info.error=='net::ERR_ABORTED')
        return;
    zerr.debug('tab:%d tab_vpn_on_error_occured rule %s error %s url %s',
        info.tabId, rule.name||'undefined', info.error, info.url);
    perr_info.proxy_country = rule.country;
    be_lib.perr(zerr.L.INFO, {id: 'be_dns_mistake', info: perr_info,
        rate_limit: {count: 5}});
}

E.script_set = function(rule, val){
    zerr.debug('set rule %s %d %s', rule.name, +val.enabled, val.root_url);
    return etask({name: 'script_set', cancel: true}, [function(){
        return be_ext.set_enabled(true);
    }, function(){
        if (!be_ext.get('r.vpn.on'))
            return E.enable();
    }, function(){
        if (val.enabled && be_trial.need_trial(val.root_url))
        {
            be_info.set_site_storage(val.root_url, 'force_trial',
                {country: val.src=='ui' ? null : val.country||rule.country});
            return this.return();
        }
        if (rule && +val.enabled && rule.enabled && val.src=='trial' &&
            rule.src==val.src && (!val.country || rule.country==val.country))
        {
            return this.return();
        }
        var new_rule = {name: val.host || val.name || rule.name,
            enabled: +val.enabled, country: val.country||rule.country,
            type: rule.type, root_url: val.host || val.root_url,
            mode: val.mode, md5: rule.md5};
        if (val.src)
            new_rule.src = val.src;
        be_rule.trigger('set_rule', new_rule);
        E.once('change:status', function(){ this.continue(); }.bind(this));
        return this.wait(15*date.ms.SEC);
    }]);
};

E.enable_root_url = function(opt){
    var root_url = opt.root_url, rule_ratings, rule, enabled = true;
    var host = zurl.get_host('http://'+root_url+'/');
    return etask({name: 'enable_root_url', cancel: true}, [function(){
        if (!opt.no_tpopup)
            be_info.set_force_tpopup(root_url);
        if (opt.rule)
        {
            if (opt.rule.name)
            {
                rule = opt.rule;
                if (rule.enabled!==undefined)
                    enabled = rule.enabled;
                return this.goto('set');
            }
            be_lib.perr_err({id: 'be_enable_root_url_invalid_rule',
                info: assign(opt, {hola_uid: be_ext.get('hola_uid')})});
        }
        return be_rule.get_rule_ratings({root_url: root_url,
            src_country: be_info.get('country'), limit: 20,
            proxy_country: opt.country, vpn_only: true});
    }, function(_rule_ratings){
        if (!_rule_ratings)
            return;
        rule_ratings = _rule_ratings.filter(function(r){
            var country = r.proxy_country.toUpperCase();
            return pcountries.proxy_countries.bext.includes(country);
        });
        return be_rule.get_groups_from_ratings(rule_ratings);
    }, function(groups){
        var popular = be_vpn_util.get_popular_country({host: host,
            rule_ratings: rule_ratings});
        var proxy_country =
            (opt.country||popular[0].proxy_country||'').toLowerCase();
        var url = 'http://'+root_url+'/';
        var rules = be_rule.get('rules');
        var all_rules = be_vpn_util.get_all_rules({
            proxy_country: proxy_country, rules: rules, url: url,
            root_url: root_url, rule_ratings: rule_ratings, groups: groups});
        rule = all_rules[0];
    }, function set(){
        if (E.is_enabled_for_pc())
            return E.set_enabled_for_pc(enabled, {country: rule.country});
        if (E.is_enabled_for_browser())
            return E.set_enabled_for_browser(enabled, {country: rule.country});
        return E.script_set(rule, {enabled: enabled, root_url: root_url,
            src: opt.src});
    }, function(){
        be_lib.perr_ok({id: 'be_enable_root_url', info:
            {name: rule.name, root_url: root_url, country: rule.country,
            src_country: (be_info.get('country')||'').toLowerCase(),
            hola_uid: be_ext.get('hola_uid')}});
        return rule;
    }]);
};

E.tpopup_is_connected = function(id, tpopup_type){
    if (!E.be_tpopup)
        return;
    return E.be_tpopup.is_connected(id, tpopup_type);
};

E.check_permission = function(name){
    if (!chrome || !chrome.permissions)
        return;
    return etask({name: 'check_permission', cancel: true}, [function(){
        var et = this.wait(), _this = this;
        chrome.permissions.contains({permissions: [name],
            origins: ['<all_urls>']}, function(res){ _this.continue(res); });
        return et;
    }, function catch$(e){
        be_lib.perr_err({id: 'check_permission_failed', info: e});
    }]);
};

E.grant_permission = function(name){
    if (!chrome || !chrome.permissions)
        return;
    return etask({name: 'grant_permission', cancel: true}, [function(){
        var et = this.wait(), _this = this;
        chrome.permissions.request({permissions: [name],
            origins: ['<all_urls>']}, function(res){ _this.continue(res); });
        return et;
    }, function catch$(e){
        be_lib.perr_err({id: 'grant_permission_failed', info: e});
    }]);
};

var first_run_regex = /\/unblock\/popular\/.*first_run=1/;
function verify_first_run(){
    try {
        var url = be_tabs.get('active.url');
        if (!first_run_regex.test(url))
            return;
        be_lib.perr_ok({id: 'be_first_run_tab_active'});
        be_tabs.off('change:active.url', verify_first_run);
        setTimeout(function(){
            be_tabs.on('change:active.url', post_install_blur); });
    } catch(e){ zerr('verify_first_run errors %s', e); }
}

function post_install_blur(){
    var url = be_tabs.get('active.url');
    if (first_run_regex.test(url))
        return;
    be_tabs.off('change:active.url', post_install_blur);
    be_lib.perr_ok({id: 'be_first_run_tab_blur'});
}

function on_mitm_inited(){
    var mitm = be_tab_unblocker.mitm;
    E.set('mitm_ext_ui_enabled', mitm && mitm.is_ext_ui_enabled());
}

function update_mitm_state(){
    E.set('mitm_site', E.is_mitm_site());
    E.set('mitm_active_manual', E.is_mitm_active_manual(be_tabs.get(
        'active.id')));
}

E.is_mitm_site = function(url){
    url = url || be_tabs.get('active.url');
    var mitm = be_tab_unblocker.mitm;
    return url && mitm && mitm.should_unblock(url);
};

E.is_mitm_active = function(tab_id){
    var mitm = be_tab_unblocker.mitm;
    return mitm && !!mitm._is_mitm_active(tab_id);
};

E.is_mitm_active_manual = function(tab_id){
    var mitm = be_tab_unblocker.mitm;
    var type = mitm && mitm._is_mitm_active(tab_id);
    return type=='manual'||type=='user_choice';
};

E.mitm_set_unblock = function(url, until){
    if (!be_ext.get('is_premium') && be_premium.get_force_premium_rule(url))
        return;
    zerr.notice('mitm set unblock '+url);
    be_tab_unblocker.mitm.user_set_unblock(url, until);
    update_mitm_state();
};

E.mitm_set_ignore = function(url, tab_id, until){
    zerr.notice('mitm set ignore '+url);
    be_tab_unblocker.mitm.set_ignore(url, until);
    if (tab_id)
        B.tabs.reload(tab_id);
    update_mitm_state();
};

E.stop_vpn = function(url, tab_id){
    zerr.notice('stop vpn '+url);
    if (E.is_mitm_active(tab_id))
        return void E.mitm_set_ignore(url, tab_id);
    var rule = E.rule_get(url);
    if (!rule)
        return;
    be_rule.trigger('set_rule', {
        name: rule.name,
        root_url: svc_util.get_root_url(url),
        enabled: 0,
        country: rule.country,
        type: rule.type,
        tab_id: tab_id,
    });
};

E.enable_geo_rule = function(url, country, tab_id, src){
    zerr.notice('enable_geo_rule '+url);
    var rules = be_vpn_util.get_rules(E.be_rule.get('rules'), url);
    return etask([function(){
        return E.enable_root_url({root_url: svc_util.get_root_url(url),
            country: country, no_tpopup: true, src: src});
    }, function(){
        var rule;
        if (!tab_id || (rule = rules && rules[0]) &&
            rule.enabled && src=='trial' && rule.src==src && (!country ||
            rule.country==country))
        {
            return;
        }
        var site, redirect;
        if (src=='trial' && (site = E.get_site_conf(url)))
            redirect = zutil.get(site, 'trial.trial_redirect');
        be_tabs.reload(tab_id, redirect);
    }]);
};

E.mitm_manual_unblock = function(url, tab_id, until, no_reload){
    if (!be_ext.get('is_premium') && be_premium.get_force_premium_rule(url))
        return;
    zerr.notice('mitm set rule '+url);
    var need_reload = !no_reload && !E.is_mitm_active(tab_id);
    be_tab_unblocker.mitm.set_manual_tab(tab_id, url, until);
    if (need_reload)
        be_tabs.reload(tab_id);
    update_mitm_state();
    E.trigger('mitm_manual_unblock');
};

E.mitm_manual_stop = function(url, tab_id, no_reload){
    zerr.notice('mitm manual stop '+url);
    be_tab_unblocker.mitm.set_ignore(url, null, 'manual');
    if (!no_reload)
        B.tabs.reload(tab_id);
    update_mitm_state();
};

E.get_mitm_unblock_rules = function(){
    var mitm = E.be_tab_unblocker.mitm;
    return mitm ? mitm.get_unblock_rules() : [];
};

E.mitm_need_popup = function(url){ return be_tpopup.need_mitm_popup(url); };

E.get_site_conf = function(url){
    var root_url = svc_util.get_root_url(url);
    return be_util.get_site_conf(be_ext, root_url);
};

E.do_tpopup = function(tab_id){ be_tpopup.do_tpopup(E.tabs[tab_id]); };

E.set_url_protected = function(root_url, active){
    var state = E.get('protected_ui_state')||{};
    state[root_url] = active;
    E.set('protected_ui_state', state);
    storage.set_json('protected_ui_state', state);
    if (!active)
        E.set_default_protect(root_url, false);
};

E.set_default_protect = function(root_url, val){
    var state = E.get('protected_ui_state')||{};
    state.default = state.default || {};
    state.default[root_url] = val;
    E.set('protected_ui_state', state);
    storage.set_json('protected_ui_state', state);
    update_protect_state();
};

function update_protect_state(){
    if (!be_ext.get('is_premium'))
        return E.set('default_protect_ui', false);
    var state = E.get('protected_ui_state')||{};
    var defs = state.default || {};
    var res = false;
    if (E.is_enabled_for_pc())
        res = defs.protect_pc;
    else if (E.is_enabled_for_browser())
        res = defs.protect_browser;
    else
    {
        var root_url = svc_util.get_root_url(be_tabs.get('active.url'));
        res = defs[root_url];
    }
    E.set('default_protect_ui', res);
}

E.is_enabled_for_pc = function(){
    return !!(E.get('protect_pc') && E.be_svc.get('vpn_country'));
};

E.set_enabled_for_pc = function(enable, opt){
    E.set_default_protect('protect_pc', enable && opt && opt.default_protect);
    if (!E.get('protect_pc'))
        return;
    be_lib.perr_ok({id: 'be_ui_vpn_protect_pc', info: {enable: enable}});
    if (enable)
        return E.be_svc.vpn_connect(opt);
    return E.be_svc.vpn_disconnect(opt);
};

function get_all_browser_rule(){
    var rules = be_vpn_util.get_rules(E.be_rule.get('rules'));
    if (!be_ext.get('r.vpn.on'))
        return false;
    return be_vpn_util.is_all_browser(rules[0]) && rules[0];
}

E.is_enabled_for_browser = function(){
    if (!E.get('protect_browser'))
        return false;
    if (E.is_enabled_for_pc())
        return true;
    return !!get_all_browser_rule();
};

E.set_enabled_for_browser = function(enable, opt){
    E.set_default_protect('protect_browser', enable && opt &&
        opt.default_protect);
    if (!E.get('protect_browser'))
        return;
    be_lib.perr_ok({id: 'be_ui_vpn_protect_browser',
        info: {enable: enable}});
    var rule;
    if (!enable)
    {
        if (E.is_enabled_for_pc())
            E.set_enabled_for_pc(false);
        if (rule = get_all_browser_rule())
            return E.script_set(rule, {enabled: false});
        return;
    }
    return E.script_set({country: opt.country, type: 'url'},
        {enabled: true, host: 'all_browser', mode: 'protect'});
};

return E; });
