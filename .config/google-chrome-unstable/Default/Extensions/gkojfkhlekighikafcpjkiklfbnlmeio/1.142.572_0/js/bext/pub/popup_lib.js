// LICENSE_CODE ZON
'use strict'; 
define(['conf', 'underscore', '/util/etask.js', '/bext/pub/browser.js',
    '/util/zerr.js', '/bext/pub/util.js', '/util/storage.js', '/util/date.js'],
    function(conf, _, etask, B, zerr, be_util, storage, date){
B.assert_popup('be_popup_lib');
var E = {};
function get_perr_browser(){
    var bg_main = window.popup_main ? window.popup_main.be_bg_main : null;
    return bg_main && bg_main.get('browser');
}

E.get_uuid = function(){
    var bg_main = window.popup_main ? window.popup_main.be_bg_main : null;
    if (bg_main)
        return bg_main.get('uuid');
    return storage.get('uuid');
};

E.perr = function(level, opt, new_name){
    new_name = !!new_name;
    var ui_popup = window.ui_popup;
    var bg_main, ver;
    var id = opt.id, info = opt.info, bt = opt.bt, filehead = opt.filehead;
    var qs = {ext_ver: be_util.version(), product: be_util.get_product()};
    var R = ui_popup && ui_popup.R;
    bg_main = window.popup_main ? window.popup_main.be_bg_main : null;
    ver = be_util.version();
    opt.data = {bt: bt, info: info, filehead: filehead, ver: ver,
	build: be_util.build()};
    if (R)
        qs.rmt_ver = R.get('ver');
    if (bg_main)
    {
        qs.uuid = bg_main.get('uuid');
        qs.cid = bg_main.get('svc.cid');
        qs.browser = get_perr_browser();
        qs.session_key = bg_main.get('session_key');
    }
    else
        zerr('cannot get information for perr %s %s', id, info);
    if (conf.check_agree_ts && !(bg_main && bg_main.get('agree_ts')))
    {
        zerr('user forbade sending privacy data for perr %s %s', id, info);
        return;
    }
    if (!qs.uuid)
        qs.uuid = storage.get('uuid');
    if (!qs.browser)
        qs.browser = be_util.browser();
    qs.id = be_util.perr_id(id, new_name);
    opt.qs = qs;
    opt.level = level;
    return zerr.perr(qs.id, info, opt);
};

E.ok = function(id, info){ return E.perr_ok({id: id, info: info}); };
E.perr_ok = function(opt, new_name){
    return E.perr(zerr.L.NOTICE, opt, new_name); };
E.err = function(id, info, err){
    return E.perr_err({id: id, info: info, err: err}); };
E.perr_err = function(opt, new_name){
    var err = opt.err;
    if ((err&&err.message)=='load_new_ver')
	return zerr.notice('drop perr %s %s', opt.id, zerr.json(opt.info));
    opt.bt = err ? zerr.e2s(err) : opt.bt;
    opt.filehead = opt.filehead;
    return E.perr(zerr.L.ERR, opt, new_name);
};

E.serr = function(with_log){
    return be_util.serr({with_log: with_log,
        rmt: window.ui_popup ? window.ui_popup.R : null,
        bg_main: window.popup_main ? window.popup_main.be_bg_main : null});
};

E.reload_ext = function(opt, force){
    if (be_util.reload_ext(function(){ setTimeout(function(){
        E.reload_ext.force(); }, 500); }, force ? 100 : date.ms.DAY))
    {
        E.perr_err({id: 'be_popup_reload_ext', rate_limit: {count: 20},
           info: (window.require_is_remote ? 'r.' : 'l.')+opt.info,
           err: new Error('')});
    }
};

E.reload_ext.force = function(){
    try { zerr.notice('going for full reload'); } catch(e){}
    B.be.reload_ext();
};

return E; });
