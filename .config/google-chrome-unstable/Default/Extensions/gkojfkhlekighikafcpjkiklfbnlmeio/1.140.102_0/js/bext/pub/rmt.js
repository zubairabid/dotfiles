// LICENSE_CODE ZON
'use strict'; 
window.require_is_remote = true;
if (require.support_path)
{
    define(['be_rmt_ext'], function(be_rmt_ext){ return be_rmt_ext; });
}
else
{
define(['jquery', 'purl', 'spin', 'underscore', 'backbone', 'bootstrap',
    'config', 'be_ver'],
    function($, purl, spin, underscore, backbone, bootstrap, be_config,
    be_ver){
var E = {};
window.requirejs = window.require = window.define = undefined;
$('script').each(function(){ this.remove(); });
var script = $('<script>');
$('head').append(script);
script[0].onload = function(){
    window.RMT = undefined;
    define('jquery', function(){ return $; });
    define('purl', function(){ return purl; });
    define('spin', function(){ return spin; });
    define('underscore', function(){ return underscore; });
    define('backbone', function(){ return backbone; });
    define('bootstrap', function(){ return bootstrap; });
    define('config', function(){ return be_config; });
    define('be_ver', function(){ return be_ver; });
    require.config(be_config.config);
    require(['/bext/vpn/pub/rmt_ext.js'], function(be_rmt_ext){
        window.RMT = be_rmt_ext;
	be_rmt_ext.init();
    });
};
script[0].src = 'https://client.hola.org/bext/require.js?ver='+be_ver.ver;
E.init = function(){};
return E; });
}

