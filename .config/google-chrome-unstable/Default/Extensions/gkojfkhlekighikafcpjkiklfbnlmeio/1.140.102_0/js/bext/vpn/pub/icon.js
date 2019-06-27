// LICENSE_CODE ZON
'use strict'; 
define(['jquery', 'underscore', 'backbone', '/bext/pub/backbone.js',
    '/util/etask.js', '/bext/pub/ext.js',
    '/bext/pub/util.js', '/util/zerr.js', '/bext/vpn/pub/rule.js',
    '/bext/vpn/pub/tabs.js', '/bext/pub/browser.js', '/bext/vpn/pub/util.js',
    '/svc/vpn/pub/util.js', '/bext/pub/lib.js',
    '/util/user_agent.js', '/bext/pub/version_util.js', '/bext/vpn/pub/vpn.js',
    '/bext/vpn/pub/svc.js'],
    function($, _, Backbone, be_backbone, etask, be_ext, be_util,
    zerr, be_rule, be_tabs, B, be_vpn_util, svc_util, be_lib,
    user_agent, be_version_util, be_vpn, be_svc){
B.assert_bg('be_icon');
var E = new be_backbone.task_model();
var chrome = window.chrome, assign = Object.assign;
var icons = {};

function uninit(){
    if (!E.get('inited'))
        return;
    E.sp.return();
    E.set('inited', false);
}

E.init = function(){
    if (E.get('inited'))
        return;
    E.set('inited', true);
    E.sp = etask('be_icon', [function(){ return this.wait(); }]);
    E.on('destroy', function(){ uninit(); });
    E.on('recover', function(){});
    E.listenTo(be_ext, 'change:r.ext.enabled change:ext.slave', refresh_all);
    E.listenTo(be_ext, 'change:r.vpn.on', refresh_active);
    E.listenTo(be_rule, 'change:stamp', refresh_active);
    E.listenTo(be_rule, 'change:rules', refresh_active);
    E.listenTo(be_vpn, 'change:mitm_ext_ui_enabled', refresh_active);
    E.listenTo(be_vpn, 'change:mitm_active_manual', refresh_active);
    E.listenTo(be_svc, 'change:vpn_country', refresh_active);
    if (!chrome)
    {
        E.listenTo(be_tabs, 'change:active.url change:active.id',
            refresh_active);
    }
    else
    {
        E.listenTo(be_tabs, 'change:active.id', refresh_active);
        E.listenTo(be_tabs, 'updated', function(o){
            if (!o.info.url && !o.info.status)
                return;
            E.refresh({tab: o.tab});
        });
        E.listenTo(be_tabs, 'completed', function(o){
            if (!o.frameId)
                E.refresh({tabId: o.tabId});
        });
    }
    refresh_all();
};

function refresh_active(){ E.refresh({retry: 1}); }

function refresh_all(){
    icons = {};
    if (!chrome)
        return E.refresh(null);
    refresh(null); 
    B.tabs.query({}, function(tabs){
        tabs.forEach(function(tab){ refresh(tab); }); });
}

function tab_opt(tab, opt){ return assign(opt, tab ? {tabId: tab.id} : {}); }

function set_icon_cb(retry){
    return function(){
        if (!B.runtime.last_error)
            return;
        var err = B.runtime.last_error.message||B.runtime.last_error;
        zerr('set_icon_err: ', err);
        if (!_.isNumber(retry))
            return;
        if (retry>0)
            return E.refresh({retry: retry-1});
        be_lib.perr_err({id: 'set_icon_err', rate_limit: {count: 1},
            err: err});
    };
}

function is_path_eq(a, b){
    if (!a || !b)
        return;
    if (typeof a=='string' || typeof b=='string')
        return a==b;
    var keys = Object.keys(a);
    if (keys.length!=Object.keys(b).length)
        return;
    for (var i = 0; i<keys.length; i++)
    {
        if (a[keys[i]]!=b[keys[i]])
            return;
    }
    return true;
}

function set_icon(opt, cb){
    var id = opt.tabId!==undefined ? opt.tabId : 'global';
    if (is_path_eq(icons[id], opt.path) && is_path_eq(icons.global, opt.path))
        return cb && cb();
    icons[id] = opt.path;
    B.browser_action.set_icon(opt, cb);
}

function get_rule(url){
    var vpn_country;
    if (vpn_country = be_svc.get('vpn_country'))
    {
        return be_vpn_util.is_vpn_allowed(url, true) && {country: vpn_country,
            enabled: true, type: 'protect_pc'};
    }
    var rule = be_rule.get_rules(url)[0];
    if (be_vpn_util.is_all_browser(rule) &&
        !be_vpn_util.is_vpn_allowed(url, true, undefined, rule))
    {
        return;
    }
    return rule;
}

function refresh(tab, retry){
    var cb = set_icon_cb(retry);
    var gray = {19: 'bext/vpn/pub/img/icon19_gray.png',
        38: 'bext/vpn/pub/img/icon38_gray.png'};
    var ok = {19: 'bext/vpn/pub/img/icon19.png',
        38: 'bext/vpn/pub/img/icon38.png'};
    var blank = {19: 'bext/vpn/pub/img/icon19_blank.png',
        38: 'bext/vpn/pub/img/icon38_blank.png'};
    var mitm_icon = {19: 'bext/vpn/pub/img/ic_unblock19.png',
        38: 'bext/vpn/pub/img/ic_unblock38.png'};
    var protect_icon = {19: 'bext/vpn/pub/img/ic_protect19.png',
        38: 'bext/vpn/pub/img/ic_protect38.png'};
    if (be_version_util.cmp(be_util.version(), '1.13.544')<0)
    {
        gray = {19: 'img/icon19_gray.png', 38: 'img/icon38_gray.png'};
        ok = {19: 'img/icon19.png', 38: 'img/icon38.png'};
        blank = {19: 'img/icon19_blank.png', 38: 'img/icon38_blank.png'};
    }
    var slave = be_ext.get('ext.slave');
    if (!be_ext.get('r.ext.enabled') || slave)
    {
        set_icon(tab_opt(tab, {path: slave ? blank : gray}), cb);
        B.browser_action.set_badge_text(tab_opt(tab,
            {text: slave ? '' : 'off'}));
        B.browser_action.set_badge_background_color(tab_opt(tab,
            {color: '#FF8800'}));
        return;
    }
    if (be_vpn.get('default_protect_ui'))
    {
        B.browser_action.set_badge_text(tab_opt(tab, {text: ''}));
        set_icon(tab_opt(tab, {path: protect_icon}), cb);
        return;
    }
    if (be_vpn.get('mitm_ext_ui_enabled') && be_vpn.get('mitm_active_manual'))
    {
        B.browser_action.set_badge_text(tab_opt(tab, {text: ''}));
        set_icon(tab_opt(tab, {path: mitm_icon}), cb);
        return;
    }
    B.browser_action.set_badge_text(tab_opt(tab, {text: ''}));
    var url = tab&&tab.url||'', rule = get_rule(url);
    if (!be_ext.get('r.vpn.on') || !rule || !rule.enabled || !rule.country)
    {
        set_icon(tab_opt(tab, {path: ok}), cb);
        if (rule && !rule.country)
        {
            be_lib.perr_err({id: 'icon_no_country_err', info: {url: url,
                rule: rule}, rate_limit: {count: 1}});
        }
        return;
    }
    var img = rule.country.toLowerCase()+'.png?'+be_ext.qs_ver_str();
    var b = user_agent.guess_browser();
    var path = {19: 'svc/vpn/pub/img/flag/19/'+img,
        38: 'svc/vpn/pub/img/flag/32/'+img};
    if (be_version_util.cmp(be_util.version(), '1.13.953')<0)
        path = {19: 'img/flag/19/'+img, 38: 'img/flag/32/'+img};
    var q = [];
    return etask({name: '_refresh', cancel: true}, [function(){
        if (b.browser!='firefox' || +(b.version||0)<39 ||
            be_version_util.cmp(be_util.version(), '1.9.29')<0)
        {
            _.each(path, function(v, k){
                path[k] = chrome.runtime.getURL('js/'+v);
            });
            return this.goto('exit');
        }
        var sp = this;
        _.each(path, function(v, k){
            var _sp;
            sp.spawn(_sp=etask({cancel: true}, [function(){
                return be_util.fetch_bin({url: v});
            }]));
            _sp.data = {url: v, k: k};
            q.push(_sp);
        });
        return etask.all(q);
    }, function(arr){
        _.each(arr, function(v, k){
            if (v.res && v.res.data)
                path[q[k].data.k] = v.res.data;
        });
    }, function exit(){ set_icon(tab_opt(tab, {path: path}), cb);
    }]);
}

E.refresh = function(o){ E.trigger('refresh', o); };
E.on('refresh', function(o){
    if (!E.get('inited'))
        return;
    return E.sp.spawn({name: 'refresh', cancel: true}, etask([function(){
        return o && o.tab ? o.tab : o && o.tabId ? be_tabs.get_tab(o.tabId) :
            be_tabs.active();
    }, function(tab){
        if (!tab)
            return;
        return refresh(tab, o&&o.retry);
    }, function catch$(err){ be_lib.err('be_icon_refresh_err', '', err); }]));
});

return E; });
