// LICENSE_CODE ZON
'use strict'; 
(function(){
function require_err(locale, err){
    try { localStorage.setItem('locale', 'en'); }
    catch(e){ console.error('failed set localStorage.locale '+e.stack); }
    if (window.hola && window.hola.base)
    {
        window.hola.base.perr({id: 'be_lang_err', info: ''+locale+err,
            bt: err.stack, filehead: 'userAgent: '+navigator.userAgent});
    }
}

define(['lang', '/bext/vpn/pub/locale/en.js'], function(be_lang, locale_en){
var E = get_message;
E.locale = 'en';
E.locales = be_lang.lang.slice();
E.locale_curr = E.locale_en = locale_en;

try { E.locale = localStorage.getItem('locale'); }
catch(e){ console.error('failed to read locale '+(e.stack||e)); }
if (!E.locales.includes(E.locale))
{
    var navlang = (navigator.language||'').replace('-', '_');
    var choices = [navlang, navlang.substr(0, navlang.indexOf('_')), 'en'];
    for (var i=0; i<choices.length; i++)
    {
        if (E.locales.includes(choices[i]))
        {
            E.locale = choices[i];
            break;
        }
    }
}

require(['/bext/vpn/pub/locale/'+E.locale+'.js'], function(locale_curr){
    E.locale_curr = locale_curr;
    try { localStorage.setItem('locale', E.locale); }
    catch(e){ console.error('failed to setup locale '+(e.stack||e)); }
}, function(err){
    require_err(E.locale, err);
    E.locale = 'en';
});

E.is_rtl = function(){ return /^(ar|he|fa|ur)$/.test(E.locale); };

function get_message(id, vals, locale){
    var s, o = E.locale_curr[id]||locale_en[id];
    if (locale)
        o = E.locale==locale&&E.locale_curr[id] || locale_en[id];
    if (!o)
    {
        if (false && window.hola.base.perr_once)
        {
            window.hola.base.perr_once({id: 'be_lang_missing',
                info: ''+E.locale+'|'+id.substr(0, 512),
                rate_limit: {count: 3}});
        }
        s = id;
    }
    else
	s = o.message;
    if (!vals)
        return s;
    for (var i=0; i<vals.length; i++)
        s = s.replace('$'+(i+1), vals[i]);
    return s;
}

E.capital = function(id, vals, locale){
    var s = get_message(id, vals, locale);
    return s ? s[0].toUpperCase()+s.substr(1) : s;
};

return E; }, require_err.bind(null, 'en'));
})();
