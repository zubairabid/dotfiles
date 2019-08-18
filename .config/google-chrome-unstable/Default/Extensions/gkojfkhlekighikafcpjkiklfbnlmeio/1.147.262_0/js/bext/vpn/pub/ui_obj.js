// LICENSE_CODE ZON
'use strict'; 
define(['jquery', 'backbone', 'spin', '/bext/pub/popup_lib.js',
    '/bext/pub/locale.js', '/bext/pub/browser.js', '/util/zerr.js',
    '/util/storage.js', 'bootstrap'],
    function($, Backbone, spin, be_popup_lib, T, B, zerr, storage){
B.assert_popup('be_ui_obj');
var E = {};
var assign = Object.assign;


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
        var timeout = 20000;
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

return E; });
