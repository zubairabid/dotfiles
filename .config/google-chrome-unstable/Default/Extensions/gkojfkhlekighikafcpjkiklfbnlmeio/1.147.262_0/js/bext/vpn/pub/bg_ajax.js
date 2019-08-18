// LICENSE_CODE ZON
'use strict'; 
define(['underscore', '/bext/pub/lib.js', '/bext/pub/backbone.js',
    '/bext/pub/browser.js', '/util/etask.js', '/bext/pub/ext.js',
    '/bext/vpn/pub/ajax.js', '/svc/vpn/pub/unblocker_lib.js', '/util/zerr.js',
    '/util/escape.js', '/util/url.js', '/bext/pub/util.js', '/util/date.js',
    '/util/version_util.js', '/bext/vpn/pub/util.js', '/util/util.js',
    '/util/storage.js', '/util/rand.js', 'conf'],
    function(_, be_lib, be_backbone, B, etask, be_ext, ajax, unblocker_lib,
    zerr, zescape, zurl, be_util, date, version_util, be_vpn_util, zutil,
    storage, rand, conf){
B.assert_bg('be_bg_ajax');
var assign = Object.assign;
var bg_ajax, rand_subset = rand.rand_subset;
var E = new (be_backbone.task_model.extend({
    _defaults: function(){
        this.on('destroy', function(){
            B.backbone.server.stop('be_bg_ajax');
            E.uninit();
        });
        B.backbone.server.start(this, 'be_bg_ajax');
    },
}))();
var bext_config = {}, cloud_agents = {url: '', agents: []};
var cookies = {
    hola: {name: 'connect.sid', url: 'https://hola.org/'},
    svd: {name: 'connect.sid', url: 'https://svd-cdn.com/'},
};
var tests = ['ccgi_check', 'hola_check', 'perr_check'];
var ZG = zutil.get, ZS = zutil.set;
function CGA(path, def){ return ZG(bext_config.bg_ajax, path, def); }
function CSA(path, val){ return ZS(bext_config.bg_ajax, path, val); }

function BgAjax(){}

BgAjax.prototype.init = function(){
    var copy = function(opt){
        opt.mem_agents = (opt.mem_agents||[]).map(function(a){
            return {port: 22224, ip: a.ip}; });
        opt.build_agents = (opt.build_agents||[]).map(function(a){
            return _.pick(a, 'ip', 'port'); });
        return opt;
    };
    var def = {ignore: [], api: {perr: be_lib.perr_ok,
        ajax_via_proxy: E.be_tab_unblocker.ajax_via_proxy},
        dbg_logs: CGA('dbg_logs')};
    var agents_opt = {mem_agents: E.be_tab_unblocker.get_all_agents(),
        build_agents: rand_subset(conf.agents, conf.agents.length),
        cloud_agents: this.load_agents.bind(this)};
    var agents = Object.keys(agents_opt), direct = ['hola', 'svd'];
    direct.concat(agents).forEach(function(name){
        if (CGA('disable_'+name))
            def.ignore.push(name);
    });
    if (CGA('disable_agents'))
        def.ignore = def.ignore.concat(agents).concat('common_agents');
    var opt = assign({def_url: conf.url_ccgi, hola: 'client.hola.org',
        svd: 'client.svd-cdn.com'}, def, agents_opt,
        {ignore: def.ignore.concat(direct).concat('common_agents')});
    this.agents_check = new unblocker_lib.ConnectivityCheck(copy(opt));
    def.common_agents = this.agents_check;
    opt = assign({def_url: conf.url_ccgi, hola: 'client.hola.org',
        svd: 'client.svd-cdn.com'}, def);
    this.ccgi_check = new unblocker_lib.ConnectivityCheck(copy(opt));
    opt = assign({def_url: 'https://hola.org/', hola: 'hola.org',
        svd: 'svd-cdn.com'}, def);
    this.hola_check = new unblocker_lib.ConnectivityCheck(copy(opt));
    opt = assign({def_url: conf.url_perr, hola: 'perr.hola.org/perr',
        svd: 'perr.svd-cdn.com/perr'}, def);
    this.perr_check = new unblocker_lib.ConnectivityCheck(copy(opt));
};

BgAjax.prototype.uninit = function(){
    var _this = this;
    tests.forEach(function(name){
        if (_this[name])
            _this[name] = _this[name].uninit();
    });
    if (this.agents_check)
        this.agents_check = this.agents_check.uninit();
    if (cloud_agents.et)
        cloud_agents.et.return();
    if (this.cookies_et)
        this.cookies_et.return();
    E.be_tab_unblocker.uninit_bg_ajax_via_proxy();
    be_ext.set('bg_ajax.is_active', false);
};

BgAjax.prototype.load_agents = function(){
    var url = CGA('agents_url', 'https://www.dropbox.com/s/3oigucjsoxrpbav/'+
        'conf?dl=1');
    if (!url || url==cloud_agents.url && !cloud_agents.et)
        return cloud_agents.agents;
    return etask({name: 'load_agents', cancel: true, async: true},
    [function(){
        if (cloud_agents.et)
            return this.wait_ext(cloud_agents.et);
        assign(cloud_agents, {agents: [], url: url, et: this});
        return ajax({url: url, text: 1});
    }, function(res){
        if (!res || cloud_agents.agents.length)
            return cloud_agents.agents;
        try {
            res = res.substr(res.length-4)+res.substr(0, res.length-4);
            res = JSON.parse(atob(res));
            res = res instanceof Array ? res : res.agents;
            cloud_agents.agents = rand_subset(res, res.length);
        } catch(e){}
        return cloud_agents.agents;
    }, function finally$(){ delete cloud_agents.et;
    }]);
};

BgAjax.prototype._ajax = function(bg_info, req){
    var burl = zurl.parse(bg_info.url), rurl = zurl.parse(req.url);
    var url = 'https://'+burl.hostname+rurl.path;
    if (req.qs)
        url = zurl.qs_add(url, req.qs);
    if (!bg_info.agent)
    {
        req = _.omit(req, 'url', 'qs');
        req.url = url;
        return ajax(req);
    }
    var opt = assign({always: true, ignore_redir: true,
        hdrs: {'Cache-Control': 'no-cache,no-store,must-revalidate,'+
        'max-age=-1'}, force_headers: true, fix_307: true, src: 'bg_ajax',
        agent: bg_info.agent, force: 'proxy', prot: 'proxy'}, _.pick(req,
        'data', 'with_credentials'));
    var method = req.method||'GET';
    if (opt.data)
    {
        if (method=='GET')
        {
            var qs = typeof opt.data=='object' ? opt.data :
                zurl.qs_parse(opt.data);
            url = zurl.qs_add(url, qs);
            delete opt.data;
        }
        else
        {
            if (typeof opt.data=='object')
                opt.data = zescape.qs(opt.data);
            opt.hdrs['Content-Type'] = 'application/x-www-form-urlencoded; '+
                'charset=UTF-8';
        }
    }
    var t = setTimeout(function(){ et.throw(new Error('timeout')); },
        req.timeout||20*date.ms.SEC);
    var et = etask({cancel: true}, [function(){
        return E.be_tab_unblocker.ajax_via_proxy({url: url, type: method},
            opt);
    }, function(res){
        res = (res||{}).data;
        try { res = res && req.json ? JSON.parse(res) : res;
        } catch(e){ zerr(zerr.e2s(e)); }
        return res;
    }, function finally$(){ clearTimeout(t);
    }]);
    return et;
};

BgAjax.prototype.update_cookies = function(){
    if (!B.have['cookies.get'] || !B.have['cookies.set'])
        return;
    var _this = this;
    return etask({name: 'update_cookies', cancel: true}, [function(){
        if (_this.cookies_et)
            return this.wait_ext(_this.cookies_et);
        _this.cookies_et = etask([function(){
            return etask.all({allow_fail: true}, {
                hola: etask.cb_apply(B.cookies, '.get', [cookies.hola]),
                svd: etask.cb_apply(B.cookies, '.get', [cookies.svd]),
            });
        }, function(res){
            if (!res.hola && !res.svd)
                return this.return();
            if (res.hola && res.svd)
            {
                if (res.hola.value==res.svd.value)
                    return this.return();
                if (res.hola.expirationDate>res.svd.expirationDate)
                    res.svd = undefined;
                else
                    res.hola = undefined;
            }
            var name = res.svd ? {t: 'hola', s: 'svd'} : {t: 'svd', s: 'hola'};
            return etask.cb_apply(B.cookies, '.set',
                [assign(zutil.pick(res[name.s], 'expirationDate', 'sameSite',
                'value', 'httpOnly'), cookies[name.t])]);
        }, function finally$(){ delete _this.cookies_et;
        }, function catch$(e){ zerr(zerr.e2s(e));
        }]);
        return _this.cookies_et;
    }]);
};

BgAjax.prototype.make_ajax = function(e, req){
    var link;
    if (e.selected && (link = e.get_backend_link()))
        return this._ajax(link, req);
    be_ext.set('bg_ajax.is_active', true);
    var _this = this;
    return etask([function(){
        return E.be_tab_unblocker.init_bg_ajax_via_proxy();
    }, function(){
        e.connecting = true;
        return e.run();
    }, function(){
        e.connecting = false;
        return _this._ajax(e.get_backend_link(), req);
    }, function finally$(){ e.connecting = false;
    }]);
};

BgAjax.prototype.ccgi_ajax = function(req){
    return this.make_ajax(this.ccgi_check, req); };

BgAjax.prototype.hola_ajax = function(req){
    var _this = this, hc = this.hola_check;
    return etask([function(){
        var link;
        if (hc.selected && (link = hc.get_backend_link()) && !link.agent)
            return _this.update_cookies();
    }, function(){ return _this.make_ajax(hc, req);
    }]);
};

BgAjax.prototype.perr_ajax = function(req){
    return this.make_ajax(this.perr_check, req); };

BgAjax.prototype.is_proxy_selected = function(c){
    var link;
    return c && c.selected && (link = c.get_backend_link()) && link.agent;
};

function _ajax(req, type){
    req.json = !req.text;
    return etask([function(){
        return bg_ajax ? bg_ajax[type](req) : ajax(req);
    }, function catch$(e){
        var now = Date.now(), is_on = CGA('enable');
        if (is_on && (!_ajax.error_ts || now-_ajax.error_ts>=5*date.ms.MIN))
        {
            E.reset(true);
            _ajax.error_ts = now;
        }
        else if (!is_on)
        {
            if (bg_ajax)
                bg_ajax = bg_ajax.uninit();
        }
        throw e;
    }]);
}

E.ccgi_ajax = function(req){ return _ajax(req, 'ccgi_ajax'); };
E.hola_ajax = function(req){ return _ajax(req, 'hola_ajax'); };
E.perr_ajax = function(req){ return _ajax(req, 'perr_ajax'); };

function update_config(){
    bext_config = be_ext.get('bext_config')||{};
    var dbg = storage.get_json('bg_ajax_debug');
    if (dbg && !Object.keys(dbg).length)
    {
        dbg = {on: 1};
        storage.set_json('bg_ajax_debug', dbg);
    }
    bext_config = zutil.extend_deep({}, bext_config, dbg ? {bg_ajax: dbg} :
        null);
    var s;
    if ((s = CGA('on')) && be_vpn_util.is_conf_allowed(s))
        CSA('enable', true);
    if ((s = CGA('min_version')) && version_util.cmp(be_util.version(), s)<0)
        CSA('enable', false);
    if (CGA('enable'))
        init();
    else
        E.uninit();
}

E.init = function(be_tab_unblocker){
    E.uninit();
    if (E.be_tab_unblocker = be_tab_unblocker)
        E.be_tab_unblocker.be_bg_ajax = this;
    E.listen_to(be_ext, 'change:bext_config', update_config);
    update_config();
};

E.is_hola_via_proxy = function(){
    return bg_ajax && bg_ajax.is_proxy_selected(bg_ajax.hola_check); };

E.on('reset', function(){
    if (!bg_ajax)
        return;
    var connecting;
    for (var t, i = 0; i<tests.length; i++)
    {
        if ((t = bg_ajax[tests[i]]) && t.connecting)
        {
            connecting = true;
            break;
        }
    }
    if (connecting)
        E.reset();
});
E.reset = function(force){
    if (!bg_ajax && !force)
        return;
    if (bg_ajax)
        bg_ajax.uninit();
    bg_ajax = new BgAjax();
    bg_ajax.init();
};

function init(){
    if (bg_ajax || !CGA('enable'))
        return;
    be_util.set_ajax_cb(function(req){ E.perr_ajax(req); });
    bg_ajax = new BgAjax();
    bg_ajax.init();
}

function is_dev_build(){
    return be_util.browser()=='chrome' &&
        B.runtime.id!='gkojfkhlekighikafcpjkiklfbnlmeio';
}

E.hola_api_call = function(path, opt){
    opt = opt||{};
    opt.method = opt.method||'GET';
    var xsrf_header = (conf.firefox_web_ext || is_dev_build()) &&
        B.have['cookies.get'] &&
        !['GET', 'HEAD', 'OPTIONS'].includes(opt.method);
    return etask([function(){
        if (!xsrf_header)
            return;
        return etask.cb_apply(B.cookies, '.get',
            [{url: 'https://hola.org/', name: 'XSRF-TOKEN'}]);
    }, function(c){
        return E.hola_ajax({
            url: 'https://hola.org/'+path,
            data: opt.data,
            method: opt.method,
            headers: c && {'x-xsrf-token': c.value},
            text: opt.text,
            json: !opt.text,
            with_credentials: true,
        });
    }]);
};

E.uninit = function(){
    if (bg_ajax)
        bg_ajax = bg_ajax.uninit();
    be_util.set_ajax_cb();
    E.stopListening();
};

return E; });
