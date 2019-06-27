// LICENSE_CODE ZON
'use strict'; 
(function(){
var define;
var is_node = typeof module=='object' && module.exports;
if (!is_node)
    define = self.define;
else
    define = require('../../../util/require_node.js').define(module, '../');
define(['/protocol/pub/pac_engine.js', '/util/date.js',
    '/util/escape.js', '/util/url.js', '/util/util.js', '/util/zerr.js',
    '/util/etask.js', '/svc/vpn/pub/util.js'],
    function(pac_engine, date, zescape, zurl, zutil, zerr, etask, vpn_util){
var E = {};

var assign = Object.assign;
var CACHE_TTL = date.ms.MIN;
var POLICY_TTL = 5*date.ms.MIN;
var SEC = date.ms.SEC;

var extensions = {
    archive: zutil.bool_lookup(
        '7z apk arj bin bz deb dmg exe gz iso msi rar rpm tbz tgz xz zip'),
    media: zutil.bool_lookup(
        '3gp avi f4v flv h264 m4a m4s m4v mkv mov mp3 mp4 ogg ogv swf ts wav '
        +'webm wmv'),
    static: zutil.bool_lookup(
        'css eot gif ico jar jpeg jpg png svg svgz ttf webp woff'),
};

var expected_types = {
    archive: /^application\/(?!json$)/,
    media: /^((audio|video)\/|application\/octet-stream$)/,
};

var strategies = {};
var cache = {};
var peer_domain_re;
var pools_re;
var _premium_mode = false;
var _app_trial_mode = false;



E.handle_request = function(url, opt){
    opt = opt||{};
    opt.premium = opt.premium||_premium_mode||_app_trial_mode;
    if (typeof url=='string')
        url = zurl.parse(url, true);
    var top_url = typeof opt.top_url=='string' ?
        zurl.parse(opt.top_url, true) : opt.top_url;
    var strategy;
    var cache_entry = E.cache_access(url.hostname);
    var policy_key = 'policy:'+opt.country;
    var policy = cache_entry.get(policy_key);
    if (policy=='blocked')
        strategy = {name: 'direct'};
    else if (opt.force=='peer' && opt.strict)
        strategy = {name: 'proxy', peer: true};
    else if (opt.premium)
        strategy = {name: 'proxy', peer: false};
    else if (opt.force=='peer')
        strategy = {name: 'proxy'};
    else if (opt.force)
        strategy = {name: opt.force, peer: false};
    else if ((strategy = choose_strategy(url, opt)) && strategy.name!='direct')
    {
        var ex = pac_engine.find_proxy_for_url_exception(url.orig,
            url.hostname);
        switch (ex)
        {
        case 'DIRECT': strategy = {name: 'direct'}; break;
        case 'PROXY XX': strategy.name = 'proxy'; break;
        case 'PROXY XX.direct_first': strategy.name = 'direct_first'; break;
        case 'PROXY XX.PEER':
            strategy.name = 'proxy';
            strategy.peer = true;
            break;
        }
    }
    if (strategy.cache)
    {
        var cached = cache_entry.get(strategy.cache);
        if (cached)
            strategy = {name: cached, peer: strategy.peer};
    }
    var peer = strategy.peer===true || strategy.peer===undefined &&
        peer_domain_re && (peer_domain_re.test(url.hostname) ||
            top_url && peer_domain_re.test(top_url.hostname));
    var res = strategies[strategy.name].bind(null, {
        cache: cache_entry,
        cache_key: strategy.cache,
        policy: policy,
        policy_key: policy_key,
        peer: peer,
        expect_type: strategy.expect_type,
        pool: opt.pool,
        strict: opt.strict,
    });
    res.desc = strategy.name;
    if (strategy.cache)
        res.desc += ' cache '+strategy.cache;
    if (peer && strategy.name!='direct')
        res.desc += ' peer';
    if (strategy.name=='proxy' && opt.pool)
        res.desc += ' pool_'+opt.pool;
    return res;
};

function choose_strategy(url, opt){
    var ext = url.ext && url.ext.toLowerCase();
    if (opt.method && opt.method!='GET')
        return {name: 'proxy'};
    if (opt.type=='stylesheet' || opt.type=='image')
        return {name: 'parallel', cache: 'static', peer: false};
    if (url.query && zurl.qs_parse(url.query, 0, 1).callback) 
        return {name: 'parallel'};
    if (extensions.archive[ext])
    {
        return {name: 'direct_first', cache: 'archive', peer: false,
            expect_type: expected_types.archive};
    }
    if (extensions.media[ext] || /=\d+-\d+\.dash/.test(url.file) ||
        /Seg\d+-?Frag\d+/.test(url.pathname) ||
        /\/QualityLevels\(\d+\)\/Fragments\(.+=\d+(,format=.+)?\)/
        .test(url.pathname))
    {
        return {name: 'direct_first', cache: 'media', peer: false,
            expect_type: expected_types.media};
    }
    if (extensions.static[ext])
        return {name: 'parallel', cache: 'static', peer: false};
    if (!_premium_mode && !_app_trial_mode && ext=='m3u8')
    {
        return {name: 'direct_first', cache: 'media', peer: false,
            expect_type: /mpegurl/i};
    }
    if (opt.type=='main_frame')
        return {name: 'proxy'};
    if (url.protocol=='https:')
        return {name: 'proxy'};
    return {name: 'parallel'};
}

E.set_premium_mode = function(mode){ _premium_mode = mode; };
E.set_app_trial_mode = function(mode){ _app_trial_mode = mode; };

E.resp_match = function(a, b){
    if (a.code!=b.code)
        return {match: false, basis: 'response code'};
    if (a.type!=b.type)
        return {match: false, basis: 'content type'};
    if (a.etag || b.etag)
        return {match: a.etag==b.etag, basis: 'etag'};
    if (a.len || b.len)
        return {match: a.len==b.len, basis: 'content-length'};
};

E.unblocker_json_set = function(json, opt){
    pac_engine.init(json, opt||{ext: true});
    if (json.exceptions)
    {
        E.set_peer_sites(json.exceptions.peer);
        if (0) 
        E.set_pool_sites(json.exceptions.pool);
    }
};

E.set_peer_sites = function(list){
    if (!list)
        return;
    peer_domain_re = new RegExp(
        '(^|\\.)('+list.map(zescape.regex).join('|')+')$', 'i');
};

E.set_pool_sites = function(pool){
    if (!pool)
        return;
    pools_re = {};
    for (var n in pool)
    {
        if (!pool[n] || !pool[n].length)
            continue;
        pools_re[n] = new RegExp(
            '(^|\\.)('+pool[n].map(zescape.regex).join('|')+')$', 'i');
    }
};

function get_pool(name){
    if (!pools_re)
        return;
    for (var n in pools_re)
    {
        if (pools_re[n].test(name))
            return n;
    }
}

E.gen_rule = function(opt){
    var peer = peer_domain_re && peer_domain_re.test(opt.name);
    var premium = opt.premium || _premium_mode || opt.md5=='premium';
    var p = 'PROXY '+opt.country.toUpperCase();
    var p_dyn = p+(peer ? '.PEER' : '');
    var p2 = p+'.';
    var p_dyn2 = p2+(peer ? 'PEER,' : '');
    var rule = {
        name: opt.name,
        country: opt.country.toLowerCase(),
        peer: peer,
        force_peer: opt.force_peer,
        pool: get_pool(opt.name),
        link: opt.name,
        description: opt.country.toUpperCase()+' VPN'+
            (premium ? ' Premium' : ''),
        icon: 'img/icon_'+(premium ? 'premium' : 'vpn')+'.png',
        type: 'url',
        md5: premium ? 'premium' : 'vpn',
        no_direct_filter: premium,
        enabled: opt.enabled!==undefined ? !!opt.enabled : true,
        cond: opt.cond,
        supported: true,
        root_url_orig: ['**.'+opt.name],
        root_url: [zurl.http_glob_url('**.'+opt.name, 1)],
        ts: opt.ts ? new Date(opt.ts) : new Date(),
        mode: opt.mode||'unblock',
        cmds: [{
            'if': [
                {ext: extensions.static, type: '=o',
                    then: p2+'direct_first_discover'},
                {ext: extensions.media, type: '=o',
                    then: p2+'direct_first'},
                {url: zurl.http_glob_url('**/**=\\d+-\\d+\.dash', 1),
                    type: '=~', then: p2+'direct_first'},
                {url: zurl.http_glob_url('**/**Seg[0-9]+-?Frag[0-9]+**', 1),
                    type: '=~', then: p2+'direct_first'},
                {url: '^'+zurl.http_glob_url('**/**/')+
                    'QualityLevels\\(\\d+\\)\\/'+
                    'Fragments\\(.+=\\d+(,format=.+)?\\)',
                    type: '=~', then: p2+'direct_first'},
                {main: true, type: '==', then: p_dyn},
                {url: zurl.http_glob_url('https://**', 1), type: '=~',
                    then: p_dyn},
                {url: zurl.http_glob_url('http://**', 1), type: '=~',
                    then: p_dyn2+'direct_discover'},
            ],
            then: p_dyn,
        }],
    };
    if (opt.src)
        rule.src = opt.src;
    if (opt.force_pool)
        rule.force_pool = opt.force_pool;
    if (opt.force_route)
    {
        p_dyn = p+'.'+opt.force_route;
        rule.cmds = [{
            'if': [
                {url: zurl.http_glob_url('https://**', 1), type: '=~',
                    then: p_dyn},
                {url: zurl.http_glob_url('http://**', 1), type: '=~',
                    then: p_dyn},
                ],
            then: p_dyn,
        }];
    }
    rule.id = E.get_rule_id(rule);
    return rule;
};

E.get_rule_id = function(opt){
    return opt.name+'_'+opt.country+'_'+
        (opt.md5=='premium' || opt.premium ? 'premium' : 'vpn');
};

function cache_entry(){ this.timers = {}; }

cache_entry.prototype.get = function(key){ return this[key]; };

cache_entry.prototype.put = function(key, value, ttl){
    var _this = this;
    _this[key] = value;
    if (_this.timers[key])
        clearTimeout(_this.timers[key]);
    _this.timers[key] = ttl && setTimeout(function(){
        delete _this[key];
        delete _this.timers[key];
    }, ttl);
    return _this;
};

cache_entry.prototype.put_weak = function(key, value, ttl){
    if (!this[key])
        this.put(key, value, ttl);
    return this;
};

cache_entry.prototype.del = function(key){
    delete this[key];
    delete this.timers[key];
    return this;
};

E.cache_access = function(domain){
    var entry = cache[domain];
    if (!entry)
        entry = cache[domain] = new cache_entry();
    return entry;
};

E.cache_purge = function(){ cache = {}; };

strategies.direct = function(opt, direct, proxy){
    var res = {direct: {}};
    if (!direct)
    {
        res.direct.start = true;
        return res;
    }
    if (direct.code || direct.error)
        res.direct.serve = true;
    return res;
};

strategies.proxy = function(opt, direct, proxy){
    if (opt.policy=='blocked' && !opt.strict)
        return strategies.direct(opt, direct, proxy);
    var res = {direct: {}, proxy: {}};
    if (!proxy)
    {
        res.proxy.start = true;
        res.proxy.peer = opt.peer;
        res.proxy.pool = opt.pool;
        res.proxy.allowed = opt.policy=='allowed';
        return res;
    }
    if (opt.strict)
    {
        res.proxy.abort = true;
        return res;
    }
    if (handle_policy(proxy.policy, opt)=='blocked')
    {
        res.direct.start = true;
        return res;
    }
    if (proxy.code || proxy.error)
        res.proxy.serve = true;
    if (opt.pool)
        res.proxy.pool = opt.pool;
    return res;
};

strategies.parallel = function(opt, direct, proxy){
    if (opt.policy=='blocked')
        return strategies.direct(opt, direct, proxy);
    var res = {direct: {}, proxy: {}};
    function serve_proxy(){
        if (proxy.hdrs_only)
        {
            res.proxy.start = true;
            res.proxy.peer = opt.peer;
            res.proxy.pool = opt.pool;
            res.proxy.allowed = opt.policy=='allowed';
        }
        else
            res.proxy.serve = true;
        return !proxy.hdrs_only;
    }
    if (!direct)
    {
        res.direct.start = true;
        res.direct.timeout = true;
    }
    if (!proxy)
    {
        res.proxy.start = true;
        res.proxy.peer = opt.peer;
        res.proxy.pool = opt.pool;
        res.proxy.allowed = opt.policy=='allowed';
        res.proxy.hdrs_only = true;
    }
    if (!direct || !proxy)
        return res;
    if (handle_policy(proxy.policy, opt)=='blocked')
        return strategies.direct(opt, direct, proxy);
    if (proxy.error)
    {
        if (direct.code || direct.error)
            res.direct.serve = true;
        if (direct.error)
            res.proxy.serve = true; 
        return res;
    }
    if (!proxy.code)
        return res;
    if (!direct.code)
    {
        if (!serve_proxy())
            return res;
        if (opt.cache_key && direct.slow && is_ok(proxy, opt.expect_type))
        {
            res.log = 'cache put weak proxy';
            opt.cache.put_weak(opt.cache_key, 'proxy', CACHE_TTL);
        }
        else if (!opt.cache_key)
            res.direct.abort = true;
        return res;
    }
    var m = E.resp_match(direct, proxy);
    if (!m)
    {
        serve_proxy();
        return res;
    }
    res.log = m.basis + (m.match ? ' match' : ' mismatch');
    if (m.match)
    {
        res.direct.serve = true;
        if (!proxy.hdrs_only)
            res.proxy.serve = true; 
        if (opt.cache_key)
        {
            res.log += '; cache put direct';
            opt.cache.put(opt.cache_key, 'direct', CACHE_TTL);
        }
    }
    else
    {
        if (!serve_proxy())
            return res;
        if (opt.cache_key)
        {
            res.log += '; cache put proxy';
            opt.cache.put(opt.cache_key, 'proxy', CACHE_TTL);
        }
    }
    return res;
};

strategies.direct_first = function(opt, direct, proxy){
    if (opt.policy=='blocked')
        return strategies.direct(opt, direct, proxy);
    var res = {direct: {}, proxy: {}};
    if (!direct)
    {
        res.direct.start = true;
        res.direct.timeout = true;
        return res;
    }
    if (is_ok(direct, opt.expect_type))
    {
        res.direct.serve = true;
        if (opt.cache_key)
        {
            res.log = 'cache del';
            opt.cache.del(opt.cache_key);
        }
        return res;
    }
    if (!proxy)
    {
        if (direct.slow || direct.code || direct.error)
        {
            res.proxy.start = true;
            res.proxy.peer = opt.peer;
            res.proxy.pool = opt.pool;
            res.proxy.allowed = opt.policy=='allowed';
        }
        return res;
    }
    if (handle_policy(proxy.policy, opt)=='blocked')
        return strategies.direct(opt, direct, proxy);
    if (proxy.code)
    {
        if (opt.cache_key && (is_ok(proxy, opt.expect_type) || !direct.code))
        {
            res.log = 'cache put proxy';
            opt.cache.put(opt.cache_key, 'proxy', CACHE_TTL);
        }
        else if (proxy.code==302 && direct.code==302)
        {
            if (proxy.location==direct.location)
                res.direct.serve = true;
            else
            {
                var p = zurl.parse(proxy.location, true);
                var d = zurl.parse(direct.location, true);
                if (p.path==d.path)
                    res.direct.serve = true;
            }
        }
        if (!res.direct.serve)
            res.proxy.serve = true;
        return res;
    }
    if (proxy.error && !direct.slow)
    {
        res.direct.serve = true;
        if (direct.error)
            res.proxy.serve = true; 
        return res;
    }
};

function is_ok(resp, expect_type){
    var res = resp.code>=200 && resp.code<300 || resp.code==304;
    if (res && expect_type)
        res = expect_type.test(resp.type);
    return res;
}

function handle_policy(policy, opt){
    var m = /^(allowed|blocked)( domain)?$/.exec(policy);
    if (!m)
        return 'allowed';
    opt.policy = m[1];
    if (opt.policy_key && m[2])
        opt.cache.put(opt.policy_key, opt.policy, POLICY_TTL);
    return opt.policy;
}

var api = {}, agents = {def: {}, trial: {}};
var def_api = {
    perr: function(opt){ zerr('agent.perr not set, discarding '+opt.id); },
    ajax: function(opt){ zerr('agent.ajax not set, discarding '+opt.url); },
    ajax_via_proxy: undefined,
    storage: {get: function(id){
    return void zerr('agent.storage not set, discarding get '+id); },
    set: function(id){
    return void zerr('agent.storage not set, discarding set '+id); }},
    get_auth: function(){ return void zerr('agent.get_auth not set'); },
    get_ver: function(){ return void zerr('agent.get_ver not set'); },
    url_ccgi: 'https://client.hola.org/client_cgi',
    trigger: function(ev, val){},
    is_trial_rule: function(rule){},
    is_pool_rule: function(rule){},
};

E.init = function(set){ assign(api, def_api, set); };

E.reset = function(){
    for (var e in agents)
        Object.keys(agents[e]).forEach(function(a){ agents[e][a].uninit(); });
    agents = {def: {}, trial: {}};
};

E.uninit = function(){
    E.reset();
    api = {};
};

function Agent(rule, route){
    var _this = this;
    if (!(this instanceof Agent))
        return new Agent(rule);
    this.rule = rule;
    this.period = 12*date.ms.HOUR;
    this.route = route.toLowerCase();
    this.exclude = [];
    this.agents = [];
    this.agents_pool = [];
    this._log = [];
    this.limit = this.CG('verify_proxy.agent_num', 3);
    this.keep_order = api.get_ext && !api.get_ext('gen.disable_order');
    this.country = rule.country;
    this.state = 0;
    this.rule_type = E.get_rule_type(rule);
    agents[this.rule_type][this.route] = this;
    this.monitor_sp = etask([function start(timer){
        return etask.sleep(timer||_this.period);
    }, function(){
        var ts = api.storage.get('agent_key_ts'), diff = Date.now() - ts;
        if (ts && diff < _this.period)
            return this.goto('start', _this.period-diff);
        return _this.zgettunnels();
    }, function(ret){
        if (!ret || !ret.agent_key)
        {
            api.perr({id: 'agent_key_miss', rate_limit: {count: 2}});
            return this.goto('start');
        }
        api.storage.set('agent_key', ret.agent_key);
        api.storage.set('agent_key_ts', Date.now());
        return this.goto('start');
    }, function catch$(err){
        api.perr({info: {err: zerr.e2s(err)}, id: 'agent_key_update_err',
            rate_limit: {count: 2}});
        return this.goto('start', 10*date.ms.MIN);
    }]);
}

Agent.prototype.uninit = function(){
    this.monitor_sp.return();
    this.uninited = true;
    this.agents = [];
    this.agents_pool = [];
    if (this.verify)
        this.verify.sp.return();
    delete agents[this.rule_type][this.route];
};

Agent.prototype.get_agents_type = function(){ return this.type; };

Agent.prototype.CG = function(s, def){
    return zutil.get(api.storage.get('config'), s, def); };

Agent.prototype.zgettunnels = function(ping_id, opt){
    opt = opt||{};
    var _this = this;
    return etask({name: 'zgettunnels', cancel: true}, [function(){
        var exclude = _this.exclude.concat(opt.exclude||[]).map(function(e){
            return e.host; });
        var data = {limit: opt.limit||_this.limit, ping_id: ping_id};
        if (exclude.length)
            data.exclude = exclude.join(',');
        if (_this.rule_type=='trial')
            data.is_trial = 1;
        return api.ajax.json({url: api.url_ccgi+'/zgettunnels',
            qs: assign({country: _this.route}, api.get_auth()), data: data,
            retry: 1});
    }]);
};

Agent.prototype.set_agents = function(agents, prev, exclude, opt){
    if (agents && agents.length)
    {
        var order = 0;
        if (prev.length)
        {
            prev.forEach(function(a){ order = Math.max(order, a.order); });
            ++order;
        }
        prev = prev.concat(agents.map(function(s, i){
            var match = s.match(/.* (.*):(.*)/);
            var a = {host: match[1], port: match[2], order: order+i,
                vendor: opt.vendor && opt.vendor[match[1]],
                ip: opt.ip_list[match[1]]};
            var pool;
            if (pool = opt.pool && opt.pool[match[1]])
                a.pool = pool;
            return a;
        }));
        this.type = opt.agent_types[this.route];
    }
    var agent;
    while (prev.length<this.limit && exclude.length
        && (agent=this._get_chosen(exclude)) && prev.push(agent)
        && exclude.splice(exclude.indexOf(agent), 1));
    while (prev.length<this.limit && this.exclude.length
        && (agent=this._get_chosen(this.exclude)) && prev.push(agent)
        && this.exclude.splice(this.exclude.indexOf(agent), 1));
    return prev;
};

Agent.prototype.get_agents = function(ping_id, reason){
    var _this = this, exclude, exclude_pool;
    exclude = this.agents.filter(function(a){
        return _this.should_replace(a); });
    this.agents = this.agents.filter(function(a){
        return !_this.should_replace(a); });
    exclude_pool = this.agents_pool.filter(function(a){
        return _this.should_replace(a); });
    this.agents_pool = this.agents_pool.filter(function(a){
        return !_this.should_replace(a); });
    if (this.agents.length >= _this.limit)
        return;
    return etask([function(){
        return _this.zgettunnels(ping_id, {
            exclude: exclude.concat(exclude_pool).concat(_this.agents)
            .concat(_this.agents_pool),
            limit: _this.limit - _this.agents.length});
    }, function(ret){
        if (!ret.agent_key)
            api.perr({id: 'get_agent_key_miss', rate_limit: {count: 2}});
        api.storage.set('agent_key', ret.agent_key);
        _this.agents = _this.set_agents(ret.ztun[_this.route], _this.agents,
            exclude, ret);
        if (ret.ptun)
        {
            _this.agents_pool = _this.set_agents(ret.ptun[_this.route],
                _this.agents_pool, exclude_pool, ret);
        }
        zerr.info('%s agents set, reason %s, %O', _this.route, reason,
            _this.agents);
        if (_this.agents_pool.length)
        {
            zerr.info('%s pool agents set, reason %s, %O', _this.route, reason,
                _this.agents_pool);
        }
    }]);
};

Agent.prototype.verify_req = function(ping_id, agent){
    var t0 = Date.now(), _this = this;
    return etask({name: 'verify_req', cancel: true}, [function(){
        ping_id = agent.ip+'_'+ping_id;
        if (api.ajax_via_proxy)
        {
            return api.ajax_via_proxy({type: 'GET', timeout: 7*SEC,
                rule: _this.rule, url: 'http://'+(_this.rule.link
                ||_this.rule.name)+'.trigger.hola.org/hola_trigger?'+
                'ping=verify_proxy&_='+ping_id}, {agent: agent});
        }
        var url = api.get_verify_url ? api.get_verify_url(agent) :
            'http://'+agent.ip+':'+agent.port+'/verify_proxy';
        return api.ajax.json({timeout: 7*SEC, url: url, qs: api.get_ver(),
            data: {proxy_country: _this.rule.country, ping_id: ping_id,
            root_url: _this.rule.link || _this.rule.name}});
    }, function(ret){
        var xhr;
        if ((xhr=ret.xhr) && xhr.status!=200)
        {
            return {agent: agent, res: {error: 'status',
                desc: 'unexpected status '+xhr.status}};
        }
        ret = xhr && ret.data!==undefined ? JSON.parse(ret.data) : ret;
        return {agent: agent, res: ret, t: Date.now()-t0};
    }, function catch$(err){
        return {agent: agent, res: {error: 'etask_error', desc: ''+err},
            t: Date.now()-t0, timeout: /timeout/.test(err)};
    }]);
};

Agent.prototype.set_agent_error = function(agent, error, desc){
    var i = this.exclude.findIndex(function(a){ return a.host==agent.host; });
    if (i>-1)
        this.exclude.splice(i, 1);
    i = this.agents.findIndex(function(a){ return a.host==agent.host; });
    if (i>-1)
        this.agents.splice(i, 1);
    i = this.agents_pool.findIndex(function(a){ return a.host==agent.host; });
    if (i>-1)
        this.agents_pool.splice(i, 1);
    agent.error = {error: error, desc: desc, ts: Date.now()};
    this.exclude.push(agent);
};

Agent.prototype.log = function(s){ this._log.push(s); };

Agent.prototype.verify_agents = function(ping_id, et, opt){
    opt = opt||{};
    var key = opt.key||'agents';
    this.log('verify_agents start ping_id '+ping_id+(et ? ' with et' : ''));
    var first, _this = this, exclude = [];
    ping_id = ping_id || Math.random();
    function verify_et_cont(){
        if (_this.verify.et_waiting.length)
            _this.log('verify_et_cont et # '+_this.verify.et_waiting.length);
        _this.verify.et_waiting.forEach(function(_et){ _et.continue(); });
        _this.verify.et_waiting = [];
    }
    return etask({name: 'verify_agents', cancel: true}, [function(){
    }, function(){
        if (_this.verify)
        {
            if (et)
                _this.verify.et_waiting.push(et);
            _this.verify.sp_waiting.push(this);
            _this.log('verify running, add to waiting queues');
            return this.wait();
        }
        _this.verify = {sp: this, et_waiting: et ? [et] : [], sp_waiting: []};
        _this.log('call get_agents');
        return _this.get_agents(undefined, 'verify '+opt.reason);
    }, function(){
        _this.log('call verify_req agents '+JSON.stringify(_this.agents));
        var agents = !opt.agent_preload ? [] : _this[key].filter(function(a){
            return a.last_used_ts && !a.error; });
        _this[key].filter(function(a){ return !agents.includes(a); })
         .forEach(function(a){ this.spawn(_this.verify_req(ping_id, a)); },
             this);
        _this[key] = agents;
        return this.wait_child('any', function(ret){
            _this.log('verify_req child ret '+JSON.stringify(ret));
            if (!ret || !ret.res)
                return;
            var _first = first;
            first = true;
            if (ret.res.error)
            {
                _this.set_agent_error(ret.agent, ret.res.error, ret.res.desc);
                _this.log('verify_req error '+JSON.stringify(ret.agent.error));
                exclude.push(ret);
                if (!_first || ret.timeout)
                {
                    _this.perr(ret.timeout ? 'fail_timeout' : 'first_fail',
                        {ping_id: ping_id, agent: ret.agent.host, dur: ret.t,
                        res: ret.res}, true);
                }
                return;
            }
            ret.agent.bw_available = ret.res.bw_available;
            ret.agent.country = ret.res.country;
            ret.agent.busy = ret.res.busy;
            ret.agent.bw_busy = ret.res.bw_busy;
            ret.agent.version = ret.res.version;
            ret.agent.t = ret.t;
            ret.agent.last_used_ts = Date.now();
            delete ret.agent.error;
            _this[key].push(ret.agent);
            return void verify_et_cont();
        });
    }, function(){
        if (!_this[key].length)
        {
            var agents = exclude.map(function(e){ return e.agent; });
            _this.perr('all_fail', {ping_id: ping_id, agents: agents}, true);
            if (exclude.every(function(a){ return a.timeout; }))
            {
                _this.perr('all_fail_timeout', {agents: agents,
                    ping_id: ping_id}, true);
            }
        }
        else
            _this.perr('ok', {ping_id: ping_id, agents: _this[key]});
    }, function finally$(){
        if (!_this.verify)
            return;
        var i;
        if ((i=_this.verify.sp_waiting.indexOf(this))>-1)
            return void _this.verify.sp_waiting.splice(i, 1);
        _this.last_verify = Date.now();
        _this.log('verify_agents done'+(_this.verify.et_waiting.length ?
            ' et_waiting '+_this.verify.et_waiting.length : '')
            +(_this.verify.sp_waiting.length ? ' sp_waiting '
            +_this.verify.sp_waiting.length : ''));
        verify_et_cont();
        var verify = _this.verify;
        _this.verify = undefined;
        verify.sp_waiting.forEach(function(sp){ sp.return(); });
    }]);
};

Agent.prototype.perr = function(name, info, err){
    var _this = this, rule = {};
    Object.keys(this.rule).forEach(function(r){
        if (r!='cmds')
            rule[r] = _this.rule[r];
    });
    info = assign({rule: rule, proxy_country: this.rule.country,
         hola_uid: api.storage.get('hola_uid')}, info);
    api.perr({info: info, id: 'be_verify_proxy_'+name}, err);
};

Agent.prototype.should_replace = function(agent){
    return !agent&&'empty' || agent.error&&'error' || agent.busy&&'busy' ||
        agent.bw_busy&&'bw_busy' ||
        Date.now()-agent.last_used_ts>15*date.ms.MIN&&'old';
};

Agent.prototype.is_active = function(){ return E.is_active(this.rule); };

Agent.prototype.get_best_agent = function(ping_id, opt){
    opt = opt||{};
    var key = opt.force_pool && this.agents_pool.length ? 'agents_pool' :
        'agents';
    var _this = this, verifies = 0;
    return etask({name: 'get_best_agent', cancel: true, async: true},
    [function loop(){
        var agents = _this[key];
        var ret = _this._get_chosen(agents, false, opt), reason, verify;
        var agent_preload = opt.agent_preload && agents!=_this.agents_pool;
        if (((reason = _this.should_replace(ret)) || agent_preload &&
            agents.length==1) && verifies<2 && !_this.uninited)
        {
            zerr.notice('replace best agent %s %s, reason %s, opt %O',
                _this.route, ret&&ret.host, reason, opt);
            verify = _this.verify_agents(ping_id, !ret&&this, {reason: reason,
                agent_preload: agent_preload, key: key});
            verifies++;
        }
        if (verify)
            this.set_state('loop');
        return ret ? this.return({agent: _this, chosen: ret}) : verify
            ? this.wait() : {agent: _this, error: 'no agents found'};
    }, function catch$(err){ return {agent: _this, error: ''+err};
    }]);
};

Agent.prototype.get_all_agents = function(){
    var _this = this;
    var ret = this.agents.filter(function(a){
        return !_this.should_replace(a); });
    return !ret.length ? this.agents : ret;
};

Agent.prototype._get_chosen = function(list, allow_errors, opt){
    opt = opt||{};
    var _list, agent, _this = this;
    _list = allow_errors ? list : list.filter(function(a){ return !a.error; });
    agent = _list.filter(function(a){ return !_this.should_replace(a); });
    agent = !agent.length ? _list : agent;
    var sort = this.keep_order ? function(a, b){ return a.order - b.order; }
        : function(a, b){ return b.bw_available - a.bw_available; };
    if (!allow_errors)
    {
        if (!agent.length && ['agent_error', 'user_error'].includes(opt.type))
        {
            var state = this.state ? this.state : (opt.src_rule||{}).force_peer
                ? 'peer' : 'any';
            this.state = state=='any' && opt.force_pool ? 'peer' : 'any';
            api.trigger('agent_state', {rule: opt.src_rule, curr: this.state,
                prev: state});
        }
        agent.sort(sort);
    }
    else
        agent.sort(function(a, b){ return a.error.ts - b.error.ts; });
    return agent.length ? agent[0] : !allow_errors ? this._get_chosen(list,
        true, opt) : null;
};

function find_agent(agent){
    if (!agent.host && !agent.ip)
        return;
    var keys = {agents: 1, agents_pool: 1};
    for (var t in agents)
    {
        var routes = Object.keys(agents[t]);
        for (var i = 0; i<routes.length; i++)
        {
            for (var k in keys)
            {
                var a = agents[t][routes[i]][k].find(function(_a){
                    return agent.host==_a.host || agent.ip == _a.ip; });
                if (a)
                    return a;
            }
        }
    }
}

E.is_agent = function(ip){ return !!find_agent({ip: ip}); };

E.get_rule_type = function(rule){
    return api.is_trial_rule(rule) ? 'trial' : 'def'; };

E.has_pool = function(country, pool, rule){
    var ap = agents[E.get_rule_type(rule)][country+'.pool_'+pool];
    return ap && ap.agents.length;
};

E.update_chosen = function(agent){
    if (agent = find_agent(agent))
        agent.last_used_ts = Date.now();
};

E.get_all_agents = function(route_str, rule){
    var t = E.get_rule_type(rule);
    return agents[t][route_str] && agents[t][route_str].get_all_agents();
};

E.get_agents_type = function(route_str, rule){
    var t = E.get_rule_type(rule);
    return agents[t][route_str] && agents[t][route_str].type;
};

E.get_rule_routes = function(rule){
    var route_str = [];
    if (!rule)
        return route_str;
    route_str.push(vpn_util.gen_route_str_lc({country: rule.country,
        peer: false, pool: rule.pool}));
    if (E.get_agents_type(rule.country, rule)!='vpn' && rule.peer)
    {
        route_str.push(vpn_util.gen_route_str_lc({country: rule.country,
            peer: rule.peer, pool: rule.pool}));
    }
    return route_str;
};

function get_rule_agents(rule){
    var _agents = {}, t = E.get_rule_type(rule);
    E.get_rule_routes(rule).forEach(function(e){ _agents[e] = agents[t][e]; });
    return _agents;
}

E.get_agents = function(ping_id, rule, opt){
    opt = opt||{};
    var rule_agents = get_rule_agents(rule);
    var res = {rule: rule, proxy_country: rule.country, verify_proxy: {}};
    ping_id = ping_id || Math.random();
    opt = assign({force_pool: api.is_pool_rule(rule)}, opt);
    return etask({name: 'get_agents', cancel: true}, [function(){
        var t = E.get_rule_type(rule);
        for (var route in rule_agents)
        {
            agents[t][route] = agents[t][route]||new Agent(rule, route);
            this.spawn(agents[t][route].get_best_agent(ping_id, opt));
        }
        return this.wait_child('any', function(ret){
            if (!ret)
                return;
            if (ret.error)
            {
                res.verify_proxy[ret.agent.route] = [];
                return;
            }
            var a = {host: ret.chosen.host, port: ret.chosen.port,
                ip: ret.chosen.ip, type: ret.agent.get_agents_type(),
                verified: true};
            if (ret.chosen.pool)
                a.pool = ret.chosen.pool;
            var r = [{agent: a, res: {version: ret.chosen.version,
                ip: ret.chosen.ip, bw_available: ret.chosen.bw_available,
                country: ret.chosen.country}, t: ret.chosen.t}];
            if (ret.chosen.bw_busy)
               r[0].res.bw_busy = ret.chosen.bw_busy;
            if (ret.chosen.busy)
               r[0].res.busy = ret.chosen.busy;
            res.verify_proxy[ret.agent.route] = r;
        });
    }, function(){ return res;
    }, function catch$(err){ return {info: {error: 'catch', err: ''+err}};
    }]);
};

function normalize_agent_info(agent){ return find_agent(agent)||agent; }

E.change_agents = function(ping_id, rule, opt){
    opt = opt||{};
    if (Array.isArray(opt))
        opt = {replace: opt};
    var rule_agents = get_rule_agents(rule);
    ping_id = ping_id || Math.random();
    var replace = opt.replace||[];
    for (var i=0; i<replace.length; i++)
        replace[i] = normalize_agent_info(replace[i]);
    return etask({name: 'change_agents', cancel: true}, [function(){
        var t = E.get_rule_type(rule);
        for (var route in rule_agents)
        {
            var agent = agents[t][route] = agents[t][route] ||
                new Agent(rule, route);
            replace.forEach(function(r){
                if (r)
                    agent.set_agent_error(r, 'force_change');
            });
        }
        return E.get_agents(ping_id, rule, zutil.pick(opt, 'type',
            'agent_preload', 'src_rule'));
    }]);
};

if (zutil.is_mocha())
{
    E.t = {
        cache_entry: cache_entry,
        choose_strategy: choose_strategy,
        expected_types: expected_types,
        extensions: extensions,
        strategies: strategies,
        Agent: Agent,
        get_api: function(){ return api; },
    };
}

E.unblocker_json_set({});

return E; }); }());
