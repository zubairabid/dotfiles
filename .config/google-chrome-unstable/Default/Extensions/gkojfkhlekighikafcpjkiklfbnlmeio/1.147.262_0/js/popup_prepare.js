// LICENSE_CODE ZON
'use strict'; 
(function(){

function init(){
    var is_premium, is_trial;
    try {
        is_premium = +localStorage.getItem('ui_cache_is_premium')||0;
        is_trial = +localStorage.getItem('ui_cache_is_trial')||0;
    } catch(err){ console.error('localStorage error %s %s', err, err.stack); }
    if (is_premium)
        window.document.body.classList.add('user-premium');
    if (is_trial)
        window.document.body.classList.add('user-trial');
}
init();

})();
