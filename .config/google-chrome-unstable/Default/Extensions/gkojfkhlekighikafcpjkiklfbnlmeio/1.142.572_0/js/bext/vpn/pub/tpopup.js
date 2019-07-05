// LICENSE_CODE ZON
'use strict'; 
define(['jquery', 'underscore', 'backbone', '/bext/pub/backbone.js',
    '/util/etask.js', '/bext/pub/util.js', '/bext/vpn/pub/tabs.js',
    '/bext/pub/ext.js', '/bext/pub/browser.js', '/svc/vpn/pub/util.js',
    '/util/escape.js', '/bext/pub/lib.js', '/util/url.js',
    '/bext/vpn/pub/tab_unblocker.js', '/bext/vpn/pub/info.js',
    '/bext/vpn/pub/rule.js', 'be_ver',
    '/util/zerr.js', '/util/storage.js', '/util/date.js',
    '/bext/vpn/pub/iframe.js', '/bext/vpn/pub/premium.js',
    '/util/util.js', '/bext/vpn/pub/util.js', '/bext/pub/locale.js',
    '/bext/pub/version_util.js', '/bext/vpn/pub/svc.js',
    '/bext/vpn/pub/trial.js'],
    function($, _, Backbone, be_backbone, etask, be_util, be_tabs, be_ext,
    B, svc_util, zescape, be_lib, zurl, be_tab_unblocker, be_info, be_rule,
    be_ver, zerr, storage, date, be_iframe, premium, zutil,
    be_vpn_util, T, be_version_util, be_svc, be_trial){
B.assert_bg('be_tpopup');
var chrome = window.chrome, conf = window.conf, zconf = window.zon_config;
var zopts = be_util.zopts;
var E = new (be_backbone.model.extend({
    _defaults: function(){
        this.on('destroy', function(){
            B.backbone.server.stop('be_tpopup');
            this.uninit();
        }.bind(this));
        B.backbone.server.start(this, 'be_tpopup');
    },
}))();

function script_data(iframe_int, opt){
    iframe_int.init_jquery();
    var B = window.chrome || typeof browser!='undefined' && browser;
    var $frame, port;
    var inited = false;
    function script_exec(func){
        var script = document.createElement('script');
        script.textContent = '('+func.toString()+')();';
        (document.head||document.documentElement).appendChild(script);
        script.remove();
    }
    function get_iframe_parent(){
        var el = document.fullscreenElement;
        return (opt.type=='mitm_popup' || opt.type=='watermark') && el &&
            !['VIDEO', 'IMG', 'IFRAME'].includes(el.tagName) ? el :
            document.body;
    }
    function get_itv_flash(){
        return opt.root_url=='itv.com' &&
            document.querySelector('#video object');
    }
    function must_exit_fullscreen(){
        var fs_el = document.fullscreenElement;
        return fs_el && fs_el.tagName=='IFRAME' || opt.root_url=='itv.com' &&
            document.body.classList.contains('is-fullscreen') &&
            !!get_itv_flash();
    }
    function exit_fullscreen(){
        var itv = get_itv_flash();
        if (!itv)
            return void document.exitFullscreen();
        try {
            script_exec(function(){
                document.querySelector('#video object')
                    .callBackPlayer('toggleFullscreen');
            });
        } catch(e){
            perr('tpopup_exit_fullscreen_err', {err: e.message});
        }
    }
    function is_playing(video){
        if (video.tagName=='VIDEO')
            return !video.paused && !video.ended;
        if (opt.root_url=='itv.com' && video.tagName=='OBJECT')
        {
            var el = document.querySelector('#video');
            return el && el.getAttribute('state')=='playing';
        }
    }
    function is_paused(video){
        if (video.tagName=='VIDEO')
            return video.paused && !video.ended;
        if (opt.root_url=='itv.com' && video.tagName=='OBJECT')
        {
            var el = document.querySelector('#video');
            return el && el.getAttribute('state')=='paused';
        }
    }
    function play_video(video){
        if (video.tagName=='VIDEO')
            return void video.play();
        if (opt.root_url=='itv.com' && video.tagName=='OBJECT')
        {
            script_exec(function(){
                document.querySelector('#video object')
                    .callBackPlayer('play');
            });
        }
    }
    function pause_video(video){
        if (video.tagName=='VIDEO')
            return void video.pause();
        if (opt.root_url=='itv.com' && video.tagName=='OBJECT')
        {
            script_exec(function(){
                document.querySelector('#video object')
                    .callBackPlayer('pause');
            });
        }
    }
    function add_iframe(){
        if (document.getElementById('_hola_popup_iframe__'))
            return void console.error('frame already exists');
        if (!document.body) 
            return void console.error('document not ready');
        var styles = {position: 'fixed', top: '5px', right: '20px',
            'max-width': '100%', 'max-height': '100%',
            'background-color': 'transparent', 'z-index': 2147483647,
            overflow: 'hidden', visibility: 'hidden', border: 'none',
            display: 'block'};
        if (['mitm_popup', 'watermark', 'last_rule'].includes(opt.type))
        {
            Object.assign(styles, {top: '0', right: '0', width: '0',
                height: '0'});
        }
        var url = opt.ext_url+'/tpopup_local.html?tab_id='+opt.tab_id+
            '&connection_id='+opt.connection_id;
        var f = iframe_int.add({url: url, parent: get_iframe_parent()});
        f.css(styles).attr('id', '_hola_popup_iframe__');
        document.body.addEventListener('mousedown', mousedown_cb);
        return f;
    }
    function rm_iframe(){
        try {
            if (!$frame)
                return;
            if (document.body)
                document.body.removeEventListener('mousedown', mousedown_cb);
            $frame = null;
            iframe_int.remove();
        } catch(e){
            console.error('rm_iframe error: '+e);
        }
    }
    function mousedown_cb(){ trigger('body_click'); }
    function trigger(name, data){
        data = Object.assign({tab_id: opt.tab_id,
            connection_id: opt.connection_id}, data);
        B.runtime.sendMessage({type: 'be_msg_req', _type: 'tpopup',
            _tab_id: opt.tab_id, context: {rmt: true},
            msg: {msg: 'call_api', obj: 'tpopup', func: 'trigger',
            args: [name, data]}});
    }
    function ext_send_msg(msg){
        msg = Object.assign({_type: 'tpopup',
            _connection_id: opt.connection_id}, msg);
        B.runtime.sendMessage({type: 'be_msg_req', _type: 'tpopup',
            _tab_id: opt.tab_id, context: {rmt: true},
            msg: {msg: 'call_api', obj: 'tpopup', func: 'send_tpopup_msg',
            args: [opt.tab_id, msg]}});
    }
    function perr(id, info){
        info = Object.assign({root_url: opt.root_url, url: opt.url}, info);
        B.runtime.sendMessage({type: 'be_msg_req', _type: 'tpopup',
            _tab_id: opt.tab_id, context: {rmt: true},
            msg: {msg: 'call_api', obj: 'tpopup', func: 'perr',
            args: [opt.tab_id, {id: id, info: info}]}});
    }
    function on_ext_msg(msg){
        if (msg._connection_id!=opt.connection_id)
            return;
        switch (msg.id)
        {
        case 'tpopup.init':
            ext_send_msg({id: 'cs_tpopup.init', tab_id: opt.tab_id,
                connection_id: opt.connection_id, conf: opt.conf,
                zon_config: opt.zon_config, ver: opt.ver,
                root_url: opt.root_url, url: opt.url, country: opt.country,
                type: opt.type, zopts: opt.zopts});
            break;
        case 'tpopup.show': $frame.css('visibility', 'visible'); break;
        case 'tpopup.hide': $frame.css('visibility', 'hidden'); break;
        case 'tpopup.resize':
            if (parseInt(msg.width, 10)>200 && parseInt(msg.height, 10)>200 &&
                must_exit_fullscreen())
            {
                exit_fullscreen();
            }
            iframe_int.resize({width: msg.width, height: msg.height,
                top: msg.top, left: msg.left, right: msg.right,
                bottom: msg.bottom, fade: msg.fade, animate: msg.animate,
                animation_time: msg.animation_time, transform: msg.transform,
                no_scale_anim: msg.no_scale_anim});
            trigger('resize_end');
            break;
        case 'tpopup.show_arrow_anim':
            var url = opt.ext_url+'/animation_arrow.html?direction='+
                msg.direction+'&width='+msg.size.width+'&height='+
                msg.size.height;
            iframe_int.show_arrow_anim({url: url, css: msg.css});
            break;
        case 'tpopup.hide_arrow_anim': iframe_int.hide_arrow_anim(); break;
        case 'tpopup.pause_videos': pause_videos(); break;
        case 'tpopup.resume_videos': resume_videos(); break;
        case 'tpopup.close': uninit(); break;
        }
    }
    var paused_videos = [];
    function pause_videos(){
        paused_videos = [];
        var videos = Array.from(document.querySelectorAll('video'));
        var itv;
        if (itv = get_itv_flash())
            videos.push(itv);
        videos.forEach(function(v){
            try {
                if (!is_playing(v))
                    return;
                pause_video(v);
                paused_videos.push(v);
            } catch(e){
                perr('geo_trial_ended_pause_video_err', {err: e.message});
                console.error('pause video error: '+e);
            }
        });
        if (paused_videos.length)
            perr('geo_trial_ended_pause_video', {count: paused_videos.length});
    }
    function resume_videos(){
        var resumed = [];
        paused_videos.forEach(function(v){
            try {
                if (!is_paused(v))
                    return;
                play_video(v);
                resumed.push(v);
            } catch(e){
                perr('geo_trial_ended_resume_video_err', {err: e.message});
                console.error('play video error: '+e);
            }
        });
        if (resumed.length)
            perr('geo_trial_ended_resume_video', {count: resumed.length});
        paused_videos = [];
    }
    function on_fullscreen(e){
        var parent = get_iframe_parent();
        if (!$frame || $frame.parent().is(parent))
            return;
        parent.appendChild($frame[0]);
        $frame.css('visibility', 'hidden');
    }
    function on_mouseleave(){ trigger('mouseleave'); }
    function init(){
        if (inited)
            return;
        if (opt.url!=location.href)
        {
            console.error('expected url: '+opt.url+' actual: '+location.href);
            return;
        }
        inited = true;
        if (!($frame = add_iframe()))
            return;
        $frame.on('mouseleave', on_mouseleave);
        document.addEventListener('fullscreenchange', on_fullscreen);
        document.addEventListener('webkitfullscreenchange', on_fullscreen);
        document.addEventListener('mozfullscreenchange', on_fullscreen);
        port = B.runtime.connect({name: opt.connection_id});
        B.runtime.onMessage.addListener(on_ext_msg);
        port.onDisconnect.addListener(uninit);
    }
    function uninit(){
        if (!inited)
            return;
        paused_videos = [];
        if ($frame)
            $frame.off('mouseleave', on_mouseleave);
        rm_iframe();
        document.removeEventListener('fullscreenchange', on_fullscreen);
        document.removeEventListener('webkitfullscreenchange', on_fullscreen);
        document.removeEventListener('mozfullscreenchange', on_fullscreen);
        B.runtime.onMessage.removeListener(on_ext_msg);
        port.onDisconnect.removeListener(uninit);
        port.disconnect();
        port = null;
        inited = false;
    }
    init();
}

function popup_showing(){
    if (chrome)
    {
        var views = chrome.extension.getViews({type: 'popup'});
        return views && views.length>0;
    }
    return B.have['firefox.panel.is_showing'] &&
        etask.cb_apply(B.firefox.panel, '.is_showing', []);
}

function is_disabled(){ return !be_ext.get('r.ext.enabled'); }

var min_suggest_rate=0.3;

var forced_urls = {}, connected_tpopups = {}, loading_tpopups = {};
function is_connected(tab_id, tpopup_type){
    var tab_connected = B.tabs.is_connected(tab_id);
    return tab_connected && tpopup_type ?
        connected_tpopups[tab_id]==tpopup_type :
        tab_connected && connected_tpopups[tab_id];
}
E.is_connected = is_connected;

function is_never_show_popup(root_url){
    return be_util.is_google(root_url) || be_util.is_youtube(root_url); }

function get_rule(url){
    var rules = be_vpn_util.get_rules(be_rule.get('rules'), url);
    return _.first(rules);
}

function is_protect(url){
    if (be_svc.get('vpn_country'))
        return true;
    var rule = get_rule(url)||{};
    return rule.enabled && be_vpn_util.is_all_browser(rule) ||
        rule.mode=='protect';
}

E.do_tpopup = function(tab, tpopup_opt){
    if (!tab || !tab.url || is_disabled())
        return;
    var popup_conf = (be_ext.get('bext_config')||{}).popup||{};
    if (popup_conf.disable || be_version_util.cmp(be_util.version(),
        popup_conf.disable_max_ver)<0)
    {
        return;
    }
    var rule, root_url, url = tab.url, id = tab.id;
    tpopup_opt = tpopup_opt||{};
    var tpopup_type, tpopup_country;
    function mitm_trace(s){
        var mitm = be_tab_unblocker.mitm;
        if (mitm)
            mitm.trace(id, url, s);
    }
    mitm_trace('do_tpopup start');
    return loading_tpopups[id] = loading_tpopups[id]||etask({async: true,
        name: 'do_tpopup', cancel: true}, [function(){
        root_url = svc_util.get_root_url(url);
        if (is_connected(id, tpopup_type))
            return this.return(zerr.notice('tab:%d tab already attached', id));
    }, function(){
        rule = premium.get_force_premium_rule(root_url);
        if (zutil.get(rule, 'blacklist') || !root_url)
        {
            if (root_url)
                zerr.notice('tab:%d no tpopup - blacklist %s', id, root_url);
            return this.return();
        }
        if (is_protect(url))
        {
            zerr.notice('tab:%d hide tpopup when protect browser/pc is '
                +'enabled', id);
            return this.return();
        }
        if (E.need_mitm_popup(url, id))
        {
            mitm_trace('do_tpopup mitm popup should be shown');
            zerr.notice('tab:%d mitm popup should be shown', id);
            tpopup_type = 'mitm_popup';
            return this.goto('check_ver');
        }
        if (is_never_show_popup(root_url))
        {
            zerr.notice('tab:%d tpopup not allowed on %s', id, root_url);
            return this.return();
        }
        if (!premium.is_active() &&
            !be_info.is_dont_show(id, root_url, 'site_premium') &&
            !be_info.is_dont_show(id, root_url) && rule)
        {
            zerr.notice('tab:%d force premium - tpopup should be shown', id);
            return this.goto('check_ver');
        }
        if (E.need_watermark_popup(id, url))
        {
            zerr.notice('tab:%d need watermark popup', id);
            tpopup_type = 'watermark';
            return this.goto('check_ver');
        }
        if (need_force_suggestion(id, url))
        {
            zerr.notice('tab:%d need forced suggestion popup', id);
            tpopup_type = 'suggestion';
            be_tabs.set_force_suggestion(id);
            be_tabs.set_last_rule(id);
            return this.goto('check_ver');
        }
        if (need_last_rule_popup(id, url))
        {
            zerr.notice('tab:%d need last rule popup', id);
            tpopup_type = 'suggestion';
            tpopup_country = be_tabs.get_last_rule(id).country.toUpperCase();
            be_tabs.set_force_suggestion(id);
            be_tabs.set_last_rule(id);
            return this.goto('check_ver');
        }
        var forced;
        if (forced = be_info.is_force_tpopup(root_url))
        {
            be_info.unset_force_tpopup(root_url);
            zerr.notice('tab:%d popup was forced', id);
            if (typeof forced=='string')
                tpopup_type = forced;
            else
                forced_urls[root_url] = forced;
            return this.goto('check_ver');
        }
        if (be_info.is_dont_show(id, root_url))
        {
            zerr.notice('tab:%d tab is don\'t show', id);
            return this.return();
        }
        if (be_trial.get_trial_active(root_url) ||
            get_suggesstion_conf(root_url))
        {
            zerr.notice('tab:%d skip tpopup, site has suggestion conf', id);
            return this.return();
        }
        if (forced = forced_urls[root_url])
        {
            zerr.notice('tab:%d popup was forced2', id);
            if (typeof forced=='string')
                tpopup_type = forced;
            return this.goto('check_ver');
        }
        zerr.notice('tab:%d checking if site has high unblocking rate', id);
        return be_info.get_unblocking_rate(200);
    }, function(unblocking_rate){
        if (!unblocking_rate)
            return false;
        if (premium.get_force_premium_rule(root_url))
            return false;
        for (var i=0, r, rate; !rate && (r = unblocking_rate[i]); i++)
        {
            if (r.root_url==root_url && r.unblocking_rate>min_suggest_rate)
                rate = r;
            else if (root_url=='bbc.com' && r.root_url=='bbc.co.uk' &&
                r.unblocking_rate>min_suggest_rate)
            {
                rate = r;
            }
        }
        return !!rate;
    }, function(need_unblock){
        if (!need_unblock)
        {
            zerr.notice('tab:%d skip tpopup, no unblock by redirect/error',
                id);
            return this.return();
        }
    }, function check_ver(){ return window.RMT.check_ver();
    }, function render(e){
        connected_tpopups[id] = tpopup_type ? tpopup_type : true;
        if (e && e.load_ver)
        {
            return this.return(zerr('tab:%d skip tpopup, load new ver%s', id,
                e.load_ver));
        }
        return popup_showing();
    }, function(showing){
        if (showing && !tpopup_type)
        {
            return this.return(zerr.notice('tab:%d extension popup is opened',
                id));
        }
        return be_tabs.get_tab(id);
    }, function(tab){
        if (!tab)
            return this.return(zerr('tab:%d tpopup tab disappeared', id));
        if (tab.url!=url)
        {
            zerr('tab:%d tpopup tab changed url %s -> %s', id, url, tab.url);
            return this.return();
        }
        if (is_connected(id, tpopup_type))
            return this.return(zerr.notice('tab:%d tab already attached', id));
        zerr.notice('tab:%d applying tpopup to tab', id);
        var opt = {conf: conf, zon_config: zconf,
            tab_id: id, connection_id: id+':tpopup:'+_.random(0xffff),
            root_url: root_url, url: url, ver: be_ver.ver,
            opt: storage.get('locale'),
            ext_url: chrome.runtime.getURL('')+'js',
            persistent: false, zopts: zopts.table};
        if (tpopup_type)
            opt.type = tpopup_type;
        if (tpopup_opt.reason)
        {
            be_lib.perr_ok({id: 'be_tpopup_inject', info: {url: tab.url,
                reason: tpopup_opt.reason}});
        }
        if (tpopup_country)
            opt.country = tpopup_country;
        etask([function(){
            zerr.notice('tab:%d inject tpopup iframe', id);
            return be_iframe.inject(id, script_data, opt,
                chrome ? {} : {tpopup: 1, connection_id: opt.connection_id});
        }, function(){ zerr.notice('tab:%d tpopup iframe injected', id);
        }]);
        return opt;
    }, function finally$(){
        delete loading_tpopups[id];
        debug_stats({url: url, root_url: root_url});
    }, function cancel$(){
        delete connected_tpopups[id];
        return this.return();
    }, function catch$(err){
        var ok = err.message=='OK';
        be_lib.perr_err({id: 'be_tpopup2_err', err: err,
            info: ok ? 'src_country: '+be_ver.country : null,
            filehead: ok ? zerr.log_tail() : '', rate_limit: true});
        delete connected_tpopups[id];
    }]);
};

function need_trial_ended(root_url){
    return !premium.is_active() && be_trial.is_trial_expired(root_url) &&
        !be_info.get_site_storage(root_url, 'trial.dont_show_ended');
}

function get_suggesstion_conf(root_url){
    var site_conf = be_util.get_site_conf(be_ext, root_url);
    return be_util.get_suggestion_conf(site_conf, be_info.get('country'));
}

function need_geo_suggestion(tab_id, root_url){
    if (!premium.is_active() && be_info.get_site_storage(root_url,
        'force_trial'))
    {
        return true;
    }
    return get_suggesstion_conf(root_url) &&
        !be_trial.get_trial_active(root_url) &&
        !be_trial.is_trial_expired(root_url) &&
        !be_info.is_dont_show(tab_id, root_url, 'suggestion');
}

function need_geo_watermark(tab_id, url, root_url){
    return be_util.is_geo_watermark(be_ext) && (get_rule(url)||{}).enabled &&
        (!premium.is_active() || !be_info.is_dont_show(tab_id, root_url,
        'watermark'));
}

function need_force_suggestion(tab_id, url){
    var root_url = svc_util.get_root_url(url);
    return be_vpn_util.is_vpn_allowed(url, true) &&
        !be_util.is_google(root_url) &&
        be_tabs.is_force_suggestion(tab_id) &&
        !be_info.is_dont_show(tab_id, root_url, 'suggestion');
}

E.need_watermark_popup = function(tab_id, url){
    if (!be_ext.get('r.vpn.on'))
        return false;
    var root_url = svc_util.get_root_url(url);
    return !!(need_geo_watermark(tab_id, url, root_url) ||
        need_trial_ended(root_url) || need_geo_suggestion(tab_id, root_url));
};

E.need_mitm_popup = function(url, tab_id){
    var mitm = be_tab_unblocker.mitm;
    var root_url = svc_util.get_root_url(url);
    return mitm && mitm.is_popup_needed(url, tab_id) &&
        (!premium.is_active() && !is_never_show_popup(root_url) ||
        mitm._is_mitm_active(tab_id)=='auto');
};

function need_last_rule_popup(tab_id, url){
    var rule = be_tabs.get_last_rule(tab_id);
    if (!be_vpn_util.is_vpn_allowed(url, true))
        return false;
    var root_url = svc_util.get_root_url(url);
    return rule && be_util.is_google(rule.name) &&
        !be_info.is_dont_show(tab_id, root_url, 'suggestion');
}

function tpopup_on_updated(o){ E.do_tpopup(o.tab); }

function tpopup_on_replaced(o){
    B.tabs.get(o.added, function(tab){ E.do_tpopup(tab); }); }

var sent = {};
function send_trial_perr(opt, page, re){
    if (sent[page])
        return;
    if (!opt.skip_check && !re.test(opt.url))
        return;
    sent[page] = true;
    be_lib.perr_ok({id: 'be_trial_page', info: {url: opt.url,
        root_url: opt.root_url, page: page}});
}

function debug_stats(opt){
    try {
        var url = opt.url, root_url = opt.root_url;
        if (root_url!='netflix.com')
            return;
        if (!be_trial.get_trial_active(root_url))
        {
            send_trial_perr({skip_check: true}, 'visit_no_trial', /.*/);
            return;
        }
        send_trial_perr({skip_check: true}, 'visit_trial', /.*/);
        send_trial_perr(opt, 'browse', /\/browse/i);
        send_trial_perr(opt, 'watch', /\/watch/i);
        send_trial_perr(opt, 'search', /\/search/i);
        send_trial_perr(opt, 'login', /\/login/i);
    } catch(err){ zerr('debug_stats error %o', err); }
}

function tpopup_msg(c_id, name, opt){
    var tab_id = +c_id.split(':')[0];
    chrome.tabs.sendMessage(tab_id, Object.assign({id: 'tpopup.'+name,
        _type: 'tpopup', _connection_id: c_id}, opt));
}

E.show = function(c_id){ tpopup_msg(c_id, 'show'); };
E.hide = function(c_id){ tpopup_msg(c_id, 'hide'); };
E.close = function(c_id){ tpopup_msg(c_id, 'close'); };
E.pause_videos = function(c_id){ tpopup_msg(c_id, 'pause_videos'); };
E.resume_videos = function(c_id){ tpopup_msg(c_id, 'resume_videos'); };
E.hide_arrow_anim = function(c_id){ tpopup_msg(c_id, 'hide_arrow_anim'); };
E.show_arrow_anim = function(c_id, opt){
    tpopup_msg(c_id, 'show_arrow_anim', opt); };

var resize_et = {};
E.resize = function(c_id, opt){
    if (resize_et[c_id])
        resize_et[c_id].return();
    return etask([function(){
        resize_et[c_id] = this;
        tpopup_msg(c_id, 'resize', opt);
        return this.wait();
    }, function finally$(){
        delete resize_et[c_id];
    }]);
};

function on_resize_end(e){
    if (resize_et[e.connection_id])
        resize_et[e.connection_id].continue();
}

function enabled_cb(){
    if (!is_disabled())
        return;
    Object.keys(connected_tpopups).forEach(function(tab_id){
        var connections = B.tabs.get_tab_connections(tab_id);
        if (connections)
            connections.forEach(function(c_id){ E.close(c_id); });
    });
}

E.uninit = function(){
    if (!E.inited)
        return;
    E.inited = 0;
    E.sp.return();
    E.stopListening();
};

E.init = function(){
    if (E.inited)
        return;
    E.inited = 1;
    E.sp = etask('be_tpopup', [function(){ return this.wait(); }]);
    if (!B.have.tpopup)
        return;
    try { E.tpopup_user = storage.get_json('tpopup_user')||{}; }
    catch(e){ E.tpopup_user = {}; }
    if (E.tpopup_user=='false') 
        E.tpopup_user = {};
    E.listenTo(be_tabs, 'updated', tpopup_on_updated);
    E.listenTo(be_tabs, 'replaced', tpopup_on_replaced);
    E.listenTo(be_ext, 'change:r.ext.enabled', enabled_cb);
    E.on('resize_end', on_resize_end);
};

return E; });
