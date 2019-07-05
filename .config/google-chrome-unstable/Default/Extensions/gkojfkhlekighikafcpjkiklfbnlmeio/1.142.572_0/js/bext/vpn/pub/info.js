// LICENSE_CODE ZON
'use strict'; 
define(['jquery', 'underscore', 'backbone', '/bext/pub/backbone.js',
    '/util/etask.js', '/bext/pub/ext.js', '/bext/pub/util.js', '/util/util.js',
    '/util/zerr.js', '/bext/vpn/pub/rule.js', '/bext/pub/browser.js',
    '/bext/pub/lib.js', '/util/date.js',
    '/util/storage.js', '/bext/vpn/pub/features.js', '/bext/vpn/pub/svc.js',
    '/bext/vpn/pub/mode.js', '/svc/hola/pub/svc_ipc.js', '/util/url.js',
    '/bext/pub/version_util.js'],
    function($, _, Backbone, be_backbone, etask, be_ext, be_util, zutil, zerr,
    be_rule, B, be_lib, date, storage, be_features, be_svc, be_mode,
    svc_ipc, zurl, be_version_util){
B.assert_bg('be_info');
var conf = window.conf;
var E = new (be_backbone.task_model.extend({
    _defaults: function(){
        this.on('destroy', function(){
            B.backbone.server.stop('be_info');
            uninit();
        });
        B.backbone.server.start(this, 'be_info');
    },
}))();

E.init = function(rmt, be_bg_ajax){
    if (E.get('inited'))
        return;
    E.rmt = rmt;
    E.be_bg_ajax = be_bg_ajax;
    E.set('inited', true);
    E.set('vpn_work_yes', storage.get_int('vpn_work_yes'));
    E.set('vpn_last_rating', storage.get_int('vpn_last_rating'));
    E.set('rate_on_store', storage.get_int('rate_on_store'));
    E.sp = etask('be_info', [function(){ return this.wait(); }]);
    E.on('recover', E.fetch_info);
    E.on('change:location', _.debounce(function(){
        var location = E.get('location');
        E.set('country', location ? location.country : null);
        storage.set('src_country', E.get('country'));
    }));
    be_ext.on_init('change:r.vpn.on change:uuid', E.fetch_info);
    be_ext.on_init('change:session_key', E.set_cid);
    be_mode.on_init('change:svc.cid', E.set_cid);
    be_ext.on_init('change:session_key', E.set_sync_uuid);
    be_ext.on_init('change:user_id', E.set_user_id);
    E.set('settings', storage.get_json('settings')||{});
    E.trigger('inited');
};

function uninit(){
    if (!E.get('inited'))
        return;
    E.sp.return();
    be_ext.off('change:r.vpn.on change:uuid', E.fetch_info);
    be_mode.off('change:svc.cid', E.set_cid);
    be_ext.off('change:session_key', E.set_cid);
    be_ext.off('change:session_key', E.set_sync_uuid);
    be_ext.off('change:user_id', E.set_user_id);
}

function set_settings(settings){
    settings = settings||{};
    storage.set_json('settings', settings);
    E.set('settings', settings);
}

E.epopup_new = function(root_url){
    return etask([function(){ zerr.notice('epopup_new');
    }, function(){
        var src_country_fake = storage.get('src_country_fake');
        return E.be_bg_ajax.ccgi_ajax({url: conf.url_ccgi+'/popup_new.json',
            qs: be_ext.auth(), data: {src_country_fake: src_country_fake,
            root_url: root_url}, slow: 500});
    }, function(info){
        E.set('location', info.req);
        storage.set_json('location', info.req);
        return info;
    }, function catch$(err){
        be_lib.err('be_info_epopup_new_err', '', err);
        throw err;
    }]);
};

E.get_unblocking_rate_url = function(limit, country){
    country = (country||'').toLowerCase();
    var url = conf.url_ccgi+'/unblocking_rate';
    return zurl.qs_add(url, {src_country: country, limit: limit});
};

E.get_unblocking_rate = function(limit, country){
    country = (country||E.get('country')||'').toLowerCase();
    if (!country)
        return;
    var n = 0;
    return etask({name: 'get_unblocker_rate', cancel: true}, [function start(){
        n++;
    }, function try_catch$(){
        return E.be_bg_ajax.ccgi_ajax({url: conf.url_ccgi+'/unblocking_rate',
            data: be_ext.qs_ajax({src_country: country, limit: limit})});
    }, function(e){
        if (this.error)
        {
            if (n>1)
                throw this.error;
            return this.goto('start');
        }
        if (be_features.have(be_ext, 'rule_rating_control'))
            be_lib.perr_err({id: 'be_unblocking_rate_ok', info: {n: n}});
        return e;
    }, function catch$(err){
        be_lib.perr_err({id: 'be_unblocking_rate_err', err: err});
    }]);
};

E.efetch_info = function(){
    var local_settings = !!storage.get_json('settings') ||
        be_version_util.cmp(storage.get('install_version'), '1.128.350')>0;
    return etask({name: 'efetch_info', cancel: true}, [function(){
        zerr.notice('be_info: fetch_info');
    }, function(){ 
        var src_country_fake = storage.get('src_country_fake')||'';
        return E.be_bg_ajax.ccgi_ajax({url: conf.url_ccgi+'/fetch_info',
            qs: be_ext.auth(), retry: 1, data: {src_country_fake:
            src_country_fake, settings: !local_settings}});
    }, function(info){
        if (!window.is_local_ccgi && info.ver!=E.rmt.ver)
        {
            E.rmt.load_new_ver(info.ver);
            throw new Error('load_new_ver');
        }
        E.set('location', info.req);
        storage.set_json('location', info.req);
        if (!local_settings)
            set_settings(info.settings);
    }, function catch$(err){
        be_lib.err('be_info_fetch_info_err', '', err);
        throw err;
    }]);
};
E.fetch_info = function(){ E.trigger('fetch_info'); };
E.on('fetch_info', function(){
    if (!E.set_busy({desc: 'Configuring...'}))
        return E.schedule_clr(['fetch_info']);
    return E.sp.spawn(etask({name: 'fetch_info', cancel: true}, [function(){
        return E.efetch_info();
    }, function(){ E.clr_busy();
    }, function catch$(err){
        E.set_err();
        be_lib.err('be_info_on_fetch_info_err', '', err);
    }]));
});

var cids = [];
if (window.hola)
    cids = window.hola.cids||(window.hola.cids = []);
E.set_cid = function(){ E.trigger('set_cid'); };
E.on('set_cid', function(){
    return E.sp.spawn(etask({name: 'set_cid'}, [function(){
        var cid = +be_mode.get('svc.cid')||0, key = be_ext.get('session_key'),
            uuid = be_ext.get('uuid');
        if (!key || !(cid>0) || _.contains(cids, cid))
            return this.return();
        cids.push(cid);
        return E.be_bg_ajax.ccgi_ajax({timeout: 20000, method: 'POST',
            data: {session_key: key}, url: conf.url_ccgi+'/set_cid',
            qs: {uuid: uuid, browser: be_ext.get('browser'), cid: cid,
            ver: be_util.version()}});
    }, function catch$(err){ be_lib.err('be_info_set_cid_err', '', err); }]));
});

E.set_sync_uuid = function(){
    var key = be_ext.get('session_key'), uuid = be_ext.get('uuid');
    if (!key)
        return;
    E.sp.spawn(etask({name: 'set_sync_uuid'}, [function(){
        if (!B.have['storage.sync'])
            return be_lib.storage_local_get('uuid');
        return be_lib.storage_sync_get('uuid');
    }, function(ret){
        var sync_uuid = ret && ret.uuid;
        if (!sync_uuid || sync_uuid==uuid)
            return;
        E.be_bg_ajax.ccgi_ajax({timeout: 20000, data: {session_key: key},
            method: 'POST', url: conf.url_ccgi+'/set_sync_uuid',
            qs: {uuid: uuid, browser: be_ext.get('browser'),
            ver: be_util.version(), sync_uuid: sync_uuid}});
    }]));
};

E.set_user_id = function(){ E.trigger('set_user_id'); };
E.on('set_user_id', function(){
    var user_id = be_ext.get('user_id'), is_premium = be_ext.get('is_premium');
    if (user_id===undefined)
        return;
    return etask('set_user_id', [function(){
        return be_svc.update_info();
    }, function(){
        if (!be_svc.get('info'))
            return {missing_svc: true};
        return etask.all({token: get_user_sync_token()});
    }, function(sync_data){
        var sync_token = sync_data.token;
        var missing_svc = sync_data.missing_svc;
        return etask.all({allow_fail: true}, {
            client: user_id && E.be_bg_ajax.ccgi_ajax({qs: be_ext.auth(),
                method: 'POST', url: conf.url_ccgi+'/set_user_client.json',
                data: {user_id: user_id}}),
            svc: !missing_svc &&
                svc_ipc.ajax({cmd: 'user_token_update.json?token='+user_id+
                (is_premium ? '&premium' : '')+
                (sync_token ? '&sync='+sync_token : '')}),
        });
    }, function(){
        if (user_id)
            E.trigger('user_id_set');
    },
    function catch$(err){ be_lib.err('be_info_set_user_id_err', '', err);
    }]);
});

function fix_dont_show(data, root_url){
    var val = data[root_url];
    if (val && val.period)
    {
        data[root_url] = {};
        data[root_url][val.type||'default'] = val;
        delete val.type;
    }
}

E.set_dont_show_again = function(opt){
    opt = zutil.clone(opt);
    var root_url = opt.root_url;
    if (!root_url)
        return;
    var type = opt.type || 'default';
    if (opt.period=='session')
    {
        var tabs = E.get('dont_show_tabs')||{};
        var tab = tabs[''+opt.tab_id] = tabs[''+opt.tab_id]||{};
        tab[type] = tab[type] || {};
        tab[type].n = (tab[type].n||0)+1;
        E.set('dont_show_tabs', tabs);
        return;
    }
    var settings = E.get('settings')||{};
    var data = settings.dont_show = settings.dont_show||{};
    fix_dont_show(data, root_url);
    if (opt.unset)
    {
        if (data[root_url])
            delete data[root_url][type];
    }
    else
    {
        data[root_url] = data[root_url]||{};
        data[root_url][type] = {ts_user: date.to_sql(new Date()),
            period: opt.period, src: opt.src};
    }
    set_settings(settings);
    E.trigger('change:settings');
    be_lib.perr_ok({id: 'be_set_dont_show_again', info: opt});
};

function _is_dont_show(val, type){
    if (val && !val.period)
        val = val[type];
    if (!val)
        return false;
    if (val.period=='never')
        return true;
    var dur = val.period=='default' ? date.ms.WEEK :
        date.str_to_dur(val.period);
    if (dur)
        return new Date()-date.from_sql(val.ts_user)<dur;
    return false;
}

E.is_dont_show = function(tab_id, root_url, type){
    type = type || 'default';
    var dont_show_tabs = E.get('dont_show_tabs')||{};
    var tab_data = dont_show_tabs[tab_id]||{};
    if (tab_data[type] && tab_data[type].n>2)
        return true;
    var settings = E.get('settings');
    var data = settings && settings.dont_show;
    return !!data && (_is_dont_show(data.all, type) ||
        _is_dont_show(data[root_url], type));
};

E.get_dont_show_rules = function(type){
    var res = [];
    type = type || 'default';
    var settings = E.get('settings');
    var data = settings && settings.dont_show || {};
    Object.keys(data).forEach(function(url){
        if (_is_dont_show(data[url], type))
            res.push(url);
    });
    return res;
};

E.get_site_storage = function(root_url, path, def){
    var key = be_util.get_site_key(be_ext, root_url) || root_url;
    var data = storage.get_json('site_storage')||{};
    return zutil.get(data[key], path, def);
};

E.set_site_storage = function(root_url, path, val){
    var key = be_util.get_site_key(be_ext, root_url) || root_url;
    var data = storage.get_json('site_storage')||{};
    data[key] = data[key]||{};
    zutil.set(data[key], path, val);
    storage.set_json('site_storage', data);
};

E.set_force_tpopup = function(root_url, type){
    var force = E.get('force_tpopup')||storage.get_json('force_tpopup')||{};
    force[root_url] = {ts: date.to_sql(new Date()), type: type};
    E.set('force_tpopup', force);
    storage.set_json('force_tpopup', force);
};

E.unset_force_tpopup = function(root_url){
    var force = E.get('force_tpopup')||storage.get_json('force_tpopup')||{};
    delete force[root_url];
    E.set('force_tpopup', force);
    storage.set_json('force_tpopup', force);
};

E.is_force_tpopup = function(root_url){
    var force = E.get('force_tpopup')||storage.get_json('force_tpopup')||{};
    if (!force||!force[root_url])
        return false;
    var _ts = force[root_url].ts;
    var type = force[root_url].type;
    if (!_ts)
        return false;
    var ts = date.from_sql(_ts);
    if (Date.now()-ts > 30*date.ms.MIN)
        return false;
    return type || true;
};

E.increment_vpn_work_yes = function(){
    var counter = E.get('vpn_work_yes') + 1;
    storage.set('vpn_work_yes', counter);
    E.set('vpn_work_yes', counter);
};

E.set_vpn_last_rating = function(rating){
    storage.set('vpn_last_rating', rating);
    E.set('vpn_last_rating', rating);
};

E.set_rate_on_store = function(ts){
    storage.set('rate_on_store', ts);
    E.set('rate_on_store', ts);
};

E.get_unblock_url = function(domain, country, opt){
    opt = opt||{};
    country = country.toLowerCase();
    return 'https://hola.org/unblock/'+domain+'/using/vpn-'+country+
        (!opt.no_go ? '?go=2' : '');
};

var join_sessions_etask;
function join_sessions(user){
    if (user.disable_account_changes)
        return;
    return etask('join_sessions', [function(){
        join_sessions_etask = this;
        return be_svc.update_info();
    }, function try_catch$(){
        var sync_token;
        if (!(sync_token = be_svc.get('sync_token')))
            return this.return();
        return E.be_bg_ajax.hola_api_call('users/auth/token/join?token='+
            sync_token);
    }, function finally$(){
        join_sessions_etask = undefined;
    }]);
}

function get_user_sync_token(){
    return etask('get_user_sync_token', [function(){
        return join_sessions_etask;
    }, function try_catch$(){
        return E.be_bg_ajax.hola_api_call('users/auth/token/generate');
    }, function(data){
        return !this.error ? data.token : '';
    }]);
}

E.get_user_data = function(query){
    var last_res;
    return etask('get_user_data', [function(){
        return E.be_bg_ajax.hola_api_call('users/get_user', query);
    }, function(res){
        last_res = res||{};
        if (last_res.user)
        {
            join_sessions(last_res.user);
            return this.return(last_res);
        }
        return be_svc.update_info();
    }, function try_catch$(){
        var sync_token;
        if (!(sync_token = be_svc.get('sync_token')))
            return this.return(last_res);
        return E.be_bg_ajax.hola_api_call('users/auth/token/login?token='+
            sync_token, {method: 'POST'});
    }, function(){
        if (this.error)
            return this.return(last_res);
        return E.be_bg_ajax.hola_api_call('users/get_user', query);
    }, function(res){
        return res||last_res;
    }]);
};

E.autologin_capable = function(){
    return etask('autologin_capable', [function(){
        return be_svc.update_info();
    }, function(){
        return !!be_svc.get('sync_token');
    }]);
};

E.resend_verification_email = function(){
    return E.be_bg_ajax.hola_api_call('users/send_email_verification',
        {method: 'POST'});
};

return E; });
