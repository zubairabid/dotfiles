// LICENSE_CODE ZON
'use strict'; 
define(['jquery', 'underscore', '/bext/pub/backbone.js',
    '/util/etask.js', '/bext/pub/browser.js', '/util/zerr.js',
    '/bext/vpn/pub/ui_obj.js', '/bext/pub/popup_lib.js', '/bext/pub/util.js',
    '/bext/pub/locale.js', '/util/util.js'],
    function($, _, be_backbone, etask, B, zerr, be_ui_obj,
    be_popup_lib, be_util, T, zutil){
B.assert_popup('be_popup_main');
etask.set_zerr(zerr);
zerr.set_exception_handler('be', be_popup_lib.err);
let chrome = window.chrome;
let E = new (be_backbone.model.extend({nav: undefined,
    _defaults: function(){ this.on('destroy', ()=>E.uninit()); },
}))();
E.be_popup_lib = be_popup_lib;
E.zerr = window.hola.zerr = zerr;
let browser = be_util.browser();

function set_on(on){
    let $checkbox = $('#g_switch');
    if (on)
    {
        $checkbox.addClass('enabled');
        $checkbox.attr('title', T('Stop Hola'));
    }
    else
    {
        $checkbox.removeClass('enabled');
        $checkbox.attr('title', T('Start Hola'));
    }
}

function switch_cb(){
    let $checkbox = $('#g_switch');
    $checkbox.css('visibility', 'visible');
    set_on(E.be_bg_main.get('enabled'));
}

E.uninit_user_nav = ()=>{
    if (E.nav)
        E.nav.remove();
    E.nav = undefined;
};

function create_ui(){
    $('body').addClass(browser);
    if (window.is_tpopup)
        return $('body').addClass('tpopup');
    E.listen_to(E.be_bg_main, 'change:enabled', switch_cb);
    window.hola.t.l_ui = Date.now();
}

E.init = ()=>{
    try {
        window.popup_main = E;
        E.inited = true;
        if (E.be_bg_main)
            return;
        if (!B.inited)
            B.init();
        $(window).on('unload', ()=>E._destroy());
        if (!E.$el)
        {
            E.$el = $('<div>', {class: 'be_popup_main'});
            $('#popup').empty().append(E.$el);
        }
        if (!E.start)
        {
            E.start = new Date();
            E.resize_handler_init();
            E.render_init();
        }
        if (B.use_msg && !E.bg_main_ping)
        {
            B.backbone.client.ping('be_bg_main', 500, ret=>{
                if (!ret.error)
                    E.bg_main_ping = true;
                else
                    zerr('l.popup ping bg failed %s', zerr.json(ret));
                return E.init();
            });
            return;
        }
        E.be_bg_main = B.backbone.client.start('be_bg_main');
        zerr.notice('l.popup got bg');
        if (B.use_msg)
        {
            E.listenTo(E.be_bg_main, 'change:_backbone_client_started',
                inited_cb);
        }
        E.listen_to(E.be_bg_main, 'change:inited', inited_cb);
    } catch(e){ E.set_err('be_popup_main_init_err', e); }
};

E.uninit = ()=>{
    if (!E.inited)
        return;
    zerr.notice('l.popup uninit');
    E.resize_handler_uninit();
    if (E.be_bg_main)
        B.backbone.client.stop('be_bg_main');
    E.uninit_user_nav();
    B._destroy();
    E.off();
    E.stopListening();
    E.inited = false;
    E.set('inited', false);
};

E.set_err = (err, _err)=>{
    try {
        zerr('be_ui_set_err %s %s', err, zerr.e2s(_err));
        if (E.rmt)
            E.be_bg_main.fcall('err', [err, '', _err]);
    } catch(e){ console.error('set_err error %s %s', err, zerr.e2s(e)); }
    E.render_error(err, _err);
};

function inited_cb(){
    if (B.use_msg && !E.be_bg_main.get('_backbone_client_started'))
        return;
    if (!E.be_bg_main.get('inited'))
        return zerr.notice('l.popup_main bg_main not inited');
    E.stopListening(E.be_bg_main, 'change:_backbone_client_started',
        inited_cb);
    zerr.notice('l.popup inited');
    E.be_bg_main.fcall('reset_bg_ajax');
    create_ui();
    E.set('inited', true);
    load_local();
}

function load_local(){
    require(['/bext/vpn/pub/ui_popup_ext.js'], be_ui_popup=>
        be_ui_popup.init());
}

E.render_init = ()=>{
    E.$el.empty().append((new be_ui_obj.init_view({
        className: 'l_ui_obj_init', text: T('Starting...'), show_after: 2000,
        err: ()=>{
        if (!E.be_bg_main) 
            return;
        E.be_bg_main.fcall('err', _.toArray(arguments));
    }})).$el);
};

E.render_error = function(msg, err){
    try {
        if (!this.ui_error)
        {
            E.be_bg_main.fcall('err', ['be_popup_main_render_error', msg||'',
                err]);
            this.ui_error = new be_ui_obj.error_view({className:
                'l_ui_obj_error'});
        }
        if (!E.$el.has(this.ui_error.$el).length)
            E.$el.empty().append(this.ui_error.$el);
    } catch(e){
        console.error('render error %s', zerr.e2s(e));
        if (E.be_bg_main)
        {
            E.be_bg_main.fcall('err', ['be_popup_main_render_error_err', '',
                e]);
        }
    }
};

let resize_timer, resize_inited, mut_observer, default_timeout = 500;
let b = document.body;
let $b = $(b);
E.resize = t=>{
    if (!E.should_resize() || !resize_inited)
        return;
    let dropdown = $b.find('.r_country_list.dropdown'),
    dropdown_opened = dropdown.is('.open');
    if (dropdown_opened)
        $b.addClass('dropdown-opened');
    else
        $b.removeClass('dropdown-opened');
    let h = dropdown_opened || !chrome ? b.scrollHeight : b.clientHeight;
    let w = dropdown_opened || !chrome ? b.scrollWidth : b.clientWidth;
    clearTimeout(resize_timer);
    resize_timer = setTimeout(E.resize, t||default_timeout);
    if (E.resize.width==w && E.resize.height==h)
        return;
    E.resize.width = w;
    E.resize.height = h;
    if (window.is_tpopup)
    {
        E.resize_tpopup({width: w, height: h+4});
    }
    else
        B.firefox.panel.resize(w, h);
};

function tpopup_call(func_name, opt){
    let be_tpopup = window.ui_popup && window.ui_popup.be_tpopup;
    if (!be_tpopup)
    {
        zerr('no be_tpopup');
        return;
    }
    return be_tpopup.ecall(func_name, [zutil.get(window,
        'hola.tpopup_opt.connection_id'), opt]);
}

E.resize_tpopup = opt=>etask(function*(){
    this.finally(()=>$('body').removeClass('iframe-resizing'));
    try {
        if (opt.animate)
            $('body').addClass('iframe-resizing');
        return yield tpopup_call('resize', opt);
    } catch(e){
        console.error('resize_tpopup err %o', e);
    }
});
E.show_tpopup = ()=>tpopup_call('show');
E.hide_tpopup = ()=>tpopup_call('hide');
E.close_tpopup = ()=>tpopup_call('close');

E.resize_handler_init = ()=>{
    if (!E.should_resize() || resize_inited)
        return;
    resize_inited = true;
    E.resize();
    if (!window.MutationObserver)
        return;
    default_timeout = 1000;
    mut_observer = new window.MutationObserver(_.debounce(E.resize));
    mut_observer.observe(document.documentElement, {attributes: true,
        childList: true, characterData: true, subtree: true,
        attributeOldValue: false, characterDataOldValue: false});
};

E.resize_handler_uninit = ()=>{
    if (!resize_inited)
        return;
    resize_inited = false;
    resize_timer = clearTimeout(resize_timer);
    if (mut_observer)
        mut_observer.disconnect();
    mut_observer = null;
    E.resize.width = null;
    E.resize.height = null;
};

E.resize_handler_reinit = ()=>{
    if (resize_inited && !E.should_resize())
        return void E.resize_handler_uninit();
    if (!resize_inited && E.should_resize())
        return void E.resize_handler_init();
};

E.should_resize = ()=>{
    let tpopup_type = zutil.get(window, 'hola.tpopup_opt.type');
    return !window.chrome || window.is_tpopup && !tpopup_type;
};

return E; });
