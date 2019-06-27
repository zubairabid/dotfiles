// LICENSE_CODE ZON
'use strict'; 
(function(){

var param = /[?]orig_url=([^&]+)/.exec(location.search);
var link = decodeURIComponent(param ? param[1] : '');
if (link)
{
    var a = document.getElementById('link');
    a.href = link;
    a.style.display = 'inline';
}

})();
