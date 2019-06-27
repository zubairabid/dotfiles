// LICENSE_CODE ZON
'use strict'; 
define(['jquery', 'underscore', 'backbone', '/bext/pub/backbone.js',
    '/util/etask.js', '/bext/pub/util.js', '/bext/vpn/pub/tabs.js',
    '/bext/pub/ext.js', '/protocol/pub/pac_engine.js',
    '/bext/pub/browser.js', '/svc/vpn/pub/util.js',
    '/util/escape.js', '/bext/pub/lib.js', '/util/url.js', '/util/date.js',
    '/util/zerr.js', '/util/browser.js', '/bext/vpn/pub/util.js',
    '/bext/vpn/pub/agent.js', '/util/util.js',
    '/bext/vpn/pub/pac.js', '/util/array.js', '/util/attrib.js',
    '/util/string.js', '/svc/vpn/pub/unblocker_lib.js',
    '/bext/vpn/pub/hybrid_mock.js', '/bext/vpn/pub/features.js',
    '/bext/vpn/pub/premium.js', '/util/storage.js', '/util/ajax.js',
    '/bext/vpn/pub/info.js', '/bext/vpn/pub/mitm_lib.js',
    '/bext/vpn/pub/svc.js', '/bext/vpn/pub/premium.js',
    '/bext/vpn/pub/trial.js', '/bext/pub/version_util.js',
    '/util/rate_limit.js'],
    function($, _, Backbone, be_backbone, etask, be_util, be_tabs, be_ext,
    pac_engine, B, svc_util, zescape, be_lib, zurl, date, zerr, browser,
    be_vpn_util, be_agent, zutil, be_pac, array, attrib, string, unblocker_lib,
    hybrid_mock, be_features, premium, storage, ajax, be_info, mitm_lib,
    be_svc, be_premium, be_trial, be_version_util, rate_limit){
B.assert_bg('be_tab_unblocker');
var assign = Object.assign, chrome = window.chrome;
var be_bg_main = window.be_bg_main; 
var bw_perr_conf = [], proxy_debug, proxy_debug_timing, debug_hooks;
var requests_handler;
var E = new (be_backbone.model.extend({tab_unblockers: {}, requests: {},
    agent_requests: {}, internal_reqs: {}, routing_reqs: {}, routing_trace: {},
    _defaults: function(){ this.on('destroy', function(){ E.uninit(); }); },
}))();
var cb_wrapper = zerr.catch_unhandled_exception;
var bext_config = {};
var new_firefox = be_util.browser_guess.browser=='firefox' &&
    +be_util.browser_guess.version>=54;
var force_agent = storage.get_json('be_force_agent');
var force_strategy = storage.get('be_force_strategy');
var load_errors = {}, media_failure_rl = {};
var status_rx = /^HTTP\/[^\s]+\s(\d\d\d)\s/;
var req_seq = {}, is_trace_cb;
var DEBUG_REQS = [
    {url: /netflix|nflx/i, status: 420, info: get_nflx_info, vpn_dns: 1},
];
var mitm_tab_hooks = [
    {l: 'onBeforeRequest', cbname: 'on_before_request', extra_opt: true},
    {l: 'onCompleted', cbname: 'on_completed'},
    {l: 'onErrorOccurred', cbname: 'on_error_occurred'},
];
var err_logs_len = 20;

function get_nflx_info(d){
    var hdrs, session, ip;
    if (!(hdrs = d&&d.responseHeaders))
        return '';
    var print = ['x-netflix-geo-check', 'x-session-info', 'x-tcp-info'];
    var get_hdr = function(n){
        n = n.toLowerCase();
        return (hdrs.find(function(h){ return h.name.toLowerCase()==n; })||{})
        .value;
    };
    var ret = print.map(function(p){ return p+':'+get_hdr(p); }).join(';');
    if ((session = get_hdr('x-session-info')) &&
        (ip = session.match(/^addr=([\d.]+);/)) && ip[1])
    {
        ret = 'ip:'+ip[1]+';'+ret;
    }
    return ret;
}

function is_cors(req){
    if (req.type!='xmlhttprequest')
        return false;
    var main_url = be_tabs.get_url(req.tabId);
    if (!main_url)
        return true;
    return zurl.get_host(main_url)!=zurl.get_host(req.url);
}

var ff_exported = []; 
function ff_cb_wrapper(name){
    var args = array.slice(arguments, 1);
    var wrapped = zerr.catch_unhandled_exception.apply(zerr, args);
    ff_exported.push({fn: wrapped, name: name});
    return wrapped;
}

function is_main_frame(details){
    return !details.frameId && details.type=='main_frame'; }

var hola_req_id = 0;
function make_internal_request(url, hdrs, opt){
    var req_url;
    req_url = 'http://internal.hola/'+(++hola_req_id);
    E.internal_reqs[req_url] = {url: url, hdrs: hdrs, opt: opt};
    return req_url;
}
function hola_XMLHttpRequest(url, method, hdrs, opt){
    var xhr = new XMLHttpRequest();
    var req_url = make_internal_request(url, hdrs, opt);
    xhr.hola_url = req_url;
    xhr.open(method, req_url);
    return xhr;
}

function hdrs_arr_to_obj(hdrs){
    var _hdrs = {};
    for (var i=0; i<hdrs.length; i++)
        _hdrs[hdrs[i].name] = hdrs[i].value;
    return _hdrs;
}

function routing_reqs_set_timer(url){
    E.routing_reqs[url].to = setTimeout(function(){
        delete E.routing_reqs[url]; }, 10000);
}

function routing_reqs_set(details, req){
    if (!E.routing_reqs[req.url])
        E.routing_reqs[req.url] = {req: req};
    routing_reqs_set_timer(req.url);
}

function send_direct_ajax(req){
    if (req.direct_req)
        return;
    req.hdrs = hdrs_arr_to_obj(req.hdrs);
    req.hdrs['Cache-Control'] = 'no-cache';
    try {
        var xhr = req.direct_req = hola_XMLHttpRequest(req.url, req.method,
            req.hdrs, {force: 'direct', ignore_redir: true, no_routing: true});
        trace_req(req, 'sending direct');
        xhr.onreadystatechange = cb_wrapper(function(){
            var cmd;
            if (xhr.readyState===xhr.DONE)
            {
                trace_req(req, 'direct done');
                var ir = E.internal_reqs[req.url]||{};
                if (!req.direct_resp && ir.res)
                    req.direct_resp = {code: ir.res.code, error: ir.res.error};
                cmd = req.strategy(req.direct_resp, req.proxy_resp)||{};
                trace_req(req, cmd.log);
                delete E.internal_reqs[req.url];
                delete E.internal_reqs[xhr.hola_url];
            }
            if (xhr.readyState!=xhr.HEADERS_RECEIVED)
                return;
            trace_req(req, 'direct headers received');
            req.direct_resp = {
                code: xhr.status,
                len: xhr.getResponseHeader('Content-Length'),
                te: xhr.getResponseHeader('Transfer-Encoding'),
                lmod: xhr.getResponseHeader('Last-Modified'),
                etag: xhr.getResponseHeader('Etag'),
                type: xhr.getResponseHeader('Content-Type'),
            };
            function direct_req_abort(){
                trace_req(req, 'aborting direct');
                if (req.direct_req.abort)
                    return req.direct_req.abort();
                var trace = proxy_debug && E.routing_trace[req.id];
                if (!trace)
                    return;
                trace = trace.trace;
                be_lib.perr_err({id: 'new_unblocker_api_direct_req_no_abort',
                    info: {url: req.url, rule: zutil.get(req, 'opt.rule.id'),
                    method: req.method,
                    strategy: zutil.get(req, 'strategy.desc'),
                    trace: build_trace_string(req.id, trace)},
                    bt: (new Error()).stack});
            }
            if (req.direct_timeout)
                clearTimeout(req.direct_timeout);
            cmd = req.strategy(req.direct_resp, req.proxy_resp)||{};
            trace_req(req, cmd.log);
            if (cmd.proxy.serve && !cmd.direct.serve)
                return void direct_req_abort();
            var cc = xhr.getResponseHeader('Cache-Control');
            if (cc && (/no-store/.test(cc)
                || /(no-cache|must-revalidate|max-age)/.test(cc)
                && !req.direct_resp.lmod && !req.direct_resp.etag))
            {
                direct_req_abort();
            }
        });
        xhr.send();
    } catch(e){}
}

function firefox_redirect(req, details, proxy_str){
    if (!hybrid_mock.initialized || req.redirected)
        return;
    if (new_firefox && !req.opt.int_req && is_cors(details))
        return void trace_req(details, 'cannot restart cors');
    trace_req(details, 'restarting');
    E.requests[details.requestId] = req;
    req.redirect_route_str = proxy_str;
    req.redirected = true;
    details.ret.redirectUrl = details.url;
}

function nodify_res(details){
    var ret, n = details.statusLine.match(/^HTTP\/(\d\.\d) (\d{3})( (.*))?$/);
    if (!n)
    {
        be_lib.perr_err({id: 'bad_status_line', rate_limit: {count: 2},
            info: {statusLine: details.statusLine, url: details.url,
                method: details.method, statusCode: details.statusCode}});
        n = [null, '1.1', details.statusCode, ' ', ''];
    }
    ret = {
        httpVersion: n[1],
        statusCode: +n[2],
        reasonPhrase: n[4]||'',
        headers: {},
    };
    if (!details.responseHeaders)
        return ret;
    try {
        details.responseHeaders.forEach(function(hdr){
            ret.headers[hdr.name.toLowerCase()] = hdr.value; });
    } catch(e){}
    return ret;
}

function hdrs_rm(hdrs, name){
    for (var i=0; i<hdrs.length; i++)
    {
        if (hdrs[i].name.toLowerCase()!=name)
            continue;
        hdrs.splice(i, 1);
        return true;
    }
    return false;
}

function hdrs_add(hdrs, name, value){
    hdrs.push({name: name, value: value});
    return true;
}

class Bw_perr_acc {
    constructor(){
        this.data = {};
    }
    _send(bw_rule, acc){
        acc.id = bw_rule.id;
        be_lib.perr_ok({id: 'req_bw', info: {len: acc.len, ms: acc.ms,
            id: acc.id, country: acc.rule && acc.rule.country}});
        delete this.data[bw_rule.id];
    }
    push(bw_rule, req){
        let acc = this.data[bw_rule.id];
        if (acc && acc.rule!=req.opt.rule)
            this._send(bw_rule, acc);
        acc = this.data[bw_rule.id] = this.data[bw_rule.id]||{len: 0, ms: 0,
            rule: req.opt.rule};
        acc.len += +req.proxy_resp.len;
        acc.ms += Date.now()-req.start_ts;
        if (acc.len>(bw_rule.sample_size||10*1024*1024))
            this._send(bw_rule, acc);
    }
}

let bw_perr_acc = new Bw_perr_acc();

function get_bw_perr_rule(req){
    if (!req || !req.proxy_resp)
        return false;
    if (req.method!='GET')
        return false;
    return bw_perr_conf.find(r=>r.url.find(re=>re.test(req.url)));
}

function is_force_proxy(country, opt){
    opt = opt||{};
    var r = opt.rule, tu = opt.tab_unblocker||{};
    if (!r || !r.name || !be_ext.get('is_premium') && (!E.rules ||
        (E.rules.blacklist||{})[r.name] || tu.force_premium))
    {
        return;
    }
    var is_active = be_premium.is_active();
    return !is_active && (be_trial.get_trial_active(r.name) ||
        be_trial.is_trial_grace_period(r.name)) || is_active &&
        (r.mode=='protect' || r.full_vpn || tu.force_premium ||
        be_ext.get('is_premium'));
}

function get_forced_strategy(details, rule, mitm_rule, strict, opt){
    var force;
    if (force = strict||opt.force)
        return force;
    if (rule.md5=='premium')
        return 'proxy';
    if (opt.no_rule || !be_ext.get('is_premium') && rule.name &&
        be_util.is_google(rule.name) && (!mitm_rule ||
        mitm_rule.cmd=='ignore'))
    {
        return 'direct';
    }
    return be_ext.get('gen.peer_fallback_on') && rule.force_peer ? 'peer' :
        null;
}

function trace_req_cb(d){
    if (!is_trace_cb)
        return;
    var c, reqid = d.requestId, url = d.url;
    if (!(c = req_seq[reqid]))
        c = req_seq[reqid] = {};
    if (!c[d.cbname] || c[d.cbname].url!=url)
        c[d.cbname] = {n: 0, url: url};
    c[d.cbname].n += 1;
    if (c[d.cbname].n>2)
        c.error = true;
}

function trace_req_cb_end(d){
    var c, reqid = (d||{}).requestId;
    if (!is_trace_cb || !(c = req_seq[reqid]))
        return;
    delete req_seq[reqid];
    if (!c.error)
        return;
    for (var e in c)
    {
        if (c[e].n<3)
            continue;
        be_lib.perr_err({id: 'req_hooks_err', rate_limit: {count: 1},
            info: {cbname: e, url: d.url, reqid: reqid, n: c[e].n,
            type: d.type, tabid: d.tabId}});
    }
}

function on_hooks_err(id, err){
    be_lib.perr_err({id, err, rate_limit: {count: 1}}); }

function get_rule_min_fmt(rule){ return _.pick(rule||{}, 'name', 'country'); }

class Base_handler {
    constructor(){
        var b = be_util.browser_guess;
        this.listener_opt = {urls: ['<all_urls>']};
        this.listener_extra_opt = ['blocking'];
        if (b.browser=='chrome' || b.browser=='firefox' && +b.version>=53)
            this.listener_extra_opt.push('requestBody');
        this.add_trace_wrappers();
        this.tab_unblocker_end_cb = cb_wrapper(
            this._unsafe_tab_unblocker_end_cb.bind(this));
        this.on_before_send_headers = this.wrap('on_before_send_headers', d=>{
            this.tab_unblocker_cb(d = assign({}, d, {handler:
                this._on_before_send_headers.bind(this),
                cbname: 'on_before_send_headers', ret: {}}));
            return d.ret;
        }, true);
        this.on_headers_received = this.wrap('on_headers_received', d=>{
            this.tab_unblocker_cb(d = assign({}, d, {handler:
                this._on_headers_received.bind(this),
                cbname: 'on_headers_received', ret: {}}));
            return d.ret;
        }, true);
        this.on_completed = this.wrap('on_completed', d=>{
            this.tab_unblocker_end_cb(d = assign({}, d, {cbname:
                'on_completed', ret: {}}));
            delete this.cached_reqid[d.requestId];
            return d.ret;
        }, true);
        this.on_error_occurred = this.wrap('on_error_occurred', d=>{
            this.tab_unblocker_end_cb(assign(d, {cbname: 'on_error_occurred',
                ret: {}}));
            return d.ret;
        });
        this.on_headers_received_cache = cb_wrapper(d=>{
            var url;
            if (!E.rules || !(url = be_tabs.get_nav_tab_url(d.tabId)))
                return;
            if (_.findWhere(E.rules.unblocker_rules, {enabled: true,
                link: svc_util.get_root_url(url)}) &&
                !this.cached_reqid[d.requestId])
            {
                this.cached_reqid[d.requestId] = true;
                return {redirectUrl: zescape.uri(d.url, {ts: Date.now()})};
            }
        });
        this.on_headers_received_page = cb_wrapper(d=>{
            if (!d || !is_main_frame(d))
                return;
            var status = d.statusCode;
            if (status===undefined)
            {
                status = d.statusLine;
                if (typeof status!='string')
                    return;
                if (status = status.match(status_rx))
                    status = status[1]||null;
                if (status===null)
                    return;
            }
            else
                status += '';
            d.statusCode = status;
            be_tabs.page_trace(d, 'on_headers_received');
            if (status=='301' || status=='302')
            {
                be_tabs.track_redirect({id: d.tabId, url: d.url, info: d});
                return;
            }
            if (!{4: 1, 5: 1}[status[0]])
                return;
            be_tabs.trigger('error_occured', {id: d.tabId, info: {type: d.type,
                http_status_code: status}});
        });
        var add_trace = (d, field)=>{
            var trace = proxy_debug && E.routing_trace[d.requestId];
            if (!trace)
                return;
            trace = trace.trace;
            d.ret[field] = d.ret[field]||d[field]||[];
            hdrs_add(d.ret[field], 'X-Hola-Unblocker-Bext',
                build_trace_string(d.requestId, trace));
            hdrs_add(d.ret[field], 'X-Hola-Request-Id', d.requestId);
        };
        this.on_before_send_headers_debug = ff_cb_wrapper(
            'on_before_send_headers_debug', d=>{
            d = assign({}, d, {ret: {}});
            add_trace(d, 'requestHeaders');
            var req = E.requests[d.requestId], agent = req&&req.agent;
            var store = E.tab_unblockers[d.tabId]||this;
            if (!agent || agent.ip==(store.last_agent||{}).ip)
                return d.ret;
            zerr.notice('tab:%d proxy agent selected %O %s', d.tabId, agent,
                req.url.slice(0, 100));
            var rule;
            if (rule = req.opt.rule)
            {
                zerr.notice('tab:%d rule %O', d.tabId, zutil.pick(rule, 'id',
                    'name', 'country', 'description', 'peer'));
            }
            store.last_agent = agent;
            return d.ret;
        });
        this.on_headers_received_debug = ff_cb_wrapper(
            'on_headers_received_debug', d=>{
            d = assign({}, d, {ret: {}});
            add_trace(d, 'responseHeaders');
            return d.ret;
        });
        this.on_completed_debug = ff_cb_wrapper('on_completed_debug', d=>{
            var reqid = d.requestId;
            var req = E.requests[reqid];
            if (!req)
                return;
            var rule = get_rule_min_fmt(req.opt.rule);
            var limit = {count: 1, ms: date.ms.MIN};
            var info = {url: req.url, ip: d.ip, method: req.method,
                agent: req.agent, rule: rule};
            var tab_unblocker = get_tab_unblocker(d.tabId);
            if (tab_unblocker && req.proxy_req && d.ip &&
                be_ext.get('gen.req_ip_check') &&
                zutil.get(req, 'agent.ip')!=d.ip)
            {
                be_lib.perr_err({id: 'req_direct_err', rate_limit: limit,
                    info: info});
            }
            var bw_perr_r;
            if ((bw_perr_r = get_bw_perr_rule(req)) && bw_perr_r.error_code &&
                bw_perr_r.error_code.includes(req.proxy_resp.code))
            {
                be_lib.perr_err({id: 'bw_req_err_'+bw_perr_r.id,
                    rate_limit: limit,
                    info: assign({error: req.proxy_resp.code}, info)});
            }
            if (!d.error || !tab_unblocker)
                return;
            var rl_path = 'debug_errors.'+d.error+'.'+!!req.agent, rl;
            if (!(rl = zutil.get(tab_unblocker, rl_path)))
                zutil.set(tab_unblocker, rl_path, rl = {total: 0});
            rl.total++;
            if (!rate_limit(rl, limit.ms, limit.count))
                return;
            zerr.debug('tab:%d request failed with error %s after %d ms, '
                +'total cnt %d, rule %s, type %s, method %s, agent %s, url %s',
                d.tabId, d.error, Date.now()-req.start_ts, rl.total,
                req.opt.rule&&req.opt.rule.name, d.type, req.method,
                req.agent&&req.agent.host, req.url.slice(0, 200));
        });
        this.on_headers_received_media = ff_cb_wrapper(
            'on_headers_received_media', d=>{
            var media_failure;
            if (!(media_failure = get_failure_config('media')))
                return;
            var req, tab;
            if (d.tabId<0 || !(tab = E.tab_unblockers[d.tabId]) ||
                !(req = E.requests[d.requestId]))
            {
                return;
            }
            tab.media_chunks = tab.media_chunks||0;
            var media_agents = tab.media_agents = tab.media_agents||{};
            var agent = req.agent&&req.agent.host;
            if (d.statusCode==200)
            {
                tab.media_chunks++;
                if (agent)
                    media_agents[agent] = (media_agents[agent]||0)+1;
                return;
            }
            if (!/^(4|5)/.test(d.statusCode) || d.statusCode==407)
                return;
            if (agent)
                tab.media_failures = (tab.media_failures||0)+1;
            var page_url = be_tabs.get_url(d.tabId), root_url;
            if (page_url)
                root_url = svc_util.get_root_url(page_url);
            var debug = DEBUG_REQS.find(f=>f.url.test(d.url) && (!f.status ||
                f.status && f.status==d.statusCode));
            if (debug&&debug.vpn_dns&&agent)
            {
                debug.vpn_dns--;
                etask([function(){
                    return ajax.json({url: 'http://'+req.agent.ip+':3358/debug'
                        +'/vpn_dns'});
                }, function(ret){
                    if (!ret || !ret.active_dns)
                        return;
                    zerr.notice('tab:%d agent %s active dns %s', d.tabId,
                        agent, ret.active_dns);
                }, function catch$(){
                    zerr.notice('tab:%d agent %s failed to get active dns',
                        d.tabId, agent);
                }]);
            }
            zerr.notice('tab:%d media failure detected: %d, %s %s, info: %s',
                d.tabId, d.statusCode, agent, d.url.slice(0, 200),
                debug&&debug.info ? debug.info(d) : '');
            this.dump_media_stats(d.tabId, 'error');
            var rule;
            var set_err = root_url && req.agent &&
                (rule = media_failure.rules.find(function(r){
                return r.domain==root_url; })) && rule.set_err;
            if (!media_failure.disable_perr)
            {
                be_lib.perr_ok({id: 'media_failure_detected',
                    info: {url: d.url, code: d.statusCode, page_url: page_url,
                    root_url: root_url, agent: agent, set_err: !!set_err},
                    rate_limit: {count: 1}});
            }
            if (media_failure.disable_set_err || !set_err)
                return;
            var limit = assign({}, media_failure.set_err_rate_limit,
                {ms: date.ms.HOUR, count: 1});
            var rl_hash = media_failure_rl[root_url] =
                media_failure_rl[root_url]||{};
            var rl = rl_hash[agent] = rl_hash[agent]||{};
            if (!rate_limit(rl, limit.ms, limit.count))
            {
                zerr.debug('tab:%d set_err limit exeeded: %s', d.tabId, agent);
                return;
            }
            var domain = zurl.parse(d.url).host;
            zerr.notice('tab:%d set_err: %s domain=%s', d.tabId, agent,
                domain);
            etask('set_err', [function(){
                return ajax.json({url: zescape.uri('https://'+agent+':'
                    +req.agent.port+'/set_err', {domain: domain,
                    err_code: d.statusCode})});
            }, function(ret){
                if (!ret || !ret.res)
                    throw new Error('empty res');
            }, function catch$(err){
                be_lib.perr_err({id: 'media_failure_set_err_failed', err: err,
                    rate_limit: {count: 1}});
            }]);
        });
        this.on_headers_received_browse = ff_cb_wrapper(
            'on_headers_received_browse', d=>{
            var failure;
            if (!(failure = get_failure_config('browse')))
                return;
            var req, tab;
            if (d.tabId<0 || !(tab = E.tab_unblockers[d.tabId]) ||
                !(req = E.requests[d.requestId]) ||
                !/^(4|5)/.test(d.statusCode) || d.statusCode==407)
            {
                return;
            }
            if (req.agent)
                tab.browse_failures = (tab.browse_failures||0)+1;
            var page_url = be_tabs.get_url(d.tabId), root_url;
            if (page_url)
                root_url = svc_util.get_root_url(page_url);
            zerr.notice('tab:%d browse failure detected: %d %s', d.tabId,
                d.statusCode, d.url.slice(0, 200));
            if (!failure.disable_perr)
            {
                be_lib.perr_ok({id: 'browse_failure_detected',
                    info: {url: d.url, code: d.statusCode, page_url: page_url,
                    root_url: root_url, agent: req.agent&&req.agent.host},
                    rate_limit: {count: 1}});
            }
        });
    }

    wrap(name, cb, ff){
        var cb_wrap = cb=>ff ? ff_cb_wrapper(name, cb) : cb_wrapper(cb);
        if (!proxy_debug || !this.trace_wrappers || !this.trace_wrappers[name])
            return cb_wrap(cb);
        var before = this.trace_wrappers[name].before;
        var after = this.trace_wrappers[name].after;
        if (!before && !after)
            return cb_wrap(cb);
        return cb_wrap(d=>{
            var ctx;
            if (before)
                ctx = before(d);
            var ret = cb(d);
            if (after)
                after(d, ctx||{}, ret);
            return ret;
        });
    }

    add_trace_wrappers(){
        this.add_trace_wrapper('on_before_send_headers', {
            before: d=>{
                trace_req(d, 'send headers');
                return this.tab_unblocker_cb_trace(d);
            },
            after: (d, ctx, ret)=>{
                if (ret.requestHeaders)
                    trace_req(d, 'hdrs modified');
                this.after_tab_unblocker_cb_trace(d, ctx, ret);
            },
        });
        this.add_trace_wrapper('on_headers_received', {
            before: d=>{
                trace_req(d, 'headers received');
                var ctx = this.tab_unblocker_cb_trace(d);
                var req = E.requests[d.requestId];
                ctx.routing_req = req && E.routing_reqs[req.rul];
                return ctx;
            },
            after: (d, ctx, ret)=>{
                var req = E.requests[d.requestId];
                var res = nodify_res(d);
                if (!req)
                    return;
                if (E.routing_reqs[req.url] && !ctx.routing_req)
                    trace_req(d, 'set routing req');
                var status = d.statusLine ? 'status: '+d.statusLine : '';
                if (!res)
                    return void trace_req(d, 'invalid res '+status);
                var cmd = req.cmd, log = cmd&&cmd.log||'';
                var tab_unblocker = get_tab_unblocker(d.tabId);
                var hola_warn = res.headers['x-hola-warning'];
                var hola_agent = res.statusCode==407 &&
                    res.headers['proxy-authenticate']==
                    'Basic realm="HolaUnblocker"';
                if (hola_warn && tab_unblocker &&
                    !tab_unblocker.rule.changing_proxy)
                {
                    trace_req(d, hola_warn+' warning from agent', {level:
                        'warn'});
                }
                if (req.proxy_req)
                {
                    if (hola_agent)
                        return void trace_req(d, 'agent 407');
                }
                if (req.serving)
                {
                    trace_req(d, 'serving '+req.serving+' '+log);
                    if (req.serving=='proxy' && req.direct_req)
                        trace_req(d, 'aborting direct request');
                    else if (req.direct_timeout)
                        trace_req(d, 'direct timeout');
                }
                if (req.direct_req==false && ret.redirectUrl)
                    trace_req(d, 'direct_first redirect');
            },
        });
        this.add_trace_wrapper('on_completed', {
            before: d=>{
                trace_req(d, 'completed');
                if (d.error && E.requests[d.requestId])
                    trace_req(d, 'error '+d.error, {level: 'err'});
            }
        });
        this.add_trace_wrapper('on_error_occurred', {
            before: d=>{
                trace_req(d, 'error occurred');
                if (d.error && E.requests[d.requestId])
                    trace_req(d, 'error '+d.error, {level: 'err'});
            },
        });
    }

    add_trace_wrapper(name, wrappers){
        this.trace_wrappers = this.trace_wrappers||{};
        this.trace_wrappers[name] = assign({}, this.trace_wrappers[name],
            wrappers);
    }

    static get_handler(){
        if (zutil.get(window, 'browser.proxy.onRequest'))
            return new Ff_new_handler();
        return new Chrome_handler();
    }

    init(){
        if (this.inited)
            return;
        this.inited = true;
        this.cached_reqid = {};
        this.update_hooks();
        this.init_media_stats();
        return true;
    }

    uninit(){
        if (!this.inited)
            return;
        this.inited = false;
        this.uninit_media_stats();
        this.update_hooks();
        this.cached_reqid = {};
        return true;
    }

    update_hooks(mode){
        let add_global = ()=>{
            if (!this.global_hooks)
                this.global_hooks = this.add_hooks('main_frame');
        };
        let rm_global = ()=>{
            if (this.global_hooks)
                this.global_hooks = this.remove_hooks(this.global_hooks);
        };
        let add_local = ()=>{
            for (let tabid in E.tab_unblockers)
            {
                let tab = E.tab_unblockers[tabid];
                if (!tab.hooks)
                    tab.hooks = this.add_hooks(tabid);
            }
        };
        let rm_local = ()=>{
            for (let tabid in E.tab_unblockers)
            {
                let tab = E.tab_unblockers[tabid];
                if (tab.hooks)
                    tab.hooks = this.remove_hooks(tab.hooks);
            }
        };
        if (mode=='all_browser')
            return rm_local();
        if (!this.inited)
        {
            rm_global();
            rm_local();
        }
        else
        {
            add_global();
            add_local();
        }
    }

    add_hooks(tabid){
        let hooks = {}, _this = this;
        try {
            if (tabid=='main_frame')
            {
                let topt = {urls: ['<all_urls>'], types: ['main_frame']};
                hooks.on_headers_received_page = this.on_headers_received_page
                    .bind(this);
                chrome.webRequest.onHeadersReceived.addListener(
                    hooks.on_headers_received_page, topt, ['responseHeaders']);
                return hooks;
            }
            tabid = +tabid;
            this.prev_req = this.prev_req||{};
            let wrap = (name, cb)=>{
                return d=>{
                    let prev = this.prev_req[name]||{};
                    if (tabid>=0 && is_trace_cb && d.tabId==-1 &&
                        prev.requestId==d.requestId &&
                        prev.timeStamp==d.timeStamp)
                    {
                        return;
                    }
                    this.prev_req[name] = d;
                    return cb(d);
                };
            };
            assign(hooks, {
                on_before_send_headers: wrap('on_before_send_headers',
                    this.on_before_send_headers.bind(this)),
                on_headers_received: wrap('on_headers_received',
                    this.on_headers_received.bind(this)),
                on_completed: wrap('on_completed', this.on_completed
                    .bind(this)),
                on_error_occurred: wrap('on_error_occurred',
                    this.on_error_occurred.bind(this)),
            });
            let opt = tabid>=0 ? assign({tabId: tabid}, this.listener_opt) :
                this.listener_opt;
            if (debug_hooks)
            {
                hooks.on_completed_debug = wrap('on_completed_debug',
                    this.on_completed_debug.bind(this));
                chrome.webRequest.onCompleted.addListener(
                    hooks.on_completed_debug, opt);
                hooks.on_error_occurred_debug = wrap('on_error_occurred_debug',
                    this.on_completed_debug.bind(this));
                chrome.webRequest.onErrorOccurred.addListener(
                    hooks.on_error_occurred_debug, opt);
            }
            chrome.webRequest.onBeforeSendHeaders.addListener(
                hooks.on_before_send_headers, opt, ['blocking',
                'requestHeaders']);
            chrome.webRequest.onHeadersReceived.addListener(
                hooks.on_headers_received, opt, ['blocking',
                'responseHeaders']);
            chrome.webRequest.onCompleted.addListener(hooks.on_completed, opt);
            chrome.webRequest.onErrorOccurred.addListener(
                hooks.on_error_occurred, opt);
            ['media', 'browse'].forEach(function(name){
                var failure_opt;
                if (!(failure_opt = _this.get_failure_opt(tabid, name, opt)))
                    return;
                var hname = 'on_headers_received_'+name;
                hooks[hname] = wrap(hname, _this[hname].bind(_this));
                chrome.webRequest.onHeadersReceived.addListener(
                    hooks[hname], failure_opt, ['responseHeaders']);
                if (name!='media')
                    return;
                hooks.media_interval = setInterval(_this.dump_media_stats
                    .bind(_this, tabid, 'interval'), 10*date.ms.MIN);
            });
            let topt = {urls: ['*://*/*wor*/*i*/1*.js',
                '*://*/*wor*/*i*/2*.js*']};
            if (opt.tabId>=0)
                topt.tabId = opt.tabId;
            hooks.on_headers_received_cache = wrap('on_headers_received_cache',
                this.on_headers_received_cache.bind(this));
            chrome.webRequest.onHeadersReceived.addListener(
                hooks.on_headers_received_cache, topt, ['blocking',
                'responseHeaders']);
            if (!debug_hooks)
                return hooks;
            hooks.on_before_send_headers_debug =
                wrap('on_before_send_headers_debug',
                this.on_before_send_headers_debug.bind(this));
            chrome.webRequest.onBeforeSendHeaders.addListener(
                hooks.on_before_send_headers_debug, opt, ['blocking',
                'requestHeaders']);
            hooks.on_headers_received_debug = wrap('on_headers_received_debug',
                this.on_headers_received_debug.bind(this));
            chrome.webRequest.onHeadersReceived.addListener(
                hooks.on_headers_received_debug, opt, ['blocking',
                'responseHeaders']);
        } catch(e){ on_hooks_err('be_add_hooks_err', e); }
        return hooks;
    }

    get_failure_opt(tabid, name, opt){
        var failure;
        if (!(failure = get_failure_config(name)))
            return;
        var ext = failure.extensions||[], types = failure.types;
        var urls = [], root_url;
        if (root_url = tabid>=0 && be_tabs.get_url(tabid))
            root_url = svc_util.get_root_url(root_url);
        var rules = failure.rules;
        if (root_url)
            rules = rules.filter(function(r){ return r.domain==root_url; });
        rules.forEach(function(r){
            if (r.urls)
                urls = urls.concat(r.urls);
            if (r.extensions)
                ext = ext.concat(r.extensions);
        });
        ext = array.unique(ext);
        ext.forEach(function(e){
            urls.push('*://*/*.'+e, '*://*/*.'+e+'?*'); });
        urls = array.unique(urls);
        if (urls.length)
            return assign({}, opt, {urls: urls, types: types});
    }

    init_media_stats(){
        if (this.on_video_progress)
            return;
        E.on('video_progress', this.on_video_progress = function(msg){
            var tab = get_tab_unblocker(msg.tab_id);
            if (tab&&msg.progress)
                tab.video_progress = (tab.video_progress||0)+msg.progress;
        });
        E.listenTo(be_ext, 'change:ui_open', this.on_ui_open = function(c, ui){
            if (ui&&ui.tab_id)
                this.dump_media_stats(ui.tab_id, 'ui_open');
        }.bind(this));
    }

    uninit_media_stats(){
        if (this.on_video_progress)
            E.off('video_progress', this.on_video_progress);
        this.on_video_progress = null;
        if (this.on_ui_open)
            E.stopListening(be_ext, 'change:ui_open', this.on_ui_open);
        this.on_ui_open = null;
    }

    dump_media_stats(tab_id, reason){
        var tab = get_tab_unblocker(tab_id);
        if (!tab || !tab.media_agents)
            return;
        zerr.debug('tab:%d media stats on %s: %d sec played, %d chunks '
            +'received, agents %O', tab_id, reason, tab.video_progress||0,
            tab.media_chunks||0, tab.media_agents||{});
        tab.media_chunks = 0;
        tab.media_agents = {};
        tab.video_progress = 0;
    }

    remove_hooks(hooks){
        try {
            if (hooks.on_before_send_headers)
            {
                chrome.webRequest.onBeforeSendHeaders.removeListener(
                    hooks.on_before_send_headers);
            }
            if (hooks.on_headers_received)
            {
                chrome.webRequest.onHeadersReceived.removeListener(
                    hooks.on_headers_received);
            }
            if (hooks.on_completed)
            {
                chrome.webRequest.onCompleted.removeListener(
                    hooks.on_completed);
            }
            if (hooks.on_error_occurred)
            {
                chrome.webRequest.onErrorOccurred.removeListener(
                    hooks.on_error_occurred);
            }
            if (hooks.on_headers_received_cache)
            {
                chrome.webRequest.onHeadersReceived.removeListener(
                    hooks.on_headers_received_cache);
            }
            if (hooks.on_headers_received_page)
            {
                chrome.webRequest.onHeadersReceived.removeListener(
                    hooks.on_headers_received_page);
            }
            if (hooks.on_completed_debug)
            {
                chrome.webRequest.onCompleted.removeListener(
                    hooks.on_completed_debug);
            }
            if (hooks.on_error_occurred_debug)
            {
                chrome.webRequest.onErrorOccurred.removeListener(
                    hooks.on_error_occurred_debug);
            }
            if (hooks.on_before_send_headers_debug)
            {
                chrome.webRequest.onBeforeSendHeaders.removeListener(
                    hooks.on_before_send_headers_debug);
            }
            if (hooks.on_headers_received_debug)
            {
                chrome.webRequest.onHeadersReceived.removeListener(
                    hooks.on_headers_received_debug);
            }
            if (hooks.on_headers_received_media)
            {
                chrome.webRequest.onHeadersReceived.removeListener(
                    hooks.on_headers_received_media);
                clearInterval(hooks.media_interval);
            }
            if (hooks.on_headers_received_browse)
            {
                chrome.webRequest.onHeadersReceived.removeListener(
                    hooks.on_headers_received_browse);
            }
        } catch(e){ on_hooks_err('be_rm_hooks_err', e); }
    }

    gen_proxy_req(){}

    _on_first_request(details, opt){
        var url = details.url, rule = opt.rule||{};
        var req = E.requests[details.requestId];
        var country = opt.country || rule.country || '';
        var pool = rule.pool && be_agent.has_pool(country, rule.pool, rule) &&
            rule.pool;
        if (!req)
        {
            req = E.requests[details.requestId] = {
                id: details.requestId,
                url: url,
                method: details.method,
                opt: opt,
                route_opt: {direct: 1},
                start_ts: Date.now(),
                tab_id: details.tabId,
                ret: details.ret,
            };
            var strict = !E.internal_reqs[details.url] && force_strategy;
            var mitm_rule = mitm_lib.inited && mitm_lib.get_tab_rule(
                details.tabId, details.initiator || details.url);
            var force = get_forced_strategy(details, rule, mitm_rule, strict,
                opt);
            if (force=='peer' && rule.force_peer)
                strict = true;
            req.strategy = unblocker_lib.handle_request(url, {
                force: force,
                top_url: rule.name ? zurl.add_proto(rule.name)+'/' :
                    opt.int_req && opt.int_req.hdrs ?
                    opt.int_req.hdrs.Referer : null,
                type: details.is_main ? 'main_frame' : details.type,
                method: details.method,
                country: country.toUpperCase(),
                premium: is_force_proxy(country, opt),
                pool: pool,
                strict: strict,
            });
            if (mitm_lib.inited && (be_ext.get('is_premium') || !mitm_rule ||
                mitm_rule.auto_unblock || !be_util.is_google(mitm_rule.host)))
            {
                req.strategy = mitm_lib.strategy_wrapper(req.strategy, req,
                    details.initiator||url);
            }
            var tab_unblocker = get_tab_unblocker(details.tabId);
            if (tab_unblocker)
                tab_unblocker.req_total_n = (tab_unblocker.req_total_n||0)+1;
        }
        req.proxy_req = false;
        if (req.cancel)
            return void (details.ret.cancel = true);
        var cmd = req.cmd = req.strategy(req.direct_resp, req.proxy_resp);
        if (!cmd)
            return;
        country = zutil.get(cmd, 'proxy.country', country);
        if (req.serving)
        {
            if (req.serving=='proxy')
                return void this.gen_proxy_req(req, details, cmd, country);
        }
        else if (cmd.proxy)
        {
            if (cmd.direct && cmd.direct.serve)
                req.serving = 'direct';
            else if (cmd.proxy.serve)
            {
                req.serving = 'proxy';
                this.gen_proxy_req(req, details, cmd, country);
            }
            else if (cmd.proxy.start)
                this.gen_proxy_req(req, details, cmd, country);
            else if (cmd.direct.start)
                req.direct_req = true;
            else if (cmd.proxy.abort)
                return void (details.ret.cancel = true);
            if (cmd.direct && cmd.direct.abort && req.direct_req)
                req.direct_req.abort();
        }
        else if (cmd.direct)
        {
            if (cmd.direct.serve)
                req.serving = 'direct';
            else if (cmd.direct.start)
                req.direct_req = true;
            else if (cmd.direct.abort)
                details.ret.cancel = true;
        }
    }

    _on_before_send_headers(details){
        var url = details.url, req = E.requests[details.requestId];
        var req_hdrs = details.requestHeaders;
        var modified = 0;
        var is_http = url.startsWith('http:') && !url.includes(':443/');
        if (!req)
            return;
        var int_req = req.opt.int_req;
        if (int_req && int_req.hdrs)
        {
            var hdrs = int_req.hdrs;
            for (var h in hdrs)
                modified |= hdrs_add(req_hdrs, h, hdrs[h]);
        }
        modified |= hdrs_rm(req_hdrs, 'x-hola-version');
        var cmd = req.strategy(req.direct_resp, req.proxy_resp)||{};
        if (req.serving);
        else if (cmd.proxy)
        {
            if (cmd.direct && cmd.direct.start && !req.direct_req)
            {
                req.hdrs = req_hdrs;
                send_direct_ajax(req);
            }
            if (cmd.proxy.start)
            {
                if (is_http)
                {
                    modified |= hdrs_add(req_hdrs, 'X-Hola-Version',
                        be_util.version()+' '+
                        (be_util.get_product()||be_util.browser()));
                }
                if (cmd.proxy.hdrs_only && is_http)
                    modified |= hdrs_add(req_hdrs, 'X-Hola-Headers-Only', '1');
            }
        }
        if (modified)
            details.ret.requestHeaders = req_hdrs;
    }

    tab_unblocker_cb(details){
        if (!details.url)
            return;
        var url = details.url;
        var host = zurl.get_host(url);
        var tab_unblocker = get_tab_unblocker(details.tabId);
        var is_main = is_main_frame(details);
        var rule_info, req, handler = details.handler;
        trace_req_cb(details);
        if (!be_pac.has_pac)
            return;
        if (req = E.requests[details.requestId])
        {
            return handler(details, req.opt);
        }
        if (req = E.routing_reqs[url])
        {
            delete E.routing_reqs[url];
            clearTimeout(req.to);
            req = req.req;
            req.id = details.requestId;
            E.requests[details.requestId] = req;
            return handler(details, req.opt);
        }
        if (req = E.internal_reqs[url])
        {
            if (host=='internal.hola')
            {
                req.reqid = details.requestId;
                E.internal_reqs[req.url] = req;
                delete E.internal_reqs[url];
                req.is_redirected = true;
                return void(details.ret.redirectUrl = req.url);
            }
            if (req.reqid==details.requestId)
                return handler(details, assign({}, req.opt, {int_req: req}));
        }
        if (details.requestHeaders || details.responseHeaders)
            return;
        if (is_main)
        {
            rule_info = get_rule_info_from_url(url);
            if (!tab_unblocker)
            {
                if (rule_info && details.tabId!=-1)
                {
                    if (!(tab_unblocker = tab_unblocker_add(details.tabId,
                        rule_info, url)))
                    {
                        return;
                    }
                }
            }
            else if (!rule_info || rule_info.root_url!=tab_unblocker.root_url)
            {
                tab_unblocker_del(details.tabId);
                if (!rule_info || !(tab_unblocker =
                    tab_unblocker_add(details.tabId, rule_info, url)))
                {
                    return;
                }
            }
        }
        if (!E.is_vpn_allowed(url, is_main, details))
            return;
        var rule = tab_unblocker && tab_unblocker.rule;
        if (!tab_unblocker && details.tabId==-1 && details.frameId==-1)
        {
            let tab_id = be_tabs.get('active.id');
            if (is_trace_cb)
            {
                let rurl = (details.initiator||url)+'/';
                if (rule_info || (rule_info = get_rule_info_from_url(rurl)))
                {
                    rule = rule_info.rule;
                    if (rule_info.tabs[tab_id])
                        tab_unblocker = get_tab_unblocker(tab_id);
                    else
                    {
                        let id;
                        if (id = +Object.keys(rule_info.tabs)[0])
                            tab_unblocker = get_tab_unblocker(id);
                    }
                }
                if (!rule && (tab_unblocker = get_tab_unblocker(tab_id)))
                    rule = tab_unblocker.rule;
            }
            else
            {
                tab_unblocker = get_tab_unblocker(tab_id);
                if (rule_info || (rule_info = get_rule_info_from_url(url)))
                    rule = rule_info.rule;
                else if (tab_unblocker)
                    rule = tab_unblocker.rule;
            }
        }
        var mitm_rule;
        if (!rule && mitm_lib.inited
            && !(mitm_rule = mitm_lib.get_active_tab_rule(details.tabId,
            details.initiator || details.url)))
        {
            return;
        }
        if (!be_ext.get('is_premium') && ((tab_unblocker||{}).force_premium ||
            rule_info && be_vpn_util.is_all_browser(rule_info.rule)))
        {
            return;
        }
        if (!be_ext.get('agent_key') && !storage.get('agent_key'))
        {
            be_lib.perr_err({id: 'be_no_agent_key2', rate_limit: {count: 2}});
            return; 
        }
        var r;
        if (be_bg_main && (r = rule||mitm_rule) && be_bg_main.set_rule_use)
            be_bg_main.set_rule_use(r, !!mitm_rule);
        return this._on_first_request(details, {rule: rule, no_rule: !rule,
            tab_unblocker: tab_unblocker});
    }

    tab_unblocker_cb_trace(d){
        var url;
        if (!(url = d.url))
            return;
        var is_main = is_main_frame(d), req;
        var status = d.statusLine ? 'status: '+d.statusLine : '';
        trace_req_cb(d);
        if (!be_pac.has_pac)
            return void trace_req(d, 'no pac '+status);
        var ctx = {no_req: !E.requests[d.requestId]};
        if (req = E.requests[d.requestId]||E.routing_reqs[url]||
            E.internal_reqs[url])
        {
            if (!E.requests[d.requestId])
                trace_req(d, 'no req');
            ctx.serving = req.serving;
            ctx.redirected = req.redirected;
            ctx.agent = zutil.get(req, 'agent.host');
            return ctx;
        }
        if (d.requestHeaders || d.responseHeaders)
        {
            if (status)
                trace_req(d, status);
            return ctx;
        }
        if (!E.is_vpn_allowed(url, is_main, d))
        {
            trace_req(d, 'vpn is not allowed');
            return ctx;
        }
        return ctx;
    }

    after_tab_unblocker_cb_trace(d, ctx, ret){
        var req = E.requests[d.requestId];
        if (!req)
            return;
        if (ctx.no_req)
            trace_req(d, 'new req '+req.strategy.desc);
        var cmd;
        if (!(cmd = req.cmd))
            return void trace_req(d, 'no strategy command');
        var log = cmd.log||'';
        if (req.ret.cancel)
        {
            var msg = req.cancel ? 'canceling request' :
                zutil.get(cmd, 'proxy.abort') ? 'aborting proxy '+log :
                zutil.get(cmd, 'direct.abort') ? 'aborting direct '+log :
                'canceling request';
            trace_req(d, msg);
            if (zutil.get(cmd, 'proxy.abort') && force_strategy=='peer')
            {
                zerr.warn('tab:%d request to %s cancelled because '
                    +'force_strategy=peer, but request to peer failed',
                    d.tabId, d.url.slice(0, 100));
            }
        }
        if (ctx.redirected && !req.redirected)
            trace_req(d, 'redirected, don\'t set proxy');
        if (req.serving && !ctx.serving)
            trace_req(d, 'serving '+req.serving+' '+(cmd.log||''));
        if (req.agent && req.agent.host!=ctx.agent)
        {
            trace_req(d, 'setting proxy to '+req.route_opt.prot+' '
                +req.agent.host+':'+req.agent.port);
        }
        else if (zutil.get(req, 'proxy_resp.error')=='failed set proxy')
            trace_req(d, 'setting proxy failed');
    }

    _on_headers_received(details){
        var req_id = details.requestId;
        var req = E.requests[req_id];
        var res = nodify_res(details);
        if (!req || !res)
            return;
        var tab_unblocker = get_tab_unblocker(details.tabId);
        var hola_warn = res.headers['x-hola-warning'];
        var hola_agent = res.statusCode==407 &&
            res.headers['proxy-authenticate']=='Basic realm="Hola Unblocker"';
        var int_req = req.opt.int_req;
        if (int_req && req.opt.ignore_redir && !int_req.res && !hola_agent)
        {
            int_req.res = res;
            req.cancel = true;
        }
        if (hola_warn && tab_unblocker && !tab_unblocker.rule.changing_proxy)
            change_agent(details, req, hola_warn);
        var resp = get_strategy_resp(res);
        if (req.proxy_req)
        {
            if (hola_agent) 
                return;
            req.proxy_resp = resp;
            if (!req.direct_resp)
                req.direct_resp = {slow: true}; 
        }
        else if (req.direct_req)
            req.direct_resp = resp;
        var cmd = req.strategy(req.direct_resp, req.proxy_resp)||{};
        if (cmd.proxy)
        {
            if (cmd.proxy.serve)
            {
                if (req.direct_req)
                    req.direct_req.abort();
                return void(req.serving = 'proxy');
            }
            if (cmd.direct && cmd.direct.serve)
            {
                req.serving = 'direct';
                if (!req.proxy_req || {302: 1, 303: 1, 307: 1}[res.statusCode])
                    return;
                routing_reqs_set(details, req);
                return void(details.ret.redirectUrl = req.url);
            }
            if (cmd.proxy.start && !int_req)
            {
                req.direct_req = false;
                routing_reqs_set(details, req);
                return void(details.ret.redirectUrl = req.url);
            }
        }
        else if (cmd.direct)
        {
            if (cmd.direct.serve)
                return void(req.serving = 'direct');
            routing_reqs_set(details, req);
            return void(details.ret.redirectUrl = req.url);
        }
        if (req.proxy_resp)
        {
            if (req.direct_req && !req.direct_resp)
            {
                req.direct_timeout = setTimeout(function(){
                    trace_req(details, 'aborting direct timeout');
                    req.direct_req.abort();
                }, 5000);
            }
            return void(req.serving = 'proxy');
        }
    }

    _unsafe_tab_unblocker_end_cb(details){
        var reqid = details.requestId;
        var req = E.requests[reqid];
        trace_req_cb_end(details);
        if (req)
        {
            delete E.requests[reqid];
            delete_trace_req(reqid);
            var agent_req = E.agent_requests[req.url];
            if (agent_req && agent_req.id==req.id)
                delete E.agent_requests[req.url];
            var resp;
            if (details.error)
                resp = {code: 0, error: details.error};
            else
            {
                if (details.responseHeaders)
                    resp = get_strategy_resp(nodify_res(details));
            }
            if (resp && !req.serving)
            {
                if (req.proxy_req)
                    req.proxy_resp = resp;
                else if (req.direct_req)
                    req.direct_resp = resp;
            }
            req.strategy(req.direct_resp, req.proxy_resp);
            var int_req = E.internal_reqs[req.url];
            if (int_req)
            {
                if (details.error)
                {
                    int_req.error = details.error;
                    if (!int_req.res)
                        int_req.res = {code: 0, error: int_req.error};
                }
                else if (!int_req.res)
                    int_req.res = nodify_res(details);
            }
        }
        var tab_unblocker = get_tab_unblocker(details.tabId);
        if (tab_unblocker)
        {
            tab_unblocker.last_req_ts = Date.now();
            if (req && req.proxy_resp && is_main_frame(details) &&
                req.proxy_resp.code==200 && !req.proxy_resp.error)
            {
                inc_not_working('req_main_n', tab_unblocker);
            }
        }
        var bw_perr_r;
        if ((bw_perr_r = get_bw_perr_rule(req)) && req.proxy_resp.code==200
            && !req.proxy_resp.error)
        {
            bw_perr_acc.push(bw_perr_r, req);
            inc_not_working('bw_media_n', tab_unblocker);
        }
        if (!tab_unblocker || !req || !details.error ||
            be_vpn_util.gen_route_str_lc(req.route_opt)=='direct')
        {
            return;
        }
        var errors = zutil.get(bext_config, 'request_errors.handle', [])
            .slice();
        if (be_ext.get('gen.is_tunnel_error_on') && is_main_frame(details))
            errors.push('net::ERR_TUNNEL_CONNECTION_FAILED');
        var info = {url: req.url, type: details.type, method: req.method,
            error: details.error, agent: req.agent,
            rule: get_rule_min_fmt(req.opt.rule)};
        tab_unblocker.err_logs.push({ts: Date.now(), method: req.method,
            error: details.error, agent: (req.agent||{}).host,
            url: req.url.slice(0, 100)});
        if (tab_unblocker.err_logs.length>err_logs_len)
            tab_unblocker.err_logs.shift();
        tab_unblocker.req_err_total_n = (tab_unblocker.req_err_total_n||0)+1;
        if (!errors.includes(details.error))
        {
            var reported;
            if (!(reported = load_errors[details.tabId]))
                reported = load_errors[details.tabId] = {};
            if (reported[details.error])
                return;
            reported[details.error] = true;
            return void be_lib.perr_err({id: 'req_err_unhandled',
                rate_limit: {count: 5}, info: info});
        }
        var retry;
        if (retry = this.check_retry(req, details, tab_unblocker))
        {
            zerr.notice('tab:%d allow retry for %s failed request, %s %s',
                details.tabId, retry, details.error, req.url.slice(0, 200));
            be_lib.perr_err({id: 'req_err_retry_'+retry, info: info});
            return ext_on_err(details, req, true);
        }
        var curr;
        if (!be_ext.get('gen.disable_agent_req_err_check') && req.agent &&
            (curr = get_proxy_agent(req, true)) && req.agent.host!=curr.host)
        {
            zerr.notice('tab:%d ignore agent change: failed %s current %s',
                details.tabId, req.agent.host, curr.host);
            return;
        }
        var now = Date.now(), limit = be_ext.get('gen.autoreload_limit')||3;
        var per = be_ext.get('gen.autoreload_ms')||date.ms.MIN;
        if (tab_unblocker.req_err_n==limit)
        {
            if (now-tab_unblocker.req_err_ts<per)
                return;
            tab_unblocker.req_err_sent = tab_unblocker.req_err_n = 0;
        }
        if (!tab_unblocker.req_err_n)
            tab_unblocker.req_err_ts = now;
        tab_unblocker.req_err_n = (tab_unblocker.req_err_n||0)+1;
        if (tab_unblocker.req_err_n==limit)
            be_lib.perr_err({id: 'req_err_autoreload_max', info: info});
        be_lib.perr_err({id: 'req_err', info: info});
        if (be_ext.get('gen.report_tab_load_on'))
            be_tabs.page_trace(details, 'autoreload');
        return ext_on_err(details, req);
    }

    check_retry(req, details, tab_unblocker){
        var retry_conf;
        if (!req.agent ||
            !(retry_conf = zutil.get(bext_config, 'request_errors.retry')))
        {
            return;
        }
        var ret = retry_conf.sporadic_perc &&
            tab_unblocker.req_err_total_n/tab_unblocker.req_total_n*100<
            retry_conf.sporadic_perc && 'sporadic';
        var media_failure;
        if (retry_conf.disable_media_failure ||
            !(media_failure = bext_config.media_failure))
        {
            return ret;
        }
        var urls = tab_unblocker.retry_urls = tab_unblocker.retry_urls||{};
        var root_url = req.opt.rule.name;
        var rule = media_failure.rules.find(function(r){
            return r.domain==root_url; });
        if (!rule || !rule.set_err)
            return ret;
        if (urls[req.url]>=(rule.max_retry||retry_conf.max||5))
        {
            zerr.notice('tab:%d max retry %d for media request failed '
                +'exceeded, %s, %s', details.tabId, urls[req.url],
                details.error, req.url.slice(0, 200));
            return;
        }
        var check_ext = function(ext){
            return new RegExp('\\.'+ext+'\\??').test(req.url); };
        var check_url = function(url){
            return new RegExp(url.replace(/\./g, '\\.')
                .replace(/\*/g, '.*')).test(req.url);
        };
        if (media_failure.extensions.find(check_ext) || rule.urls &&
            rule.urls.find(check_url))
        {
            urls[req.url] = (urls[req.url]||0)+1;
            return 'media';
        }
        return ret;
    }
}

class Ff_new_handler extends Base_handler {
    constructor(){
        super();
        this.on_proxy_request = this.wrap('on_proxy_request', d=>{
            this.tab_unblocker_cb(d = assign({}, d, {handler:
                this._on_first_request.bind(this),
                cbname: 'on_proxy_request', ret: {}}));
            this._clean_req_to_ret();
            this.req_to_ret[d.requestId] = {ret: d.ret, ts: Date.now()};
            return d.hola_proxy||{type: 'direct'};
        }, true);
        this.on_before_request = this.wrap('on_before_request', d=>{
            var data = this.req_to_ret[d.requestId]||{ret: {}};
            delete this.req_to_ret[d.requestId];
            return data.ret;
        }, true);
    }

    add_trace_wrappers(){
        super.add_trace_wrappers();
        this.add_trace_wrapper('on_proxy_request', {
            before: d=>{
                trace_req(d, 'proxy request');
                return this.tab_unblocker_cb_trace(d);
            },
            after: this.after_tab_unblocker_cb_trace,
        });
        this.add_trace_wrapper('on_before_request', {
            before: d=>trace_req(d, 'before request'),
        });
    }

    _clean_req_to_ret(){
        var clean = {}, now = Date.now();
        for (var id in this.req_to_ret)
        {
            var data = this.req_to_ret[id];
            if (now-data.ts < 5*date.ms.MIN)
                clean[id] = data;
        }
        this.req_to_ret = clean;
    }

    gen_proxy_req(req, details, cmd, country){
        req.route_opt = {prot: 'https', country: country,
            pool: cmd.proxy.pool};
        if (cmd.proxy.peer)
            req.route_opt.peer = true;
        var proxy = get_proxy_agent(req);
        if (!proxy)
        {
            req.proxy_resp = {code: 0, error: 'failed set proxy'};
            return; 
        }
        req.proxy_req = true;
        details.hola_proxy = {type: req.route_opt.prot, host: proxy.host,
            port: proxy.port};
    }

    init(){
        if (!super.init())
            return;
        this.req_to_ret = {};
        try {
            window.browser.proxy.onRequest.addListener(this.on_proxy_request,
                this.listener_opt);
            chrome.webRequest.onBeforeRequest.addListener(
                this.on_before_request, this.listener_opt,
                this.listener_extra_opt);
        } catch(e){ on_hooks_err('be_add_hooks_err', e); }
    }

    uninit(){
        if (!super.uninit())
            return;
        try {
            window.browser.proxy.onRequest.removeListener(
                this.on_proxy_request);
            chrome.webRequest.onBeforeRequest.removeListener(
                this.on_before_request);
        } catch(e){ on_hooks_err('be_rm_hooks_err', e); }
    }
}

class Chrome_handler extends Base_handler {
    constructor(){
        super();
        let on_before_request = d=>{
            this.tab_unblocker_cb(d = assign({}, d, {handler:
                this._on_first_request.bind(this),
                cbname: 'on_before_request', ret: {}}));
            return d.ret;
        };
        this.on_before_request = this.wrap('on_before_request',
            on_before_request, true);
        let prev = {};
        this.on_before_request_tab = this.wrap('on_before_request_tab', d=>{
            if (is_main_frame(d) || is_trace_cb && d.tabId==-1 &&
                prev.requestId==d.requestId && prev.timeStamp==d.timeStamp)
            {
                return;
            }
            prev = d;
            return on_before_request(d);
        }, true);
    }

    add_trace_wrappers(){
        super.add_trace_wrappers();
        this.add_trace_wrapper('on_before_request', {
            before: d=>{
                trace_req(d, 'before request');
                return this.tab_unblocker_cb_trace(d);
            },
            after: this.after_tab_unblocker_cb_trace,
        });
        this.add_trace_wrapper('on_before_request_tab', {
            before: d=>{
                trace_req(d, 'before request tab');
                return this.tab_unblocker_cb_trace(d);
            },
            after: this.after_tab_unblocker_cb_trace,
        });
    }

    gen_proxy_req(req, details, cmd, country){
        if (req.redirected) 
        {
            req.redirected = false;
            return void(req.proxy_req = true);
        }
        req.route_opt = {prot: 'HTTPS', country: country,
            pool: cmd.proxy.pool};
        if (cmd.proxy.peer)
            req.route_opt.peer = true;
        var proxy = get_proxy_agent(req);
        if (!proxy)
        {
            if (req.route_opt.peer && force_strategy=='peer')
            {
                zerr.warn('tab:%d request to %s cancelled because '
                    +'force_strategy=peer, but no peer agent found for %s',
                    details.tabId, details.url, country.toUpperCase());
                details.ret.cancel = true;
            }
            req.proxy_resp = {code: 0, error: 'failed set proxy'};
            return; 
        }
        req.proxy_req = true;
        var proxy_str = req.route_opt.prot+' '+proxy.host+':'+proxy.port;
        var src = cmd.src || req.opt.rule && 'geo_rule';
        be_pac.set_proxy_for_url(details.url, proxy_str, src);
        if (req.opt.fix_307 && /^http:/.test(details.url))
        {
            be_pac.set_proxy_for_url(details.url.replace('http:', 'https:'),
                proxy_str, src);
        }
        firefox_redirect(req, details, proxy_str);
    }

    add_hooks(tabid){
        let hooks = super.add_hooks(tabid);
        try {
            if (tabid=='main_frame')
            {
                hooks.on_before_request_main = this.on_before_request
                    .bind(this);
                chrome.webRequest.onBeforeRequest.addListener(
                    hooks.on_before_request_main,
                    assign({types: ['main_frame']}, this.listener_opt),
                    this.listener_extra_opt);
                return hooks;
            }
            tabid = +tabid;
            let opt = tabid>=0 ? {tabId: tabid} : {};
            hooks.on_before_request_tab = this.on_before_request_tab
                .bind(this);
            chrome.webRequest.onBeforeRequest.addListener(
                hooks.on_before_request_tab, assign(opt, this.listener_opt),
                this.listener_extra_opt);
            return hooks;
        } catch(e){ on_hooks_err('be_add_hooks_err', e); }
    }

    remove_hooks(hooks){
        super.remove_hooks(hooks);
        try {
            ['', '_main', '_tab'].forEach(e=>{
                let cb;
                if (cb = hooks['on_before_request'+e])
                    chrome.webRequest.onBeforeRequest.removeListener(cb);
            });
        } catch(e){ on_hooks_err('be_rm_hooks_err', e); }
    }
}

function get_strategy_resp(res){
    var resp;
    if (res.headers['x-hola-response'])
    {
        resp = {
            hdrs_only: true,
            code: res.headers['x-hola-status-code'],
            len: res.headers['x-hola-content-length'],
            te: res.headers['x-hola-transfer-encoding'],
            lmod: res.headers['x-hola-last-modified'],
            etag: res.headers['x-hola-etag'],
            type: res.headers['x-hola-content-type'],
            error: res.headers['x-hola-error'],
        };
    }
    else
    {
        resp = {
            code: res.statusCode,
            len: res.headers['content-length'],
            te: res.headers['transfer-encoding'],
            lmod: res.headers['last-modified'],
            etag: res.headers.etag,
            type: res.headers['content-type'],
            error: res.headers['x-hola-error']
        };
    }
    resp.policy = res.headers['x-hola-policy'];
    return resp;
}

E.is_vpn_allowed = function(_url, is_main, details){
    if (be_svc.get('vpn_country'))
        return;
    var protocol, hostname, url = zurl.parse(_url);
    if (!(protocol = url.protocol) || !(hostname = url.hostname))
    {
        if (protocol!='file:')
            be_lib.perr_err({id: 'url_parsing_failed', info: url});
        return false;
    }
    if (is_all_browser_rule_active())
        return !zurl.is_hola_domain(hostname) || details && details.tabId!=-1;
    if (be_agent.is_agent(hostname))
        return false;
    return be_vpn_util.is_vpn_allowed(_url, is_main, browser.isInNet);
};


function build_trace_string(req_id, trace){
    return 'reqid '+req_id+': '+trace.join(', ');
}

function trace_req(req, msg, opt){
    if (!proxy_debug)
        return;
    if (!req || !msg)
        return;
    opt = _.defaults(opt||{}, {level: 'debug'});
    var req_id = req.requestId||req.id;
    zerr[opt.level]('tab:%d be_tab_unblocker: %s %s %s', req.tabId, req_id,
        req.url, msg);
    var trace = E.routing_trace[req_id];
    if (!trace)
    {
        trace = E.routing_trace[req_id] = {trace: [],
            ts: Date.now(), url: req.url};
        var tab_unblocker;
        if (tab_unblocker = get_tab_unblocker(req.tabId))
            tab_unblocker.log.push({id: req_id, trace: trace});
    }
    if (req.url!=trace.url)
    {
        msg+=' '+req.url;
        trace.url = req.url;
    }
    if (proxy_debug_timing)
    {
        var current_time = Date.now();
        var ts_diff = current_time-trace.ts;
        trace.ts = current_time;
        msg = '+'+ts_diff+'ms '+msg;
    }
    trace.trace.push(msg);
}

function change_agent(details, req, reason, agent_preload){
    var root_url, tab_unblocker = get_tab_unblocker(details.tabId);
    var route = be_vpn_util.gen_route_str_lc(req.route_opt, {no_algo: true});
    var bad_agents = be_agent.get_chosen_agent(route, tab_unblocker.rule);
    if (root_url = details.tabId && be_tabs.get_url(details.tabId))
        root_url = svc_util.get_root_url(root_url);
    if (!bad_agents || !bad_agents.length)
    {
        zerr.debug('tab:%d no agents for %s route, root_url: %s',
            details.tabId, route, root_url);
        be_lib.perr_err({id: 'debug_null_agents', info: {
            agents: be_agent.get_active_agents(tab_unblocker.rule),
            req: req,
            details: details,
        }});
    }
    be_lib.perr_ok({id: 'be_tab_unblocker_change_agent',
        info: {reason: reason, bad_agents: _.pluck(bad_agents, 'host')}});
    var exclude = _.pluck(bad_agents, 'host');
    zerr.debug('tab:%d change agent on %s, bad agents: [%s], root_url: %s',
        details.tabId, reason, exclude.join(','), root_url);
    return E.be_rule.change_proxy({
        rule: tab_unblocker.rule,
        exclude: exclude,
        root_url: root_url||'',
        agent_not_working: true,
        agent_preload: agent_preload,
    });
}

function ext_on_err(details, req, retry){
    return etask('ext_on_err', [function(){
        var tab_unblocker = get_tab_unblocker(details.tabId);
        if (tab_unblocker.rule.changing_proxy)
            return this.return();
        return change_agent(details, req, details.error, retry);
    }, function(res){
        if ((res||{}).error)
            return this.return();
        if (retry)
            return;
        zerr.notice('tab:%d reloading tab on error %s', details.tabId,
            details.error);
        be_tabs.reload(details.tabId);
    }, function(){
        on_not_working({tab_id: details.tabId, src: 'agent', agent: req.agent,
            rule: get_rule_min_fmt(req.opt.rule)});
    }]);
}

function get_proxy_agent(req, dry_run){
    var agents, opt = req.opt||{}, rule = zutil.get(req, 'opt.rule');
    var route = be_vpn_util.gen_route_str_lc(req.route_opt, {no_algo: true});
    agents = force_agent ? [force_agent] : opt.agent ? [opt.agent] :
        be_agent.get_chosen_agent(route, rule);
    if (!agents || !agents.length)
    {
        zerr.debug('tab:%d no agents for %s route, rule: %s',
            req.tab_id, route, rule ? rule.name : 'unknown');
        be_lib.perr_err({id: 'be_debug_no_agents',
            info: zerr.json({route_opt: req.route_opt,
            agents: be_agent.get_active_agents(rule),
            rule: get_rule_min_fmt(rule)})});
        return;
    }
    var agent = agents[opt.agent ? 0 : req.agent_failures||0];
    if (!dry_run)
    {
        req.agent = agent;
        if (opt.tab_unblocker&&opt.tab_unblocker.agents)
            opt.tab_unblocker.agents[agent.host] = Date.now();
    }
    var port = be_trial.get_trial_agent_port(rule, agent.port);
    return {ip: agent.ip, port: port, host: agent.host};
}

function get_rule_info_from_url(url){
    var rule_info, r;
    if (E.url_to_rule_infos.all_browser)
        return E.url_to_rule_infos.all_browser;
    url = (url||'').replace('.trigger.hola.org', '');
    for (r in E.url_to_rule_infos)
    {
        rule_info = E.url_to_rule_infos[r];
        if (rule_info.url_re && rule_info.url_re.test(url))
            return rule_info;
    }
    return null;
}

E.get_rule_info = function(rule){
    var rule_info, r = rule;
    if (!E.rules)
        return null;
    if (r.root_url && (rule_info = E.url_to_rule_infos[r.root_url[0]]))
        return rule_info;
    if ((r = svc_util.find_rule(E.rules.unblocker_rules, r)) && r.root_url)
        rule_info = E.url_to_rule_infos[r.root_url[0]];
    return rule_info;
};

function is_all_browser_rule_active(){
    return !!E.url_to_rule_infos.all_browser; }

function get_tab_unblocker(tabid){
    if (E.tab_unblockers.all_browser)
        return E.tab_unblockers.all_browser;
    return tabid && E.tab_unblockers[tabid];
}

function tab_unblocker_del(tabid, refresh){
    var tab_unblocker = E.tab_unblockers[tabid];
    if (!tab_unblocker)
        return;
    if (tab_unblocker.not_working)
        E.send_not_working(tab_unblocker, 'unblocker_del');
    var is_all_browser = tabid=='all_browser';
    if (requests_handler && tab_unblocker.hooks)
        requests_handler.remove_hooks(tab_unblocker.hooks);
    var rule_info = E.url_to_rule_infos[tab_unblocker.root_url];
    delete E.tab_unblockers[tabid];
    if (is_all_browser)
        requests_handler.update_hooks();
    if (!rule_info)
    {
        be_lib.perr_err({id: 'be_rule_info_missing', info: {tabid: tabid,
            tab_unblocker: tab_unblocker, rule_infos: E.url_to_rule_infos}});
    }
    else
        delete rule_info.tabs[tabid];
    if (refresh && is_all_browser)
        tabid = be_tabs.get('active.id');
    if (!refresh || be_tabs.get('active.id')!=tabid)
        return;
    B.tabs.get(B.tabid2api(tabid), function(tab){
        if (tab)
            B.tabs.update(tab.id, {url: tab.url});
    });
}

function tab_reload(tabid, tab_url){
    B.tabs.update(tabid, {url: tab_url});
    B.tabs.get(tabid, function(tab){
        if (!tab || tab.status!='complete')
            return;
        be_tabs.reload(tabid);
    });
}

function get_force_premium_rule(tab_url){
    var root_url = svc_util.get_root_url(tab_url);
    return premium.get_force_premium_rule(root_url);
}

var tab_unblocker_add = cb_wrapper(function(tabid, rule_info, tab_url,
    fix_url)
{
    if (!rule_info || rule_info.tabs[tabid])
        return;
    var is_all_browser = be_vpn_util.is_all_browser(rule_info.rule);
    var id = is_all_browser ? rule_info.rule.name : tabid;
    var tab_unblocker = E.tab_unblockers[id];
    if (tab_unblocker && tab_unblocker.rule)
        return;
    tab_unblocker = {country: rule_info.rule.country, rule: rule_info.rule,
        root_url: rule_info.root_url, log: tab_unblocker ? tab_unblocker.log :
        [], force_premium: get_force_premium_rule(tab_url), err_logs: [],
        agents: {}};
    E.tab_unblockers[id] = tab_unblocker;
    zerr.notice('tab:%d tab_unblocker_add: %s %s', tabid, rule_info.rule.name,
        tab_unblocker.country);
    if (requests_handler)
    {
        if (is_all_browser)
            requests_handler.update_hooks(id);
        tab_unblocker.hooks = requests_handler.add_hooks(id);
    }
    rule_info.tabs[tabid] = true;
    if (!is_all_browser && be_tabs.get('active.id')==tabid)
    {
        if (fix_url)
        {
            tab_url = be_vpn_util.get_root_link(rule_info.rule, tab_url)||
                tab_url;
        }
        if (tab_url)
        {
            zerr.notice('tab:%d reloading tab', tabid);
            return tab_reload(tabid, tab_url);
        }
    }
    return tab_unblocker;
});

var on_tab_created = cb_wrapper(function(o){
    var tab = o.tab;
    if (!tab.url)
        return;
    var rule_info = get_rule_info_from_url(tab.url);
    tab_unblocker_add(tab.id, rule_info, tab.url);
});

var on_tab_updated = cb_wrapper(function(o){
    var id = o.id, info = o.info;
    if (!info || !info.url)
        return;
    var tab_unblocker = E.tab_unblockers[id];
    var rule_info = get_rule_info_from_url(info.url);
    if (tab_unblocker &&
        rule_info && tab_unblocker.root_url==rule_info.root_url)
    {
        return;
    }
    if (tab_unblocker)
        tab_unblocker_del(id);
    tab_unblocker_add(id, rule_info, info.url);
});

var on_tab_removed = cb_wrapper(function(o){
    if (mitm_lib.inited)
        mitm_lib.tabs_del(o.id, 'on_tab_removed');
    tab_unblocker_del(o.id);
});

var on_tab_replaced = cb_wrapper(function(o){
    var added = o.added, removed = o.removed;
    tab_unblocker_del(removed);
    if (mitm_lib.inited)
        mitm_lib.tabs_del(removed, 'on_tab_replaced');
    B.tabs.get(added, function(tab){
        if (!tab || !tab.url)
            return;
        if (mitm_lib.inited)
            mitm_lib.tabs_add(added, tab.url, 'on_tab_replaced');
        var rule_info = get_rule_info_from_url(tab.url);
        tab_unblocker_add(added, rule_info, tab.url);
    });
});

function unset_rule_for_url(root_url, refresh){
    var rule_info = E.url_to_rule_infos[root_url];
    if (!rule_info)
        return;
    for (var tab in rule_info.tabs)
        tab_unblocker_del(tab, refresh);
    if (root_url=='all_browser')
        tab_unblocker_del(root_url, refresh);
    delete E.url_to_rule_infos[root_url];
}

function set_rule_for_url(root_url, rule, fix_url){
    var rule_info = E.url_to_rule_infos[root_url];
    if (rule_info)
        unset_rule_for_url(root_url, 0);
    rule_info = E.url_to_rule_infos[root_url] = {
        rule: rule,
        root_url: root_url,
        tabs: {},
        url_re: new RegExp(root_url),
        country_str: be_vpn_util.gen_route_str_lc({country: rule.country,
            peer: rule.peer, pool: rule.pool}),
    };
    B.tabs.query({}, cb_wrapper(function(tabs){
        if (!tabs)
            return;
        for (var i=0; i<tabs.length; i++)
        {
            if (rule_info.url_re && !rule_info.url_re.test(tabs[i].url))
                continue;
            tab_unblocker_add(tabs[i].id, rule_info, tabs[i].url, fix_url);
        }
    }));
}

function update_rules(urls){
    var url, rule;
    for (url in E.url_to_rule_infos)
    {
        rule = urls[url];
        if (!rule)
            unset_rule_for_url(url, 1);
        else if (rule.id!=E.url_to_rule_infos[url].rule.id)
            set_rule_for_url(url, rule, 0);
    }
    for (url in urls)
    {
        rule = urls[url];
        if (!E.url_to_rule_infos[url])
            set_rule_for_url(url, rule, 1);
    }
}

be_pac.init_tab_listeners = function(){
    if (requests_handler)
        requests_handler.init();
};

E.set_rule_val = function(rule, key, val){
    var info;
    if ((info = E.get_rule_info(rule)) && info.rule)
        info.rule[key] = val;
};

E.update_rule_urls = function(rules){
    var url_to_rule_infos = {};
    return etask('update_rule_urls', [function(){
        if (!E.inited)
            return this.return();
        be_pac.rules = E.rules = rules;
        if (be_ext.get('r.ext.enabled'))
            requests_handler.init();
        be_pac.load_pac_file();
        if (!rules)
            return this.return(update_rules(url_to_rule_infos));
        var ag_rules = [], agents = {};
        for (var r in rules.unblocker_rules)
        {
            var rule = rules.unblocker_rules[r];
            if (!rule.enabled)
                continue;
            if (be_vpn_util.is_all_browser(rule))
                url_to_rule_infos[rule.name] = rule;
            else
            {
                rule.root_url_re = [];
                for (var i=0; i<rule.root_url.length; i++)
                {
                    if (rule.root_url_orig &&
                        rule.root_url_orig[i].match(/^\*+$/))
                    {
                        continue;
                    }
                    rule.root_url_re.push(new RegExp(rule.root_url[i]));
                    url_to_rule_infos[rule.root_url[i]] = rule;
                }
                if (!rule.root_url_re.length)
                {
                    delete rules.unblocker_rules[r];
                    continue;
                }
            }
            var def = [{peer: true}, {peer: false,
                force_premium: rule.force_premium}];
            if (rule.pool)
                def.push({peer: false, pool: rule.pool});
            def.forEach(function(b){
                b = assign({country: rule.country, link: rule.link,
                    name: rule.name}, b);
                var s = be_vpn_util.gen_route_str_lc(b);
                if (!agents[s])
                {
                    ag_rules.push(b);
                    agents[s] = true;
                }
            });
        }
        return be_agent.resolve_agents(ag_rules, null, {new_only: true});
    }, function(){
        update_rules(url_to_rule_infos);
        var r = _.omit(E.rules, 'unblocker_globals');
        if ((E.rules||{}).unblocker_globals)
        {
            r.unblocker_globals = assign({}, E.rules.unblocker_globals,
                be_ext.get('is_premium') ? E.rules.unblocker_plus :
                E.rules.unblocker_free);
        }
        return void unblocker_lib.unblocker_json_set(r, {by_rules: 1, ext: 1});
    }]);
};

E.ajax_via_proxy = function(url, _opt, state){
    var opt = {};
    _opt = _opt||{};
    state = state||{};
    if (typeof url=='object')
        opt = url;
    else
        opt = {type: 'POST', url: url};
    var _this, xhr, xhr_resp, complete;
    return etask({name: 'ajax_via_proxy', cancel: true}, [function(){
        var rule = opt.rule;
        _this = this;
        if ((rule || _opt.force=='proxy') && !_opt.country)
        {
            var r = rule||get_rule_info_from_url(opt.url);
            if (r)
            {
                _opt.country = r.country;
                _opt.peer = _opt.peer||r.peer;
            }
            else
                throw new Error('proxy rule not found for '+opt.url);
            _opt.force = 'proxy';
        }
        var req_opts = {force: _opt.force, country: _opt.country,
            no_routing: true, peer: _opt.peer, fix_307: _opt.fix_307,
            no_rule: !_opt.country};
        if (_opt.ignore_redir!=false)
            req_opts.ignore_redir = true;
        if (_opt.prot)
            req_opts.prot = _opt.prot;
        if (_opt.agent)
            req_opts.agent = _opt.agent;
        if (_opt.force=='direct')
            be_pac.set_proxy_for_url(opt.url, 'DIRECT');
        xhr = hola_XMLHttpRequest(opt.url, opt.type, _opt.hdrs, req_opts);
        E.trigger('internal_reqs_update');
        xhr.onreadystatechange = cb_wrapper(function(){
            if (xhr.readyState!=xhr.HEADERS_RECEIVED)
                return;
            state.hdrs_received = true;
            var headers_s = xhr.getAllResponseHeaders();
            xhr_resp = {
                statusCode: xhr.status,
                reasonPhrase: xhr.statusText,
                responseURL: xhr.responseURL,
                headers: attrib.to_obj_lower(attrib.from_str(headers_s,
                    {allow_invalid: true})),
            };
            if (_opt.hdrs_abort)
                xhr.abort();
        });
        xhr.onerror = function(ev){
            var req = E.internal_reqs[opt.url];
            if (req)
                req.et = _this;
        };
        xhr.onload = function(){ _this.continue(); };
        xhr.onabort = function(){ _this.continue(); };
        xhr.send(_opt.data);
        return this.wait(opt.timeout);
    }, function cont(){
        var req = E.internal_reqs[opt.url];
        complete = true;
        delete E.internal_reqs[xhr.hola_url];
        if (!req)
            req = {};
        if (!req.res)
        {
            if (xhr_resp)
                req.res = xhr_resp;
            else
            {
                var headers_s = xhr.getAllResponseHeaders();
                req.res = xhr_resp = {
                    statusCode: xhr.status,
                    reasonPhrase: xhr.statusText,
                    responseURL: xhr.responseURL,
                    headers: attrib.to_obj_lower(attrib.from_str(headers_s,
                        {allow_invalid: true})),
                };
            }
        }
        else if (!xhr_resp)
            xhr_resp = req.res;
        if (_opt.force_headers && (!req.res.headers
            || !Object.keys(req.res.headers).length))
        {
            req.res.headers = xhr_resp ? xhr_resp.headers
                : attrib.to_obj_lower(attrib.from_str(
                xhr.getAllResponseHeaders(), {allow_invalid: true}));
            if (req.res.statusCode==407 && xhr_resp)
                req.res.statusCode = xhr_resp.statusCode;
        }
        return {data: xhr.responseText, xhr: xhr, agent: _opt.agent,
            status: xhr_resp.statusCode, orig_res: req.res,
            is_redirected: req.is_redirected};
    }, function catch$(err){
        if (_opt.always && xhr && !complete)
            return this.goto('cont');
        throw new Error(err.statusText||''+err);
    }, function finally$(){
        delete E.internal_reqs[opt.url];
        if (xhr)
        {
            xhr.abort();
            xhr.onerror = null;
            xhr.onreadystatechange = null;
            delete E.internal_reqs[xhr.hola_url];
        }
        E.trigger('internal_reqs_update');
    }]);
};

var url_check = {};
var on_tab_ready = cb_wrapper(function(o){
    var url = o && o.info ? o.info.url : undefined;
    if (!url)
        return;
    if (url_check[url])
    {
        url_check[url]();
        delete url_check[url];
    }
});

var on_tab_completed = cb_wrapper(function(o){
    if (mitm_lib.inited && !o.frameId)
        mitm_lib.tabs_set_complete(o.tabId);
    var trace;
    if (be_ext.get('gen.report_tab_load_on') && !o.frameId && o.url &&
        (trace = be_tabs.get_trace(o.tabId)))
    {
        var r = trace.filter(function(e){ return e.msg=='autoreload'; });
        if (!r.length)
            return;
        var info = {url: o.url, autoreload_n: r.length, errors: []};
        r.forEach(function(e){ info.errors.push(e.error); });
        if (be_ext.get('gen.is_tab_trace_on'))
            info.trace = trace;
        if (be_bg_main && be_ext.get('gen.is_log_on'))
            info.log = be_bg_main.get_log();
        be_lib.perr_err({id: 'tab_autoreload_completed', info: info,
            rate_limit: {count: 5}});
    }
});

var on_before_navigate = cb_wrapper(function(o){
    if (o.frameId)
        return;
    load_errors[o.tabId] = {};
    if (mitm_lib.inited)
        mitm_lib.tabs_add(o.tabId, o.url, 'on_before_navigate');
});

function handle_mitm_block(tab_url, tab_id, ret){
    mitm_lib.trace(tab_id, tab_url, 'handle_mitm_block '+(!ret ? 'no ret'
        : 'blocked='+ret.blocked+' handle='+ret.handle+' root='
        +svc_util.get_root_url(ret.url)));
    if (!tab_id || is_disabled() || !ret || !ret.blocked || !ret.handle)
        return;
    var cur_url = be_tabs.get_url(tab_id);
    var active_id = be_tabs.get('active.id');
    var active_url = be_tabs.get('active.url');
    if (cur_url=='chrome://newtab/' && active_id==tab_id
        && active_url==tab_url)
    {
        B.tabs.update(tab_id, {url: tab_url});
        mitm_lib.trace(tab_id, tab_url, 'tabs.update chrome load');
    }
    else if (!cur_url && be_util.browser_guess.browser=='chrome'
        && active_id==tab_id-1)
    {
        return void mitm_lib.trace(tab_id, tab_url, 'ignore preload');
    }
    else if (!ret.sim && cur_url!=tab_url)
    {
        if (cur_url==ret.redir)
        {
            B.tabs.update(tab_id, {url: ret.tab_url});
            mitm_lib.trace(tab_id, tab_url,
                'tabs.update redirect to other domain');
        }
        else if (tab_url==active_url && tab_id==active_id)
        {
            be_tabs.reload(tab_id);
            mitm_lib.trace(tab_id, tab_url, 'tabs.reload same active url');
        }
        else
            return void mitm_lib.trace(tab_id, tab_url, 'ignore mismatch url');
    }
    else if (ret.sim)
    {
        B.tabs.update(tab_id, {url: ret.sim.url});
        mitm_lib.trace(tab_id, tab_url, 'tabs.update sim '+ret.sim.url);
    }
    else
    {
        be_tabs.reload(tab_id);
        mitm_lib.trace(tab_id, tab_url, 'tabs.reload url match');
    }
    mitm_lib.trace(tab_id, tab_url, 'trigger mitm_block');
    E.trigger('mitm_block', tab_id, tab_url, ret.redirect, ret.proxy_country);
}

function get_enabled_rule(url){
    var rules = E.be_rule.get_rules('http://'+svc_util.get_root_url(url)+'/');
    var r = rules && rules[0];
    return r && r.enabled ? r : undefined;
}

function is_disabled(){ return !be_ext.get('r.ext.enabled'); }
function is_unblock_allowed(tab_id, tab_url){
    if (be_ext.get('is_premium'))
        return true;
    var tab_unblocker = E.tab_unblockers[tab_id];
    return tab_unblocker ? !tab_unblocker.force_premium
        : !get_force_premium_rule(tab_url);
}
var init_mitm_check_url = ff_cb_wrapper('init_mitm_check_url', details=>{
    var url = details.url;
    var tab_url = details.initiator||url;
    var geo_rule = get_enabled_rule(tab_url);
    if (!url || url.startsWith('https') && !geo_rule
        || !E.is_vpn_allowed(url, is_main_frame(details)))
    {
        return;
    }
    var tab_id = details.tabId;
    if (!tab_id || tab_id<0 || is_disabled()
        || !is_unblock_allowed(tab_id, tab_url)
        || be_tabs.get('active.id')!=tab_id || tab_url!=url)
    {
        return;
    }
    var res = nodify_res(details);
    var hook = 'fake_resp', rule = {country: 'us'};
    details.headers = res.headers;
    if (!mitm_lib.is_mitm_allowed(tab_id, tab_url, tab_url, details,
        force_strategy!='peer' && geo_rule))
    {
        return;
    }
    be_pac.load_pac_file(undefined, true);
    return etask('init_mitm_check_url', [function(){
        if (!zutil.is_mocha())
            return be_agent.get_agents(rule);
    }, function(){
        return mitm_lib.check_mitm_blocking({url: tab_url, tab_url: tab_url,
            hook: hook, prev_code: details.statusCode, tab_id: tab_id,
            headers: details.headers, redir: (details.headers||{}).location,
            geo_rule: !!geo_rule,
            agents: be_agent.get_all_agents(rule.country)});
    }, function(ret){ handle_mitm_block(tab_url, tab_id, ret); }]);
});

E.has_mitm = function(){ return !!E.mitm; };

var chrome_error_list = ['ACCESS_DENIED', 'BLOCKED_BY_ADMINISTRATOR',
    'CONNECTION_REFUSED', 'CONNECTION_FAILED', 'NAME_NOT_RESOLVED',
    'ADDRESS_UNREACHABLE', 'CERT_ERROR_IN_SSL_RENEGOTIATION',
    'NAME_RESOLUTION_FAILED', 'NETWORK_ACCESS_DENIED',
    'SSL_HANDSHAKE_NOT_COMPLETED', 'SSL_SERVER_CERT_CHANGED',
    'CERT_COMMON_NAME_INVALID', 'CERT_AUTHORITY_INVALID',
    'CERT_CONTAINS_ERRORS', 'CERT_INVALID', 'INVALID_RESPONSE',
    'EMPTY_RESPONSE', 'INSECURE_RESPONSE', 'DNS_MALFORMED_RESPONSE',
    'DNS_SERVER_FAILED', 'DNS_SEARCH_EMPTY', 'TIMED_OUT', 'CONNECTION_CLOSED',
    'CONNECTION_RESET', 'CONNECTION_TIMED_OUT'];
var init_mitm_check_err = cb_wrapper(function(o){
    var tab_id = o.tabId||o.id;
    if (o.frameId || !tab_id || tab_id==-1 || is_disabled() || !E.mitm
        || !o.error || !chrome_error_list.includes(o.error.split('::ERR_')[1]))
    {
        return;
    }
    var prev_code = o.statusCode||o.http_status_code||0;
    var tab_url = o.url||be_tabs.get_url(tab_id);
    var geo_rule = get_enabled_rule(tab_url);
    var hook = 'error', rule = {country: 'us'};
    mitm_lib.trace(tab_id, tab_url, 'hook error init');
    if (!is_unblock_allowed(tab_id, tab_url)
        || !E.is_vpn_allowed(tab_url, true)
        || !mitm_lib.is_mitm_allowed(tab_id, tab_url, tab_url,
        {statusCode: prev_code}, force_strategy!='peer' && geo_rule))
    {
        return void mitm_lib.trace(tab_id, tab_url, 'mitm not allowed');
    }
    be_pac.load_pac_file(undefined, true);
    return etask('init_mitm_check_err', [function(){
        mitm_lib.trace(tab_id, tab_url, 'get_agents country us');
        return be_agent.get_agents(rule);
    }, function(){
        var agents = be_agent.get_all_agents(rule.country);
        mitm_lib.trace(tab_id, tab_url, 'call check_mitm_blocking code '
            +prev_code+' with '+agents.length+' us agents');
        return mitm_lib.check_mitm_blocking({url: tab_url, tab_url: tab_url,
            hook: hook, prev_code: prev_code, tab_id: tab_id,
            geo_rule: !!geo_rule, err_str: o.error, agents: agents});
    }, function(ret){ handle_mitm_block(tab_url, tab_id, ret); }]);
});

E.rewrite_to_proxy = function(url, tab_id, country){
    country = country||'us';
    be_pac.load_pac_file(undefined, true);
    url = zurl.add_proto(url);
    var req_url = make_internal_request(url, {
        'Cache-Control': 'no-cache,no-store,must-revalidate,max-age=-1',
        'X-Hola-Blocked-Response': '1'},
        {ignore_redir: true, once: true, force: 'proxy', country: country});
    B.tabs.update(tab_id, {url: req_url});
};

E.uninit = function(){
    if (!E.inited)
        return;
    uninit_mitm();
    E.sp.return();
    E.update_rule_urls();
    be_pac.set_pac(null);
    be_pac.rules = E.rules = null;
    ff_exported.forEach(function(o){ window[o.name] = null; });
    E.inited = 0;
    requests_handler.uninit();
    E.requests = {};
    for (let k in E.routing_reqs)
        clearTimeout(E.routing_reqs[k].to);
    E.routing_reqs = {};
    chrome.runtime.onMessage.removeListener(on_devtools_pane);
    for (var hc in E.hosts_cache)
    {
        for (var t in E.hosts_cache[hc].timers)
            clearTimeout(E.hosts_cache[hc].timers[t]);
    }
    E.hosts_cache = {};
    E.stopListening();
};

function on_devtools_pane(req, sender, cb){
    if (req.devtool_pane)
        return void cb({create: true});
    if (req.get_trace)
    {
        var trace = E.routing_trace[req.get_trace];
        delete_trace_req(req.get_trace);
        return void cb(trace);
    }
}

function delete_trace_req(id){
    var trace = E.routing_trace[id];
    if (!trace)
        return;
    if (trace.handled)
        delete E.routing_trace[id];
    else
        trace.handled = true;
}

function uninit_mitm(){
    E.mitm = undefined;
    uninit_mitm_hooks();
    mitm_lib.uninit();
    E.set('mitm_inited', false);
}

var mitm_sim_before_request = ff_cb_wrapper('mitm_sim_before_request', d=>{
     var rule = mitm_lib.get_tab_rule(d.tabId, d.initiator || d.url);
     return !rule || rule.cmd=='ignore' ? {cancel: true} : null;
});

var mitm_sim_on_headers = ff_cb_wrapper('mitm_sim_on_headers', d=>{
     var rule = mitm_lib.get_tab_rule(d.tabId, d.initiator || d.url);
     return !rule || rule.cmd=='ignore' ? {redirectUrl:
         chrome.extension.getURL('/js/bext/vpn/pub/sim_dns_block.html')}
         : null;
});

var init_mitm_before_request = ff_cb_wrapper('on_before_request_int', d=>{
    if (d.tabId==-1 && d.url && requests_handler && (E.internal_reqs[d.url]
        || d.url.startsWith('http://internal.hola/')))
    {
        return requests_handler.on_before_request(d);
    }
});

var init_mitm_on_req_end = ff_cb_wrapper('on_completed_int', d=>{
    if (d.tabId!=-1 || !d.url || !E.requests || !E.requests[d.requestId]
        || d.type!='xmlhttprequest')
    {
        return;
    }
    var reqid = d.requestId;
    var req = E.requests[reqid];
    delete E.requests[reqid];
    if (!d.error)
        return;
    var resp = {statusCode: 0, error: d.error};
    if (!req.serving)
    {
        if (req.proxy_req)
            req.proxy_resp = resp;
        else if (req.direct_req)
            req.direct_resp = resp;
    }
    var ireq = E.internal_reqs[req.url];
    if (ireq)
    {
        ireq.error = d.error;
        if (!ireq.res)
            ireq.res = resp;
        if (ireq.et)
            ireq.et.continue();
    }
});

var init_mitm_on_send_headers = ff_cb_wrapper('init_mitm_on_send_headers', d=>{
    if (!d || d.tabId!=-1)
        return;
    var req_id = d.requestId, req = E.requests[req_id];
    var int_req = req && req.opt.int_req;
    if (!req || !int_req || !int_req.hdrs)
        return;
    var hdrs = int_req.hdrs, modified;
    var req_hdrs = d.requestHeaders;
    for (var h in hdrs)
        modified |= hdrs_add(req_hdrs, h, hdrs[h]);
    if (modified)
        return {requestHeaders: req_hdrs};
});

var init_mitm_on_headers = ff_cb_wrapper('init_mitm_on_headers', d=>{
    if (!d || d.tabId!=-1)
        return;
    var req_id = d.requestId, req = E.requests[req_id];
    var int_req = req && req.opt.int_req;
    if (!req || !d || !requests_handler || !int_req || !req.opt.ignore_redir)
        return;
    var res = nodify_res(d);
    var hola_agent = res.statusCode==407 &&
        res.headers['proxy-authenticate']=='Basic realm="Hola Unblocker"';
    if (hola_agent)
        return;
    int_req.res = res;
    req.cancel = true;
});

function uninit_mitm_hooks(){
    if (!init_mitm_hooks.inited)
        return;
    try {
        chrome.webRequest.onBeforeRequest.removeListener(
            init_mitm_before_request);
        chrome.webRequest.onHeadersReceived.removeListener(
            init_mitm_on_headers);
        chrome.webRequest.onHeadersReceived.removeListener(
            init_mitm_on_send_headers);
        chrome.webRequest.onErrorOccurred.removeListener(
            init_mitm_on_req_end);
        chrome.webRequest.onCompleted.removeListener(
            init_mitm_on_req_end);
        chrome.webRequest.onBeforeRequest.removeListener(
            mitm_sim_before_request);
        chrome.webRequest.onHeadersReceived.removeListener(
            init_mitm_check_url);
        chrome.webNavigation.onErrorOccurred.removeListener(
            init_mitm_check_err);
    } catch(e){ on_hooks_err('be_rm_hooks_err', e); }
    init_mitm_hooks.inited = false;
}

function init_mitm_hooks(){
    if (!requests_handler || init_mitm_hooks.inited || !mitm_lib.inited
        || !E.mitm.is_auto_discovery())
    {
        return;
    }
    init_mitm_hooks.inited = true;
    try {
        if (mitm_lib.enable_sim)
        {
            chrome.webRequest.onBeforeRequest.addListener(
                mitm_sim_before_request, {urls: E.mitm
                .sim_filters('before_request'), types: ['main_frame']},
                ['blocking']);
            chrome.webRequest.onHeadersReceived.addListener(
                mitm_sim_on_headers, {urls: E.mitm
                .sim_filters('headers_received'), types: ['main_frame']},
                ['responseHeaders', 'blocking']);
        }
        chrome.webRequest.onHeadersReceived.addListener(
            init_mitm_check_url, {urls: ['<all_urls>'], types: ['main_frame']},
            ['responseHeaders']);
        chrome.webNavigation.onErrorOccurred.addListener(init_mitm_check_err);
        var get_internal_urls = function(){
            var ret = ['http://internal.hola/*'], urls = {};
            for (var key in E.internal_reqs)
            {
                key = /^http:\/\/internal.hola/.test(key) ?
                    E.internal_reqs[key].url : key;
                if (urls[key])
                    continue;
                ret.push(key);
                urls[key] = true;
            }
            return ret;
        };
        E.on('internal_reqs_update', function(){
            var urls = get_internal_urls();
            if (zutil.equal_deep(urls, init_mitm_hooks.int_urls))
                return;
            chrome.webRequest.onBeforeRequest.removeListener(
                init_mitm_before_request);
            chrome.webRequest.onErrorOccurred.removeListener(
                init_mitm_on_req_end);
            chrome.webRequest.onCompleted.removeListener(
                init_mitm_on_req_end);
            chrome.webRequest.onHeadersReceived.removeListener(
                init_mitm_on_headers);
            chrome.webRequest.onHeadersReceived.removeListener(
                init_mitm_on_send_headers);
            init_mitm_hooks.int_urls = urls;
            if (urls.length==1)
                return;
            chrome.webRequest.onBeforeRequest.addListener(
                init_mitm_before_request, {urls: urls}, ['requestBody',
                'blocking']);
            chrome.webRequest.onHeadersReceived.addListener(
                init_mitm_on_headers, {urls: urls}, ['blocking',
                'responseHeaders']);
            chrome.webRequest.onBeforeSendHeaders.addListener(
                init_mitm_on_send_headers, {urls: urls}, ['blocking',
                'requestHeaders']);
            chrome.webRequest.onCompleted.addListener(init_mitm_on_req_end,
                {urls: urls.slice(1)});
            chrome.webRequest.onErrorOccurred.addListener(init_mitm_on_req_end,
                {urls: urls.slice(1)});
        });
    } catch(e){ on_hooks_err('be_add_hooks_err', e); }
}

function remove_mitm_unblock_rule(url){
    be_pac.set_proxy_for_url(url, 'DIRECT', 'mitm_route'); }

function remove_mitm_tab_hook(hooks){
    try {
        mitm_tab_hooks.forEach(function(e){
            if (hooks[e.cbname])
                chrome.webRequest[e.l].removeListener(hooks[e.cbname]);
        });
    } catch(e){ on_hooks_err('be_rm_hooks_err', e); }
}

function add_mitm_tab_hook(tab_id){
    var hooks = {};
    be_pac.load_pac_file(undefined, true);
    var opt = assign({tabId: +tab_id}, requests_handler.listener_opt);
    try {
        mitm_tab_hooks.forEach(function(e){
            hooks[e.cbname] = requests_handler[e.cbname]
                .bind(requests_handler);
            if (!e.extra_opt)
            {
                return chrome.webRequest[e.l].addListener(hooks[e.cbname],
                    opt);
            }
            chrome.webRequest[e.l].addListener(hooks[e.cbname], opt,
                requests_handler.listener_extra_opt);
        });
    } catch(e){ on_hooks_err('be_add_hooks_err', e); }
    return hooks;
}

function init_mitm(){
    if (mitm_lib.inited || !mitm_lib.init({ajax_via_proxy: E.ajax_via_proxy,
        storage: storage, perr: be_lib.perr_ok, loc: be_info.get('location')
        ||storage.get_json('location'), bext_config: bext_config,
        uuid: be_ext.get('uuid'), zerr: zerr, add_tab_hook: add_mitm_tab_hook,
        remove_tab_hook: remove_mitm_tab_hook, version: be_util.version(),
        remove_unblock_rule: remove_mitm_unblock_rule,
        connection_type: be_util.get_connection_type()||'eth',
        device_type: be_util.get_device_type(),
        init_proxy: function(){ be_pac.load_pac_file(undefined, true); }}))
    {
        return;
    }
    E.mitm = mitm_lib;
    E.mitm.debug.tabs_dump = function(){
        console.log('TABS Dump:');
        chrome.tabs.query({}, function(tabs){ tabs.forEach(function(t){
            console.log(t.id+' '+t.url); }); });
    };
    init_mitm_hooks();
    E.set('mitm_inited', true);
}

E.send_not_working = function(tab, reason){
    let log, rate;
    if ((rate = be_ext.get('gen.dbg_log_rate'))===undefined)
        rate = 100;
    if (reason && !Math.floor(Math.random()*rate)/rate)
        log = be_bg_main.get_log();
    be_lib.perr_err({id: 'be_not_working_stats', info: assign({reason, log},
        tab.not_working), rate_limit: {count: 5, ms: date.ms.MIN}});
    delete tab.not_working;
};

function monitor_not_working(tab_id){
    let e, period = 2*date.ms.MIN, n = period, now = Date.now();
    for (let id in E.tab_unblockers)
    {
        let diff, tab = E.tab_unblockers[id];
        if (!(e = tab.not_working) || (diff = now-e.ts)<period)
        {
            if (diff && id!=tab_id)
                n = Math.min(n, diff);
            continue;
        }
        E.send_not_working(tab);
    }
    if (monitor_not_working.to)
        monitor_not_working.to = clearTimeout(monitor_not_working.to);
    if (n<period || tab_id)
        monitor_not_working.to = setTimeout(monitor_not_working, n);
}

function inc_not_working(id, tab){
    let e;
    if (!tab || !(e = tab.not_working))
        return;
    e.stats[id] = (e.stats[id]||0)+1;
}

function on_not_working(e){
    let tab;
    if (!(tab = get_tab_unblocker(e.tab_id)))
    {
        return void be_lib.perr_err({id: 'be_not_working_tab_not_found',
            info: e, rate_limit: {count: 1}});
    }
    zerr.notice('tab:%d not working trigger, src %s, current agent %s, %O',
        e.tab_id, e.src, tab.last_agent&&tab.last_agent.host, zutil.pick(e,
        'agent', 'rule'));
    e = assign({err_logs: tab.err_logs}, e);
    be_lib.perr_err({id: 'be_not_working_trigger', info: e,
        rate_limit: {count: 5, ms: date.ms.MIN}});
    if (tab.not_working)
        E.send_not_working(tab, 'not_working_'+e.src);
    tab.not_working = {ts: Date.now(), info: e, stats: {},
        rule: get_rule_min_fmt(tab.rule)};
    monitor_not_working(e.tab_id);
    if (!be_bg_main || e.src!='ui' || !debug_hooks)
        return;
    let errors = {}, total;
    for (let err in tab.debug_errors)
    {
        if (total = zutil.get(tab.debug_errors, err+'.true.total'))
            errors[err] = total;
    }
    if (tab.media_failures)
        errors.media = tab.media_failures;
    if (tab.browse_failures)
        errors.browse = tab.browse_failures;
    be_bg_main.dump_errors(e.tab_id, errors);
}

E.init = function(opt){
    if (E.inited)
        return;
    proxy_debug = debug_hooks = be_features.have(be_ext, 'proxy_debug');
    proxy_debug_timing = be_features.have(be_ext, 'proxy_debug_timing');
    if (proxy_debug)
        chrome.runtime.onMessage.addListener(on_devtools_pane);
    requests_handler = Base_handler.get_handler();
    if (storage.get('debug_rnd')==null)
        storage.set('debug_rnd', Math.floor(Math.random()*100));
    E.sp = etask('be_tab_unblocker', [function(){ return this.wait(); }]);
    E.url_to_rule_infos = {};
    ff_exported.forEach(function(o){ window[o.name] = o.fn; });
    E.inited = 1;
    E.listen_to(be_ext, 'change:r.vpn.on', be_pac.load_pac_cb);
    E.listen_to(be_ext, 'change:r.ext.enabled', update_state);
    E.listen_to(be_ext, 'change:bext_config', update_config);
    be_ext.on('ui_not_working', on_not_working);
    if (!zutil.is_mocha())
        E.listen_to(be_info, 'change:location', init_mitm);
    be_agent.resolve_agents([{country: 'us'}]);
    if (zutil.is_mocha())
        hola_req_id = 0;
    update_config();
    init_mitm();
};

function update_state(){
    var is_enabled = be_ext.get('r.ext.enabled');
    if (is_enabled==E.is_enabled)
        return;
    E.is_enabled = is_enabled;
    E.stopListening(be_tabs);
    if (requests_handler)
        requests_handler.uninit();
    if (!E.is_enabled)
        return;
    if (requests_handler)
        requests_handler.init();
    E.listenTo(be_tabs, 'created', on_tab_created);
    E.listenTo(be_tabs, 'updated', on_tab_updated);
    E.listenTo(be_tabs, 'removed', on_tab_removed);
    E.listenTo(be_tabs, 'replaced', on_tab_replaced);
    E.listenTo(be_tabs, 'committed', on_tab_ready);
    E.listenTo(be_tabs, 'completed', on_tab_completed);
    E.listenTo(be_tabs, 'before_navigate', on_before_navigate);
    E.listenTo(be_tabs, 'error_occured', on_tab_ready);
}

function mitm_config_reset(prev, config){
    if (_.isEqual(prev.mitm, config.mitm))
        return;
    uninit_mitm();
    init_mitm();
}
function update_config(){
    var prev = bext_config;
    bext_config = be_ext.get('bext_config')||{};
    bw_perr_conf = (bext_config.bw_perr||[]).map(rule=>{
        let res = assign({id: rule.id}, _.omit(rule, 'url', 'host'));
        let url = Array.isArray(rule.url) ? rule.url : [rule.url];
        res.url = url.map(u=>new RegExp('^'+zurl.http_glob_url(u)));
        url = rule.host ? Array.isArray(rule.host) ? rule.host : [rule.host] :
            [];
        res.host = url.map(u=>new RegExp('^'+zurl.http_glob_host(u)));
        return res;
    });
    mitm_config_reset(prev, bext_config);
    debug_hooks = proxy_debug||storage.get('debug_rnd')<zutil.get(bext_config,
        'debug_logs.enabled_perc', 0);
    is_trace_cb = be_ext.get('gen.is_trace_cb2_on');
}
function get_failure_config(type){
    var failure = bext_config&&bext_config[type+'_failure'];
    if (failure && !failure.disable && (!failure.min_ver ||
        be_version_util.cmp(be_util.version(), failure.min_ver)>=0))
    {
        return failure;
    }
}

function ajax_mitm(opt){
    return etask([function(){
        opt = assign({}, {method: 'GET', data_type: 'text',
            timeout: opt.timeout||10*date.ms.SEC}, opt);
        var xhr = new XMLHttpRequest();
        var url = zescape.uri(opt.url, opt.qs);
        var wait = this.wait();
        if (opt.timeout)
        {
            this.alarm(opt.timeout, function(){
                xhr.abort();
                wait.throw({err: 'timeout'});
            });
        }
        xhr.open(opt.method, url);
        xhr.onload = function(){
            return wait.continue({statusCode: xhr.status,
                    headers: attrib.to_obj_lower(attrib.from_str(
                    xhr.getAllResponseHeaders(), {allow_invalid: true})),
                });
        };
        xhr.onerror = function(){
            wait.continue({statusCode: xhr.status, status_text: xhr.statusText,
                response_text: xhr.responseText});
        };
        this.finally(function(){ xhr.onload = xhr.onerror = null; });
        xhr.send();
        return wait;
    }]);
}
if (zutil.is_mocha())
{
    E.t = {Base_handler, is_force_proxy, on_not_working, tab_unblocker_del,
        url_hook: init_mitm_check_url, err_hook: init_mitm_check_err,
        get_forced_strategy};
}

return E; });
