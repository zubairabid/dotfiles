// LICENSE_CODE ZON
'use strict'; 
(function(){
var define;
var is_node = typeof module=='object' && module.exports;
if (!is_node)
    define = self.define;
else
    define = require('../../../util/require_node.js').define(module, '../');
define(['underscore', '/util/etask.js', '/util/url.js', '/util/util.js',
    '/protocol/pub/countries.js', '/svc/vpn/pub/util.js',
    '/util/storage.js', '/util/escape.js', '/util/date.js'],
    function(_, etask, zurl, zutil, pcountries, svc_util, storage, zescape,
    date){
var E = {};
var assign = Object.assign;

E.is_all_browser = function(rule){ return rule && rule.name=='all_browser'; };

E.is_vpn_allowed = function(_url, is_main, is_in_net, rule){
    var protocol, hostname, url = zurl.parse(_url), port = url.port;
    if (!(protocol = url.protocol) || !(hostname = url.hostname))
        return false;
    if (E.is_all_browser(rule))
        return true;
    if (!hostname.includes('.'))
        return false;
    var protocols = {'http:': 1, 'https:': 1, 'wss:': 1, 'ws:': 1};
    if (!protocols[protocol])
        return false;
    if (port && !{'http:80': 1, 'https:443': 1, 'ws:80': 1,
        'wss:443': 1}[protocol+port])
    {
        return false;
    }
    if (zurl.is_ip(hostname))
    {
        if (is_main || !is_in_net)
            return false;
        if (is_in_net(hostname, '10.0.0.0', '255.0.0.0') ||
            is_in_net(hostname, '172.16.0.0', '255.240.0.0') ||
            is_in_net(hostname, '192.168.0.0', '255.255.0.0') ||
            is_in_net(hostname, '127.0.0.0', '255.0.0.0'))
        {
            return false;
        }
    }
    if (zurl.get_top_level_domain(hostname)=='localhost' ||
        zurl.is_hola_domain(hostname))
    {
        return false;
    }
    return true;
};

E.is_skip_url = function(url){
    var protocol = zurl.get_proto(url), host = zurl.get_host(url);
    return host.search(/^(.*\.)?hola.org$/)!=-1 &&
        url.search(/(access|unblock)\/([^/]*)\/using\/.*/)==-1 ||
        zurl.is_ip_port(host) || protocol.search(/^(http|https)$/)==-1 ||
        host=='localhost' || !zurl.is_valid_domain(host);
};

E.get_rules = function(_rules, url, ignore){
    url = url||'';
    var _r, rules, ret = [], r_enabled = null;
    if (!_rules || !(rules = _rules.unblocker_rules))
        return [];
    for (_r in rules)
    {
        var r = rules[_r];
        if (!r.supported)
            continue;
        if (!ignore && r.enabled && E.is_all_browser(r))
            return [r];
        var urls = r.root_url;
        if (urls && urls.some(function(rurl){
            try { return url.match(rurl); } catch(e){} }))
        {
            if (r.enabled)
                r_enabled = r;
            else
                ret.push(r);
        }
    }
    if (r_enabled)
        ret.unshift(r_enabled);
    return ret;
};

E.gen_route_str_lc = function(route_opt, opt){
    return svc_util.gen_route_str_lc(route_opt, opt); };
E.gen_route_str = function(route_opt, opt){
    return svc_util.gen_route_str(route_opt, opt); };

function verify_country(then, countries){
    if (!then.startsWith('PROXY '))
        return;
    then = then.substr(6).split('.')[0].split(':')[0];
    if (countries.includes(then))
        return then;
}

E.get_country_from_rule = function(rule, proxy_countries){
    if (!rule || !proxy_countries)
        return '';
    if (rule.country)
        return rule.country;
    var val, countries = proxy_countries.bext;
    if ((val=rule.then) && (val=verify_country(val, countries)))
        return val;
    if (!rule.cmds)
        return '';
    for (var i=0; i<rule.cmds.length; i++)
    {
        var cmds = rule.cmds[i];
        for (var cmd in cmds)
        {
            val = cmds[cmd];
            if (cmd=='then' && (val=verify_country(val, countries)))
                return val;
        }
    }
    return '';
};

E.new_vpn = function(opt){
    var r = {};
    r.name = opt.root_url;
    r.country = opt.country;
    r.link = opt.root_url;
    r.root_url_orig = ['**.'+opt.root_url];
    r.os = ['windows'];
    r.type = opt.type||'url';
    r.md5 = opt.md5||'vpn';
    r.className = r.md5=='premium' ? 'icon-premium' : 'icon-vpn';
    r.description = r.country.toUpperCase()+' VPN'
        +(r.md5=='premium' ? ' Premium' : '');
    r.supported = opt.supported;
    if (opt.ratings)
        r.ratings = opt.ratings;
    return r;
};

E.get_root_link = function(rule, href){
    return href&&zurl.add_proto(zurl.get_host(href)) || rule.link; };

function add_rule_ratings(opt){
    var proxy_country = opt.proxy_country, rules = opt.rules;
    var rule_ratings = opt.rule_ratings||[];
    var groups = opt.groups;
    var country_ratings = _.find(rule_ratings, function(cr){
        return cr.proxy_country==proxy_country; });
    if (country_ratings)
    {
        _.forEach(country_ratings.rules, function(r){
            if (r.rating<=0)
                return;
            var r_rule = zutil.clone(svc_util.find_rule(rules, r)
                || svc_util.find_rule(groups && groups.unblocker_rules, r));
            if (!r_rule)
            {
                r_rule = E.new_vpn({root_url: r.name, type: r.type, md5: r.md5,
                    country: r.country, supported: true});
                r_rule.root_url = [r.name];
            }
            var rule = svc_util.find_rule(rules, r_rule);
            if (!rule)
            {
                if (!r_rule.root_url)
                    return;
                rule = zutil.clone(r_rule);
                rules.push(rule);
            }
            rule.ratings = r;
        });
    }
    rules.forEach(function(r){
        if (!r.ratings)
            r.ratings = {rating: 0, vote_up: 0, vote_down: 0};
    });
    rules.sort(function(r1, r2){
        return r1.ratings.rating-r2.ratings.rating>0 ? -1 : 1; });
    return rules;
}

E.get_all_rules = function(opt){
    var proxy_country = opt.proxy_country.toLowerCase();
    var rule_ratings = opt.rule_ratings;
    var all_rules = opt.rules, url = opt.url, root_url = opt.root_url;
    var rules = zutil.clone(E.get_rules(all_rules, url)||[]);
    rules = _.filter(rules, function(r){ return r.country==proxy_country; });
    rules = add_rule_ratings({proxy_country: proxy_country, rules: rules,
        root_url: root_url, url: url, rule_ratings: rule_ratings,
        groups: opt.groups});
    if (!_.find(rules, function(r){
        return r.type=='url' && r.name==root_url && r.md5!='premium'; }))
    {
        rules.push(E.new_vpn({root_url: root_url, country: proxy_country,
            supported: true, ratings: {rating: 0, vote_up: 0, vote_down: 0}}));
    }
    return rules;
};

E.get_tld_country = function(host){
    if (!host)
        return '';
    var tld = zurl.get_top_level_domain(host);
    if (!tld)
        return '';
    tld = tld.toUpperCase();
    if (tld=='COM')
        return 'US';
    if (tld=='UK')
        tld = 'GB';
    var skip_domain = ['TV', 'FM', 'IO', 'AM'];
    if (skip_domain.includes(tld))
        return '';
    if (!_.find(pcountries.proxy_countries.bext,
        function(c){ return c==tld; }))
    {
        return '';
    }
    return tld;
};

E.get_popular_country = function(opt){
    var c0, c1, tld = E.get_tld_country(opt.host);
    var p = {};
    c0 = tld||'US';
    c1 = c0=='US' ? 'GB' : 'US';
    p[c0] = {proxy_country: c0, rating: 0.02};
    p[c1] = {proxy_country: c1, rating: 0.01};
    var rule_ratings = opt.rule_ratings||[];
    rule_ratings.forEach(function(country_ratings){
        if (country_ratings.rating<0.1)
            return;
        var country = country_ratings.proxy_country.toUpperCase();
        var ratings = {proxy_country: country,
            rating: country_ratings.rating};
        p[country] = ratings;
    });
    var popular_array = [];
    _.forEach(p, function(r){ popular_array.push(r); });
    popular_array.sort(function(a, b){
        return a.rating-b.rating > 0 ? -1 : 1; });
    return popular_array;
};

E.is_conf_allowed = function(on, id){
    var random;
    if (!on)
        return false;
    id = id||'ext_rand_id';
    if (!(random = +storage.get(id)))
        storage.set(id, random = Math.random());
    return random<on;
};

E.get_dbg_conf = function(path){
    return zutil.get(storage.get_json('hola_conf'), path);
};

E.plus_ref = function(ref, extra){
    return zescape.uri('https://hola.org/plus', assign({
        ref: ref,
        uuid: storage.get('uuid'),
    }, extra));
};

E.must_verify_email = function(user){
    return user && user.emails && !user.verified;
};

E.get_rule_min_fmt = function(rule){
    return _.pick(rule||{}, 'name', 'country'); };

return E; }); }());
