// LICENSE_CODE ZON
'use strict'; 
define(['underscore', '/util/etask.js', '/bext/pub/backbone.js',
    '/util/zerr.js', '/bext/pub/version_util.js', '/util/util.js',
    '/util/user_agent.js'],
    function(_, etask, be_backbone, zerr, be_version_util, zutil, user_agent){
var chrome = !window.is_tpopup && window.chrome;
var conf = window.conf, zconf = window.zon_config;
var noop = function(){};
var E = new (be_backbone.model.extend({
    _defaults: function(){
        this.is_rmt = window.require_is_remote;
	this.on('destroy', function(){
	    if (!E.inited)
		return;
	    E.msg.on_req = undefined;
            E.msg.on_add_listener = undefined;
            E.msg.on_del_listener = undefined;
            E.msg.on_connect = undefined;
            E.msg.on_disconnect = undefined;
	});
    },
}))();

E.init = function(msg){
    if (E.inited)
        return;
    E.inited = true;
    E.listeners = {'': {}};
    E.msg = msg;
    E.msg.on_req = on_req;
    E.msg.on_add_listener = on_add_listener;
    E.msg.on_del_listener = on_del_listener;
    E.msg.on_connect = on_connect;
    E.msg.on_disconnect = on_disconnect;
};

function on_req(j){
    var req = j.msg;
    switch (req.msg)
    {
    case 'call_api':
	var cb = !req.has_cb ? null : function(){
	    E.msg.resp(j, {args: _.toArray(arguments),
		last_error: !chrome ? 0 : chrome.runtime.lastError});
	};
	E.impl.call_api(req.obj, req.sub, req.func, req.args, cb, j);
	if (!req.has_cb)
	    E.msg.resp(j, {args: []});
	break;
    }
}

function on_add_listener(j){
    var req = j.msg, id = j.id, cid = j._connection_id||'';
    var cb = function(){ E.msg.send_event(j, _.toArray(arguments)); };
    cb.__j = j;
    var l = E.listeners[cid];
    if (!l)
        return zerr('add: listeners for '+cid+' not inited');
    zerr.assert(!l[id], 'add: listener '+id+' already exists');
    l[id] = cb;
    E.impl.add_listener(req.obj, req.sub, cb);
}

function on_del_listener(j){
    var req = j.msg, id = j.id, cid = j._connection_id||'';
    var l = E.listeners[cid];
    if (!l)
        return zerr('del: listeners for '+cid+' not inited');
    var cb = l[id];
    zerr.assert(cb, 'del: listener '+id+' not found');
    E.impl.del_listener(req.obj, req.sub, cb);
    delete l[id];
}

function on_connect(cid){
    if (E.listeners[cid])
        return zerr('connect: listeners for '+cid+' already inited');
    E.listeners[cid] = {};
}

function on_disconnect(cid){
    var l = E.listeners[cid];
    if (!l)
        return zerr('disc: listeners for '+cid+' not inited');
    _.each(zutil.clone(l), function(e, i){
        var t;
        if (t = e.__j)
            on_del_listener(t);
        else if (t = e.__backbone)
            del_backbone_listener(t.id, cid, t.backbone_client_id);
    });
    zerr.assert(_.isEmpty(l), 'listeners not empty');
    delete E.listeners[cid];
}

function del_backbone_listener(id, connection_id, backbone_client_id){
    var o = get_backbone_obj(id);
    var l = E.listeners[connection_id];
    if (!l)
    {
        return zerr('del_backbone: listeners for '+connection_id+
            ' not inited');
    }
    var cb = l[backbone_client_id];
    delete l[backbone_client_id];
    if (!o)
        return;
    E.stopListening(o, 'all', cb);
}

function join_dot(obj, sub, func){ return _.compact(arguments).join('.'); }

function get_obj(root, obj, sub){
    var a = obj.split('.').concat(sub||[]), o = root;
    for (var i=0, l=a.length; i<l && o; i++)
        o = o[a[i]];
    return i<a.length ? null : o;
}

function get_backbone_obj(id){
    var main = E.is_rmt || id!='be_bg_main' ? window.RMT : window.be_bg_main;
    return main && main.be_browser.backbone.server.obj[id];
}

function perr(opt, new_name){
    if (window.be_bg_main && window.be_bg_main.be_lib &&
        window.be_bg_main.be_lib.perr_err)
    {
	return window.be_bg_main.be_lib.perr_err(opt, new_name);
    }
    if (window.be_popup_main && window.be_popup_main.be_popup_lib &&
        window.be_popup_main.be_popup_lib.perr_err)
    {
	return window.be_popup_main.be_popup_lib.perr_err(opt, new_name);
    }
    zerr('perr '+opt.id+' '+(opt.info ? opt.info : '')+
        (opt.err ? '\n'+zerr.e2s(opt.err) : ''));
}

function _perr(obj, sub, func, args, err){
    var err_info = err ? err.hola_info : undefined;
    perr({
        id: 'be_msg_err',
        info: {method: join_dot(obj, sub, func), args: args,
            err_info: err_info},
        err: err,
    });
}

E.impl = {};
E.impl.init = function(){
    if (this.inited)
        return;
    this.inited = true;
    if (!chrome)
        return;
    if (be_version_util.cmp(user_agent.guess_browser().version, '23')<0)
    {
        this['browserAction.setIcon'] = function(args, cb){
            if (args[0] && args[0].path && args[0].path['19'])
                args[0].path = args[0].path['19'];
            chrome.browserAction.setIcon.apply(chrome.browserAction,
                args.concat(cb||[]));
        };
    }
    this.on_replaced = chrome.tabs.onReplaced ||
        chrome.webNavigation.onTabReplaced;
    this.id = chrome.runtime.id;
    this.url = chrome.runtime.getURL('').slice(0, -1);
    this.manifest = chrome.runtime.getManifest();
};
E.impl['be.reload_ext'] = chrome && function(args, cb, j){
    cb = cb||noop;
    zerr('reload_ext');
    if (j && j._tab_id)
    {
        zerr('tpopup not allowed to reload extension');
        return cb({});
    }
    if ((conf.firefox_web_ext || zconf.BEXT_PLUGIN) && chrome.runtime.reload)
        return chrome.runtime.reload();
    var bg = chrome.extension.getBackgroundPage();
    bg.location.reload();
    if (window!=bg)
        window.close();
    cb({});
};
E.impl['be.ccgi.send'] = chrome && function(args, cb){
    var resp_cb = args[1], msg = args[0];
    try { resp_cb(msg); }
    catch(e){
        perr({id: 'be_ccgi_send_err', info: msg.id, err: e,
            filehead: zerr.json(msg)});
    }
    if (cb)
        cb({});
};
E.impl['runtime.get_install_details'] = chrome && function(args, cb){
    if (cb)
        cb(window.be_bg.install_details);
};
E.impl['impl.init'] = chrome && function(args, cb){
    this.init(); 
    if (cb)
        cb({id: this.id, url: this.url, manifest: this.manifest});
};
E.impl['tpopup.set_dont_show_again'] = function(args){
    if (!window.RMT || !window.RMT.be_info)
        return zerr('no RMT or be_info');
    window.RMT.be_info.set_dont_show_again(args[0]);
};
E.impl['tpopup.send_tpopup_msg'] = function(args){
    chrome.tabs.sendMessage(args[0], args[1]);
};
E.impl['tpopup.trigger'] = function(args){
    if (!window.RMT || !window.RMT.be_tpopup)
        return;
    window.RMT.be_tpopup.trigger(args[0], args[1]);
};
E.impl['tpopup.perr'] = function(args){ perr(args[1], true); };
E.impl['backbone.server.connect'] = function(args, cb, j){
    cb = cb||noop;
    var id = args[0], o = get_backbone_obj(id), cid = j._connection_id||'';
    if (!o)
        return;
    var attr = o.attributes;
    var bcid = attr._backbone_client_id = _.uniqueId('bbl');
    var l = E.listeners[cid];
    if (!l)
        return zerr('connect: listeners for '+cid+' not inited');
    zerr.assert(!l[bcid], 'backbone listener for'+bcid+' already exists');
    var _cb = l[bcid] = function(ename){
        var args = [];
        if (ename.includes('change:'))
            args = [o.get(ename.replace('change:', ''))];
        else if (ename!='change')
            args = [].slice.call(arguments, 1);
        E.msg.send_backbone_event(j,
            {id: id, ename: ename, args: args});
    };
    _cb.__backbone = {id: id, backbone_client_id: bcid};
    E.listenTo(o, 'all', _cb);
    cb({attributes: attr});
};
E.impl['backbone.server.disconnect'] = function(args, cb, j){
    del_backbone_listener(args[0], j._connection_id||'', args[1]);
    if (cb)
        cb({});
};
E.impl['backbone.server.ping'] = function(args, cb, j){
    cb = cb||noop;
    var id = args[0], o = get_backbone_obj(id);
    if (o)
        cb({});
};
E.impl.call_api = function(obj, sub, func, args, cb, j){
    try {
	var o;
	if (obj.startsWith('backbone.server.obj.'))
	{
            cb = cb||noop;
	    var id = obj.replace('backbone.server.obj.', '');
	    o = get_backbone_obj(id);
	    if (!o)
		return;
	    if (sub=='ecall')
	    {
		return etask([function(){ return o.ecall(func, args);
		}, function(){ cb.apply(null, arguments);
		}, function catch$(err){
                    cb({_error: ''+err});
                    _perr(obj, sub, func, args, err);
                }]);
	    }
	    o[sub].call(o, func, args);
            cb({});
	    return;
	}
        var s = join_dot(obj, sub, func);
        if (_.isFunction(this[s]))
        {
            if (zerr.is.info())
                zerr.info(s+'('+zerr.json(args).substr(0, 100)+')');
            return void this[s].call(this, args, cb, j);
        }
        o = get_obj(chrome, obj, sub);
        if (!o || !o[func])
            return _perr(obj, sub, func, args, new Error('not found'));
	return o[func].apply(o, args.concat(cb||[]));
    } catch(err){ _perr(obj, sub, func, args, err); }
};
E.impl['tabs.on_replaced.add_listener'] = chrome && function(cb){
    var on_replaced = function(){
        cb.apply(null, arguments.length==2 ? arguments :
            [arguments[0].tabId, arguments[0].replacedTabId]);
    };
    cb.__be_on_replaced = on_replaced; 
    if (this.on_replaced)
        this.on_replaced.addListener(on_replaced);
};
E.impl['tabs.on_replaced.del_listener'] = chrome && function(cb){
    if (this.on_replaced)
        this.on_replaced.removeListener(cb.__be_on_replaced);
};
E.impl['be.ccgi.add_listener'] = chrome && function(cb){
    cb.__be_ccgi_ipc_cb = function(msg, sender, resp_cb){
        return cb(msg, resp_cb, sender); };
    chrome.runtime.onMessage.addListener(cb.__be_ccgi_ipc_cb);
};
E.impl['be.ccgi.del_listener'] = chrome && function(cb){
    chrome.runtime.onMessage.removeListener(cb.__be_ccgi_ipc_cb); };
E.impl.add_listener = function(obj, sub, cb, opt, extra){
    try {
        var s = join_dot(obj, sub, 'add_listener');
        if (_.isFunction(this[s]))
        {
            zerr.info(s+'()');
            return void this[s].call(this, cb, opt, extra);
        }
        var o = get_obj(chrome, obj, sub);
        if (!o || !o.addListener)
            return _perr(obj, sub, 'add_listener', new Error('not found'));
        if (!opt)
            return o.addListener(cb);
        o.addListener(cb, opt, extra);
    } catch(e){
        _perr(obj, sub, 'add_listener', {opt: opt, extra: extra}, e); }
};
E.impl.del_listener = function(obj, sub, cb){
    try {
        var s = join_dot(obj, sub, 'del_listener');
        if (_.isFunction(this[s]))
        {
            zerr.info(s+'()');
            return void this[s].call(this, cb);
        }
        var o = get_obj(chrome, obj, sub);
        if (!o || !o.removeListener)
            return _perr(obj, sub, 'del_listener');
        o.removeListener(cb);
    } catch(err){ _perr(obj, sub, 'del_listener', [], err); }
};

return E; });
