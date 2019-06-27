// LICENSE_CODE ZON
'use strict'; 
define(['jquery', '/bext/pub/backbone.js', 'underscore', '/util/zerr.js',
    '/bext/pub/version_util.js', '/util/etask.js', '/util/date.js',
    '/util/escape.js', '/bext/pub/browser.js', '/bext/pub/locale.js',
    '/util/user_agent.js', '/util/ajax.js', '/util/storage.js',
    '/util/array.js', '/util/util.js'],
    function($, be_backbone, _, zerr, be_version_util, etask, date, zescape, B,
    T, user_agent, ajax, storage, array, zutil){
var chrome = window.chrome, conf = window.conf, zconf = window.zon_config;
var www_config = null;
var E = new be_backbone.model();
var assign = Object.assign;

E.dump_obj = function(obj, fields){
    return !obj ? '' :
        zerr.json(obj, fields, ' ').replace(/^[{ }]\n?|,$/gm, '');
};

E.os_guess = user_agent.guess();
E.browser_guess = user_agent.guess_browser();
E.os_win = function(){ return E.os_guess.os=='windows'; };
E.os_win8 = function(){ return E.os_guess.version==8; };
E.os_mac = function(){ return E.os_guess.os=='macos'; };
E.is_mobile = function(){ return E.os_guess.mobile; };
var _is_laptop;
E.is_laptop = function(){ return _is_laptop; };

E.version = function(){ return zconf.ZON_VERSION; };

E.no_proxy = function(){
    if (conf.firefox_web_ext)
        return false;
    return !window.is_tpopup && chrome && !chrome.proxy; };

E.send_msg = function(id, msg){
    return etask([function(){
        this.alarm(6000, {throw: 'timeout'});
        return etask.cb_apply(chrome.extension, '.sendMessage', [id, msg]);
    }]);
};

E.is_google = function(root_url){ return root_url.split('.')[0]=='google' ||
        root_url.split('.')[1]=='google'; };

E.is_youtube = function(root_url){ return root_url.split('.')[0]=='youtube' ||
        root_url.split('.')[1]=='youtube'; };

E.serr = function(opt){
    var s = '', with_log = opt.with_log;
    var rmt = opt.rmt, bg_main = window.be_bg_main;
    var ccgi_ver, be_ext;
    var log1, log2='', log2_hdr, log_sect_sz = (opt.log_sz||4096)/2 | 0;
    try {
        if (rmt)
        {
            ccgi_ver = rmt.get('ver');
            be_ext = rmt.be_ext;
        }
        s += E.dump_obj({url: location.href, date: Date(),
            ccgi_ver: ccgi_ver});
        s += E.dump_obj(navigator, ['userAgent', 'platform', 'product',
            'productSub', 'buildID', 'vendor']);
        if (bg_main)
            s += '\nbg_main:\n'+E.dump_obj(bg_main.attributes);
        if (be_ext)
            s += '\nbe_ext:\n'+E.dump_obj(be_ext.attributes);
        if (with_log)
        {
            log1 = array.to_nl(zerr.log);
            if (bg_main && bg_main.zerr && bg_main.zerr.log)
            {
                log2_hdr = 'bg_main:\n';
                log2 = array.to_nl(bg_main.zerr.log);
            }
            s += '\nlog:\n'+log1.substr(-log_sect_sz)+'\n'+log2_hdr
            +log2.substr(-log_sect_sz);
        }
    } catch(e){ s = 'Error in serr: '+zerr.e2s(e)+'\n'+s; }
    return s;
};

var check_opera = /\bOPR\b\/(\d+)/i;
E.browser = function(){
    var ua = navigator.userAgent;
    var opera = check_opera.exec(ua);
    return conf.browser.firefox ? 'firefox' :
        conf.browser.torch ? 'torch' :
        conf.browser.opera || opera&&opera[1] ? 'opera' : 'chrome';
};

storage.on_err = function(api, key, err){
    zerr('%s failed %s %s', api, key, zerr.e2s(err));
    E.set('storage.err', (E.get('storage.err')||0)+1);
    E.set('storage.last_error', {api: api, key: key, err: err});
};

E.is_plugin = (function(){
    if (!chrome)
        return function(){ return storage.get_int('plugin.enabled'); };
    if (+user_agent.guess_browser().version>=45)
        return function(){ return false; };
    var is_plugin = !storage.get('tmp_not_plugin') &&
        zconf.BEXT_PLUGIN && E.os_win() && conf.plugin_enabled;
    return function(){ return is_plugin; };
})();

E.ext_type = (function(){
    var types = _.invert(conf.ids);
    return function(id){ return types[id]; };
})();

E.build_info = function(){
    var rmt = E.rmt||window.RMT, ext, mode, tabs;
    if (rmt)
    {
        ext = rmt.be_ext;
        mode = rmt.be_mode;
        tabs = rmt.be_tabs;
    }
    else if (window.ui_popup)
    {
        rmt = window.ui_popup.R;
        ext = window.ui_popup.be_ext;
        tabs = window.ui_popup.be_tabs;
        mode = window.ui_popup.be_mode;
    }
    var info = {version: zconf.ZON_VERSION,
        src_country: storage.get('src_country'),
        manifest_version: zutil.get(B.runtime.manifest, 'version')};
    if (rmt)
    {
        info.server_version = rmt.get('ver')+
            (!rmt.get('inited') ? ' Not initialized' : '');
        info.url = rmt.be_tabs && rmt.be_tabs.get('active.url');
    }
    if (mode)
    {
        info.is_svc = mode.get('is_svc');
        if (mode.get('plugin.enabled'))
            info.plugin_enabled = true;
        if (mode.get('svc.version'))
            info.svc_version = mode.get('svc.version');
        if (mode.get('mode'))
            info.svc_mode = mode.get('mode');
        if (mode.get('pending'))
            info.svc_mode_pending = mode.get('pending');
        var svc_info = mode.get('svc.info')||{};
        if (svc_info.ui_type)
            info.ui_type = svc_info.ui_type;
    }
    if (ext)
    {
        if (ext.get('need_upgrade'))
            info.need_upgrade = ext.get('need_upgrade');
        if (ext.get('r.ext.enabled'))
            info.ext_enabled = ext.get('r.ext.enabled');
        if (ext.get('ext.conflict'))
            info.ext_conflict = ext.get('ext.conflict');
        if (ext.get('ext.slave'))
            info.ext_slave = ext.get('ext.slave');
        if (ext.get('is_premium'))
            info.is_premium = 1;
        var test;
        if (test = ext.get('ab_testing'))
            info[test.name] = test.enable;
        if (E.is_geo_watermark(ext))
            info.geo_watermark = true;
        info.conf_tag = E.get_conf_tag(ext);
        var f;
        if (f = ext.get('features'))
            assign(info, f);
    }
    if (tabs)
    {
        info.active_url = tabs.get('active.url');
        info.active_tab = tabs.get('active.id');
    }
    if (window.is_tpopup)
    {
        info.is_tpopup = true;
        info.tab_id = zutil.get(window, 'hola.tpopup_opt.tab_id');
    }
    info.lccgi = !!window.is_local_ccgi;
    info.makeflags = zconf.CONFIG_MAKEFLAGS;
    if (conf.firefox_web_ext)
        info.product_type = conf.firefox_web_ext2 ? 'webextension' : 'hybrid';
    else if (chrome)
        info.product_type = conf.type;
    info.id = B.runtime.id;
    var browser = E.browser();
    var browser_ver = browser=='opera' ? E.browser_guess.opera_version :
        E.browser_guess.version;
    info.browser = browser+' '+browser_ver;
    info.browser_build = conf.browser.name;
    info.platform = navigator.platform;
    info.user_agent = navigator.userAgent;
    if (window.hola)
    {
        var up = window.is_popup ?
            storage.get_int('up_ts') : window.hola.t.l_start;
        var now = Date.now(), install = storage.get_int('install_ts');
        if (up)
        {
            info.up_ms = now-up;
            info.uptime = select_duration(now-up);
        }
        if (install)
        {
            info.install_ms = now-install;
            info.install_time = select_duration(now-install);
        }
        var update, diff;
        if ((update = storage.get_int('update_ts')) &&
            (diff = now-update)<=date.ms.MIN)
        {
            info.after_update = true;
            info.update_ms = diff;
        }
    }
    return info;
};

var durations = [
    {name: '0-1h', length: 1},
    {name: '1h-1d', length: 1*24},
    {name: '1d-2d', length: 2*24},
    {name: '2d-1w', length: 7*24},
    {name: '1w-2w', length: 14*24},
    {name: '2w-1m', length: 30*24},
    {name: '1m-3m', length: 90*24},
    {name: '3m-6m', length: 180*24},
    {name: '>=6m', length: Infinity},
];
function select_duration(len){
    len /= date.ms.HOUR;
    for (var i = 0; i<durations.length; ++i)
    {
        if (len<durations[i].length)
            return durations[i].name;
    }
}

E.upgrade_ext = _.throttle(function(){
    if (!B.have['runtime.request_update_check'])
        return;
    zerr.notice('upgrade_ext');
    B.runtime.request_update_check(function(status){
        zerr.notice('update check: '+status); });
}, 10*date.ms.MIN);

E.build = function(info){
    info = info||E.build_info();
    var s = '';
    for (var f in info)
        s += (s&&'\n')+f+': '+info[f];
    return s;
};

E.perr_id = function(id, new_name){
    if (new_name)
        return 'vpn.'+E.browser()+'.'+id;
    if (!id.match(/^be_/))
        id = 'be_'+(E.is_plugin() ? 'plugin_' : '')+id;
    else if (E.is_plugin() && !id.match(/^be_plugin_/))
        id = id.replace('be_', 'be_plugin_');
    return id;
};

function perr_send(id, info, opt){
    opt = zutil.clone(opt||{});
    var qs = opt.qs||{}, data = opt.data||{};
    data.is_json = 1;
    if (info && typeof info!='string')
        info = zerr.json(info);
    if (opt.err && !info)
        info = ''+(opt.err.message||zerr.json(opt.err));
    data.info = info;
    qs.id = id;
    return ajax({
        url: conf.url_perr+'/perr',
        qs: qs,
        data: data,
        method: 'POST',
        json: 1,
    });
}

function perr_install(perr_orig, pending){
    while (pending.length)
        perr_send.apply(null, pending.shift());
    return function(id, info, opt){
        perr_orig.apply(null, arguments); 
        return perr_send(id, info, opt);
    };
}

function laptop_test(){
    _is_laptop = storage.get('is_laptop');
    if (!_is_laptop && !E.is_mobile() && navigator && navigator.getBattery)
    {
        navigator.getBattery().then(function(b){
            _is_laptop = !b.charging || b.chargingTime!=0;
            storage.set('is_laptop', _is_laptop);
        });
    }
}

E.init = function(){
    laptop_test();
    zerr.perr_install(perr_install);
    E.zopts.init();
};

E.open_tab = function(opt){
    function create_tab(url){
        B.tabs.create({url: url, active: !!opt.force_active}); }
    var url = opt.url;
    if (opt.force_new)
        return create_tab(url);
    B.tabs.query(assign({lastFocusedWindow: true}, opt.tab_match),
        function(tabs){
            if (!tabs || !tabs.length)
                return create_tab(url);
            if (opt.exclude_re && opt.exclude_re.exec(tabs[0].url))
            {
                B.tabs.create({url: url, active: opt.force_active||false});
                return B.tabs.reload(tabs[0].id);
            }
            B.tabs.update(tabs[0].id, {url: url, active: true}, function(tab){
                if (!tab)
                    create_tab(url);
            });
    });
};

E.open_new_tab = function(opt){
    var _opt = zutil.clone(opt);
    _opt.force_new = 1;
    return E.open_tab(_opt);
};

E.open_hola_tab = function(opt){
    var _opt = zutil.clone(opt);
    _opt.tab_match = chrome ? {url: '*://hola.org/*'} :
        {url_re: '^https?:\\/\\/hola\\.org\\/'};
    _opt.exclude_re = /hola\.org\/unblock\/([^/]*)\/using\/vpn-([^?/]*)$/gi;
    if (E.browser()=='chrome')
    {
        _opt.tab_match.url = [_opt.tab_match.url,
            '*://chrome.google.com/*/'+B.runtime.id+'*'];
    }
    return E.open_tab(_opt);
};

E.open_be_tab = function(opt){
    opt = zutil.clone(opt);
    var url = B.runtime.url;
    opt.tab_match = chrome || conf.firefox_web_ext ? {url: url+'/*'} :
        {url_re: '^'+zescape.regex(url)};
    if (!conf.firefox_web_ext)
        opt.url = (chrome ? 'js/' : url+'/data/')+opt.url;
    return E.open_tab(opt);
};

E.get_product = function(){ return conf.type; };

E.get_www_config = function(){
    return etask([function try_catch$(){
        if (www_config)
            return this.return(www_config);
        return $.getJSON(conf.url_ccgi+'/www_hola.json');
    }, function try_catch$(data){
        if (this.error)
            return this.throw(this.error);
        www_config = data||{};
        return this.return(www_config);
    }]);
};

function print_product_info(build, dev, add_line_cb){
    function add_line(str, val){
        if (add_line_cb)
            add_line_cb(str, val);
        return str+val+'\n';
    }
    var s = '';
    if (build.ext_version)
        s += add_line('Ext version: ', build.ext_version);
    else
        s += add_line('Ext version: ', E.version());
    if (build.rmt_version)
    {
        s += add_line('RMT version: ', build.rmt_version);
        if (build.server_version)
            s += add_line('WWW version: ', build.server_version);
    }
    else if (build.server_version)
        s += add_line('RMT version: ', build.server_version);
    if (build.svc_version)
        s += add_line(T('Service')+': ', build.svc_version);
    if (build.svc_mode)
    {
        var mode = build.svc_mode+' active';
        if (build.svc_mode_pending)
            mode += ', '+build.svc_mode_pending+' pending';
        s += add_line(T('Mode')+': ', mode);
    }
    if (build.product_type)
        s += add_line(T('Product')+': ', build.product_type);
    if (build.browser2)
        s += add_line(T('Browser')+': ', build.browser2);
    else if (build.browser)
        s += add_line(T('Browser')+': ', build.browser);
    if (build.platform)
        s += add_line(T('Platform')+': ', build.platform);
    var cid, uuid;
    var bg_main = window.be_bg_main;
    if (bg_main)
    {
        if (bg_main.get('svc.cid'))
            cid = bg_main.get('svc.cid');
        if (!cid && bg_main.get('svc.cid_js'))
            cid = bg_main.get('svc.cid_js');
        uuid = bg_main.get('uuid');
    }
    else
    {
        cid = build.cid;
        uuid = build.uuid;
    }
    if (cid)
        s += add_line(T('CID')+': ', cid);
    if (uuid)
        s += add_line('UUID: ', uuid);
    if (dev)
        s += add_line('Dev info: ', dev);
    return s;
}

E.dev_info = function(){
    try {
        var a = [], manifest;
        if (chrome && !(manifest = chrome.runtime.getManifest()).update_url &&
            !zutil.get(manifest, 'applications.gecko.update_url'))
        {
            a.push('no update');
        }
        if (chrome && !conf.browser.firefox && !E.ext_type(chrome.runtime.id))
            a.push('unknown id');
        if (zconf._RELEASE_LEVEL!=2)
        {
            if (zconf._RELEASE_LEVEL==1)
                a.push('rel1');
            if (zconf.BUILDTYPE_DEBUG)
                a.push('debug');
        }
        if (conf.arch)
            a.push(conf.arch);
        return a.join(',');
    } catch(e){ zerr('dev_info %s', zerr.e2s(e)); }
    return '';
};

E.problem_mailto_url = function(add_line_cb){
    var build = E.build_info(), dev = E.dev_info();
    var s = print_product_info(build, dev, add_line_cb);
    return zescape.mailto_url({
	to: 'help_be@hola.org',
        subject: 'Problem with Hola extension',
	body: '(Please include a brief explanation of the problem and '
	+'a screenshot if possible)\n\n'
	+'Information automatically generated about my problem:\n'+s});
};

E.zopts = {};
E.zopts.set = function(key, val){
    E.zopts.table[key] = val===undefined ? false : val;
    storage.set_json('hola_opts', E.zopts.table);
};

E.zopts.get = function(key){ return E.zopts.table[key]; };

E.zopts.init = function(){
    if (window.is_tpopup)
        E.zopts.table = window.hola.tpopup_opt.zopts;
    else
        E.zopts.table = storage.get_json('hola_opts')||{};
};

E.fetch_bin = function(opt){
    var req;
    return etask([function(){
        var url = zescape.uri(opt.url, opt.qs);
        var _this = this;
        req = new XMLHttpRequest();
        req.open(opt.method||'GET', url);
        req.responseType = 'blob';
        for (var hdr in opt.headers)
            req.setRequestHeader(hdr, opt.headers[hdr]);
        req.onload = function(e){
            _this.continue({data: e.target.response, size: e.total});
        };
        req.onerror = function(err){ _this.throw(err); };
        req.send();
        return this.wait(opt.timeout);
    }, function(res){
        var _this = this;
        if (this.error || !res)
            return this.throw(this.error);
        var v;
        if (v = req.getResponseHeader('Content-Range'))
            res.fullsize = +v.split('/')[1];
        var reader = new FileReader();
        reader.onerror = function(err){ _this.throw(err); };
        reader.onload = function(){
            res.data = reader.result;
            _this.return({res: res});
        };
        reader.readAsDataURL(res.data);
        return this.wait();
    }, function catch$(err){
        return {error: err||'no response'};
    }]);
};

E.detect_torch = function(){
    var $frm = $('<iframe>').css('display', 'none').appendTo(document.body);
    var frm = $frm.get(0);
    var is_torch = frm.contentWindow.chrome && frm.contentWindow.chrome.torch;
    $frm.remove();
    return !!is_torch;
};

E.get_connection_speed = function(){
    var connection = navigator && (navigator.connection
        || navigator.mozConnection || navigator.webkitConnection);
    return connection&&connection.effectiveType;
};

E.get_connection_type = function(){
    var connection = navigator && (navigator.connection
        || navigator.mozConnection || navigator.webkitConnection);
    return connection&&connection.type;
};

E.get_device_type = function(){
    return E.is_mobile() ? 'mobile' : _is_laptop ? 'laptop' : 'desktop'; };

E.is_mobile_wifi_con = function(){
    return E.is_mobile() && E.get_connection_type()=='wifi';
};

E.is_mobile_cellular_con = function(){
    return E.is_mobile() && E.get_connection_type()=='cellular';
};

E.get_conf_tag = function(ext){
    return zutil.get(ext.get('bext_config'), 'conf_tag'); };

E.is_geo_watermark = function(ext){
    var version = zconf.ZON_VERSION;
    var o = zutil.get(ext.get('bext_config'), 'geo_popup.watermark');
    if (!o || o.min_ver && be_version_util.cmp(version, ''+o.min_ver)<0)
        return false;
    return !!o.enabled;
};

E.get_site_key = function(ext, root_url){
    var sites = zutil.get(ext.get('bext_config'), 'sites', {});
    return Object.keys(sites).find(function(k){
        var v = sites[k];
        var urls = Array.isArray(v.root_url) ? v.root_url : [v.root_url];
        return urls.includes(root_url) && v.min_ver &&
          be_version_util.cmp(E.version(), v.min_ver)>=0;
    });
};

E.get_site_conf = function(ext, root_url){
    var sites = zutil.get(ext.get('bext_config'), 'sites', {});
    return sites[E.get_site_key(ext, root_url)];
};

E.get_suggestion_conf = function(site_conf, src_country){
    if (!site_conf)
        return;
    src_country = (src_country||'').toUpperCase();
    var suggestion_popup = site_conf.suggestion_popup||{};
    return suggestion_popup[src_country]===undefined ? suggestion_popup['*'] :
        suggestion_popup[src_country];
};

E.reload_ext = function(cb, period){
    var info;
    period = period||date.ms.MIN;
    if (!(info = storage.get_json('reload_ext')))
        info = {ts: Date.now(), count: 0};
    var diff = Date.now()-info.ts;
    if (diff>period || diff<0)
    {
        info.ts = Date.now();
        info.count = 1;
    }
    else if (info.count<2)
        info.count++;
    else
        return zerr('too many reload_ext '+info.count);
    storage.set_json('reload_ext', info);
    cb();
    return true;
};

E.init();
return E; });
