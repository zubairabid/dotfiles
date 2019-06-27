// LICENSE_CODE ZON
'use strict'; 
define(['jquery', 'underscore', 'backbone', '/bext/pub/backbone.js',
    '/util/etask.js', '/bext/pub/ext.js', '/bext/pub/util.js',
    '/util/zerr.js', '/bext/pub/browser.js', '/bext/vpn/pub/util.js',
    '/bext/pub/lib.js', '/bext/vpn/pub/tab_unblocker.js', '/util/url.js',
    '/util/escape.js', '/bext/vpn/pub/ajax.js', '/util/array.js',
    '/svc/vpn/pub/util.js', '/bext/vpn/pub/agent.js', '/bext/vpn/pub/mode.js',
    '/util/storage.js', '/bext/vpn/pub/rules.js', '/bext/vpn/pub/tabs.js',
    '/util/date.js', '/util/util.js', '/bext/vpn/pub/info.js',
    '/bext/vpn/pub/trial.js'],
    function($, _, Backbone, be_backbone, etask, be_ext, be_util, zerr, B,
    be_vpn_util, be_lib, be_tab_unblocker, zurl, zescape, ajax,
    array, svc_util, be_agent, be_mode, storage, be_rules, be_tabs, date,
    zutil, be_info, be_trial){
var be_bg = window.be_bg||{};
var SEC = date.ms.SEC;
B.assert_bg('be_rule');
var chrome = window.chrome, conf = window.conf, assign = Object.assign;
var tab_state = {};
var E = new (be_backbone.task_model.extend({
    rules: undefined,
    _defaults: function(){
        this.on('destroy', function(){
            B.backbone.server.stop('be_rule');
            uninit();
        });
        B.backbone.server.start(this, 'be_rule');
    },
}))();
be_tab_unblocker.be_rule = E;

E.tasks = [];

E.task_cancel_all = function(){
    _.forEach(E.tasks, function(task){ task.return(); }); };
E.task_insert = function(task){ E.tasks.push(task); };
E.task_remove = function(task){ array.rm_elm(E.tasks, task); };

function uninit(){
    if (!E.get('inited'))
        return;
    E.sp.return();
    E.off();
    E.stopListening();
    E.task_cancel_all();
    E.rules = undefined;
}

function on_agent_state(e){
    var r;
    if (!e.rule || !E.rules || e.curr==e.prev || !E.rules.unblocker_rules ||
        !(r = svc_util.find_rule(E.rules.unblocker_rules, e.rule)))
    {
        return;
    }
    if (e.curr=='peer' && !r.force_peer || e.curr!='peer' && r.force_peer)
    {
        be_lib.perr_ok({id: 'be_rule_force_peer', info: {on: !r.force_peer},
            rate_limit: {count: 2}});
        E.set_rule_val(r, 'force_peer', !r.force_peer);
    }
}

E.init = function(be_vpn){
    if (E.get('inited'))
        return;
    E.be_vpn = be_vpn;
    E.set('inited', true);
    E.sp = etask('be_rule', [function(){ return this.wait(); }]);
    E.agent_auth_listener_add();
    E.on('recover', function(){ E.trigger('fetch_rules'); });
    E.listen_to(be_ext, 'change:r.vpn.on change:r.ext.enabled '+
        'change:auth.stamp',
        _.debounce(function(){ E.trigger('fetch_rules'); }));
    be_agent.on('agent_state', on_agent_state);
    E.listenTo(be_tabs, 'completed error_occured', function(info){
        if (!info || !info.tabId)
            return;
        var fix_task = fix_tasks[info.tabId];
        if (!fix_task)
            return;
        if (!fix_task.fix_waiting)
            return;
        fix_task.continue();
    });
    be_rules.on('local_rules_set', function(){ E.trigger('fetch_rules'); });
};

E.get_rules = function(url, ignore){
    return be_vpn_util.get_rules(E.rules, url, ignore); };

E.get_rule_ratings = function(args){
    return ajax.json({slow: 2*SEC,
        url: conf.url_ccgi+'/rule_ratings', data: be_ext.qs_ajax(args),
        perr: function(opt){ return be_lib.perr_err(opt); }});
};

E.get_groups_from_ratings = function(ratings){
    return etask({name: 'get_groups_from_ratings', cancel: true}, [function(){
        var groups = [];
        ratings.forEach(function(cr){
            cr.rules.forEach(function(r){
                if (r.rating<=0)
                    return;
                groups.push(_.pick(r, 'name', 'type', 'md5', 'country'));
            });
        });
        if (!groups.length)
            return;
        return be_rules.get_groups(groups);
    }, function(groups){
        if (!groups || !groups.unblocker_rules)
            return groups;
        _.forEach(groups.unblocker_rules, function(r){ delete r.enabled; });
        return groups;
    }]);
};

function _fetch_rules_rmt(){
    E.task_cancel_all();
    E.fetch_once = true;
    return etask([function(){
        zerr.notice('be_rule: fetch_rules');
        if (!be_ext.get('r.ext.enabled'))
        {
            E.rules = undefined;
            return this.goto('done');
        }
    }, function(){
        var opt = {url: conf.url_ccgi+'/rules_get_vpn.json', qs: be_ext.auth(),
            data: {}, retry: 1};
        return ajax.json(opt);
    }, function(rules){
        be_rules.set_rules(rules);
        E.rules = be_rules.get_rules();
        E.set('rules', E.rules);
    }, function done(){
        return be_tab_unblocker.update_rule_urls(E.rules);
    }, function(){ E.set('stamp', E.rules ? E.rules.stamp : 0);
    }]);
}

E.fetch_rules = function(){
    var rules;
    if (!(rules = be_rules.get_rules()))
        return _fetch_rules_rmt();
    zerr.notice('be_rule: fetch_rules local');
    if (!E.fetch_once)
        _fetch_rules_rmt(); 
    if (!be_ext.get('r.ext.enabled'))
        E.rules = undefined;
    else
    {
        E.rules = rules;
        E.set('rules', E.rules);
    }
    return etask([function(){
        return be_tab_unblocker.update_rule_urls(E.rules);
    }, function(){ E.set('stamp', E.rules ? E.rules.stamp : 0);
    }]);
};

E.on('fetch_rules', function(){
    if (!E.get('inited'))
        return;
    E.task_cancel_all();
    if (!E.set_busy({desc: 'Changing country...'}))
        return E.schedule_clr(['fetch_rules']);
    var auth = be_ext.auth();
    if (!auth.uuid || !auth.session_key)
        return E.clr_busy();
    E.sp.spawn(etask({name: 'fetch_rules', cancel: true}, [function(){
        return E.fetch_rules();
    }, function(){ E.clr_busy();
    }, function catch$(err){
        E.set_err();
        be_lib.err('be_script_fetch_rules_err', '', err);
    }]));
});

E.set_rule_val = function(rule, key, val){
    be_rules.set_rule_val(rule, key, val);
    be_tab_unblocker.set_rule_val(rule, key, val);
    E.rules = be_rules.get_rules();
    E.set('rules', E.rules);
};

E.set_rule = function(opt, update){
    if (opt)
    {
        if (be_trial.get_trial_active(opt.name))
            opt.src = 'trial';
        if (be_agent.is_pool_rule(opt))
            opt.force_pool = true;
        be_rules.set_rule(opt);
        this.trigger('rule_set', opt);
    }
    if (update)
    {
        E.rules = be_rules.get_rules();
        E.set('rules', E.rules);
    }
};

E.is_trial_rule = function(rule){ return rule && rule.src=='trial'; };

E.get_tab_unblockers = function(){ return be_tab_unblocker.tab_unblockers; };

function set_tab_state(tab_id, state){
    if (!tab_id || tab_id==-1)
        return;
    var s = tab_state[tab_id] = tab_state[tab_id]||{};
    if (s.state==state)
        return;
    var prev = s.state||'idle';
    s.state = state;
    E.trigger('set_tab_state', {tab_id: tab_id, prev: prev, curr: s.state});
}

E.get_tab_state = function(tab_id){
    if (tab_id===undefined)
        tab_id = be_tabs.get('active.id');
    return (tab_state[tab_id]||{}).state||'idle';
};

E.on('set_rule', function(opt){
    if (!E.get('inited'))
        throw new Error('set_rule failed, be_rule not inited');
    opt = assign({}, opt);
    E.task_cancel_all();
    be_tabs.set_last_rule(opt.tab_id, opt);
    set_tab_state(opt.tab_id, opt.enabled ? 'enable_rule' : 'disable_rule');
    if (!E.set_busy({desc: opt.enabled ? 'Finding peers...' :
        'Stopping peer routing...'}))
    {
        return E.schedule(['set_rule', opt]);
    }
    E.sp.spawn(etask({name: 'set_rule', cancel: true}, [function(){
        return E.set_rule(opt);
    }, function(){
        set_tab_state(opt.tab_id, 'fetch_rules');
        E.update_progress({desc: 'Changing country...'});
        return E.fetch_rules();
    }, function(){
        var r = svc_util.find_rule(E.rules&&E.rules.unblocker_rules, opt);
        var is_enabled = r&&r.enabled;
        if (!!is_enabled != !!opt.enabled)
        {
            be_lib.perr_err({id: 'be_set_rule_mismatch',
                info: {opt: opt, r: r, hola_uid: be_ext.get('hola_uid')}});
        }
        if (!opt.enabled)
            return;
        return E.verify_proxy({desc: 'rule_set', rule: opt, tab_id: opt.tab_id,
            root_url: opt.root_url});
    }, function(){
        E.clr_busy();
        set_tab_state(opt.tab_id, 'rule_set');
        be_lib.perr_ok({id: 'be_set_rule_ok', info: {name: opt.name,
            type: opt.type, md5: opt.md5, country: opt.country,
            enabled: opt.enabled, hola_uid: be_ext.get('hola_uid')}});
    }, function finally$(){ set_tab_state(opt.tab_id, 'idle');
    }, function catch$(err){
        set_tab_state(opt.tab_id, 'set_rule_err');
        E.set_err();
        be_lib.err('be_script_set_rule_err', '', {err: err,
            hola_uid: be_ext.get('hola_uid')});
    }]));
});

E.is_enabled = function(rule){
    if (!rule) 
        return true;
    if (rule.is_mitm && E.be_vpn.is_mitm_active(rule.tab_id))
        return true;
    if (!E.rules || !E.rules.unblocker_rules)
        return false;
    var r = svc_util.find_rule(E.rules.unblocker_rules, rule);
    return r && r.enabled;
};

E.verify_proxy_wait = function(opt){
    return etask({name: 'verify_proxy_wait', cancel: true}, [function(){
        if (E.get('status')!='busy')
            return E.verify_proxy(opt);
        E.once('change:status', function(){
            this.continue(E.verify_proxy(opt)); }.bind(this));
        return this.wait();
    }, function finally$(){ set_tab_state(opt.tab_id, 'idle');
    }]);
};

function _change_proxy(opt){
    if (!E.is_enabled(opt.rule))
        return void zerr('_change_proxy cancelled', opt);
    return etask({name: '_change_proxy', cancel: true}, [function(){
        E.task_insert(this);
        E.update_progress({desc: 'Trying another peer...'});
        var exclude = be_agent.get_active_agents(opt.rule);
        return be_agent.resolve_agents([opt.rule], exclude,
            assign({src_rule: _.pick(opt.rule, 'name', 'country',
            'force_peer')}, _.pick(opt, 'user_not_working',
            'agent_not_working', 'agent_preload')));
    }, function finally$(){ E.task_remove(this); }]);
}

function get_agents(opt){
    if (!E.is_enabled(opt.rule))
        return void zerr('get_agents cancelled', opt);
    return etask({name: 'get_agents', cancel: true}, [function(){
        E.task_insert(this);
        return be_agent.get_agents(opt.rule);
    }, function finally$(){ E.task_remove(this); }]);
}

E.verify_proxy = function(opt){
    if (opt.rule.changing_proxy)
        return;
    opt.rule.changing_proxy = true;
    set_tab_state(opt.tab_id, 'verify_proxy');
    return etask({name: 'verify_proxy', cancel: true}, [function(){
        return get_agents(opt);
    }, function finally$(){ opt.rule.changing_proxy = false; }]);
};

E.change_proxy = function(opt){
    if (opt.rule.changing_proxy)
        return;
    opt.rule.changing_proxy = true;
    set_tab_state(opt.tab_id, 'change_proxy');
    return etask({name: 'change_proxy', cancel: true}, [function(){
        return _change_proxy(opt);
    }, function finally$(){
        opt.rule.changing_proxy = false;
    }]);
};

function fix_vpn_perr(opt){
    var tab_id = opt.tab_id||be_tabs.get('active.id');
    var info = assign({
        src_country: opt.src_country,
        url: opt.url,
        root_url: opt.root_url,
        proxy_country: (opt.rule.country||'').toLowerCase(),
        zagent_log: E.be_vpn.get('zagent_conn_log')||[],
        callback_raw: be_mode.get('svc.callback_raw'),
        callback_ts: be_mode.get('svc.callback_ts'),
        mode_change_count: be_mode.get('mode_change_count'),
        multiple_mode_changes: be_mode.get('mode_change_count')>2,
        real_url: be_tabs.get('active.url'),
        status: be_tabs.get('active.status'),
        is_incognito: be_tabs.get('active.incognito'),
        agent: be_agent.get_active_agents(opt.rule),
        mitm_active: E.be_vpn.is_mitm_active(tab_id),
    }, _.pick(opt.rule, 'name', 'type', 'md5'));
    return etask([function(){ return be_tabs.get_trace(tab_id);
    }, function(trace){
        if (trace && trace.length)
            info.page_load = trace[trace.length-1].duration;
        return info;
    }, function finally$(){
        be_lib.perr_err({id: 'be_fix_vpn_script_not_work', info: info});
    }]);
}

var fix_tasks = {};
E.fix_vpn = function(opt){
    opt = opt||{};
    var info, timeout = Date.now(), tab_id = opt.tab_id;
    if (fix_tasks[tab_id])
        fix_tasks[tab_id].return();
    set_tab_state(opt.tab_id, 'fix_vpn');
    return fix_tasks[tab_id] = etask({cancel: true, async: true}, [function(){
        return fix_vpn_perr(opt);
    }, function(perr_info){
        info = perr_info;
        return E.change_proxy_wait({rule: opt.rule, desc: 'not_working',
            root_url: opt.root_url, user_not_working: true, tab_id: tab_id});
    }, function(){
        zerr.notice('tab:%d reloading tab on fix_vpn', tab_id);
        be_tabs.reload(tab_id);
        var proxy_timeout = Date.now()-timeout;
        if (proxy_timeout<10*SEC)
            return true;
        return this.return();
    }, function get_trace(){ return be_tabs.get_trace(tab_id);
    }, function(trace){
        var last_trace = trace && trace.length && trace[trace.length-1];
        var status = last_trace && last_trace.status;
        if (!status)
        {
            this.fix_waiting = true;
            return this.wait(20*SEC);
        }
        info.page_load = last_trace && last_trace.duration;
        if (info.page_load<20*SEC && !['4', '5'].includes(status[0]))
            return this.return(true);
        return this.return();
    }, function(){
        this.fix_waiting = false;
        return this.goto('get_trace');
    }, function finally$(){
        delete fix_tasks[tab_id];
        set_tab_state(opt.tab_id, 'idle');
    }, function catch$(err){
        set_tab_state(opt.tab_id, 'fix_vpn_err');
        this.fix_waiting = false;
        be_lib.perr_err({id: 'be_fix_vpn_script_fix_rule', info: info,
            err: err});
    }]);
};

E.change_proxy_wait = function(opt){
    return etask({name: 'change_proxy_wait', cancel: true}, [function(){
        if (E.get('status')!='busy')
            return E.change_proxy(opt);
        E.once('change:status', function(){
            this.continue(E.change_proxy(opt)); }.bind(this));
        return this.wait();
    }, function finally$(){ set_tab_state(opt.tab_id, 'idle');
    }]);
};

function gen_user_login(){
    var cid = be_mode.get('svc.cid'), uuid = be_ext.get('uuid');
    return 'user-'+(cid ? 'cid-'+cid+'-' : '')+'uuid-'+uuid;
}

function _agent_auth_listener_cb(){
    var _key = be_ext.get('agent_key'), key = _key||storage.get('agent_key');
    var err = _key ? null : key ? 'be_agent_key_fallback' : 'be_no_agent_key';
    if (err)
        be_lib.perr_err({id: err, rate_limit: {count: 2}});
    return {username: gen_user_login(), password: key||'cccccccccccc'};
}

function agent_auth_listener_cb(details){
    if (details.isProxy && details.realm=='Hola Unblocker')
        return {authCredentials: _agent_auth_listener_cb()};
    be_lib.perr_ok({id: 'auth_listener_not_proxy', info: _.pick(details, 'url',
        'realm', 'challenger'), rate_limit: {count: 2}});
    return {};
}
function agent_auth_via_headers_cb(opt){
    for (var i=0; i<opt.requestHeaders.length; i++)
    {
        if (opt.requestHeaders[i].name.toLowerCase() == 'proxy-authorization')
            return {requestHeaders: opt.requestHeaders};
    }
    var cred = _agent_auth_listener_cb();
    if (cred)
    {
        var value = btoa(cred.username+':'+cred.password);
        opt.requestHeaders.push({
            name: 'Proxy-Authorization',
            value: 'Basic '+value
        });
    }
    return {requestHeaders: opt.requestHeaders};
}

E.agent_auth_listener_del = function(){
    if (!be_bg.agent_auth_listener)
        return;
    if (chrome.webRequest.onAuthRequired)
    {
        chrome.webRequest.onAuthRequired.removeListener(
            be_bg.agent_auth_listener);
    }
    else
    {
        chrome.webRequest.onBeforeSendHeaders.removeListener(
            be_bg.agent_auth_listener);
    }
    be_bg.agent_auth_listener = null;
};

E.agent_auth_listener_add = function(){
    if (!B.have.auth_listener)
        return;
    E.agent_auth_listener_del();
    if (chrome.webRequest.onAuthRequired)
    {
        be_bg.agent_auth_listener = agent_auth_listener_cb;
        chrome.webRequest.onAuthRequired.addListener(agent_auth_listener_cb,
            {urls: ['<all_urls>']}, ['blocking']);
    }
    else
    {
        be_bg.agent_auth_listener = agent_auth_via_headers_cb;
        chrome.webRequest.onBeforeSendHeaders.addListener(
            agent_auth_via_headers_cb, {urls: ['<all_urls>']}, ['blocking',
            'requestHeaders']);
    }
};

return E; });
