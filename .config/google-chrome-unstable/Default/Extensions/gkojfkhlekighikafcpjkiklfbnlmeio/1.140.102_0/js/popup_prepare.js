// LICENSE_CODE ZON
'use strict'; 
(function(){

function init(){
    var is_premium = +localStorage.getItem('ui_cache_is_premium')||0;
    var is_trial = +localStorage.getItem('ui_cache_is_trial')||0;
    if (is_premium)
        window.document.body.classList.add('user-premium');
    if (is_trial)
        window.document.body.classList.add('user-trial');
}
init();

})();
