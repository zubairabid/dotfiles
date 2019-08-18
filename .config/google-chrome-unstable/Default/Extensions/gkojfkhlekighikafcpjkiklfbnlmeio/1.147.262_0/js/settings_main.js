// LICENSE_CODE ZON
'use strict'; 
(function(){
function init(){
    require.config({waitSeconds: 0});
    require.onError = window.hola.base.require_on_error;
    window.hola.t = {l_start: Date.now()};
    require(['config'], function(be_config){ settings_init(); });
}

function settings_init(){
    require(['/bext/vpn/pub/settings.js'], function(settings){
        settings.init(); });
}

init();
})();
