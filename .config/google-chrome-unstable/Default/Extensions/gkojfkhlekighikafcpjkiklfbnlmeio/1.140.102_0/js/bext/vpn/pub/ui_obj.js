// LICENSE_CODE ZON
'use strict'; 
define(['jquery', 'backbone', 'spin', '/bext/pub/popup_lib.js',
    '/bext/pub/locale.js', '/bext/pub/browser.js', '/util/zerr.js',
    '/util/storage.js', 'bootstrap'],
    function($, Backbone, spin, be_popup_lib, T, B, zerr, storage){
B.assert_popup('be_ui_obj');
var E = {};
var chrome = window.chrome, assign = Object.assign;


E.spin_view = Backbone.View.extend({
    className: 'ui_obj_spin',
    initialize: function(options){
        options = options||{};
        var _this = this;
        var length = options.length===undefined ? 3 : options.length;
        var width = options.width===undefined ? 3 : options.width;
        var radius = options.radius===undefined ? 4 : options.radius;
        var corners = options.corners===undefined ? 1 : options.corners;
        var opts = {
            className: _this.className+'_spinner',
            lines: 8, 
            length: length, 
            width: width, 
            radius: radius, 
            corners: corners, 
            rotate: 0, 
            color: '#777', 
            speed: 2, 
            trail: 60, 
            shadow: false, 
            hwaccel: false, 
            zIndex: 2e9, 
            top: 'auto', 
            left: 'auto' 
        };
        new spin(opts).spin(_this.el);
    },
});

E.err_view = Backbone.View.extend({
    className: 'popup-error',
    initialize: function(opt){
        opt = opt||{};
        $('body').addClass('is-popup-error');
        var title = opt.title || T('Hola is not available right now, but '+
            'we are working on it.');
        var text = opt.text || '<ol class="popup-error-list">'+
                '<li class="popup-error-list-item">'+
                    '<a href="#" class="popup-error-reload">'+
                        T('Reload Hola')+
                    '</a>'+
                '</li>'+
                '<li class="popup-error-list-item">'+
                    T('Check your Internet connection')+
                '</li>'+
            '</ol>';
        this.$el.html('<h2 class="popup-title popup-error-title">'+title+
            '</h2><div class="popup-error-text">'+text+'</div>');
        this.$('.popup-error-reload').click(function(e){
            e.stopPropagation();
            e.preventDefault();
            be_popup_lib.reload_ext({info: 'error'}, true);
        });
    }
});

function $err_msg(_class){
    if (window.is_tpopup)
    {
        be_popup_lib.perr_err({id: 'be_popup_reload_ext_skip',
            filehead: zerr.log_tail(), rate_limit: {count: 10}});
        window.be_popup_main.close_tpopup();
        return;
    }
    var $div;
    $div = (new E.err_view()).$el;
    setTimeout(function(){
        if (!$div.parents('body')[0])
            return;
        var devtools_is_open = false;
        function make_ext_reload(){
            if (devtools_is_open)
            {
                console.log(
                    'Ext auto-reload suppressed because console is opened');
                return;
            }
            be_popup_lib.reload_ext({info: 'auto_reload'});
        }
        if (window.chrome && window.chrome.tabs && window.chrome.tabs.query)
        {
            window.chrome.tabs.query({url: 'chrome-devtools://*/*',
                title: '*chrome-extension*'},
                function(tabs){
                    if (tabs.length > 0)
                        devtools_is_open = true;
                    make_ext_reload();
                });
        }
        else
            make_ext_reload();
    }, 10000);
    if (B.have['runtime.request_update_check'])
    {
        B.runtime.request_update_check(function(status){
            zerr.notice('update check: '+status); });
    }
    return $div;
}

function init_err_info(){
    var s ='';
    storage.set('ui_popup_init_err',
        storage.get_int('ui_popup_init_err')+1);
    if (!storage.get_int('ui_popup_inited'))
        s += ' never';
    if (storage.get_int('ui_popup_init_err')>1)
        s += ' errors '+storage.get_int('ui_popup_init_err');
    if (storage.get_int('ajax_timeout'))
        s += ' timeout '+storage.get_int('ajax_timeout');
    return s ? 'popup'+s : '';
}

E.init_view = Backbone.View.extend({
    className: 'ui_obj_init',
    initialize: function(options){
        this.options = options;
        this.$spin = $('<span>', {style: 'position: relative; display: '
        +'inline-block; width: 20px; height: 20px; top: 13px; left: 5px;'});
        this.$msg = $('<span>').text(this.options.text||T('Initializing...'));
        this.$el.append(this.$spin, this.$msg);
        this.$spin.append((new E.spin_view()).$el);
        var timeout = 10000;
        if (1 || this.options.pure_connection)
            timeout = 20000;
        setTimeout(function(){
            if (!this.$el.parents('body')[0])
                return;
            this.$error = $err_msg(this.className);
            this.$el.append(this.$error);
            this.$spin.hide();
            this.$msg.hide();
            be_popup_lib.perr_err({id: 'be_ui_obj_init_err',
                filehead: zerr.log_tail(), info: init_err_info()});
        }.bind(this), timeout);
        if (this.options.show_after)
        {
            this.$el.hide();
            setTimeout(function(){ this.$el.fadeIn(1000); }.bind(this),
                this.options.show_after);
        }
    },
});

E.error_view = Backbone.View.extend({
    className: 'ui_obj_error',
    initialize: function(){
        this.$error = $err_msg(this.className);
        this.$el.append(this.$error);
        be_popup_lib.perr_err({id: 'be_ui_obj_error_view',
            filehead: zerr.log_tail(), info: init_err_info()});
    },
});

E.changing_view = Backbone.View.extend({
    className: 'ui_obj_busy',
    initialize: function(options){
        this.options = options;
        var $el = this.$el;
        var changing = this.options.changing || {src: '', dst: ''};
        var src = changing ? changing.src.toUpperCase() : '';
        var dst = changing ? changing.dst.toUpperCase() : '';
        var $spinner = $('<div>', {class: 'r_ui_spinner'});
        $('<div>', {class: 'r_ui_in_progress'}).appendTo($el)
        .append($spinner)
        .append($('<span>').text(src && dst ? T('changing...') :
            T('Initializing...')));
        $spinner.append((new E.spin_view()).$el);
        if (src && dst)
        {
            var rtl = T.is_rtl(), arrow = rtl ? ' &larr; ' : ' &rarr; ';
            var $countries = $('<div>', {class: 'r_ui_in_progress f32'})
            .appendTo($el)
            .append($('<span>', {class: 'flag '+src.toLowerCase()}),
                $('<span>').text(' '+T(src)),
                $('<span>', {class: 'arrow'}).html(arrow),
                $('<span>', {class: 'flag '+dst.toLowerCase()}),
                $('<span>').text(' '+T(dst)));
            if (rtl)
                $countries.addClass('rtl');
        }
        if (this.options.reload)
        {
            this.timer = setTimeout(function(){
                var $reload = $('<div>', {class: 'r_ui_obj_reload'})
                .text(T('Reload'))
                .click(function(e){ be_popup_lib.reload_ext({
                    info: 'changing'}, true); });
                $el.append($reload);
            }, this.options.reload);
        }
    },
});

E.error_message = Backbone.View.extend({
    className: 'ui_obj_error_message',
    set_msg: function($msg){
        this.$el.empty().append($msg);
        return this;
    },
});

E.tooltip = Backbone.View.extend({
    className: 'ui_obj_tooltip',
    initialize: function(options){
        var opt = this.options = options||{};
        this.hide();
        this.delay = opt.delay||250;
        this.$el.click(function(e){ e.stopPropagation(); });
        if (opt.$parent)
            this.append_to(opt.$parent);
        if (opt.$content)
            this.$el.append(opt.$content);
    },
    append_to: function($parent){
        $parent.append(this.$el);
        $parent.mouseenter(function(){ this.mouseenter(); }.bind(this))
        .mouseleave(function(){ this.mouseleave(); }.bind(this));
    },
    mouseenter: function(){
        clearTimeout(this.timer);
        this.timer = setTimeout(function(){ this.show(); }.bind(this),
            this.delay);
    },
    mouseleave: function(){
        clearTimeout(this.timer);
        this.timer = setTimeout(function(){ this.hide(); }.bind(this));
    },
    hide: function(){
        this.timer = clearTimeout(this.timer);
        this.trigger('hide');
        this.$el.hide(); },
    show: function(){
        this.timer = clearTimeout(this.timer);
        this.trigger('show');
        this.$el.show();
    },
});

E.select = Backbone.View.extend({
    className: 'ui_obj_select',
    initialize: function(options){
        this.options = options;
        var $el = this.$el;
        var lr = this.options.local_css ? 'l_' : 'r_';
        $el.addClass('btn-group '+lr+'btn-group');
        if (this.options.dropup)
            $el.addClass('dropup');
        this.$btn = $('<div>', {class: 'btn '+lr+'btn-trans dropdown-toggle',
            'data-toggle': 'dropdown'}).appendTo($el);
        this.$val = $('<span>').appendTo(this.$btn);
        $('<span>', {class: 'caret'}).appendTo(this.$btn);
        this.$ul = $('<ul>', {class: 'dropdown-menu'}).appendTo($el);
        if (this.options.pull_right)
            this.$ul.addClass('pull-right');
        if (!chrome) 
            $el.click(function(){ window.popup_main.resize(100); });
    },
    add_item: function($item, val){
        $('<li>').appendTo(this.$ul).append($item).prop('val', val)
        .click(function(){
            this.curr_val = val;
            this.redraw();
            this.trigger('select:change', val);
        }.bind(this));
    },
    redraw: function(){
        var $items = this.$ul.children('li');
        for (var i=0; i<$items.length; i++)
        {
            var $i = $($items[i]);
            if ($i.prop('val')!=this.curr_val)
                continue;
            this.set_label($i.children().clone());
            break;
        }
    },
    set_label: function($l){ this.$val.empty().append($l); },
    val: function(val){
        if (val===undefined)
            return this.curr_val;
        this.curr_val = val;
        this.redraw();
    },
});

E.modal_select = Backbone.View.extend({
    className: 'ui_obj_modal_select dropdown',
    template: '\
<button class="dropdown-toggle lang_dropdown_toggle" data-toggle="dropdown" style="display: none;"></button>\
<ul class="dropdown-menu l_lang_dropdown_menu" role="menu" aria-labelledby="dLabel"></ul>',
    initialize: function(options){
        this.$el.html(this.template);
        this.$ul = this.$('.dropdown-menu');
        this.options = options;
        this.items = [];
    },
    add_item: function(label, val){
        this.items.push([label, val]); },
    redraw: function(){
        var ul_html = '';
        for (var i=0; i<this.items.length; i++)
        {
            var label = this.items[i][0], val = this.items[i][1];
            var cls = this.curr_val==val ? 'class="selected"' : '';
            ul_html += '<li data-val="'+val+'" '+cls+'><a>'+label+'</a></li>';
            if (this.curr_val==val)
                this.set_label(label);
        }
        this.$ul.html(ul_html).off().on('click', 'li', function(event){
            var val = $(event.currentTarget).data('val');
            this.curr_val = val;
            this.redraw();
            this.trigger('select:change', val);
        }.bind(this));
    },
    set_label: function(text){
        var code = '';
        text = text.split(' ');
        if (text[0].length<7)
            code = text.shift();
        text = text.join(' ');
        var $code = '<span class="lang_dropdown_code">'+code+'</span>';
        this.options.label.empty().append(text, $code);
    },
    val: function(val){
        if (val===undefined)
            return this.curr_val;
        this.curr_val = val;
        this.redraw();
    },
});

E.lang_list = Backbone.View.extend({
    className: 'l_ui_obj_lang_list',
    initialize: function(options){
        var $el = this.$el, _this = this;
        if (T.locales.length==1)
            return;
        var select = new E.modal_select(assign({local_css: true}, options));
        this.select = select;
        this.$dropdown = select.$el.find('.lang_dropdown_toggle');
        select.$el.appendTo($el);
        select.val(T.locale);
        select.on('select:change', function(){
            this.lang_timer = clearTimeout(this.lang_timer);
            if (select.val()==T.locale)
                return;
            if (select.val()=='more')
            {
                select.val(T.locale);
                B.tabs.create({url: 'https://hola.org/translate'
                    +'?utm_source=holaext#more'});
                return;
            }
            var new_locale = select.val();
            be_popup_lib.perr_ok({id: 'be_popup_lang', info: new_locale,
                rate_limit: {count: 20}});
            this.lang_timer = setTimeout(function(){
                storage.set('locale', new_locale);
                location.reload();
            }, 50);
        }.bind(this));
        function render_country_list(){ _this.render_list(); }
        var dropdown_menu = this.$dropdown.find('.dropdown-menu');
        dropdown_menu.one('show.bs.dropdown', function(){
            render_country_list(); });
        setTimeout(function(){
            render_country_list(); }, 500);
    },
    toggle: function(){ this.$dropdown.dropdown('toggle'); },
    render_list: function(){
        if (this.rendered)
            return;
        this.rendered = true;
        var select = this.select;
        select.add_item(T('locale_en_en'), 'en');
        for (var i=0; i<T.locales.length; i++)
        {
            var l = T.locales[i];
            select.add_item(T('locale_en_'+l), l);
        }
        select.add_item(T('More...', null, 'en'), 'more');
        select.redraw();
    }
});

E.lock_glyph = Backbone.View.extend({
    tagName: 'span',
    className: 'ui_sitepic_lock',
    initialize: function(options){
        if (options && options.visible)
            this.$el.addClass('ui_sitepic_lock_visible');
        this.render();
    },
    render: function(){
        $('<span>', {'class': 'ui_sitepic_lock_body'}).appendTo(this.$el);
        $('<span>', {'class': 'ui_sitepic_lock_arm'}).appendTo(this.$el);
    }
});

var animation_time = 300;
E.close_button = Backbone.View.extend({
    class_name: 'close_button',
    template: '<div id=tpopup_close class="popup-header-controls-button '+
        'popup-header-close"></div><div id=tpopup_close_hint '+
        'class="popup-hint popup-header-close-hint"></div>',
    events: {
        'click .popup-header-close': '_on_click',
        'click .dont_show_for_root_url': '_dont_show_for_root_url',
        'click .dont_show_for_all': '_dont_show_for_all',
        'mouseenter': '_mouseenter',
        'mouseleave': '_mouseleave',
        'mouseenter #tpopup_close_hint': '_hint_mouseenter',
        'mouseleave #tpopup_close_hint': '_hint_mouseleave',
    },
    initialize: function(options){
        this.options = options||{};
    },
    render: function(){
        this.$el.html(this.template);
        this.$hint = this.$el.find('#tpopup_close_hint');
        this.$hint.empty();
        $('<div>', {class: 'hint_close_ghost'}).appendTo(this.$hint);
        $('<div>', {class: 'hint_dont_show'})
        .text(T('Don\'t show again')).appendTo(this.$hint);
        $('<div>', {class: 'hint_option dont_show_for_root_url'})
        .html(T('for <b>$1</b> for one week', [this.options.root_url]))
        .appendTo(this.$hint);
        $('<div>', {class: 'hint_option dont_show_for_all'})
        .html(T('for <b>any site</b> for one week')).appendTo(this.$hint);
        return this;
    },
    _on_click: function(e){
        e.stopPropagation();
        this.options.close({root_url: this.options.root_url, period: 'session',
            src: 'x_btn', type: window.hola.tpopup_opt.type,
            tab_id: window.hola.tpopup_opt.tab_id});
    },
    _dont_show_for_root_url: function(e){
        e.stopPropagation();
        this.options.close({root_url: this.options.root_url, period: 'default',
            src: 'x_tooltip', type: window.hola.tpopup_opt.type});
    },
    _dont_show_for_all: function(e){
        e.stopPropagation();
        this.options.close({root_url: 'all', period: 'default',
            src: 'x_tooltip', type: window.hola.tpopup_opt.type});
    },
    _mouseenter: function(){
        this.$hint.fadeIn();
    },
    _mouseleave: function(){
        var _this = this;
        this.timer = setTimeout(function(){ _this.$hint.fadeOut(); },
            animation_time);
    },
    _hint_mouseenter: function(){
        this.timer = clearTimeout(this.timer);
        this.$hint.fadeIn();
    },
    _hint_mouseleave: function(){
        var _this = this;
        this.timer = setTimeout(function(){ _this.$hint.fadeOut(); },
            animation_time);
    },
});

return E; });
