// LICENSE_CODE ZON
'use strict'; 
(function(){
var define;
var is_node = typeof module=='object' && module.exports;
if (!is_node)
    define = self.define;
else
    define = require('../../util/require_node.js').define(module, '../');
define([], function(){
function cache_str_fn2(fn){
    var cache = {};
    return function(s1, s2){
        var cache2 = cache[s1] = cache[s1]||{};
        if (s2 in cache2)
            return cache2[s2];
        return cache2[s2] = fn(s1, s2);
    };
}
var E = {};

E._cmp = function(v1, v2){
    if (!v1 || !v2)
        return +!!v1 - +!!v2;
    var _v1 = v1.split('.'), _v2 = v2.split('.'), i;
    for (i = 0; i<_v1.length && i<_v2.length && +_v1[i] == +_v2[i]; i++);
    if (_v1.length==i || _v2.length==i)
        return _v1.length - _v2.length;
    return +_v1[i] - +_v2[i];
};
E.cmp = cache_str_fn2(E._cmp);

return E; }); }());
