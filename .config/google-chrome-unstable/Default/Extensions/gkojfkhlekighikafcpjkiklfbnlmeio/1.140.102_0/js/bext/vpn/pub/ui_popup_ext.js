// LICENSE_CODE ZON
'use strict'; 
(function(){ 
    if (window.is_tpopup)
        return;
    var chrome = window.chrome;
    window.is_popup = window.is_popup ||
        chrome && chrome.extension.getBackgroundPage &&
        chrome.extension.getBackgroundPage()!==window;
    if (!window.is_popup) 
        return;
    window.require_is_remote = true;
})();

require(window.is_tpopup ? [] : ['config', '/bext/pub/util.js', 'jquery'],
    function(be_config, be_util, $)
{
    if (!window.is_popup || window.is_tpopup)
        return;
    load_css('/js/svc/vpn/pub/css/wbm_flags.css');
    $('body').addClass('css-loaded');

    function load_css(url){
        var head = document.getElementsByTagName('head')[0];
        if (!head) 
            return null;
        var css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = url;
        head.appendChild(css);
        return css;
    }
});

(function(){
function get_tpopup_type(){
    return window.hola.tpopup_opt ? window.hola.tpopup_opt.type : undefined; }
function is_mitm_popup(){ return get_tpopup_type()=='mitm_popup'; }
function is_watermark_popup(){ return get_tpopup_type()=='watermark'; }
function is_last_rule_popup(){ return get_tpopup_type()=='last_rule'; }
function is_vpn(){
    return !get_tpopup_type() || is_mitm_popup() || is_watermark_popup() ||
        is_last_rule_popup();
}
define(['jquery', 'underscore', '/bext/pub/backbone.js', '/util/etask.js',
    '/util/zerr.js', '/bext/pub/browser.js',
    is_vpn()||!window.is_tpopup ? '/bext/vpn/pub/ui.js' : undefined,
    '/bext/vpn/pub/ui_obj.js', '/bext/pub/popup_lib.js', '/bext/pub/util.js',
    '/bext/pub/locale.js', window.is_tpopup ? undefined : 'config',
    '/util/storage.js', '/util/escape.js', '/util/ajax.js', '/util/date.js',
    '/util/util.js', '/svc/vpn/pub/util.js', '/bext/vpn/pub/mitm_popup.js',
    '/bext/vpn/pub/watermark.js', '/bext/vpn/pub/util.js'],
    function($, _, be_backbone, etask, zerr, B, be_ui_vpn, be_ui_obj,
    be_popup_lib, be_util, T, be_config, storage, zescape, ajax, date, zutil,
    svc_util, mitm_popup, watermark, be_vpn_util)
{
watermark = watermark.default;
mitm_popup = mitm_popup.default;
B.assert_popup('be_ui_popup_ext');
zerr.set_exception_handler('be', be_popup_lib.err);
var chrome = window.chrome;
var E = new be_backbone.model();
var be_bg_main = window.be_popup_main ? window.be_popup_main.be_bg_main :
    null;
E.zerr = zerr;
E.be_popup_main = window.popup_main;
E.on('destroy', function(){ E.uninit(); });

function init_first_render(is_custom_html){
    E.render_init.timer = clearTimeout(E.render_init.timer);
    if (E.$el.parent()[0]||is_custom_html==true)
        return;
    $('#popup').empty().append(E.$msg, E.$el, E.$post_msg);
}

E.render_init = function(){
    if (E.render_init.timer)
        return;
    E.render_init.timer = setTimeout(function(){
        try {
            E.render_init.timer = undefined;
            init_first_render();
            be_popup_lib.perr_err({id: 'be_ui_popup_slow_render'});
            E.$el.empty().append((new be_ui_obj.init_view({
                className: 'r_ui_obj_init'})).$el);
        } catch(e){ E.set_err('be_ui_popup_render_init_err', e); }
    }, 2000);
};

function send_render_stats(){
    var count = (E.R.get('popup_render')||0)+1;
    E.R.fcall('set', ['popup_render', count]);
    if (!window.hola) 
        return;
    var err = window.hola.err, t = window.hola.t, info = {};
    t.first_render = !t.r_ui;
    t.r_ui = Date.now();
    var t0 = t.first_render || !t.new_ver ? t.l_start : t.new_ver;
    var diff = t.r_ui - t0, max_slow = 4000;
    info.total_ms = diff;
    info.remote_ms = t.r_start-t0;
    if (t.new_ver)
    {
        if (t.first_render)
        {
            info.new_ver_first_ms = t.new_ver-t0;
            info.new_ver_first_local_ms = t.l_ui-t.l_start;
        }
        else
            info.new_ver_after_ms = t.new_ver-t.l_start;
    }
    else
    {
        info.local_ms = t.l_ui-t.l_start;
        if (!t.first_render)
            info.not_first_render = true;
    }
    if (err && err.require)
        info.require = err.require;
    if (count)
        info.count = count;
    if (be_ui_vpn)
    {
        info.url = be_ui_vpn.get_url();
        info.root_url = be_ui_vpn.get_root();
        var rule_enabled = be_ui_vpn.get_enabled_rule();
        if (rule_enabled)
        {
            info.rule_enabled = {};
            info.rule_enabled.name = rule_enabled.name;
            info.rule_enabled.country = rule_enabled.country;
        }
    }
    be_popup_lib.perr(zerr.L[diff>250 ? 'ERR' : 'NOTICE'],
        {id: 'popup_render'+(diff>max_slow ? '_slow' : ''), info: info});
    if (diff>max_slow)
        E.set('pure_connection', true);
}

E.set_tpopup_type = function(type, opt){
    var tpopup_opt = window.hola && window.hola.tpopup_opt;
     if (!tpopup_opt || type==tpopup_opt.type)
         return;
     if (tpopup_opt.type)
         $('body').removeClass(tpopup_opt.type);
     if (type)
         $('body').addClass(type);
     tpopup_opt.type = type;
     E.be_popup_main.resize_handler_uninit();
     if (type && be_ui_vpn && be_ui_vpn.$el)
     {
         be_ui_vpn.destroy();
         be_ui_vpn.$el.remove();
     }
     E.render_popup(opt);
     setTimeout(function(){ E.be_popup_main.resize_handler_init(); }, 500);
};

E.render_popup = function(opt){
    if (is_mitm_popup())
        E.render_mitm_popup(opt);
    else if (is_watermark_popup())
        E.render_watermark(opt);
    else if (is_last_rule_popup())
        E.render_last_rule(opt);
    else
        render_vpn();
};

function set_on(on){
    var $checkbox = $('#g_switch');
    if (on)
    {
        $checkbox.addClass('enabled');
        $checkbox.attr('title', T('Turn off Hola'));
    }
    else
    {
        $checkbox.removeClass('enabled');
        $checkbox.attr('title', T('Turn on Hola'));
    }
}

function switch_cb(){
    var $checkbox = $('#g_switch');
    $checkbox.css('visibility', 'visible');
    set_on(be_bg_main.get('enabled'));
}

E.open_page = function(url){
    B.tabs.update(E.be_tabs.get('active.id'), {url:
        url, active: true});
    if (!window.is_tpopup)
        this.close_popup();
};

E.open_settings = function(){
    be_util.open_be_tab({url: 'settings.html', force_active: true});
};

var switch_button_html = '<svg class="" id="powerbutton" height="100%" '+
    'width="100%" viewBox="0 0 20 20" style="display:none;"><g>'+
        '<path d="M10,11.7c-0.6,0-1.2-0.5-1.2-1.1V1.1C8.8,0.5,9.4,0,10,'+
        '0c0.6,0,1.2,0.5,1.2,1.1v9.4 C11.2,11.2,10.6,11.7,10,11.7z" />'+
        '<path d="M13.5,1.7v2.4c2.4,1.2,4.1,3.6,4.1,6.4c0,4-3.4,7.2-7.6,'+
        '7.2s-7.6-3.2-7.6-7.2c0-2.8,1.7-5.2,4.1-6.4V1.7 C2.7,3.1,0,6.5,0,'+
        '10.6C0,15.8,4.5,20,10,20s10-4.2,10-9.4C20,6.5,17.3,3.1,13.5,1.7z"/>'+
    '</g></svg>';

E.render_header = function(){
    var $header = $('#header');
    $('.popup-header-controls').remove();
    var $header_controls_right = $('<div>', {'class':
        'popup-header-controls-right popup-header-controls'});
    var $header_controls_left = $('<div>', {'class':
        'popup-header-controls-left popup-header-controls'});
    if (window.is_tpopup)
    {
        $('<div>', {'class': 'popup-header-controls-item'}).append($('<div>',
            {id: 'tpopup_close', 'class': 'popup-header-controls-button '+
            'popup-header-close'}))
        .append($('<div>', {id: 'tpopup_close_hint', 'class': 'popup-hint '+
            'popup-header-close-hint'}))
        .appendTo($header_controls_right);
    }
    else
    {
        var $checkbox = $('<div>', {id: 'g_switch', 'class':
            'popup-header-controls-button popup-header-switch'});
        $checkbox.html(switch_button_html);
        $('<div>', {'class': 'popup-header-controls-item'}).append($checkbox)
        .appendTo($header_controls_right);
        $checkbox.click(function(){
            if (E.be_ext.get('ext.conflict'))
                return;
            var on = !$checkbox.hasClass('enabled');
            set_on(on);
            be_bg_main.fcall('set_enabled', [on]);
        });
    }
    $header.prepend($header_controls_left);
    $header.append($header_controls_right);
    E.listen_to(be_bg_main, 'change:enabled', switch_cb);
};

E.render_footer = function(){
    var $td = $('#footer .r_ui_premium').empty();
    $('<a>', {href: 'https://hola.org/unblock/popular', target: '_blank'})
    .text(T('Popular sites')).appendTo($td);
};

function render_vpn(){
    if (!be_ui_vpn || be_ui_vpn.$el.parents('body')[0])
        return;
    E.listenToOnce(be_ui_vpn, 'render_done', function(){
        send_render_stats();
        init_first_render();
        E.$el.empty().append(be_ui_vpn.$el);
    });
    if (window.is_tpopup)
        E.be_popup_main.show_tpopup();
    E.render_header();
    E.render_footer();
    be_ui_vpn.init(E);
    be_ui_vpn.is_visible = true;
}

E.render_mitm_popup = function(opt){
    E.is_mitm = true;
    init_first_render();
    mitm_popup.init(E);
    mitm_popup.render(opt);
    E.be_popup_main.show_tpopup();
};

E.render_watermark = function(opt){
    E.is_watermark = true;
    init_first_render();
    watermark.init(E);
    watermark.render(opt);
    E.be_popup_main.show_tpopup();
};

E.render_last_rule = function(opt){
    E.is_last_rule = true;
    init_first_render();
    watermark.init(E);
    var country = zutil.get(window, 'hola.tpopup_opt.country');
    watermark.render({suggest_country: country, prefix: 'last_rule'});
    E.be_popup_main.show_tpopup();
};

E.render_error = function(msg, err){
    try {
        init_first_render();
        $('#rmt_spinner').remove(); 
        if (!this.ui_error)
        {
            be_popup_lib.perr_err({id: 'be_ui_popup_render_error', err: err,
                info: {msg: msg}});
            this.ui_error = new be_ui_obj.error_view({className:
                'r_ui_obj_error'});
        }
        E.$el.empty().append(this.ui_error.$el);
    } catch(e){
        console.error('render error %s', zerr.e2s(e));
        be_popup_lib.perr_err({id: 'be_ui_popup_render_error_err', err: e});
    }
};

function storage_err_cb(){
    if (!be_util.get('storage.err'))
        return;
    E.stopListening(be_util, 'change:storage.err');
    var last = be_util.get('storage.last_error');
    be_popup_lib.perr_err({id: 'storage_err',
        info: last ? last.api+' '+last.key : '', err: last&&last.err});
}

function get_tab_id(){
    return window.is_tpopup && zutil.get(window, 'hola.tpopup_opt.tab_id ') ||
        E.be_tabs&&E.be_tabs.get('active.id');
}

function get_url(){
    return zutil.get(window, 'hola.tpopup_opt.url') ||
        E.be_tabs.get('active.url');
}

function get_root_url(){ return svc_util.get_root_url(get_url()); }

function get_connection_id(){
    return zutil.get(window, 'hola.tpopup_opt.connection_id');
}

function update_logo(){
    var root_url = get_root_url();
    etask([function(){
        return E.be_trial.ecall('get_trial_active', [root_url]);
    }, function(trial){
        var is_premium = !!E.be_ext.get('is_premium');
        var is_trial = !!trial && !is_premium;
        $('body').toggleClass('user-trial', is_trial);
        $('body').toggleClass('user-premium', is_premium);
        $('body .popup-header a.popup-header-logo').attr('href',
            is_premium ? 'https://hola.org?utm_source=holaext' :
            be_vpn_util.plus_ref('logo_upgrade', {root_url: root_url}));
        storage.set('ui_cache_is_trial', +is_trial);
        storage.set('ui_cache_is_premium', +is_premium);
    }]);
}

E.init = function(){
    try {
        if (E.R)
            return;
        if (!$('body').hasClass('is-new-ui') &&
            !$('body').hasClass('tpopup-new'))
        {
            window.be_ui_popup_ext = E;
            E.waiting_new_ui = true;
            return;
        }
        E.init_id = Math.random();
        E.waiting_new_ui = false;
        be_bg_main = E.be_popup_main && E.be_popup_main.be_bg_main;
        if (be_util.no_proxy())
        {
            render_opera_warning();
            return;
        }
        if (!B.inited)
        {
            B.init();
            $(window).on('unload', function(){ E._destroy(); });
        }
        if (!E.$el)
        {
            if (window.hola)
                window.hola.t.r_start = Date.now();
            E.$msg = $('<div>', {class: 'be_ui_popup_msg'});
            E.$el = $('<div>', {class: 'be_ui_popup'});
            E.$post_msg = $('<div>', {class: 'be_up_popup_msg'});
            window.ui_popup = E;
            if (be_bg_main && !be_bg_main.get('rmt_loaded'))
            {
                zerr('rmt not loaded, trying to load it');
                be_bg_main.fcall('load_rmt', []);
            }
        }
        if (!E.start)
        {
            E.start = new Date();
            $('body').addClass('rmt'); 
            $('#rmt_spinner').remove(); 
            E.render_init();
        }
        if (!E.rmt_ping)
        {
            B.backbone.client.ping('RMT', 500, function(ret){
                if (!ret.error)
                    E.rmt_ping = true;
                else
                    zerr('popup ping bg failed %s', zerr.json(ret));
                return E.init();
            });
            return;
        }
        zerr.notice('popup got bg');
        E.R = B.backbone.client.start('RMT');
        E.be_ext = B.backbone.client.start('be_ext');
        E.be_svc = B.backbone.client.start('be_svc');
        E.be_mode = B.backbone.client.start('be_mode');
        if (is_vpn())
            E.be_vpn = B.backbone.client.start('be_vpn');
        E.be_rule = B.backbone.client.start('be_rule');
        E.be_info = B.backbone.client.start('be_info');
        E.be_tabs = B.backbone.client.start('r.be_tabs');
        E.be_premium = B.backbone.client.start('be_premium');
        E.be_trial = B.backbone.client.start('be_trial');
        E.be_tpopup = B.backbone.client.start('be_tpopup');
        E.be_dev_mode = B.backbone.client.start('be_dev_mode');
        var be_rmt_operations = B.backbone.client.start('be_rmt_operations');
        ajax.do_op = function(){
            be_rmt_operations.ecall('do_op', arguments); };
        E.listen_to(be_util, 'change:storage.err', storage_err_cb);
        E.R.on('destroy', r_destroy_cb);
        E.R.on_init('change:status', r_status_cb);
        E.R.on_init('change:inited', inited_cb);
        E.be_ext.on('change:r.ext.enabled', inited_cb);
        E.listen_to(E.be_ext, 'change:need_upgrade change:need_svc_upgrade '+
            'change:ext.conflict', need_upgrade_cb);
        E.listen_to(E.be_ext, 'change:ext.conflict', ext_conflict_cb);
        if (B.use_msg)
        {
            E.R.on('change:_backbone_client_started', inited_cb);
            E.be_ext.on('change:_backbone_client_started', inited_cb);
            if (is_vpn())
                E.be_vpn.on('change:_backbone_client_started', inited_cb);
            E.be_rule.on('change:_backbone_client_started', inited_cb);
            E.be_info.on('change:_backbone_client_started', inited_cb);
            E.be_tabs.on('change:_backbone_client_started', inited_cb);
            E.be_premium.on('change:_backbone_client_started', inited_cb);
            if (!window.is_tpopup)
                E.be_dev_mode.on('change:_backbone_client_started', inited_cb);
        }
        E.listen_to(E.be_ext, 'change:is_premium trial_start trial_end',
            update_logo);
        E.listenTo(E.be_ext, 'trial_end', on_trial_end);
        E.listenTo(E.be_tpopup, 'body_click', on_body_click);
    } catch(e){
        E.set_err('be_ui_popup_init_err', e);
    }
};

E.uninit_user_nav = function(){
    if (E.nav)
        E.nav.remove();
    E.nav = undefined;
};

E.uninit = function(){
    try {
        E.render_init.timer = clearTimeout(E.render_init.timer);
        E.uninit_user_nav();
        if (be_ui_vpn && be_ui_vpn.inited)
            be_ui_vpn._destroy();
        if (E.R)
        {
            E.R.off('destroy', r_destroy_cb);
            E.R.off('change:inited', inited_cb);
            E.R.off('change:status', r_status_cb);
            E.be_ext.off('change:r.ext.enabled', inited_cb);
            if (E.be_vpn)
                E.be_vpn.off('change:status', status_cb);
            B.backbone.client.stop('be_premium');
            B.backbone.client.stop('be_trial');
            B.backbone.client.stop('be_tpopup');
            B.backbone.client.stop('be_dev_mode');
            B.backbone.client.stop('be_rmt_operations');
            B.backbone.client.stop('r.be_tabs');
            B.backbone.client.stop('be_info');
            if (is_vpn())
            {
                B.backbone.client.stop('be_rule');
                B.backbone.client.stop('be_vpn');
            }
            B.backbone.client.stop('be_mode');
            B.backbone.client.stop('be_svc');
            B.backbone.client.stop('be_ext');
            B.backbone.client.stop('RMT');
        }
        B._destroy();
    } catch(e){
        zerr('be_ui_popup err: %s', e.stack||e);
        be_popup_lib.perr_err({id: 'be_ui_popup_destroy', err: e});
    }
};

function r_destroy_cb(){
    zerr.notice('rmt desotryed, reloading popup');
}

function r_status_cb(){
    if (E.R.get('status')!='error')
        return;
    zerr('RMT had an error, trying once to recover');
    E.R.off('change:status', r_status_cb);
    return E.R.fcall('init_cb', ['']);
}

function need_upgrade_cb(){
    var need_upgrade = E.be_ext.get('need_upgrade');
    var need_svc_upgrade = E.be_ext.get('need_svc_upgrade');
    var ext_conflict = E.be_ext.get('ext.conflict');
    E.$msg.empty();
    if (!need_upgrade&&!need_svc_upgrade&&!ext_conflict)
        return void E.$el.show();
    if (ext_conflict)
        return void E.$el.hide();
    if (need_upgrade)
        E.$el.hide();
    be_popup_lib.perr_err({id: need_upgrade ? 'be_need_upgrade_view' :
        'be_need_svc_upgrade_view'});
    var $div = $('<div>', {class: 'r_ui_popup_msg'});
    $('<h4>').appendTo($div)
    .text('Your version of Hola is not supported anymore.');
    $('<a>', {class: 'btn btn-upgrade'})
    .appendTo($div).text('Upgrade now').click(function(){
        be_popup_lib.perr_err({id: need_upgrade ? 'be_need_upgrade_click' :
            'be_need_svc_upgrade_click'});
        var zconf = window.zon_config;
        var browser = be_util.browser();
        var qs;
        if (need_upgrade)
        {
            var id = browser!='chrome' ? browser : zconf.BEXT_PLUGIN ?
                'cws_plugin' : 'cws';
            qs = 'utm_source=holaext&ref=popup&id='+id;
        }
        else
            qs = 'utm_source=holaext&ref=popup&upgrade=1';
        var url = 'https://hola.org/download?'+qs;
        be_util.open_tab({url: url});
    });
    E.$msg.append($div);
}

function is_common_inited(){
    return E.R.get('_backbone_client_started') &&
        E.be_ext.get('_backbone_client_started') &&
        E.be_info.get('_backbone_client_started') &&
        E.be_tabs.get('_backbone_client_started') &&
        E.be_premium.get('_backbone_client_started') &&
        (window.is_tpopup || E.be_dev_mode.get('_backbone_client_started'));
}

function is_vpn_inited(){
    return E.be_vpn.get('_backbone_client_started') &&
        E.be_rule.get('_backbone_client_started');
}

function inited_cb(){
    if (B.use_msg)
    {
        if (!is_common_inited())
            return;
        if (is_vpn() && !is_vpn_inited())
            return;
    }
    if (!E.R.get('inited'))
        return void E.render_init();
    if (!window.is_tpopup && E.be_vpn && B.have['tabs.disconnect'])
    {
        etask([function(){
            return E.be_vpn.ecall('tpopup_is_connected',
                [E.be_tabs.get('active.id')]);
        }, function(tpopup_type){
            if (tpopup_type && typeof tpopup_type!='string')
                B.tabs.disconnect(E.be_tabs.get('active.id'));
        }]);
    }
    E.R.off('change:inited', inited_cb);
    if (E.be_ext)
        E.be_ext.off('change:r.ext.enabled', inited_cb);
    if (is_vpn())
        E.be_rule.ecall('task_cancel_all', []);
    active_tab_fixup();
    if (E.be_vpn)
        E.be_vpn.on_init('change:status', status_cb);
    else
        status_cb();
}

E.close_popup = function(opts){
    if (window.is_tpopup)
    {
        if (!opts)
            return be_popup_lib.perr_err({id: 'be_ui_tpopup_close_no_opts'});
        return E.set_dont_show_again(opts);
    }
    if (chrome)
        return window.close();
    if (B.have['firefox.panel.close'])
        B.firefox.panel.close();
};

function active_tab_fixup(){
    if (window.is_tpopup)
        return;
    E.listenToOnce(E.be_tabs, 'change:active.id', function(){
        E.close_popup();
    });
    if (!chrome || !chrome.tabs)
        return;
    B.tabs.query({currentWindow: true, active: true}, function(tabs){
        if (tabs && tabs.length && tabs[0].id!=E.be_tabs.get('active.id'))
            window.close();
    });
}

var report_et;
function report_ext_conflict(take_scr){
    if (report_et)
        return;
    return report_et = etask([function(){
        if (!take_scr)
            return;
        B.tabs.capture_visible_tab({}, this.continue_fn());
        return this.wait(1*date.ms.SEC);
    }, function(scr){
        return be_popup_lib.perr_err({id: 'be_debug_user_ext_conflict', info: {
            screenshot: scr,
            bg_log: be_bg_main && be_bg_main.get_log(),
        }});
    }, function catch$(e){
        be_popup_lib.perr_err({id: 'be_debug_user_ext_conflict_err', info:
            {err: e}});
        return etask.sleep(0.2*date.ms.SEC);
    }, function(){
        var url = 'about.html?'+zescape.qs({
            url: E.be_tabs.get('active.url'),
            subj: 'Proxy settings conflict',
        });
        be_util.open_be_tab({url: url+'#report_issue', force_active: true});
    }, function finally$(){
        report_et = null;
    }]);
}

var perr_sent = [];
function ext_conflict_cb(){
    var $msg;
    $('#error').empty();
    if (E.err_view)
        E.err_view.remove();
    if (E.be_ext.get('ext.conflict'))
    {
        var report_btn = '<label class=checkbox><input type=checkbox checked>'+
            ' I allow sending print screen of my active tab for debug '+
            'purposes</label><button>Report a problem</button>';
        E.err_view = new be_ui_obj.err_view({title:
            T('Hola cannot work because another extension is '+
            'controlling your proxy settings.'),
            text: T('Please disable other <a>extensions</a> that you '+
            'think might control your proxy settings such as '+
            'ad-blockers, other VPN services, etc.')+report_btn});
        $msg = E.err_view.$el;
        $msg.appendTo(E.$msg);
        $msg.find('a').click(function(){
            B.tabs.create({url: 'chrome://extensions/'}); });
        $msg.find('button').click(function(){
            report_ext_conflict(
                $msg.find('input[type=checkbox]').is(':checked'));
        });
        if (perr_sent.indexOf('render_ext_conflict')<0)
        {
            be_popup_lib.perr_err({id: 'be_render_ext_conflict'});
            perr_sent.push('render_ext_conflict');
        }
    }
}

function render_opera_warning(){
    $('.r_warnings').remove();
    var $el = $('<div>', {class: 'r_warnings'}).insertBefore($('#error'));
    $('<div>', {class: 'r_ui_vpn_compat'})
    .appendTo($el).append($('<span>'+T('You need to upgrade to the latest '+
        'version of Opera to use Hola. Press <a>here</a> to upgrade.')+
        '</span>'))
    .find('a').attr('target', '_blank').attr('href',
        'http://www.opera.com/download');
}

function status_cb(){
    if (E.be_vpn && E.be_vpn.get('status')=='error')
    {
        if (E.get('tried_recover'))
            return;
        zerr('trying auto-recover');
        E.set('tried_recover', true);
        E.be_vpn.fcall('trigger', ['recover']);
        return;
    }
    if (E.be_vpn && E.be_vpn.get('status')=='busy')
        return;
    E.set('inited', true);
    zerr.notice('popup inited');
    if (E.be_vpn)
        E.be_vpn.off('change:status', status_cb);
    E.render_popup();
    if (!storage.get_int('ui_popup_inited'))
        storage.set('ui_popup_inited', 1);
    if (storage.get_int('ajax_timeout'))
        storage.clr('ajax_timeout');
    if (storage.get_int('ui_popup_init_err'))
    {
        be_popup_lib.perr_ok({id: 'be_ui_popup_recover',
            info: 'erros '+storage.get_int('ui_popup_init_err')});
        storage.clr('ui_popup_init_err');
    }
}

E.set_dont_show_again = function(opt){
    var done, done_anim;
    if (!window.is_tpopup)
        return;
    var close_tpopup = function(){
        if (E.is_watermark && !opt.type)
            E.set_tpopup_type('watermark');
        else if (E.is_mitm && !opt.type)
            E.set_tpopup_type('mitm_popup');
        else
            E.be_popup_main.close_tpopup();
    };
    return etask([function(){
        if ((E.is_watermark || E.is_mitm) && !get_tpopup_type())
        {
            var $all = $('#all');
            $all.css({height: $all.height()+'px', width: $all.width()+'px'});
            close_tpopup();
            return;
        }
        $('body').addClass('hide_anim');
        setTimeout(function(){
            done_anim = true;
            if (done)
                close_tpopup();
            else
                E.be_popup_main.hide_tpopup();
        }, 1000);
        return E.be_info.ecall('set_dont_show_again', [opt]);
    }, function finally$(){
        done = true;
        if (done_anim)
            close_tpopup();
    }]);
};

function on_body_click(e){
    if (!window.is_tpopup || e.connection_id!=get_connection_id())
        return;
    E.trigger('body_click');
    if (is_mitm_popup() || is_watermark_popup())
        return;
    E.set_dont_show_again({
        tab_id: zutil.get(window, 'hola.tpopup_opt.tab_id'),
        period: E.be_ext && E.be_ext.get('is_premium') ? 'default' : 'session',
        root_url: get_root_url(),
        type: window.hola.tpopup_opt.type,
        src: 'ext_click',
    });
}

function on_trial_end(root_url){
    if (!window.is_tpopup || root_url!=get_root_url())
        return;
    E.be_tpopup.fcall('pause_videos', [get_connection_id()]);
    E.set_tpopup_type('watermark');
}

E.set_err = function(err, _err){
    try {
        zerr('be_ui_set_err %s %s', err, _err ? _err&&_err.stack : '');
        be_popup_lib.err(err, '', _err);
    } catch(e){ console.error('set_err error %s %s', err, e.stack||e); }
    if (_err=='Error: load_new_ver') 
        location.reload();
    else
        E.render_error(err, _err);
};

E.send_fix_it_report = function(opt){
    var tab_id = get_tab_id();
    var rule = opt.rule||{};
    var user = E.be_premium.get('user');
    var config = E.be_ext.get('bext_config'), debug_domains;
    var root_url = get_root_url(), req_errors, log;
    var e = opt.event||{};
    if (opt.send_logs && be_bg_main)
    {
        req_errors = be_bg_main.fcall('get_errors', [tab_id]);
        if ((debug_domains = zutil.get(config, 'debug_logs.domains')) &&
            debug_domains.includes(root_url) ||
            E.be_ext.get('gen.dbg_log_on'))
        {
            log = be_bg_main.fcall('get_log', [zerr.log]);
        }
    }
    var info = Object.assign({
        src_country: (opt.src_country||'').toLowerCase(),
        hola_uid: user && user.hola_uid,
        url: get_url(),
        root_url: root_url,
        premium: E.be_ext.get('is_premium'),
        proxy_country: rule && rule.country && rule.country.toLowerCase(),
        log: log, tab_id: tab_id,
        screenx: e.screenX,
        screeny: e.screenY,
        event_ts: e.timeStamp,
        init_id: E.init_id,
        mitm_active: rule.is_mitm,
        req_errors: req_errors,
        src: opt.src,
    }, _.pick(rule, 'name', 'type', 'md5'));
    etask([function(){
        return be_popup_lib.perr_err({id: 'be_ui_vpn_click_no_fix_it',
            info: info});
    }, function(res){
        if (be_bg_main && res && res.bug_id)
            be_bg_main.fcall('set_bug_id', [res.bug_id]);
    }]);
};

E.send_vpn_work_report = function(opt){
    var rule = opt.rule||{};
    var user = E.be_premium.get('user');
    be_popup_lib.perr_err({id: 'be_vpn_ok', info: Object.assign({
        src_country: (opt.src_country||'').toLowerCase(),
        url: get_url(),
        root_url: get_root_url(),
        proxy_country: rule && rule.country && rule.country.toLowerCase(),
        hola_uid: user && user.hola_uid,
        mitm_active: rule.is_mitm,
        src: opt.src,
    }, _.pick(rule, 'name', 'type', 'md5'))});

};

return E;
});
})();
