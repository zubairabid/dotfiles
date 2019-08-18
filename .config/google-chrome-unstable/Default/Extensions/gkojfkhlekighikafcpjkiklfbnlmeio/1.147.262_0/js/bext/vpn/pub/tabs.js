// LICENSE_CODE ZON
'use strict'; 
define(['jquery', 'underscore', '/util/etask.js', '/bext/pub/backbone.js',
    '/bext/pub/browser.js', '/util/zerr.js', '/svc/vpn/pub/util.js',
    '/util/date.js', '/util/url.js', '/bext/pub/ext.js', '/bext/pub/lib.js'],
    function($, _, etask, be_backbone, B, zerr, vpn_util, date,
    zurl, be_ext, be_lib){
B.assert_bg('be_tabs');
var be_rules;
var chrome = window.chrome;
var E = new (be_backbone.model.extend({
    _defaults: function(){ this.on('destroy', function(){ E.uninit(); }); },
}))();
var max_redirects = 20;

function active_cb(){
    etask({name: 'active_cb', cancel: true}, [function(){
        return E.get_tab(E.get('active.real.id'));
    }, function(tab){
        if (tab && chrome)
        {
            if ((tab.url||'').startsWith(
                'chrome-devtools://devtools/bundled/devtools.html'))
            {
                return;
            }
        }
        E.set({'active.id': tab ? tab.id : undefined,
            'active.url': tab ? tab.url : '',
            'active.status': tab ? tab.status : '',
            'active.incognito': tab ? tab.incognito : false,
        });
    }, function catch$(err){
        zerr('be_tabs_active_cb_err: '+err);
    }]);
}

function is_active(id){ return id==E.get('active.real.id'); }

var tab_trace = {};
function page_trace(details, msg, clear){
    if (!details)
        return;
    var is_main = chrome ? !details.frameId && (!details.type ||
        details.type=='main_frame') : details.is_main;
    if (!is_main && msg!='autoreload')
        return;
    var tab_id = details.tabId;
    if (clear)
        page_trace_del(tab_id);
    var trace = tab_trace[tab_id] = tab_trace[tab_id]||[];
    var ts = details.timeStamp;
    var from_start = trace[0] ? ts-trace[0].ts : 0;
    var prev = trace.length ? trace[trace.length-1] : null;
    if (prev)
        prev.duration = ts-prev.ts;
    var status = details.statusCode || prev&&prev.status || '0';
    trace.push({ts: ts, real_ts: Date.now(), from_start: from_start, msg: msg,
        status: status, error: details.error});
    zerr.debug('tab:%d navigation %s %s', tab_id, msg, details.url.slice(0,
        200));
}

function page_trace_del(tab_id){
    delete tab_trace[tab_id];
}

E.page_trace = page_trace;
E.get_trace = function(tab_id){
    var trace = tab_trace[tab_id];
    if (!trace || !trace.length)
        return trace;
    trace[trace.length-1].duration = Date.now()-trace[trace.length-1].real_ts;
    return trace;
};

function on_created(tab){
    set_url(tab.id, tab.url);
    E.trigger('created', {tab: tab});
}

function on_updated(id, info, tab){
    if (!info.url && !info.status) 
        return;
    set_url(id, info.url);
    if (is_active(id))
        E.sp.spawn(active_cb());
    E.trigger('updated', {id: id, info: info, tab: tab});
}

function on_activated(info){ E.set('active.real.id', info.tabId); }

function on_removed(id, info){
    del_tab(id);
    track_redirect_del(id);
    page_trace_del(id);
    E.trigger('removed', {id: id, info: info});
}

function on_replaced(added, removed){
    del_tab(removed);
    track_redirect_del(removed);
    page_trace_del(removed);
    if (is_active(removed))
        E.set('active.real.id', added);
    E.trigger('replaced', {added: added, removed: removed});
}

var chrome_error_list = ['ACCESS_DENIED', 'BLOCKED_BY_ADMINISTRATOR',
    'CONNECTION_REFUSED', 'CONNECTION_FAILED', 'NAME_NOT_RESOLVED',
    'ADDRESS_UNREACHABLE', 'CERT_ERROR_IN_SSL_RENEGOTIATION',
    'NAME_RESOLUTION_FAILED', 'NETWORK_ACCESS_DENIED',
    'SSL_HANDSHAKE_NOT_COMPLETED', 'SSL_SERVER_CERT_CHANGED',
    'CERT_COMMON_NAME_INVALID', 'CERT_AUTHORITY_INVALID',
    'CERT_CONTAINS_ERRORS', 'CERT_INVALID', 'INVALID_RESPONSE',
    'EMPTY_RESPONSE', 'INSECURE_RESPONSE', 'DNS_MALFORMED_RESPONSE',
    'DNS_SERVER_FAILED', 'DNS_SEARCH_EMPTY', 'TIMED_OUT', 'CONNECTION_CLOSED',
    'ABORTED', 'CONNECTION_RESET'];
function on_error_occured(info){
    if (info.frameId!=0)
        return;
    var err = info.error||'';
    err = err.split('::ERR_')[1];
    if (chrome && (!err || !chrome_error_list.includes(err)))
        return;
    info.http_status_code = 0;
    E.trigger('error_occured', {id: info.tabId, info: info});
}

function on_focused(id){
    if (id===B.windows.WINDOW_ID_NONE)
        return;
    E.set('active.window.id', id);
    B.tabs.query({active: true, windowId: id}, function(tabs){
        if (tabs.length)
            E.set('active.real.id', tabs[0].id);
    });
}
var nav_tabs = {};
function on_before_navigate(info){
    if (!info.frameId)
        nav_tabs[info.tabId] = info.url;
    var trace, clear = true;
    if (!info.frameId && (trace = tab_trace[info.tabId]))
    {
        var i, now = Date.now();
        for (i = trace.length-1; i>=0 && trace[i].msg!='autoreload'; i--);
        if (i>=0 && now-trace[i].real_ts<2*date.ms.SEC)
            clear = false;
    }
    page_trace(info, 'before_navigate', clear);
    if (!info.frameId && is_active(info.tabId)) 
        active_cb();
    E.trigger('before_navigate', info);
}

function on_completed(info){
    page_trace(info, 'completed');
    if (is_active(info.tabId))
        active_cb();
    E.trigger('completed', info);
}

function on_committed(details){
    page_trace(details, 'committed');
    E.trigger('committed', {id: details.tabId, info: details});
    if (!details.frameId && details.tabId && details.url)
    {
        var qualifiers = details.transitionQualifiers;
        if (qualifiers && qualifiers.includes('client_redirect'))
        {
            track_redirect({id: details.tabId, url: details.url,
                info: details});
        }
        else if (!qualifiers.includes('server_redirect'))
            delete tabs_redirect[details.tabId];
        last_committed[details.tabId] = get_root_url(details.url);
    }
    if (false && details.transitionType=='reload')
        E.trigger('reload', details);
}

function get_root_url(url){
    url = zurl.parse(url);
    if (!url.hostname || !url.protocol)
        return;
    url = url.protocol+'//'+url.hostname+'/';
    return vpn_util.get_root_url(url);
}

var tabs_redirect = {}, last_committed = {};
function track_redirect(tab){
    if (!chrome || !tab || tab.id===undefined || !tab.url)
        return;
    var list = tabs_redirect[tab.id];
    if (!list)
        list = tabs_redirect[tab.id] = {};
    var last_url = last_committed[tab.id];
    var from_url = get_root_url(tab.url);
    var to_url;
    var headers = tab.info && tab.info.responseHeaders;
    if (headers)
    {
        _.each(headers, function(header){
            if (header.name.toLowerCase()=='location')
                to_url = header.value;
        });
        to_url = to_url ? get_root_url(to_url) : undefined;
    }
    if (!to_url && tab.info && tab.info.transitionQualifiers)
    {
        to_url = get_root_url(tab.url);
        from_url = last_url;
    }
    if (!from_url || !to_url || from_url==to_url)
        return;
    var now = Date.now();
    list[to_url] = {from: from_url, url: tab.url, ts: now};
    setTimeout(function(){
        var url = list[to_url];
        if (url && url.ts==now)
            delete list[to_url];
    }, 120*date.ms.SEC);
}

function get_redirect_sequence(tab_id, url, ts_limit, limit){
    var root_urls = [], urls = [];
    var list = tabs_redirect[tab_id];
    if (!list)
        return root_urls;
    limit = limit||4;
    var ts, parent_url, i;
    for (i = 0, parent_url = list[url]; parent_url = list[url];
        url = parent_url.from, i++)
    {
        if (parent_url.ts<=ts_limit || ts && ts<=parent_url.ts ||
            i==max_redirects)
        {
            break;
        }
        root_urls.unshift(parent_url.from);
        urls.unshift(parent_url.url);
        if (!ts)
            ts = parent_url.ts;
    }
    if (i==max_redirects)
    {
        be_lib.perr_err({id: 'be_max_redirect_sequence',
            rate_limit: {count: 1}, info: {urls: urls}});
    }
    return root_urls.splice(0, limit);
}

function track_redirect_del(tab_id){
    if (tab_id===undefined)
        return;
    delete last_committed[tab_id];
    delete tabs_redirect[tab_id];
}

E.track_redirect = track_redirect;
E.get_redirect_list = function(tab_id){
    var time_limit = Date.now()-120*date.ms.SEC;
    var active_url = E.get('active.url');
    active_url = active_url && get_root_url(active_url);
    return get_redirect_sequence(tab_id, active_url, time_limit);
};

E.init = function(){
    if (E.inited)
        return;
    E.sp = etask('be_tabs', [function(){ return this.wait(); }]);
    E.listen_to(be_ext, 'change:r.ext.enabled', update_state);
    E.urls = {};
    B.tabs.query({}, function(tabs){
        if (!tabs)
            return;
        for (var i=0; i<tabs.length; i++)
            set_url(tabs[i].id, tabs[i].url);
    });
    B.windows.get_last_focused({}, function(win){
        if (win)
            on_focused(win.id);
    });
    B.tabs.on_created.add_listener(on_created);
    B.tabs.on_updated.add_listener(on_updated);
    B.tabs.on_activated.add_listener(on_activated);
    B.tabs.on_removed.add_listener(on_removed);
    B.tabs.on_replaced.add_listener(on_replaced);
    B.windows.on_focus_changed.add_listener(on_focused);
    set_navigation_listeners();
    E.on_init('change:active.real.id', active_cb);
    B.backbone.server.start(E, 'be_tabs');
    E.inited = true;
};

E.set_rules = function(_be_rules){
    if (be_rules)
        return;
    be_rules = _be_rules;
    be_rules.on('before_rule_set', function(){
        if (!be_ext.get('gen.is_reload_on_update_on'))
            handler_behavior_changed();
    });
};

E.uninit = function(){
    if (!E.inited)
        return;
    E.sp.return();
    B.backbone.server.stop('be_tabs');
    B.tabs.on_created.del_listener(on_created);
    B.tabs.on_updated.del_listener(on_updated);
    B.tabs.on_activated.del_listener(on_activated);
    B.tabs.on_removed.del_listener(on_removed);
    B.tabs.on_replaced.del_listener(on_replaced);
    B.windows.on_focus_changed.del_listener(on_focused);
    del_navigation_listeners();
    E.stopListening(be_ext);
    E.inited = false;
    E.urls = undefined;
    E.clear();
};

function set_navigation_listeners(){
    if (E.nav_listening)
        return;
    E.nav_listening = true;
    if (B.have['web_navigation.on_before_navigate'])
        B.web_navigation.on_before_navigate.add_listener(on_before_navigate);
    if (B.have['web_navigation.on_completed'])
        B.web_navigation.on_completed.add_listener(on_completed);
    if (B.have['web_navigation.on_error_occured'])
        B.web_navigation.on_error_occured.add_listener(on_error_occured);
    if (B.have['web_navigation.on_committed'])
        B.web_navigation.on_committed.add_listener(on_committed);
}

function handler_behavior_changed(){
    if (B.have['web_request.handler_behavior_changed'])
        B.web_request.handler_behavior_changed();
}

function del_navigation_listeners(){
    if (!E.nav_listening)
        return;
    E.nav_listening = false;
    if (B.have['web_navigation.on_before_navigate'])
        B.web_navigation.on_before_navigate.del_listener(on_before_navigate);
    if (B.have['web_navigation.on_completed'])
        B.web_navigation.on_completed.del_listener(on_completed);
    if (B.have['web_navigation.on_committed'])
        B.web_navigation.on_committed.del_listener(on_committed);
    if (B.have['web_navigation.on_error_occured'])
        B.web_navigation.on_error_occured.del_listener(on_error_occured);
}

E.get_tab = function(tab_id){
    if (!tab_id)
        return null;
    return etask.cb_apply(B.tabs, '.get', [tab_id]);
};

E.get_nav_tab_url = function(id){ return nav_tabs[id]; };
E.get_nav_tabs = function(){ return nav_tabs; };
function del_tab(id){
    delete nav_tabs[id];
    if (!E.urls[id])
        return;
    delete E.urls[id];
    E.trigger('url_updated', id);
}

function set_url(id, url){
    if (!url || url==E.urls[id])
        return;
    E.urls[id] = url;
    E.trigger('url_updated', id, url);
}

function update_state(){
    var is_enabled = be_ext.get('r.ext.enabled');
    if (E.is_enabled==is_enabled)
        return;
    E.is_enabled = is_enabled;
    del_navigation_listeners();
    if (!E.is_enabled)
        return;
    set_navigation_listeners();
}

E.has_root_url = function(root_url){
    return Object.values(E.urls||{}).some(function(url){
        return get_root_url(url)==root_url; });
};

E.get_url = function(tab_id){ return E.urls && E.urls[tab_id]; };

E.active = function(){ return E.get_tab(E.get('active.id')); };

E.reload = function(tab_id, url){
    if (!url)
        return void B.tabs.reload(tab_id, {bypassCache: true});
    if (be_ext.get('gen.is_reload_on_update_on'))
        handler_behavior_changed();
    B.tabs.update(tab_id, {url: url, active: true});
};

var tabs_suggestions = {};
E.set_force_suggestion = function(tab_id, val){
    tabs_suggestions[tab_id] = val;
};

E.is_force_suggestion = function(tab_id){
    return tabs_suggestions[tab_id];
};

return E; });
