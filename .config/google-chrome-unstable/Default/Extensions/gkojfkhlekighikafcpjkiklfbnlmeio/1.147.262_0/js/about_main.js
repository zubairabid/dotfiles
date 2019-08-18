// LICENSE_CODE ZON
'use strict'; 
(function(){
function init(){
    require.config({waitSeconds: 0});
    require.onError = window.hola.base.require_on_error;
    window.hola.t = {l_start: Date.now()};
    require(['config'], function(be_config){ about_init(); });
}

function about_init(){
    require(['/bext/vpn/pub/about.js'], function(about){ about.init(); }); }

init();
})();

