// LICENSE_CODE ZON
'use strict'; 
define(['/bext/pub/backbone.js', '/bext/pub/browser.js', '/util/etask.js',
    '/util/zerr.js', '/util/date.js', '/bext/pub/ext.js', '/bext/pub/lib.js',
    '/bext/vpn/pub/bg_ajax.js', '/bext/vpn/pub/tabs.js', '/bext/pub/util.js',
    '/bext/vpn/pub/premium.js', '/util/util.js', '/svc/vpn/pub/util.js',
    '/util/url.js', '/bext/vpn/pub/util.js', '/bext/vpn/pub/agent.js'],
    function(be_backbone, B, etask, zerr, date, be_ext, be_lib, be_bg_ajax,
    be_tabs, be_util, be_premium, zutil, svc_util, zurl, be_vpn_util,
    be_agent){
var assign = Object.assign, conf = window.conf;
var handler;
var E = new (be_backbone.task_model.extend({
    _defaults: function(){
        this.on('destroy', function(){
            B.backbone.server.stop('be_trial');
            uninit();
        });
        B.backbone.server.start(this, 'be_trial');
    },
}))();

function TrialRemote(){
    this.trials = [];
    this.name = 'remote';
    this.get_trials = get_trials.bind(this, '/trial_get2');
    E.be_rule.on('rule_set', function(rule){
        if (be_agent.is_trial_rule(rule) && rule.enabled)
            be_agent.resolve_agents([rule], null, {new_only: true});
    });
}

TrialRemote.prototype.get_trial_active = function(root_url, ignore_ts){
    if (!be_ext.get('user_id') || be_ext.get('is_premium'))
        return;
    return this.trials.find(function(t){
        if (root_url && !t.domain.includes(root_url))
            return false;
        return ignore_ts || t.expire_ts>Date.now();
    });
};

TrialRemote.prototype.is_trial_available = function(root_url){
    return this.set_trial(root_url, 'start', {dry_run: 1}); };

TrialRemote.prototype.is_trial_expired = function(root_url){
    return ['expired', 'grace'].includes(this.trial_state(root_url)); };

TrialRemote.prototype.is_trial_grace_period = function(root_url){
    return this.trial_state(root_url)=='grace'; };

TrialRemote.prototype.set_trial = function(root_url, cmd, opt){
    var site;
    if (!(site = be_util.get_site_conf(be_ext, root_url)))
        return;
    opt = opt||{};
    cmd = cmd||'start';
    var _this = this;
    return etask('trial_start', [function(){
        var qs = assign({url: root_url, opt: cmd}, be_ext.auth());
        if (opt.dry_run)
            qs.dry_run = 1;
        be_lib.perr_ok({id: 'be_trial_start',
            info: {root_url: root_url, cmd: cmd}});
        return be_bg_ajax.ccgi_ajax({url: conf.url_ccgi+'/trial_set2',
            qs: qs});
    }, function(res){
        if (!res || !res.time_left)
        {
            be_lib.perr_ok({id: 'be_trial_start_no_trial',
                info: {root_url: root_url, cmd: cmd}});
            return;
        }
        be_lib.perr_ok({id: 'be_trial_start_got_trial', info: {cmd: cmd,
            time_left: res.time_left, root_url: root_url,
            grace_ms: res.grace_ms}});
        if (!opt.dry_run)
            be_ext.trigger('trial_start');
        var domain = site.root_url;
        if (!Array.isArray(domain))
            domain = [domain];
        res = {domain: domain, time_left: res.time_left, use: res.use,
            grace_ms: res.grace_ms, expire_ts: Date.now()+res.time_left};
        if (!opt.dry_run)
        {
            var t;
            if (t = _this.get_trial(root_url))
                _this.trials.splice(_this.trials.indexOf(t), 1);
            _this.trials.push(res);
            _this.monitor_active_trial();
        }
        return res;
    }, function catch$(e){
        zerr.warn('trial_start failed %s', zerr.e2s(e));
        be_lib.perr_err({id: 'be_trial_start_error', info: {root_url: root_url,
            cmd: cmd, err: zutil.omit(e, 'etask')}});
        throw new Error(zutil.get(e, 'hola_info.data.err', 'unknown'));
    }]);
};

TrialRemote.prototype.monitor_active_trial = function(){
    if (this.trial_monitor)
        return;
    var _this = this;
    this.trial_monitor = etask({async: true}, [function(){
        return monitor_active_trial();
    }, function finally$(){ _this.trial_monitor = null;
    }]);
    E.sp.spawn(this.trial_monitor);
};

TrialRemote.prototype.get_trial = function(root_url){
    return this.trials.find(function(t){
        return t.domain.includes(root_url); });
};

TrialRemote.prototype.get_trial_agent_port = function(rule, def_port){
    if (!rule || !['running', 'grace'].includes(this.trial_state(rule.name)))
        return def_port;
    return 22225;
};

TrialRemote.prototype.trial_state = function(root_url){
    var t;
    if (!root_url || !(t = this.get_trial(root_url)))
        return;
    if (!be_util.get_site_conf(be_ext, root_url))
        return 'forbidden';
    var now = Date.now();
    if (t.expire_ts>now)
        return 'running';
    return t.grace_ms && t.expire_ts<now && now<t.grace_ms+t.expire_ts ?
        'grace' : 'expired';
};

TrialRemote.prototype.set_time_left = function(root_url, value){
    var t, user_id;
    if (!(t = this.get_trial_active(root_url)) ||
        !(user_id = be_ext.get('user_id')))
    {
        return;
    }
    return etask('trial_set_time_left', [function(){
        be_lib.perr_ok({id: 'set_time_left', info: {root_url: root_url,
            value: value}});
        return be_bg_ajax.ccgi_ajax({url: conf.url_ccgi+'/trial_set_time_left',
            qs: assign({url: root_url, time_left: value, user_id: user_id},
            be_ext.auth())});
    }, function(res){
        if (!res || !res.time_left)
            return;
        t.expire_ts = Date.now()+res.time_left;
        t.time_left = res.time_left;
        be_ext.trigger('trial_change', root_url, t);
        return res;
    }, function catch$(e){
        zerr.warn('trial_set_time_left failed %s', zerr.e2s(e));
        throw new Error(zutil.get(e, 'hola_info.data.err', 'unknown'));
    }]);
};

TrialRemote.prototype.uninit = function(){
    if (this.trial_monitor)
        this.trial_monitor.return();
};

function update_trials(){
    if (update_trials.to)
        return;
    update_trials.to = setTimeout(function(){
        delete update_trials.to;
        if (E.get_trial_active())
            refresh_trials();
    }, date.ms.HOUR);
}

function clear_trial(trial){
    if (trial.expire_ts>Date.now() && be_ext.get('user_id'))
        return;
    var update, rules = E.be_rule.get('rules');
    trial.domain.forEach(function(domain){
        var rule = be_vpn_util.get_rules(rules, 'http://'+domain+'/', true);
        if ((rule = rule && rule[0]) && rule.enabled && rule.src=='trial')
        {
            var unblockers = E.be_rule.get_tab_unblockers()||{};
            for (var tabid in unblockers)
            {
                var u = unblockers[tabid];
                if (!u.rule || u.rule.name!=rule.name || !(tabid = +tabid))
                    continue;
                var uri, tab_url = be_tabs.get_url(tabid);
                if (uri = zurl.parse(tab_url))
                {
                    B.tabs.update(tabid, {url: uri.protocol+'//'+
                        uri.hostname});
                }
            }
            E.be_rule.set_rule({name: domain, country: rule.country,
                enabled: false, src: 'trial'});
            update = true;
        }
    });
    if (update)
        E.be_rule.fetch_rules();
}

function monitor_active_trial(on_active_cb){
    var trial_usage = 0, ended = {}, cleared = {};
    return etask.interval(date.ms.SEC, [function(){
        var is_active, is_grace;
        handler.trials.forEach(function(t){
            var root_url = t.domain[0];
            if (!E.get_trial_active(root_url))
            {
                if (!ended[root_url])
                {
                    be_ext.trigger('trial_end', root_url);
                    ended[root_url] = true;
                }
                if (!E.is_trial_grace_period(root_url))
                {
                    if (!cleared[root_url])
                        clear_trial(t);
                    return void(cleared[root_url] = true);
                }
                return void(is_grace = true);
            }
            is_active = true;
            ended[root_url] = cleared[root_url] = undefined;
        });
        if (on_active_cb)
            on_active_cb(is_active && !is_grace);
        if (!is_active)
        {
            if (trial_usage>0)
            {
                be_lib.perr_ok({id: 'be_site_trial_usage',
                    info: {sec: trial_usage}});
            }
            trial_usage = 0;
            if (!is_grace)
                return this.break();
        }
        if (get_trial_using())
            trial_usage++;
    }]);
}

function get_trial_using(root_url){
    var trial;
    if (!(trial = E.get_trial_active(root_url)))
        return;
    for (var rule, rules, i = 0; i<trial.domain.length; i++)
    {
        root_url = trial.domain[i];
        if (!be_tabs.has_root_url(root_url))
            return false;
        rules = E.be_rule.get_rules('http://'+root_url+'/', true);
        if ((rule = rules && rules[0]) && rule.enabled)
            return root_url;
    }
}

function refresh_trials(){ handler.get_trials(); }

function update_trial(trials){
    var now = Date.now();
    return trials.map(function(t){
        var site;
        if (site = be_util.get_site_conf(be_ext, t.domain))
            t.domain = site.root_url;
        if (!Array.isArray(t.domain))
            t.domain = [t.domain];
        if (t.expire_ts>=now && t.time_left!==undefined || t.time_left>0)
            t.expire_ts = now+t.time_left;
        return t;
    });
}

function get_trials(url){
    var _this = this;
    return etask('get_trials', [function(){
        var auth = be_ext.auth();
        if (!auth || !auth.uuid || !auth.session_key)
        {
            be_lib.perr(zerr.L.NOTICE, {id: 'be_empty_user_session'});
            return this.return();
        }
        return be_bg_ajax.ccgi_ajax({url: conf.url_ccgi+url, qs: auth});
    }, function(trials){
        if (!trials || !Array.isArray(trials))
            return;
        _this.trials = update_trial(trials);
        _this.monitor_active_trial();
    }, function catch$(e){ zerr.warn('get_trial failed %s', zerr.e2s(e));
    }]);
}

E.is_trial_grace_period = function(root_url){
    return !zutil.is_mocha() && handler.is_trial_grace_period(root_url); };

E.set_trial = function(root_url, cmd, opt){
    return !zutil.is_mocha() && handler.set_trial(root_url, cmd, opt); };

E.is_trial_available = function(root_url){
    return !zutil.is_mocha() && handler.is_trial_available(root_url); };

E.is_trial_expired = function(root_url){
    return !zutil.is_mocha() && handler.is_trial_expired(root_url); };

E.get_trial_active = function(root_url, ignore_ts){
    return !zutil.is_mocha() && handler.get_trial_active(root_url, ignore_ts);
};

E.get_trial_agent_port = function(rule, def_port){
    return zutil.is_mocha() || !handler ? def_port :
        handler.get_trial_agent_port(rule, def_port);
};

E.get_next_trial_ts = function(root_url){
    var trial, site;
    if (!(site = be_util.get_site_conf(be_ext, root_url)) || !site.trial ||
        !(trial = E.get_trial_active(root_url, true)))
    {
        return;
    }
    var limits, lperiod;
    if ((limits = site.trial.limits) && limits.count)
    {
        lperiod = limits.period||date.ms.DAY;
        if (trial.use && trial.use.count>=limits.count)
            return trial.use.ts+lperiod;
    }
    var wait = site.trial.wait!==undefined ? site.trial.wait : 2*date.ms.MIN;
    return trial.expire_ts+wait;
};

E.on_popup_closed = function(root_url){
    var t;
    if (!E.is_trial_expired(root_url) ||
        !(t = E.get_trial_active(root_url, true)))
    {
        return;
    }
    clear_trial(t);
};

E.set_time_left = function(root_url, value){
    if (handler.set_time_left)
        return handler.set_time_left(root_url, value);
};

E.need_trial = function(root_url){
    var site_conf = be_util.get_site_conf(be_ext, root_url);
    return site_conf && site_conf.require_plus && !be_ext.get('is_premium') &&
        site_conf.trial && !E.get_trial_active(root_url);
};

E.init = function(be_rule){
    E.be_rule = be_rule;
    E.sp = etask('be_trial', [function(){ return this.wait(); }]);
    E.listenTo(be_ext, 'change:session_key', refresh_trials);
    E.listenTo(be_ext, 'change:ui_open', update_trials);
    handler = new TrialRemote();
    refresh_trials();
};

function uninit(){
    E.sp.return();
    if (update_trials.to)
        update_trials.to = clearTimeout(update_trials.to);
}

return E; });
