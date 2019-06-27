// LICENSE_CODE ZON
'use strict'; 
(function(){
window.popup = {
    update_rules: function(){ return window.RMT.update_rules(false); }};
window.bg_rmt = {};
var conf = window.conf;

function load_rmt(){
    require.config({baseUrl: conf.url_bext, waitSeconds: 30,
        urlArgs: 'rand='+Math.random()});
    require(['be_ver'], function(be_ver){
        require.config({baseUrl: conf.url_bext, waitSeconds: 30,
            urlArgs: 'ver='+be_ver.ver});
        require(['config'], function(be_config){
            require(['/bext/pub/rmt.js'], function(be_rmt){
                window.RMT = be_rmt;
                window.RMT.init();
            });
        });
    });
}

function require_onload(){
    require.onError = function(err){
        console.error('rmt_require_err %s %s %o', err.message,
            err.requireModules, err);
        throw err;
    };
    require.undef('be_tabs');
    require.undef('be_browser');
    require.undef('be_util');
    require.undef('be_ext');
    require.undef('zerr');
    require.undef('etask');
    load_rmt();
}
require_onload();

})();
