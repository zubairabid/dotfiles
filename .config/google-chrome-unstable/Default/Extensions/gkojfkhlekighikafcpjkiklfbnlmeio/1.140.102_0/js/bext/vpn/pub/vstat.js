// LICENSE_CODE ZON
'use strict'; 
(function(){
var E = {player: [], debug: false};
function pad(num, size){ return ('000000'+num).slice(-size); }
function to_sql_ms(d){
    return pad(d.getUTCFullYear(), 4)+'-'+pad(d.getUTCMonth()+1, 2)
    +'-'+pad(d.getUTCDate(), 2)
    +' '+pad(d.getUTCHours(), 2)+':'+pad(d.getUTCMinutes(), 2)
    +':'+pad(d.getUTCSeconds(), 2)
    +'.'+pad(d.getUTCMilliseconds(), 3);
}
var log = E.log = {
    debug: function(){
        return E.debug&&console.debug.apply(console, this.fix(arguments)); },
    info: function(){
        return E.debug&&console.info.apply(console, this.fix(arguments)); },
    notice: function(){
        return E.debug&&console.log.apply(console, this.fix(arguments)); },
    error: function(){
        return E.debug&&console.error.apply(console, this.fix(arguments)); },
    fix: function(a){
        a = Array.from(a);
        a[0] = to_sql_ms(new Date())+' vstat: '+a[0];
        return a;
    }
};
function send_msg_to_ext(msg){
    try {
        var B = window.chrome || typeof browser!='undefined' && browser;
        if (B && B.runtime && B.runtime.sendMessage)
            return void B.runtime.sendMessage(msg);
        self.port.emit('req', msg);
    } catch(err){ console.error('send_msg_to_ext failed '+err); }
}
var xid = 0;
function post_msg(opt){
    opt.id = 'vstat.'+opt.id;
    opt._type = 'be_vstat';
    opt.xid = xid++;
    send_msg_to_ext(opt);
}
var bext_perr = true;
function send_beacon(url, data){
    function to_form_data(o){
        var data = new FormData();
        for (var k in o)
            data.append(k, o[k]);
        return data;
    }
    if (bext_perr)
    {
        return void post_msg({id: 'send_beacon', url: url,
            data: data});
    }
    if (typeof navigator!='undefined' && navigator.sendBeacon)
    {
        data.send_type = 'BEACON';
        if (navigator.sendBeacon(url, to_form_data(data)))
            return;
        data.send_type = undefined;
        log.error('sendBeacon failed');
    }
    data.send_type = 'POST';
    var req = new XMLHttpRequest();
    req.open(url, 'POST');
    req.send(data);
}
function escape_qs(param, opt){
    opt = opt||{};
    var qs = opt.qs||'';
    var sep = qs || opt.amp ? '&' : '';
    if (!param)
        return qs;
    var uri_comp = encodeURIComponent;
    var uri_comp_val = uri_comp;
    for (var i in param)
    {
        var val = param[i];
        if (val===undefined)
            continue;
        var key = uri_comp(i);
        qs += sep;
        if (val===null)
            qs += key;
        else if (Array.isArray(val))
        {
            if (!val.length)
                continue;
            qs += val.map(function(val){ return key+'='+uri_comp_val(val); })
                .join('&');
        }
        else
            qs += key+'='+uri_comp_val(val);
        sep = '&';
    }
    return qs;
}
function crash(id, err){
    var opt = {id: 'perr', _type: 'ccgi', perr_id: 'vstat_crash_'+id,
        info: err};
    send_msg_to_ext(opt);
    if ((window.hola_vstat_conf||{}).debug)
        return console.error.apply(console, arguments);
}
var define2, is_node = typeof module=='object' && module.exports;
try {
if (is_node)
    define2 = require('../../../util/require_node.js').define(module, '../');
else
    define2 = window.define;
if (!define2)
{
    if (window.hola_vstat)
        return;
    define2 = function(name, dep, cb){
        if (typeof name=='object')
        {
            cb = dep;
            dep = name;
        }
        cb();
    };
}
} catch(err){ return void crash('main', err); }
define2([], function(){
try {
var guess_browser = function(ua){
    var check_hola = /\bhola_android\b/i;
    var check_android_cdn = /Android.* CDNService\/([0-9\.]+)$/;
    var check_ios_cdn = / CDNService\/([0-9\.]+)$/;
    var check_opera = /\bOPR\b\/(\d+)/i;
    var check_edge = /\bEdge\b\/(\d+)/i;
    var check_xbox = /\bxbox\b/i;
    var check_ucbrowser = /\bUCBrowser\b\/(\d+)/i;
    var check_webview = / Version\/(\d+)(\.\d)/;
    function ios_ua(ua, safari_ver){
        var res;
        if (res = /(?:iPhone|iPad|iPod|iPod touch);.*?OS ([\d._]+)/.exec(ua))
        {
            var ios_ver = res[1];
            return {browser: 'safari', version: safari_ver||ios_ver,
                ios: ios_ver, hola_ios: !is_node &&
                (window.hola_cdn_sdk || window.spark_ios_sdk) ||
                check_ios_cdn.test(ua)};
        }
        if (/HolaCDN iOS/.exec(ua))
            return {browser: 'safari', hola_ios: true};
    }
    function check_chromium(ua){
        if (check_webview.test(ua) || /Android/.test(ua) ||
            / Mobile /.test(ua) || check_opera.test(ua))
        {
            return false;
        }
        var group = '(?: (\\w*)\\/)?', ver = '\\/[\\d\\.]+';
        var res = new RegExp('AppleWebKit'+ver+'(?: \\(.*\\))?'+group+
            '.* Chrome'+ver+group+'.* Safari'+ver+group).exec(ua);
        return res && (res[1]||res[2]||res[3]);
    }
    var res;
    ua = ua || (is_node ? '' : window.navigator&&navigator.userAgent);
    if (res = /\bOpera Mini\/(\d+)/.exec(ua))
        return {browser: 'opera_mini', version: res[1]};
    var ucbrowser = check_ucbrowser.exec(ua);
    if (res = /[( ]MSIE ([6789]|10).\d[);]/.exec(ua))
        return {browser: 'ie', version: res[1], xbox: check_xbox.test(ua)};
    if (res = /[( ]Trident\/\d+(\.\d)+.*rv:(\d\d)(\.\d)+[);]/.exec(ua))
        return {browser: 'ie', version: res[2], xbox: check_xbox.test(ua)};
    if (res = / Chrome\/(\d+)(\.\d+)+.* Safari\/\d+(\.\d+)+/.exec(ua))
    {
        var opera = check_opera.exec(ua);
        var edge;
        if (edge = check_edge.exec(ua))
            return {browser: 'ie', version: edge[1]};
        return {browser: 'chrome', version: res[1],
            android: ua.match(/Android/),
            webview: ua.match(check_webview),
            hola_android: check_hola.test(ua),
            hola_app: check_android_cdn.test(ua),
            chromium_based: check_chromium(ua),
            opera: opera && !!opera[1],
            opera_version: opera ? opera[1] : undefined,
            ucbrowser: ucbrowser && !!ucbrowser[1],
            ucbrowser_version: ucbrowser ? ucbrowser[1] : undefined,
            webos_app: /Web0S/.test(ua)};
    }
    if (res = / QupZilla\/(\d+\.\d+\.\d+).* Safari\/\d+.\d+/.exec(ua))
        return {browser: 'qupzilla', version: res[1]};
    if (res = /\(PlayStation (\d+) (\d+\.\d+)\).* AppleWebKit\/\d+.\d+/
        .exec(ua))
    {
        return {browser: 'playstation'+res[1], version: res[2]};
    }
    if (res = / Version\/(\d+)(\.\d)+.* Safari\/\d+.\d+/.exec(ua))
    {
        if (!ua.match(/Android/))
            return ios_ua(ua, res[1])||{browser: 'safari', version: res[1]};
        return {browser: 'chrome', version: res[1], android: true,
            webview: true, hola_android: check_hola.test(ua),
            hola_app: check_android_cdn.test(ua),
            ucbrowser: ucbrowser && !!ucbrowser[1],
            ucbrowser_version: ucbrowser ? ucbrowser[1] : undefined};
    }
    if (res = / (Firefox|PaleMoon)\/(\d+).\d/.exec(ua))
    {
        return {browser: 'firefox', version: res[2],
            palemoon: res[1]=='PaleMoon'};
    }
    if (/Hola\/\d+\.\d+.*?(?:iPhone|iPad|iPod)/.exec(ua))
        return {browser: 'safari', version: 'Hola'};
    if (res = ios_ua(ua))
        return res;
    return {};
};
E.browser = guess_browser();
if (!is_node)
{
    window.hola_vstat = E;
    E.vstat_conf = window.hola_vstat_conf||{};
    E.customer = E.vstat_conf.customer||'hc_28b507ef';
    E.debug = !!E.vstat_conf.debug;
}
log.notice('hola_vstat loaded');
E.perr = function(player, opt){
    try {
        if (opt===undefined)
        {
            opt = player;
            player = undefined;
        }
        var hola_info = player&&player.stat&&player.stat.hola_info||{};
        var info = Object.assign({}, opt.info);
        info.hola_mode = hola_info.mode||'stats';
        info.zone = hola_info.zone||'vstat';
        info.customer = E.customer;
        info.frame = window.top!==window;
        info.url = info.location_url = location.href;
        info.referrer = document.referrer;
        info.player_info = 'html5/html5';
        info.video_url = hola_info.video_url||
            (player&&player.stat&&player.stat.video_url)||
            (player&&player.url());
        info.proxy_country = E.vstat_conf.country;
        E.perr_raw({id: 'www_cdn_db_vstat_'+opt.id, customer: E.customer,
            info: info, zone: opt.zone||info.zone||'vstat'});
    } catch(err){ log.error('error sending perr', err); }
};
var build = function(qs){
    var info = {platform: typeof navigator!='undefined'&&navigator.platform,
        user_agent: typeof navigator!='undefined'&&navigator.userAgent};
    Object.assign(info, qs);
    if (info.browser&&info.browser_ver)
        info.browser += ' '+info.browser_ver;
    delete info.browser_ver;
    info.browser_build = ((window.conf||{}).browser||{}).name;
    var s = '';
    for (var f in info)
        s += (s&&'\n')+f+': '+info[f];
    return s;
};
E.perr_raw = function(opt){
    var data = {}, qs = {};
    data.info = opt.info;
    data.bt = opt.bt;
    qs.ver = E.vstat_conf.ver;
    qs.browser = opt.browser || (E.browser.opera ? 'opera' :
        E.browser.ucbrowser ? 'ucbrowser' : E.browser.browser);
    qs.browser_ver = E.browser.opera ? E.browser.opera_version :
        E.browser.ucbrowser ? E.browser.ucbrowser_version : E.browser.version;
    data.build = build(qs);
    data.filehead = opt.filehead;
    qs.id = opt.id;
    qs.customer = opt.customer;
    qs.zone = opt.zone;
    if (typeof data.info=='object')
    {
        data.session_id = data.info.session_id;
        if (data.info.tag)
        {
            qs.tag_id = data.info.tag.id;
            qs.tag_date = +data.info.tag.date;
        }
        data.is_json = 1;
        data.info = JSON.stringify(data.info);
    }
    if (opt.return_data)
        return {data: data, qs: qs};
    var protocol = window&&window.location&&window.location.protocol;
    protocol = !protocol || !protocol.startsWith('http') ? 'http:' : protocol;
    var url = protocol+'//perr-vstat.h-cdn.com/be_client_cgi/perr?'
        +escape_qs(qs);
    return void send_beacon(url, data);
};
var inherits = function(ctor, superCtor){
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype,
        {constructor: {value: ctor, enumerable: false, writable: true,
        configurable: true}});
};
var EventEmitter = function(){ this._events = {}; };
EventEmitter.prototype.listeners = function listeners(event) {
    return Array.apply(this, this._events[event] || []);
};
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5){
  if (!this._events || !this._events[event]) return false;

  var listeners = this._events[event]
    , length = listeners.length
    , len = arguments.length
    , fn = listeners[0]
    , args
    , i;

  if (1 === length) {
    switch (len) {
      case 1:
        fn.call(fn.__EE3_context || this);
      break;
      case 2:
        fn.call(fn.__EE3_context || this, a1);
      break;
      case 3:
        fn.call(fn.__EE3_context || this, a1, a2);
      break;
      case 4:
        fn.call(fn.__EE3_context || this, a1, a2, a3);
      break;
      case 5:
        fn.call(fn.__EE3_context || this, a1, a2, a3, a4);
      break;
      case 6:
        fn.call(fn.__EE3_context || this, a1, a2, a3, a4, a5);
      break;

      default:
        for (i = 1, args = new Array(len -1); i < len; i++) {
          args[i - 1] = arguments[i];
        }

        fn.apply(fn.__EE3_context || this, args);
    }

    if (fn.__EE3_once) this.removeListener(event, fn);
  } else {
    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    for (i = 0; i < length; fn = listeners[++i]) {
      fn.apply(fn.__EE3_context || this, args);
      if (fn.__EE3_once) this.removeListener(event, fn);
    }
  }

  return true;
};
EventEmitter.prototype.on = function on(event, fn, context) {
  if (!this._events) this._events = {};
  if (!this._events[event]) this._events[event] = [];

  fn.__EE3_context = context;
  this._events[event].push(fn);

  return this;
};

EventEmitter.prototype.once = function once(event, fn, context) {
  fn.__EE3_once = true;
  return this.on(event, fn, context);
};

EventEmitter.prototype.removeListener = function removeListener(
    event, fn) {
  if (!this._events || !this._events[event]) return this;

  var listeners = this._events[event]
    , events = [];

  for (var i = 0, length = listeners.length; i < length; i++) {
    if (fn && listeners[i] !== fn) {
      events.push(listeners[i]);
    }
  }

  if (events.length) this._events[event] = events;
  else this._events[event] = null;

  return this;
};

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) this._events[event] = null;
  else this._events = {};

  return this;
};

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

EventEmitter.prototype.setMaxListeners =
    function setMaxListeners() {
  return this;
};
EventEmitter.EventEmitter = EventEmitter;
EventEmitter.EventEmitter2 = EventEmitter;
EventEmitter.EventEmitter3 = EventEmitter;

var monotonic = (function(){
    var adjust, last;
    if (typeof window=='object' && window.performance
        && window.performance.now)
    {
        adjust = Date.now()-window.performance.now();
        return function(){ return window.performance.now()+adjust; };
    }
    last = adjust = 0;
    return function(){
        var now = Date.now()+adjust;
        if (now>=last)
            return last = now;
        adjust += last-now;
        return last;
    };
})();
var html5 = {};
html5.Player = function(opt){
    var video = this.video = opt.video;
    var events = ['abort', 'canplay', 'durationchange', 'emptied',
        'ended', 'error', 'pause', 'play', 'loadstart', 'playing',
        'ratechange', 'seeked', 'seeking', 'volumechange', 'waiting'];
    this.cb = {};
    events.forEach(function(e){
        this.cb[e] = this.wrap(function(event){ this.emit(e, event); });
        video.addEventListener(e, this.cb[e]);
    }.bind(this));
    this.view_cbs = [];
};
inherits(html5.Player, EventEmitter);
html5.Player.prototype.uninit = function(){
    for (var e in this.cb)
        this.video.removeEventListener(e, this.cb[e]);
};
html5.Player.prototype.wrap = function(func){
    return function(){
        try {
            return func.apply(this, arguments);
        } catch(err){
            log.error('wrap error %o', err);
        }
    }.bind(this);
};
html5.Player.prototype.pos = function(){ return this.video.currentTime; };
html5.Player.prototype.duration = function(){ return this.video.duration; };
html5.Player.prototype.url = function(){ return this.video.currentSrc; };
html5.Player.prototype.paused = function(){ return this.video.paused; };
html5.Player.prototype.decoded_frames = function(){
    return this.video.webkitDecodedFrameCount||this.video.mozDecodedFrames||0;
};
html5.Player.prototype.buffered = function(){ return this.video.buffered; };
html5.Player.prototype.buffer = function(){
    var buffered = this.buffered(), pos = this.pos();
    for (var i=0; i<buffered.length; i++)
    {
        if (pos>=buffered.start(i) && pos<buffered.end(i))
            return {pos: pos, from: buffered.start(i), to: buffered.end(i)};
    }
    return {pos: pos, from: pos, to: pos};
};
html5.Player.prototype.buffer_sec = function(){
    var buf = this.buffer();
    return buf.to-buf.pos;
};
html5.Player.prototype.perr = function(opt){ return E.perr(this, opt); };
var get_view_cb_id = function(id){
    var m1 = id.match(/^view_([0-9]+)sec$/);
    var m2 = id.match(/^view_last_([0-9]+)sec$/);
    var m3 = id.match(/^view_every_([0-9]+)sec$/);
    var sec = m1 && +m1[1] || m2 && +m2[1] || m3 && +m3[1];
    var s = m1 ? 'v'+sec : m2 ? 'l'+sec : m3 ? 'e'+sec : '';
    return s;
};
html5.Player.prototype.once = function(id, cb){
    var s = get_view_cb_id(id);
    if (s && !this.view_cbs.find(function(c){ return c.id==s && c.cb==cb;}))
        this.view_cbs.push({id: s, cb: cb});
    return html5.Player.super_.prototype.once.call(this, id, cb);
};
html5.Player.prototype.off = function(id, cb){
    var s = get_view_cb_id(id), e;
    if (s && (e=this.view_cbs.find(function(c){ return c.id==s && c.cb==cb;})))
        this.view_cbs.splice(this.view_cbs.indexOf(e), 1);
    return html5.Player.super_.prototype.off.call(this, id, cb);
};
html5.Player.prototype.on = function(id, cb){
    var s = get_view_cb_id(id);
    if (s && !this.view_cbs.find(function(c){ return c.id==s && c.cb==cb;}))
        this.view_cbs.push({id: s, cb: cb});
    return html5.Player.super_.prototype.on.call(this, id, cb);
};
html5.Player.prototype.monitor_playback = function(view, dur){
    this.view_cbs.forEach(function(e, i){
        var sec = e.id;
        var type = sec[0];
        sec = +sec.substring(1);
        if (type=='l' && dur && dur-view.pos <= sec)
        {
            this.view_cbs[i] = 'del';
            this.emit('view_last_'+sec+'sec');
        }
        else if (type=='v' && view.sec>=sec)
        {
            this.view_cbs[i] = 'del';
            this.emit('view_'+sec+'sec');
        }
        else if (type=='e' && view.pos-view.every >= sec-1 &&
            !(Math.round(view.pos)%sec))
        {
            view.every = view.pos;
            this.emit('view_every_'+sec+'sec');
        }
    }, this);
    this.view_cbs = this.view_cbs.filter(function(s){ return s!='del'; });
};
var Timeline = function(opt){
    this.last = monotonic();
    this.arr = [];
};
E.Timeline = Timeline;
Timeline.prototype.push = function(name, params){
    var now = monotonic(), diff = now - this.last;
    this.last = now;
    var o = Object.assign({}, {name: name, ts: now, elapsed: diff}, params);
    this.arr.push(o);
};
var Stat = function(opt){
    this.player = opt.player;
    this.video_url = this.player.url();
    this.timeline = new Timeline();
    this.cb = {};
    this.cb.play = function(){
        this.push('play');
        this.set_playing_poll(this.player.pos());
    }.bind(this);
    this.cb.pause = function(){
        this.push('pause');
        this.clr_playing_poll();
    }.bind(this);
    this.cb.canplay = function(){
        this.push('canplay');
        this.check_playing();
    }.bind(this);
    this.cb.playing = function(){ this.check_playing(); }.bind(this);
    this.cb.waiting = function(){ this.push('waiting'); }.bind(this);
    this.cb.seeking = function(pos, seek_pos){
        this.push('seeking');
        this.view.every = seek_pos;
    }.bind(this);
    this.cb.seeked = function(){ this.push('seeked'); }.bind(this);
    this.cb.durationchange = function(){ this.push('duration'); }.bind(this);
    this.player.on('play', this.cb.play);
    this.player.on('pause', this.cb.pause);
    this.player.on('canplay', this.cb.canplay);
    this.player.on('playing', this.cb.playing);
    this.player.on('waiting', this.cb.waiting);
    this.player.on('seeking', this.cb.seeking);
    this.player.on('seeked', this.cb.seeked);
    this.player.on('durationchange', this.cb.durationchange);
    this.view = {sec: 0};
    this.interval_200ms = setInterval(function(){
        var pos = this.player.pos();
        var view = this.view;
        if (isFinite(view.pos)&&isFinite(pos))
        {
            if (this.view.every==undefined)
                this.view.every = pos;
            var d = pos-view.pos;
            if (d>0 && d<2) 
                view.sec+=d;
        }
        view.pos = pos;
        this.player.monitor_playback(view, this.player.duration());
    }.bind(this), 200);
    this.push(opt.event||'new', {url: this.player.url()});
    if (!this.player.paused())
        this.set_playing_poll(this.player.pos());
    log.notice('stats attached');
};
E.Stat = Stat;
Stat.prototype.uninit = function(opt){
    this.push(opt.event||'uninit', {url: this.player.url()});
    log.notice('stats detached %o', this);
    this.interval_200ms = clearInterval(this.interval_200ms);
    for (var e in this.cb)
        this.player.off(e, this.cb[e]);
};
Stat.prototype.stat_inc = function(e, opt){
    if (!bext_perr || this.error)
        return;
    opt = opt||{};
    var data = {customer: E.customer, country: E.vstat_conf.country};
    switch (e)
    {
    case 'waiting':
        if (!this.wait_sent)
            data.wait_unique_n = 1;
        data.wait_n = 1;
        this.wait_sent = true;
        break;
    case 'wait':
        data.wait_ms = opt.ms;
        break;
    case 'detect_midstart':
    case 'play':
        data.start_n = 1;
        break;
    case 'midstart':
    case 'start':
        data.start_ms = opt.ms;
        data.start_play_n = 1;
        break;
    default: return;
    }
    post_msg({id: 'send_event', data: data});
};

Stat.prototype.push = function(e, opt){
    this.timeline.push(e, Object.assign({pos: this.player.pos(),
        buf_sec: this.player.buffer_sec(), duration: this.player.duration(),
        paused: this.player.paused(),
        frames: this.player.decoded_frames()}, opt));
    if (E.vstat_conf.disable_events)
        return;
    var ts = Date.now();
    try {
        switch (e)
        {
        case 'loadstart':
        case 'detect':
            this.init_ts = ts;
            if (!(this.paused = this.player.paused()))
            {
                this.play_ts = ts;
                if (this.midstart = e=='detect')
                    this.stat_inc('detect_midstart', {n: 1});
            }
            break;
        case 'ended':
        case 'unload':
        case 'emptied':
        case 'abort':
        case 'error':
        case 'unexpected':
            if (this.ended)
                throw new Error('final event not last');
            this.stat_inc(e, {n: 1});
            this.ended = true;
            break;
        case 'play':
            if (!this.paused)
                break;
            this.paused = false;
            this.play_ts = ts;
            if (!this.start_ts)
                this.stat_inc(e, {n: 1});
            break;
        case 'pause':
            if (this.paused)
                break;
            this.paused = true;
            this.play_ts = undefined;
            break;
        case 'playing':
            if (this.paused)
                throw new Error('playing in paused');
            if (!this.start_ts)
            {
                this.start_ts = ts;
                this.stat_inc(this.midstart ? 'midstart' : 'start',
                    {ms: ts-this.play_ts});
            }
            else
                this.stat_inc('resume', {ms: ts-this.play_ts, n: 1});
            this.play_ts = undefined;
            break;
        case 'waiting':
            if (!this.start_ts || this.wait_ts || this.seeking_ts)
                break;
            this.stat_inc(e, {n: 1});
            this.wait_ts = ts;
            break;
        case 'canplay':
            if (!this.wait_ts)
                break;
            this.stat_inc('wait', {ms: ts-this.wait_ts, n: 1});
            this.wait_ts = undefined;
            break;
        case 'seeking':
            if (this.wait_ts)
            {
                this.stat_inc('wait', {ms: ts-this.wait_ts, n: 1,
                    cancel: true});
                this.wait_ts = undefined;
            }
            if (this.seeking_ts)
            {
                this.stat_inc('seek', {ms: ts-this.seeking_ts, n: 1,
                    cancel: true});
            }
            this.seeking_ts = ts;
            break;
        case 'seeked':
            if (!this.seeking_ts) 
                throw new Error('seeked without seeking');
            this.stat_inc('seek', {ms: ts-this.seeking_ts, n: 1});
            this.seeking_ts = undefined;
            break;
        }
    } catch(err){
        this.error = ''+(err.message||'unknown');
        log.notice('*** error %s\n', this.error, err);
    }
};
Stat.prototype.check_playing = function(){
    try {
    if (!this.playing||this.player.paused())
        return this.clr_playing_poll();
    if (this.player.pos()>this.playing.pos)
    {
        this.push('playing');
        this.clr_playing_poll();
        return;
    }
    } catch(err){ crash('checking_playing', err); }
};
Stat.prototype.set_playing_poll = function(pos){
    if (this.playing)
    {
        this.playing.pos = pos;
        return;
    }
    this.playing = {pos: pos};
    this.playing.interval = setInterval(this.check_playing.bind(this), 50);
};
Stat.prototype.clr_playing_poll = function(){
    if (!this.playing)
        return;
    clearInterval(this.playing.interval);
    this.playing = undefined;
};
Stat.prototype.get = function(opt){
    opt = opt||{};
    var other = {view_sec: (this.view||{}).sec};
    return {timeline_arr: Object.assign([], this.timeline.arr), other: other};
};
var video_to_player = function(video){
    for (var i=0; i<E.player.length; i++)
    {
        if (E.player[i].video==video)
            return E.player[i];
    }
    return null;
};
var on_report = function(player, rule){
    if (!player.stat)
        return;
    var id = 'report_'+rule.on, info = {stat: player.stat.get()};
    player.perr({id: id, info: info});
    player.stat.push(id);
};
var attach_stat = function(player, e){
    detach_stat(player, 'unexpected');
    player.perr({id: 'attach'});
    player.stat = new Stat({player: player, event: e});
    (E.vstat_conf.report||[]).forEach(function(r){
        player.on(r.on, on_report.bind(null, player, r)); });
    var debug_progress;
    if (!(debug_progress = E.vstat_conf.debug_progress))
        return;
    player.on('view_every_'+debug_progress+'sec', function(){
        post_msg({id: 'send_progress', progress: debug_progress}); });
};
var detach_stat = function(player, e){
    if (!player.stat)
        return;
    player.stat.uninit({event: e});
    (E.vstat_conf.report||[]).forEach(function(r){ player.off(r.on); });
    if (E.vstat_conf.debug_progress)
        player.off('view_every_'+E.vstat_conf.debug_progress+'sec');
    player.view_cbs = [];
    var info = {stat: player.stat.get()};
    log.notice('sending stat %o', info);
    player.perr({id: 'report', info: info});
    player.stat = undefined;
    player.perr({id: 'detach'});
};
var detect_video = function(){
    var a = document.querySelectorAll('video');
    for (var i = 0; i < a.length; i++)
    {
        var v = a[i];
        if (v.vstat_inited)
            continue;
        v.vstat_inited = true;
        if (video_to_player(v))
            continue;
        var player = new html5.Player({video: v});
        log.notice('new player found %o', player);
        E.player.push(player);
        player.on('loadstart', function(){
            try { attach_stat(player, 'loadstart'); }
            catch(err){ crash('player_on_loadstart', err); }
        });
        player.on('emptied', function(){
            try { detach_stat(player, 'emptied'); }
            catch(err){ crash('player_on_emptied', err); }
        });
        player.on('abort', function(){
            try { detach_stat(player, 'abort'); }
            catch(err){ crash('player_on_abort', err); }
        });
        player.on('error', function(){
            try { detach_stat(player, 'error'); }
            catch(err){ crash('player_on_error', err); }
        });
        player.on('ended', function(){
            try { detach_stat(player, 'ended'); }
            catch(err){ crash('player_on_ended', err); }
        });
        window.addEventListener('beforeunload', function(){
            try { detach_stat(player, 'unload'); }
            catch(err){ crash('beforeunload', err); }
        });
        attach_stat(player, 'detect');
    }
};
E._is_mocha = undefined;
E.is_mocha = function(){
    if (E._is_mocha!==undefined)
        return E._is_mocha;
    if (typeof process!='undefined')
        return E._is_mocha = process.env.IS_MOCHA||false;
    return E._is_mocha = false;
};
E.init = function(){
    if (is_node||E.is_mocha())
        return;
    E.perr({id: 'init'});
    window.addEventListener('beforeunload', function(){
        E.perr({id: 'unload'}); });
    if (window.MutationObserver && document.documentElement)
    {
        new MutationObserver(detect_video)
        .observe(document.documentElement, {childList: true, subtree: true});
    }
    detect_video();
};
E.init();
return E;
} catch(err){ crash('define2', err); }
});
})();
