// LICENSE_CODE ZON
'use strict'; 
define(['underscore', '/util/etask.js', '/bext/pub/browser.js',
    '/util/zerr.js', '/bext/pub/util.js', '/util/escape.js'],
    function(_, etask, B, zerr, be_util, zescape){
B.assert_bg('be_lib');
var E = {};
var assign = Object.assign;
var conf = window.conf;

function storage_err(name, items, err){
    var msg = name+' '+zerr.json(items)+' failed '+(err && err.message);
    zerr(msg);
    throw new Error(msg);
}

function storage_get_fn(area){
    return function(items){
        return etask([function(){
            return etask.cb_apply(B.storage[area], '.get', [items]);
        }, function(items){
            var e = B.runtime.last_error;
            if (e || !items)
                storage_err('storage_'+area+'_get', items, e);
            return items;
        }]);
    };
}

function storage_set_fn(area){
    return function(items){
        return etask([function(){
            return etask.cb_apply(B.storage[area], '.set', [items]);
        }, function(){
            var e = B.runtime.last_error;
            if (e)
                storage_err('storage_'+area+'_set', items, e);
            return items;
        }]);
    };
}

function storage_remove_fn(area){
    return function(items){
        return etask([function(){
            return etask.cb_apply(B.storage[area], '.remove', [items]);
        }, function(){
            var e = B.runtime.last_error;
            if (e)
                storage_err('storage_'+area+'_remove', items, e);
        }]);
    };
}

E.storage_local_get = storage_get_fn('local');
E.storage_local_set = storage_set_fn('local');
E.storage_local_remove = storage_remove_fn('local');
E.storage_sync_get = storage_get_fn('sync');
E.storage_sync_set = storage_set_fn('sync');
E.storage_sync_remove = storage_remove_fn('sync');

E.reload_ext = function(opt){
    zerr.notice('reload_ext '+zerr.json(opt));
    if (opt && opt.force)
        return E.reload_ext.force();
    return be_util.reload_ext(E.reload_ext.force);
};

E.reload_ext.force = function(){
    try { zerr.notice('going for full reload'); } catch(e){}
    B.be.reload_ext();
};

function drop_perr(opt, new_name){
    var be_ext, bext_config, perr_sample, bg_main = window.be_bg_main;
    var id = be_util.perr_id(opt.id, new_name);
    if (conf.check_agree_ts && !(bg_main && bg_main.get('agree_ts')))
    {
        zerr('user forbade sending privacy data for perr %s', id);
        return true;
    }
    if ((be_ext = window.RMT&&window.RMT.be_ext) &&
        (bext_config = be_ext.get('bext_config')))
    {
        if (!(perr_sample = bext_config.perr_sample))
            return void localStorage.removeItem('perr_sample');
        localStorage.setItem('perr_sample', JSON.stringify(perr_sample));
    }
    else if (!(perr_sample = JSON.parse(localStorage.getItem('perr_sample'))))
        return;
    if (!perr_sample[id])
        return;
    if (Math.random()>=perr_sample[id])
        return true;
    opt.id = opt.id+'_sample';
    opt.info = assign(opt.info||{}, {sample: perr_sample[id]});
}
E.get_flags = function(){
    var bg_main = window.be_bg_main;
    if (bg_main && bg_main.get_flags)
        return bg_main.get_flags();
    if (window.util && window.util.get_flags)
        return window.util.get_flags();
    return 0;
};
function get_perr_browser(){
    var bg_main = window.be_bg_main;
    return bg_main && bg_main.get('browser');
}
E.perr_opt = function(level, opt, new_name){
    var RMT, bg_main, ver;
    var id = opt.id, info = opt.info, bt = opt.bt, filehead = opt.filehead;
    var flags = E.get_flags();
    var qs = {ext_ver: be_util.version(), product: be_util.get_product()};
    RMT = window.RMT;
    bg_main = window.be_bg_main;
    ver = be_util.version();
    opt.data = {bt: bt, info: info, filehead: filehead, ver: ver, flags: flags,
        build: be_util.build()};
    if (RMT)
        qs.rmt_ver = RMT.get('ver');
    if (bg_main)
    {
        qs.uuid = bg_main.get('uuid');
        qs.cid = bg_main.get('svc.cid');
        qs.browser = get_perr_browser();
        qs.session_key = bg_main.get('session_key');
    }
    else
        zerr('cannot get information for perr %s %s', id, info);
    qs.id = be_util.perr_id(id, new_name);
    opt.qs = qs;
    opt.level = level;
    return {id: qs.id, info: info, opt: opt};
};
E.perr = function(level, opt, new_name){
    if (drop_perr(opt, new_name))
        return;
    var perr_opt = E.perr_opt(level, opt, new_name);
    return zerr.perr(perr_opt.id, perr_opt.info, perr_opt.opt);
};

E.ok = function(id, info){ return E.perr_ok({id: id, info: info}); };
E.perr_ok = function(opt, new_name){
    return E.perr(zerr.L.NOTICE, opt, new_name); };
E.stats = function(id, info){ return E.perr(zerr.L.NOTICE,
    {id: id, info: info, rate_limit: {count: 20}}); };
E.err = function(id, info, err){
    return E.perr_err({id: id, info: info, err: err}); };
E.perr_err = function(opt, new_name){
    var err = opt.err;
    if ((err&&err.message)=='load_new_ver')
        return zerr.notice('drop perr %s %s', opt.id, zerr.json(opt.info));
    opt.bt = err ? zerr.e2s(err) : opt.bt;
    if (err && !opt.info && err.etask)
        opt.err = _.omit(err, 'etask');
    return E.perr(zerr.L.ERR, opt, new_name);
};

E.serr = function(with_log){
    return be_util.serr({with_log: with_log, rmt: window.RMT,
        bg_main: window.be_bg_main, be_local: window.be_local});
};

return E; });
