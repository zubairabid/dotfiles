// LICENSE_CODE ZON
'use strict'; 
define(['lang', 'conf'], function(be_lang, conf){
var chrome = window.chrome;
var perr_url = 'perr.hola.org' || 'perr.hola.org';
conf.url_perr = conf.url_perr||'https://'+perr_url+'/client_cgi';
var is_hola_va = window.hola_va;
var is_lum = window.lum;
var base_url = !chrome ? '/data' : '/js';
var E = {modules: {config: {name: 'config'}}};

function require_is_local(){
    return (!location || is_local_url(location.href)); }

function is_local_url(url){
    return /^(moz-extension|chrome-extension|resource|file):\/\//.test(url); }

function get_paths(){
    function fix_file_paths(files){
        for (var name in files)
            files[name] = files[name].replace(/^BASE/, base_url);
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
'/bext/pub/transport.js': 'BASE/bext/pub/transport.js',
'/bext/pub/util.js': 'BASE/bext/pub/util.js',
'/bext/pub/backbone.js': 'BASE/bext/pub/backbone.js',
'/bext/pub/config.js': 'BASE/bext/pub/config.js',
'/bext/pub/pre_loader.js': 'BASE/bext/pub/pre_loader.js',
'/bext/pub/ga.js': 'BASE/bext/pub/ga.js',
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
'/bext/vpn/pub/cs_hola.js': 'BASE/bext/vpn/pub/cs_hola.js',
'/bext/vpn/pub/agent.js': 'BASE/bext/vpn/pub/agent.js',
'/bext/vpn/pub/bg.js': 'BASE/bext/vpn/pub/bg.js',
'/bext/vpn/pub/bg_main.js': 'BASE/bext/vpn/pub/bg_main.js',
'/bext/vpn/pub/ccgi.js': 'BASE/bext/vpn/pub/ccgi.js',
'/bext/vpn/pub/icon.js': 'BASE/bext/vpn/pub/icon.js',
'/bext/vpn/pub/iframe.js': 'BASE/bext/vpn/pub/iframe.js',
'/bext/vpn/pub/info.js': 'BASE/bext/vpn/pub/info.js',
'/bext/vpn/pub/mode.js': 'BASE/bext/vpn/pub/mode.js',
'/bext/vpn/pub/pac.js': 'BASE/bext/vpn/pub/pac.js',
'/bext/vpn/pub/popup.js': 'BASE/bext/vpn/pub/popup.js',
'/bext/vpn/pub/dev_mode.js': 'BASE/bext/vpn/pub/dev_mode.js',
'/bext/vpn/pub/popup_main.js': 'BASE/bext/vpn/pub/popup_main.js',
'/bext/vpn/pub/premium.js': 'BASE/bext/vpn/pub/premium.js',
'/bext/vpn/pub/rule.js': 'BASE/bext/vpn/pub/rule.js',
'/bext/vpn/pub/rules.js': 'BASE/bext/vpn/pub/rules.js',
'/bext/vpn/pub/svc.js': 'BASE/bext/vpn/pub/svc.js',
'/bext/vpn/pub/tab_perr.js': 'BASE/bext/vpn/pub/tab_perr.js',
'/bext/vpn/pub/tab_unblocker.js': 'BASE/bext/vpn/pub/tab_unblocker.js',
'/bext/vpn/pub/tpopup.js': 'BASE/bext/vpn/pub/tpopup.js',
'/bext/vpn/pub/ui_popup_ext.js': 'BASE/bext/vpn/pub/ui_popup_ext.js',
'/bext/vpn/pub/ui_obj.js': 'BASE/bext/vpn/pub/ui_obj.js',
'/bext/vpn/pub/vpn.js': 'BASE/bext/vpn/pub/vpn.js',
'/bext/vpn/pub/mitm_lib.js': 'BASE/bext/vpn/pub/mitm_lib.js',
'/bext/vpn/pub/ajax.js': 'BASE/bext/vpn/pub/ajax.js',
'/bext/vpn/pub/vstat.js': 'BASE/bext/vpn/pub/vstat.js',
'/bext/vpn/pub/hybrid_mock.js': 'BASE/bext/vpn/pub/hybrid_mock.js',
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
'/bext/vpn/pub/bg_ajax.js': 'BASE/bext/vpn/pub/bg_ajax.js',
'/bext/vpn/pub/locale.js': 'BASE/bext/vpn/pub/locale.js',
'/bext/vpn/pub/tz_spoof.js': 'BASE/bext/vpn/pub/tz_spoof.js',
'/bext/vpn/pub/bext_config.js': 'BASE/bext/vpn/pub/bext_config.js',
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

            '/svc/vpn/pub/common_ui.js': 'BASE/svc/vpn/pub/common_ui.js',
'/svc/vpn/pub/unblocker_lib.js': 'BASE/svc/vpn/pub/unblocker_lib.js',
'/svc/vpn/pub/util.js': 'BASE/svc/vpn/pub/util.js',
'/svc/vpn/pub/common_ui.js.map': 'BASE/svc/vpn/pub/common_ui.js.map',

        },
        va: {
            '/bext/va/pub/va.js': 'BASE/bext/va/pub/va.js',
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
            '/bext/lum/pub/config.js': 'BASE/bext/lum/pub/config.js',
'/bext/lum/pub/ga.js': 'BASE/bext/lum/pub/ga.js',
'/bext/lum/pub/locale.js': 'BASE/bext/lum/pub/locale.js',
'/bext/lum/pub/pre_loader.js': 'BASE/bext/lum/pub/pre_loader.js',
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
    var p = Object.assign({}, f.local, f.local_common, f.common);
    if (is_hola_va)
        Object.assign(p, f.va);
    if (is_lum)
        Object.assign(p, f.lum);
    return {paths: fix_file_paths(p), map: {events: '/util/events.js'}};
}

function init(){
    if (E.inited)
        return console.error('config already inited');
    E.inited = true;
    require.onError = require_on_error;
    require.onResourceLoad = function(context, map, depArray){
        if (E.modules[map.name] && !{config: 1}[map.name])
        {
            console.error('module %s already loaded. id: %s, url: %s',
                map.name, map.id, map.url);
        }
        E.modules[map.name] = map;
    };
    E.ver = conf.version;
    var require_config = get_paths();
    E.config = {
        enforceDefine: true,
	baseUrl: base_url,
	urlArgs: '',
	waitSeconds: 0,
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
}

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
    var retries = 3;
    var i, modules = err.requireModules;
    var id = require_is_local() ? 'be_int_require_err' : 'be_require_err';
    console.error('require_on_error %o', err);
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
}

init();

return E; });
