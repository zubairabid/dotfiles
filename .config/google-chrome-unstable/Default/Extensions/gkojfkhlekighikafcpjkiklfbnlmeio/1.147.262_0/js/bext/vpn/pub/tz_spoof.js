// LICENSE_CODE ZON
'use strict'; 
(function(){
    var offset;
    if ((offset = document.currentScript.src) &&
        (offset = offset.match(/\?offset=(-?\d+)/)) && (offset = +offset[1]))
    {
        Date.prototype.getTimezoneOffset = function(){ return offset; };
    }
})();
