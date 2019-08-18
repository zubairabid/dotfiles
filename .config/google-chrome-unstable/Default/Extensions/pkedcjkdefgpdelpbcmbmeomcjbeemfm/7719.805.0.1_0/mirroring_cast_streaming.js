'use strict';var nda={TAB:0,Hk:1,Ko:2},Ew=function(){return new sb("MediaRouter.CastStreaming.Session.Launch")},Fw=function(){return new zb("MediaRouter.CastStreaming.Session.Length")},Gw=function(a){Db("MediaRouter.CastStreaming.Start.Success",a,nda)};var Hw=hb("mr.mirror.cast.LogUploader"),Jw=function(a,c,b){Iw("raw_events.log.gz",a,c,b);return c?"https://crash.corp.google.com/samples?reportid=&q="+encodeURIComponent("UserComments='"+c+"'"):""},Iw=function(a,c,b,d){if(0==c.size)Hw.info("Trying to upload an empty file to Crash"),d&&d(null);else{var e=new FormData;e.append("prod","Cast");e.append("ver",chrome.runtime.getManifest().version);e.append(a,c);b&&e.append("comments",b);kv("https://clients2.google.com/cr/report",function(f){f=f.target;
var g=null;sv(f)?(g=tv(f),Hw.info("Upload to Crash succeeded: "+g)):Hw.info("Upload to Crash failed. HTTP status: "+f.Ya());d&&d(g)},"POST",e,void 0,3E4)}};var Kw=function(){this.b=0;hm(this)},Mw=function(){Lw||(Lw=new Kw);return Lw},oda=function(){var a=Mw(),c={fraction:.01,autoSubmitTimeLimitMillis:6048E5},b=c.autoSubmitTimeLimitMillis,d=Date.now();return a.b&&b&&d-a.b<b?!1:Math.random()<c.fraction};Kw.prototype.Fa=function(){return"mirror.cast.LogUtils"};Kw.prototype.rb=function(){return[void 0,{lastAutoSubmitMillis:this.b}]};Kw.prototype.pb=function(){var a=fm(this);this.b=a&&a.lastAutoSubmitMillis||0};var Lw=null;hb("mr.mirror.cast.LogUtils");var Nw={hy:"OFFER",fu:"ANSWER",Ky:"PRESENTATION",Uv:"GET_STATUS",Wz:"STATUS_RESPONSE",Tv:"GET_CAPABILITIES",Du:"CAPABILITIES_RESPONSE",xz:"RPC"};var pda=function(){this.capabilities=this.status=this.b=this.error=this.rpc=this.result=this.type=this.f=this.sessionId=null},rda=function(a){try{if("string"!==typeof a)throw SyntaxError("Cannot parse non-string as JSON");var c;Ow(JSON.parse(a),function(d){c=qda(d)},function(){throw Error("non-Object result from JSON parse");});return c}catch(d){var b=d instanceof SyntaxError?"JSON parse error: "+d.message:"Type coercion error: "+d.message}"string"==typeof a?a="a string: "+a:a instanceof ArrayBuffer?
(a=new Uint8Array(a),a="an ArrayBuffer whose base64 is "+btoa(String.fromCharCode.apply(null,a))):a="of invalid data type "+typeof a;throw Error(b+". Input was "+a);},qda=function(a){var c=new pda;null!=a.sessionId&&(c.sessionId=String(a.sessionId));Pw(a.seqNum,function(f){c.f=f},function(){throw Error('"seqNum" must be a number');});if("type"in a){for(var b=String(a.type).toUpperCase(),d=l(Object.keys(Nw)),e=d.next();!e.done;e=d.next())if(Nw[e.value]==b){c.type=b;break}if(!c.type)throw Error('not a known message "type"');
}"result"in a&&(c.result=String(a.result));if("rpc"in a){if("string"!==typeof a.rpc)throw Error('"rpc" must be a String containing a base64 payload');c.rpc=new Uint8Array([].concat(n(atob(a.rpc))).map(function(f){return f.charCodeAt(0)}))}Ow(a.error,function(f){c.error=sda(f)},function(){throw Error('"error" must be an Object');});Ow(a.answer,function(f){c.b=tda(f)},function(){throw Error('"answer" must be an Object');});Ow(a.status,function(f){c.status=uda(f)},function(){throw Error('"status" must be an Object');
});Ow(a.capabilities,function(f){c.capabilities=vda(f)},function(){throw Error('"capabilities" must be an Object');});return c},Ow=function(a,c,b){void 0!==a&&(a instanceof Object?c(a):b())},Pw=function(a,c,b){void 0!==a&&("number"!==typeof a?b():c(a))},Qw=function(a,c,b){void 0!==a&&(a instanceof Array&&a.every(function(d){return"number"===typeof d})?c(a):b())},Rw=function(a,c,b){void 0!==a&&(a instanceof Array?c(a.map(function(d){return String(d)})):b())},wda=function(){this.j=null;this.b=[];this.f=
[];this.g=this.h=this.w=null},tda=function(a){var c=new wda;Pw(a.udpPort,function(b){c.j=b},function(){throw Error('"answer.udpPort" must be a number');});Qw(a.sendIndexes,function(b){c.b=b},function(){throw Error('"answer.sendIndexes" must be an array of numbers');});Qw(a.ssrcs,function(b){c.f=b},function(){throw Error('"answer.ssrcs" must be an array of numbers');});"IV"in a&&(c.w=String(a.IV));"receiverGetStatus"in a&&(c.h="true"==String(a.receiverGetStatus).toLowerCase());"castMode"in a&&(c.g=
String(a.castMode));return c},xda=function(){this.details=this.description=this.code=null},sda=function(a){var c=new xda;Pw(a.code,function(b){c.code=b},function(){throw Error('"error.code" must be a number');});"description"in a&&(c.description=String(a.description));Ow(a.details,function(b){c.details=b},function(){throw Error('"error.details" must be an Object');});return c},yda=function(){this.f=this.b=null},uda=function(a){var c=new yda;Pw(a.wifiSnr,function(b){c.b=b},function(){throw Error('"status.wifiSnr" must be a number');
});Qw(a.wifiSpeed,function(b){c.f=b},function(){throw Error('"status.wifiSpeed" must be an array of numbers');});return c},zda=function(){this.f=this.b=null},vda=function(a){var c=new zda;Rw(a.mediaCaps,function(b){c.b=b},function(){throw Error('"capabilities.mediaCaps" must be an array');});if("keySystems"in a){a=a.keySystems;if(!(a instanceof Array))throw Error('"capabilities.keySystems" must be an array');c.f=a.map(function(b){var d;Ow(b,function(e){d=Ada(e)},function(){throw Error('"capabilities.keySystems" entries must be *Objects');
});return d})}return c},Bda=function(){this.g=this.l=this.w=this.j=this.u=this.b=this.o=this.f=this.initDataTypes=this.h=null},Ada=function(a){var c=new Bda;"keySystemName"in a&&(c.h=String(a.keySystemName));Rw(a.initDataTypes,function(b){c.initDataTypes=b},function(){throw Error('"capabilities.initDataTypes" must be an array');});Rw(a.codecs,function(b){c.f=b},function(){throw Error('"capabilities.codecs" must be an array');});Rw(a.secureCodecs,function(b){c.o=b},function(){throw Error('"capabilities.secureCodecs" must be an array');
});Rw(a.audioRobustness,function(b){c.b=b},function(){throw Error('"capabilities.audioRobustness" must be an array');});Rw(a.videoRobustness,function(b){c.u=b},function(){throw Error('"capabilities.videoRobustness" must be an array');});"persistentLicenseSessionSupport"in a&&(c.j=String(a.persistentLicenseSessionSupport));"persistentReleaseMessageSessionSupport"in a&&(c.w=String(a.persistentReleaseMessageSessionSupport));"persistentStateSupport"in a&&(c.l=String(a.persistentStateSupport));"distinctiveIdentifierSupport"in
a&&(c.g=String(a.distinctiveIdentifierSupport));return c};var Sw=function(a){this.m=hb("mr.mirror.cast.MessageDispatcher");this.h=a;this.b=null;this.f=new Map;this.g=0};Sw.prototype.subscribe=function(a,c){if(this.f.has(a))throw Error("Attempt to multiple-subscribe to the same response type: "+a);this.f.set(a,c);this.g=0;ob(this.m,"Added subscriber for "+a+"-type messages.");this.b||(this.b=Xv(this.h),this.b.onMessage=this.j.bind(this))};
var Tw=function(a,c){a.f.delete(c)&&ob(a.m,function(){return"Removed subscriber of "+c+"-type messages."});0==a.f.size&&a.b&&(a.b.fb(),a.b=null)};Sw.prototype.sendMessage=function(a){return this.b?"RPC"==a.type?this.b.sendMessage(a,{namespace:"urn:x-cast:com.google.cast.remoting"}):this.b.sendMessage(a,{namespace:"urn:x-cast:com.google.cast.webrtc"}):Promise.reject(Error("Require at least one subscriber before sending messages."))};
var Uw=function(a,c,b,d,e){var f=null,g=function(){Tw(a,b);null!=f&&(clearTimeout(f),f=null)};try{a.subscribe(b,function(k){e(k)&&g()})}catch(k){e(null,k);return}f=setTimeout(function(){g();e(null,Error("timeout"))},d);a.sendMessage(c).catch(function(k){g();e(null,k)})};
Sw.prototype.j=function(a){if(a&&"string"===typeof a.namespace_&&a.namespace_.startsWith("urn:x-cast:com.google.cast.")){do{var c=void 0;try{c=rda(a.data)}catch(d){c=d.message;break}if(c.type){var b=this.f.get(c.type);if(b)try{b(c);return}catch(d){c="Error thrown during delivery. Response was: "+(JSON.stringify(c)+". Error from subscriber callback was: ")+(d.message+".")}else c="Message was ignored: "+JSON.stringify(c)}else c="Message did not include response type: "+JSON.stringify(c)}while(0);10>
this.g?this.m.H(c):ob(this.m,c);++this.g}};var Vw=function(){this.b=Promise.resolve(1)},Xw=function(a,c,b){return Ww(a,function(d){return d==c},b)},Cda=function(a,c){var b=[3,4];return Ww(a,function(d){return-1!=b.indexOf(d)},c)},Yw=function(a,c){a.b=a.b.catch(function(){return 1});return Ww(a,function(){return!0},c)},Ww=function(a,c,b){var d,e,f=new Promise(function(g,k){d=g;e=k});a.b=a.b.then(function(g){if(!c(g))return e(Error("Operation requires a different starting checkpoint than "+g)),Promise.resolve(g);var k=new Dda(g);try{var m=b(k)}catch(p){m=
Promise.reject(p)}return m.then(function(p){return d(p)},function(p){return e(p)}).then(function(){if(null===k.b)throw Error("A prior operation that started at "+(g+" did not complete."));return k.b})},function(g){e(g);throw g;});return f},Dda=function(a){this.f=a;this.b=null},Zw=function(a,c){a.b="number"===typeof c?c:a.f};var $w=chrome.cast.streaming,bx=function(a,c,b,d,e){this.J=a.sessionId;this.u=a.jg;this.N=a.ne;this.g=c;this.G=b;this.K=d;this.T=ax(e,"onAnswer",this.u);this.V=ax(e,"onSessionStop",this.u);this.m=hb("mr.mirror.cast.StreamingLaunchWorkflow");this.D=new Vw;this.l=this.C=this.o=this.f=this.b=this.w=this.j=this.h=null};
bx.prototype.start=function(a,c,b){var d=this;if(!a&&!c)return Promise.reject(Error("No tracks to stream"));var e=a instanceof cx,f=c instanceof cx;(e&&c&&!f||f&&a&&!e)&&Ib("Mixing remoting and non-remoting tracks");return Xw(this.D,1,function(g){d.h=a;d.j=c;d.w=b;d.m.info(function(){return"Launching streaming for "+dx(d)+" to a "+(d.N+".")});return Eda(d).then(d.F.bind(d)).then(function(k){return Fda(d,k).then(function(m){d.T();var p=Gda(d,m,k);d.b=ex(d,d.b,p);d.f=ex(d,d.f,p);if(!d.b&&!d.f)throw Error("Receiver did not select any offers from: "+
JSON.stringify(k));d.C=!!m.h;d.l=function(u,A){u==d.b?d.w.jf("Audio stream (id="+u+") error: "+A):u==d.f&&d.w.jf("Video stream (id="+u+") error: "+A)};$w.rtpStream.onError.addListener(d.l);return Hda(d,m,p)})}).then(function(){d.m.info(function(){return"Launched streaming for "+dx(d)});d.w.Bg(d);Zw(g,2);return{Zp:d.b,Ot:d.f}})})};
bx.prototype.stop=function(){var a=this;return Yw(this.D,function(c){if(!a.h&&!a.j)return Zw(c,1),Promise.resolve();a.m.info(function(){return"Stopping streaming for "+dx(a)+"."});a.l&&($w.rtpStream.onError.removeListener(a.l),a.l=null);if(a.w){var b=a.w.lh();a.w=null}else b=Promise.resolve();return b.then(function(){a.b&&($w.rtpStream.stop(a.b),$w.rtpStream.destroy(a.b),a.b=null);a.f&&($w.rtpStream.stop(a.f),$w.rtpStream.destroy(a.f),a.f=null);a.o&&($w.udpTransport.destroy(a.o),a.o=null);a.V();a.m.info(function(){return"Stopped streaming for "+
dx(a)+"."});a.h=null;a.j=null;Zw(c,1)})})};
var Ida=function(a,c){var b=JSON.stringify(c);return Promise.all([a.b&&new Promise(function(d){return $w.rtpStream.getRawEvents(a.b,b,d)}),a.f&&new Promise(function(d){return $w.rtpStream.getRawEvents(a.f,b,d)})]).catch(function(d){a.m.error("Unexpected error when calling getRawEvents()",d);return[]}).then(function(d){return new Blob(d.filter(function(e){return!!e}),{type:"application/gzip"})})},Jda=function(a){return Promise.all([a.b&&new Promise(function(c){return $w.rtpStream.getStats(a.b,c)}),
a.f&&new Promise(function(c){return $w.rtpStream.getStats(a.f,c)})]).catch(function(c){a.m.error("Unexpected error when calling getStats()",c);return[]}).then(function(c){return Object.assign.apply(Object,[{}].concat(n(c.filter(function(b){return!!b}))))})},dx=function(a){if(a.h&&a.j)var c="audio+video ";else if(a.h)c="audio-only ";else if(a.j)c="video-only ";else return"stopped";return a.h instanceof cx||a.j instanceof cx?c+"remoting":c+"streaming"},Eda=function(a){return new Promise(function(c){var b=
function(d,e,f){d&&!a.h&&($w.rtpStream.destroy(d),d=null);e&&!a.j&&($w.rtpStream.destroy(e),e=null);a.m.info(function(){return"Created Cast Streaming session: audioStreamId="+d+", videoStreamId="+e+"."});a.b=d;a.f=e;a.o=f;c()};a.h instanceof cx||a.j instanceof cx?$w.session.create(null,null,b):$w.session.create(a.h,a.j,b)})};
bx.prototype.F=function(){for(var a=Tj(),c=Tj(),b=[],d=l([this.b,this.f]),e=d.next();!e.done;e=d.next())if(e=e.value)for(var f=e==this.b,g=f?127:96,k=f?Math.floor(499999*Math.random())+1:Math.floor(499999*Math.random())+500001,m=f?48E3:9E4,p=l($w.rtpStream.getSupportedParams(e)),u=p.next();!u.done;u=p.next())u=u.value,u.payload.payloadType=g,u.payload.maxLatency=this.g.maxLatencyMillis,u.payload.minLatency=this.g.minLatencyMillis,u.payload.animatedLatency=this.g.animatedLatencyMillis,u.payload.ssrc=
k,u.payload.clockRate=m,u.payload.aesKey=a,u.payload.aesIvMask=c,f?(u.payload.channels=2,u.payload.maxBitrate=this.g.audioBitrate,u.payload.maxFrameRate=100):(u.payload.minBitrate=this.g.minVideoBitrate,u.payload.maxBitrate=this.g.maxVideoBitrate,u.payload.maxFrameRate=this.g.maxFrameRate),b.push(new Kda(e,u));return b};
var ex=function(a,c,b){c&&!b.some(function(d){return d.mg==c})&&(a.m.H("Destroying RTP stream not selected by the receiver: id="+c),$w.rtpStream.destroy(c),c=null);return c},Fda=function(a,c){return new Promise(function(b,d){for(var e=[],f=0;f<c.length;++f){var g=c[f].params,k={index:f,codecName:g.payload.codecName.toLowerCase(),rtpProfile:"cast",rtpPayloadType:g.payload.payloadType,ssrc:g.payload.ssrc,targetDelay:g.payload.animatedLatency,aesKey:g.payload.aesKey,aesIvMask:g.payload.aesIvMask,timeBase:"1/"+
g.payload.clockRate,receiverRtcpEventLog:a.g.enableLogging,rtpExtensions:["adaptive_playout_delay"]};a.g.dscpEnabled&&(k.receiverRtcpDscp=46);127==g.payload.payloadType?Object.assign(k,{type:"audio_source",bitRate:0<g.payload.maxBitrate?1E3*g.payload.maxBitrate:60*g.payload.maxFrameRate+g.payload.clockRate*g.payload.channels,sampleRate:g.payload.clockRate,channels:g.payload.channels}):Object.assign(k,{type:"video_source",renderMode:"video",maxFrameRate:Math.round(1E3*g.payload.maxFrameRate)+"/1000",
maxBitRate:1E3*g.payload.maxBitrate,resolutions:[{width:a.g.maxWidth,height:a.g.maxHeight}]});e.push(k)}var m=a.h instanceof cx||a.j instanceof cx?"remoting":"mirroring",p={type:"OFFER",sessionId:a.J,seqNum:wn(a.G),offer:{castMode:m,receiverGetStatus:!0,supportedStreams:e}};a.m.info(function(){return"Sending OFFER message: "+JSON.stringify(p)});Uw(a.K,p,"ANSWER",1E4,function(u,A){if(null==u)d(A);else if("ok"==u.result&&u.b){if(u.f!=p.seqNum)return a.m.H("Ignoring ANSWER for OFFER with different seqNum: "+
JSON.stringify(u)),!1;((A=u.b.g)&&A!=m||!A&&"mirroring"!=m)&&a.m.error("Expected receiver to ANSWER with castMode="+m+", but got: "+A);ob(a.m,function(){return"Received ANSWER: "+JSON.stringify(u)});b(u.b)}else d(Error("Non-OK ANSWER received: "+JSON.stringify(u)));return!0})})},Gda=function(a,c,b){if(c.b.length!=c.f.length)return a.m.error("sendIndexes.length != ssrcs.length in ANSWER: "+JSON.stringify(c)),[];for(var d=[],e={},f=0;f<c.b.length;e={rf:e.rf},++f){var g=c.b[f];if(0>g||g>=b.length)return a.m.error("Receiver selected invalid index ("+
g+" < "+b.length+") in ANSWER: "+JSON.stringify(c)),[];e.rf=b[g];if(d.some(function(k){return function(m){return m.mg==k.rf.mg}}(e)))return a.m.error("Receiver selected same RTP stream twice in ANSWER: "+JSON.stringify(c)),[];e.rf.params.payload.feedbackSsrc=c.f[g];if(d.some(function(k){return function(m){return m.params.payload.feedbackSsrc==k.rf.params.payload.feedbackSsrc}}(e)))return a.m.error("Receiver provided same SSRC for two different RTP streams in ANSWER: "+JSON.stringify(c)),[];d.push(e.rf)}return d},
Hda=function(a,c,b){var d=null,e=function(){d&&($w.rtpStream.onStarted.removeListener(d),d=null)};return(new Promise(function(f,g){var k=c.j||2344;a.m.info(function(){return"Starting RTP streams to receiver at "+(a.u+":"+k)+(" for selected offers: "+JSON.stringify(b))});var m=a.o||-1;a.g.dscpEnabled&&(a.m.info("Enabled DSCP in sender."),$w.udpTransport.setOptions(m,{DSCP:!0}));$w.udpTransport.setDestination(m,{address:a.u,port:k});var p=new Set(b.map(function(A){return A.mg}));d=function(A){p.delete(A);
0==p.size&&f()};$w.rtpStream.onStarted.addListener(d);m=l(b);for(var u=m.next();!u.done;u=m.next())u=u.value,$w.rtpStream.toggleLogging(u.mg,a.g.enableLogging),$w.rtpStream.start(u.mg,u.params);setTimeout(function(){g(Error("Timeout: RTP streams failed to start."))},1E4)})).then(e).catch(function(f){e();throw f;})},ax=function(a,c,b){var d=this;return a&&c in a?function(){try{a[c](b)}catch(e){d.m.error("Error from testHooks."+c,e)}}:function(){}},Kda=function(a,c){this.mg=a;this.params=c},cx=function(){};var fx=function(a,c,b,d,e,f){this.l=a;this.K=Lda(c,this.l.wb);this.G=new bx(this.l.wb,b,d,e,f);this.C=e;this.j=new Vw;this.g=new Mda;this.D=new mojo.Binding(mojo.MirrorServiceRemoter,this,null);this.m=hb("mr.mirror.cast.MediaRemoter");this.u=this.b=this.w=this.h=this.F=null;this.f=!0;this.o=this.J.bind(this)};
fx.prototype.initialize=function(a,c){var b=this;return Xw(this.j,1,function(d){b.F=a;b.h=c;var e=b.D.createInterfacePtrAndBind();b.D.setConnectionErrorHandler(function(){b.m.info("Remoter mojo pipe connection error.");gx(b)});b.b=new mojo.MirrorServiceRemotingSourcePtr;var f=lj(b.l.mediaSource||"");if(!f)throw Error("Failed to parse tab ID from source:\n          "+b.l.mediaSource);b.m.info("Connecting remoter to browser: tabId="+f);(Ui.get("mr.ProviderManager")||null).onMediaRemoterCreated(f,e,
mojo.makeRequest(b.b));b.b.ptr.setConnectionErrorHandler(function(){b.m.info("RemotingSource mojo pipe connection error.");gx(b)});return Nda(b).then(function(){if(b.f)b.b.onSinkAvailable(b.K);Zw(d,2)})})};
var gx=function(a){return Yw(a.j,function(c){a.b&&(a.b.ptr.reset(),a.b=null);var b=a.w;a.w=null;a.h=null;a.F=null;a.D.close();chrome.settingsPrivate.onPrefsChanged.hasListener(a.o)&&chrome.settingsPrivate.onPrefsChanged.removeListener(a.o);return new Promise(function(d){window.setTimeout(function(){hx(a).then(function(){Zw(c,1);d();b&&b()})},250)})})};h=fx.prototype;h.ht=function(a){ix(this.g,a)};h.Bg=function(a){this.h&&this.h.Bg(a)};h.lh=function(){return this.h?this.h.lh():Promise.resolve()};
h.jf=function(a,c){this.m.error("Error during streaming: "+a,c);if(this.b)this.b.onError();gx(this)};
h.start=function(){var a=this,c=!1;this.m.info(function(){c=!0;return"Starting next media remoting session."});c&&Oda(this.g,function(b){return a.m.info(b)});Pda(this.g);Xw(this.j,2,function(b){return(0,a.F)().then(function(d){a.w=d;a.C.subscribe("RPC",function(e){if(e.rpc){var f=a.g;e=e.rpc;f.w&&(++f.l,f.f+=e.length,f.w(e))}});Zw(b,3)}).catch(function(d){return hx(a).then(function(){Zw(b);throw d;})})}).then(function(){a.m.info("Remoting started successfully.")}).catch(function(b){a.m.error("Failed to start remoting",
b);a.b.onError()})};h.Ft=function(a,c){var b=this;return Xw(this.j,3,function(d){return b.G.start(a?new cx:null,c?new cx:null,b).then(function(e){Qda(b.g,function(f){return b.C.sendMessage(f)},function(f){b.b.onMessageFromSink(f)});Zw(d,4);return{audio_stream_id:e.Zp||-1,video_stream_id:e.Ot||-1}}).catch(function(e){return hx(b).then(function(){Zw(d);throw e;})})}).catch(function(d){b.m.error("Failed to start remoting streams",d);gx(b);return{audio_stream_id:-1,video_stream_id:-1}})};
h.stop=function(a){var c=this;Cda(this.j,function(b){c.b.onStopped(a);return hx(c).then(function(){c.m.info("Remoting stopped.");Zw(b,5);(0,c.w)().then(function(){return Xw(c.j,5,function(d){if(c.b&&c.f)c.b.onSinkAvailable(c.K);Zw(d,2);return Promise.resolve()})}).catch(function(d){throw d;});c.w=null})}).catch(function(b){c.m.error("Failed to stop remoting: ",b);gx(c)})};
h.zq=function(){null===this.u&&(this.u=rf(this.l.wb.jg).then(function(a){return a.f||!1}));return this.u.then(function(a){return{rate:(a?1E7:5E6)/8}})};
var hx=function(a){return a.G.stop().then(function(){Tw(a.C,"RPC");Rda(a.g);jx(a.g)})},Nda=function(a){return new Promise(function(c){chrome.settingsPrivate.getPref("media_router.media_remoting.enabled",function(b){chrome.runtime.lastError?a.m.error("Encountered error getting media remoting pref: "+JSON.stringify(chrome.runtime.lastError)):b.type!=chrome.settingsPrivate.PrefType.BOOLEAN?a.m.error("Pref value not a boolean: "+JSON.stringify(b)):(a.f=!!b.value,a.m.info("Initializing mediaRemotingEnabled_ with value read from pref: "+
a.f));chrome.settingsPrivate.onPrefsChanged.hasListener(a.o)||chrome.settingsPrivate.onPrefsChanged.addListener(a.o);c()})})};
fx.prototype.J=function(a){if(this.b){a=l(a);for(var c=a.next();!c.done;c=a.next())if(c=c.value,"media_router.media_remoting.enabled"==c.key){if(c.type!=chrome.settingsPrivate.PrefType.BOOLEAN){this.m.error("Pref value not a boolean: "+JSON.stringify(c));break}a=!!c.value;if(this.f==a)break;this.f=a;this.m.info("mediaRemotingEnabled_ changed to: "+this.f);if(this.f)this.b.onSinkAvailable(this.K);else this.b.onStopped(mojo.RemotingStopReason.USER_DISABLED);break}}};
var Lda=function(a,c){var b=this,d=new mojo.RemotingSinkMetadata;d.features=[];d.friendly_name=c.Bt||"";d.audio_capabilities=[];d.video_capabilities=[];var e=mojo.RemotingSinkAudioCapability,f=mojo.RemotingSinkVideoCapability,g=d.audio_capabilities,k=d.video_capabilities,m=c.ne||"";(a.b||[]).forEach(function(p){switch(p){case "audio":g.push(e.CODEC_BASELINE_SET);break;case "aac":g.push(e.CODEC_AAC);break;case "opus":g.push(e.CODEC_OPUS);break;case "video":k.push(f.CODEC_BASELINE_SET);break;case "4k":k.push(f.SUPPORT_4K);
break;case "h264":k.push(f.CODEC_H264);break;case "vp8":k.push(f.CODEC_VP8);break;case "vp9":m.startsWith("Chromecast Ultra")&&k.push(f.CODEC_VP9);break;case "hevc":m.startsWith("Chromecast Ultra")&&k.push(f.CODEC_HEVC);break;default:b.m.info("Unknown mediaCap name: "+p)}});c.ne&&"Chromecast Ultra"==c.ne&&k.push(f.SUPPORT_4K);return d};fx.prototype.estimateTransmissionCapacity=fx.prototype.zq;fx.prototype.stop=fx.prototype.stop;fx.prototype.startDataStreams=fx.prototype.Ft;fx.prototype.start=fx.prototype.start;
fx.prototype.sendMessageToSink=fx.prototype.ht;
var Mda=function(){this.w=this.j=this.b=null;this.u=this.f=this.l=this.g=this.o=0;this.h=null},Pda=function(a){a.b=[];kx(a,performance.now())},Qda=function(a,c,b){a.j=c;a.w=b;a.b?(c=a.b,a.b=null,c.forEach(function(d){return ix(a,d.data).then(d.jt,d.zn)})):kx(a,performance.now())},Rda=function(a){if(a.b){var c=Error("Stop before delivering pending message");a.b.forEach(function(b){return b.zn(c)});a.b=null}a.j=null;a.w=null},ix=function(a,c){if(a.j){var b=btoa(String.fromCharCode.apply(null,c));++a.o;
a.g+=c.length;return a.j({type:"RPC",rpc:b})}return a.b?new Promise(function(d,e){a.b.push({data:c,jt:d,zn:e})}):Promise.reject(Error("RPC pipe not started"))},Oda=function(a,c){jx(a);a.h=setInterval(function(){if(a.b)var b=a.b.length+" messages are waiting to send.";else{b=performance.now();var d=(b-a.u)/1E3;d="Over the past "+d.toFixed(1)+" seconds, sent "+(a.o+" messages ("+Math.round(a.g/d)+" bytes/sec) and received ")+(a.l+" messages ("+Math.round(a.f/d)+" bytes/sec).");kx(a,b);b=d}c(b)},3E4)},
jx=function(a){null!=a.h&&(clearInterval(a.h),a.h=null)},kx=function(a,c){a.o=0;a.g=0;a.l=0;a.f=0;a.u=c};var Sda=function(a){return a&&a.getAudioTracks()&&0<a.getAudioTracks().length?a.getAudioTracks()[0]:null},Tda=function(a){return a&&a.getVideoTracks()&&0<a.getVideoTracks().length?a.getVideoTracks()[0]:null};var lx=function(a,c,b,d,e){this.g=new bx(a,c,b,d,void 0===e?null:e);this.m=hb("mr.mirror.cast.MediaStreamer");this.j=new Vw;this.h=this.f=this.b=this.w=null};lx.prototype.start=function(a,c){var b=this;return Xw(this.j,1,function(d){b.w=a;b.b=Sda(a);b.b&&"ended"==b.b.readyState&&(b.b=null);b.f=Tda(a);b.f&&"ended"==b.f.readyState&&(b.f=null);if(!b.b&&!b.f)return Zw(d),Promise.reject(Error("No MediaStream tracks to stream."));b.h=c;return b.g.start(b.b,b.f,b.h).then(function(){return Zw(d,2)})})};
lx.prototype.stop=function(){var a=this;return Yw(this.j,function(c){return a.g.stop().then(function(){a.b=null;a.f=null;a.w=null;a.h=null;Zw(c,1)})})};var Uda=function(a){return Xw(a.j,2,function(c){a.m.info("Suspending media streaming...");return a.g.stop().then(function(){a.m.info("Suspended media streaming.");Zw(c,3)})})};
lx.prototype.resume=function(){var a=this;return Xw(this.j,3,function(c){a.b&&"ended"==a.b.readyState&&(a.b=null);a.f&&"ended"==a.f.readyState&&(a.f=null);if(!a.b&&!a.f)return Promise.reject(Error("Cannot resume: All tracks have ended."));a.m.info("Resuming media streaming...");return a.g.start(a.b,a.f,a.h).then(function(){a.m.info("Resumed media streaming.");Zw(c,2)})})};var mx=function(a,c,b){this.j=a;this.h=c;this.g=b;this.m=hb("mr.mirror.cast.WifiStatusMonitor");this.b=null;this.f=[]};mx.prototype.start=function(){var a=this;null==this.b&&(ob(this.m,"Starting Wifi Status Monitoring."),this.f=[],this.g.subscribe("STATUS_RESPONSE",function(c){return Vda(a,c)}),this.b=setInterval(function(){return nx(a)},12E4),nx(this))};mx.prototype.stop=function(){null!=this.b&&(ob(this.m,"Stopping Wifi Status Monitoring."),clearInterval(this.b),this.b=null,Tw(this.g,"STATUS_RESPONSE"))};
var Vda=function(a,c){if(null!=a.b)if(c.status){var b={};null!=c.status.b&&(b.wifiSnr=c.status.b);null!=c.status.f&&(b.wifiSpeed=c.status.f[3]);0==Object.keys(b).length?a.m.H(function(){return"No status fields populated in response: "+JSON.stringify(c)}):(b.timestamp=Date.now(),30==a.f.length&&a.f.shift(),a.f.push(b),a.m.info(function(){return"Current Wifi status: "+JSON.stringify(b)}))}else a.m.H(function(){return"Ignoring response without status: "+JSON.stringify(c)})},nx=function(a){a.g.sendMessage({type:"GET_STATUS",
sessionId:a.j,seqNum:wn(a.h),get_status:["wifiSnr","wifiSpeed"]})};var ox=function(a,c,b,d){this.K=c.jg;this.l={extVersion:chrome.runtime.getManifest().version,extChannel:"public",mirrorSettings:Aj(a),sender:navigator.userAgent||"UNKNOWN",receiverProductName:c.ne};this.F=b;this.C=d;this.h=this.f=this.o=this.w=this.j=this.u=this.g=null;this.b=[]};ox.prototype.Bg=function(a){null!=this.f&&clearInterval(this.f);this.g=a;this.u=Date.now();this.f=setInterval(this.D.bind(this,a),9E5)};
ox.prototype.lh=function(){null!=this.f&&(clearInterval(this.f),this.f=null);if(null!=this.g){var a=this.D(this.g);this.g=null;return a}return Promise.resolve()};ox.prototype.jf=function(a,c){null==this.j&&(this.j=Date.now(),"function"===typeof a?this.w=a():"string"===typeof a&&(this.w=a),c&&"string"===typeof c.stack&&(this.o=c.stack))};
var Wda=function(a,c){return(null==a.g?Promise.resolve():a.D(a.g)).then(function(){var b=c.map(function(d){d=px(a,d);var e=d.map(function(g){return g.events}).filter(function(g){return null!=g}),f=["["];d.map(function(g){return g.lg}).forEach(function(g,k){0<k&&f.push(",");f.push(g)});f.push("]");return{events:new Blob(e,{type:"application/gzip"}),lg:new Blob(f,{type:"application/json"})}});a.b=[];return b})};
ox.prototype.D=function(a){var c=this;if(null!=this.h)return this.h;var b=rf(this.K).then(function(d){d={receiverVersion:d.b,receiverConnected:d.h,receiverOnEthernet:d.f,receiverHasUpdatePending:d.g,receiverUptimeSeconds:d.j};Object.assign(d,c.l);var e=Date.now();Object.assign(d,{startTime:c.u,endTime:e,activity:dx(a),receiverWifiStatus:Array.from(c.C.f)});c.u=e;null!=c.j&&(Object.assign(d,{streamingErrorTime:c.j,streamingErrorMessage:c.w,streamingErrorCause:c.o}),c.j=null,c.w=null,c.o=null);return d});
return(this.h=Promise.all([b.then(function(d){return Ida(a,d)}),b,Jda(a)]).then(function(d){var e=l(d);d=e.next().value;var f=e.next().value;e=e.next().value;c.b.push({events:d,lg:new Blob([JSON.stringify(Object.assign({tags:f},e))],{type:"application/json"})});c.b=px(c,c.F);c.h=null}))||Promise.resolve()};
var px=function(a,c){c-=2;for(var b=[],d=a.b.length-1;0<=d;--d){c-=a.b[d].lg.size+1;if(0>c)break;b.push({events:null,lg:a.b[d].lg});if(null!=a.b[d].events){var e=a.b[d].events.size;c>=e&&(b[b.length-1].events=a.b[d].events,c-=e)}}return b.reverse()};var qx=hb("mr.NetworkUtils"),rx=function(a,c){if(!Ei)return Promise.reject("TDLS feature not enabled.");qx.info("setTDLSState_: ip="+a+", state="+c);return new Promise(function(b,d){chrome.networkingPrivate.setWifiTDLSEnabledState(a,c,function(e){chrome.runtime.lastError?(qx.H("Unable to set TDLS state: state = "+c+", error = "+chrome.runtime.lastError.message),d("Unable to set TDLS state to "+c+".")):(qx.info("TDLS state changed: state = "+c+", status = "+e),b(e))})})};var sx=function(a,c,b,d){d=void 0===d?null:d;xj.call(this,c);var e=c.wb;this.C=e.sessionId;this.J=e.jg;this.D=a;this.N=d;this.m=hb("mr.mirror.cast.Session");this.u=new Vw;this.o=new vn("mirror.cast.SeqNumGenerator");this.l=new Sw(c.id);this.w=new lx(e,this.D,this.o,this.l,this.N);this.j=null;this.b=new ox(a,e,b,new mx(this.C,this.o,this.l));this.h=!1;this.F=null};q(sx,xj);h=sx.prototype;
h.start=function(a){var c=this;return Xw(this.u,1,function(b){var d=Ew();return Xda(c).then(function(e){c.h=e;return c.w.start(a,c)}).then(function(){if(c.w.g.C){var e=c.b;e.l.tdlsIsOn=c.h;e.C.start();Yda(c)}else c.b.l.tdlsIsOn=c.h;d.end();c.F=Fw();Zw(b,2);return c})})};
h.stop=function(){var a=this;return Yw(this.u,function(c){a.F&&(a.F.end(),a.F=null);a.b.C.stop();return a.w.stop().then(function(){return a.j?gx(a.j):Promise.resolve()}).then(function(){a.j=null;return a.h?Zda(a):Promise.resolve()}).then(function(){a.h=!1;Zw(c,4)})})};
h.xn=function(){var a=this,c={sessionId:this.C,seqNum:wn(this.o),type:"PRESENTATION",icons:[],title:vj(this.vc)};this.m.info("Sending session metadata update to receiver: "+this.C);this.l.sendMessage(c).catch(function(b){a.m.H("Failed to send activity to sink: "+b.message)})};h.Bg=function(a){this.b.Bg(a)};h.lh=function(){return this.b.lh()};h.jf=function(a,c){this.b.jf(a,c);this.m.error(a,c);this.stop()};
var tx=function(a,c){return Wda(a.b,c)},Xda=function(a){a.m.info("maybeEnableTdls_: useTdls = "+a.D.useTdls);return a.D.useTdls?rx(a.J,!0).then(function(c){if("Connected"==c)return a.m.info("Successfully enabled TDLS."),!0;a.m.H("Did not enable TDLS: result="+c);return!1}).catch(function(c){a.m.H("Error while calling enableTDLS()",c);return!1}):Promise.resolve(!1)},Zda=function(a){return rx(a.J,!1).catch(function(c){return a.m.error("Error while turning TDLS back off",c)})},Yda=function(a){$da(a).then(function(c){(c.b||
[]).includes("video")?aea(a,c):a.m.H(function(){return"Receiver incapable of Media Remoting: "+JSON.stringify(c)})}).catch(function(c){a.m.H("None/Invalid capabilites response. Media Remoting disabled.",c)})},$da=function(a){return new Promise(function(c,b){var d={type:"GET_CAPABILITIES",sessionId:a.C,seqNum:wn(a.o)};a.m.info(function(){return"Sending GET_CAPABILITIES message: "+JSON.stringify(d)});Uw(a.l,d,"CAPABILITIES_RESPONSE",3E4,function(e,f){if(null==e)return b(f),!0;if("ok"!=e.result||!e.capabilities)return b(Error("Bad response: "+
JSON.stringify(e))),!0;if(e.f!=d.seqNum)return a.m.info(function(){return"Ignoring CAPABILITIES_RESPONSE with different seqNum: "+JSON.stringify(e)}),!1;ob(a.m,function(){return"Received CAPABILITIES_RESPONSE: "+JSON.stringify(e)});c(e.capabilities);return!0})})},aea=function(a,c){Xw(a.u,2,function(b){var d=a.f.wb.ne||"<UNKNOWN>";if(!d.startsWith("Chromecast")&&!d.startsWith("Eureka Dongle"))return a.m.H('HACK: Media Remoting disabled because the receiver model--"'+(d+'" according to discovery--is not a Chromecast.')),
Zw(b),Promise.resolve();a.j=new fx(a.f,c,a.D,a.o,a.l,a.N);return a.j.initialize(a.T.bind(a),a).catch(function(e){a.m.error("Media Remoting start failed: "+e.message,e)}).then(function(){return Zw(b)})})};sx.prototype.T=function(){var a=this;return Xw(this.u,2,function(c){return new Promise(function(b,d){Uda(a.w).then(function(){Zw(c,3);a.K=!0;oj(a);b(a.V.bind(a))}).catch(function(e){a.jf("Failed to suspend MediaStreamer before starting remoting",e);d(e)})})})};
sx.prototype.V=function(){var a=this;return Xw(this.u,3,function(c){return new Promise(function(b,d){a.w.resume().then(function(){Zw(c,2);a.K=!1;oj(a);b()}).catch(function(e){a.jf("Failed resume MediaStreamer after ending remoting mode",e);d(e)})})})};var ux=function(){mj.call(this,"cast_streaming");this.w=this.u=this.K=this.F=this.h=null;this.cb=this.G="";this.da=this.o=!1;this.ja=this.ua.bind(this);this.J=this.N=this.T=this.V=this.j=null};q(ux,mj);h=ux.prototype;h.Dg=function(a){this.o=a||!1;this.da=!0};h.getName=function(){return"cast_streaming"};
h.Jj=function(a,c,b,d,e){var f=this;if(!this.o)return mj.prototype.Jj.call(this,a,c,b,d,e);this.R.info("Start mirroring on route "+a.id);if(!this.da)return xi(Error("Not initialized"));var g=new Promise(function(k,m){f.l().then(function(){if(hj(c)&&b.shouldCaptureVideo)return Qi(!1).then(function(p){f.cb=p})}).then(function(){return e?e(a).b:a}).then(function(p){f.G=c;bea(f,p);var u=f.F.createInterfacePtrAndBind(),A=f.K.createInterfacePtrAndBind(),E=cea(p,b);dea(f,p,c,d);if(!f.h)throw new Bi("Error to get mirroring service host");
f.u=new mojo.MirroringCastMessageChannelPtr;f.V=Ew();f.h.start(E,u,A,mojo.makeRequest(f.u));f.j=new xj(a,f.g.Xi.bind(f.g));oj(f.j);eea(f,p,c);f.N=function(){return k(p)};f.J=m}).catch(function(p){f.R.info("Mirroring launch error: "+p);f.fg(p.reason);m(p)})});return yi(g)};h.zh=function(a,c){return new sx(a,c,20969472,null)};h.gh=function(){Gw(0)};h.dh=function(){Gw(1)};h.bi=function(){Gw(2)};h.eh=function(){Cb("MediaRouter.CastStreaming.Session.End")};
h.fg=function(a){Db("MediaRouter.CastStreaming.Start.Failure",a,Ai)};h.fh=function(){Cb("MediaRouter.CastStreaming.Stream.End")};
h.zi=function(a){var c=this;return this.o?Promise.resolve():(new Promise(function(b){return chrome.metricsPrivate.getIsCrashReportingEnabled(b)})).then(function(b){var d=b&&oda(),e=[9351424];d&&e.push(20969472);return tx(a,e).then(function(f){var g=f[f.length-1];f=qm(f[0].events).catch(function(k){c.R.error("Failed to persist events Blob.",k)});d&&0<g.events.size?Jw(g.events,void 0,c.Kr.bind(c)):b&&Iw("stats.json",g.lg,void 0,void 0);return f})})};h.Kr=function(a){a&&(Mw().b=Date.now())};
h.Ij=function(a){if(this.o)return eb();this.R.info("Received message to upload logs for "+a);return this.b?tx(this.b,[20969472]).then(function(c){c=l(c).next().value;return 0==c.events.size?"":Jw(c.events,a)}):Promise.resolve(fea(this,a))};
var fea=function(a,c){var b=window.localStorage.getItem("mr.temp.mirror.cast.Service.eventsBlob");if(null==b||1>b.length)b=null;else{for(var d=new Uint16Array(b.length),e=0;e<b.length;++e)d[e]=b.charCodeAt(e);b=d.buffer;d=(new Uint8Array(b,b.byteLength-1,1))[0];b=new Uint8Array(b,0,b.byteLength-(0==d?2:1));b=new Blob([b],{type:"application/gzip"})}if(null!=b&&0!=b.size)return qm(new Blob),a.R.info("Uploading saved logs for feedback."),Jw(b,c)};h=ux.prototype;
h.onError=function(a){this.J&&(this.J(a),this.N=this.J=null,this.fg(9));this.R.info("Mirroring service error: "+a);this.l()};h.didStart=function(){this.N&&(this.N(),this.N=this.J=null);this.V&&(this.V.end(),this.V=null);this.T=Fw();gj(this.G)?this.gh():hj(this.G)?this.dh():jj(this.G)&&this.bi()};h.didStop=function(){this.l()};h.send=function(a){if(this.w){var c=JSON.parse(a.jsonFormatData);ob(this.R,function(){return"Sending message: "+JSON.stringify(c)});this.w.sendMessage(a.jsonFormatData,{namespace:a.messageNamespace})}};
h.Lr=function(a){if(a&&(a.namespace_===mojo.MirroringWebRtcNamespace||a.namespace_===mojo.MirroringRemotingNamespace)&&this.u){var c=new mojo.MirroringCastMessage;c.messageNamespace=a.namespace_;"string"!==typeof a.data?this.R.info("Received non-string as JSON"):(c.jsonFormatData=a.data,this.u.send(c))}};
var bea=function(a,c){a.F=new mojo.Binding(mojo.MirroringSessionObserver,a,null);a.K=new mojo.Binding(mojo.MirroringCastMessageChannel,a,null);a.w=Xv(c.id);a.w.onMessage=a.Lr.bind(a)},cea=function(a,c){var b=new mojo.MirroringSessionParameters;b.receiverAddress=new mojo.IPAddress;b.receiverAddress.addressBytes=a.wb.jg.split(".").map(function(d){return parseInt(d,10)});b.receiverModelName=a.wb.ne;b.type=c.shouldCaptureVideo&&c.shouldCaptureAudio?mojo.MirroringSessionType.AUDIO_AND_VIDEO:c.shouldCaptureVideo?
mojo.MirroringSessionType.VIDEO_ONLY:mojo.MirroringSessionType.AUDIO_ONLY;return b},dea=function(a,c,b,d){a.h=new mojo.MirroringServiceHostPtr;c=c.wb.tabId||-1;gj(b)?a.g.getMirroringServiceHostForTab(c,mojo.makeRequest(a.h)):hj(b)?a.g.getMirroringServiceHostForDesktop(-1,a.cb,mojo.makeRequest(a.h)):jj(b)?(c=new mojo.Url,c.url=b,a.g.getMirroringServiceHostForOffscreenTab(c,d||"",mojo.makeRequest(a.h))):a.h=null},eea=function(a,c,b){gj(b)&&!chrome.tabs.onUpdated.hasListener(a.ja)&&chrome.tabs.onUpdated.addListener(a.ja);
(gj(b)||jj(b))&&rj(a.j,c.wb.tabId)};ux.prototype.ua=function(a,c,b){fj(14);this.j&&sj(this.j,a,c,b)};
ux.prototype.l=function(){chrome.tabs.onUpdated.removeListener(this.ja);return this.o?this.da?this.h?(this.h.ptr.reset(),this.u=this.h=null,this.w&&this.w.fb(),this.w=null,this.F&&(this.F.close(),this.F=null),this.K&&(this.K.close(),this.K=null),this.g.Yh(this.j.f.id),this.j=null,this.cb=this.G="",this.T&&(this.T.end(),this.T=null),this.eh(),Promise.resolve(!0)):Promise.resolve(!1):Promise.reject("Not initialized"):mj.prototype.l.call(this)};
ux.prototype.Kj=function(a,c,b,d,e,f){return this.o?xi(Error("Mirroring service does not support updating stream")):mj.prototype.Kj.call(this,a,c,b,d,e,f)};ux.prototype.send=ux.prototype.send;ux.prototype.didStop=ux.prototype.didStop;ux.prototype.didStart=ux.prototype.didStart;ux.prototype.onError=ux.prototype.onError;var gea=new ux;cj("mr.mirror.cast.Service",gea);
