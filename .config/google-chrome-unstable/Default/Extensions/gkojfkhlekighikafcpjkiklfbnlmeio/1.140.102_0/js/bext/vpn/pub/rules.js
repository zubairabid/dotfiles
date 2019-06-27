// LICENSE_CODE ZON
'use strict'; 
define(['jquery', 'underscore', 'backbone', '/bext/pub/backbone.js',
    '/bext/pub/browser.js', '/svc/vpn/pub/unblocker_lib.js',
    '/svc/vpn/pub/util.js', '/util/string.js', '/util/util.js',
    '/util/storage.js', '/util/date.js', '/bext/vpn/pub/info.js',
    '/bext/vpn/pub/premium.js', '/bext/vpn/pub/tabs.js', '/util/etask.js',
    '/util/array.js', '/bext/pub/lib.js', '/bext/pub/ext.js',
    '/bext/pub/util.js'],
    function($, _, Backbone, be_backbone, B, unblocker_lib, svc_util, string,
    zutil, storage, date, be_info, be_premium, be_tabs, etask, array, be_lib,
    be_ext, be_util){
B.assert_bg('be_rules');
var assign = Object.assign;
var E = new (be_backbone.model.extend({
    _defaults: function(){ this.on('destroy', function(){ E.uninit(); }); },
}))();

function gen_stamp(){ return _.random(0xffffffff); }

function gen_limited(){
    E.limited = _.map(E.exceptions.limited, function(site){
        return {re: new RegExp(site.re), time: site.time}; });
}

function commit_rules(){
    E.stamp = gen_stamp();
    storage.set('be_rules_stamp', E.stamp);
    be_lib.storage_local_set({unblocker_rules: E.rules});
    gen_rules(E.rules);
}

function rules_fixup(){
    var now = new Date();
    var change = false;
    var country = (be_info.get('country')||'').toLowerCase();
    for (var i in E.rules)
    {
        var r = E.rules[i];
        var diff = now-(r.ts||0);
        if (!r.enabled)
            continue;
        if (r.country==country && diff>date.ms.DAY)
        {
            change = true;
            r.enabled = false;
            continue;
        }
        if (E.limited)
        {
            for (var j=0; j<E.limited.length; j++)
            {
                var l = E.limited[j];
                if (l.re.test(r.name) && diff>l.time)
                {
                    change = true;
                    r.enabled = false;
                    continue;
                }
            }
        }
        if (r.premium && !be_premium.is_active() &&
            diff>(r.expire||date.ms.DAY))
        {
            change = true;
            r.premium = false;
            continue;
        }
    }
    if (change)
        commit_rules();
}

function _set_rule(opt, pair){
    var r, i;
    if (!opt.name || !opt.country)
        return;
    if (!E.gen_rules)
        E.gen_rules = {};
    if (!E.rules)
        E.rules = {};
    for (i in E.rules)
    {
        r = E.rules[i];
        if (r.name!=opt.name || opt.src && opt.src!=r.src)
            continue;
        delete E.gen_rules[i];
        delete E.rules[i];
    }
    if (!opt.del)
    {
        opt.force_route = storage.get('be_force_route');
        if (!opt.md5 && opt.premium===undefined && r)
            opt.premium = r.premium;
        if (opt.name.match(/^https?:\/\//))
            opt.name = svc_util.get_root_url(opt.name);
        r = unblocker_lib.gen_rule(opt);
        E.gen_rules[r.id] = zutil.clone_deep(r);
        E.rules[r.id] = {name: r.name, country: r.country, enabled: r.enabled,
            premium: r.md5=='premium', expire: opt.expire, cond: r.cond,
            ts: r.ts, mode: r.mode, full_vpn: r.full_vpn, src: r.src,
            force_pool: !!opt.force_pool};
    }
    if (pair || !E.exceptions || !E.exceptions.pairs)
        return;
    for (i=0; i<E.exceptions.pairs.length; i++)
    {
        var p = E.exceptions.pairs[i], idx = p.indexOf(opt.name);
        if (idx==-1)
            continue;
        for (var j=0; j<p.length; j++)
        {
            if (j==idx)
                continue;
            _set_rule(assign({}, opt, {name: p[j]}), true);
        }
    }
}

function get_domains(domain){
    var pairs = E.exceptions && E.exceptions.pairs || [];
    var domains = [domain];
    for (var i=0; i<pairs.length; i++)
    {
        var p = pairs[i], idx = p.indexOf(domain);
        if (idx==-1)
            continue;
        for (var j=0; j<p.length; j++)
        {
            if (j!=idx)
                domains.push(p[j]);
        }
    }
    return domains;
}

function clean_cookies(domain){
    if (B.have['cookies.get_all'] && B.have['cookies.remove'])
    {
        etask([function(){
            var domains = get_domains(domain);
            return etask.all(domains.map(function(v){
                return etask.cb_apply(B.cookies.get_all, [{domain: v}]);
            }));
        }, function(cookies){
            cookies = array.flatten_shallow(cookies||[]);
            cookies.forEach(function(cookie){
                if (!cookie)
                    return;
                B.cookies.remove({name: cookie.name,
                    url: (cookie.secure ? 'https' : 'http')
                    +'://'+cookie.domain+cookie.path});
            });
        }]);
        etask([function(){
            return etask.all([
                etask.cb_apply(B.cookies.get_all, [{name: 'DS'}]),
                etask.cb_apply(B.cookies.get_all, [{name: 'DE2'}]),
            ]);
        }, function(cookies){
            cookies = array.flatten_shallow(cookies);
            var filtered = _.filter(cookies, function(cookie){
                return cookie && /^\.g[a-z]{1}\.com$/.test(cookie.domain); });
            filtered.forEach(function(cookie){
                B.cookies.remove({url: 'http://yep'+cookie.domain,
                    name: cookie.name});
            });
            if (filtered.length)
            {
                be_lib.perr_ok({id: 'be_clean_cookies2',
                    rate_limit: {count: 1},
                    info: {rule: domain, cookies: filtered.map(function(c){
                        return _.pick(c, 'domain', 'name', 'path'); })}});
            }
        }]);
    }
}

E.set_rule_val = function(rule, key, val){
    var i, r;
    for (i in E.rules)
    {
        r = E.rules[i];
        if (r.name!=rule.name)
            continue;
        r[key] = E.gen_rules[i][key] = val;
    }
    commit_rules();
};

function is_stub_unblock(domain){
    return !be_premium.is_active() && be_util.is_google(domain);
}

E.set_rule = function(opt){
    opt = assign({ts: new Date()}, opt);
    this.trigger('before_rule_set', opt);
    if (!is_stub_unblock(opt.name))
        clean_cookies(opt.name);
    _set_rule(opt);
    commit_rules();
};

function gen_rules(rules){
    E.gen_rules = null;
    E.rules = null;
    for (var i in rules)
        _set_rule(rules[i]);
}

E.set_rules = function(rules){
    ['globals', 'plus', 'free'].forEach(function(e){
        if (!_.isEqual(E[e], rules['unblocker_'+e]))
            storage.set_json('be_rules_'+e, E[e] = rules['unblocker_'+e]);
    });
    if (!_.isEqual(E.exceptions, rules.exceptions))
    {
        E.exceptions = rules.exceptions;
        storage.set_json('be_rules_exceptions', E.exceptions);
        if (E.exceptions)
        {
            unblocker_lib.set_peer_sites(E.exceptions.peer);
            if (0) 
            unblocker_lib.set_pool_sites(E.exceptions.pool);
            gen_limited();
        }
        else
        {
            be_lib.perr_err({id: 'be_rules_no_exceptions',
                rate_limit: {count: 1}, info: {rules: rules}});
        }
        gen_rules(E.rules);
    }
    if (!_.isEqual(E.blacklist, rules.blacklist))
    {
        E.blacklist = rules.blacklist;
        storage.set_json('be_rules_blacklist', E.blacklist);
    }
    if (E.enable!=rules.enable)
    {
        E.enable = rules.enable;
        storage.set('be_rules_enable', +E.enable);
    }
};

E.get_rules = function(){
    rules_fixup();
    if (!E.globals)
        return null;
    var json = {unblocker_rules: E.gen_rules||{}, stamp: E.stamp,
        enable: E.enable, blacklist: E.blacklist};
    ['globals', 'plus', 'free'].forEach(function(e){
        json['unblocker_'+e] = E[e]; });
    return zutil.clone_deep(json);
};

E.get_groups = function(groups){
    var ret = {unblocker_rules: {}};
    for (var i=0; i<groups.length; i++)
    {
        var r = unblocker_lib.gen_rule(groups[i]);
        ret.unblocker_rules[r.id] = r;
    }
    return zutil.clone_deep(ret);
};

function init_rules(){
    E.globals = storage.get_json('be_rules_globals');
    if (E.exceptions = storage.get_json('be_rules_exceptions'))
    {
        unblocker_lib.set_peer_sites(E.exceptions.peer);
        if (0) 
        unblocker_lib.set_pool_sites(E.exceptions.pool);
        gen_limited();
    }
    E.blacklist = storage.get_json('be_rules_blacklist');
    E.stamp = storage.get_int('be_rules_stamp');
    E.enable = !!storage.get_int('be_rules_enable');
    if (E.rules = storage.get_json('be_rules'))
    {
        storage.clr('be_rules');
        be_lib.storage_local_set({unblocker_rules: E.rules});
        return gen_rules(E.rules);
    }
    etask([function(){
        return be_lib.storage_local_get('unblocker_rules');
    }, function(res){
        if (!(res = (res||{}).unblocker_rules))
            return;
        gen_rules(E.rules = res);
        E.trigger('local_rules_set', res);
    }]);
}

E.init = function(){
    if (E.inited)
        return;
    E.inited = true;
    be_tabs.set_rules(this);
    init_rules();
};

E.uninit = function(){
    if (!E.inited)
        return;
    E.inited = false;
    E.rules = null;
    E.gen_rules = null;
    E.globals = null;
    E.exceptions = null;
    E.stamp = null;
    E.enable = null;
};

return E; });
