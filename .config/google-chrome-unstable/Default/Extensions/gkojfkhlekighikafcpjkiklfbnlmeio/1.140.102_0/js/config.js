// LICENSE_CODE ZON
'use strict'; 
define([window.hola && window.hola.no_be_ver ? null : 'be_ver', 'lang'],
    function(be_ver, be_lang){
var chrome = window.chrome;
var conf = window.conf, zconf = window.zon_config;
var static_conf = JSON.parse('{"bootstrap":{"file":"/bootstrap.min.js","shim":{"deps":["jquery","jquery_ui"]}},"jquery_url_parser":{"file":"/purl.min.js","link":"https://cdnjs.cloudflare.com/ajax/libs/jquery-url-parser/2.3.1/","remote":"purl.min.js","shim":{"deps":["jquery"]}},"jquery":{"file":"/jquery/1.11.1/jquery.min.js","link":"https://cdnjs.cloudflare.com/ajax/libs/jquery/1.11.1/","remote":"jquery.min.js"},"jquery_3_3_1":{"file":"/jquery/3.3.1/jquery.min.js","link":"https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/","remote":"jquery.min.js"},"jquery_2_1_4":{"file":"/jquery/2.1.4/jquery.min.js","link":"https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.4/","remote":"jquery.min.js"},"jquery_1_11_1":{"file":"/jquery/1.11.1/jquery.min.js","link":"https://cdnjs.cloudflare.com/ajax/libs/jquery/1.11.1/","remote":"jquery.min.js"},"jquery_cookie":{"file":"/jquery.cookie.min.js","link":"https://cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/","remote":"jquery.cookie.min.js","shim":{"deps":["jquery"]}},"underscore":{"file":"/underscore-min.js","link":"https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/","remote":"underscore-min.js"},"backbone":{"file":"/backbone/1.2.1/backbone-min.js","link":"https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.2.1/","remote":"backbone-min.js","shim":{"deps":["jquery","underscore"]}},"backbone_1_2_1":{"file":"/backbone/1.2.1/backbone-min.js","link":"https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.2.1/","remote":"backbone-min.js","shim":{"deps":["jquery","underscore"]}},"backbone_1_0_0":{"file":"/backbone/1.0.0/backbone-min.js","shim":{"exports":"Backbone","deps":["jquery","underscore"]},"link":"https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/","remote":"backbone-min.js"},"backbone_1_1_2":{"file":"/backbone/1.1.2/backbone-min.js","shim":{"exports":"Backbone","deps":["jquery","underscore"]},"link":"https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.2/","remote":"backbone-min.js"},"typeahead":{"file":"/typeahead.bundle.min.js","link":"https://cdnjs.cloudflare.com/ajax/libs/typeahead.js/0.10.2/","remote":"typeahead.bundle.min.js","shim":{"deps":["jquery"]}},"spin":{"file":"/spin.min.js","link":"https://cdnjs.cloudflare.com/ajax/libs/spin.js/2.3.2/","remote":"spin.min.js"},"text":{"file":"/requirejs.text.js"},"cookie":{"file":"/js.cookie.min.js","link":"https://cdnjs.cloudflare.com/ajax/libs/js-cookie/2.1.1/","remote":"js.cookie.min.js"}}');
var perr_url = 'perr.hola.org' || 'perr.hola.org';
conf.url_perr = conf.url_perr||'https://'+perr_url+'/client_cgi';
var is_local = require_is_local();
var is_local_ccgi = window.is_local_ccgi;
var is_hola_va = window.hola_va;
var is_lum = window.lum;
var E = {modules: {be_ver: {name: 'be_ver'}, config: {name: 'config'}}};

function require_is_local(){
    return !window.require_is_remote && (!location
        || is_local_url(location.href)); }

function is_local_url(url){
    return /^(moz-extension|chrome-extension|resource|file):\/\//.test(url); }

function get_lib_url(name){
    var data = static_conf[name];
    if (typeof data.file!='string')
        throw '"local" should exists for alt_cdn cases';
    if (data.link)
    {
        var link = data.link.replace('ajax.cdnjs.com', 'cdnjs.cloudflare.com');
        return link+data.remote;
    }
    return 'https:'+data.file;
}

function extend(obj){
    for (var i=1; i<arguments.length; i++)
    {
	var source = arguments[i];
	if (!source)
	    continue;
        for (var prop in source)
	    obj[prop] = source[prop];
    }
    return obj;
}
function version_cmp(v1, v2){
    if (!v1 || !v2)
	return +!!v1 - +!!v2;
    var _v1 = v1.split('.'), _v2 = v2.split('.'), i;
    for (i = 0; i<_v1.length && i<_v2.length && +_v1[i] == +_v2[i]; i++);
    if (_v1.length==i || _v2.length==i)
	return _v1.length - _v2.length;
    return +_v1[i] - +_v2[i];
}
function get_url_prefix(base_url){
    var l = !chrome ? '/data' : '/js';
    var root = is_local ? l : is_local_ccgi ? '/js' : base_url;
    return root;
}
function get_paths(base_url, ver){
    function fix_file_paths(files){
        var root = get_url_prefix(base_url);
        for (var name in files)
            files[name] = files[name].replace(/^BASE/, root);
        return files;
    }
    var f = {
        local: {
            typeahead: 'typeahead',
            text: 'BASE/requirejs.text.js',
            '/bext/vpn/pub/popup.js': 'BASE/popup.js',
            '/bext/vpn/pub/bg.js': 'BASE/bext/vpn/pub/bg.js',
            '/bext/vpn/pub/cs_hola.js': 'BASE/bext/vpn/pub/cs_hola.js',
            '/bext/vpn/pub/debug_ui.js': 'BASE/bext/vpn/pub/debug_ui.js',
            '/bext/vpn/pub/privacy.js': 'BASE/bext/vpn/pub/privacy.js',
            '/bext/vpn/pub/ui_lib.js': 'BASE/bext/vpn/pub/ui_lib.js',
            '/bext/vpn/pub/mitm_popup.js': 'BASE/bext/vpn/pub/mitm_popup.js',
            '/bext/vpn/pub/watermark.js': 'BASE/bext/vpn/pub/watermark.js',
            '/bext/vpn/pub/page_lib.js': 'BASE/bext/vpn/pub/page_lib.js',
            '/bext/vpn/pub/about.js': 'BASE/bext/vpn/pub/about.js',
            '/bext/vpn/pub/settings.js': 'BASE/bext/vpn/pub/settings.js',
            '/bext/vpn/pub/templates.js': 'BASE/bext/vpn/pub/templates.js',
            'bext/vpn/pub/vstat': 'BASE/bext/vpn/pub/vstat.js?noext',
            'bext/pub/pre_loader': 'BASE/bext/pub/pre_loader.js?noext',
            'bext/vpn/pub/css/popup': 'BASE/bext/vpn/pub/css/popup.css?noext',
        },
        local_ccgi: {
            typeahead: 'typeahead.bundle.min',
        },
        local_common: {
            jquery: 'jquery.min',
            jquery_cookie: 'jquery.cookie.min',
            cookie: 'js.cookie.min',
            spin: 'spin.min',
            purl: 'purl',
            underscore: 'underscore.min',
            lodash: 'lodash.min',
            backbone: 'backbone.min',
            bootstrap: 'bootstrap',
            rxjs: 'rx.min',
            ua_parser: 'ua-parser.min',
            react: 'react',
            'react-input-autosize': 'react-input-autosize.min',
        },
        remote: {
            jquery: get_lib_url('jquery'),
            jquery_cookie: get_lib_url('jquery_cookie'),
            cookie: get_lib_url('cookie'),
            spin: get_lib_url('spin'),
            purl: get_lib_url('jquery_url_parser'),
            underscore: get_lib_url('underscore'),
            backbone: get_lib_url('backbone_1_0_0'),
            typeahead: get_lib_url('typeahead'),
            text: 'BASE/requirejs.text.js',
            'bext/vpn/pub/vstat': 'BASE/bext/vpn/pub/vstat.js',
        },
        remote_common: {
            be_ver: conf.url_bext+'/be_ver',
            zon_config: 'BASE/zon_config.js',
            '/www/util/pub/storage/www.js':
                 'BASE/www/util/pub/storage/www.js',
            '/protocol/pub/pac_engine.js': 'BASE/protocol/pub/pac_engine.js',
'/protocol/pub/countries.js': 'BASE/protocol/pub/countries.js',
'/protocol/pub/def.js': 'BASE/protocol/pub/def.js',
'/protocol/pub/mongodb_log_util.js': 'BASE/protocol/pub/mongodb_log_util.js',

            '/svc/account/pub/membership.js': 'BASE/svc/account/pub/membership.js',
'/svc/account/pub/admin.html': 'BASE/svc/account/pub/admin.html',
'/svc/account/pub/admin.js': 'BASE/svc/account/pub/admin.js',
'/svc/account/pub/customer_lib.js': 'BASE/svc/account/pub/customer_lib.js',

        },
        common: {
            '/util/setdb.js.map': 'BASE/util/setdb.js.map',
'/util/indexed_db.js.map': 'BASE/util/indexed_db.js.map',
'/util/webrtc_ips.js.map': 'BASE/util/webrtc_ips.js.map',
'/util/setdb.js': 'BASE/util/setdb.js',
'/util/indexed_db.js': 'BASE/util/indexed_db.js',
'/util/webrtc_ips.js': 'BASE/util/webrtc_ips.js',
'/util/ajax.js': 'BASE/util/ajax.js',
'/util/array.js': 'BASE/util/array.js',
'/util/conv.js': 'BASE/util/conv.js',
'/util/country.js': 'BASE/util/country.js',
'/util/csrf.js': 'BASE/util/csrf.js',
'/util/csv.js': 'BASE/util/csv.js',
'/util/date.js': 'BASE/util/date.js',
'/util/es6_shim.js': 'BASE/util/es6_shim.js',
'/util/escape.js': 'BASE/util/escape.js',
'/util/etask.js': 'BASE/util/etask.js',
'/util/events.js': 'BASE/util/events.js',
'/util/lerr.js': 'BASE/util/lerr.js',
'/util/match.js': 'BASE/util/match.js',
'/util/jquery_ajax_ie.js': 'BASE/util/jquery_ajax_ie.js',
'/util/rate_limit.js': 'BASE/util/rate_limit.js',
'/util/sprintf.js': 'BASE/util/sprintf.js',
'/util/lang.js': 'BASE/util/lang.js',
'/util/string.js': 'BASE/util/string.js',
'/util/storage.js': 'BASE/util/storage.js',
'/util/url.js': 'BASE/util/url.js',
'/util/user_agent.js': 'BASE/util/user_agent.js',
'/util/util.js': 'BASE/util/util.js',
'/util/version_util.js': 'BASE/util/version_util.js',
'/util/zerr.js': 'BASE/util/zerr.js',
'/util/ccounter_client.js': 'BASE/util/ccounter_client.js',
'/util/zdot.js': 'BASE/util/zdot.js',
'/util/angular_util.js': 'BASE/util/angular_util.js',
'/util/ajax_lite.js': 'BASE/util/ajax_lite.js',
'/util/hash.js': 'BASE/util/hash.js',
'/util/browser.js': 'BASE/util/browser.js',
'/util/attrib.js': 'BASE/util/attrib.js',
'/util/angular_ui_bootstrap_patch.js': 'BASE/util/angular_ui_bootstrap_patch.js',
'/util/rand.js': 'BASE/util/rand.js',
'/util/countries_locales.js': 'BASE/util/countries_locales.js',

            '/bext/pub/browser.js': 'BASE/bext/pub/browser.js',
'/bext/pub/chrome.js': 'BASE/bext/pub/chrome.js',
'/bext/pub/ext.js': 'BASE/bext/pub/ext.js',
'/bext/pub/lib.js': 'BASE/bext/pub/lib.js',
'/bext/pub/locale.js': 'BASE/bext/pub/locale.js',
'/bext/pub/msg.js': 'BASE/bext/pub/msg.js',
'/bext/pub/popup_lib.js': 'BASE/bext/pub/popup_lib.js',
'/bext/pub/rmt.js': 'BASE/bext/pub/rmt.js',
'/bext/pub/tabs.js': 'BASE/bext/pub/tabs.js',
'/bext/pub/transport.js': 'BASE/bext/pub/transport.js',
'/bext/pub/util.js': 'BASE/bext/pub/util.js',
'/bext/pub/backbone.js': 'BASE/bext/pub/backbone.js',
'/bext/pub/config.js': 'BASE/bext/pub/config.js',
'/bext/pub/pre_loader.js': 'BASE/bext/pub/pre_loader.js',
'/bext/pub/ga.js': 'BASE/bext/pub/ga.js',
'/bext/pub/version_util.js': 'BASE/bext/pub/version_util.js',
'/bext/pub/lang.js': 'BASE/bext/pub/lang.js',

            '/bext/vpn/pub/ui_lib.js.map': 'BASE/bext/vpn/pub/ui_lib.js.map',
'/bext/vpn/pub/debug_ui.js.map': 'BASE/bext/vpn/pub/debug_ui.js.map',
'/bext/vpn/pub/mitm_popup.js.map': 'BASE/bext/vpn/pub/mitm_popup.js.map',
'/bext/vpn/pub/watermark.js.map': 'BASE/bext/vpn/pub/watermark.js.map',
'/bext/vpn/pub/settings.js.map': 'BASE/bext/vpn/pub/settings.js.map',
'/bext/vpn/pub/templates.js.map': 'BASE/bext/vpn/pub/templates.js.map',
'/bext/vpn/pub/privacy.js.map': 'BASE/bext/vpn/pub/privacy.js.map',
'/bext/vpn/pub/page_lib.js.map': 'BASE/bext/vpn/pub/page_lib.js.map',
'/bext/vpn/pub/about.js.map': 'BASE/bext/vpn/pub/about.js.map',
'/bext/vpn/pub/ui.js': 'BASE/bext/vpn/pub/ui.js',
'/bext/vpn/pub/background.js': 'BASE/bext/vpn/pub/background.js',
'/bext/vpn/pub/cs_hola.js': 'BASE/bext/vpn/pub/cs_hola.js',
'/bext/vpn/pub/sharing.js': 'BASE/bext/vpn/pub/sharing.js',
'/bext/vpn/pub/agent.js': 'BASE/bext/vpn/pub/agent.js',
'/bext/vpn/pub/bg.js': 'BASE/bext/vpn/pub/bg.js',
'/bext/vpn/pub/bg_main.js': 'BASE/bext/vpn/pub/bg_main.js',
'/bext/vpn/pub/ccgi.js': 'BASE/bext/vpn/pub/ccgi.js',
'/bext/vpn/pub/devtools.js': 'BASE/bext/vpn/pub/devtools.js',
'/bext/vpn/pub/dev_unblocker.js': 'BASE/bext/vpn/pub/dev_unblocker.js',
'/bext/vpn/pub/features.js': 'BASE/bext/vpn/pub/features.js',
'/bext/vpn/pub/icon.js': 'BASE/bext/vpn/pub/icon.js',
'/bext/vpn/pub/iframe.js': 'BASE/bext/vpn/pub/iframe.js',
'/bext/vpn/pub/info.js': 'BASE/bext/vpn/pub/info.js',
'/bext/vpn/pub/mode.js': 'BASE/bext/vpn/pub/mode.js',
'/bext/vpn/pub/pac.js': 'BASE/bext/vpn/pub/pac.js',
'/bext/vpn/pub/plugin.js': 'BASE/bext/vpn/pub/plugin.js',
'/bext/vpn/pub/popup.js': 'BASE/bext/vpn/pub/popup.js',
'/bext/vpn/pub/dev_mode.js': 'BASE/bext/vpn/pub/dev_mode.js',
'/bext/vpn/pub/popup_main.js': 'BASE/bext/vpn/pub/popup_main.js',
'/bext/vpn/pub/premium.js': 'BASE/bext/vpn/pub/premium.js',
'/bext/vpn/pub/rmt_ext.js': 'BASE/bext/vpn/pub/rmt_ext.js',
'/bext/vpn/pub/rule.js': 'BASE/bext/vpn/pub/rule.js',
'/bext/vpn/pub/rules.js': 'BASE/bext/vpn/pub/rules.js',
'/bext/vpn/pub/slave.js': 'BASE/bext/vpn/pub/slave.js',
'/bext/vpn/pub/social.js': 'BASE/bext/vpn/pub/social.js',
'/bext/vpn/pub/svc.js': 'BASE/bext/vpn/pub/svc.js',
'/bext/vpn/pub/tab_perr.js': 'BASE/bext/vpn/pub/tab_perr.js',
'/bext/vpn/pub/tab_unblocker.js': 'BASE/bext/vpn/pub/tab_unblocker.js',
'/bext/vpn/pub/tpopup.js': 'BASE/bext/vpn/pub/tpopup.js',
'/bext/vpn/pub/ui_popup.js': 'BASE/bext/vpn/pub/ui_popup.js',
'/bext/vpn/pub/ui_popup_ext.js': 'BASE/bext/vpn/pub/ui_popup_ext.js',
'/bext/vpn/pub/ui_obj.js': 'BASE/bext/vpn/pub/ui_obj.js',
'/bext/vpn/pub/vpn.js': 'BASE/bext/vpn/pub/vpn.js',
'/bext/vpn/pub/mitm_lib.js': 'BASE/bext/vpn/pub/mitm_lib.js',
'/bext/vpn/pub/torch_whitelist.js': 'BASE/bext/vpn/pub/torch_whitelist.js',
'/bext/vpn/pub/ajax.js': 'BASE/bext/vpn/pub/ajax.js',
'/bext/vpn/pub/vstat.js': 'BASE/bext/vpn/pub/vstat.js',
'/bext/vpn/pub/hybrid_mock.js': 'BASE/bext/vpn/pub/hybrid_mock.js',
'/bext/vpn/pub/rmt_operations.js': 'BASE/bext/vpn/pub/rmt_operations.js',
'/bext/vpn/pub/site_premium_ui.js': 'BASE/bext/vpn/pub/site_premium_ui.js',
'/bext/vpn/pub/popup_prepare.js': 'BASE/bext/vpn/pub/popup_prepare.js',
'/bext/vpn/pub/tabs.js': 'BASE/bext/vpn/pub/tabs.js',
'/bext/vpn/pub/trial.js': 'BASE/bext/vpn/pub/trial.js',
'/bext/vpn/pub/sim_dns_block.html': 'BASE/bext/vpn/pub/sim_dns_block.html',
'/bext/vpn/pub/sim_dns_block.js': 'BASE/bext/vpn/pub/sim_dns_block.js',
'/bext/vpn/pub/about_main.js': 'BASE/bext/vpn/pub/about_main.js',
'/bext/vpn/pub/settings_main.js': 'BASE/bext/vpn/pub/settings_main.js',
'/bext/vpn/pub/monitor_worker.js': 'BASE/bext/vpn/pub/monitor_worker.js',
'/bext/vpn/pub/animation_arrow.js': 'BASE/bext/vpn/pub/animation_arrow.js',
'/bext/vpn/pub/jquery.cookie.min.js': 'BASE/bext/vpn/pub/jquery.cookie.min.js',
'/bext/vpn/pub/underscore.js': 'BASE/bext/vpn/pub/underscore.js',
'/bext/vpn/pub/underscore-min.js': 'BASE/bext/vpn/pub/underscore-min.js',
'/bext/vpn/pub/react': 'BASE/bext/vpn/pub/react',
'/bext/vpn/pub/react.development.js': 'BASE/bext/vpn/pub/react.development.js',
'/bext/vpn/pub/react-dom': 'BASE/bext/vpn/pub/react-dom',
'/bext/vpn/pub/react-dom.development.js': 'BASE/bext/vpn/pub/react-dom.development.js',
'/bext/vpn/pub/regenerator-runtime.js': 'BASE/bext/vpn/pub/regenerator-runtime.js',
'/bext/vpn/pub/util.js': 'BASE/bext/vpn/pub/util.js',
'/bext/vpn/pub/force_lib.js': 'BASE/bext/vpn/pub/force_lib.js',

            '/svc/pub/search.js': 'BASE/svc/pub/search.js',
'/svc/pub/unblocker_lib.js': 'BASE/svc/pub/unblocker_lib.js',
'/svc/pub/util.js': 'BASE/svc/pub/util.js',

            '/svc/hola/pub/svc_ipc.js': 'BASE/svc/hola/pub/svc_ipc.js',
'/svc/hola/pub/stats.html': 'BASE/svc/hola/pub/stats.html',
'/svc/hola/pub/stats.js': 'BASE/svc/hola/pub/stats.js',

            '/svc/cdn/pub/zone_match.js': 'BASE/svc/cdn/pub/zone_match.js',
'/svc/cdn/pub/timeline.js': 'BASE/svc/cdn/pub/timeline.js',
'/svc/cdn/pub/vstat.js': 'BASE/svc/cdn/pub/vstat.js',
'/svc/cdn/pub/util.js': 'BASE/svc/cdn/pub/util.js',
'/svc/cdn/pub/log.js': 'BASE/svc/cdn/pub/log.js',
'/svc/cdn/pub/spark_features.js': 'BASE/svc/cdn/pub/spark_features.js',

            '/svc/vpn/pub/search.js': 'BASE/svc/vpn/pub/search.js',
'/svc/vpn/pub/unblocker_lib.js': 'BASE/svc/vpn/pub/unblocker_lib.js',
'/svc/vpn/pub/util.js': 'BASE/svc/vpn/pub/util.js',

        },
        va: {
            '/bext/va/pub/va.js': 'BASE/bext/va/pub/va.js',
            '/bext/pub/tabs.js': 'BASE/bext/pub/tabs.js',
            '/bext/pub/ext.js': 'BASE/bext/pub/ext.js',
            '/protocol/pub/pac_engine.js': 'BASE/protocol/pub/pac_engine.js',
'/protocol/pub/countries.js': 'BASE/protocol/pub/countries.js',
'/protocol/pub/def.js': 'BASE/protocol/pub/def.js',
'/protocol/pub/mongodb_log_util.js': 'BASE/protocol/pub/mongodb_log_util.js',

        },
        lum: {
            '/www/util/pub/user_agent_gen.js':
                'BASE/www/util/pub/user_agent_gen.js',
            '/www/util/pub/carriers_gen.js':
                'BASE/www/util/pub/carriers_gen.js',
            '/bext/lum/pub/about.js': 'BASE/bext/lum/pub/about.js',
'/bext/lum/pub/about_main.js': 'BASE/bext/lum/pub/about_main.js',
'/bext/lum/pub/browser.js': 'BASE/bext/lum/pub/browser.js',
'/bext/lum/pub/chrome.js': 'BASE/bext/lum/pub/chrome.js',
'/bext/lum/pub/ext.js': 'BASE/bext/lum/pub/ext.js',
'/bext/lum/pub/lib.js': 'BASE/bext/lum/pub/lib.js',
'/bext/lum/pub/locale.js': 'BASE/bext/lum/pub/locale.js',
'/bext/lum/pub/msg.js': 'BASE/bext/lum/pub/msg.js',
'/bext/lum/pub/popup_lib.js': 'BASE/bext/lum/pub/popup_lib.js',
'/bext/lum/pub/rmt.js': 'BASE/bext/lum/pub/rmt.js',
'/bext/lum/pub/tabs.js': 'BASE/bext/lum/pub/tabs.js',
'/bext/lum/pub/transport.js': 'BASE/bext/lum/pub/transport.js',
'/bext/lum/pub/util.js': 'BASE/bext/lum/pub/util.js',
'/bext/lum/pub/backbone.js': 'BASE/bext/lum/pub/backbone.js',
'/bext/lum/pub/config.js': 'BASE/bext/lum/pub/config.js',
'/bext/lum/pub/pre_loader.js': 'BASE/bext/lum/pub/pre_loader.js',
'/bext/lum/pub/ga.js': 'BASE/bext/lum/pub/ga.js',
'/bext/lum/pub/version_util.js': 'BASE/bext/lum/pub/version_util.js',
'/bext/lum/pub/lang.js': 'BASE/bext/lum/pub/lang.js',

            '/bext/lum/chrome/pub/popup.html': 'BASE/bext/lum/chrome/pub/popup.html',
'/bext/lum/chrome/pub/bg.html': 'BASE/bext/lum/chrome/pub/bg.html',
'/bext/lum/chrome/pub/ui.js': 'BASE/bext/lum/chrome/pub/ui.js',
'/bext/lum/chrome/pub/popup.js': 'BASE/bext/lum/chrome/pub/popup.js',
'/bext/lum/chrome/pub/util.js': 'BASE/bext/lum/chrome/pub/util.js',
'/bext/lum/chrome/pub/lum_api.js': 'BASE/bext/lum/chrome/pub/lum_api.js',
'/bext/lum/chrome/pub/bg_main.js': 'BASE/bext/lum/chrome/pub/bg_main.js',
'/bext/lum/chrome/pub/analytics.js': 'BASE/bext/lum/chrome/pub/analytics.js',
'/bext/lum/chrome/pub/storage.js': 'BASE/bext/lum/chrome/pub/storage.js',
'/bext/lum/chrome/pub/tabs.js': 'BASE/bext/lum/chrome/pub/tabs.js',
'/bext/lum/chrome/pub/agents.js': 'BASE/bext/lum/chrome/pub/agents.js',
'/bext/lum/chrome/pub/rx_state.js': 'BASE/bext/lum/chrome/pub/rx_state.js',
'/bext/lum/chrome/pub/sessions.js': 'BASE/bext/lum/chrome/pub/sessions.js',
'/bext/lum/chrome/pub/proxy.js': 'BASE/bext/lum/chrome/pub/proxy.js',
'/bext/lum/chrome/pub/rpc.js': 'BASE/bext/lum/chrome/pub/rpc.js',
'/bext/lum/chrome/pub/lum.js': 'BASE/bext/lum/chrome/pub/lum.js',
'/bext/lum/chrome/pub/icons.js': 'BASE/bext/lum/chrome/pub/icons.js',
'/bext/lum/chrome/pub/rpc_client.js': 'BASE/bext/lum/chrome/pub/rpc_client.js',
'/bext/lum/chrome/pub/actions.js': 'BASE/bext/lum/chrome/pub/actions.js',
'/bext/lum/chrome/pub/window.js': 'BASE/bext/lum/chrome/pub/window.js',
'/bext/lum/chrome/pub/lum_content.js': 'BASE/bext/lum/chrome/pub/lum_content.js',
'/bext/lum/chrome/pub/ui.js.map': 'BASE/bext/lum/chrome/pub/ui.js.map',
'/bext/lum/chrome/pub/popup.js.map': 'BASE/bext/lum/chrome/pub/popup.js.map',
'/bext/lum/chrome/pub/util.js.map': 'BASE/bext/lum/chrome/pub/util.js.map',
'/bext/lum/chrome/pub/lum_api.js.map': 'BASE/bext/lum/chrome/pub/lum_api.js.map',
'/bext/lum/chrome/pub/bg_main.js.map': 'BASE/bext/lum/chrome/pub/bg_main.js.map',
'/bext/lum/chrome/pub/analytics.js.map': 'BASE/bext/lum/chrome/pub/analytics.js.map',
'/bext/lum/chrome/pub/storage.js.map': 'BASE/bext/lum/chrome/pub/storage.js.map',
'/bext/lum/chrome/pub/tabs.js.map': 'BASE/bext/lum/chrome/pub/tabs.js.map',
'/bext/lum/chrome/pub/agents.js.map': 'BASE/bext/lum/chrome/pub/agents.js.map',
'/bext/lum/chrome/pub/rx_state.js.map': 'BASE/bext/lum/chrome/pub/rx_state.js.map',
'/bext/lum/chrome/pub/sessions.js.map': 'BASE/bext/lum/chrome/pub/sessions.js.map',
'/bext/lum/chrome/pub/proxy.js.map': 'BASE/bext/lum/chrome/pub/proxy.js.map',
'/bext/lum/chrome/pub/rpc.js.map': 'BASE/bext/lum/chrome/pub/rpc.js.map',
'/bext/lum/chrome/pub/lum.js.map': 'BASE/bext/lum/chrome/pub/lum.js.map',
'/bext/lum/chrome/pub/icons.js.map': 'BASE/bext/lum/chrome/pub/icons.js.map',
'/bext/lum/chrome/pub/rpc_client.js.map': 'BASE/bext/lum/chrome/pub/rpc_client.js.map',
'/bext/lum/chrome/pub/actions.js.map': 'BASE/bext/lum/chrome/pub/actions.js.map',
'/bext/lum/chrome/pub/window.js.map': 'BASE/bext/lum/chrome/pub/window.js.map',

            '/protocol/pub/pac_engine.js': 'BASE/protocol/pub/pac_engine.js',
'/protocol/pub/countries.js': 'BASE/protocol/pub/countries.js',
'/protocol/pub/def.js': 'BASE/protocol/pub/def.js',
'/protocol/pub/mongodb_log_util.js': 'BASE/protocol/pub/mongodb_log_util.js',

        },
    };
    for (var l in be_lang.files)
        f.common[l] = 'BASE'+be_lang.files[l];
    var p = {};
    if ('1') 
    {
        if (is_local_ccgi)
            extend(p, f.local_ccgi, f.local_common, f.remote_common, f.common);
        else if (is_local)
            extend(p, f.local, f.local_common, f.common);
        if (is_hola_va)
            extend(p, f.va);
        if (is_lum)
            extend(p, f.lum);
        return {paths: fix_file_paths(p), map: {events: '/util/events.js'}};
    }
    var config = {};
    var cdn_list = JSON.parse('[]');
    if (cdn_list.length && require.s && require.s.contexts &&
        require.s.contexts._ && require.s.contexts._.config &&
        require.s.contexts._.config.cdn && !is_local_url(base_url))
    {
        if (version_cmp(zconf.ZON_VERSION, '1.14.791')<0)
            cdn_list = ['https://client-cdn4.hola.org/bext'];
        config.cdn = cdn_list;
        base_url = '';
    }
    extend(p, f.remote, f.remote_common, f.common);
    config.paths = fix_file_paths(p);
    config.map = {
        events: '/util/events.js',
        '/bext/rmt_ext.js': '/bext/vpn/pub/rmt_ext.js',
        '/bext/ui_popup_ext.js': '/bext/vpn/pub/ui_popup_ext.js',
        pcountries: '/protocol/pub/countries.js',
        pac_engine: '/protocol/pub/pac_engine.js',
        membership: '/svc/account/pub/membership.js',
        svc_util: '/svc/pub/util.js',
        svc_ipc: '/svc/hola/pub/svc_ipc.js',
        ajax: '/util/ajax.js',
        array: '/util/array.js',
        browser: '/util/browser.js',
        country: '/util/country.js',
        date: '/util/date.js',
        escape: '/util/escape.js',
        etask: '/util/etask.js',
        hash: '/util/hash.js',
        rand: '/util/rand.js',
        rate_limit: '/util/rate_limit.js',
        sprintf: '/util/sprintf.js',
        storage: '/util/storage.js',
        string: '/util/string.js',
        url: '/util/url.js',
        user_agent: '/util/user_agent.js',
        util: '/util/util.js',
        zerr: '/util/zerr.js',
        attrib: '/util/attrib.js',
        jquery_ajax_ie: '/util/jquery_ajax_ie.js',
        vpn_util: '/svc/vpn/pub/util.js',
    };
    return config;
}

E.init = function(ver, country){
    if (E.inited)
        return console.error('config already inited');
    E.inited = true;
    require.onError = require_on_error;
    require.onResourceLoad = function(context, map, depArray){
        if (E.modules[map.name] && !{be_ver: 1, config: 1}[map.name])
        {
            console.error('module %s already loaded. id: %s, url: %s',
                map.name, map.id, map.url);
        }
        E.modules[map.name] = map;
    };
    E.ver = ver;
    var base_url = zconf._RELEASE ? conf.url_bext_cdn4 || conf.url_bext :
        conf.url_bext;
    var require_config = get_paths(base_url, ver);
    E.config = {
        enforceDefine: true,
        ver: ver,
	country: country,
	baseUrl: get_url_prefix(base_url),
	urlArgs: !is_local ? 'ver='+ver : '',
	waitSeconds: is_local ? 0 : 30,
        paths: require_config.paths,
	shim: {
	    purl: {deps: ['jquery']},
	    jquery: {exports: '$'},
	    jquery_cookie: {deps: ['jquery']},
	    underscore: {exports: '_'},
	    backbone: {deps: ['jquery', 'underscore'], exports: 'Backbone'},
	    bootstrap: {deps: ['jquery'], exports: 'jQuery.fn.popover'},
	    typeahead: {deps: ['jquery'], exports: 'jQuery.fn.typeahead'},
        'regenerator-runtime': {exports: 'regeneratorRuntime'},
        'react-select': {deps: ['react', 'react-dom', 'prop-types',
            'classnames', 'react-input-autosize']},
	},
        config: {
            text: {
                useXhr: function(){ return true; }
            }
        }
    };
    if (require_config.map)
        E.config.map = {'*': require_config.map};
    if (require_config.cdn)
        E.config.cdn = require_config.cdn;
    require.config(E.config);
    require(['/util/es6_shim.js']);
    define('virt_jquery_all', ['jquery', '/util/jquery_ajax_ie.js',
        '/util/jquery_ajax_binary.js'],
        function(j){ return j; });
};

E.no_undef = ['jquery', 'purl', 'spin', 'underscore', 'backbone',
    'conf', 'zon_config', 'be_bg_main', 'be_popup_main', 'bootstrap',
    'be_main', 'be_plugin'];
E.undef = function(undef_only){
    for (var m in E.modules)
    {
	var name = E.modules[m].name;
	if (E.no_undef.includes(name))
	    continue;
        if (undef_only && !undef_only.includes(name))
            continue;
	require.undef(name);
	delete E.modules[m];
    }
};

function perr(opt){
    if (window.be_bg_main && window.be_bg_main.be_lib &&
        window.be_bg_main.be_lib.perr_err)
    {
	return window.be_bg_main.be_lib.perr_err(opt);
    }
    if (window.be_popup_main && window.be_popup_main.be_popup_lib &&
        window.be_popup_main.be_popup_lib.perr_err)
    {
	return window.be_popup_main.be_popup_lib.perr_err(opt);
    }
    if (!window.hola || !window.hola.base)
        return;
    opt.bt = opt.err && opt.err.stack;
    delete opt.err;
    window.hola.base.perr(opt);
}
function require_on_error(err){
    err = err||{};
    if (localStorage.getItem('lum_debug'))
        console.error(err);
    var retries = 3;
    var i, modules = err.requireModules;
    var id = require_is_local() ? 'be_int_require_err' : 'be_require_err';
    require_on_error.err = require_on_error.err||{};
    var perr_sent = require.perr_sent||(require.perr_sent = []);
    err.require_handled = true;
    if (window.hola)
    {
	window.hola.err = window.hola.err||{};
	window.hola.err.require=(window.hola.err.require||0)+1;
    }
    if (!modules)
    {
        id += '_fin';
	console.error('require fatal error '+err.stack);
        if (perr_sent.indexOf(id)<0)
        {
            perr({id: id, info: 'no_modules '+err, err: err});
            perr_sent.push(id);
        }
	return;
    }
    if (!is_local_ccgi)
        return;
    for (i=0; i<modules.length; i++)
    {
	var m = modules[i];
        var filehead = require.toUrl(m);
        var cdn_fallback = require.s && require.s.contexts &&
            require.s.contexts._ && require.s.contexts._.config &&
            require.s.contexts._.config.cdn;
        var path = E.config.paths[m]||m;
        if (/^(http(s)?:)?\/\//.test(path))
            cdn_fallback = false;
        var e = require_on_error.err[m] = require_on_error.err[m]||{failed: 0};
        e.failed++;
	var info = m+' failed '+e.failed+' err '+err.requireType
	+(window.is_tpopup ? ' tpopup' : '')+' ver '+E.ver;
        if ((err.fallback==true || e.failed<retries) &&
            perr_sent.indexOf(id)<0)
        {
            perr({id: id, info: info, err: err, filehead: filehead});
            perr_sent.push(id);
        }
        if (!cdn_fallback && e.failed<retries)
        {
            require.undef(m);
            require([m]);
        }
        if (!cdn_fallback && e.failed<retries || err.fallback)
            return;
        E.test_all(m, function(ret){
            if (ret)
            {
                if (ret.timeout)
                    info += ' tests_timeout';
                if (ret.url && ret.url.status=='200 OK')
                    info += ' url_ok';
                if (ret.cc_url && ret.cc_url.status=='200 OK')
                    info += ' cc_url_ok';
                if (ret.ms_url && ret.ms_url.status=='200 OK')
                    info += ' ms_url_ok';
                info += ' '+filehead;
                filehead = JSON.stringify(ret, null, '\t')+'\n';
            }
            if (perr_sent.indexOf(id)<0)
            {
                perr({id: id+'_fin', info: info, err: err,
                    filehead: filehead});
                perr_sent.push(id+'_fin');
            }
        });
    }
}

E.test_url = function(url, done_cb, opt){
    opt = opt||{};
    console.log('testing '+url);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    if (opt.no_cache)
    {
        xhr.setRequestHeader('Cache-Control', 'no-cache');
        xhr.setRequestHeader('Pragma', 'no-cache');
        xhr.setRequestHeader('If-None-Match', '"-- bad etag --"');
        xhr.setRequestHeader('If-Modified-Since',
            'Thu Jan 01 1970 02:00:00 GMT');
    }
    var t0 = Date.now();
    xhr.onreadystatechange = function(){
	var DONE = 4;
	if (xhr.readyState!=DONE)
	    return;
	var res = xhr.responseText||'', duration = Date.now()-t0;
	done_cb(xhr, {url: url, status: xhr.status+' '+xhr.statusText,
	    duration: duration+'ms', responseType: xhr.responseType,
	    responseLen: res.length,
	    response: '0..64:\n'+res.substr(0, 64)+'\n-64..'+res.length+':'+
	        res.substr(-64)});
    };
    xhr.send();
};

E.test_all = function(module, done_cb){
    var ms_url = '//www.microsoft.com/library/errorpages/Images/'+
	'Microsoft_logo.png';
    var url = require.toUrl(module);
    if (!url)
        return void done_cb();
    if (!/\.js(\?|$)/.test(url) && (module=='be_ver' || module=='config'))
        url = url.replace(new RegExp(module+'(\\?|$)'), module+'.js$1');
    var ret = {timeout: false};
    var tests_timeout = setTimeout(function(){
        console.error('require tests timeouted');
        ret.timeout = true;
        done_cb(ret);
    }, 60000);
    function check_return(){
	if (ret.url && ret.ms_url && ret.cc_url && !ret.timeout)
        {
            clearTimeout(tests_timeout);
	    done_cb(ret);
        }
    }
    E.test_url(url, function(xhr, e){
        ret.url = e;
        check_return();
    });
    E.test_url(url, function(xhr, e){
        ret.cc_url = e;
        check_return();
    }, {no_cache: true});
    E.test_url(ms_url, function(xhr, e){
	delete e.response;
        ret.ms_url = e;
	check_return();
    });
};

function test_and_recover(m){
    var url = E.config.paths[m];
    console.log('test_and_recover '+m+' '+url);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onreadystatechange = function(){
	var DONE = 4;
	if (xhr.readyState!=DONE)
	    return;
	console.log('status '+xhr.status);
	console.log('statusText '+xhr.statusText);
	console.log('responseType '+xhr.responseType);
	console.log('responseText len '+(xhr.responseText||'').length);
	console.log('responseText '+(xhr.responseText||'').substr(0, 128));
    };
    xhr.send();
}

if (be_ver)
    E.init(be_ver.ver);

return E; });
