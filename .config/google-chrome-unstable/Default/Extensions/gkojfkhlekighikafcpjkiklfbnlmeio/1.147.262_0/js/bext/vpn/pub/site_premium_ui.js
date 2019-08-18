// LICENSE_CODE ZON
'use strict'; 
define(['jquery', 'underscore', '/bext/pub/backbone.js', '/bext/pub/locale.js',
    '/bext/pub/browser.js', '/bext/vpn/pub/util.js', '/util/etask.js',
    '/svc/vpn/pub/util.js', '/util/date.js', '/bext/vpn/pub/util.js',
    '/bext/pub/popup_lib.js', '/util/storage.js', '/bext/vpn/pub/ui_obj.js',
    '/util/zerr.js', '/bext/vpn/pub/templates.js'],
    function($, _, be_backbone, T, B, be_util, etask, svc_util, date,
    be_vpn_util, be_popup_lib, storage_name, be_ui_obj, zerr, templates)
{
B.assert_popup('be_site_premium');
templates = templates.default;

function get_url(){
    return window.hola && window.hola.tpopup_opt &&
        window.hola.tpopup_opt.url;
}

var E = be_backbone.view.extend({
    className: 'site_premium',
    events: {
        'click .try': '_on_try',
        'click .image': '_on_try',
        'click .title': '_on_try',
        'click .subtitle': '_on_try',
    },
    initialize: function(options){
        this.options = options;
        this.$el.addClass(this._get_id());
    },
    _get_root_url: function(){
        return this.options.root_url || svc_util.get_root_url(get_url());
    },
    render: function(){
        this._perr('uuid_site_premium_view');
        $('#header').addClass('no-border');
        $(document.body).addClass('site-premium-promote');
        $('#footer').hide();
        this.$el.html(templates.site_premium({
            root_url: this._get_root_url()}));
        this._use_intro_animation();
        return be_backbone.view.prototype.render.apply(this);
    },
    _use_intro_animation: function(){
        var _this = this;
        function add_anim(){ _this.$el.addClass('intro_animation'); }
        if (window.is_tpopup)
            setTimeout(add_anim, 500);
        else
            add_anim();
    },
    _on_try: function(){
        this._perr('uuid_site_premium_subscribe');
        var _this = this;
        etask([function(){ return _this._get_try_url();
        }, function(url){
            B.tabs.update(_this.options.be_tabs.get('active.id'), {url: url,
                active: true});
            if (_this.options.on_try)
                _this.options.on_try();
        }, function catch$(err){
            return be_popup_lib.perr_err({id: 'site_premium_ui_try_err',
                info: ''+err});
        }]);
    },
    _get_try_url: function(){
        var ref = [];
        if (this.options.unsupported)
            ref.push('unsupported');
        ref.push('require_plus');
        ref.push(this._get_id());
        return be_vpn_util.plus_ref(ref.join('_'),
            {root_url: this._get_root_url()});
    },
    _perr: function(id){
        return be_popup_lib.perr_ok({id: id, info: {
            root_url: this._get_root_url(),
        }});
    },
    _get_id: function(){
        return this._get_root_url().replace(/\./g, '_');
    },
    remove: function(){
        $(document.body).removeClass('site-premium-promote');
        $('#header').removeClass('no-border');
        $('#footer').show();
        return be_backbone.view.prototype.remove.apply(this);
    },
});

return E;
});
