// LICENSE_CODE ZON
'use strict'; 
define(['jquery', 'underscore', '/bext/pub/backbone.js', '/util/etask.js',
    '/bext/vpn/pub/util.js', '/svc/vpn/pub/util.js',
    '/bext/pub/version_util.js', '/util/zerr.js', '/bext/pub/util.js',
    '/bext/pub/locale.js', '/bext/pub/browser.js', '/util/url.js',
    '/util/string.js', '/bext/pub/popup_lib.js', '/protocol/pub/countries.js',
    '/svc/vpn/pub/search.js', '/util/date.js', '/util/util.js', 'backbone',
    '/util/user_agent.js', '/util/storage.js', '/util/util.js',
    '/bext/pub/ga.js', '/util/escape.js', '/bext/vpn/pub/ui_obj.js',
    '/bext/vpn/pub/site_premium_ui.js',
    '/bext/vpn/pub/debug_ui.js', '/bext/vpn/pub/ui_lib.js',
    '/bext/vpn/pub/templates.js', '/bext/vpn/pub/privacy.js'],
    function($, _, be_backbone, etask, be_vpn_util, svc_util, be_version_util,
    zerr, be_util, T, B, zurl, string, be_popup_lib, pcountries, search, date,
    util, Backbone, user_agent, storage, zutil, ga, zescape, be_ui_obj,
    site_premium_ui, debug_ui, ui_lib, templates, privacy)
{
B.assert_popup('be_ui_vpn');
templates = templates.default;
ui_lib = ui_lib.default;

var E = new (be_backbone.model.extend({
    _defaults: function(){
        this.$el = $('<div>', {class: 'be_ui_vpn'});
        this.$top = $('<div>');
        this.$main = $('<div>');
        this.$el.append(this.$top, this.$main);
    },
}))();
ui_lib.set_api(E);
var SEC = date.ms.SEC, assign = Object.assign;
var browser = be_util.browser();
var chrome = window.chrome, is_tpopup = window.is_tpopup;
var animation_time = 150;
var is_unblocking;
var plus_ref = be_vpn_util.plus_ref;

function get_tab_id(){
    return is_tpopup && zutil.get(window, 'hola.tpopup_opt.tab_id ') ||
        E.be_tabs&&E.be_tabs.get('active.id');
}
E.get_tab_id = get_tab_id;

function ff_dropdown_resize_cb(){
    var opened = $('.dropdown.open').length||$('.navbar-nav li.open').length;
    if (!opened)
        $('.f_ff_dropdown_fixup').remove();
    else if (!$('.f_ff_dropdown_fixup').length)
        $('<div>', {class: 'f_ff_dropdown_fixup'}).appendTo($('body'));
    ff_dropdown_resize();
}

function ff_dropdown_resize(){
    if (chrome || be_version_util.cmp(be_util.version(), '1.2.726')>=0)
        return;
    setTimeout(ff_dropdown_resize_cb, 500);
}

function g_switch_cb(){
    if (E.be_ext.get('ext.conflict'))
        return;
    E.loader.enable(true);
    zerr.notice('tab:%d on/off clicked', get_tab_id());
    set_user_cmd({label: 'g_switch', cmd: 'on_off', country: ''});
    if (E.protect_ui.is_enabled_for_pc())
        E.protect_ui.set_enabled_for_pc(false);
}

E.get_enabled_rule = function(url, opt){
    if (typeof url == 'object')
    {
        opt = url;
        url = undefined;
    }
    opt = opt || {};
    var country;
    if (!opt.ignore_protect_pc && (country = E.protect_ui.get_vpn_country()))
        return {country: country, type: 'protect_pc'};
    if (is_mitm_active_manual())
        return {country: 'us', is_mitm: true, tab_id: get_tab_id()};
    var rules = be_vpn_util.get_rules(E.be_rule.get('rules'), url ||
        E.get_url(), opt.ignore_all_browser);
    if (!rules || !rules[0] || !rules[0].enabled || !E.be_ext.get('r.vpn.on'))
        return null;
    return rules[0];
};

E.get_rule = function(proxy_country){
    var all_rules = be_vpn_util.get_all_rules({proxy_country: proxy_country,
        rules: E.be_rule.get('rules'), url: E.get_url(),
        root_url: E.get_root(), rule_ratings: E.get('rule_ratings'),
        groups: E.get('rule_ratings.groups')});
    return all_rules && all_rules[0];
};

function bext_config_update(){
    if (be_version_util.cmp(be_util.version(), '1.115.359')<=0)
        return;
    E.be_vpn.ecall('force_bext_config_update', []);
}

var tab_wait = {};
E.init = function(ui_popup){
    if (E.inited)
        return;
    var be_bg_main = window.popup_main&&window.popup_main.be_bg_main;
    E.on('destroy', uninit);
    E.inited = true;
    E.sp = etask('be_ui_vpn', [function(){ return this.wait(); }]);
    E.ui_popup = ui_popup;
    E.R = ui_popup.R;
    E.be_vpn = ui_popup.be_vpn;
    E.be_rule = ui_popup.be_rule;
    E.be_info = ui_popup.be_info;
    E.be_tabs = ui_popup.be_tabs;
    E.be_ext = ui_popup.be_ext;
    E.be_svc = ui_popup.be_svc;
    E.be_mode = ui_popup.be_mode;
    E.be_premium = ui_popup.be_premium;
    E.be_dev_mode = ui_popup.be_dev_mode;
    E.be_trial = ui_popup.be_trial;
    E.conf = E.R.get('conf');
    ff_dropdown_resize();
    pcountries.add_il();
    init_footer();
    init_status();
    init_state();
    init_country();
    init_verify_proxy();
    init_tpopup();
    E.protect_ui.init();
    E.be_rule.trigger('fetch_rules');
    E.on_init('change:country change:active.root_url', _.debounce(E.ui_init));
    E.on_init('change:country change:active.url', _.debounce(function(){
        return E.sp.spawn(rule_rating_cb()); }));
    E.on('change:status', _.debounce(busy_slow_cb));
    E.listen_to(E.be_tabs, 'change:active.status', loading_site_slow_cb);
    E.on('change:active.user_url', active_url_cb);
    E.on('change:force_premium_rule', E.render);
    E.on('change:mitm_site', E.render);
    E.on('change:mitm_active_manual', E.render);
    E.listen_to(be_bg_main, 'change:agree_ts', E.render);
    E.listen_to(E.be_tabs, 'change:active.url', active_url_cb);
    E.listen_to(E.be_vpn, 'change:mitm_site', mitm_site_cb);
    E.listen_to(E.be_vpn, 'change:mitm_active_manual', mitm_active_manual_cb);
    E.listenTo(E.be_tabs, 'completed error_occured', function(info){
        if (!info || !info.tabId)
            return;
        var task;
        if (!info.frameId && (task = tab_wait[info.tabId]))
            task.continue();
        if (!(task = fix_tasks[info.tabId]))
            return;
        if (!task.fix_waiting)
            return;
        task.continue();
    });
    E.listenTo(E.be_info, 'change:status', status_cb);
    E.listenTo(E.be_rule, 'change:status', status_cb);
    E.listenTo(E.be_info, 'change:status_opt', status_cb);
    E.listenTo(E.be_rule, 'change:status_opt', status_cb);
    E.listenTo(E.be_svc, 'change:status', status_cb);
    E.listenTo(E.be_ext, 'change:is_premium', E.render);
    E.listenTo(E.be_svc, 'change:update_vpn_status', E.render);
    E.listenTo(E.be_svc, 'change:vpn_country', E.render);
    E.listenTo(E.be_vpn, 'change:mitm_ext_ui_enabled', E.render);
    setTimeout(function(){
        E.on_init('change:state change:status change:rule_ratings.root_url '+
            'change:rule_ratings.groups change:unblocking_rate', E.render);
        E.listenTo(E.be_tabs, 'change:active.status', E.render);
    }, 10);
    render_warnings();
    add_user_nav();
    add_trial_timer();
    E.unblock_protect_view = new unblock_protect_view_class({});
    E.$top.append(E.unblock_protect_view.$el);
    $('#g_switch').click(g_switch_cb);
    bext_config_update();
    E.be_ext.set('ui_open', {ts: Date.now(), tab_id: get_tab_id()});
    init_monitor_active();
};

E.ui_init = function(){
    set_user_cmd({label: 'ui_init', cmd: '', country: '', no_busy: true});
    var r, u = E.get_url().slice(0, 100);
    if (r = E.get_enabled_rule())
    {
        zerr.notice('tab:%d ui init %s, rule %s: %s, %s, %s', get_tab_id(), u,
            r.description, r.name, r.mode, r.country);
    }
    else
        zerr.notice('tab:%d ui init %s, no rule', get_tab_id(), u);
    return etask([function(){
        return get_force_premium_rule();
    }, function(rule){
        E.set('force_premium_rule', rule);
    }]);
};

function uninit(){
    E.sp.return();
    E.inited = false;
    var be_bg_main;
    if (be_bg_main = window.popup_main&&window.popup_main.be_bg_main)
        be_bg_main.fcall('dump_log', [zerr.log]);
    uninit_monitor_active();
    curr_view_remove();
    if (E.unblock_protect_view)
    {
        E.unblock_protect_view.remove();
        E.unblock_protect_view = null;
    }
    E.$top.empty();
    E.$main.empty();
    E.protect_ui.uninit();
    uninit_tpopup();
    $('#g_switch').off('click', g_switch_cb);
    $('.popup-status').remove();
    $('.r_warnings').remove();
    E.off();
    E.stopListening();
}

function init_monitor_active(){
    var data = storage.get_json('monitor_active')||{};
    data.ui_open_ts = Date.now();
    storage.set_json('monitor_active', data);
}

function uninit_monitor_active(){
    var data = storage.get_json('monitor_active')||{};
    data.ui_close_ts = Date.now();
    storage.set_json('monitor_active', data);
}

var update_status = function(){
    var prev = E.get('status');
    var s1 = E.be_rule.get('status'), s2 = E.be_info.get('status'),
        s3 = E.be_svc.get('status');
    var _new = [s1, s2, s3].includes('error') ? 'error' :
        [s1, s2, s3].includes('busy') ? 'busy' : 'ready';
    zerr.notice('tab:%d status %s > %s (%s %s %s)', get_tab_id(), prev, _new,
        s1, s2, s3);
    E.set({prev_status: prev, status: _new,
        status_opt: E.be_rule.get('status_opt')||E.be_info.get('status_opt')});
};
var status_cb = _.debounce(update_status);

function busy_slow_cb(){
    busy_slow_cb.timer = clearTimeout(busy_slow_cb.timer);
    if (E.get('status')!='busy')
        return;
    busy_slow_cb.timer = setTimeout(function(){
        be_popup_lib.perr_err({id: 'be_ui_vpn_busy_slow'});
        busy_slow_cb.timer = setTimeout(function(){
            be_popup_lib.perr_err({id: 'be_ui_vpn_busy_very_slow'});
        }, 13*SEC);
    }, 7*SEC);
}

function loading_site_slow_cb(){
    if (!chrome) 
        return;
    loading_site_slow_cb.timer = clearTimeout(loading_site_slow_cb.timer);
    if (E.be_tabs.get('active.status')=='complete')
        return;
    loading_site_slow_cb.timer = setTimeout(function(){
        delete loading_site_slow_cb.timer;
        var r = E.get_enabled_rule();
        if (!r)
            return;
        be_popup_lib.perr_err({id: 'be_ui_vpn_loading_slow', info: {
            root_url: E.get_root(), url: E.get_url(),
            rule: {name: r.name, country: r.country}}});
    }, 15*SEC);
}

function active_url_cb(){
    var prev = E.get_root();
    var tpopup_url = window.hola && window.hola.tpopup_opt &&
        window.hola.tpopup_opt.url;
    var qs = !is_tpopup && (zurl.parse(window.top.location.href).search||'');
    var url = tpopup_url || E.get('active.user_url') ||
        qs && zurl.qs_parse(qs).url || E.be_tabs.get('active.url') || '';
    E.set({'active.url': url, 'active.root_url': svc_util.get_root_url(url)});
    if (prev && prev!=E.get_root() && !E.get('active.user_url'))
    {
        var info = {root_url: E.get_root(), root_url_prev: prev,
            ext_enabled: E.be_ext.get('r.ext.enabled')};
        if (window.hola)
            info.t = Date.now()-window.hola.t.l_start;
        be_popup_lib.perr_err({id: 'be_ui_vpn_root_url_changed', info: info});
    }
}

function mitm_site_cb(){
    return etask([function(){
        return E.be_vpn.ecall('is_mitm_site', [E.get_url()]);
    }, function(res){
        E.set('mitm_site', res);
    }]);
}

function mitm_active_manual_cb(){
    return etask([function(){
        return E.be_vpn.ecall('is_mitm_active_manual', [get_tab_id()]);
    }, function(res){
        E.set('mitm_active_manual', res);
    }]);
}

function is_mitm_active_manual(){
    return E.be_vpn.get('mitm_ext_ui_enabled') && E.get('mitm_active_manual');
}

function is_mitm_site(){
    return E.be_vpn.get('mitm_ext_ui_enabled') && E.get('mitm_site');
}

function Protect_ui(){}
Protect_ui.prototype.init = function(){
    this.protect_pc = E.be_vpn.get('protect_pc');
    this.protect_browser = E.be_vpn.get('protect_browser');
    if (this.protect_pc)
        E.sp.spawn(this.update_state());
};
Protect_ui.prototype.uninit = function(){};
Protect_ui.prototype.update_state = function(){
    if (!this.protect_pc)
        return;
    if (this._sp)
        return this._sp;
    var _this = this;
    return this._sp = etask([function try_catch$(){
        return E.be_svc.fcall('callback');
    }, function(info){
        _this.has_exe = !this.error && !!info;
        _this.version = zutil.get(info, 'version');
        _this.supported_exe = _this.has_exe &&
            be_version_util.cmp(_this.version, '1.127.714') >= 0;
    }, function finally$(){
        _this._sp = null;
    }]);
};
Protect_ui.prototype.is_enabled = function(){
    if (!E.be_ext.get('is_premium'))
        return false;
    if (this.is_enabled_for_root_url())
        return true;
    if (this.is_enabled_for_pc())
        return true;
    return false;
};
Protect_ui.prototype.is_enabled_for_root_url = function(opt){
    if (is_tpopup && typeof this.tpopup_is_enabled!='undefined')
        return this.tpopup_is_enabled;
    var s;
    return (s = E.be_vpn.get('protected_ui_state')) && s[E.get_root()] ||
        (s = E.get_enabled_rule(opt)) && s.mode=='protect';
};
Protect_ui.prototype._is_enabled_for_browser = function(){
    var rule = E.get_enabled_rule();
    return be_vpn_util.is_all_browser(rule);
};
Protect_ui.prototype.is_enabled_for_browser = function(){
    if (!this.protect_browser)
        return false;
    if (this.is_enabled_for_pc())
        return true;
    return this._is_enabled_for_browser();
};
Protect_ui.prototype.is_enabled_for_pc = function(){
    return !!(this.protect_pc && E.be_svc.get('vpn_country'));
};
Protect_ui.prototype.set_enabled = function(enable, host, hosts, is_mitm){
    if (!enable)
    {
        if (this.is_enabled_for_root_url({ignore_all_browser: true}))
        {
            this.set_enabled_for_root_url(false, {host: host, hosts: hosts,
                is_mitm: is_mitm});
        }
        if (this.is_enabled_for_browser())
            this.set_enabled_for_browser(false);
        return;
    }
    return this.set_enabled_for_root_url(true, {host: host, hosts: hosts,
        is_mitm: is_mitm});
};
Protect_ui.prototype.set_enabled_for_root_url = function(enable, opt){
    opt = opt||{};
    var host = opt.host, hosts = opt.hosts, is_mitm = opt.is_mitm;
    return etask([function(){
        if (enable && is_mitm_active_manual())
        {
            return E.be_vpn.fcall('mitm_manual_stop', [E.get_url(),
                get_tab_id()]);
        }
    }, function(){
        this.tpopup_is_enabled = enable;
        return E.be_vpn.fcall('set_url_protected', [E.get_root(), enable]);
    }, function(){
        if (!is_mitm)
        {
            return set_unblock(true, {use_full_vpn: enable, host: host,
                hosts: hosts, ignore_all_browser: true,
                ignore_protect_pc: true});
        }
    }, function(){
        E.render();
    }]);
};
Protect_ui.prototype.set_enabled_for_browser = function(enable){
    E.loader.enable(true);
    set_user_cmd({label: enable ? 'all_browser' : 'all_browser_disable',
        cmd: '', no_busy: true});
    var _this = this;
    var rule = E.get_enabled_rule({ignore_protect_pc: true});
    return etask([function(){
        return E.be_vpn.fcall('set_enabled_for_browser', [enable,
            enable && {country: rule.country,
            default_protect: _this.is_default()}]);
    }, function(){
        if (!enable && be_vpn_util.is_all_browser(rule))
            return rule_rating_cb();
    }]);
};
Protect_ui.prototype.set_enabled_for_pc = function(enable, opt){
    opt = opt || {};
    E.loader.enable(true);
    set_user_cmd({label: enable ? 'vpn_connect' : 'vpn_disconnect',
        cmd: '', no_busy: true});
    return E.be_vpn.fcall('set_enabled_for_pc',
        [enable, {country: opt.country || get_selected_country(),
        default_protect: this.is_default()}]);
};
Protect_ui.prototype.get_vpn_country = function(){
    return this.is_enabled_for_pc() && E.be_svc.get('vpn_country');
};
Protect_ui.prototype._get_root_url = function(){
    if (this.is_enabled_for_pc())
        return 'protect_pc';
    else if (this.is_enabled_for_browser())
        return 'protect_browser';
    return E.get_root();
};
Protect_ui.prototype.is_default = function(){
    var root_url = this._get_root_url();
    var s = E.be_vpn.get('protected_ui_state');
    return s && s.default && s.default[root_url];
};
Protect_ui.prototype.set_default = function(val){
    var root_url = this._get_root_url();
    if (!val == !this.is_default())
        return;
    return E.be_vpn.fcall('set_default_protect', [root_url, val]);
};
E.protect_ui = new Protect_ui();

function Tab_unblocker_handler(){}
Tab_unblocker_handler.prototype.fix_vpn = function(){
    E.loader.enable(true);
    if (be_version_util.cmp(be_util.version(), '1.120.511')<0)
        return fix_vpn_old();
    var rule, root_url;
    if (!(rule = E.get_enabled_rule()) || !(root_url = E.get_root()))
    {
        return void be_popup_lib.perr_err({id: 'be_ui_vpn_no_rule',
            info: {country: E.get('country'), root_url: root_url,
            url: E.get_url()}});
    }
    return etask('fix_vpn', [function(){
        set_ui_status('busy', {desc: 'Finding new peers...'});
        return E.be_rule.ecall('fix_vpn', [{rule: rule, root_url: root_url,
            tab_id: get_tab_id(), url: E.get_url(),
            src_country: (E.get('country')||'').toLowerCase()}]);
    }, function(){
        return etask.sleep(3000);
    }, function finally$(){
        set_ui_status();
    }, function catch$(err){
        be_popup_lib.perr_err({id: 'be_ui_fix_vpn_err', err: err});
    }]);
};

function Protect_pc_handler(){}
Protect_pc_handler.prototype.fix_vpn = function(){
    if (!E.protect_ui.supported_exe)
        return;
    E.loader.enable(true);
    return E.be_svc.fcall('vpn_change_agent', []);
};

function get_handler(){
    if (E.protect_ui.is_enabled_for_pc())
        return new Protect_pc_handler();
    return new Tab_unblocker_handler();
}

E.get_url = function(){ return E.get('active.url')||''; };
E.get_root = function(){ return E.get('active.root_url')||''; };
E.get_host = function(){ return zurl.get_host(E.get_url()); };

E.set_active_url = function(root_url, country, disable){
    var url = 'http://'+root_url+'/';
    var rule_enabled;
    var tab_id = get_tab_id();
    zerr.debug('tab:%d set_active_url %s %s', tab_id, root_url, country);
    return etask([function(){
        return show_force_premium({country: country, root_url: root_url});
    }, function(is_shown){
        if (is_shown)
            return this.return();
    }, function(){
        return E.be_trial.ecall('need_trial', [root_url]);
    }, function(need_trial){
        if (need_trial)
        {
            force_trial(root_url, tab_id);
            return this.return();
        }
        return rule_rating_cb(url, root_url);
    }, function(){
        var popular = get_popular_country(root_url);
        country = country || popular[0].proxy_country;
        rule_enabled = E.get_enabled_rule(url);
        return set_country_rule(country, {disable: disable,
            rule_enabled: rule_enabled, host: root_url});
    }, function(){
        if (!rule_enabled)
            return;
        B.tabs.update(tab_id, {url: url, active: true});
    }, function catch$(err){
        zerr.notice('tab:%d set_active_url err, %s', tab_id, err);
        be_popup_lib.perr_err({id: 'be_set_active_url_err', info: root_url,
            err: err});
    }]);
};

function init_search(search_container, opt){
    var country = (E.get('country')||'us').toLowerCase();
    var s = new search.search({country: country,
        settings: assign({}, opt,
        {no_redir: true, suggest_remote: E.conf.url_ccgi+
            '/autocomplete?src_country='+(country||'us')+'&search=%QUERY'}),
        on_select: function(d){
            d = zurl.parse(d).host;
            if (!zurl.is_valid_domain(d))
                return E.set('active.user_url', '');
            s.$input.blur();
            E.set_active_url(d);
            be_popup_lib.perr_ok({id: 'be_search', info: d});
    }});
    s.render(search_container);
    return s;
}

function open_reporting_form(){
    be_popup_lib.perr_err({id: 'be_report_problem',
        rate_limit: {count: 1}});
    var url = 'about.html?'+zescape.qs({url: E.get_url()});
    be_util.open_be_tab({url: url+'#report_issue', force_active: true});
}

function get_unblocking_rate(){
    var limit = 6;
    return etask([function(){
        return E.be_info.ecall('get_unblocking_rate', [limit]);
    }, function(unblocking_rate){ E.set('unblocking_rate', unblocking_rate);
    }]);
}

function rule_rating_cb(url, root_url){
    var rule_ratings;
    return etask({cancel: true}, [function(){
        if (!E.get('country'))
            return this.return();
        root_url = root_url||E.get_root();
        if (E.skip_url({url: url}))
            return this.return(get_unblocking_rate());
        if (E.get('rule_ratings.root_url')==root_url)
            return this.return();
        var cache = storage.get_json('popup_rating_cache');
        if (cache && root_url==cache.root_url)
        {
            E.set({'rule_ratings.root_url': cache.root_url,
                rule_ratings: cache.rule_ratings,
                'rule_ratings.groups': cache.groups});
        }
        var rule_enabled = E.get_enabled_rule();
        return E.be_rule.ecall('get_rule_ratings',
            [{root_url: root_url, src_country: E.get('country'), limit: 20,
            proxy_country: rule_enabled&&rule_enabled.country,
            vpn_only: true}]);
    }, function(ratings){
        var invalid_countries = [];
        rule_ratings = ratings && ratings.filter(function(r){
            var country = r.proxy_country.toUpperCase();
            if (pcountries.proxy_countries.bext.includes(country))
                return true;
            invalid_countries.push(country);
        });
        if (invalid_countries.length)
        {
            be_popup_lib.perr_err({id: 'be_ui_vpn_rating_invalid_countries',
                info: {invalid_countries: invalid_countries},
                rate_limit: {count: 1}});
        }
        E.set({rule_ratings: ratings, 'rule_ratings.root_url': root_url});
        if (!ratings)
            return this.return();
        return E.be_rule.ecall('get_groups_from_ratings', [ratings]);
    }, function(groups){
        E.set({'rule_ratings.groups': groups});
        if (!rule_ratings||!groups)
            return;
        storage.set_json('popup_rating_cache',
            {rule_ratings: rule_ratings, root_url: root_url, groups: groups});
        rule_ratings.forEach(function(country_ratings){
            _.forEach(country_ratings.rules, function(r){
                if (r.rating<=0||!groups)
                    return;
                if (!svc_util.find_rule(groups.unblocker_rules, r))
                {
                    be_popup_lib.perr_err({id: 'be_ui_vpn_rating_no_rule',
                        info: {rule: r, ratings: rule_ratings,
                        groups: groups}});
                    return;
                }
            });
        });
    }, function catch$(err){
        E.set({rule_ratings: undefined, 'rule_ratings.root_url': root_url});
        be_popup_lib.perr_err({id: 'be_ui_vpn_rule_ratings_err', err: err,
            info: root_url});
    }]);
}

E.set_err = function(id, err){
    E.set('error', id);
    E.ui_popup.set_err(id, err);
};

function init_footer(){
    var cb = _.debounce(function(){
        E.footer_inited = true;
        update_footer();
    });
    E.listenTo(E.be_rule, 'change:rules', cb);
    E.on_init('change:active.url', cb);
}

function init_status(){
    if (!E.loader)
    {
        var $status = $('<div>', {class: 'popup-status'});
        E.loader = new loader_view_class();
        E.loader.render($status);
        $status.insertBefore('#popup');
    }
    var cb = _.debounce(function(){
        var loader_options = {timeout: E.protect_ui.is_enabled_for_pc() ?
            30*SEC : 15*SEC};
        if (!E.loader || !E.loader.enabled)
            return;
        var ui_status = E.get('ui_status');
        var loading = chrome && E.be_tabs.get('active.status')!='complete'
            ||E.redirect_page();
        if (E.get('hide_loader'))
            E.loader.stop(true);
        else if (E.get('status')=='busy' || ui_status=='busy')
            E.loader.start(loader_options);
        else if (false && loading && E.get('state')=='enable')
            E.loader.start(loader_options);
        else if (!E.get('more_opt_delay_wait'))
            E.loader.finish();
    });
    E.on_init('change:status change:status_opt change:ui_status '+
        'change:ui_status_opt change:state change:hide_loader '+
        'change:more_opt_delay_wait', cb);
    E.listenTo(E.be_tabs, 'change:active.status', cb);
}

function update_footer(){
    if (!E.footer_inited || !E.is_visible)
        return;
    $('#content').show();
    var conf = E.be_ext.get('bext_config');
    var dev_mode = E.be_dev_mode && E.be_dev_mode.get('dev_mode');
    var $debug, $debug2;
    $('#footer .popup-footer-content').empty();
    if (dev_mode && !E.skip_url())
    {
        if (zutil.get(conf, 'debug.show_rule_rating'))
        {
            $debug = $('<div>');
            debug_ui.default.init(E, {svc_util: svc_util});
            debug_ui.default.render_rule_rating($debug[0]);
        }
        if (zutil.get(conf, 'debug.show_redirect'))
        {
            $debug2 = $('<div>');
            debug_ui.default.init(E, {svc_util: svc_util});
            debug_ui.default.render_redirect($debug2[0],
                {get_redirect_list: _get_redirect_list});
        }
    }
    if (!is_tpopup)
    {
        var $react_footer = $('<div>');
        $('#footer .popup-footer-content').append($react_footer);
        ui_lib.render_footer($react_footer[0], {root_url: E.get_root()});
    }
    $('#debug-footer').empty();
    if ($debug)
        $('#debug-footer').append($debug);
    if ($debug2)
        $('#debug-footer').append($debug2);
}

var user_status_model = Backbone.Model.extend({
    initialize: function(options){
        var _this = this;
        this.options = options||{};
        var be_premium = this.options.be_premium;
        E.listenTo(E.be_ext, 'change:is_premium', this._refresh.bind(this));
        E.listenTo(E.be_premium, 'change:user', this._refresh.bind(this));
        etask([function(){ return _this._refresh(); }, function(user){
            be_premium.fcall(user ? 'refresh_user' : 'refresh_anonymous',
                [{force_premium: true}]);
        }]);
    },
    _refresh: function(){
        var _this = this;
        var be_premium = this.options.be_premium;
        return etask([function(){
            if (be_premium)
                return be_premium.get('user');
        }, function(user){
            _this.update(user);
            return user;
        }]);
    },
    update: function(user){
        var _this = this, is_member, be_premium = _this.options.be_premium;
        return etask([function(){
            if (!user)
            {
                _this.clear();
                _this.set('is_found', 0);
                return this.return();
            }
            _this.set('is_found', 1);
            return be_premium ? be_premium.ecall('is_active') : null;
        }, function(_is_member){
            is_member = _is_member;
            return be_premium ? be_premium.ecall('is_paid') : null;
        }, function(is_paid){
            _this.set('display_name', user.displayName);
            _this.set('verified', user.verified);
            _this.set('hola_uid', user.hola_uid);
            _this.set('is_member', is_member);
            _this.set('is_paid', is_paid);
            _this.set('email', zutil.get(user.emails, '0.value'));
            E.be_ext.set('hola_uid', user.hola_uid);
        }]);
    }
});

var menu_account_view = Backbone.View.extend({
    tagName: 'div',
    className: 'modal-menu-account',
    events: {'click .log-out button': 'on_logout'},
    initialize: function(){
        this.listenTo(this.model, 'change', this.render); },
    render: function(){
        this.$el.html(templates.menu_account({
            display_name: this.model.get('display_name'),
            is_premium: this.model.get('is_member'),
            is_tpopup: is_tpopup,
            email: this.model.get('email'),
            products: templates.menu_products({origin: 'menu-account',
                country: (E.get('country') || '').toLowerCase()}),
        }));
        return this;
    },
    on_logout: function(){
        var _this = this;
        E.sp.spawn(etask({cancel: true}, [function(){
            return E.be_premium.fcall('logout_user');
        }, function(){ return E.be_premium.fcall('refresh_user');
        }, function(){ _this.model.update();
        }]));
    },
});

var menu_view = Backbone.View.extend({
    tagName: 'div',
    className: 'popup-menu-container',
    events: {
        'click .popup-header-controls-button': 'on_toggle',
        'click .user_link_login': 'on_toggle',
        'click .l_menuitem_lang a': 'on_lang',
        'click .menu-item-settings a': 'on_settings',
        'click .menu-item-about a': 'on_about',
        'click .menu-item-debug a': 'on_debug',
        'click .menu-item-issue a': 'on_report_problem',
        'click .user-info': 'on_account',
        'click .menu-item-hide-ip a': 'on_hide_ip',
    },
    initialize: function(options){
        this.options = options||{};
        this.menu_account = new menu_account_view({model: this.model});
        this.$el.appendTo(document.body);
    },
    render: function(){
        var display_name = this.model.get('display_name');
        var _this = this;
        var is_lang = be_version_util.cmp(be_util.version(), '1.2.672')>=0;
        var account_opened = this.$account && this.$account.is(':visible');
        this.menu_account.undelegateEvents();
        this.$el.html(templates.menu({
            display_name: display_name,
            is_tpopup: is_tpopup,
            is_lang: is_lang,
            is_about: be_version_util.cmp(be_util.version(), '1.2.661')>=0,
            is_premium: this.model.get('is_member'),
            products: templates.menu_products({origin: 'menu',
                country: (E.get('country') || '').toLowerCase()}),
            dev_mode: E.be_dev_mode && E.be_dev_mode.get('dev_mode'),
        }));
        if (is_lang)
        {
            if (this.lang_list)
                this.lang_list.remove();
            this.lang_list = new be_ui_obj.lang_list({label:
                this.$el.find('.l_menuitem_lang a')});
            $('body').append(this.lang_list.$el);
        }
        this.$general = this.$el.find('.modal-menu-general');
        this.$account = this.menu_account.render().delegateEvents()
            .$el.appendTo(this.$el.find('.modal-menu'));
        this.$hide_ip = this.$el.find('.menu-item-hide-ip');
        this.$hide_ip.hide();
        if (this.is_opened)
        {
            if (account_opened && display_name)
            {
                this.$general.hide();
                this.$account.show();
            }
            else
            {
                this.$general.show();
                this.$account.hide();
            }
        }
        if (E.be_ext.get('gen.hide_ip_on'))
        {
            etask([function(){
                return E.be_vpn.ecall('check_permission', ['privacy']);
            }, function(res){
                if (res==false)
                    _this.$hide_ip.show();
            }]);
        }
    },
    on_account: function(e){
        e.stopPropagation();
        this.$general.hide();
        this.$account.show();
    },
    on_about: function(e){
        e.preventDefault();
        var url = 'about.html';
        if (be_version_util.cmp(be_util.version(), '1.12.422')<0)
            url = 'be_about.html';
        be_util.open_be_tab({url: url, force_active: true});
        on_close_button();
    },
    on_debug: function(e){
        e.preventDefault();
        this.on_toggle(e);
        debug_ui.default.init(E, {svc_util: svc_util});
        debug_ui.default.render_debug_view();
    },
    on_report_problem: function(e){
        e.preventDefault();
        open_reporting_form();
    },
    on_settings: function(e){
        e.preventDefault();
        this.options.settings_handler();
        on_close_button();
    },
    on_lang: function(e){
        e.preventDefault();
        e.stopPropagation();
        this.$general.hide();
        this.lang_list.toggle();
    },
    on_hide_ip: function(e){
        e.preventDefault();
        var _this = this;
        etask([function(){
            return E.be_vpn.ecall('grant_permission', ['privacy']);
        }, function(res){
            if (res)
                _this.$hide_ip.hide();
        }]);
    },
    on_toggle: function(e){
        this.options.on_toggle(e);
    },
    toggle: function(is_opened){
        this.is_opened = is_opened;
        if (!this.is_opened)
        {
            $('#popup').css('min-height', '');
            this.$account.hide();
            this.$general.hide();
        }
        else
        {
            this.$general.show();
            var padding = 10;
            var mh = Math.ceil(this.$general.height()) -
                (Math.ceil($('#footer').height())+padding || 0);
            $('#popup').css('min-height', mh+'px');
        }
        $('body').toggleClass('modal-menu-opened', this.is_opened);
        $('.lang_dropdown_toggle').parent().removeClass('open');
    },
    remove: function(){
        $('body').removeClass('modal-menu-opened');
        $('.l_ui_obj_lang_list').remove();
        this.menu_account.remove();
        Backbone.View.prototype.remove.call(this);
    }
});

var menu_button = Backbone.View.extend({
    tagName: 'div',
    className: 'popup-header-controls-item',
    events: {
        'click .popup-header-controls-button': 'on_toggle',
    },
    initialize: function(options){
        this.options = options||{};
        this.menu = new menu_view(assign({
            on_toggle: this.on_toggle.bind(this)}, options));
        this.listenTo(this.model, 'change', this.render);
        if (be_version_util.cmp(be_util.version(), '1.2.672')>=0)
            this.$el.addClass('pull-right');
        this.$el.html(templates.menu_button());
        this.$menu_icon = this.$el.find('.popup-header-controls-button');
        this.render();
    },
    render: function(){
        this.menu.render();
    },
    on_toggle: function(e){
        e.stopPropagation();
        var _this = this;
        this.is_opened = this.$el.toggleClass('open').hasClass('open');
        this.menu.toggle(this.is_opened);
        this.$menu_icon.toggleClass('hamburger-active', this.is_opened);
        var $body = $('body');
        if (this.is_opened)
        {
            $body.on('click.header-menu', function(ev){
                if (!$(ev && ev.target).closest('.modal-menu').length)
                    _this.$menu_icon.trigger('click');
            });
        }
        else
            $body.off('click.header-menu');
    },
    remove: function(){
        this.menu.remove();
        Backbone.View.prototype.remove.call(this);
    }
});

function new_user_nav(opt){
    var user_status = opt.user_status;
    var be_bg_main = window.popup_main&&window.popup_main.be_bg_main;
    var nav = new menu_button({model: user_status,
        settings_handler: opt.settings_handler});
    if (be_bg_main)
        nav.listenTo(be_bg_main, 'change:is_svc', nav.render.bind(nav));
    return nav;
}

function add_user_nav(){
    var user_status = E.ui_popup.nav && E.ui_popup.nav.model ||
        new user_status_model({be_premium: E.be_premium});
    var nav = new_user_nav({be_premium: E.be_premium,
        user_status: user_status, settings_handler: E.ui_popup.open_settings});
    var $react = $('<div>');
    E.on('destroy', function(){
        nav.remove();
        ui_lib.unmountComponentAtNode($react[0]);
        $react.remove();
    });
    if (window.popup_main && window.popup_main.uninit_user_nav)
        window.popup_main.uninit_user_nav();
    if (E.ui_popup.nav)
        E.ui_popup.nav.remove();
    E.ui_popup.nav = nav;
    $('#header .popup-header-controls-left').prepend(nav.$el);
    $('#header .popup-header-controls-right').append($react);
    ui_lib.render_upgrade_link($react[0], {user_status: user_status,
        root_url: E.get_root()});
    if (E.be_ext.get('is_premium'))
        return;
    var $popup = $('<div>', {class: 'popup-free'}).hide();
    $('#header').append($popup);
    var timer;
    $('.popup-header-logo').on({mousemove: function(){
        if (timer)
            return;
        timer = setTimeout(function(){
            if ($('.trial-timer').length)
                $popup.show();
            else
                $popup.fadeIn();
        }, 200);
    }, mouseleave: function(){
        timer = clearTimeout(timer);
        $popup.hide();
    }});
    ui_lib.render_free_tooltip($popup[0]);
}

function add_trial_timer(){
    if (E.be_ext.get('is_premium'))
        return;
    E.sp.spawn(etask({cancel: true}, [function(){
        return E.be_trial.ecall('get_trial_active', [E.get_root()]);
    }, function(trial){
        if (!trial)
            return;
        var $react = $('<div>', {class: 'popup-header-timer'});
        $('#header').append($react);
        function render_timer(){
            ui_lib.render_trial_timer($react[0], {trial: trial,
                root_url: E.get_root()});
        }
        E.on('destroy', function(){
            ui_lib.unmountComponentAtNode($react[0]);
            $react.remove();
        });
        E.listenTo(E.be_ext, 'trial_change', function(root_url, t){
            if (E.get_root()==root_url)
                render_timer();
        });
        render_timer();
    }]));
}

function set_country_rule(proxy_country, opt){
    E.loader.enable(true);
    opt = opt||{};
    var disable = !!opt.disable, rule_enabled = opt.rule_enabled,
        host = opt.host, hosts = opt.hosts;
    var root_url = host || E.get_root();
    var update_default = !E.protect_ui.is_default() != !opt.default_protect;
    return etask([function(){
        return E.protect_ui.set_default(opt.default_protect);
    }, function(){
        if (E.protect_ui.is_enabled_for_pc())
        {
            E.protect_ui.set_enabled_for_pc(!disable,
                {country: proxy_country});
            return this.return();
        }
        if (!disable && !be_vpn_util.is_all_browser(rule_enabled) &&
            !check_before_unblock(root_url, proxy_country))
        {
            return this.return();
        }
        return show_force_premium({country: proxy_country, disable: disable,
            root_url: root_url});
    }, function(is_shown){
        if (is_shown)
            return this.return();
        proxy_country = proxy_country.toLowerCase();
        var cmd = disable ? 'disable' : 'enable';
        if (!disable)
        {
            if (proxy_country=='mitm')
                return activate_mitm(rule_enabled, host, hosts);
            if (is_mitm_active_manual())
            {
                E.be_vpn.fcall('mitm_manual_stop', [E.get_url(), get_tab_id(),
                    true]);
            }
            if (rule_enabled && rule_enabled.country==proxy_country &&
                !rule_enabled.is_mitm && !update_default)
            {
                return this.return();
            }
            var rule = E.get_rule(proxy_country);
            set_user_cmd({label: 'set_country_enable', cmd: cmd,
                country: proxy_country, name: rule.name, no_busy: true,
                state: 'connecting'});
            E.set('navigating_to', {host: host||root_url, country:
                proxy_country});
            is_unblocking = true;
            var mode;
            if (E.protect_ui.is_enabled_for_browser())
            {
                host = 'all_browser';
                mode = 'protect';
            }
            return E.script_set(rule, {enabled: true, root_url: root_url,
                wait: 3*SEC, max_wait: 10*SEC, host: host, mode: mode});
        }
        if (is_mitm_active_manual())
        {
            set_user_cmd({label: 'set_mitm_disable', cmd: cmd,
                country: proxy_country});
            return E.be_vpn.fcall('mitm_manual_stop', [E.get_url(),
                get_tab_id()]);
        }
        set_user_cmd({label: 'set_country_disable', cmd: cmd,
            country: proxy_country, no_busy: !rule_enabled});
        if (!rule_enabled)
        {
            be_popup_lib.perr_err({id: 'be_ui_vpn_set_country_nothing',
                info: {proxy_country: proxy_country, disable: disable,
                name: rule_enabled&&rule_enabled.name}});
        }
        else
        {
            return E.script_set(rule_enabled, {enabled: false,
                root_url: root_url});
        }
    }, function(){
        if (!disable && hosts && proxy_country!='mitm')
            return set_hosts_rule(proxy_country, hosts);
    }, function catch$(err){ E.set_err('be_ui_vpn_set_country_rule', err);
    }, function finally$(){
        is_unblocking = false;
        state_cb();
    }]);
}

function set_hosts_rule(proxy_country, hosts){
    proxy_country = proxy_country.toLowerCase();
    return etask.for_each(hosts||[], [function(){
        if (!check_before_unblock(this.iter.val, proxy_country))
            return this.return();
        return show_force_premium({country: proxy_country,
            root_url: this.iter.val});
    }, function(is_shown){
        if (is_shown)
            return this.break();
        var rule;
        if (!(rule = E.get_rule(proxy_country)) || rule.name==this.iter.val)
            return this.return();
        return E.script_set(rule, {name: this.iter.val, enabled: true,
            root_url: this.iter.val, wait: 3*SEC, max_wait: 10*SEC,
            silent: true});
    }, function catch$(err){
        be_popup_lib.perr_err({id: 'be_ui_vpn_set_hosts_err',
            info: {err: ''+err, root_url: this.iter.val,
            country: proxy_country, hosts: hosts}});
    }]);
}

function activate_mitm(rule_enabled, host, hosts){
    E.protect_ui.set_enabled(false, undefined, undefined, true);
    set_user_cmd({label: 'set_mitm_enable', cmd: 'enable', country: 'mitm'});
    if (!host)
    {
        return etask([function(){
            return E.be_vpn.fcall('mitm_manual_unblock', [E.get_url(),
                get_tab_id()]);
        }, function(){
            if (!rule_enabled)
                return;
            return E.script_set(rule_enabled, {enabled: false,
                root_url: E.get_root()});
        }]);
    }
    return etask([function(){
        return etask.for_each((hosts||[]).concat([host]), [function(){
            return E.be_vpn.fcall('mitm_manual_unblock',
                [zurl.add_proto(this.iter.val), get_tab_id(), undefined,
                true]);
        }, function(){
            var root = this.iter.val;
            var rule = E.get_enabled_rule(zurl.add_proto(root));
            if (!rule)
                return;
            return E.script_set(rule, {enabled: false, root_url: root});
        }]);
    }, function(){
        B.tabs.update(get_tab_id(), {url: zurl.add_proto(host),
            active: true});
    }]);
}

function get_popular_country(host){
    var site_conf = be_util.get_site_conf(E.be_ext, E.get_root());
    var suggestion_conf = be_util.get_suggestion_conf(site_conf,
        E.get('country'));
    var countries = (suggestion_conf||{}).proxy||[];
    var res = [];
    countries.forEach(function(c){
        if (c!='*')
            res.push({proxy_country: c, rating: 1});
    });
    var popular = be_vpn_util.get_popular_country({host: host||E.get_host(),
        rule_ratings: !host || host==E.get('rule_ratings.root_url') ?
        E.get('rule_ratings') : false});
    popular.forEach(function(p){
        if (!countries.includes(p.proxy_country))
            res.push(p);
    });
    return res;
}

function set_working(rule_enabled){
    var name = is_mitm_active_manual() ? 'mitm' : rule_enabled.name;
    var root_url = E.get_root();
    var j = storage.get_json('vpn_working')||{};
    j[root_url] = {working: 1, name: name};
    storage.set_json('vpn_working', j);
    refresh_sharing();
}

function clr_working(){
    var root_url = E.get_root();
    var j = storage.get_json('vpn_working')||{};
    delete j[root_url];
    storage.set_json('vpn_working', j);
    refresh_sharing();
}

function is_working(){
    var root_url = E.get_root();
    var rule_enabled = E.get_enabled_rule();
    var name = is_mitm_active_manual() ? 'mitm' : rule_enabled &&
        rule_enabled.name;
    var j = (storage.get_json('vpn_working')||{})[root_url];
    return name && j && j.working && j.name==name;
}

function refresh_sharing($o){
    if (is_working())
    {
        $('.sharing-obj').show();
        if ($o)
            $o.show();
    }
    else
    {
        $('.sharing-obj').hide();
        if ($o)
            $o.hide();
    }
}

function init_state(){
    var cb = _.debounce(state_cb);
    E.on_init('change:user.cmd change:user.country change:status '+
        'change:active.root_url change:country', cb);
    E.listenTo(E.be_rule, 'change:rules', cb);
    E.listenTo(E.be_ext, 'change:r.vpn.on', cb);
    var be_bg_main;
    if (be_bg_main = window.be_popup_main&&window.be_popup_main.be_bg_main)
        E.listenTo(be_bg_main, 'change:agree_ts', cb);
    E.on('change:mitm_site', cb);
    E.on('change:mitm_active_manual', cb);
    E.listenTo(E.be_svc, 'change:vpn_country', cb);
    E.listenTo(E.be_ext, 'change:is_premium', cb);
}

function init_verify_proxy(){
    var cb = _.debounce(function(){
        var rule_enabled = E.get_enabled_rule();
        if (E.get('user.cmd')||rule_enabled)
        {
            E.off('change:user.cmd', cb);
            E.stopListening(E.be_rule, 'change:rules', cb);
        }
        if (!E.get('user.cmd') && rule_enabled)
            E.verify_proxy(rule_enabled, 'popup_open');
    });
    E.on_init('change:user.cmd', cb);
    E.listenTo(E.be_rule, 'change:rules', cb);
}

function on_close_button(){
    return etask([function(){
        return etask.sleep(100);
    }, function(){
        if (!E.ui_popup)
        {
            if (is_tpopup)
                window.be_popup_main.close_tpopup();
            return;
        }
        if (!is_tpopup)
            return E.ui_popup.close_popup();
        return E.ui_popup.set_dont_show_again({root_url: E.get_root(),
            period: 'session', src: 'x_btn',
            tab_id: window.hola.tpopup_opt.tab_id,
            type: window.hola.tpopup_opt.type});
    }]);
}

function init_tpopup(){
    if (!is_tpopup)
        return;
    var $el, $hint, timer;
    var root_url = E.get_root();
    function dont_show_for_current_url(e){
        e.stopPropagation();
        E.ui_popup.set_dont_show_again({root_url: root_url, src: 'x_tooltip',
            period: 'default', type: window.hola.tpopup_opt.type});
    }
    function dont_show_for_all(e){
        e.stopPropagation();
        E.ui_popup.set_dont_show_again({root_url: 'all', period: 'default',
            src: 'x_tooltip', type: window.hola.tpopup_opt.type});
    }
    $el = $('#tpopup_close').off('click mouseenter mouseleave');
    $hint = $('#tpopup_close_hint').on({mouseenter: function(){
        timer = clearTimeout(timer);
        $hint.fadeIn();
    }, mouseleave: function(){
        timer = clearTimeout(timer);
        timer = setTimeout(function(){ $hint.fadeOut(); }, 2*animation_time);
    }});
    $el.on({
        click: function(e){
            e.stopPropagation();
            var period = E.be_ext && E.be_ext.get('is_premium') ? 'default' :
                'session';
            E.ui_popup.set_dont_show_again({root_url: E.get_root(),
                src: 'x_btn', period: period,
                tab_id: window.hola.tpopup_opt.tab_id,
                type: window.hola.tpopup_opt.type});
        },
        mouseenter: function(){
            if (E.ui_popup && (E.ui_popup.is_watermark || E.ui_popup.is_mitm))
                return;
            var new_root_url = E.get_root();
            timer = clearTimeout(timer);
            if (root_url!=new_root_url)
            {
                root_url = new_root_url;
                $hint.empty();
                $('<div>', {class: 'hint_close_ghost'}).appendTo($hint);
                $('<div>', {class: 'hint_dont_show'})
                .text(T('Don\'t show again')).appendTo($hint);
                $('<div>', {class: 'hint_option'})
                .html(T('for <b>$1</b> for one week', [root_url]))
                .click(dont_show_for_current_url).appendTo($hint);
                $('<div>', {class: 'hint_option'}).click(dont_show_for_all)
                .html(T('for <b>any site</b> for one week')).appendTo($hint);
            }
            $hint.fadeIn();
        },
        mouseleave: function(){
            timer = clearTimeout(timer);
            timer = setTimeout(function(){ $hint.fadeOut(); },
                2*animation_time);
        }
    });
}

function uninit_tpopup(){
    if (!is_tpopup)
        return;
    $('#tpopup_close, #tpopup_close_hint').off('click mouseenter mouseleave');
}

function init_country(){
    var sent_perr;
    E.on('destroy', function(){
        init_country.timer = clearTimeout(init_country.timer); });
    E.listen_to(E.be_info, 'change:location', function location_cb(){
        var loc = E.be_info.get('location');
        var c = loc&&loc.country;
        E.set('country', c||'');
        if (!c)
            return;
        E.stopListening(E.be_info, 'change:location', location_cb);
        init_country.timer = clearTimeout(init_country.timer);
        if (E.get('country')&&sent_perr)
        {
            be_popup_lib.perr_err({id: 'be_ui_vpn_no_country_recover',
                info: {country: E.get('country')}});
        }
    });
    init_country.timer = setTimeout(function(){
        if (!E.get('country')&&!sent_perr)
        {
            sent_perr = true;
            be_popup_lib.perr_err({id: 'be_ui_vpn_no_country',
                info: {url: E.get_url(),
                be_info: {country: E.be_info.get('country'),
                    location: E.be_info.get('location')},
                status: {
                    rmt: E.R.get('status')+' '+
                        (E.R.get('inited') ? 'inited' : 'not_inited'),
                    be_vpn: E.be_vpn.get('status'),
                    be_rule: E.be_rule.get('status'),
                    be_info: E.be_info.get('status'),
                }
            }});
        }
    }, 3*SEC);
}

function state_cb(){
    var rule_enabled = E.get_enabled_rule();
    var redirect_page = E.redirect_page();
    var curr = E.get('state'), next;
    var status = E.get('status');
    var cmd = E.get('user.cmd'), user_opt = E.get('user.opt');
    var info = {state: curr, url: E.get_url(), root_url: E.get_root(),
        prev_url: E.get('prev_url'), prev_root: E.get('prev_root'),
        user_opt: user_opt, status: status};
    if (redirect_page)
        rule_enabled = redirect_page;
    if (rule_enabled)
    {
        info.name = rule_enabled.name;
        info.country = rule_enabled.country;
    }
    var be_bg_main = window.be_popup_main.be_bg_main;
    if (!be_bg_main.get('agree_ts'))
        next = 'privacy_agreement';
    else if (!E.be_ext.get('is_premium') && E.get('premium_popup.root_url'))
        next = 'premium_popup';
    else if (E.skip_url())
        next = 'skip_url';
    else if (status=='error')
        next = 'error';
    else if (is_unblocking && rule_enabled)
        next = curr;
    else if ({enable: 1, disable: 1}[cmd])
        next = cmd;
    else if (rule_enabled || redirect_page || is_mitm_active_manual() ||
        E.protect_ui.is_enabled_for_pc())
    {
        next = 'enable';
    }
    else
    {
        next = E.get('active.url') && !E.protect_ui.protect_pc &&
            curr!='privacy_agreement' ? curr : 'disable';
    }
    E.set('prev_url', E.get_url());
    E.set('prev_root', E.get_root());
    E.set('state', next);
    if (curr!=next)
        zerr.notice('tab:%d state %s > %s', get_tab_id(), curr, next);
    if (status!='busy')
    {
        var send_perr;
        info.next = next;
        info.ext_enabled = E.be_ext.get('r.ext.enabled');
        if (rule_enabled)
        {
            info.rule_enabled = {name: rule_enabled.name,
                country: rule_enabled.country};
        }
        if (cmd=='enable'&&!rule_enabled)
            send_perr = true;
        if (cmd=='disable'&&rule_enabled)
            send_perr = true;
        if (cmd=='enable' && rule_enabled &&
            rule_enabled.country!=user_opt.country.toLowerCase())
        {
            send_perr = true;
            info.mismatch_country = rule_enabled.country;
        }
        if (send_perr)
        {
            if (window.hola)
                info.t = Date.now()-window.hola.t.l_start;
            be_popup_lib.perr_err({id: 'be_ui_vpn_state_mismatch_user_action',
                info: info});
        }
    }
}

E.skip_url = function(opt){
    opt = opt||{};
    var url = opt.url || !opt.ignore_curr_url&&E.get_url();
    if (!url)
        return true;
    if (!opt.ignore_all_browser)
    {
        var rule = E.get_enabled_rule();
        if (be_vpn_util.is_all_browser(rule))
            return !be_vpn_util.is_vpn_allowed(url, true, undefined, rule);
    }
    if (!opt.ignore_protect_pc && E.protect_ui.is_enabled_for_pc())
        return false;
    var protocol = zurl.get_proto(url), host = zurl.get_host(url);
    return !opt.ignore_curr_url && !E.get_root() ||
        host.search(/^(.*\.)?hola.org$/)!=-1 &&
        url.search(/(access|unblock)\/([^/]*)\/using\/.*/) == -1 ||
        zurl.is_ip_port(host) || protocol.search(/^(http|https)$/)==-1 ||
        host=='localhost' || !zurl.is_valid_domain(host);
};

E.redirect_page = function(url){
    var redirect_regexp = /hola\.org\/(access|unblock)\/([^/]*)\/using\/vpn-([^?/]*)$/gi;
    var redirect_match = redirect_regexp.exec(E.get_url());
    if (!redirect_match)
        return;
    return {name: redirect_match[1], country: redirect_match[2]};
};

E.is_popular_page = function(url){
    var popular_regexp = /hola\.org\/(access|unblock)\/popular.*$/gi;
    url = url || E.get_url();
    return popular_regexp.test(url);
};

function set_ui_status(status, opt){
    if (status)
        return void E.set({ui_status: status, ui_status_opt: opt});
    E.unset('ui_status');
    E.unset('ui_status_opt');
}

E.change_proxy = function(rule, desc, not_working){
    return etask('change_proxy', [function(){
        set_ui_status('busy', {desc: 'Finding new peers...'});
        return E.be_rule.ecall('change_proxy_wait', [{
            rule: rule, desc: desc, root_url: E.get_root(),
            user_not_working: not_working}]);
    }, function(ret){
        B.tabs.reload(get_tab_id());
    }, function finally$(){ set_ui_status();
    }, function catch$(err){
        be_popup_lib.perr_err({id: 'be_change_proxy_err', err: err});
    }]);
};

E.verify_proxy = function(rule, desc){
    return etask('verify_proxy', [function(){
        set_ui_status('busy', {desc: 'Testing connection...'});
        return E.be_rule.ecall('verify_proxy_wait', [{rule: rule,
            desc: desc, root_url: E.get_root(), tab_id: get_tab_id()}]);
    }, function finally$(){ set_ui_status();
    }, function catch$(err){
        E.loader.enable(true);
        E.loader.start();
        be_popup_lib.perr_err({id: 'be_verify_proxy_err', err: err});
    }]);
};

function render_warnings(){
    $('.r_warnings').remove();
    var $error_holder = $('#popup');
    var $el = $('<div>', {class: 'r_warnings'}).insertBefore($error_holder);
    var $msg, br_ver = user_agent.guess_browser().version;
    var ff_upgrade = !chrome && be_version_util.cmp(br_ver, '43')<0;
    if (ff_upgrade)
    {
        $msg = $('<div>', {class: 'r_ui_vpn_compat'})
        .appendTo($el).append($('<span>'+
            T('Old version of Firefox. Press <a>here</a> to upgrade.')
            +'</span>'),
            $('<div>').text(T(
                '(some Hola features are not available on your version)')));
        $msg.find('a').attr('target', '_blank').attr('href',
            'http://www.mozilla.org/en-US/firefox/update/');
    }
}

E.get_popular_url = function(){
    var country = E.get('country');
    return 'https://hola.org/unblock/popular'+(country ? '/'+country : '')+
        '?utm_source=holaext';
};

var country_list_head_view_class = Backbone.View.extend({
    el: '<span>',
    initialize: function(options){
        var $el = this.$el;
        var opt = this.options = options||{};
        var size = 'f' + (opt.size ? opt.size : 'svg_4x3');
        var $a = $('<a>', {class: size}).appendTo($el);
        this.$flag = $('<span>', {class: 'flag'}).appendTo($a);
        this.$label = $('<div>', {class: 'r_list_head_label'}).appendTo($el);
    },
    render: function(opt){
        opt = opt||{};
        var c = opt.country ? opt.country.proxy_country : '';
        if (opt.is_mitm)
            this.$flag.attr('class', 'flag_mitm');
        else if (opt.is_protect)
            this.$flag.attr('class', 'flag_protect');
        else
        {
            this.$flag.attr('class', 'flag').addClass(c.toLowerCase()||
                'flag_other');
        }
        if (this.options.fade_head)
            this.$flag.addClass('flag_fade');
        if (opt.show_plus_logo)
            this.$flag.addClass('show_plus_logo');
        else
            this.$flag.removeClass('show_plus_logo');
        var uc = c.toUpperCase();
        var label_text = uc && T(uc);
        this.$label.text(label_text||T('More...'));
        this.$label.toggle(!(opt.is_mitm || opt.is_protect));
    },
});

function get_country_list_item(c, disable){
    return templates.country_list_item({
        country: c.proxy_country||'',
        name: c.name,
        type: c.type,
        disable: disable,
        protect: c.protect,
    });
}

function mitm_list_item(){
    return templates.country_list_item({
        country: 'mitm',
        name: T('Unblock'),
        mitm: true,
    });
}

function get_url_for_unsupported(opt){
    opt = opt||{};
    var type = opt.type, domain = opt.domain, country = opt.country;
    var ref = (opt.pref||'')+'unsupported_require_plus_'+
        domain.replace(/[^a-z]/g, '_');
    return zescape.uri/plus_ref(ref, {type: type, domain: domain,
        root_url: E.get_root(), country: country});
}

function unsupported_open(type, domain, country){
    var src_country = E.get('country').toLowerCase();
    var perr = type.replace(/-/g, '_');
    be_popup_lib.perr_ok({id: 'be_ui_vpn_click_unsupported_open_'+perr, info: {
        src: 'ext',
        browser: browser,
        root_url: domain,
        ext_ver: be_util.version(),
        url: E.get_url(),
        src_country: src_country,
        proxy_country: country,
        host: E.get_host()
    }});
    var url = get_url_for_unsupported({type: type, domain: domain,
        country: country});
    E.ui_popup.open_page(url);
}

function is_blacklist(root_url, host){
    if (E.be_ext.get('is_premium'))
        return false;
    var blacklist = (E.be_rule.get('rules')||{}).blacklist||{};
    return blacklist[host] || blacklist[root_url];
}

function check_before_unblock(host, country){
    if (!E.be_ext.get('enable_unsupported'))
        return true;
    country = country.toLowerCase();
    var domain = svc_util.get_root_domain(host);
    if (domain.includes('hola.org'))
        return false;
    if (false && is_blacklist(domain, host))
    {
        unsupported_open('site', domain, country);
        return false;
    }
    return true;
}

function show_premium_popup(opt){
    if (E.premium_view_loading)
        return;
    if (E.premium_view)
    {
        if (E.premium_view.$el.closest('body').length)
            return;
        E.premium_view.$el.remove();
        E.premium_view = undefined;
    }
    var root_url = opt.root_url || E.get_root();
    E.premium_view_loading = true;
    return etask([function(){
        if (!opt.rule)
            return;
        zerr.notice('tab:%d premium popup should be shown', get_tab_id());
        E.set('premium_popup.root_url', root_url);
        return true;
    }, function catch$(e){
        be_popup_lib.perr_err({id: 'be_ui_vpn_show_premium_popup', err: e});
    }, function finally$(){
        E.premium_view_loading = false;
        state_cb();
    }]);
}

function get_force_premium_rule(opt){
    opt = opt||{};
    var root_url = opt.root_url || E.get_root();
    if (E.be_ext.get('is_premium'))
        return false;
    if (be_version_util.cmp(be_util.version(), '1.109.233')<0)
        return false;
    return E.be_premium.ecall('get_force_premium_rule', [root_url]);
}

function show_force_premium(opt){
    opt = opt||{};
    var rule, root_url = opt.root_url || E.get_root();
    return etask([function(){
        if (E.get_enabled_rule())
            return this.goto('no_popup');
        return E.be_premium.ecall('get_force_premium_rule', [root_url]);
    }, function(r){
        if (!(rule = r))
            return this.goto('no_popup');
        if (E.be_ext.get('is_premium'))
            return this.goto('no_popup');
        return show_premium_popup(assign({rule: rule}, opt));
    }, function(){
        return this.return(true);
    }, function no_popup(){
        var $curr_el;
        if (E.curr_view && E.premium_view)
        {
            $curr_el = E.curr_view.$el;
            $curr_el.removeClass('g-hidden');
            E.premium_view.$el.remove();
            E.premium_view = undefined;
        }
        return false;
    }]);
}

var country_list_view_class = Backbone.View.extend({
    el: '<span>',
    className: 'r_country_list_view',
    events: {
        'click .list_head': 'show_list',
    },
    render_opt: {},
    initialize: function(options){
        options = options||{};
        this.no_dropdown = options.no_dropdown;
        var $el = this.$el;
        if (options.class_name)
            $el.attr('class', options.class_name);
        var $list = this.$list = $('<span>', {class: 'dropdown r_country_list'+
            (this.no_dropdown ? '' : ' r_country_list_dropdown')});
        $el.append($list);
        var $head = $('<a>', {class: 'list_head btn '+
            'r_btn-trans r_btn-rm-border '+
            (this.no_dropdown ? 'no-dropdown' : ''),
            'data-toggle': this.no_dropdown || options.on_click ?
                undefined : 'dropdown'}).appendTo($list);
        if (options.on_click)
            $head.click(options.on_click);
        this.country_list_head_view = new country_list_head_view_class({
            fade_head: options.fade_head,
            show_lock: options.show_lock,
            size: options.flag_size,
        });
        $head.append(this.country_list_head_view.$el);
        var show_caret = !this.no_dropdown || options.show_lock;
        if (!options.on_click || options.no_dropdown || !show_caret)
            $head.addClass('hoverable');
        else
            this.country_list_head_view.$el.addClass('hoverable');
        if (show_caret)
        {
            var $caret = $('<span>', {class: 'caret'})
            .click(function(){ ff_dropdown_resize(); })
            .appendTo($head);
            if (options.on_click && !options.no_dropdown)
                $caret.addClass('hoverable hoverable-x');
        }
        if (this.no_dropdown)
            return;
        $('body').on('click.country_list_click', this.hide_list.bind(this));
        this.$ul = $('<div>', {class: 'dropdown-menu country-selection'})
        .on('click', function(evt){
            evt.stopPropagation(); });
        this.$li_list = $('<ul>', {role: 'menu'}).appendTo(this.$ul);
        this.$ul.appendTo($('body'));
    },
    render: function(opt){
        var _this = this;
        opt = opt||{};
        var is_premium = E.be_ext.get('is_premium');
        var vpn_countries = E.be_ext.get('vpn_countries')||[];
        var hide_countries = zutil.bool_lookup('kp');
        this.countries = pcountries.proxy_countries.bext
        .filter(function(c){ return !hide_countries[c.toLowerCase()]; })
        .map(function(c){
            return {proxy_country: c, name: T(c), type: !is_premium&&'free',
                full_vpn: vpn_countries.includes(c.toLowerCase())};
        });
        this.countries = _.sortBy(this.countries, 'name');
        this.countries.get = function(c){
            return {proxy_country: c, name: T(c.toUpperCase())}; };
        var active_country = opt.active_country;
        this.country_list_head_view.render({country:
            active_country ? this.countries.get(active_country) : undefined,
            show_plus_logo: opt.show_plus_logo, is_mitm: opt.is_mitm,
            is_protect: E.protect_ui.is_enabled() &&
            E.protect_ui.is_default()});
        if (this.no_dropdown)
            return;
        this.$list.one('show.bs.dropdown', function(){
            _this.render_list(opt); });
        if (!_.isEqual(opt, this.render_opt))
            _.defer(function(){ this.render_list(opt); }.bind(this));
        this.render_opt = opt;
    },
    show_list: function(e){
        if (this.no_dropdown || !this.$ul)
            return;
        e.stopPropagation();
        this.$ul.toggleClass('dropdown-menu-open');
        this.trigger('toggle_list');
        toggle_cover(true);
    },
    hide_list: function(e){
        if (!this.$ul || !this.$ul.hasClass('dropdown-menu-open'))
            return;
        if (e)
            e.stopPropagation();
        this.$ul.removeClass('dropdown-menu-open');
        this.trigger('toggle_list', 'hide');
        toggle_cover(false);
    },
    remove: function(){
        if (this.$ul)
            this.$ul.remove();
        $('body').off('click.country_list_click');
        Backbone.View.prototype.remove.call(this);
    },
    render_list: function(opt){
        var _this = this;
        opt = opt||{};
        var active_country = opt.active_country;
        var list_html = '';
        if ((active_country || opt.is_mitm) && !opt.no_back)
            list_html += get_country_list_item({name: T('Stop VPN')}, true);
        list_html += '<li class="divider"></li>';
        if (E.be_ext.get('is_premium'))
        {
            list_html += get_country_list_item({
                proxy_country: 'us',
                name: 'Protect',
                protect: 1,
            }, false);
        }
        var p = _.pluck(get_popular_country(opt.host), 'proxy_country');
        p.forEach(function(c){
            var found = _this.countries.find(function(o){
                return o.proxy_country==c; });
            if (found)
                list_html += get_country_list_item(found, false);
        });
        list_html += '<li class="divider"></li>';
        var filtered_countries = this.countries.filter(function(c){
            return !opt.only_protected || c.full_vpn;
        });
        filtered_countries.forEach(function(c){
            list_html += get_country_list_item(c, false);
        });
        if (!E.protect_ui.is_enabled() && E.be_vpn.get('mitm_ext_ui_enabled'))
            list_html += mitm_list_item();
        this.$li_list.off('click');
        this.$li_list.on('click', '.country', function(){
            var info = $(this).data();
            if (!info.disable)
            {
                be_popup_lib.perr_ok({id: 'be_ui_vpn_click_flag',
                    info: {host: opt.host, country: info.country}});
            }
            var rule_enabled = !opt.host ? E.get_enabled_rule() : null;
            _this.trigger('select', info.country);
            _this.hide_list();
            if (info.disable)
                set_unblock(false);
            else if (info.protect)
            {
                E.protect_ui.set_default(true);
                E.protect_ui.set_enabled(true, opt.host, opt.hosts);
            }
            else
            {
                set_country_rule(info.country, {disable: info.disable,
                    rule_enabled: rule_enabled, host: opt.host,
                    hosts: opt.hosts, default_protect: info.protect});
            }
        });
        this.$li_list.html(list_html);
    },
});

var country_selection_view_class = Backbone.View.extend({
    className: 'r_country_selection_view',
    host: null,
    active_country: null,
    initialize: function(opt){
        var _this = this;
        opt = opt||{};
        this.host = opt.host;
        this.hosts = opt.hosts||[];
        this.active_country = opt.active_country;
        var $el = this.$el;
        var $row = $('<div>').appendTo($el);
        if (is_tpopup)
        {
            this.list_all = new country_list_view_class({
                fade_head: true,
                show_lock: true,
                no_dropdown: true,
                on_click: function(){
                    _this._set_country_rule(_this.p0, E.get_enabled_rule());
                },
            });
            this.list_all.$el.addClass('country_selection_opt').appendTo($row);
        }
        else
        {
            this.is_multiselect = true;
            $row.addClass('row');
            this.list_p0 = new country_list_view_class({
                no_dropdown: true,
                class_name: 'country_selection_opt country_selection_left',
                on_click: function(){
                    be_popup_lib.perr_ok({id: 'be_ui_vpn_click_flag'});
                    _this._set_country_rule(_this.p0, null);
                },
            });
            this.list_p1 = new country_list_view_class({
                class_name: 'country_selection_opt country_selection_center',
                on_click: function(e){
                    if ($(e.target).hasClass('caret'))
                        return;
                    e.stopPropagation();
                    be_popup_lib.perr_ok({id: 'be_ui_vpn_click_flag'});
                    _this._set_country_rule(_this.p1, null);
                },
            });
            this.list_all = new country_list_view_class({
                class_name: 'country_selection_opt country_selection_right',
                on_click: function(){}});
            $row.append(this.list_p0.$el, this.list_p1.$el, this.list_all.$el);
        }
        [this.list_all, this.list_p1].forEach(function(list){
            if (list)
                list.on('select', function(){ _this.trigger('select'); });
        });
        return $el;
    },
    remove: function(){
        [this.list_all, this.list_p0, this.list_p1].forEach(function(list){
            if (list)
                list.remove();
        });
        Backbone.View.prototype.remove.call(this);
    },
    _trigger_list_event: function(name, $el){
        var list_num;
        if ($el.hasClass('country_selection_left'))
            list_num = 0;
        else if ($el.hasClass('country_selection_center'))
            list_num = 1;
        else
            list_num = 2;
        this.trigger('list:'+name, list_num);
    },
    _set_country_rule: function(country, rule_enabled){
        E.loader.enable(true);
        this.trigger('select', country);
        set_country_rule(country, {rule_enabled: rule_enabled,
            host: this.host, hosts: this.hosts});
    },
    render: function(){
        var popular_countries = get_popular_country(this.host);
        var tld = be_vpn_util.get_tld_country(this.host||E.get_host());
        var main = this.is_multiselect ? 1 : 0;
        var second = this.is_multiselect ? 0 : 1;
        var ratings = [popular_countries[0], popular_countries[1]];
        if (tld && tld!=ratings[0].proxy_country &&
            tld!=ratings[1].proxy_country)
        {
            ratings.push({proxy_country: tld, rating: 0.1});
            ratings.sort(function(a, b){ return b.rating-a.rating; });
        }
        this['p'+main] = ratings[0].proxy_country;
        this['p'+second] = ratings[1].proxy_country;
        if (is_tpopup)
        {
            this.list_all.render({active_country: this.p0, no_back: true,
                show_plus_logo: E.get('force_premium_rule')});
        }
        else if (is_mitm_site())
        {
            this['p'+main] = 'mitm';
            this['list_p'+main].render({active_country: 'mitm', is_mitm: true,
                no_back: true});
            this['list_p'+second].$el.hide();
            this.list_all.$el.hide();
        }
        else
        {
            this.list_p0.render({active_country: this.p0, no_back: true,
                host: this.host, hosts: this.hosts});
            this.list_p1.render({active_country: this.p1, no_back: true,
                show_plus_logo: E.get('force_premium_rule'), host: this.host,
                hosts: this.hosts});
            this.list_all.render({active_country: this.active_country,
                no_back: true, host: this.host, hosts: this.hosts});
        }
        return this;
    },
});

var stub_unblock_view_class = Backbone.View.extend({
    initialize: function(){
        this.render();
    },
    render: function(){
        ui_lib.render_stub_unblock(this.$el[0], {root_url: E.get_root()});
    },
    remove: function(){
        ui_lib.unmountComponentAtNode(this.$el[0]);
        Backbone.View.prototype.remove.call(this);
    },
});

var switch_privacy_view = Backbone.View.extend({
    className: 'switch-privacy',
    events: {
        click: '_on_click',
    },
    initialize: function(opt){
        opt = opt||{};
        this.root_url = opt.root_url || E.get_root();
        this.url = opt.url || E.get_url();
        this.country = opt.country || get_selected_country();
        this.render();
    },
    render: function(){
        this.$el.hide();
        if (!E.be_premium)
            return;
        var _this = this;
        etask([function(){
            if (be_version_util.cmp(be_util.version(), '1.114.698')<0)
                return false;
            return E.be_premium.ecall('get_force_privacy_rule',
                [_this.root_url]);
        }, function(rule){
            if (!rule || E.be_ext.get('is_premium'))
                return void _this.$el.html('');
            _this.$el.html(templates.switch_privacy());
            _this.$el.show();
        }]);
    },
    _get_url: function(){
        return plus_ref('get_privacy_'+this.root_url.replace(/[^a-z]/g, '_'),
            {root_url: E.get_root()});
    },
    _on_click: function(e){
        e.preventDefault();
        be_popup_lib.perr_ok({id: 'be_get_privacy', info: {
            domain: this.root_url,
            country: this.country,
            url: this.url,
        }});
        E.ui_popup.open_page(this._get_url());
    },
});


function toggle_cover(show){
    $(document.body).toggleClass('gray-cover-opened', show);
}

var TEXT_NEEDS_PLUS = 'Upgrade to <b>PLUS</b> for online security';
var TEXT_NEEDS_APP = 'For protecting PC applications you have to install '+
    '<b>Hola for Windows</b>';
var TEXT_NEEDS_APP_UPDATE = 'Please update <b>Hola for Windows</b> to enable '+
    'controlling it from extension';
var modal_view_class = Backbone.View.extend({
    className: 'modal-view',
    events: {
        'click .btn_close': '_on_close_click',
        'click .btn_no': '_on_no_click',
        'click .btn_yes': '_on_yes_click',
    },
    initialize: function(){
        this.$el.hide();
        this.visible = false;
        $(document.body).click(this._click_outside.bind(this));
        $(document.body).append(this.$el);
    },
    render: function(){
        this.$el.html(templates.modal_view({
            text_main: T(this.options.text_main),
            text_yes: T(this.options.text_yes),
            text_no: T(this.options.text_no || 'No, thanks'),
            signin: this.options.signin,
        }));
    },
    toggle: function(){
        this.$el.toggle();
        this.visible = !this.visible;
        toggle_cover(this.visible);
    },
    _on_close_click: function(){
        this.toggle();
    },
    _on_no_click: function(){
        this.toggle();
    },
    _on_yes_click: function(){
        this.options.on_yes_click();
        this.toggle();
    },
    _click_outside: function(e){
        if (!this.visible || e.target!=document.body)
            return;
        this.toggle();
    },
    remove: function(){
        toggle_cover(false);
        $(document.body).off('click', this._click_outside);
        Backbone.View.prototype.remove.call(this);
    },
});

function get_mode(use_full_vpn){ return use_full_vpn ? 'protect' : 'unblock'; }

function _set_unblock(enable, opt){
    var ropt = _.pick(opt, ['ignore_all_browser', 'ignore_protect_pc']);
    var enabled_rule = E.get_enabled_rule(ropt);
    var rule_country = is_mitm_active_manual() ? 'mitm' :
        zutil.get(enabled_rule, 'country');
    var use_full_vpn = opt.use_full_vpn, host = opt.host, hosts = opt.hosts;
    if (enable)
    {
        var vpn_countries = E.be_ext.get('vpn_countries');
        var popular = get_popular_country(host);
        if (use_full_vpn && vpn_countries.includes(rule_country) ||
            !use_full_vpn && enabled_rule)
        {
            if (!enabled_rule)
                return;
            tab_reload(get_tab_id(), host);
            return E.be_rule.fcall('set_rule_val', [enabled_rule, 'mode',
                get_mode(use_full_vpn)]);
        }
        var country = (rule_country || popular[0].proxy_country).toLowerCase();
        if (use_full_vpn && !vpn_countries.includes(country))
            country = 'us';
        if (!use_full_vpn && is_mitm_site())
            country = 'mitm';
        return set_country_rule(country, {rule_enabled: enabled_rule,
            host: host, hosts: hosts,
            default_protect: use_full_vpn && country=='us'});
    }
    return etask([function(){
        return E.protect_ui.set_enabled(false);
    }, function(){
        enabled_rule = E.get_enabled_rule(ropt);
        rule_country = is_mitm_active_manual() ? 'mitm' :
            zutil.get(enabled_rule, 'country');
        if (rule_country)
        {
            return set_country_rule(rule_country, {disable: true,
                rule_enabled: enabled_rule});
        }
    }]);
}

function set_unblock(enable, opt){
    opt = opt || {};
    return etask([function(){
        set_ui_status('busy', {desc: 'Finding new peers...'});
        return _set_unblock(enable, opt);
    }, function finally$(){ set_ui_status(); }]);
}


function on_get_plus_click(){
    be_util.open_tab({url: plus_ref('ext_protect',
        {root_url: E.get_root()}), force_new: true});
}

var unblock_protect_view_class = Backbone.View.extend({
    className: 'unblock-protect-view',
    initialize: function(){
        this.needs_plus_view = new modal_view_class({
            text_main: TEXT_NEEDS_PLUS,
            text_yes: 'Get PLUS',
            on_yes_click: on_get_plus_click,
            signin: 'modal_get_plus',
        });
        this.needs_plus_view.render();
        var $a = this.$a = $('<div>'), $b = this.$b = $('<div>');
        this.$el.append($a, $b);
    },
    protect_on_click: function(e){
        E.loader.enable(true);
        if (!E.be_ext.get('is_premium'))
            return void this.needs_plus_view.toggle();
        var hosts = get_hosts();
        E.protect_ui.set_enabled(e.value, hosts.host, hosts.hosts, false);
    },
    render: function(){
        var is_unblock = E.curr_view && E.curr_view.state=='enable';
        var is_protect = is_unblock && E.protect_ui.is_enabled();
        $(document.body).toggleClass('is-protect', !!is_protect);
        var country = (is_unblock&&get_selected_country() ||
            get_popular_country()[0].proxy_country).toLowerCase();
        var skip = E.skip_url({ignore_all_browser: true,
            ignore_protect_pc: true});
        ui_lib.render_main_switch(this.$a[0],
            {value: !!is_unblock,
            onClick: unblock_on_click,
            root_url: !skip && E.get_root(),
            country: country, src_country: E.get('country'),
            is_mitm: is_mitm_site() || is_mitm_active_manual(),
            tooltip: E.be_vpn.get('protect_tooltips')});
        ui_lib.render_main_switch(this.$b[0], {type: 'protect',
            value: !!is_protect,
            onClick: this.protect_on_click.bind(this),
            root_url: !skip && E.get_root(),
            is_protect_pc: E.protect_ui.is_enabled_for_pc(),
            is_protect_browser: E.protect_ui.is_enabled_for_browser(),
            tooltip: E.be_vpn.get('protect_tooltips')});
    },
    remove: function(){
        this.needs_plus_view.remove();
        $(document.body).removeClass('is-protect');
        Backbone.View.prototype.remove.call(this);
    },
});
var react_disable_view_class = Backbone.View.extend({
    className: 'popup-enabled popup-multiselect',
    initialize: function(opt){
        zerr.notice('react:dissable - initialize');
    },
    render: function(){
        zerr.notice('react:dissable - render');
        ui_lib.render_disable_view(this.$el[0], {
            host: null,
            on_country_select: react_on_country_select,
        });

        return this;
    },
    remove: function(){
        zerr.notice('react:dissable - remove');
        Backbone.View.prototype.remove.call(this);
    },
});

var disable_view_class = Backbone.View.extend({
    className: 'popup-enabled popup-multiselect',
    hover_title: null,
    initialize: function(opt){
        this.options = opt = opt||{};
        var $el = this.$el;
        var $container = this.$container = $('<div>',
            {class: 'popup-enabled-content'});
        var title_text = T(is_mitm_site() ? TEXT_UNBLOCK :
            TEXT_COUNTRY_CHANGE, [E.get_root()]);
        this.hover_title = opt.title_view || new title_view_class({
            title: title_text, no_search: true, flex: 1});
        this.header_content = opt.header_content;
        var $title = this.hover_title.$el;
        this.country_selection_view = opt.country_selection_view ||
            new country_selection_view_class();
        if (this.country_selection_view.is_multiselect)
        {
            var $hover_title = this.hover_title.$title;
            $hover_title.append(
                '<i class="popup-multiselect-arrow '+
                'popup-multiselect-arrow-left"></i>'+
                '<i class="popup-multiselect-arrow '+
                'popup-multiselect-arrow-right"></i>');
            var events = {
                'list:mouseenter': function(list_num){
                    $hover_title.addClass('list-hover-'+list_num
                        +' list-hover');
                },
                'list:mouseleave': function(list_num){
                    $hover_title.removeClass('list-hover-'+list_num
                        +' list-hover');
                },
            };
            this.country_selection_view.on(events);
        }
        this.user_message = new user_message_view_class();
        $el.append(this.user_message.$el, $container);
        $container.append($title, this.header_content,
            this.country_selection_view.$el);
    },
    render: function(){
        this.user_message.render();
        this.hover_title.render();
        this.country_selection_view.render();
        $('body').addClass('is-popup-disabled');
        return this;
    },
    remove: function(){
        this.user_message.remove();
        this.hover_title.remove();
        this.country_selection_view.remove();
        Backbone.View.prototype.remove.call(this);
    },
});
var turned_off_view_class = Backbone.View.extend({
    className: 'popup-disabled',
    initialize: function(){
        var class_name = this.className;
        var html = templates.popup_disabled({class_name: class_name});
        this.$el.html(html);
        this.$head = this.$el.find('.'+class_name+'-icon');
    },
    render: function(){
        this.$head.off('click').one('click', function(){
            setTimeout(function(){
                $('#g_switch').click(); }, animation_time);
        });
        $('body').addClass('is-popup-off');
    }
});

function get_selected_country(){
    var status = E.get('status');
    var rule = E.get_enabled_rule() || {};
    var user_country = E.get('user.country');
    var vpn_country = E.protect_ui.get_vpn_country();
    var country = vpn_country || rule.country || user_country ||
        E.get('redirect_country') || '';
    if (status=='busy')
        return user_country || country;
    return country;
}

var perr_sent;
var country_selected_view_class = Backbone.View.extend({
    className: 'country_selected',
    initialize: function(){
        var $el = this.$el, $row;
        if (is_tpopup)
        {
            if (!perr_sent)
            {
                be_popup_lib.perr_ok({id: 'be_tpopup_open', info: {
                    root_url: E.get_root(), url: E.get_url()}});
                perr_sent = true;
            }
        }
        else
        {
            $row = $('<div>').appendTo($el);
            $('<div>', {class: 'icon_arrow'}).appendTo($row);
        }
        $row = $('<div>').appendTo($el);
        this.list_view = new country_list_view_class({
            on_click: function(){}});
        $row.append(this.list_view.$el);
    },
    render: function(opt){
        opt = opt||{};
        this.prev_country = this.country;
        this.country = get_selected_country();
        if (this.country && this.country==this.prev_country &&
            this.prev_is_mitm==opt.is_mitm &&
            this.prev_is_protected == opt.is_protected &&
            this.prev_is_default == opt.is_default)
        {
            return;
        }
        this.prev_is_mitm = opt.is_mitm;
        this.prev_is_protected = opt.is_protected;
        this.prev_is_default = opt.is_default;
        this.$el.toggleClass('is-mitm', !!opt.is_mitm);
        this.list_view.render({active_country: this.country,
            is_mitm: opt.is_mitm, only_protected: opt.is_protected});
        show_force_premium({country: this.country});
    },
    remove: function(){
        this.list_view.remove();
        Backbone.View.prototype.remove.call(this);
    },
});
var loader_view_class = Backbone.View.extend({
    className: 'popup-loader',
    initialize: function(){
        this.enabled = false;
        this.$el.addClass('g-hidden');
        this.$el.html('<div class="popup-loader-spinner popup-loader-back">'+
            '<svg width="100%" height="100%" viewBox="-1 -1 202 202">'+
                '<path class="popup-loader-rail" d="M 180,100 A 80,80 0 0,'+
                    '1 100,180 A 80,80 0 0,1 20,100 A 80,80 0 0,1 100,20 A '+
                    '80,80 0 0,1 180,100" style="fill:none"/>'+
            '</svg>'+
        '</div>'+
        '<div class="popup-loader-spinner popup-loader-bubble-container">'+
            '<svg width="100%" height="100%" viewBox="-1 -1 202 202">'+
                '<path class="popup-loader-bubble" d="M 180,100 A 80,80 0 0,1'+
                    '100,180 A 80,80 0 0,1 20,100 A 80,80 0 0,1 100,20 A 80,'+
                    '80 0 0,1 180,100" style="fill:none"/>'+
            '</svg>'+
        '</div> '+
        '<div class="popup-loader-spinner popup-loader-fore">'+
            '<svg width="100%" height="100%" viewBox="-1 -1 202 202">'+
                '<path class="popup-loader-spincircle" d="M 1,100" '+
                    'style="fill:none"/>'+
            '</svg>'+
        '</div>');
        this.loader_init();
    },
    render: function(parent){
        $(parent).append(this.$el);
    },
    loader_init: function(){
        var _this = this;
        var int_id = 0, int2Id = 0, angle = 0, aperture = 0, d_aperture = 1.5;
        var d_angle = 15, need_finish = false;
        var transform_func = chrome ? '-webkit-transform' : 'transform';
        var arc = this.$('.popup-loader-spincircle')[0];
        var spinner = this.$('.popup-loader-fore')[0];
        var bubble = this.$('.popup-loader-bubble-container')[0];
        function set_aperture(ang){
            ang %= 360;
            var angle_part = 6.28318531*ang/360.0;
            var ex = 100+Math.round(80*Math.cos(angle_part));
            var ey = 100+Math.round(80*Math.sin(angle_part));
            if (ang<=90)
                arc.setAttribute('d', 'M 180,100 A 80,80 0 0,1 '+ex+','+ey);
            else if (ang<=180)
            {
                arc.setAttribute('d', 'M 180,100 A 80,80 0 0,1 100,180 A 80,'+
                    '80 0 0,1 '+ex+','+ey);
            }
            else if (ang<=270)
            {
                arc.setAttribute('d', 'M 180,100 A 80,80 0 0,1 100,180 A 80,'+
                    '80 0 0,1 20,100 A 80,80 0 0,1 '+ex+','+ey);
            }
            else
            {
                arc.setAttribute('d', 'M 180,100 A 80,80 0 0,1 100,180 A 80,'+
                    '80 0 0,1 20,100 A 80,80 0 0,1 100,20 A 80,80 0 0,1 '+ex+
                    ','+ey);
            }
        }
        function burst_bubble(){
            var iterations = 1, bubble_int = 0;
            function start_burst(){
                bubble.setAttribute('class', 'popup-loader-spinner '+
                    'popup-loader-burst');
                setTimeout(function(){
                    bubble.setAttribute('class', 'popup-loader-spinner '+
                        'popup-loader-bubble-container');
                    if (!iterations)
                    {
                        _this.stop_timeout = setTimeout(function(){
                            _this.stop();
                        }, 400);
                    }
                }, 50);
                iterations -= 1;
                if (!iterations && bubble_int)
                    clearInterval(bubble_int);
            }
            start_burst();
            if (iterations)
                bubble_int = setInterval(start_burst, 400);
        }
        function make_frame(){
            if (need_finish && aperture < 350)
                d_aperture = 10;
            else if (need_finish)
            {
                clearInterval(int_id);
                aperture = 359.9;
                burst_bubble();
            }
            else if (aperture > 200)
                d_aperture = (300 - aperture) / 50;
            else
                d_aperture = 1.5;
            set_aperture(aperture);
            aperture = (aperture+d_aperture)%360;
        }
        this.start = function(opt){
            var __this = this;
            this.timeout = clearTimeout(this.timeout);
            if (opt && opt.timeout)
                setTimeout(function(){ __this.stop(); }, opt.timeout);
            need_finish = false;
            if (this.working)
                return;
            this.stop_timeout = clearTimeout(this.stop_timeout);
            this.working = true;
            this.$el.removeClass('g-hidden');
            setTimeout(function(){
                __this.$el.removeClass('g-transparent');
            }, 13);
            $('body').addClass('is-popup-loading');
            if (E.curr_view && E.curr_view.hide_search)
                E.curr_view.hide_search();
            if (int_id)
                clearInterval(int_id);
            int_id = setInterval(make_frame, 50);
            int2Id = setInterval(function(){
                spinner.style[transform_func]='rotate('+angle+'deg)';
                angle=(angle+d_angle)%360;
            }, 50);
        };
        this.stop = function(is_immediately){
            this.$el.addClass('g-transparent');
            clearInterval(int2Id);
            this.timeout = clearTimeout(this.timeout);
            this.stop_timeout = setTimeout(function(){
                set_aperture(0);
                _this.$el.addClass('g-hidden');
                $('body').removeClass('is-popup-loading');
            }, is_immediately ? 10 : animation_time);
            this.working = false;
        };
        this.enable = function(val){
            this.enabled = val;
            if (!val)
                this.stop(true);
        };
        this.finish = function(){
            if (need_finish)
                return;
            need_finish = true;
            this.timeout = clearTimeout(this.timeout);
            if (int_id)
                clearInterval(int_id);
            int_id = setInterval(make_frame, 13);
        };
    }
});
var install_exe_view_class = be_backbone.view.extend({
    className: 'install_exe',
    events: {'click .download': 'on_download'},
    message_id: null,
    render: function(){
        this.$el.html(templates.install_exe());
        be_popup_lib.perr_err({id: 'be_vpn_install_exe_view'});
        return be_backbone.view.prototype.render.apply(this);
    },
    on_download: function(){
        etask([function(){
            return be_popup_lib.perr_err({id: 'be_vpn_install_exe_click'});
        }, function(){
            E.ui_popup.open_page('http://hola.org/?auto_install=%7B%22type%22%3A%22full%22%2C%22flow%22%3A%22vpn%22%7D');
        }]);
    }
});

var rating_view_class = Backbone.View.extend({
    className: 'popup-rating',
    events: {
        'click .popup-rating-star': 'on_click'
    },
    initialize: function(opt){
        opt = opt||{};
        if (opt.hidden)
            this.$el.addClass('popup-rating-hidden');
        var $cont = $('<div>', {class: 'popup-rating-container'});
        var count = 5;
        var i = count;
        while (i--)
        {
            var num = count-i;
            $cont.append($('<span>', {class: 'popup-rating-star '+
                'popup-rating-star-'+num, 'data-num': num}));
        }
        $('<h3>', {class: 'popup-rating-title popup-more-title'})
        .text(T('Rate us'))
        .appendTo(this.$el);
        $('<div>', {class: 'popup-rating-msg'})
        .text(T('Thank you!'))
        .appendTo(this.$el);
        this.$el.append($cont);
    },
    show: function(){
        this.$el.removeClass('popup-rating-hidden');
        be_popup_lib.perr_ok({id: 'be_vpn_rating_display'});
    },
    get_num: function(target){
        var $star = $(target);
        if (!$star.hasClass('popup-rating-star'))
            return;
        return $star.data('num');
    },
    on_click: function(e){
        var num = this.get_num(e.target);
        if (!num)
            return;
        be_popup_lib.perr_ok({id: 'be_vpn_rating_rate', rate: num});
        E.be_info.ecall('set_vpn_last_rating', [num]);
        this.$el.addClass('popup-rating-hidden');
        this.trigger('chosen');
    },
});

var rated_view_class = Backbone.View.extend({
    className: 'popup-rated-view',
    events: {
        'click .popup-button-try': 'on_try_premium',
        'click .report-problem': 'on_report_problem',
        'click .rate-us': 'on_rate_us',
    },
    initialize: function(opt){
        this.opt = opt||{};
    },
    show: function(){
        this.opt.hidden = false;
        this.rating = E.be_info&&E.be_info.get('vpn_last_rating') || 0;
        this.is_premium = E.be_ext.get('is_premium');
        this.rate_on_store_ts = E.be_info&&E.be_info.get('rate_on_store');
        if (this.rating==5 && !this.rate_on_store_ts && be_version_util.cmp(
            storage.get('install_version'), '1.112.975')>0)
        {
            this.rate_on_store();
        }
        else
            this.render();
    },
    rate_on_store: function(){
        E.be_info.ecall('set_rate_on_store', [Date.now()]);
        var rate_url = 'https://chrome.google.com/webstore/detail'+
            '/hola-better-internet/gkojfkhlekighikafcpjkiklfbnlmeio/reviews';
        if (browser=='opera')
        {
            rate_url = 'https://addons.opera.com/en/extensions/details'+
                '/hola-better-internet/#feedback-container';
        }
        else if (browser=='firefox')
        {
            rate_url = 'https://addons.mozilla.org/ru/firefox/addon/'+
                'hola-unblocker/';
        }
        be_util.open_new_tab({url: rate_url});
    },
    render: function(){
        if (this.opt.hidden)
            return;
        this.$el.html(templates.rated({
            rating: this.rating,
            is_premium: this.is_premium,
            browser: browser,
        }));
        this.$el.find('.report-problem')
        .attr('href', be_util.problem_mailto_url());
        return this.$el;
    },
    on_try_premium: function(){
        var ref = this.rating==5 ? 'ext_working' : 'ext_not_working';
        be_popup_lib.perr_ok({id: 'be_try_plus_'+ref,
            info: {
                root_url: E.get_root(),
                country: E.get('country'),
            }});
        E.ui_popup.open_page(plus_ref(ref, {root_url: E.get_root()}));
    },
    on_report_problem: open_reporting_form,
    on_rate_us: function(){
        be_popup_lib.perr_ok({id: 'be_rate_webstore_click'});
    }
});

var more_opt_view_class = Backbone.View.extend({
    className: 'popup-more',
    is_fix_it_redirect: false,
    no_fix_it_count: {},
    initialize: function(){
        var _this = this;
        var opt = this.opt = {};
        opt.active_classname = 'popup-button-active';
        opt.yes_text = T('Oh, yes!');
        opt.yes_active_text = T('Awesome!');
        opt.no_text = T('No, fix it');
        opt.unsupported_text = T('No, fix it');
        var $el = this.$el;
        this.$title = $('<h3>', {class: 'popup-more-title'})
        .html('<span class=popup-more-title-text>'+T('Did it work?'
            +'</span>')).appendTo($el);
        this.$report = $('<button>', {class: 'popup-more-report'})
        .text(T('Report a problem')).hide().click(this.on_report.bind(this))
        .appendTo(this.$title);
        this.$buttons = $('<div>', {class: 'popup-more-row'}).appendTo($el);
        this.$btn_yes = $('<button>', {class:
            'popup-button popup-button-yes'})
        .text(opt.yes_text).appendTo(this.$buttons)
        .click(function(e){
            e.stopPropagation();
            _this.on_yes();
        });
        this.$btn_no = $('<button>', {class: 'popup-button popup-button-no'})
        .text(opt.no_text).appendTo(this.$buttons)
        .click(this.on_no.bind(this));
        this.$rating_wrapper = $('<div>', {class: 'vpn-rated-container'})
        .appendTo($el);
        this.rated_view = _this.rated_view||new rated_view_class({
            hidden: true});
        this.rated_view.$el.appendTo(this.$rating_wrapper);
        if (browser=='chrome')
        {
            this.rating_view = this.rating_view||new rating_view_class({
                hidden: true});
            this.rating_view.$el.appendTo(this.$rating_wrapper);
            this.rating_view.on('chosen', function(){
                _this.rated_view.show();
            });
        }
    },
    on_no: function(e){
        e = e||{};
        var tab_id = get_tab_id();
        this.no_fix_it_count[tab_id] = (this.no_fix_it_count[tab_id]||0)+1;
        this.update_yes(false);
        if (this.$support_link)
            this.$support_link.show();
        E.sp.spawn(get_handler().fix_vpn());
        E.be_ext.fcall('trigger', ['ui_not_working', {tab_id: tab_id,
            src: 'ui'}]);
        E.ui_popup.send_fix_it_report({
            rule: E.get_enabled_rule(),
            src_country: E.get('country'),
            event: e,
            send_logs: this.no_fix_it_count[get_tab_id()]==1,
            src: 'ui',
        });
        setTimeout(this.$report.show.bind(this.$report));
    },
    on_yes: function(){
        var _this = this;
        var rule_enabled = E.get_enabled_rule();
        if (!rule_enabled || this.poll_voted)
            return;
        set_working(rule_enabled);
        this.update_yes(true);
        E.ui_popup.send_vpn_work_report({rule: rule_enabled, src: 'ui',
            src_country: E.get('country')});
        this.poll_voted = true;
        var rating = E.be_info && E.be_info.get('vpn_last_rating') || 0;
        var vpn_work_yes = E.be_info && E.be_info.get('vpn_work_yes') || 0;
        vpn_work_yes++;
        if (E.be_info)
            E.be_info.ecall('increment_vpn_work_yes', []);
        this.$title.addClass('g-hidden');
        this.$buttons.hide(animation_time, function(){
            if (_this.rating_view && ((rating||0)<5 && vpn_work_yes%4==1))
                _this.rating_view.show();
            else
                _this.rated_view.show();
        });
        this.reset_fix_it_redirect();
    },
    on_report: open_reporting_form,
    update_yes: function(active){
        var $yes = this.$btn_yes;
        var $no = this.$btn_no;
        $yes.toggleClass(this.opt.active_classname, active)
        .text(active ? this.opt.yes_active_text : this.opt.yes_text);
        if (!active)
            return;
        $no.addClass('g-transparent');
        this.$title.addClass('g-transparent');
        setTimeout(function(){
            $no.addClass('g-hidden');
            $yes.addClass('popup-button-response');
        }, animation_time);
    },
    remove: function(){
        this.hide();
        Backbone.View.prototype.remove.call(this);
    },
    render: function(){
        var _this = this;
        var $no = this.$btn_no;
        this.prev_country = this.country;
        this.country = get_selected_country();
        if (this.prev_country!=this.country)
            this.reset_fix_it_redirect();
        this.is_fix_it_redirect = this._is_fix_it_redirect();
        $no.text(this.is_fix_it_redirect ? this.opt.unsupported_text
            : this.opt.no_text);
        this.$report.toggle(this.is_fix_it_redirect);
        if (!this.poll_voted)
            this.show();
        E.sp.spawn(etask({cancel: true}, [function(){
            return be_util.get_www_config();
        }, function(data){
            if (!data || !data.popup_need_help ||
                !data.popup_need_help.enabled)
            {
                return;
            }
            var countries = data.popup_need_help.countries;
            if (countries && countries.length &&
                !countries.includes(E.get('country')))
            {
                return;
            }
            if (_this.$support_link)
                _this.$support_link.remove();
            _this.$support_link = $('<a>', {target: '_blank'})
            .attr('href', 'https://hola.org/support')
            .text(' '+T('Need Help?'))
            .click(function(e){
                be_popup_lib.perr_ok({id: 'be_ui_vpn_number_of_need_help'});
            }).hide()
            .appendTo(_this.$buttons);
        }]));
    },
    show: function(){
        this.$el.removeClass('g-hidden');
        $('body').addClass('is-popup-mini');
    },
    hide: function(){
        this.$el.addClass('g-hidden');
        $('body').removeClass('is-popup-mini');
    },
    reset_fix_it_redirect: function(){
        this.no_fix_it_count[get_tab_id()] = 0;
    },
    _is_fix_it_redirect: function(){
        if (!E.be_ext.get('enable_unsupported'))
            return false;
        return this.no_fix_it_count[get_tab_id()]>=1;
    },
});

var TEXT_UNBLOCK = '<span class=sp_after>Unblock</span>'+
    '<span class=ellipsis>$1</span>?';
var TEXT_UNBLOCKED = '<span class=ellipsis>$1</span>'+
    '<span class=sp_before>unblocked!</span>';
var TEXT_PROTECTED = '<span class=ellipsis>$1</span>'+
    '<span class=sp_before>protected!</span>';
var TEXT_PROTECTED_BROWSER = '$1 browser protected!';
var TEXT_PROTECTED_PC = 'Your PC is protected!';
var TEXT_COUNTRY_CHANGE = '<span class=sp_after>Change</span>'+
    '<span class=ellipsis>$1</span><span class=sp_before>country to:</span>';
var TEXT_COUNTRY_CHANGED = '<span class=ellipsis>$1</span>'+
    '<span class=sp_before>country is:</span>';
var title_view_class = Backbone.View.extend({
    className: 'popup-hover-title',
    initialize: function(opt){
        this.opt = opt||{};
        var _this = this, $title_c;
        if (this.opt.no_search)
            this.$el.addClass('no-search');
        if (this.opt.flex)
            this.$el.addClass('flex');
        this.title_text = this.opt.title||T('Browsing from');
        this.$title = $('<div>', {class: 'popup-enabled-title'});
        this.$title.append($('<h2>', {class: 'popup-title'})
            .append($title_c = $('<span>', {class: 'popup-title-container'})));
        $title_c.append($('<span>', {class: 'popup-title-text'})
            .html(this.title_text));
        if (opt.sub_title_view)
        {
            $title_c.append($('<span>', {class: 'popup-title-subview'})
                .append(opt.sub_title_view));
        }
        this.$el.append(this.$title);
        if (this.opt.no_search)
            return;
        this.$search_container = $('<div>', {class:
            'popup-search-container'});
        this.$search = $('<div>', {class: 'popup-search'})
        .appendTo(this.$search_container);
        this.search = init_search(this.$search);
        this.search.$('.twitter-typeahead').append($('<span>', {class:
            'popup-search-trigger'}).click(function(){
                _this.search.select();
            }));
        this.$search.addClass('popup-search-advanced g-hidden');
        this.search.$el.addClass('g-transparent');
        this.$search.prepend($('<div>', {class: 'popup-search-title'})
            .html(T('Browsing')+'<span>&nbsp;'+T('From')+'</span>'));
        this.$search.append($('<div>', {class: 'popup-search-title-bottom'})
            .html('<span>'+T('Browsing')+'&nbsp;</span>'+T('From')));
        var events = {mouseenter: function(){ _this.show_search(); },
            mouseleave: function(){ _this.hide_search(); }};
        this.$title.on(events);
        this.$search.on(events);
        this.$el.prepend(this.$search_container);
    },
    render: function(){
        this.$title.find('.popup-title-text').html(this.title_text);
        if (this.opt.no_search)
            return;
        if (this.search.$input.typeahead)
            this.search.$input.typeahead('val', E.get_root());
        else
            this.search.$input.val(E.get_root());
    },
    show_search: function(){
        var _this = this;
        var $body = $('body');
        if ($body.hasClass('is-popup-loading'))
            return;
        this.search_hide_timer = clearTimeout(this.search_hide_timer);
        this.$title.addClass('g-hidden');
        this.$search.removeClass('g-hidden');
        this.search.$el.removeClass('g-transparent');
        this.search_show = setTimeout(function(){
            _this.$search.addClass('popup-search-hover');
        }, 13);
    },
    hide_search: function(){
        if (this.search_hide_timer)
            return;
        var _this = this;
        this.search.off('blur');
        if (this.$search.find('.js-search-active').length > 0 && this.search)
            this.search.on('blur', function(){ _this.hide_search(); });
        else
        {
            this.search_show = clearTimeout(this.search_show);
            this.search.$el.addClass('g-transparent');
            this.$search.removeClass('popup-search-hover');
            this.search_hide_timer = setTimeout(function(){
                _this.$title.removeClass('g-hidden');
                _this.$search.addClass('g-hidden');
            }, animation_time);
        }
    }
});
var user_message_view_class = Backbone.View.extend({
    className: 'user-message',
    initialize: function(){
        this.$el.hide();
        this.msg = this.get_message();
        if (this.msg)
        {
            var conf_msg = this.config(this.msg.id);
            conf_msg.show_n = (conf_msg.show_n||0)+1;
            this.config(this.msg.id, conf_msg);
            be_popup_lib.perr_ok({id: 'be_user_message_show', info:
                {id: this.msg.id}});
        }
    },
    _match_type_fn: function(type, every, cb){
        return function(match){
            match = match.filter(function(m){
                return m.type == type; });
            if (!match.length)
                return true;
            return match[every ? 'every' : 'some'](cb);
        };
    },
    get_message: function(){
        var _this = this;
        var conf = E.be_ext.get('bext_config');
        var messages = conf && conf.user_message || [];
        var country = get_selected_country(), site = E.get_root();
        var ext_data = {is_tpopup: !!is_tpopup};
        var svc_info = E.be_svc&&E.be_svc.get('info')||{};
        var svc_data = zutil.get(svc_info, 'raw.data')||[];
        var match_fns = [function(match, msg){
            var conf_msg = _this.config(msg.id);
            if (conf_msg.hide)
                return false;
            if (!msg.max_show)
                return true;
            return !(conf_msg.show_n>=msg.max_show);
        }, this._match_type_fn('version', false, function(m){
            return be_util.version() == m.value;
        }), this._match_type_fn('ext_data', true, function(m){
            return ext_data[m.name] == m.value;
        }), this._match_type_fn('svc_data', true, function(m){
            return svc_data.includes(m.value);
        }), this._match_type_fn('country', false, function(m){
            return m.value=='*' || m.value==country;
        }), this._match_type_fn('site', false, function(m){
            var host = m.value=='*' ? '**' : m.value;
            var re = new RegExp('^'+zurl.http_glob_host(host)+'$');
            return re.test(site);
        })];
        return messages.find(function(msg){
            var match = (msg.match||[]).map(function(m){
                if (typeof m=='string')
                {
                    var arr = m.split(':');
                    return {type: arr[0], value: arr[1]};
                }
                return m;
            });
            var res = match_fns.every(function(fn){
                return fn(match, msg); });
            if (res && !msg.show)
            {
                be_popup_lib.perr_ok({id: 'be_user_message_hidden',
                    info: {id: msg.id}});
                return false;
            }
            return res;
        });
    },
    config: function(id, c){
        var key = 'user_messages';
        var conf_obj = storage.get_json(key)||{};
        var conf_msg = Object.assign(conf_obj[id]||{}, c);
        if (!c)
            return conf_msg;
        var patch = {};
        patch[id] = conf_msg;
        storage.set_json(key, Object.assign(conf_obj, patch));
        return conf_msg;
    },
    render: function(){
        var _this = this;
        this.$el.empty();
        this.$el.attr('class', '');
        var msg = this.msg;
        if (!msg)
        {
            this.$el.hide();
            return;
        }
        var style = (msg.style||'info').split(/\s+/);
        this.$el.addClass('user-message');
        this.$el.addClass(style.map(function(s){
            return 'user-message-'+s; }).join(' '));
        if (style.includes('closable'))
        {
            var $close = $('<a class=close></a>');
            this.$el.append($close);
            $close.on('click', function(){
                _this.config(msg.id, {hide: true});
                _this.$el.hide();
                be_popup_lib.perr_ok({id: 'be_user_message_close', info:
                    {id: msg.id}});
            });
        }
        this.$el.append($('<div class=message></div>').html(msg.message));
        if (msg.link)
        {
            this.$el.append('<div class=more><a href="'+msg.link.url
                +'" target="_blank" rel="noopener noreferrer">'
                +msg.link.label+'</a></div>');
        }
        this.$el.find('.message a, .more a').on('click', function(ev){
            var __this = this;
            ev.stopPropagation();
            etask([function(){
                return be_popup_lib.perr_ok({id: 'be_user_message_click', info:
                    {id: msg.id}});
            }, function catch$(e){
                zerr.debug('user_message_click perr err %s', e);
            }, function(){
                if (__this.href.startsWith('mailto:'))
                    E.ui_popup.open_page(__this.href);
                else
                    be_util.open_tab({url: __this.href, force_new: true});
            }]);
            return false;
        });
        this.$el.show();
    }
});

var protecting_view_class = Backbone.View.extend({
    className: 'protecting-view',
    items: [{
        hide: function(){
            return E.skip_url({ignore_all_browser: true,
                ignore_protect_pc: true});
        },
        class: 'check check-site',
        label_text: function(){ return E.get_root(); },
        checked: function(){ return E.protect_ui.is_enabled(); },
        on_change: function(el){
            E.protect_ui.set_enabled(!E.protect_ui.is_enabled());
        },
        logo_url: function(){
            return 'http://favicon.yandex.net/favicon/'+E.get_root(); },
    }, {
        hide: function(){ return !E.protect_ui.protect_browser; },
        class: 'check check-browser '+browser,
        checked: function(){ return E.protect_ui.is_enabled_for_browser(); },
        on_change: function(){
            E.protect_ui.set_enabled_for_browser(
                !E.protect_ui.is_enabled_for_browser());
        },
        label_text: T('$1 browser', [string.capitalize(browser)]),
    }, {
        hide: function(){ return !E.protect_ui.protect_pc; },
        class: 'check check-desktop',
        label_text: T('All $1 applicatons', ['PC']),
        _checked: false,
        checked: function(){ return E.protect_ui.is_enabled_for_pc(); },
        on_change: function(el){
            var _this = this;
            etask([function(){
                if (!E.protect_ui.has_exe || !E.protect_ui.supported_exe)
                    return E.protect_ui.update_state();
            }, function(){
                if (!E.protect_ui.has_exe || !E.protect_ui.supported_exe)
                {
                    el.prop('checked', false);
                    be_popup_lib.perr_ok({id: 'be_ui_vpn_needs_app',
                        info: {update: +!!E.protect_ui.has_exe}});
                    return (E.protect_ui.has_exe ? _this.needs_app_update_view
                        : _this.needs_app_view).toggle();
                }
                E.protect_ui.set_enabled_for_pc(
                    !E.protect_ui.is_enabled_for_pc());
            }]);
        },
    }],
    initialize: function(){
        var _this = this;
        this.needs_app_view = new modal_view_class({
            text_main: TEXT_NEEDS_APP,
            text_yes: 'Download',
            on_yes_click: this._on_get_app_click,
        });
        this.needs_app_view.render();
        this.needs_app_update_view = new modal_view_class({
            text_main: TEXT_NEEDS_APP_UPDATE,
            text_yes: 'Download',
            on_yes_click: this._on_get_app_click,
        });
        this.needs_app_update_view.render();
        this.$el.append($('<div>', {class: 'title'}).text(T('Protecting:')));
        this.$el.append(this.items.map(function(item){
            if (!item)
                return;
            var text = typeof item.label_text=='function' ? item.label_text() :
                item.label_text;
            var el = $('<label>', {class: item.class})
                .html('<input type=checkbox><span class=cb_view></span>'+
                    '<span class=logo></span>'+
                    '<span class=text>'+text+'</span>');
            var checkbox = el.find('input');
            var checked = typeof item.checked=='function' ?
                item.checked(checkbox) : item.checked;
            checkbox.prop('checked', !!checked).change(item.on_change &&
                item.on_change.bind(_this, checkbox));
            if (item.logo_url)
            {
                el.find('.logo').css('background-image', 'url('+
                    item.logo_url()+')');
            }
            if (item.hide())
                el.hide();
            item.el = el;
            return el;
        }));
        this.$el.hide();
    },
    _on_get_app_click: function(){
        be_util.open_tab({url: 'https://hola.org/download', force_new: true});
    },
    render: function(){
        this.$el.toggle(E.protect_ui.is_enabled());
        this.items.forEach(function(item){
            var checkbox = item.el.find('input');
            var checked = typeof item.checked=='function' ?
                item.checked(checkbox) : item.checked;
            checkbox.prop('checked', !!checked);
        });
    },
    remove: function(){
        this.needs_app_view.remove();
        this.needs_app_update_view.remove();
        Backbone.View.prototype.remove.call(this);
    }
});

function unblock_on_click(e){
    E.loader.enable(true);
    set_unblock(e.value, get_hosts());
}

function get_hosts(){
    var host, hosts; 
    if (E.redirect_list)
    {
        host = E.redirect_list[0];
        hosts = E.redirect_list;
    }
    return {host: host, hosts: hosts};
}

function click_no_action(event, count){
    var tab_id = get_tab_id();
    E.sp.spawn(get_handler().fix_vpn());
    E.be_ext.fcall('trigger', ['ui_not_working', {tab_id: tab_id, src: 'ui'}]);
    E.ui_popup.send_fix_it_report({
        rule: E.get_enabled_rule(),
        src_country: E.get('country'),
        event: event,
        send_logs: count == 1,
        src: 'ui',
    });
}

var react_enable_view_class = Backbone.View.extend({
    className: 'popup-enabled',
    initialize: function(){
        zerr.notice('react class:initialize');
    },
    render: function(){
        E.$top.hide();
        $('body').addClass('is-popup-enable-view');
        zerr.notice('react class:render');
        var is_unblock = E.curr_view && E.curr_view.state=='enable';
        var is_protect = is_unblock && E.protect_ui.is_enabled();
        $(document.body).toggleClass('is-protect', !!is_protect);
        var country = (is_unblock&&get_selected_country() ||
            get_popular_country()[0].proxy_country).toLowerCase();
        var skip = E.skip_url({ignore_all_browser: true,
            ignore_protect_pc: true});
        ui_lib.render_enable_view(this.$el[0], {
            selected_country: get_selected_country(),
            on_country_select: react_on_country_select,
            is_protect: !!is_protect,
            is_unblock: !!is_unblock,
            on_unblock: unblock_on_click,
            country: country,
            click_no: click_no_action,
            src_country: E.get('country'),
            report_action: open_reporting_form,
            is_mitm: is_mitm_site() || is_mitm_active_manual(),
            type: 'protect',
            root_url: !skip && E.get_root(),
            is_protect_pc: E.protect_ui.is_enabled_for_pc(),
            is_protect_browser: E.protect_ui.is_enabled_for_browser(),
            tooltip: E.be_vpn.get('protect_tooltips')});
    },
    remove: function(){
        zerr.notice('react class:remove');
        E.$top.show();
        $('body').removeClass('is-popup-enable-view');
    }
});

function react_on_country_select(country){
    var hosts = get_hosts();
    var country_code = country.country || country.proxy_country;
    if (!country.disable)
    {
        be_popup_lib.perr_ok({id: 'be_ui_vpn_click_flag',
                    info: {host: hosts.host, country: country_code}});
    }
    if (country.disable)
        set_unblock(false);
    else if (country.protect)
    {
        E.protect_ui.set_default(true);
        E.protect_ui.set_enabled(true, hosts.host, hosts.hosts);
    }
    else
    {
        var rule_enabled = hosts.host ? null : E.get_enabled_rule();
        set_country_rule(country_code, {
            disable: country.disable,
            rule_enabled: rule_enabled,
            host: hosts.host, hosts: hosts.hosts,
            default_protect: country.protect});
    }
}

var enable_view_class = Backbone.View.extend({
    className: 'popup-enabled',
    initialize: function(){
        this.class_name = 'enable_view_class';
        var $container = this.$container = $('<div>',
            {class: 'popup-enabled-content'});
        var hover_title = this.hover_title = new title_view_class({
            no_search: true, flex: 1});
        this.$search = hover_title.$search;
        this.search = hover_title.search;
        this.country_selected_view = new country_selected_view_class();
        this.protecting_view = new protecting_view_class();
        this.stub_unblock = new stub_unblock_view_class();
        this.switch_privacy = new switch_privacy_view({});
        this.more_opt = new more_opt_view_class();
        this.user_message = new user_message_view_class();
        $container.append(this.user_message.$el, hover_title.$el,
            this.country_selected_view.$el);
        this.$el.append($container, this.protecting_view.$el,
            this.stub_unblock.$el, this.switch_privacy.$el,
            this.more_opt.$el);
    },
    get_title_text: function(opt){
        if (E.protect_ui.is_enabled())
        {
            if (E.protect_ui.is_enabled_for_pc())
                return T(TEXT_PROTECTED_PC);
            if (E.protect_ui.is_enabled_for_browser())
                return T(TEXT_PROTECTED_BROWSER, [string.capitalize(browser)]);
            return T(TEXT_PROTECTED, [E.get_root()]);
        }
        if (opt.is_mitm)
            return T(TEXT_UNBLOCKED, [E.get_root()]);
        return T(TEXT_COUNTRY_CHANGED, [E.get_root()]);
    },
    render: function(){
        var country = get_selected_country();
        var is_mitm = is_mitm_active_manual();
        var is_protected = E.protect_ui.is_enabled();
        var is_default = E.protect_ui.is_default();
        this.protecting_view.render();
        this.hover_title.title_text = this.get_title_text({is_mitm: is_mitm});
        this.hover_title.render();
        this.stub_unblock.render();
        this.more_opt.render();
        if (this.prev_country && this.prev_country==country &&
            this.prev_is_mitm==is_mitm && this.prev_is_default==is_default &&
            this.prev_is_protected==is_protected)
        {
            return;
        }
        this.user_message.render();
        this.country_selected_view.render({is_mitm: is_mitm,
            is_protected: is_protected, is_default: is_default});
        $('body').addClass('is-popup-enable-view');
        show_force_premium();
        this.prev_country = country;
        this.prev_is_mitm = is_mitm;
        this.prev_is_protected = is_protected;
        this.prev_is_default = is_default;
    },
    remove: function(){
        $('body').removeClass('is-popup-enable-view');
        if (this.more_opt)
        {
            this.more_opt.remove();
            this.more_opt = null;
        }
        this.country_selected_view.remove();
        this.stub_unblock.remove();
        this.switch_privacy.remove();
        this.user_message.remove();
        this.protecting_view.remove();
        Backbone.View.prototype.remove.call(this);
    }
});

var popular_view_react_class = Backbone.View.extend({
    initialize: function(){
        this.user_message = new user_message_view_class();
        this.$el.append(this.user_message.$el);
        this.$root = $('<div>').appendTo(this.$el);
        ui_lib.render_popular_view(this.$root[0]);
    },
    render: function(){
        this.user_message.render();
        ui_lib.render_popular_view(this.$root[0]);
    },
    remove: function(){
        ui_lib.unmountComponentAtNode(this.$el[0]);
        Backbone.View.prototype.remove.call(this);
    },
});

var redirect_view_class = Backbone.View.extend({
    className: 'popup-redirect hidden-until-reload',
    links: null,
    current_root: null,
    rule_enabled: null,
    disable_view: null,
    selected_host: null,
    events: {
        'change .sites-list .link input': '_on_site_change'
    },
    initialize: function(opt){
        this.current_root = svc_util.get_root_url(E.be_tabs.get('active.url'));
        this.links = opt.links;
        this.links.push(this.current_root);
        this.selected_host = this.links[0];
        this.rule_enabled = E.get_enabled_rule();
        this.show_list = false;
    },
    render: function(){
        var _this = this;
        if (this.disable_view)
            this.disable_view.remove();
        this.$el.empty();
        var $el = this.$el.css('display', 'none');
        $('body').addClass('is-redirect-suggest');
        var $list = this.$list = $('<ul>', {class: 'sites-list'});
        $list.toggle(this.show_list);
        _.forEach(this.links, function(link){
            _this.create_item(link, 'unblock', link==_this.selected_host)
            .data('link', link).appendTo($list);
        });
        var $show_redirects = $('<a>', {class: 'show-redirects'})
            .text(T('Show redirects'))
            .on('click', this._on_show_redirects.bind(this));
        var title_view = new title_view_class({
            title: T(TEXT_COUNTRY_CHANGE, [_this.selected_host]),
            no_search: true, sub_title_view: undefined&&$show_redirects,
            flex: 1});
        etask([function(){
            return show_force_premium({root_url: _this.selected_host});
        }, function(has_popup){
            if (has_popup)
                return;
            var hosts = _this.links.filter(function(host){
                return host!=_this.selected_host; });
            var country_selection_view = new country_selection_view_class({
                active_country: !!_this.rule_enabled&&E.get('country'),
                host: _this.selected_host, hosts: hosts});
            country_selection_view.on('select', _this._on_country_select,
                _this);
            _this.disable_view = new disable_view_class({
                title_view: title_view,
                header_content: $list,
                country_selection_view: country_selection_view,
                host: _this.selected_host,
                hosts: hosts,
            });
            $el.append(_this.disable_view.render().$el);
        }]);
    },
    _on_show_redirects: function(){
        this.show_list = !this.show_list;
        this.$list.slideToggle('fast', 'linear');
    },
    _on_country_select: function(country){
        var _this = this;
        etask([function(){
            return show_force_premium({root_url: _this.selected_host,
                country: country});
        }, function(res){
            if (res)
                return;
            E.redirect_view_closed = true;
            var info = {current_root: _this.current_root, links: _this.links,
                country: country};
            if (E.get('country')==country)
            {
                be_popup_lib.perr_ok({id: 'be_ui_vpn_redirect_reject', info:
                    info});
            }
            else
            {
                info.unblock = _this.selected_host;
                be_popup_lib.perr_ok({id: 'be_ui_vpn_redirect_unblock',
                    info: info});
            }
        }]);
    },
    _on_site_change: function(e){
        this.selected_host = $(e.target).closest('.link').data('link');
        this.render();
    },
    create_item: function(text, class_name, checked){
        var $text = $('<span>', {class: 'text'}).text(text);
        var $radio = $('<input>', {type: 'radio', name: 'country',
            checked: !!checked});
        var $label = $('<label>').append($radio).append($text);
        return $('<li>', {class: 'link f32 '+class_name}).append($label);
    }
});

function fix_vpn_perr(opt){
    if (!opt)
        return;
    var url = opt.url;
    var rule_enabled = opt.rule;
    if (!rule_enabled)
        return;
    var root_url = opt.root_url;
    var c = rule_enabled.country.toLowerCase();
    var info = assign({
        src_country: E.get('country').toLowerCase(),
        url: url,
        root_url: root_url,
        proxy_country: c,
        zagent_log: E.be_vpn.get('zagent_conn_log')||[],
        callback_raw: E.be_mode.get('svc.callback_raw'),
        callback_ts: E.be_mode.get('svc.callback_ts'),
        mode_change_count: E.be_mode.get('mode_change_count'),
        multiple_mode_changes: E.be_mode.get('mode_change_count')>2,
        real_url: E.be_tabs.get('active.url'),
        status: E.be_tabs.get('active.status'),
    }, _.pick(rule_enabled, 'name', 'type', 'md5'));
    return etask([function(){
        return E.be_tabs.ecall('get_trace', [get_tab_id()]);
    }, function(trace){
        info.page_load = trace && trace.length &&
            trace[trace.length-1].duration;
        return info;
    }, function finally$(){
        be_popup_lib.perr_err({id: 'be_ui_vpn_script_not_work', info: info});
    }]);
}
var fix_tasks = {};
function fix_vpn_old(cb){
    var rule_enabled = E.get_enabled_rule();
    var root_url = E.get_root(), url = E.get_url();
    if (!rule_enabled||!root_url)
    {
        be_popup_lib.perr_err({id: 'be_ui_vpn_no_rule',
            info: {country: E.get('country'), root_url: root_url, url: url}});
        return;
    }
    var info;
    var timeout = Date.now();
    var tab_id = get_tab_id();
    if (fix_tasks[tab_id])
        fix_tasks[tab_id].return();
    return fix_tasks[tab_id] = etask({cancel: true}, [function(){
        return fix_vpn_perr({rule: rule_enabled, root_url: root_url,
            url: url});
    }, function(perr_info){
        info = perr_info;
        return E.change_proxy(rule_enabled, 'not_working', true);
    }, function(){
        var proxy_timeout = Date.now()-timeout;
        if (proxy_timeout<10*SEC)
            return true;
        return this.return();
    }, function get_trace(){
        return E.be_tabs.ecall('get_trace', [tab_id]);
    }, function(trace){
        var last_trace = trace && trace.length && trace[trace.length-1];
        var status = last_trace && last_trace.status;
        if (!status)
        {
            this.fix_waiting = true;
            return this.wait(20*SEC);
        }
        info.page_load = last_trace && last_trace.duration;
        if (info.page_load<20*SEC && !['4', '5'].includes(status[0]))
            return this.return(true);
        return this.return();
    }, function(){
        this.fix_waiting = false;
        return this.goto('get_trace');
    }, function finally$(err){
        if (cb)
            return cb();
    }, function catch$(err){
        this.fix_waiting = false;
        be_popup_lib.perr_err({id: 'be_ui_vpn_script_fix_rule', info: info,
            err: err});
    }]);
}

E.on_show = function(){
    E.is_visible = true;
    update_footer();
    on_ext_display();
};

E.on_hide = function(){
    E.is_visible = false;
};

function on_ext_display(){
    if (E.is_visible && !E.displayed && !is_tpopup && E.curr_view)
    {
        E.displayed = true;
        be_popup_lib.perr_ok({id: 'be_ui_display_ext_vpn'});
    }
}

function must_install_exe(){
    return (browser=='firefox' && !E.conf.firefox_web_ext2 &&
        be_version_util.cmp(storage.get('install_version'), '1.11.965')>0 ||
        browser == 'torch') && (be_util.os_win() || be_util.os_mac() &&
        be_version_util.cmp(be_util.os_guess.version, '10.9')>=0) &&
        !E.be_mode.get('svc.detected');
}

function _get_redirect_list(){
    if (!E.be_tabs || !E.be_tabs.get_redirect_list)
        return;
    return E.be_tabs.fcall('get_redirect_list', [get_tab_id()]);
}

function get_redirect_list(){
    if (!chrome || is_tpopup || !E.be_tabs || !E.be_tabs.get_redirect_list
        || !E.be_premium)
    {
        return;
    }
    var list, premium_redirect = false;
    return etask([function(){
        return _get_redirect_list();
    }, function(l){
        list = l;
        if (!list || !list.length)
            return this.return();
        list = list.filter(function(u){ return u!='hola.org'; });
        var list_w_current = list.concat(
            svc_util.get_root_url(E.be_tabs.get('active.url')));
        return etask.for_each(list_w_current, [function(){
            return get_force_premium_rule({root_url: this.iter.val});
        }, function(rule){
            if (rule)
                premium_redirect = true;
        }]);
    }, function(){
        if (premium_redirect)
            return [];
        return list;
    }]);
}

function curr_view_remove(){
    if (!E.curr_view || !E.curr_view.remove)
        return;
    E.curr_view.remove();
    E.curr_view = null;
}

var privacy_agreement_view_class = Backbone.View.extend({
    initialize: function(){
        privacy.default.show_privacy_view(window.be_popup_main.be_bg_main);
    },
    remove: function(){
        if (privacy.default.privacy_sp)
            privacy.default.privacy_sp.return();
        Backbone.View.prototype.remove.call(this);
    },
});

var show_require_perr_sent;
E.render = _.debounce(function(){
    var be_bg_main = window.be_popup_main.be_bg_main;
    var $up, state, enabled = be_bg_main.get('enabled');
    var redirect_page = E.redirect_page();
    var navigating_to = E.get('navigating_to');
    E.sp.spawn(etask({cancel: true}, [function(){
        state = E.get('state');
        if (state=='error')
            return E.set_err('be_ui_vpn_render_state_err');
        state = !enabled ? 'turned_off' : state;
        var is_mitm = is_mitm_active_manual();
        if (E.curr_view && E.curr_view.state==state && !redirect_page
            && !navigating_to && !is_mitm &&
            E.get('rule_ratings.root_url')==E.prev_root_url)
        {
            return this.goto('render');
        }
        E.prev_root_url = E.get('rule_ratings.root_url');
        E.unset('hide_loader');
        $('body').removeClass('is_popular_view is-popup-off '+
            'is-popup-disabled is-popup-error is-redirect-suggest');
        if (!enabled)
        {
            curr_view_remove();
            E.curr_view = new turned_off_view_class();
        }
        else if (state == 'privacy_agreement')
        {
            curr_view_remove();
            E.curr_view = new privacy_agreement_view_class();
        }
        else if (must_install_exe())
        {
            curr_view_remove();
            E.curr_view = new install_exe_view_class();
        }
        else if (is_mitm)
        {
            state = 'enable';
            if (zutil.get(E.curr_view, 'class_name')!='enable_view_class')
            {
                curr_view_remove();
                E.curr_view = create_enable_view_class();
            }
        }
        else if (redirect_page || navigating_to)
        {
            var country = redirect_page ? redirect_page.country
                : navigating_to.country;
            state = 'enable';
            E.set('redirect_country', country);
            if (zutil.get(E.curr_view, 'class_name')!='enable_view_class')
            {
                curr_view_remove();
                E.curr_view = create_enable_view_class();
            }
        }
        else if (state=='skip_url')
        {
            curr_view_remove();
            E.curr_view = new popular_view_react_class();
        }
        else if (state=='premium_popup')
        {
            var hide_view = function(){
                E.unset('hide_loader');
                E.ui_popup.close_popup();
            };
            curr_view_remove();
            if (!show_require_perr_sent)
            {
                be_popup_lib.perr_ok({id: 'be_show_require_plus',
                    info: {root_url: E.get('premium_popup.root_url')}});
                show_require_perr_sent = true;
            }
            E.curr_view = new site_premium_ui({
                be_ext: E.be_ext,
                be_tabs: E.be_tabs,
                be_premium: E.be_premium,
                root_url: E.get('premium_popup.root_url') || E.get_root(),
                on_try: hide_view,
                unsupported: is_blacklist(E.get_root(), E.get_host()),
            });
        }
        else
        {
            curr_view_remove();
            return get_redirect_list();
        }
        return this.goto('update_state');
    }, function(redirect_list){
        E.redirect_list = redirect_list;
        if (!redirect_list || !redirect_list.length || E.redirect_view_closed)
            return;
        if (E.loader)
        {
            E.loader.finish();
            E.loader.stop(); 
        }
        curr_view_remove();
        E.curr_view = new redirect_view_class({links: redirect_list});
    }, function update_state(){
        if (!E.curr_view)
        {
            if (state=='enable')
                E.curr_view = create_enable_view_class();
            else
            {
                $('body').addClass('is-popup-disabled');
                E.curr_view = create_disable_view_class();
            }
        }
        E.curr_view.state = state;
        if (!E.curr_view.was_appeneded)
        {
            $up = $('<div>', {class: 'r_ui_up'}).append(E.curr_view.$el);
            E.$main.empty().append($up);
            E.curr_view.was_appeneded = true;
        }
    }, function render(){
        if (E.unblock_protect_view)
        {
            if (['enable', 'disable'].includes(state))
            {
                E.unblock_protect_view.$el.css('display', '');
                E.unblock_protect_view.render();
            }
            else
                E.unblock_protect_view.$el.hide();
        }
        E.curr_view.render();
        update_footer();
        on_ext_display();
    }, function(){ E.trigger('render_done');
    }, function catch$(err){ E.set_err('be_ui_vpn_render_err', err); }]));
});

function is_new_react_ui_enabled(){
    return zutil.get(E.be_ext.get('bext_config'), 'react.enabled_ui');
}

function create_disable_view_class(){
    return is_new_react_ui_enabled() ? new react_disable_view_class()
        : new disable_view_class();
}

function create_enable_view_class(){
    return is_new_react_ui_enabled() ? new react_enable_view_class()
        : new enable_view_class();
}

function set_user_cmd(opt){
    zerr.notice('tab:%d user action %s cmd %s country %s', get_tab_id(),
        opt.label, opt.cmd, opt.country);
    var new_state;
    if (E.get_enabled_rule() || E.skip_url())
        new_state = {};
    else
        new_state = {state: 'disable'};
    if (!new_state.state && opt.state)
        new_state.state = opt.state;
    E.set(assign({'user.country': opt.country, 'user.cmd': opt.cmd,
        'user.opt': opt}, opt.no_busy ? new_state :
        {status: 'busy', status_opt: {desc: 'Connecting...'}}));
}

function tab_reload(tabid, host){
    var url;
    if (host && !be_vpn_util.is_all_browser(E.get_enabled_rule()))
        url = zurl.add_proto(host);
    if (E.be_tabs.reload)
        return void E.be_tabs.fcall('reload', [tabid, url]);
    if (!url)
        return void B.tabs.reload(tabid, {bypassCache: true});
    B.tabs.update(tabid, {url: url, active: true});
}

function force_trial(root_url, tab_id, country){
    var opt = {country: country, tab_id: tab_id};
    return etask([function(){
        return !is_tpopup && E.be_vpn.ecall('tpopup_is_connected', [tab_id]);
    }, function(connected){
        if (connected)
        {
            E.be_vpn.fcall('trigger', ['force_trial', opt]);
            return this.return();
        }
    }, function(){
        return E.be_info.ecall('set_site_storage', [root_url, 'force_trial',
            opt]);
    }, function(){
        if (is_tpopup)
            return E.ui_popup.set_tpopup_type('watermark');
        var site_conf = be_util.get_site_conf(E.be_ext, root_url)||{};
        var arr = site_conf.root_url||[];
        var same_site = root_url==E.get_root() || arr.includes(root_url) &&
            arr.includes(E.get_root());
        if (same_site)
            return E.be_vpn.ecall('do_tpopup', [tab_id]);
        return tab_reload(tab_id, root_url);
    }, function finally$(){
        if (!is_tpopup)
            E.ui_popup.close_popup();
    }]);
}

E.script_set = function(rule, val){
    var ts = Date.now(), tabid = get_tab_id(), trial;
    return etask([function(){
        clr_working();
        return E.be_ext.ecall('set_enabled', [true]);
    }, function(){
        if (!E.be_ext.get('r.ext.enabled'))
            be_popup_lib.perr_err({id: 'be_ui_vpn_set_enabled_mismatch'});
        if (!E.be_ext.get('r.vpn.on'))
            return E.be_vpn.ecall('enable', []);
    }, function(){
        return E.be_trial.ecall('get_trial_active', [val.root_url]);
    }, function(res){
        if (trial = res)
        {
            E.be_info.fcall('set_site_storage', [val.root_url,
                'trial.dont_show_ended', !val.enabled]);
        }
    }, function(){
        return val.enabled && E.be_trial.ecall('need_trial', [val.root_url]);
    }, function(need_trial){
        if (need_trial)
        {
            force_trial(val.root_url, tabid, val.country||rule.country);
            return this.return();
        }
        var new_rule = {name: val.host || val.name || rule.name, tab_id: tabid,
            enabled: +val.enabled, country: val.country||rule.country,
            type: rule.type, root_url: val.host || val.root_url,
            mode: val.mode || get_mode(E.protect_ui.is_enabled())};
        if (val.expire)
            new_rule.expire = val.expire;
        new_rule.premium = !!val.premium;
        if (!new_rule.enabled)
            E.set('navigating_to', false);
        return E.be_rule.fcall('trigger', ['set_rule', new_rule]);
    }, function(){
        if (!val.enabled || val.silent)
            return;
        update_status();
        if (E.get('status')!='busy')
            return;
        E.once('change:status', function(){ this.continue(); }.bind(this));
        return this.wait(10*SEC);
    }, function(){
        if (val.enabled && !val.silent)
        {
            var et;
            var site_conf = be_util.get_site_conf(E.be_ext, val.root_url);
            var host = val.host ? val.host : site_conf && trial &&
                zutil.get(site_conf, 'trial.trial_redirect');
            tab_reload(tabid, host);
            if (et = tab_wait[tabid])
                et.return();
            tab_wait[tabid] = etask([function(){
                E.set('more_opt_delay_wait', true);
                return etask.sleep(10*SEC);
            }, function finally$(){
                E.set('more_opt_delay_wait', false);
            }]);
        }
        var d;
        if (val.wait && (d = Date.now()-ts)<val.max_wait)
            return etask.sleep(Math.min(val.max_wait-d, val.wait));
    }, function(){
        be_popup_lib.perr_ok({id: 'be_ui_vpn_script_set_ok', info:
            {name: rule.name, src_country: E.get('country').toLowerCase(),
            root_url: val.root_url, enabled: val.enabled, premium:
            val.premium}});
    }, function catch$(err){
        E.set_err('be_ui_vpn_script_set_err', err);
    }]);
};

E.perr_event = function(action, opt){
    var category = opt.category || 'bext';
    var label = opt.label;
    var id = category+(label ? '_'+label : '')+'_'+action;
    var info_opt = $.extend({src_country:
        E.get('country').toLowerCase()}, opt.info);
    ga.ga_send('event', category, action, label);
    if (!opt.err)
        return be_popup_lib.perr_ok({id: id, info: info_opt});
    return be_popup_lib.perr_err({id: id, info: info_opt});
};

return E;
});
