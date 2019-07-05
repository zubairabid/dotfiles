// LICENSE_CODE ZON ISC
'use strict'; 
(function(){
var define;
var is_node = typeof module=='object' && module.exports && module.children;
var is_ff_addon = typeof module=='object' && module.uri
    && !module.uri.indexOf('resource://');
if (is_node||is_ff_addon)
    define = require('./require_node.js').define(module, '../');
else
    define = self.define;
define(['/util/countries_locales.js'], function(countries_locales){
var E = {};
E.map_locale_to_country = {
    af: ['za'],
    ar: ['sa'],
    az: ['az'],
    be: ['be'],
    bg: ['bg'],
    bn: ['bd'],
    bs: ['ba'],
    ca: ['ad'],
    cs: ['cz'],
    cy: ['gb'],
    da: ['dk'],
    de: ['de'],
    el: ['gr'],
    en: ['gb', 'us', 'au'],
    es: ['es'],
    et: ['ee'],
    eu: ['es'],
    fa: ['ir'],
    fi: ['fi'],
    fr: ['fr'],
    ga: ['ie'],
    gl: ['es'],
    gu: ['in'],
    he: ['il'],
    hi: ['in'],
    hr: ['hr'],
    ht: ['ht'],
    hu: ['hu'],
    hy: ['am'],
    id: ['id'],
    is: ['is'],
    it: ['it'],
    ja: ['jp'],
    ka: ['ge'],
    km: ['kh'],
    kn: ['in'],
    ko: ['kr'],
    lt: ['lt'],
    lv: ['lv'],
    mk: ['mk'],
    mr: ['in'],
    ms: ['my'],
    mt: ['mt'],
    my: ['mm'],
    nl: ['nl'],
    no: ['no'],
    pl: ['pl'],
    pt: ['pt'],
    pt_br: ['br'],
    ro: ['ro'],
    ru: ['ru'],
    sk: ['sk'],
    sl: ['si'],
    sq: ['al'],
    sr: ['rs'],
    sv: ['se'],
    sw: ['ug', 'ke'],
    ta: ['lk', 'sg', 'in', 'my'],
    te: ['in'],
    th: ['th'],
    tl: ['ph'],
    tr: ['tr'],
    uk: ['ua'],
    ur: ['pk', 'in', 'fj'],
    vi: ['vn'],
    zh_cn: ['cn'],
    zh_tw: ['tw'],
};

E.map_locale_to_lang = {
    af: ['afrikaans', 'afr'],
    ar: ['arabic', 'ara'],
    az: ['azerbaijani', 'aze'],
    be: ['belarusian', 'bel'],
    bg: ['bulgarian', 'bul'],
    bn: ['bengali', 'ben'],
    bs: ['bosnian', 'bos'],
    ca: ['catalan', 'valencian', 'cat'],
    cs: ['czech', 'cze', 'ces'],
    cy: ['welsh', 'cym', 'wel'],
    da: ['danish', 'dan'],
    de: ['german', 'ger', 'deu'],
    el: ['greek', 'gre', 'ell'],
    en: ['english', 'eng'],
    es: ['spanish', 'spa'],
    et: ['estonian', 'est'],
    eu: ['basque', 'baq', 'eus'],
    fa: ['persian', 'farsi', 'farsi-persian', 'fsa', 'per'],
    fi: ['finnish', 'fin'],
    fr: ['french', 'fre', 'fra'],
    ga: ['irish', 'gle'],
    gl: ['galician', 'glg'],
    gu: ['gujarati', 'guj'],
    he: ['hebrew', 'heb', 'iw'],
    hi: ['hindi', 'hin'],
    hr: ['croatian', 'hrv'],
    ht: ['haitian', 'hat'],
    hu: ['hungarian', 'hun'],
    hy: ['armenian', 'arm', 'hye'],
    id: ['indonesian', 'ind'],
    is: ['icelandic', 'ice', 'isl'],
    it: ['italian', 'ita'],
    ja: ['japanese', 'jpn'],
    ka: ['georgian', 'geo', 'kat'],
    km: ['khmer', 'khm'],
    kn: ['kannada', 'kan'],
    ko: ['korean', 'kor'],
    lt: ['lithuanian', 'lit'],
    lv: ['latvian', 'lav'],
    mk: ['macedonian', 'mac', 'mkd'],
    mr: ['marathi', 'mar'],
    ms: ['malay', 'msa', 'may'],
    mt: ['maltese', 'mlt'],
    my: ['burmese', 'bur', 'mya'],
    nl: ['dutch', 'flemish', 'nld', 'dut'],
    no: ['norwegian', 'nor'],
    pl: ['polish', 'pol'],
    pt: ['portuguese', 'por'],
    pt_br: ['brazilian', 'brazilian-portuguese', 'pb', 'pob'],
    ro: ['romanian', 'ron', 'rum'],
    ru: ['russian', 'rus'],
    sk: ['slovak', 'slo', 'slk'],
    sl: ['slovenian', 'slv'],
    sq: ['albanian', 'alb', 'sqi'],
    sr: ['serbian', 'srp'],
    sv: ['swedish', 'swe'],
    sw: ['swahili', 'swa'],
    ta: ['tamil', 'tam'],
    te: ['telugu', 'tel'],
    th: ['thai', 'tha'],
    tl: ['tagalog', 'tgl'],
    tr: ['turkish', 'tur'],
    uk: ['ukrainian', 'ukr'],
    ur: ['urdu', 'urd'],
    vi: ['vietnamese', 'vie'],
    zh_cn: ['chinese', 'simplified chinese', 'chi', 'zho', 'zh', 'ze'],
    zh_tw: ['traditional chinese', 'zt'],
};

E.map_locale_to_short = {
    en: 'Eng',
    ru: 'Rus',
    es: 'Spa',
    pt_BR: 'Por',
    fr: 'Fra',
    tr: 'Tur',
    zh_CN: '简体中文',
    ja: '日本語',
    ko: '한국어'
};

E.browser_locale = function(lang){
    var navlang = (lang||navigator.language||'').replace('-', '_')
        .toLowerCase();
    var choices = [navlang, navlang.substr(0, navlang.indexOf('_'))];
    for (var i=0; i<choices.length; i++)
    {
        if (E.map_locale_to_lang[choices[i]])
            return choices[i];
    }
    return 'en';
};

E.to_locale = function(l){ return E.map[(l||'').toLowerCase()]; };

E.locale_to_country = function(l){
    return E.map_locale_to_country[l] ?
        E.map_locale_to_country[l][0] : null;
};

E.local_from_file_name = function(file_name){
    var a = file_name.split(/[ .,\-_]/), l = a.length;
    for (var i=0; i<l; i++)
    {
        if (E.to_locale(a[l-i-1]))
            return E.to_locale(a[l-i-1]);
    }
};

E.accept_lang_for_country = function(country){
    var loc = countries_locales.json[country.toUpperCase()];
    var r = [];
    if (loc)
    {
        if (loc.locale!=loc.lang)
            r.push(loc.locale);
        r.push(loc.lang + ';q=0.9');
        if (loc.fallback)
        {
            for (var i=0, fb=loc.fallback.split(','); i<fb.length; i++)
                r.push(fb[i] + ';q=0.' + (8-i));
        }
    }
    else
        r.push('en;q=0.9');
    return r.join(',');
};

function init(){
    E.map = {};
    for (var locale in E.map_locale_to_lang)
    {
        var a = E.map_locale_to_lang[locale];
        E.map[locale] = locale;
        for (var i=0; i<a.length; i++)
            E.map[a[i]] = locale;
    }
}

init();
return E; }); }());
