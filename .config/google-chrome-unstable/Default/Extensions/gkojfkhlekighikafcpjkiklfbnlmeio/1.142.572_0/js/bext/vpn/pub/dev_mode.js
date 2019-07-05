// LICENSE_CODE ZON
'use strict'; 
define(['/bext/pub/browser.js', '/bext/pub/backbone.js',
    '/bext/vpn/pub/info.js', '/bext/vpn/pub/tabs.js', '/svc/vpn/pub/util.js',
    '/util/storage.js'],
    function(B, be_backbone, be_info, be_tabs, svc_util, storage){
var chrome = window.chrome;
var E = new (be_backbone.task_model.extend({
    _defaults: function(){
        this.on('destroy', function(){
            B.backbone.server.stop('be_dev_mode');
        });
        B.backbone.server.start(this, 'be_dev_mode');
    },
}))();

function force_tpopup(type){
    var tab_url = be_tabs.get('active.url');
    var tab_id = be_tabs.get('active.id');
    if (!tab_url||!tab_id)
        return;
    var domain = svc_util.get_root_url(tab_url);
    be_info.set_force_tpopup(domain, type);
    chrome.tabs.reload(tab_id);
}

function update_context_menu(){
    if (!chrome||!chrome.contextMenus)
        return;
    chrome.contextMenus.removeAll();
    if (!E.get('dev_mode'))
        return;
    chrome.contextMenus.create({
        id: 'hola-vpn-dev-tpopup',
        title: 'Show tpopup',
        contexts: ['browser_action'],
        onclick: function(){ force_tpopup(); }
    });
    chrome.contextMenus.create({
        id: 'hola-vpn-dev-mitm-popup',
        title: 'Show mitm popup',
        contexts: ['browser_action'],
        onclick: function(){ force_tpopup('mitm_popup'); }
    });
    chrome.contextMenus.create({
        id: 'hola-vpn-dev-watermark-popup',
        title: 'Show watermark popup',
        contexts: ['browser_action'],
        onclick: function(){ force_tpopup('watermark'); }
    });
}

E.enable = function(val){
    E.set('dev_mode', val);
    storage.set('dev_mode', val);
};

E.init = function(){
    E.on('change:dev_mode', function(){ update_context_menu(); });
    if (!window.zon_config._RELEASE || storage.get('dev_mode'))
        E.set('dev_mode', true);
};

return E; });
