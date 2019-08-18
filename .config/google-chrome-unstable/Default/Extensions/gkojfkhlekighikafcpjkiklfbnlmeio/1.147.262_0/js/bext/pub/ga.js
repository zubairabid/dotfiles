// LICENSE_CODE ZON
'use strict'; 
define(['/util/hash.js', '/util/escape.js'], function(hash, zescape){
var E = {};
var GA_URL = 'https://ssl.google-analytics.com/ga.js';
var GA_POST_URL = 'https://www.google-analytics.com/collect';
var xhr_send_t;

function inject_ga(id){
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = GA_URL;
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
}

function proc_ga_msg(ga_msg){
    var t, targs;
    switch (ga_msg[0])
    {
    case '_trackEvent': t = 'event'; targs = ['ec', 'ea', 'el']; break;
    case '_trackPageview': t = 'pageview'; targs = ['dh', 'dp', 'dt']; break;
    default: return;
    }
    var args = targs.map(function(v, i){
        return ga_msg[i+1] && v+'='+ga_msg[i+1];
    }).filter(function(v){ return !!v; }).join('&');
    var params = {v: 1, tid: E.xhr_opt.id, cid: E.xhr_opt.cid, t: t,
        cm: E.xhr_opt.cm, cs: E.xhr_opt.cs};
    return zescape.qs(params)+'&'+args;
}

E.inited = {};
E.init = function(id, no_pageview, opt){
    if (E.inited[id])
        return;
    opt = opt||{};
    E.inited[id] = true;
    if (opt.use_xhr)
    {
        var h = hash.hash_string(opt.cid||'')%100;
        E.xhr_opt = {tracking: h < (+opt.sample_rate||100),
            id: id, cid: opt.cid, gclid: opt.gclid, cm: opt.cm, cs: opt.cs};
    }
    else
        inject_ga(id);
    E.qpush(['_setAccount', id]);
    if (opt.sample_rate)
        E.qpush(['_setSampleRate', ''+opt.sample_rate]);
    if (opt.cm)
        E.qpush(['_setCampMediumKey', opt.cm]);
    if (opt.cs)
        E.qpush(['_setCampSourceKey', opt.cs]);
    if (no_pageview)
        return;
    E.qpush(['_trackPageview']);
};
E.ga_send = function(type, category, action, label, id){
    var _gaq = window._gaq;
    if (!_gaq)
        return;
    if (_gaq._getAsyncTracker)
        _gaq._getAsyncTracker(id)._trackEvent(category, action, label);
    else
        E.qpush(['_trackEvent', category, action, label]);
};
E.set_custom_var = function(slot, name, value, scope){
    scope = scope||2;
    slot = slot<1||slot>5 ? 1 : slot;
    var _gaq = window._gaq;
    if (_gaq._getAsyncTracker)
        _gaq._getAsyncTracker()._setCustomVar(slot, name, value, scope);
    else
        E.qpush(['_setCustomVar', slot, name, value, scope]);
};
E.qpush = function(ar){
    var _gaq = window._gaq = window._gaq || [];
    _gaq.push(ar);
    if (!E.xhr_opt)
        return;
    if (xhr_send_t)
        clearTimeout(xhr_send_t);
    xhr_send_t = setTimeout(E.send_gaq, 1);
};
E.send_gaq = function(){
    xhr_send_t = 0;
    var _gaq = window._gaq = window._gaq || [];
    window._gaq = [];
    var messages = _gaq.map(proc_ga_msg)
        .filter(function(msg){ return !!msg; });
    if (!messages.length || !E.xhr_opt.tracking)
        return;
    var request = new XMLHttpRequest();
    request.open('POST', GA_POST_URL, true);
    request.send(messages.join('\n'));
};

return E; });
