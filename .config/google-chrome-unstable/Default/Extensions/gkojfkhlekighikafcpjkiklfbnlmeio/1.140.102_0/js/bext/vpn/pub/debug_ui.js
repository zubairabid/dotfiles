// LICENSE_CODE ZON
;(function () {
    'use strict'; define(['exports', 'react', 'react-dom', '/util/etask.js', '/util/util.js', '/util/storage.js', '/bext/pub/util.js', '/bext/vpn/pub/util.js', '/protocol/pub/countries.js', '/util/zerr.js', '/bext/pub/locale.js', '/util/url.js', 'regenerator-runtime'], function (exports, _react, _reactDom, _etask, _util, _storage, _util3, _util5, _countries, _zerr, _locale, _url) {Object.defineProperty(exports, "__esModule", { value: true });var _react2 = _interopRequireDefault(_react);var _reactDom2 = _interopRequireDefault(_reactDom);var _etask2 = _interopRequireDefault(_etask);var _util2 = _interopRequireDefault(_util);var _storage2 = _interopRequireDefault(_storage);var _util4 = _interopRequireDefault(_util3);var _util6 = _interopRequireDefault(_util5);var _countries2 = _interopRequireDefault(_countries);var _zerr2 = _interopRequireDefault(_zerr);var _locale2 = _interopRequireDefault(_locale);var _url2 = _interopRequireDefault(_url);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}












        var E = {};

        function set_dbg_conf(path, value) {
            var conf = _storage2.default.get_json('hola_conf') || {};
            _util2.default.set(conf, path, value);
            _storage2.default.set_json('hola_conf', conf);
            E.be_vpn.force_bext_config_update();
        }

        function get_root_url() {
            var url = E.be_tabs.get('active.url') || '';
            return E.svc_util.get_root_url(url);
        }var

        Debug_conf_switch = function (_React$PureComponent) {_inherits(Debug_conf_switch, _React$PureComponent);
            function Debug_conf_switch(props) {_classCallCheck(this, Debug_conf_switch);var _this2 = _possibleConstructorReturn(this, (Debug_conf_switch.__proto__ || Object.getPrototypeOf(Debug_conf_switch)).call(this,
                props));_this2.


















                handle_change = function (e) {
                    var checked = e.target.checked;
                    _this2.set_conf_value(checked ? _this2.value : undefined);
                    _this2.setState({ checked: checked });
                };_this2.value = props.value === undefined ? true : props.value;_this2.state = { checked: _util2.default.equal_deep(_this2.value, _this2.get_conf_value()) };return _this2;}_createClass(Debug_conf_switch, [{ key: 'get_conf_value', value: function get_conf_value() {if (this.props.storage) return _storage2.default.get_json(this.props.name);return _util6.default.get_dbg_conf(this.props.name);} }, { key: 'set_conf_value', value: function set_conf_value(value) {if (this.props.storage) {_storage2.default.set_json(this.props.name, value);E.be_vpn.trigger('storage_debug_change');} else set_dbg_conf(this.props.name, value);} }, { key: 'render', value: function render()
                {
                    return _react2.default.createElement('div', { className: 'debug_switch' },
                    _react2.default.createElement('label', null,
                    _react2.default.createElement('input', { type: 'checkbox', checked: this.state.checked,
                        onChange: this.handle_change }),
                    this.props.children));


                } }]);return Debug_conf_switch;}(_react2.default.PureComponent);var


        Change_trial = function (_React$PureComponent2) {_inherits(Change_trial, _React$PureComponent2);function Change_trial() {var _ref;var _temp, _this3, _ret;_classCallCheck(this, Change_trial);for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {args[_key] = arguments[_key];}return _ret = (_temp = (_this3 = _possibleConstructorReturn(this, (_ref = Change_trial.__proto__ || Object.getPrototypeOf(Change_trial)).call.apply(_ref, [this].concat(args))), _this3), _this3.
                state = { value: 60 }, _this3.








                on_change = function (event) {return _this3.setState({ value: event.target.value });}, _this3.
                on_click = function () {
                    E.be_trial.ecall('set_time_left', [get_root_url(),
                    _this3.state.value * 1000]);
                }, _temp), _possibleConstructorReturn(_this3, _ret);}_createClass(Change_trial, [{ key: 'componentDidMount', value: function componentDidMount() {var _this = this;return (0, _etask2.default)(regeneratorRuntime.mark(function _callee() {var trial;return regeneratorRuntime.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:_context.next = 2;return E.be_trial.ecall('get_trial_active', [get_root_url()]);case 2:trial = _context.sent;_this.setState({ trial: trial, value: 60 });case 4:case 'end':return _context.stop();}}}, _callee, this);}));} }, { key: 'render', value: function render()
                {var
                    state = this.state;
                    if (!state || !state.trial)
                    return null;
                    return _react2.default.createElement('div', { className: 'change-trial' }, 'Move trial time: ',
                    _react2.default.createElement('input', { type: 'number', min: '10', step: '30',
                        value: Math.round(state.value), onChange: this.on_change }), 'sec ',
                    _react2.default.createElement('button', { onClick: this.on_click }, ' Go'));

                } }]);return Change_trial;}(_react2.default.PureComponent);var


        Debug_view = function (_React$PureComponent3) {_inherits(Debug_view, _React$PureComponent3);function Debug_view() {var _ref2;var _temp2, _this4, _ret2;_classCallCheck(this, Debug_view);for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {args[_key2] = arguments[_key2];}return _ret2 = (_temp2 = (_this4 = _possibleConstructorReturn(this, (_ref2 = Debug_view.__proto__ || Object.getPrototypeOf(Debug_view)).call.apply(_ref2, [this].concat(args))), _this4), _this4.
                state = {}, _this4.
                on_close = function () {return E.inited_sp.return();}, _this4.
                on_rule_rating = function () {return _this4.setState({ page: 'rule_rating' });}, _this4.
                on_disable_debug = function () {return (0, _etask2.default)(regeneratorRuntime.mark(function _callee2() {return regeneratorRuntime.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:_context2.next = 2;return (
                                            E.be_dev_mode.fcall('enable', [false]));case 2:
                                        if (E.ui_popup)
                                        E.ui_popup.close_popup();case 3:case 'end':return _context2.stop();}}}, _callee2, this);}));}, _temp2), _possibleConstructorReturn(_this4, _ret2);}_createClass(Debug_view, [{ key: 'render', value: function render()

                {
                    var enable_mitm = { disable: false, trigger: true, discovery: 'auto' };
                    var enable_mitm_ui = Object.assign({ popup: { enable: true },
                        enable_ext_ui: 1 }, enable_mitm);
                    var site_trial = { min_ver: _util4.default.version() };
                    var fa_rule = { ip: '38.32.25.106', host: 'zagent1685.hola.org',
                        port: 22222 };
                    return _react2.default.createElement('div', { className: 'debug_view' },
                    _react2.default.createElement('header', null,
                    _react2.default.createElement('h1', null, 'Debug ',
                    _react2.default.createElement('i', { className: 'btn_close', onClick: this.on_close }))),


                    this.state.page == 'rule_rating' ? _react2.default.createElement(Rule_rating_view, null) : undefined,
                    !this.state.page ?
                    _react2.default.createElement('div', null,
                    E.be_dev_mode &&
                    _react2.default.createElement('a', { onClick: this.on_disable_debug }, 'Disable debug'),
                    _react2.default.createElement(Debug_conf_switch, { name: 'protect_ui2.protect_pc' }, 'Enable desktop app in protect ui'),


                    _react2.default.createElement(Debug_conf_switch, { name: 'protect_ui2.protect_browser' }, 'Enable browser in protect ui'),


                    _react2.default.createElement(Debug_conf_switch, { name: 'debug.show_redirect' }, 'Show redirect in popup'),


                    _react2.default.createElement(Debug_conf_switch, { name: 'debug.show_rule_rating' }, 'Show rule rating in popup'),


                    _react2.default.createElement(Debug_conf_switch, { name: 'geo_popup.watermark.enabled' }, 'Enable watermark popup'),


                    _react2.default.createElement(Debug_conf_switch, { name: 'geo_popup.watermark.new_dialog' }, 'Enable new watermark dialogs'),


                    _react2.default.createElement(Debug_conf_switch, { name: 'mitm', value: enable_mitm }, 'Enable mitm trigger'),


                    _react2.default.createElement(Debug_conf_switch, { name: 'mitm', value: enable_mitm_ui }, 'Enable mitm trigger + ui'),


                    _react2.default.createElement(Debug_conf_switch, { name: 'sites.svtplay_se', value: site_trial }, 'Enable svtplay trial'),


                    _react2.default.createElement(Debug_conf_switch, { name: 'sites.netflix_com', value: site_trial }, 'Enable netflix trial'),


                    _react2.default.createElement(Debug_conf_switch, { name: 'be_force_agent', value: fa_rule,
                        storage: true }, 'Force using pool for streaming'),


                    _react2.default.createElement(Debug_conf_switch, { name: 'be_watermark_debug', value: true,
                        storage: true }, 'Watermark debug'),


                    _react2.default.createElement(Change_trial, null),
                    _react2.default.createElement('a', { onClick: this.on_rule_rating }, 'Rule rating page')) :
                    undefined);


                } }]);return Debug_view;}(_react2.default.PureComponent);


        function get_popular_country(host, rule_ratings) {
            return _util6.default.get_popular_country({ host: host || E.get_host(),
                rule_ratings: rule_ratings });
        }

        function get_ratings(host, rule_ratings) {
            var popular_countries = get_popular_country(host, rule_ratings);
            var tld = _util6.default.get_tld_country(host);
            var ratings = [popular_countries[0], popular_countries[1]];
            if (tld && tld != ratings[0].proxy_country &&
            tld != ratings[1].proxy_country)
            {
                ratings.push({ proxy_country: tld, rating: 0.1 });
                ratings.sort(function (a, b) {return b.rating - a.rating;});
            }
            if (tld && tld != ratings[0].proxy_country &&
            tld != ratings[1].proxy_country)
            {
                ratings.push({ proxy_country: tld, rating: 0.1 });
                ratings.sort(function (a, b) {return b.rating - a.rating;});
            }
            return ratings;
        }

        var min_suggest_rate = 0.3; 
        var Rule_rating_view = function (_React$PureComponent4) {_inherits(Rule_rating_view, _React$PureComponent4);function Rule_rating_view() {var _ref3;var _temp3, _this5, _ret3;_classCallCheck(this, Rule_rating_view);for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {args[_key3] = arguments[_key3];}return _ret3 = (_temp3 = (_this5 = _possibleConstructorReturn(this, (_ref3 = Rule_rating_view.__proto__ || Object.getPrototypeOf(Rule_rating_view)).call.apply(_ref3, [this].concat(args))), _this5), _this5.
                state = {}, _this5.




























































































                onChange = function (e) {
                    var country = e.target.value;
                    _zerr2.default.notice('set country %s', country);
                    _this5.set_country(country);
                }, _temp3), _possibleConstructorReturn(_this5, _ret3);}_createClass(Rule_rating_view, [{ key: 'set_country', value: function set_country(country) {var _this = this,url = E.be_tabs.get('active.url') || '';var host = _url2.default.get_host(url);var root_url = E.svc_util.get_root_url(url);var unblocking_rate_url = E.be_info.get_unblocking_rate_url(200, country);var rate = void 0,show_geo = void 0,rule_ratings = void 0,ratings = void 0,force_premium = void 0,need_mitm = void 0; 
                    (0, _etask2.default)([function () {return E.be_info.get_unblocking_rate(200, country);}, function (unblocking_rate) {for (var i = 0, r; !rate && (r = unblocking_rate[i]); i++) {if (r.root_url == root_url) rate = r;}show_geo = rate && rate.unblocking_rate > min_suggest_rate;}, function () {return E.be_rule.ecall('get_rule_ratings', [{ root_url: root_url, country: country, limit: 20, vpn_only: true }]);}, function (_rule_ratings) {rule_ratings = _rule_ratings;return E.be_premium.ecall('get_force_premium_rule', [root_url]);}, function (premium) {force_premium = !!premium;return E.be_vpn.ecall('mitm_need_popup', [url]);}, function (_need_mitm) {need_mitm = _need_mitm;ratings = get_ratings(host, rule_ratings);_this.setState({ inited: true, rate: rate, show_geo: show_geo, ratings: ratings, rule_ratings: rule_ratings, force_premium: force_premium, need_mitm: need_mitm, country: country, root_url: root_url, unblocking_rate_url: unblocking_rate_url });}, function catch$(err) {console.error('debug_ui error %s %o', err, err);}]);} }, { key: 'componentDidMount', value: function componentDidMount() {var country = E.be_info.get('country');this.set_country(country);} }, { key: 'on_debug_rule_rating', value: function on_debug_rule_rating() {E.render_debug_view();} }, { key: 'render', value: function render() {var compact = this.props.compact;var _state = this.state,country = _state.country,root_url = _state.root_url,unblocking_rate_url = _state.unblocking_rate_url,rate = _state.rate,show_geo = _state.show_geo,inited = _state.inited,ratings = _state.ratings,rule_ratings = _state.rule_ratings,force_premium = _state.force_premium,need_mitm = _state.need_mitm;console.log('---- country %s root_url %s unblocking_rate_url %s ' + 'rate %o show_geo', country, root_url, unblocking_rate_url, rate, show_geo);var flag = ratings && ratings[0].proxy_country;var flag2 = ratings && ratings[1].proxy_country; 
                    var s = { overflow: 'auto', wordWrap: 'normal' };if (compact) {if (!inited) return _react2.default.createElement('div', null);var info = !rate ? 'no rating' : 'rate from ' + country + ' ' + parseInt(rate.unblocking_rate * 100) + '% (' + parseInt(rate.popularity) + ')';return _react2.default.createElement('div', { style: { textAlign: 'left', overflow: 'auto' }, onClick: this.on_debug_rule_rating }, _react2.default.createElement('div', { style: s }, _react2.default.createElement('div', null, info), 'flags ', flag, ' ', flag2, force_premium ? ' plus' : '', need_mitm ? ' mitm' : '', show_geo ? ' geo' : ''));}return _react2.default.createElement('div', { style: { textAlign: 'left' } }, _react2.default.createElement('div', { style: s }, 'root_url: ', root_url), _react2.default.createElement('div', { style: s }, 'your country: ', country), _react2.default.createElement('div', { style: s }, _react2.default.createElement(Country_list, { country: 'IL', onChange: this.onChange })), _react2.default.createElement('div', { style: s }, '1st flag: ', flag), _react2.default.createElement('div', { style: s }, '2nd flag: ', flag2), _react2.default.createElement('div', { style: s }, 'premium popup: ', '' + !!force_premium), _react2.default.createElement('div', { style: s }, 'mitm popup: ', '' + !!need_mitm), _react2.default.createElement('div', { style: s }, 'geo popup: ', '' + !!show_geo), _react2.default.createElement('div', { style: s }, 'geo threshold: ', min_suggest_rate), _react2.default.createElement('div', { style: s }, _react2.default.createElement('br', null), _react2.default.createElement('div', null, json_str(rate)), _react2.default.createElement('br', null), _react2.default.createElement('div', null, json_str(ratings)), _react2.default.createElement('br', null), _react2.default.createElement('div', null, json_str(rule_ratings)), _react2.default.createElement('br', null), _react2.default.createElement('div', null, 'unblocking_rate_url: ', unblocking_rate_url)));} }]);return Rule_rating_view;}(_react2.default.PureComponent);var
        Country_list = function (_React$PureComponent5) {_inherits(Country_list, _React$PureComponent5);function Country_list() {_classCallCheck(this, Country_list);return _possibleConstructorReturn(this, (Country_list.__proto__ || Object.getPrototypeOf(Country_list)).apply(this, arguments));}_createClass(Country_list, [{ key: 'render', value: function render()
                {var _this7 = this;
                    var countries = _countries2.default.proxy_countries.bext.map(function (c) {
                        return _react2.default.createElement('option', { key: c, value: c, selected: c == _this7.props.country },
                        (0, _locale2.default)(c));
                    });
                    return _react2.default.createElement('select', { onChange: this.props.onChange }, countries);
                } }]);return Country_list;}(_react2.default.PureComponent);var


        Redirect_view = function (_React$PureComponent6) {_inherits(Redirect_view, _React$PureComponent6);function Redirect_view() {var _ref4;var _temp4, _this8, _ret4;_classCallCheck(this, Redirect_view);for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {args[_key4] = arguments[_key4];}return _ret4 = (_temp4 = (_this8 = _possibleConstructorReturn(this, (_ref4 = Redirect_view.__proto__ || Object.getPrototypeOf(Redirect_view)).call.apply(_ref4, [this].concat(args))), _this8), _this8.
                state = {}, _temp4), _possibleConstructorReturn(_this8, _ret4);}_createClass(Redirect_view, [{ key: 'componentDidMount', value: function componentDidMount()
                {
                    var _this = this;
                    (0, _etask2.default)([function () {
                        return _this.props.get_redirect_list();
                    }, function (list) {_this.setState({ list: list });}]);
                } }, { key: 'render', value: function render()
                {var
                    list = this.state.list;
                    if (!_util2.default.get(list, 'length'))
                    return _react2.default.createElement('span', null);
                    var s = { overflow: 'auto', wordWrap: 'normal', textAlign: 'left' };
                    return _react2.default.createElement('div', { style: s }, 'redirects: ', json_str(list));
                } }]);return Redirect_view;}(_react2.default.PureComponent);


        function json_str(o) {
            var s = JSON.stringify(o || '');
            return s.replace(/,/, ', ').replace(/"/g, '');
        }

        E.render_rule_rating = function (root) {
            _reactDom2.default.render(_react2.default.createElement(Rule_rating_view, { compact: true }), root);
        };

        E.render_redirect = function (root, opt) {
            opt = opt || {};
            _reactDom2.default.render(
            _react2.default.createElement(Redirect_view, { get_redirect_list: opt.get_redirect_list }), root);
        };

        E.render_debug_view = function () {
            var react_root = document.createElement('div');
            react_root.classList.add('react_root');
            document.body.appendChild(react_root);
            _reactDom2.default.render(_react2.default.createElement(Debug_view, null), react_root);
            E.inited_sp.finally(function () {
                _reactDom2.default.unmountComponentAtNode(react_root);
                document.body.removeChild(react_root);
            });
        };

        E.init = function (ui, libs) {return (0, _etask2.default)({ cancel: true }, regeneratorRuntime.mark(function _callee3() {return regeneratorRuntime.wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:
                                libs = libs || {};if (!
                                E.inited_sp) {_context3.next = 3;break;}return _context3.abrupt('return');case 3:

                                E.be_vpn = ui.be_vpn;
                                E.be_tabs = ui.be_tabs;
                                E.be_info = ui.be_info;
                                E.be_rule = ui.be_rule;
                                E.be_premium = ui.be_premium;
                                E.be_dev_mode = ui.be_dev_mode;
                                E.ui_popup = ui.ui_popup;
                                E.be_trial = ui.be_trial;
                                E.svc_util = libs.svc_util;
                                E.inited_sp = this;
                                E.inited_sp.finally(function () {return E.inited_sp = undefined;});_context3.next = 16;return (
                                    this.wait());case 16:case 'end':return _context3.stop();}}}, _callee3, this);}));};exports.default =


        E;});})();
//# sourceMappingURL=debug_ui.js.map
