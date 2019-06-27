// LICENSE_CODE ZON
'use strict'; 
(function(){
var chrome = window.chrome;
var panels = chrome.devtools && chrome.devtools.panels;
if (!chrome || !chrome.runtime || !chrome.runtime.sendMessage || !panels)
    return;
chrome.runtime.sendMessage({devtool_pane: true}, function(response){
    if (!response || !response.create)
        return;
    panels.create('Unblocker', '/js/bext/vpn/pub/img/logo.png',
        '/js/bext/vpn/pub/dev_unblocker.html', function(panel){});
});

})();
