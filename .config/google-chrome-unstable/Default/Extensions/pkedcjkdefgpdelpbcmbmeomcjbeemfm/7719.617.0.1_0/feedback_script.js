'use strict';var $f=function(a,c,b){a.timeOfStartCall=(new Date).getTime();var d=b||Ha,e=d.document,f=Na(d);f&&(a.nonce=f);if("help"==a.flow){var g=Pa("document.location.href",d);!a.helpCenterContext&&g&&(a.helpCenterContext=g.substring(0,1200));g=!0;if(c&&JSON&&JSON.stringify){var k=JSON.stringify(c);(g=1200>=k.length)&&(a.psdJson=k)}g||(c={invalidPsd:!0})}c=[a,c,b];d.GOOGLE_FEEDBACK_START_ARGUMENTS=c;b=a.serverUri||"//www.google.com/tools/feedback";if(g=d.GOOGLE_FEEDBACK_START)g.apply(d,c);else{d=b+"/load.js?";
for(var m in a)c=a[m],null!=c&&!Ya(c)&&(d+=encodeURIComponent(m)+"="+encodeURIComponent(c)+"&");a=(e?new Yf(Wf(e)):Fb||(Fb=new Yf)).b.createElement("SCRIPT");f&&a.setAttribute("nonce",f);f=hd(d);me(a,f);e.body.appendChild(a)}};w("userfeedback.api.startFeedback",$f);var ag=function(){this.j=this.g=this.f=this.w=this.modelName=this.h=this.b=this.fe=""};var bg=chrome.i18n.getMessage("4163185390680253103"),cg=chrome.i18n.getMessage("492097680647953484"),dg=chrome.i18n.getMessage("2575016469622936324"),eg=chrome.i18n.getMessage("128276876460319075"),fg=chrome.i18n.getMessage("3326722026796849289"),gg=chrome.i18n.getMessage("1018984561488520517"),hg=chrome.i18n.getMessage("8205999658352447129"),ig=chrome.i18n.getMessage("5723583529370342957"),jg=chrome.i18n.getMessage("1550904064710828958"),kg=chrome.i18n.getMessage("5014364904504073524"),lg=chrome.i18n.getMessage("2194670894476780934"),
mg=chrome.i18n.getMessage("6614468912728530636"),og=chrome.i18n.getMessage("5910595154486533449"),pg=chrome.i18n.getMessage("5363086287710390513"),qg=chrome.i18n.getMessage("244647017322945605"),rg=chrome.i18n.getMessage("5375576275991472719"),sg=chrome.i18n.getMessage("4592127349908255218"),tg=chrome.i18n.getMessage("843316808366399491"),ug=chrome.i18n.getMessage("5699813974548050528"),vg=chrome.i18n.getMessage("8515148417333877999"),wg=chrome.i18n.getMessage("1636686747687494376"),xg=chrome.i18n.getMessage("4148300086676792937"),
yg=chrome.i18n.getMessage("3219866268410307919"),zg=chrome.i18n.getMessage("9211708838274008657"),Ag=chrome.i18n.getMessage("8706273405040403641"),Bg=chrome.i18n.getMessage("4756056595565370923"),Cg=chrome.i18n.getMessage("7876724262035435114"),Dg=chrome.i18n.getMessage("5485620192329479690"),Eg=chrome.i18n.getMessage("6963873398546068901"),Fg=chrome.i18n.getMessage("3567591856726172993"),Gg=chrome.i18n.getMessage("3239956785410157548");var Hg={"* ARIA-CHECKED":!0,"* ARIA-COLCOUNT":!0,"* ARIA-COLINDEX":!0,"* ARIA-DESCRIBEDBY":!0,"* ARIA-DISABLED":!0,"* ARIA-GOOG-EDITABLE":!0,"* ARIA-LABEL":!0,"* ARIA-LABELLEDBY":!0,"* ARIA-MULTILINE":!0,"* ARIA-MULTISELECTABLE":!0,"* ARIA-ORIENTATION":!0,"* ARIA-PLACEHOLDER":!0,"* ARIA-READONLY":!0,"* ARIA-REQUIRED":!0,"* ARIA-ROLEDESCRIPTION":!0,"* ARIA-ROWCOUNT":!0,"* ARIA-ROWINDEX":!0,"* ARIA-SELECTED":!0,"* ABBR":!0,"* ACCEPT":!0,"* ACCESSKEY":!0,"* ALIGN":!0,"* ALT":!0,"* AUTOCOMPLETE":!0,"* AXIS":!0,
"* BGCOLOR":!0,"* BORDER":!0,"* CELLPADDING":!0,"* CELLSPACING":!0,"* CHAROFF":!0,"* CHAR":!0,"* CHECKED":!0,"* CLEAR":!0,"* COLOR":!0,"* COLSPAN":!0,"* COLS":!0,"* COMPACT":!0,"* COORDS":!0,"* DATETIME":!0,"* DIR":!0,"* DISABLED":!0,"* ENCTYPE":!0,"* FACE":!0,"* FRAME":!0,"* HEIGHT":!0,"* HREFLANG":!0,"* HSPACE":!0,"* ISMAP":!0,"* LABEL":!0,"* LANG":!0,"* MAX":!0,"* MAXLENGTH":!0,"* METHOD":!0,"* MULTIPLE":!0,"* NOHREF":!0,"* NOSHADE":!0,"* NOWRAP":!0,"* OPEN":!0,"* READONLY":!0,"* REQUIRED":!0,
"* REL":!0,"* REV":!0,"* ROLE":!0,"* ROWSPAN":!0,"* ROWS":!0,"* RULES":!0,"* SCOPE":!0,"* SELECTED":!0,"* SHAPE":!0,"* SIZE":!0,"* SPAN":!0,"* START":!0,"* SUMMARY":!0,"* TABINDEX":!0,"* TITLE":!0,"* TYPE":!0,"* VALIGN":!0,"* VALUE":!0,"* VSPACE":!0,"* WIDTH":!0},Ig={"* USEMAP":!0,"* ACTION":!0,"* CITE":!0,"* HREF":!0,"* LONGDESC":!0,"* SRC":!0,"LINK HREF":!0,"* FOR":!0,"* HEADERS":!0,"* NAME":!0,"A TARGET":!0,"* CLASS":!0,"* ID":!0,"* STYLE":!0};var Jg={};
function Kg(a){if(Be&&!Ve(9))return[0,0,0,0];var c=Jg.hasOwnProperty(a)?Jg[a]:null;if(c)return c;65536<Object.keys(Jg).length&&(Jg={});var b=[0,0,0,0];c=Lg(a,/\\[0-9A-Fa-f]{6}\s?/g);c=Lg(c,/\\[0-9A-Fa-f]{1,5}\s/g);c=Lg(c,/\\./g);c=c.replace(/:not\(([^\)]*)\)/g,"     $1 ");c=c.replace(/{[^]*/gm,"");c=Mg(c,b,/(\[[^\]]+\])/g,2);c=Mg(c,b,/(#[^\#\s\+>~\.\[:]+)/g,1);c=Mg(c,b,/(\.[^\s\+>~\.\[:]+)/g,2);c=Mg(c,b,/(::[^\s\+>~\.\[:]+|:first-line|:first-letter|:before|:after)/gi,3);c=Mg(c,b,/(:[\w-]+\([^\)]*\))/gi,2);
c=Mg(c,b,/(:[^\s\+>~\.\[:]+)/g,2);c=c.replace(/[\*\s\+>~]/g," ");c=c.replace(/[#\.]/g," ");Mg(c,b,/([^\s\+>~\.\[:]+)/g,3);c=b;return Jg[a]=c}function Mg(a,c,b,d){return a.replace(b,function(e){c[d]+=1;return Array(e.length+1).join(" ")})}function Lg(a,c){return a.replace(c,function(b){return Array(b.length+1).join("A")})};var Ng={rgb:!0,rgba:!0,alpha:!0,rect:!0,image:!0,"linear-gradient":!0,"radial-gradient":!0,"repeating-linear-gradient":!0,"repeating-radial-gradient":!0,"cubic-bezier":!0,matrix:!0,perspective:!0,rotate:!0,rotate3d:!0,rotatex:!0,rotatey:!0,steps:!0,rotatez:!0,scale:!0,scale3d:!0,scalex:!0,scaley:!0,scalez:!0,skew:!0,skewx:!0,skewy:!0,translate:!0,translate3d:!0,translatex:!0,translatey:!0,translatez:!0},Og=/[\n\f\r"'()*<>]/g,Pg={"\n":"%0a","\f":"%0c","\r":"%0d",'"':"%22","'":"%27","(":"%28",")":"%29",
"*":"%2a","<":"%3c",">":"%3e"};function Qg(a){return Pg[a]}
var Rg=function(a,c,b){c=ld(c);if(""==c)return null;if(0==nd("url(",c.substr(0,4))){if(!c.endsWith(")")||1<(c?c.split("(").length-1:0)||1<(c?c.split(")").length-1:0)||!b)a=null;else{a:{c=c.substring(4,c.length-1);for(var d=0;2>d;d++){var e="\"'".charAt(d);if(c.charAt(0)==e&&c.charAt(c.length-1)==e){c=c.substring(1,c.length-1);break a}}}a=b?(a=b(c,a))&&"about:invalid#zClosurez"!=zd(a).toString()?'url("'+zd(a).toString().replace(Og,Qg)+'")':null:null}return a}if(0<c.indexOf("(")){if(/"|'/.test(c))return null;
for(a=/([\-\w]+)\(/g;b=a.exec(c);)if(!(b[1]in Ng))return null}return c};function Sg(a,c){a=Ha[a];return a&&a.prototype?(c=Object.getOwnPropertyDescriptor(a.prototype,c))&&c.get||null:null}function Tg(a,c){return(a=Ha[a])&&a.prototype&&a.prototype[c]||null}
var Ug=Sg("Element","attributes")||Sg("Node","attributes"),Vg=Tg("Element","hasAttribute"),Wg=Tg("Element","getAttribute"),Xg=Tg("Element","setAttribute"),Yg=Tg("Element","removeAttribute"),Zg=Tg("Element","getElementsByTagName"),$g=Tg("Element","matches")||Tg("Element","msMatchesSelector"),ah=Sg("Node","nodeName"),bh=Sg("Node","nodeType"),ch=Sg("Node","parentNode"),dh=Sg("HTMLElement","style")||Sg("Element","style"),eh=Sg("HTMLStyleElement","sheet"),fh=Tg("CSSStyleDeclaration","getPropertyValue"),
gh=Tg("CSSStyleDeclaration","setProperty");function hh(a,c,b,d){if(a)return a.apply(c);a=c[b];if(!d(a))throw Error("Clobbering detected");return a}function ih(a,c,b,d){if(a)return a.apply(c,d);if(Be&&10>document.documentMode){if(!c[b].call)throw Error("IE Clobbering detected");}else if("function"!=typeof c[b])throw Error("Clobbering detected");return c[b].apply(c,d)}function jh(a){return hh(Ug,a,"attributes",function(c){return c instanceof NamedNodeMap})}
function kh(a,c,b){try{ih(Xg,a,"setAttribute",[c,b])}catch(d){if(-1==d.message.indexOf("A security problem occurred"))throw d;}}function lh(a){mh(a);return hh(dh,a,"style",function(c){return c instanceof CSSStyleDeclaration})}function mh(a){if(!(a instanceof HTMLElement))throw Error("Not an HTMLElement");}function nh(a){mh(a);return hh(eh,a,"sheet",function(c){return c instanceof CSSStyleSheet})}function oh(a){return hh(ah,a,"nodeName",function(c){return"string"==typeof c})}
function ph(a){return hh(bh,a,"nodeType",function(c){return"number"==typeof c})}function qh(a){return hh(ch,a,"parentNode",function(c){return!(c&&"string"==typeof c.name&&c.name&&"parentnode"==c.name.toLowerCase())})}function rh(a,c){return ih(fh,a,a.getPropertyValue?"getPropertyValue":"getAttribute",[c])||""}function sh(a,c,b){ih(gh,a,a.setProperty?"setProperty":"setAttribute",[c,b])};var th=Be&&10>document.documentMode?null:/\s*([^\s'",]+[^'",]*(('([^'\r\n\f\\]|\\[^])*')|("([^"\r\n\f\\]|\\[^])*")|[^'",])*)/g,uh={"-webkit-border-horizontal-spacing":!0,"-webkit-border-vertical-spacing":!0},xh=function(a,c,b){var d=[];a=vh(z(a.cssRules));y(a,function(e){if(c&&!/[a-zA-Z][\w-:\.]*/.test(c))throw Error("Invalid container id");if(!(c&&Be&&10==document.documentMode&&/\\['"]/.test(e.selectorText))){var f=c?e.selectorText.replace(th,"#"+c+" $1"):e.selectorText;d.push(Td(f,wh(e.style,b)))}});
return Vd(d)},vh=function(a){return Mb(a,function(c){return c instanceof CSSStyleRule||c.type==CSSRule.STYLE_RULE})},zh=function(a,c,b){a=yh("<style>"+a+"</style>");return null==a||null==a.sheet?Wd:xh(a.sheet,void 0!=c?c:null,b)},yh=function(a){if(Be&&!Ve(10)||"function"!=typeof Ha.DOMParser)return null;a=fe("<html><head></head><body>"+a+"</body></html>",null);return(new DOMParser).parseFromString(ee(a),"text/html").body.children[0]},wh=function(a,c){if(!a)return Hd;var b=document.createElement("div").style,
d=Ah(a);y(d,function(e){var f=Ee&&e in uh?e:e.replace(/^-(?:apple|css|epub|khtml|moz|mso?|o|rim|wap|webkit|xv)-(?=[a-z])/i,"");id(f,"--")||id(f,"var")||(e=rh(a,e),e=Rg(f,e,c),null!=e&&sh(b,f,e))});return Gd(b.cssText||"")},Ch=function(a){var c=Array.from(ih(Zg,a,"getElementsByTagName",["STYLE"])),b=qc(c,function(e){return z(nh(e).cssRules)});b=vh(b);b.sort(function(e,f){e=Kg(e.selectorText);a:{f=Kg(f.selectorText);for(var g=jc,k=Math.min(e.length,f.length),m=0;m<k;m++){var p=g(e[m],f[m]);if(0!=p){e=
p;break a}}e=jc(e.length,f.length)}return-e});a=document.createTreeWalker(a,NodeFilter.SHOW_ELEMENT,null,!1);for(var d;d=a.nextNode();)y(b,function(e){ih($g,d,d.matches?"matches":"msMatchesSelector",[e.selectorText])&&e.style&&Bh(d,e.style)});y(c,Vf)},Bh=function(a,c){var b=Ah(a.style),d=Ah(c);y(d,function(e){if(!(0<=b.indexOf(e))){var f=rh(c,e);sh(a.style,e,f)}})},Ah=function(a){Va(a)?a=z(a):(a=Ec(a),ac(a,"cssText"));return a};var Dh="undefined"!=typeof WeakMap&&-1!=WeakMap.toString().indexOf("[native code]"),Eh=0,Fh=function(){this.g=[];this.f=[];this.b="data-elementweakmap-index-"+Eh++};Fh.prototype.set=function(a,c){if(ih(Vg,a,"hasAttribute",[this.b])){var b=parseInt(ih(Wg,a,"getAttribute",[this.b])||null,10);this.f[b]=c}else b=this.f.push(c)-1,kh(a,this.b,b.toString()),this.g.push(a);return this};
Fh.prototype.get=function(a){if(ih(Vg,a,"hasAttribute",[this.b]))return a=parseInt(ih(Wg,a,"getAttribute",[this.b])||null,10),this.f[a]};Fh.prototype.clear=function(){this.g.forEach(function(a){ih(Yg,a,"removeAttribute",[this.b])},this);this.g=[];this.f=[]};var Gh=Lf("goog.html.sanitizer.SafeDomTreeProcessor"),Hh=!Be||10<=Number(We),Ih=!Be||null==document.documentMode,Jh=function(){};var Kh={APPLET:!0,AUDIO:!0,BASE:!0,BGSOUND:!0,EMBED:!0,FORM:!0,IFRAME:!0,ISINDEX:!0,KEYGEN:!0,LAYER:!0,LINK:!0,META:!0,OBJECT:!0,SCRIPT:!0,SVG:!0,STYLE:!0,TEMPLATE:!0,VIDEO:!0};var Lh={A:!0,ABBR:!0,ACRONYM:!0,ADDRESS:!0,AREA:!0,ARTICLE:!0,ASIDE:!0,B:!0,BDI:!0,BDO:!0,BIG:!0,BLOCKQUOTE:!0,BR:!0,BUTTON:!0,CAPTION:!0,CENTER:!0,CITE:!0,CODE:!0,COL:!0,COLGROUP:!0,DATA:!0,DATALIST:!0,DD:!0,DEL:!0,DETAILS:!0,DFN:!0,DIALOG:!0,DIR:!0,DIV:!0,DL:!0,DT:!0,EM:!0,FIELDSET:!0,FIGCAPTION:!0,FIGURE:!0,FONT:!0,FOOTER:!0,FORM:!0,H1:!0,H2:!0,H3:!0,H4:!0,H5:!0,H6:!0,HEADER:!0,HGROUP:!0,HR:!0,I:!0,IMG:!0,INPUT:!0,INS:!0,KBD:!0,LABEL:!0,LEGEND:!0,LI:!0,MAIN:!0,MAP:!0,MARK:!0,MENU:!0,METER:!0,NAV:!0,
NOSCRIPT:!0,OL:!0,OPTGROUP:!0,OPTION:!0,OUTPUT:!0,P:!0,PRE:!0,PROGRESS:!0,Q:!0,S:!0,SAMP:!0,SECTION:!0,SELECT:!0,SMALL:!0,SOURCE:!0,SPAN:!0,STRIKE:!0,STRONG:!0,STYLE:!0,SUB:!0,SUMMARY:!0,SUP:!0,TABLE:!0,TBODY:!0,TD:!0,TEXTAREA:!0,TFOOT:!0,TH:!0,THEAD:!0,TIME:!0,TR:!0,TT:!0,U:!0,UL:!0,VAR:!0,WBR:!0};var Ph=function(a){a=a||new Mh;Nh(a);this.b=Lc(a.b);this.h=Lc(a.D);this.j=Lc(a.C);this.o=a.o;y(a.w,function(c){if(!id(c,"data-"))throw new Gb('Only "data-" attributes allowed, got: %s.',[c]);if(id(c,"data-sanitizer-"))throw new Gb('Attributes with "%s" prefix are not allowed, got: %s.',["data-sanitizer-",c]);this.b["* "+c.toUpperCase()]=Oh},this);this.l=a.g;this.g=a.s;this.f=null;this.w=a.l};x(Ph,Jh);
var Qh=function(a){return function(c,b){return(c=a(ld(c),b))&&"about:invalid#zClosurez"!=zd(c).toString()?zd(c).toString():null}},Mh=function(){this.b={};y([Hg,Ig],function(a){y(Ec(a),function(c){this.b[c]=Oh},this)},this);this.f={};this.w=[];this.D=Lc(Kh);this.C=Lc(Lh);this.o=!1;this.H=Cd;this.L=this.j=this.F=this.g=uc;this.s=null;this.h=this.l=!1},Rh=function(a,c){return function(b,d,e,f){b=a(b,d,e,f);return null==b?null:c(b,d,e,f)}},Sh=function(a,c,b,d){a[b]&&!c[b]&&(a[b]=Rh(a[b],d))};
Mh.prototype.ba=function(){return new Ph(this)};
var Nh=function(a){if(a.h)throw Error("HtmlSanitizer.Builder.build() can only be used once.");Sh(a.b,a.f,"* USEMAP",Th);var c=Qh(a.H);y(["* ACTION","* CITE","* HREF"],function(d){Sh(this.b,this.f,d,c)},a);var b=Qh(a.g);y(["* LONGDESC","* SRC","LINK HREF"],function(d){Sh(this.b,this.f,d,b)},a);y(["* FOR","* HEADERS","* NAME"],function(d){Sh(this.b,this.f,d,db(Uh,this.F))},a);Sh(a.b,a.f,"A TARGET",db(Vh,["_blank","_self"]));Sh(a.b,a.f,"* CLASS",db(Wh,a.j));Sh(a.b,a.f,"* ID",db(Xh,a.j));Sh(a.b,a.f,"* STYLE",
db(a.L,b));a.h=!0},Yh=function(a,c){a||(a="*");return(a+" "+c).toUpperCase()},Oh=function(a){return ld(a)},Vh=function(a,c){c=ld(c);return Ub(a,c.toLowerCase())?c:null},Th=function(a){return(a=ld(a))&&"#"==a.charAt(0)?a:null},Uh=function(a,c,b){return a(ld(c),b)},Wh=function(a,c,b){c=c.split(/(?:\s+)/);for(var d=[],e=0;e<c.length;e++){var f=a(c[e],b);f&&d.push(f)}return 0==d.length?null:d.join(" ")},Xh=function(a,c,b){return a(ld(c),b)},Zh=function(a,c){var b=c.data;(c=qh(c))&&"style"==oh(c).toLowerCase()&&
!("STYLE"in a.h)&&"STYLE"in a.j&&(b=Ud(zh(b,a.f,t(function(d,e){return this.l(d,{BA:e})},a))));return document.createTextNode(b)},$h=function(a){var c=(new Mh).ba();var b=!("STYLE"in c.h)&&"STYLE"in c.j;b="*"==c.g&&b?"sanitizer-"+re():c.g;c.f=b;if(Hh){b=a;if(Hh){a=document.createElement("SPAN");c.f&&"*"==c.g&&(a.id=c.f);c.w&&(b=yh("<div>"+b+"</div>"),Ch(b),b=b.innerHTML);b=fe(b,null);var d=document.createElement("template");if(Ih&&"content"in d)je(d,b),d=d.content;else{var e=document.implementation.createHTMLDocument("x");
d=e.body;je(e.body,b)}b=document.createTreeWalker(d,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT,null,!1);for(d=Dh?new WeakMap:new Fh;e=b.nextNode();){c:{var f=c;var g=e;var k=ph(g);switch(k){case 3:g=Zh(f,g);break c;case 1:k=g;1==ph(k)||Hb("Expected Node of type Element but got Node of type %s",ph(k));g=f;f=k;if("TEMPLATE"==oh(f).toUpperCase())g=null;else{k=oh(f).toUpperCase();if(k in g.h)var m=null;else g.j[k]?m=document.createElement(k):(m=document.createElement("SPAN"),g.o&&kh(m,"data-sanitizer-original-tag",
k.toLowerCase()));if(m){var p=m,v=jh(f);if(null!=v)for(var A=0;k=v[A];A++)if(k.specified){var G=g;var F=f,P=k,fa=P.name;if(id(fa,"data-sanitizer-"))G=null;else{var Wa=oh(F);P=P.value;var Fc={tagName:ld(Wa).toLowerCase(),attributeName:ld(fa).toLowerCase()},Gc={fq:void 0};"style"==Fc.attributeName&&(Gc.fq=lh(F));F=Yh(Wa,fa);F in G.b?(G=G.b[F],G=G(P,Fc,Gc)):(fa=Yh(null,fa),fa in G.b?(G=G.b[fa],G=G(P,Fc,Gc)):G=null)}null===G||kh(p,k.name,G)}g=m}else g=null}break c;default:B(Gh,"Dropping unknown node type: "+
k),g=null}}if(g){if(1==ph(g)&&d.set(e,g),e=qh(e),f=!1,e)k=ph(e),m=oh(e).toLowerCase(),p=qh(e),11!=k||p?"body"==m&&p&&(k=qh(p))&&!qh(k)&&(f=!0):f=!0,k=null,f||!e?k=a:1==ph(e)&&(k=d.get(e)),k.content&&(k=k.content),k.appendChild(g)}else Uf(e)}d.clear&&d.clear();c=a}else c=document.createElement("SPAN");0<jh(c).length&&(a=document.createElement("SPAN"),a.appendChild(c),c=a);c=(new XMLSerializer).serializeToString(c);c=c.slice(c.indexOf(">")+1,c.lastIndexOf("</"))}else c="";return fe(c,null)};if("undefined"!=typeof angular){var ai=angular.module("chrome_18n",[]);chrome.runtime&&chrome.runtime.getManifest&&chrome.runtime.getManifest().default_locale&&ai.directive("angularMessage",function(){return{restrict:"E",replace:!0,controller:["$scope",function(a){var c=this;this.vi=this.Bg=null;a.dirForText=function(b){c.Bg||(c.Bg=chrome.i18n.getMessage("@@bidi_dir")||"ltr");c.vi||(c.vi=new Zf("rtl"==c.Bg));var d=c.vi,e,f=e=0,g=!1;b=(b||"").split(cd);for(var k=0;k<b.length;k++){var m=b[k];ad.test(m)?
(e++,f++):bd.test(m)?g=!0:$c.test(m)?f++:dd.test(m)&&(g=!0)}e=0==f?g?1:0:.4<e/f?-1:1;return-1==(0==e?d.b:e)?"rtl":"ltr"}}],compile:function(a,c){c=c.key;var b=null,d=document.createElement("amr");c&&!c.match(/^\d+$/)&&(c=chrome.i18n.getMessage(c),null==c&&d.setAttribute("id","missing"));if(c){var e=chrome.i18n.getMessage(c+"_ph");b=[];if(null!=e)for(b=e.split("\ue000"),e=0;e<b.length;++e)b[e]=b[e].replace(/^{{(.*)}}$/,'<amrp dir="{{dirForText($1)}}">{{$1}}</amrp>');b=chrome.i18n.getMessage(c,b)}else d.setAttribute("r",
"nokey");b?ke(d,$h(b)):(d.setAttribute("tl","false"),ke(d,$h(a.html())));a.replaceWith(d)}}})};var ci=function(a,c){var b=this;this.w=c;this.b=a;this.b.top=a;this.l=[];this.h=!1;this.f=new ag;this.b.videoSmoothnessRatings=this.rk(lg,gg,hg,ig,jg,kg);this.b.videoQualityRatings=this.rk(lg,mg,og,pg,qg,rg);this.b.audioQualityRatings=this.rk(lg,sg,tg,ug,vg,wg);this.l=[{value:"Bug",desc:bg},{value:"FeatureRequest",desc:cg},{value:"MirroringQuality",desc:dg},{value:"Discovery",desc:eg},{value:"Other",desc:fg}];this.b.feedbackTypes=this.l;this.b.includeFineLogs=!0;this.b.feedbackType="Bug";this.b.sendFeedback=
this.Ps.bind(this);this.b.cancel=this.Wp.bind(this);this.b.attachLogsClick=this.j.bind(this);this.b.viewLogs=this.D.bind(this);this.b.$watchGroup("videoSmoothness videoQuality audioQuality feedbackDescription comments feedbackType".split(" "),this.Yp.bind(this));this.b.sufficientFeedback=!1;this.b.$watch("attachLogs",this.j.bind(this));this.b.attachLogs=!0;this.o=re();this.b.userEmail="";chrome.identity.getProfileUserInfo(function(d){b.b.userEmail=d.email;bi(b)});this.b.yourAnswerText=Gg;this.b.language=
chrome.i18n&&chrome.i18n.getUILanguage?chrome.i18n.getUILanguage():chrome.runtime.getManifest().default_locale;this.b.requestLogsInProgress=!1;this.b.mrVersion=chrome.runtime.getManifest().version};h=ci.prototype;h.rk=function(a){for(var c=[],b=1;b<arguments.length;b++)c.push(new di(b,arguments[b]));c.push(new di(0,arguments[0]));return c};h.Wp=function(){this.b.feedbackDescription&&!confirm(xg)||window.close()};
h.Yp=function(){var a=this.b.feedbackType;this.b.sufficientFeedback="MirroringQuality"==a?this.b.videoSmoothness||this.b.videoQuality||this.b.audioQuality||this.b.comments:"Discovery"==a?this.b.visibleInSetup||this.b.comments:!!this.b.feedbackDescription};
h.Ps=function(){if(this.b.sufficientFeedback){var a=this.b.feedbackType,c="";"MirroringQuality"==a?(this.b.videoSmoothness&&(c+="\nVideo Smoothness: "+this.b.videoSmoothness),this.b.videoQuality&&(c+="\nVideo Quality: "+this.b.videoQuality),this.b.audioQuality&&(c+="\nAudio: "+this.b.audioQuality),this.b.projectedContentUrl&&(c+="\nProjected Content/URL: "+this.b.projectedContentUrl),this.b.comments&&(c+="\nComments: "+this.b.comments)):"Discovery"==a?(this.b.visibleInSetup&&(c+="\nChromecast Visible in Setup: "+
this.b.visibleInSetup),this.b.hasNetworkSoftware&&(c+="\nUsing VPN/proxy/firewall/NAS Software: "+this.b.hasNetworkSoftware),this.b.networkDescription&&(c+="\nNetwork Description: "+this.b.networkDescription),this.b.comments&&(c+="\nComments: "+this.b.comments)):c=this.b.feedbackDescription;a="Type: "+a+"\n\n"+c;this.b.sendDialogText=yg;this.b.okButton=Fg;this.b.feedbackSent=!1;this.w.show({locals:{FA:this.b.feedbackSent,XA:this.b.sendDialogText,sr:this.b.okButton},scope:this.b,preserveScope:!0,bindToController:!0,
template:'<md-dialog id="feedback-confirmation"><md-dialog-content><div id="send-feedback-text">{{sendDialogText}}</div><md-dialog-actions><md-button class="md-raised md-primary"ng-disabled="!feedbackSent" ng-click="closeWindow()">{{okButton}}</md-button></md-dialog-actions></md-dialog-content></md-dialog>',controller:this.g});this.mn(a,Date.now())}};h.mn=function(a,c){var b=Date.now();!this.b.requestLogsInProgress||5E3<b-c?ei(this,a):setTimeout(this.mn.bind(this),1E3,a,c)};
var ei=function(a,c){var b=0,d=function(f,g,k){k?f(!0):(a.b.sendDialogText=Bg,bi(a),g(Error("Failed to send")))},e=chrome.declarativeWebRequest?"MrTeamfood":"MRStable";(new df(function(){b++;return new Promise(function(f,g){var k=a.b.userEmail,m=a.f;f=d.bind(null,f,g);g=chrome.runtime.getManifest();$f({productId:85561,bucket:e,flow:"submit",serverUri:"https://www.google.com/tools/feedback",allowNonLoggedInFeedback:!0,locale:g.default_locale,enableAnonymousFeedback:!k,report:{description:c},callback:f},
{version:g.version,description:g.description,user_email:k||"NA",logs:m.fe||"NA",external_logs:m.b||"NA",device_model:m.modelName||"NA",receiver_version:m.w||"NA",dash_report_url:m.h||"NA",cast_device_counts:m.f,dial_device_counts:m.g,dialog_type:m.j||"Unknown"})})},1E4,4)).start().then(function(){Bb("MediaRouter.Ui.Action.Feedback");a.b.sendDialogText=Ag;a.b.feedbackSent=!0;bi(a)},function(){a.b.sendDialogText=zg;a.b.feedbackSent=!0;bi(a)})};
ci.prototype.j=function(){var a=this;this.f=new ag;this.b.attachLogs&&(this.b.requestLogsInProgress=!0,chrome.runtime.sendMessage(new pf(this.o,"retrieve_log_data"),function(c){a.b.requestLogsInProgress=!1;a.f.fe=c.logs||"no extension";a.f.fe+="\n";a.f.fe+=c.mediaSinkServiceStatus||"no media sink service status from browser";c.castStreamingLogs&&(a.f.h=c.castStreamingLogs);c.castDeviceCounts&&(a.f.f=c.castDeviceCounts);c.dialDeviceCounts&&(a.f.g=c.dialDeviceCounts);c.dialogType&&(a.f.j=c.dialogType);
if(c=c.device)if(c.model&&(a.f.modelName=c.model),c.version&&(a.f.w=c.version),!a.h){var b=re();a.h=!0;a.f.b=lf(c.ip,b,a.s.bind(a))}}))};
ci.prototype.D=function(){this.b.logs=this.f.fe;this.b.logsHeader=Cg;this.b.sendLogs=Dg;this.b.fineLogsWarning=Eg;this.b.okButton=Fg;this.w.show({locals:{yA:this.b.attachLogs,fe:this.b.logs,JA:this.b.includeFineLogs,TA:this.b.logsHeader,YA:this.b.sendLogs,GA:this.b.fineLogsWarning,sr:this.b.okButton},scope:this.b,preserveScope:!0,bindToController:!0,clickOutsideToClose:!0,template:'<md-dialog><md-dialog-content id="logs-dialog"><div class="subheading">{{logsHeader}}</div><div ng-show="includeFineLogs && attachLogs"id="feedback-fine-log-warning" class="informative">{{fineLogsWarning}}</div><pre>{{logs}}</pre><div class="send-logs"><md-checkbox type="checkbox" ng-model="attachLogs"ng-change="attachLogsClick()"><span>{{sendLogs}}</span></md-checkbox></div><md-dialog-actions><md-button class="md-raised md-primary"ng-click="closeDialog()">{{okButton}}</md-button></md-dialog-actions></md-dialog-content></md-dialog>',
controller:this.g})};ci.prototype.s=function(a,c){this.h=!1;this.f.b="error"==a?"":c;this.b.attachLogs||(this.f.b="");bi(this)};var bi=function(a){a.b.$$phase||a.b.$apply()};ci.prototype.g=function(a,c){a.closeWindow=function(){window.close()};a.closeDialog=function(){c.hide()}};ci.prototype.g.$inject=["$scope","$mdDialog"];var di=function(a,c){this.id=a;this.desc=c;this.text=0==a?c:a+" ("+c+")"};
angular.module("feedbackApp","chrome_18n material.components.button material.components.checkbox material.components.dialog material.components.input material.components.radioButton".split(" ")).controller("FeedbackCtrl",["$scope","$mdDialog",ci]);w("ng.safehtml.googSceHelper.isGoogHtmlType",function(a){return a&&a.Id?!0:!1});w("ng.safehtml.googSceHelper.isCOMPILED",function(){return!0});w("ng.safehtml.googSceHelper.unwrapAny",function(a){if(a instanceof fd)return gd(a).toString();if(a instanceof de)return ee(a).toString();if(a instanceof yd)return zd(a).toString();if(a instanceof Ed)return Fd(a);if(a instanceof Xc)return Yc(a).toString();throw Error();});
w("ng.safehtml.googSceHelper.unwrapGivenContext",function(a,c){if("html"==a)return ee(c).toString();if("resourceUrl"==a||"templateUrl"==a)return gd(c).toString();if("url"==a)return c instanceof fd?gd(c).toString():zd(c).toString();if("css"==a)return Fd(c);if("js"==a)return Yc(c).toString();throw Error();});