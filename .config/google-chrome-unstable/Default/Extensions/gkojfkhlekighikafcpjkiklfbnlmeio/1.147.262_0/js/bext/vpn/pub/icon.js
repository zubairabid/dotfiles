// LICENSE_CODE ZON
'use strict'; 
define(['jquery', 'underscore', 'backbone', '/bext/pub/backbone.js',
    '/util/etask.js', '/bext/pub/ext.js',
    '/bext/pub/util.js', '/util/zerr.js', '/bext/vpn/pub/rule.js',
    '/bext/vpn/pub/tabs.js', '/bext/pub/browser.js', '/bext/vpn/pub/util.js',
    '/svc/vpn/pub/util.js', '/bext/pub/lib.js',
    '/util/user_agent.js', '/bext/vpn/pub/vpn.js',
    '/bext/vpn/pub/svc.js'],
    function($, _, Backbone, be_backbone, etask, be_ext, be_util,
    zerr, be_rule, be_tabs, B, be_vpn_util, svc_util, be_lib,
    user_agent, be_vpn, be_svc){
B.assert_bg('be_icon');
var E = new be_backbone.task_model();
var chrome = window.chrome, assign = Object.assign;
var icons = {};

E.uninit = function(){
    if (!E.get('inited'))
        return;
    E.sp.return();
    E.clear();
};

E.init = function(){
    if (E.get('inited'))
        return;
    E.set('inited', true);
    E.sp = etask('be_icon', [function(){ return this.wait(); }]);
    E.on('destroy', function(){ E.uninit(); });
    E.on('recover', function(){});
    E.listenTo(be_ext, 'change:r.ext.enabled', refresh_all);
    E.listenTo(be_ext, 'change:r.vpn.on', refresh_active);
    E.listenTo(be_rule, 'change:stamp', refresh_active);
    E.listenTo(be_rule, 'change:rules', refresh_active);
    E.listenTo(be_rule, 'change:tabs_stub_rules', refresh_active);
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
        be_lib.perr_err({id: 'set_icon_err', info: {retry: retry},
            rate_limit: {count: 1}, err: err});
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
    if (opt.imageData)
        opt = _.omit(opt, ['path']);
    B.browser_action.set_icon(opt, cb);
}

function get_rule(url, tab_id){
    var vpn_country;
    if (vpn_country = be_svc.get('vpn_country'))
    {
        return be_vpn_util.is_vpn_allowed(url, true) && {country: vpn_country,
            enabled: true, type: 'protect_pc'};
    }
    var stub_rule = tab_id && be_rule.get_stub_rule(tab_id);
    if (be_util.is_stub_rule_enabled(stub_rule, url, be_ext.get('is_premium')))
        return stub_rule;
    var rule = be_rule.get_rules(url)[0];
    if (be_vpn_util.is_all_browser(rule) &&
        !be_vpn_util.is_vpn_allowed(url, true, undefined, rule))
    {
        return;
    }
    return rule;
}

function load_image(url){
    return etask([function(){
        var img = new Image();
        var et = this;
        img.onload = function(){
            et.return(img);
        };
        img.src = url;
        return this.wait();
    }]);
}

function smooth_image(image, max_size){
    var steps = Math.max(image.width, image.height)/max_size >> 1;
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.filter = 'blur('+steps+'px)';
    ctx.drawImage(image, 0, 0);
    return canvas;
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
    if (!be_ext.get('r.ext.enabled'))
    {
        set_icon(tab_opt(tab, {path: gray}), cb);
        B.browser_action.set_badge_text(tab_opt(tab, {text: 'off'}));
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
    var url = tab&&tab.url||'', rule = get_rule(url, tab&&tab.id);
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
    var img = rule.country.toLowerCase()+'.svg';
    var path = chrome.runtime.getURL('js/svc/vpn/pub/img/flag/svg_4x3/'+img);
    return etask({name: '_refresh', cancel: true}, [function(){
        return load_image(path);
    }, function(image){
        var size = (window.devicePixelRatio || 1) * 32;
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        if (typeof ctx.filter!='undefined')
            image = smooth_image(image, size);
        canvas.width = canvas.height = size;
        var dwidth = size, dheight = size;
        if (image.width >= image.height)
            dheight *= image.height / image.width;
        else
            dwidth *= image.width / image.height;
        ctx.drawImage(image, (size - dwidth)/2, (size - dheight)/2,
            dwidth, dheight);
        set_icon(tab_opt(tab, {path: path,
            imageData: ctx.getImageData(0, 0, size, size)}), cb);
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
