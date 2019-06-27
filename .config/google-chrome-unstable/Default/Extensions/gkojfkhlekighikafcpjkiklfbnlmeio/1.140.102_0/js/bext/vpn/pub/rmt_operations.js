// LICENSE_CODE ZON
'use strict'; 
define(['/bext/pub/backbone.js', 'underscore', '/util/zerr.js',
    '/bext/pub/version_util.js', '/util/date.js', '/bext/pub/browser.js',
    '/util/storage.js', '/bext/vpn/pub/features.js', '/bext/pub/ext.js',
    '/util/ajax.js', '/bext/pub/lib.js', '/bext/pub/util.js'],
    function(be_backbone, _, zerr, be_version_util, date, B, storage,
    be_features, be_ext, ajax, be_lib, be_util){
var E = new (be_backbone.task_model.extend({
    _defaults: function(){
        this.on('destroy', function(){
            B.backbone.server.stop('be_rmt_operations'); });
        B.backbone.server.start(this, 'be_rmt_operations');
    },
}))();
var chrome = window.chrome;

E.do_op = function(o){
    if (!o || !o.op)
        return;
    switch (o.op)
    {
    case 'load_new_rmt': do_op_load_new_rmt(o); break;
    case 'reload_rmt': do_op_reload_rmt(o); break;
    case 'reload_ext': do_op_reload_ext(o); break;
    case 'upgrade_ext':
        zerr.notice('do_op_upgrade_ext '+zerr.json(o));
        be_util.upgrade_ext();
        break;
    case 'disable_plugin_once': do_op_disable_plugin_once(o); break;
    default: zerr('unknown op '+zerr.json(o));
    }
};

function do_op_reload_rmt(o){
    zerr.notice('do_op_reload_rmt '+zerr.json(o));
    if (window.RMT)
        window.RMT.load_new_ver(o.ver);
    else if (window.ui_popup && window.ui_popup.R)
        window.ui_popup.R.fcall('load_new_ver', [o.ver]);
    else
        do_op_reload_ext(o);
}

function do_op_reload_ext(o){
    zerr.notice('do_op_reload_ext '+zerr.json(o));
    B.be.reload_ext();
}

var do_op_load_new_rmt = _.throttle(function(o){
    zerr.notice('do_op_load_new_rmt '+zerr.json(o));
    if (window.RMT)
        return void window.RMT.check_ver();
    if (window.ui_popup && window.ui_popup.R)
        return void window.ui_popup.R.fcall('check_ver', []);
    if (be_version_util.cmp(E.version(), '1.2.29')<0)
        return void be_util.upgrade_ext();
    if (window.be_bg_main)
        return void window.be_bg_main.load_rmt();
    if (window.popup_main && window.popup_main.be_bg_main)
        return void window.popup_main.be_bg_main.fcall('load_rmt', []);
}, 10*date.ms.MIN);

function do_op_disable_plugin_once(o){
    if (!chrome || !E.is_plugin())
        return;
    zerr.notice('do_op_disable_plugin_once '+zerr.json(o));
    storage.set('set_tmp_not_plugin', 1);
    setTimeout(function(){ B.be.reload_ext(); });
}

E.init = function(){ ajax.do_op = E.do_op; };

return E; });
