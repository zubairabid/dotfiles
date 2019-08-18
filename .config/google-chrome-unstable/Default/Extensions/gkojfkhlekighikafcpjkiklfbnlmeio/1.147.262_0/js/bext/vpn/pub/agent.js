// LICENSE_CODE ZON
'use strict'; 
define(['/bext/pub/browser.js', '/bext/pub/backbone.js', 'underscore',
    '/util/etask.js', '/util/zerr.js', '/bext/vpn/pub/ajax.js',
    '/bext/pub/lib.js', '/bext/pub/ext.js', '/util/storage.js',
    '/util/date.js', '/util/util.js', '/bext/vpn/pub/info.js',
    '/svc/vpn/pub/unblocker_lib.js', '/svc/vpn/pub/util.js',
    '/bext/pub/util.js', '/bext/vpn/pub/bg_ajax.js',
    '/util/version_util.js'],
    function(B, be_backbone, _, etask, zerr, ajax, be_lib, be_ext, storage,
    date, zutil, be_info, unblocker_lib, svc_util, be_util, be_bg_ajax,
    version_util){
var rules = [], rule_agents = {def: {}, trial: {}, pool: {}};
var rule_routes = {def: {}, trial: {}, pool: {}};
var E = new (be_backbone.task_model.extend({
    _defaults: function(){
        this.on('destroy', function(){
            B.backbone.server.stop('be_agent');
            E.uninit();
        });
        B.backbone.server.start(this, 'be_agent');
    },
}))();
var ping_id = zutil.is_mocha() ? '1111' : null;
var last_used = {}, bext_config = {}, pool = {};

function init_unblocker(){
    if (init_unblocker.inited)
        return;
    init_unblocker.inited = true;
    unblocker_lib.init({
        perr: function(info, err){
            return err ? be_lib.perr_err(info) : be_lib.perr_ok(info); },
        ajax: {
            json: function(req){
                if (req.url.includes('client.hola.org'))
                    return be_bg_ajax.ccgi_ajax(req);
                return ajax.json(req);
            },
        },
        storage: {
            get: function(id){ return storage.get(id); },
            set: function(id, val){
                storage.set(id, val);
                if (id=='agent_key')
                    be_ext.set('agent_key', val);
            },
        },
        get_ext: be_ext.get.bind(be_ext),
        get_auth: function(){
            return be_ext.auth({user_id_set: +!!be_ext.get('user_id')}); },
        get_ver: be_util.qs_ajax,
        get_verify_url: function(agent){
            return (be_bg_ajax.is_hola_via_proxy() ? 'http://'+agent.ip :
                'https://'+agent.host)+':'+agent.port+'/verify_proxy';
        },
        trigger: function(name, val){ E.trigger(name, val); },
        is_trial_rule: E.is_trial_rule,
        is_pool_rule: E.is_pool_rule,
    });
}

function update_config(){
    bext_config = be_ext.get('bext_config')||{};
    var min_ver;
    if (!(min_ver = zutil.get(bext_config, 'pool.min_ver')) ||
        version_util.cmp(be_util.version(), min_ver)<0)
    {
        return void(pool = {});
    }
    pool = {enable: true, countries: zutil.get(bext_config, 'pool.countries',
        ['US', 'CA'])};
}

E.init = function(be_vpn, be_premium){
    var is_premium = be_ext.get('is_premium');
    var user_id = be_ext.get('user_id')||'';
    var update_agents = _.debounce(function(){
        var _is_premium = be_ext.get('is_premium');
        var _user_id = be_ext.get('user_id');
        if (!!is_premium==!!_is_premium && user_id==_user_id)
            return;
        is_premium = _is_premium;
        user_id = _user_id;
        init_unblocker();
        unblocker_lib.reset();
        rule_agents = {def: {}, trial: {}, pool: {}};
        ['def', 'trial', 'pool'].forEach(function(t){
            for (var s in rule_routes[t])
                rule_routes[t][s] = true;
        });
        E.resolve_agents(rules);
    }, 2*date.ms.SEC);
    E.listenTo(be_ext, 'change:is_premium', function(){ update_agents(); });
    E.listenTo(be_info, 'user_id_set', function(){ update_agents(); });
    E.listen_to(be_ext, 'change:bext_config', update_config);
    if (be_vpn)
        E.be_rule = be_vpn.be_rule;
    E.be_premium = be_premium;
    init_unblocker();
    update_config();
};

E.uninit = function(){
    if (init_unblocker.inited)
        init_unblocker.inited = void unblocker_lib.uninit();
    E.stopListening();
    rule_routes = {def: {}, trial: {}, pool: {}};
    rule_agents = {def: {}, trial: {}, pool: {}};
    rules = [];
};

E.is_trial_rule = function(rule){
    return E.be_rule && E.be_rule.is_trial_rule(rule) &&
        !be_ext.get('gen.disable_trial_agents');
};

E.is_pool_rule = function(rule){
    if (!rule)
        return;
    var site_conf = be_util.get_site_conf(be_ext, rule.name);
    if (be_ext.get('is_premium'))
    {
        return E.be_premium && !be_ext.get('gen.disable_pool_agents') &&
            (E.be_premium.get_force_premium_rule(rule.name) || site_conf &&
            site_conf.require_plus);
    }
    var country;
    if (!pool.enable || !(country = be_info.get('country')))
        return;
    if (pool.countries.includes(country))
        return true;
    if (!site_conf)
        return;
    var p = zutil.get(site_conf, 'rule_override.'+country);
    if (p!==undefined)
        return p && p.pool;
    p = zutil.get(site_conf, 'rule_override.*');
    return p && p.pool;
};

E.is_agent = function(ip){ return unblocker_lib.is_agent(ip); };

E.has_pool = function(country, pool){
    return unblocker_lib.has_pool(country, pool); };

E.get_chosen_agent = function(route_str, rule){
    var agent, t = get_rule_type(rule);
    var fallback = {def: 'pool', pool: 'def', trial: 'def'};
    if (!rule_agents[t][route_str] && fallback[t])
        t = fallback[t];
    if (!rule_agents[t][route_str] && (rule||{}).force_peer)
    {
        var routes = unblocker_lib.get_rule_routes(rule).filter(function(r){
            return r!=route_str; });
        route_str = routes[0]||route_str;
    }
    var now = Date.now();
    if (agent = rule_agents[t][route_str])
        unblocker_lib.update_chosen(agent);
    var wait = (agent ? 15 : 1)*date.ms.MIN;
    if (now-last_used[route_str]<wait)
    {
        last_used[route_str] = now;
        return agent ? [agent] : [];
    }
    last_used[route_str] = now;
    if (rule && !rule.is_updating)
    {
        rule.is_updating = true;
        etask([function(){ E.get_agents(rule);
        }, function finally$(){ rule.is_updating = false;
        }]);
    }
    return agent ? [agent] : [];
};

E.get_active_agents = function(rule){
    var agents = [];
    unblocker_lib.get_rule_routes(rule).forEach(function(s){
        agents = agents.concat(E.get_chosen_agent(s, rule)); });
    return agents;
};

var set_verified_agents = function(ret, rule){
    var agent, routes = (ret||{}).verify_proxy;
    var t = get_rule_type(rule);
    for (var s in routes)
    {
        if (agent = zutil.get((routes[s]||[])[0], 'agent'))
        {
            rule_agents[t!='pool' || agent.pool ? t : 'def'][s] =
                _.pick(agent, 'host', 'port', 'ip', 'pool');
        }
    }
};

function get_rule_type(rule){
    if (E.is_pool_rule(rule))
        return 'pool';
    return unblocker_lib.get_rule_type(rule);
}

function set_rules(r){
    if (!r || !r.length)
        return;
    var nr = [];
    r.forEach(function(e){
        var s = svc_util.gen_route_str_lc(e), t = get_rule_type(e);
        if (rule_routes[t][s])
            return;
        rule_routes[t][s] = true;
        nr.push(e);
    });
    rules = rules.concat(nr);
}

E.resolve_agents = function(r, exclude, opt){
    opt = Object.assign(opt||{}, {replace: exclude});
    var rule;
    set_rules(r);
    var fr = opt.new_only ? r.filter(function(iter){
        var t = get_rule_type(iter);
        return !rule_agents[t][svc_util.gen_route_str_lc(iter)]; }) : r;
    fr = fr.filter(function(iter){
        var t = get_rule_type(iter);
        return rule_routes[t][svc_util.gen_route_str_lc(iter)]!='loading';
    });
    return etask({name: 'resolve_agents', cancel: true}, [function(){
        if (be_ext.get('gen.peer_fallback_on') && (opt.user_not_working ||
            opt.agent_not_working))
        {
            opt.type = opt.user_not_working ? 'user_error' : 'agent_error';
        }
        return etask.for_each(fr, [function(){
            rule = this.iter.val;
            var t = get_rule_type(rule);
            rule_routes[t][svc_util.gen_route_str_lc(rule)] = 'loading';
            if (t=='pool' && (opt.user_not_working || opt.agent_not_working))
            {
                unblocker_lib.get_rule_routes(rule).forEach(function(s){
                    delete rule_agents[t][s]; });
            }
            return unblocker_lib.change_agents(ping_id, rule, opt);
        }, function(ret){ set_verified_agents(ret, rule);
        }]);
    }, function finally$(){
        fr.forEach(function(e){
            var t = get_rule_type(e);
            rule_routes[t][svc_util.gen_route_str_lc(e)] = 'loaded';
        });
    }, function catch$(e){
        be_lib.perr_err({id: 'resolve_agents_err', info: {rule: rule},
            err: e});
    }]);
};

E.get_all_agents = function(route_str){
    return unblocker_lib.get_all_agents(route_str); };

E.get_agents = function(rule){
    return etask({name: '_verify_proxy', cancel: true}, [function(){
        return unblocker_lib.get_agents(ping_id, rule);
    }, function(ret){ set_verified_agents(ret, rule);
    }, function catch$(e){
        be_lib.perr_err({id: 'get_agents_err', info: {rule: rule}, err: e});
    }]);
};

return E; });
