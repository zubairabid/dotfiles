// LICENSE_CODE ZON
'use strict'; 
define(['/bext/pub/locale.js', 'jquery', '/bext/pub/lib.js',
    '/bext/pub/backbone.js', '/bext/pub/browser.js', '/util/etask.js',
    '/bext/vpn/pub/tabs.js', '/util/zerr.js', '/util/date.js',
    '/svc/account/pub/membership.js', '/bext/pub/ext.js', '/bext/pub/util.js',
    '/bext/vpn/pub/mode.js', '/bext/vpn/pub/bg_ajax.js', '/util/util.js',
    '/bext/vpn/pub/dev_mode.js', '/bext/pub/version_util.js',
    '/util/storage.js', '/bext/vpn/pub/force_lib.js', '/bext/vpn/pub/info.js'],
    function(T, $, be_lib, be_backbone, B, etask, be_tabs, zerr, date,
    membership, be_ext, be_util, be_mode, be_bg_ajax, zutil, dev_mode,
    be_version_util, storage, force_lib, info){
var assign = Object.assign;
var E = new (be_backbone.task_model.extend({
    _defaults: function(){
        this.on('destroy', function(){
            B.backbone.server.stop('be_premium');
            uninit();
        });
        B.backbone.server.start(this, 'be_premium');
    },
}))();
var membership_timeout, daily_refresh_timer;
var premium_link = 'https://hola.org/premium.html?utm_source=holaext'
    +'&ref={{medium}}_';
var promos = [
    {text: 'Get Unlimited Unblocking',
        link: premium_link+'get_unlimited_unblocking'},
    {text: 'Get 24/7 Unblocking', link: premium_link+'get_24_7_unblocking'},
    {text: 'Unblock more sites', link: premium_link+'access_more_sites'},
    {text: 'Love Hola?', link: premium_link+'love_hola'},
    {text: 'Go Hola PLUS', link: premium_link+'go_hola_premium'},
    {text: 'Upgrade', link: premium_link+'upgrade'},
    {text: 'Never be a peer', link: premium_link+'never_be_a_peer'},
    {text: 'Support Hola', link: premium_link+'support_hola'},
    {text: 'Get PLUS support', link: premium_link+'get_premium_support'},
    {text: 'Get Hola for Android',
        link: 'https://play.google.com/store/apps/details?'
        +'id=org.hola&referrer=utm_source%3Dbext%26'
        +'utm_medium%3D{{medium}}'},
    {text: 'Invite friends - free PLUS',
        link: 'https://hola.org/referral.html?ref=popup&utm_source=holaext'}
];

E.get_promo = function(medium){
    var promo;
    if (membership===undefined || membership.is_active(E.get('membership')))
        return {text: ''};
    promo = promos[Math.floor(Math.random()*promos.length)];
    return {text: T(promo.text),
        link: promo.link.replace('{{medium}}', medium)};
};

E.is_active = function(){
    return membership.is_active(E.get('membership')); };

E.is_paid = function(){ return membership.is_paid(E.get('membership')); };

function set_premium_disabled(){
    E.be_rule.set_rule({name: 'all_browser', country: 'us', del: true,
        enabled: false}, true);
    var rules = E.be_rule.get('rules');
    if (!rules || !(rules = rules.unblocker_rules))
        return;
    var update;
    for (var name in rules)
    {
        var site_conf, r = rules[name];
        if (!r.enabled || !E.get_force_premium_rule(r.name) &&
            !((site_conf = be_util.get_site_conf(be_ext, r.name)) &&
            site_conf.require_plus))
        {
            continue;
        }
        E.be_rule.set_rule({name: r.name, country: r.country, enabled: false});
        update = true;
    }
    if (update)
        E.be_rule.fetch_rules();
}

E.logout_user = function(){
    set_premium_disabled();
    return be_bg_ajax.hola_api_call('users/logout/inline', {method: 'POST',
        text: true});
};

E.refresh_user = function(opt){
    opt = assign({}, opt);
    var user_id = be_ext.get('user_id'), new_user_id;
    return etask({name: 'refresh_user', cancel: true}, [function(){
        return info.get_user_data({
            data: {uuid: be_ext.get('uuid'),
            source: 'be_premium',
            cid: be_mode.get('svc.cid')||undefined}});
    }, function(_user){
        new_user_id = zutil.get(_user, 'user._id');
        be_ext.set('user_id', new_user_id||'');
        E.set('user', _user&&_user.user);
    }, function(){
        if (user_id!=new_user_id || opt.force_premium)
            return be_bg_ajax.hola_api_call('users/payment/get_membership');
        return E.get('membership');
    }, function(_membership){
        var old_is_active = E.is_active();
        E.set('membership', _membership);
        be_ext.set('is_premium', E.is_active());
        if (old_is_active!==E.is_active())
        {
            if (opt.exp_synced)
            {
                be_lib.perr(zerr.L.ERR, {id: 'premium_out_of_sync',
                    info: {membership: _membership}});
            }
            if (old_is_active)
                set_premium_disabled();
        }
        be_lib.perr(zerr.L.NOTICE, {id: 'membership',
            info: {membership: _membership, user: E.get('user')}});
        return _membership;
    }, function finally$(){
        E.trigger('user_updated');
    }, function catch$(err){
        be_lib.perr(zerr.L.ERR, {id: 'refresh_user_fail',
            info: zerr.e2s(err)});
        clearTimeout(membership_timeout);
        membership_timeout = setTimeout(function(){
            E.sp.spawn(E.refresh_user(opt)); }, Math.random()*date.ms.HOUR);
    }]);
};

E.refresh_anonymous = function(opt){
    return etask({name: 'refresh_anonymous', cancel: true}, [function(){
        return info.autologin_capable();
    }, function(res){
        if (res)
            return E.refresh_user(opt);
    }]);
};

function is_blacklist(root_url, host){
    if (!root_url)
        return false;
    host = host||root_url; 
    if (be_ext.get('is_premium'))
        return false;
    var blacklist = (E.be_rule.get('rules')||{}).blacklist||{};
    return blacklist[host] || blacklist[root_url];
}

function get_force_rule(conf_name, root_url, opt){
    if (is_blacklist(root_url))
    {
        rule = {id: root_url, domain: new RegExp(root_url), blacklist: true};
        return rule;
    }
    opt = opt||{};
    var rule = force_lib.find_rule(root_url, be_ext.get('bext_config'),
        conf_name, storage.get('src_country'));
    if (!rule)
        return false;
    var install_ver = storage.get('install_version');
    if (!opt.ignore_install_version && rule.install_ver_min && install_ver &&
        be_version_util.cmp(install_ver, rule.install_ver_min)<0)
    {
        return false;
    }
    var site_conf = be_util.get_site_conf(be_ext, root_url);
    if (!site_conf)
        return rule;
    var suggestion_conf = be_util.get_suggestion_conf(site_conf,
        info.get('country'));
    if (suggestion_conf)
        return false;
    return rule;
}

E.get_force_premium_rule = get_force_rule.bind(this, 'force_premium');
E.get_force_privacy_rule = get_force_rule.bind(this, 'get_privacy');

E.get_force_premium_rules = function(root_urls, opt){
    return root_urls.map(function(root_url){
        return E.get_force_premium_rule(root_url, opt); });
};

E.init = function(be_rule){
    E.be_rule = be_rule;
    E.sp = etask('be_premium', [function(){ return this.wait(); }]);
    info.on('inited', function(){ E.sp.spawn(E.refresh_user()); });
    daily_refresh_timer = setInterval(
        E.refresh_user.bind(E, {force_premium: true}), date.ms.DAY);
    E.listenTo(be_tabs, 'updated', function(obj){
        if (!obj.info.url)
            return;
        if (obj.info.url.match(/^https:\/\/hola.org\/premium.html/))
        {
            E.set('membership', undefined);
            clearTimeout(membership_timeout);
            membership_timeout = setTimeout(function(){
                E.sp.spawn(E.refresh_user({force_premium: true}));
            }, date.ms.HOUR);
        }
    });
};

function uninit(){
    E.sp.return();
    clearTimeout(membership_timeout);
    clearInterval(daily_refresh_timer);
}

return E; });
