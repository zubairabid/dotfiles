// LICENSE_CODE ZON
'use strict'; 
define(['/bext/pub/util.js', '/util/storage.js'], function(be_util, storage){
var E = {};
var zopts = be_util.zopts;

E.have = function(be_ext, feature){
    var uuid = be_ext.get('uuid')||'';
    var test_enabled = storage.get('be_test');
    if (test_enabled && test_enabled==feature)
        return true;
    return E.uuid_check(uuid, feature);
};

E.uuid_check = function(uuid, feature){
    uuid = uuid||'';
    switch (feature)
    {
    case 'rule_rating_control': return zopts.get('rule_rating_control');
    case 'proxy_debug': return zopts.get('proxy_debug');
    case 'proxy_debug_timing': return zopts.get('proxy_debug_timing');
    default: return false;
    }
};

return E; });
