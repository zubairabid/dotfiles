// LICENSE_CODE ZON
'use strict'; 
(function(){
function init(){
    require.config({waitSeconds: 0});
    require.onError = window.hola.base.require_on_error;
    require(['conf', 'zon_config'], function(conf, zon_config){
        window.hola.t = {l_start: Date.now()};
        window.hola.no_be_ver = true;
        window.conf = conf;
        window.zon_config = zon_config;
        require(['config', 'be_ver'], function(be_config, be_ver){
            be_config.init(be_ver.ver, '');
            be_config.undef(['config']);
            window.is_local_ccgi = 1;
            require(['config'], function(_be_config){
                _be_config.init(be_ver.ver, '');
                about_init();
            });
        });
    });
}

function about_init(){
    require(['/bext/vpn/pub/about.js'], function(about){
        about.init();
    });
}

init();
})();

