// LICENSE_CODE ZON
'use strict'; 
define(['underscore', '/util/etask.js', '/bext/pub/browser.js',
    '/util/zerr.js', '/bext/pub/util.js', '/util/escape.js',
    '/util/storage.js', 'conf'],
    function(_, etask, B, zerr, be_util, zescape, storage, conf){
B.assert_bg('be_lib');
var E = {};
var assign = Object.assign;

var perr_sent;
function storage_err(name, items, err){
    var msg = name+' '+zerr.json(items)+' failed '+(err && err.message)+
        ' '+(err && err.stack);
    if (!perr_sent)
    {
        perr_sent = true;
        E.err('storage_lib_err', {name: name, items: items}, err);
    }
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
        }, function catch$(e){
            storage_err('storage_'+area+'_get_catch', items, e);
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
        }, function catch$(e){
            storage_err('storage_'+area+'_set_catch', items, e);
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
            return storage.clr('perr_sample');
        storage.set_json('perr_sample', perr_sample);
    }
    else if (!(perr_sample = storage.get_json('perr_sample')))
        return;
    if (!perr_sample[id])
        return;
    if (Math.random()>=perr_sample[id])
        return true;
    opt.id = opt.id+'_sample';
    opt.info = assign(opt.info||{}, {sample: perr_sample[id]});
}

E.perr_opt = function(level, opt, new_name){
    var bg_main, ver;
    var id = opt.id, info = opt.info, bt = opt.bt, filehead = opt.filehead;
    var qs = {ext_ver: be_util.version(), product: be_util.get_product()};
    bg_main = window.be_bg_main;
    ver = be_util.version();
    opt.data = {bt: bt, info: info, filehead: filehead, ver: ver,
        build: be_util.build()};
    if (bg_main)
    {
        qs.uuid = bg_main.get('uuid');
        qs.cid = bg_main.get('svc.cid');
        qs.browser = be_util.browser();
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
    opt.bt = err ? zerr.e2s(err) : opt.bt;
    if (err && err.hola_info)
    {
        opt.bt = 'status '+err.hola_info.status+
            ' '+err.hola_info.method+' '+err.hola_info.url+
            ' text '+(''+err.hola_info.response_text).substr(0, 256)+'\n'+
            opt.bt;
    }
    if (err && !opt.info && err.etask)
        opt.err = _.omit(err, 'etask');
    return E.perr(zerr.L.ERR, opt, new_name);
};

return E; });
