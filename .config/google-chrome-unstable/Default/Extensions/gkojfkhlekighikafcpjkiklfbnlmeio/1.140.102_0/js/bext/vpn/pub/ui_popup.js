// LICENSE_CODE ZON
'use strict'; 
(function(){ 
    var chrome = window.chrome;
    window.is_popup = window.is_popup ||
        (chrome && chrome.extension.getBackgroundPage &&
        chrome.extension.getBackgroundPage()!==window);
    if (!window.is_popup) 
        return;
    window.require_is_remote = true;
    if (!window.$ || !window.$.url)
        require.undef('purl');
})();

if (require.support_path)
{
    define(['be_ui_popup_ext'], function(be_ui_popup_ext){
        return be_ui_popup_ext; });
}
else
{
define(['jquery', 'purl', 'spin', 'underscore', 'backbone', 'bootstrap',
    'config', 'be_ver'], function($, purl, spin, underscore, backbone,
    bootstrap, be_config, be_ver){
var E = {};
window.requirejs = window.require = window.define = undefined;
$('script').each(function(){ this.remove(); });
var script = $('<script>');
$('head').append(script);
script[0].onload = function(){
    define('jquery', function(){ return $; });
    define('purl', function(){ return purl; });
    define('spin', function(){ return spin; });
    define('underscore', function(){ return underscore; });
    define('backbone', function(){ return backbone; });
    define('bootstrap', function(){ return bootstrap; });
    define('config', function(){ return be_config; });
    define('be_ver', function(){ return be_ver; });
    require.config(be_config.config);
    require(['be_ui_popup_ext'], function(be_ui_popup){
        be_ui_popup.init();
    });
};
script[0].src = 'https://client.hola.org/bext/require.js?ver='+be_ver.ver;
E.init = function(){};
return E; });
}
