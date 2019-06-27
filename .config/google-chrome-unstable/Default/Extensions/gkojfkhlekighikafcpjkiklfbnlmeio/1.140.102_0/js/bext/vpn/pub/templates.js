// LICENSE_CODE ZON
;(function () {
  'use strict'; define(['exports', 'underscore', '/bext/pub/locale.js', '/bext/vpn/pub/util.js', 'regenerator-runtime'], function (exports, _underscore, _locale, _util) {Object.defineProperty(exports, "__esModule", { value: true });var _underscore2 = _interopRequireDefault(_underscore);var _locale2 = _interopRequireDefault(_locale);var _util2 = _interopRequireDefault(_util);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}




    var E = {};
    var e = _underscore2.default.escape;
    var t = function t(v) {return e((0, _locale2.default)(v));};

    E.country_list_item = function (opt) {
      var flag_class = opt.disable && 'flag_disable' || opt.mitm && 'flag_unblock' ||
      opt.protect && 'flag_protect' || opt.country.toLowerCase();
      return '\n<li class="country" data-country="' +
      opt.country + '"\n  data-mitm="' +
      !!opt.mitm + '" data-disable="' + !!opt.disable + '"\n  data-premium="' + (
      opt.type == 'premium' ? 1 : 0) + '" data-protect="' + !!opt.protect + '">\n  <a class="f32 ui_lock_parent">\n  <span class="ui_lock_container flag ' +

      flag_class + '"></span>\n  <span class="flag_name" title="' +
      opt.name + '"> ' + opt.name + '</span>\n  ' + (
      opt.type == 'premium' ? '<span class="flag_type">' +
      t('PLUS') + '</span>' : '') + '\n  </a>\n</li>';


    };

    E.menu_products = function (opt) {
      return '\n<div class=products>\n  <a href="https://hola.org/unblock/popular/' +

      opt.country + '"\n    target=_blank class=more-sites>\n    ' +

      t('Unblock more sites...') + '</a>\n  <div class="list">\n    <a href="https://hola.org/plus_setup?platform=windows&utm_source=holaext&utm_content=' +

      opt.origin + '-products"\n      target=_blank title="Windows" class="item windows"></a>\n    <a href="https://hola.org/plus_setup?platform=mac&utm_source=holaext&utm_content=' +

      opt.origin + '-products"\n      target=_blank title="macOS" class="item mac"></a>\n    <a href="https://play.google.com/store/apps/details?id=org.hola.prem&referrer=utm_source%3Dholaext%26utm_content%3D' +

      opt.origin + '-products"\n      target=_blank title="Android" class="item android"></a>\n    <a href="https://itunes.apple.com/us/app/hola-privacy-vpn-app-browser/id903869356?mt=8&ct=holaext-' +

      opt.origin + '-products"\n      target=_blank title="iOS" class="item ios"></a>\n    <a href="https://hola.org/plus_setup?platform=smarttv&utm_source=holaext&utm_content=' +

      opt.origin + '-products"\n      target=_blank title="Smart TV" class="item smarttv"></a>\n    <a href="https://hola.org/plus_setup?platform=console&utm_source=holaext&utm_content=' +

      opt.origin + '-products"\n      target=_blank title="' +
      t('Consoles') + '" class="item console"></a>\n  </div>\n</div>';


    };


    E.menu_account = function (opt) {
      var plus_upgrade = _util2.default.plus_ref('holaext-menu-account-upgrade',
      { utm_source: 'holaext', utm_content: 'menu-account-upgrade' });
      var plus_try = _util2.default.plus_ref('holaext-menu-account-try',
      { utm_source: 'holaext', utm_content: 'menu-account-try' });
      return '\n<div class=header>' +
      t('My account') + '</div>\n  <div class=info>\n    <div class=title>' +

      t('Account type:') + '</div>\n    <div class=value>\n      ' + (

      opt.is_premium ? '' + t('PLUS') : '' + t('Free')) + '\n      ' + (
      !opt.is_premium ? '\n      <a href="' +
      plus_upgrade + '"\n        class=upgrade target=_blank>' +
      t('Upgrade') + '</a>' : '\n      <a class=manage href="https://hola.org/cp?utm_source=holaext&utm_content=menu-account-manage"\n        target=_blank>' +

      t('Manage') + '</a>') + '\n    </div>\n    ' + (

      !opt.is_tpopup ? '\n    <div class=title>' +
      t('User:') + '</div>\n    <div class="value ellipsis">' +
      e(opt.email) + '</div>' : '') + '\n  </div>\n  ' + (

      opt.is_premium ? '' + opt.products : '') + '\n  <div class=log-out>\n    <button class=menu-button>' +

      t('Log out') + '</button>\n  </div>\n  ' + (

      !opt.is_premium ? '\n  <div class=try-premium>\n    <a href="' +

      plus_try + '" target=_blank>' + t('Try Hola VPN PLUS') + '</a>\n  </div>' :
      '');
    };

    E.menu_button = function () {
      return '\n<i class="popup-header-controls-button popup-header-nav"\n  title="' +

      t('Menu') + '">\n  <svg class="hamburger-top" height="100%" width="100%"\n    viewBox="0 0 14 2" style="display:none;">\n    <path d="M1 2h12c.6 0 1-.4 1-1s-.4-1-1-1H1C.4 0 0 .4 0 1s.4 1 1 1z"/>\n  </svg>\n  <svg class="hamburger-middle" height="100%" width="100%"\n    viewBox="0 0 14 2" style="display:none;">\n    <path d="M1 2h12c.6 0 1-.4 1-1s-.4-1-1-1H1C.4 0 0 .4 0 1s.4 1 1 1z"/>\n  </svg>\n  <svg class="hamburger-bottom" height="100%" width="100%"\n    viewBox="0 0 14 2" style="display:none;">\n    <path d="M1 2h12c.6 0 1-.4 1-1s-.4-1-1-1H1C.4 0 0 .4 0 1s.4 1 1 1z"/>\n  </svg>\n</i>';













    };

    E.menu = function (opt) {
      var plus_try = _util2.default.plus_ref('holaext-menu-try',
      { utm_source: 'holaext', utm_content: 'menu-try' });
      return '\n<div class=modal-menu>\n  <div\n    class="modal-menu-general' + (


      opt.display_name ? ' user-signed' : '') + '">\n    <div class="user-info-wrapper">\n      ' + (

      opt.display_name ? '\n      <div class="user-info">\n        <div class=user-status>\n          ' + (


      opt.is_premium ? '' + t('Hola VPN PLUS') : '' +
      t('Hola Free VPN')) + '\n        </div>\n        <div class=user-name>\n          ' + (


      opt.is_tpopup ? '' + t('Your account') : '' +
      e(opt.display_name)) + '\n        </div>\n      </div>' : '\n      <a class="user_link user_link_login menu-button" id=sign_in target=_blank\n        href="https://hola.org/signin?utm_source=holaext&utm_content=menu">\n        ' +




      t('Log in') + '\n      </a>') + '\n    </div>\n    <ul class="menu-items">\n      ' + (



      opt.is_premium ? '\n      <li class="menu-item-protect menu-item">\n        <a href="https://hola.org/plus_setup?platform=windows&utm_source=holaext&utm_content=menu-protect"\n          target=_blank>\n          ' +



      t('Protect entire PC') + '\n        </a>\n      </li>\n      <li class="menu-item-install menu-item">\n        <a href="https://hola.org/plus_setup?utm_source=holaext&utm_content=menu-install"\n          target=_blank>\n          ' +





      t('Install on other devices') + '\n        </a>\n      </li>\n      <li class="menu-item-divider menu-item"></li>' :


      '') + '\n      ' + (
      opt.is_lang ? '\n      <li class="l_menuitem_lang menu-item-lang menu-item">\n        <a href="#">' +

      t('Language') + '</a>\n      </li>' :
      '') + '\n      <li class="menu-item menu-item-settings">\n        <a>' +

      t('Settings') + '</a>\n      </li>\n      <li class="menu-item menu-item-hide-ip">\n        <a href=#>' +


      t('Hide my IP') + '</a>\n      </li>\n      <li class="menu-item-help menu-item"><a\n        class="user_link"\n        href="https://hola.org/faq"\n        target=_blank>' +




      t('Help') + '</a></li>\n      <li class="menu-item-about menu-item">\n        <a>' +

      t('About') + '</a>\n      </li>\n      ' + (

      opt.dev_mode ? '\n      <li class="menu-item-debug menu-item">\n        <a>' +

      t('Debug') + '</a>\n      </li>' :
      '') + '\n      ' + (
      !opt.is_premium ? '\n      <li class="menu-item-premium menu-item">\n        <a href="' +

      plus_try + '" target=_blank>\n          ' +
      t('Try Hola VPN PLUS') + '\n        </a>\n      </li>' :

      '') + '\n      <li class="menu-item-issue menu-item">\n        <a>' +

      t('Report a problem') + '</a>\n      </li>\n    </ul>\n    ' +


      opt.products + '\n  </div>\n</div>';


    };

    E.switch_privacy = function (opt) {
      return '\n<label>\n  <input type=checkbox>' +

      t('Total privacy - make me anonymous') + '\n</label>';

    };

    E.modal_view = function (opt) {
      return '\n<div>\n  <div class=btn_close></div>\n  ' + (


      opt.signin ? '\n  <a target=_blank class=sign-in\n    href="https://hola.org/signin?utm_source=holaext&utm_content=' +

      opt.signin + '">\n    ' +
      t('Log in') + '</a>' : '') + '\n  <div class=message>' +
      opt.text_main + '</div>\n  <div class=buttons><div class=btn_no>' +
      opt.text_no + '</div>\n  <div class=btn_yes>' +
      opt.text_yes + '</div>\n</div>';

    };

    E.popup_disabled = function (opt) {
      return '\n<h1>' +
      t('Hola is off') + '</h1>\n<i class=' +
      opt.class_name + '-icon></i>\n<h2>' +
      t('Click to turn it on') + '</h2>';
    };

    E.install_exe = function (opt) {
      return '\n<h2 class=title translate>Almost done!</h2>\n<div class=icon></div>\n<h3 translate>Install the Hola VPN engine</h3>\n<p translate>to start using your VPN</p>\n<div class=download><div class=link translate>Next</div></div>';





    };

    E.rated = function (opt) {
      return '\n<div>\n  ' + (

      opt.browser == 'chrome' && opt.rating == 5 ? '\n  <a class=rate-us target=_blank\n    href="https://chrome.google.com/webstore/detail/hola-better-internet/gkojfkhlekighikafcpjkiklfbnlmeio/reviews">\n    ' +


      t('Rate us in webstore') + '</a>' : '') + '\n  ' + (
      !opt.is_premium ? '\n  <button class="popup-button popup-button-try">\n    ' +

      t('Try Hola VPN PLUS') + '\n  </button>' :
      '') + '\n</div>';

    };


    E.site_premium = function (opt) {
      return '\n<div class=top>\n  <div class=image></div>\n  <div class=titles>\n    <div class=title>' +



      opt.root_url + '</div>\n    <div class=subtitle translate>Requires specialized servers</div>\n  </div>\n  <div class=try>' +


      t('Subscribe to PLUS') + '</div>\n</div>\n<div class=bottom>\n  ' + (


      opt.show_cancel ? '\n  <div class=cancel translate>Cancel</div>' :
      '') + '\n</div>';

    };exports.default =

    E;});})();
//# sourceMappingURL=templates.js.map
