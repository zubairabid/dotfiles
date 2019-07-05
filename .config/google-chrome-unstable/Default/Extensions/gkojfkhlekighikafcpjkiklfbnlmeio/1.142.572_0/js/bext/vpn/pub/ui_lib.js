// LICENSE_CODE ZON
;(function () {
    'use strict'; define(['exports', 'react', 'react-dom', 'classnames', '/util/url.js', '/util/util.js', '/util/zerr.js', '/util/date.js', '/bext/pub/locale.js', '/util/etask.js', '/bext/pub/browser.js', '/bext/vpn/pub/util.js', '/bext/pub/util.js', '/util/country.js', '/svc/vpn/pub/common_ui.js', '/util/storage.js', '/protocol/pub/countries.js', 'jquery', 'regenerator-runtime'], function (exports, _react, _reactDom, _classnames2, _url, _util, _zerr, _date, _locale, _etask2, _browser, _util3, _util5, _country, _common_ui, _storage, _countries, _jquery) {Object.defineProperty(exports, "__esModule", { value: true });var _react2 = _interopRequireDefault(_react);var _reactDom2 = _interopRequireDefault(_reactDom);var _classnames3 = _interopRequireDefault(_classnames2);var _url2 = _interopRequireDefault(_url);var _util2 = _interopRequireDefault(_util);var _zerr2 = _interopRequireDefault(_zerr);var _date2 = _interopRequireDefault(_date);var _locale2 = _interopRequireDefault(_locale);var _etask3 = _interopRequireDefault(_etask2);var _browser2 = _interopRequireDefault(_browser);var _util4 = _interopRequireDefault(_util3);var _util6 = _interopRequireDefault(_util5);var _country2 = _interopRequireDefault(_country);var _common_ui2 = _interopRequireDefault(_common_ui);var _storage2 = _interopRequireDefault(_storage);var _countries2 = _interopRequireDefault(_countries);var _jquery2 = _interopRequireDefault(_jquery);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}var _slicedToArray = function () {function sliceIterator(arr, i) {var _arr = [];var _n = true;var _d = false;var _e = undefined;try {for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"]) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}return function (arr, i) {if (Array.isArray(arr)) {return arr;} else if (Symbol.iterator in Object(arr)) {return sliceIterator(arr, i);} else {throw new TypeError("Invalid attempt to destructure non-iterable instance");}};}();function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}



















        var browser = _util6.default.browser();
        var E = {};
        var api = void 0;
        var plus_ref = _util4.default.plus_ref;

        function perr(opt) {
            var be_popup_lib = window.popup_main && window.popup_main.be_popup_lib;
            return be_popup_lib.perr_ok(opt);
        }
        function get_info(option_name, default_value) {
            return api.be_info && api.be_info.get(option_name) || default_value;}
        function is_mitm_site() {
            return api.be_vpn.get('mitm_ext_ui_enabled') && api.get('mitm_site');}
        var LONG_CB_MS = 500;
        var PureComponent = function (_React$PureComponent) {_inherits(PureComponent, _React$PureComponent);function PureComponent() {var _ref;var _temp, _this2, _ret;_classCallCheck(this, PureComponent);for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {args[_key] = arguments[_key];}return _ret = (_temp = (_this2 = _possibleConstructorReturn(this, (_ref = PureComponent.__proto__ || Object.getPrototypeOf(PureComponent)).call.apply(_ref, [this].concat(args))), _this2), _this2.
                timers = {}, _this2.
                events = {}, _temp), _possibleConstructorReturn(_this2, _ret);}_createClass(PureComponent, [{ key: 'componentWillUnmount', value: function componentWillUnmount()
                {var _this3 = this;
                    var t0 = Date.now();
                    var a = Object.keys(this.timers);
                    a.forEach(function (name) {return _this3.clear_timer(name);});
                    a = Object.keys(this.events);
                    a.forEach(function (event) {return _this3.off(event);});
                    if (this._componentWillUnmount)
                    this._componentWillUnmount();
                    var t1 = Date.now();
                    if (t1 - t0 > LONG_CB_MS)
                    {
                        _zerr2.default.warn('long cb componentWillUnmount %s took %sms',
                        this.displayName, t1 - t0);
                    }
                    if (this.sp)
                    {
                        this.sp.return();
                        delete this.sp;
                    }
                } }, { key: 'etask', value: function etask(
                task) {
                    this.sp = this.sp || (0, _etask3.default)('Component_' + this.displayName, regeneratorRuntime.mark(
                    function _pure_component_etask() {return regeneratorRuntime.wrap(function _pure_component_etask$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:_context.next = 2;return this.wait();case 2:case 'end':return _context.stop();}}}, _pure_component_etask, this);}));
                    this.sp.spawn(task);
                    return task;
                } }, { key: 'has_timer', value: function has_timer(

                name) {return !!this.timers[name];} }, { key: 'set_timer', value: function set_timer(
                name, cb, ms) {var _this4 = this;
                    this.clear_timer(name);
                    this.timers[name] = { cb: cb, ms: ms,
                        timer: setTimeout(function () {_this4.on_timer(name);}, ms) };
                } }, { key: 'clear_timer', value: function clear_timer(
                name) {
                    var t = this.timers[name];
                    if (!t)
                    return;
                    clearTimeout(t.timer);
                    delete this.timers[name];
                } }, { key: 'on_timer', value: function on_timer(
                name) {
                    var t = this.timers[name];
                    if (!t)
                    return (0, _zerr2.default)('timer not found %s', name);
                    try {
                        var t0 = Date.now();
                        t.cb();
                        var t1 = Date.now();
                        if (t1 - t0 > LONG_CB_MS)
                        {
                            _zerr2.default.warn('long cb timer %s:%s took %sms',
                            this.displayName, name, t1 - t0);
                        }
                    } catch (e) {(0, _zerr2.default)('timer %s error %s', name, e);}
                    this.clear_timer(name);
                } }, { key: 'on', value: function on(

                obj, event, cb) {
                    var _this = this;
                    this.off(obj, event, cb);
                    var e = this.events[event] = this.events[event] || { a: [] };
                    var cb2 = function cb2() {
                        var t0 = Date.now();
                        var ret = cb.apply(this, arguments);
                        var t1 = Date.now();
                        if (t1 - t0 > LONG_CB_MS)
                        {
                            _zerr2.default.warn('long cb event %s:%s took %sms', _this.displayName,
                            event, t1 - t0);
                        }
                        return ret;
                    };
                    e.a.push({ obj: obj, cb: cb, cb2: cb2 });
                    obj.on(event, cb2);
                } }, { key: 'off', value: function off(
                obj, event, cb) {var _this5 = this;
                    if (event === undefined && cb === undefined)
                    {
                        event = obj;
                        var _e = this.events[event];
                        if (!_e)
                        return;
                        var a = Object.assign([], _e.a);
                        return a.forEach(function (ee) {return _this5.off(ee.obj, event, ee.cb);});
                    }
                    if (event == undefined || cb === undefined)
                    throw new Error('invalid off params');
                    var e = this.events[event];
                    if (!e)
                    return;
                    var i = e.a.findIndex(function (ee) {return ee.cb === cb && ee.obj === obj;});
                    if (i == -1)
                    return;
                    var ee = e.a.splice(i, 1)[0];
                    ee.obj.off(event, ee.cb2);
                    if (!e.a.length)
                    delete this.events[event];
                } }]);return PureComponent;}(_react2.default.PureComponent);


        E.T = function (props) {
            if (typeof props == 'string')
            return (0, _locale2.default)(props);var
            children = props.children;
            if (typeof children == 'string')
            return (0, _locale2.default)(children.replace(/\s+/g, ' '));
            if (Array.isArray(children))
            {
                var obj = [],str = [];var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {
                    for (var _iterator = children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true)
                    {var v = _step.value;
                        if (typeof v == 'string')
                        str.push(v);else

                        {
                            obj.push(v);
                            str.push('$' + obj.length);
                        }
                    }} catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator.return) {_iterator.return();}} finally {if (_didIteratorError) {throw _iteratorError;}}}
                var translated = (0, _locale2.default)(str.join('')).split(/(\$\d+)/);
                return translated.map(function (v) {
                    var m = v.match(/\$(\d+)/);
                    return m ? obj[m[1] - 1] : v;
                });
            }
            console.error('<T> must receive text to translate. Received: ', children);
            return null;
        };

        E.set_api = function (_api) {E.api = api = _api;};

        function IF(s) {return s || undefined;}

        function Tooltip(props) {var _props$position =
            props.position,position = _props$position === undefined ? 'top' : _props$position,icon_cls = props.icon_cls,icon_div_cls = props.icon_div_cls;
            var classes = ['popup-tooltip', 'popup-tooltip-' + position];
            return _react2.default.createElement('div', { className: (0, _classnames3.default)(classes) },
            _react2.default.createElement('div', { className: 'header' },
            _react2.default.createElement('div', { className: icon_div_cls || 'f32' },
            _react2.default.createElement('i', { className: icon_cls })),

            _react2.default.createElement('h2', null, props.title)),

            _react2.default.createElement('div', { className: 'body' },
            props.children));


        }

        function Free_tooltip(props) {
            var opt = { position: 'bottom', title: 'Upgrade now!', key: 'tooltip',
                icon_cls: 'icon' };
            return _react2.default.createElement(Tooltip, _extends({}, opt, props),
            _react2.default.createElement('p', null, 'Faster servers. Unblock any site. Online protection.'));

        }var

        Upgrade_link = function (_PureComponent) {_inherits(Upgrade_link, _PureComponent);function Upgrade_link() {var _ref2;var _temp2, _this6, _ret2;_classCallCheck(this, Upgrade_link);for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {args[_key2] = arguments[_key2];}return _ret2 = (_temp2 = (_this6 = _possibleConstructorReturn(this, (_ref2 = Upgrade_link.__proto__ || Object.getPrototypeOf(Upgrade_link)).call.apply(_ref2, [this].concat(args))), _this6), _this6.
                state = {}, _this6.







                on_change = function () {
                    var o = _this6.props.user_status;
                    var is_member = o.get('is_member');
                    var is_pending = o.get('is_pending');
                    var is_paid = o.get('is_paid');
                    _this6.setState({ is_member: is_member, is_pending: is_pending, is_paid: is_paid });
                }, _this6.
                onClick = function () {return api.ui_popup.open_page(
                    plus_ref('ext_upgrade2', { root_url: _this6.props.root_url }));}, _temp2), _possibleConstructorReturn(_this6, _ret2);}_createClass(Upgrade_link, [{ key: 'componentDidMount', value: function componentDidMount() {
                    this.on(this.props.user_status, 'change', this.on_change);this.on_change();} }, { key: 'render', value: function render() {var _state = this.state,is_paid = _state.is_paid,is_pending = _state.is_pending,is_member = _state.is_member;if (is_member || is_pending || is_member && is_paid)
                    return _react2.default.createElement('div', null);
                    var c = is_paid ? 'renew' : 'upgrade';
                    var s = is_paid ? (0, _locale2.default)('Renew') : (0, _locale2.default)('Upgrade');
                    return _react2.default.createElement('div', { className: 'upgrade-link' },
                    _react2.default.createElement('a', { className: c, onClick: this.onClick }, s));

                } }]);return Upgrade_link;}(PureComponent);var


        Footer_item = function (_PureComponent2) {_inherits(Footer_item, _PureComponent2);function Footer_item() {var _ref3;var _temp3, _this7, _ret3;_classCallCheck(this, Footer_item);for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {args[_key3] = arguments[_key3];}return _ret3 = (_temp3 = (_this7 = _possibleConstructorReturn(this, (_ref3 = Footer_item.__proto__ || Object.getPrototypeOf(Footer_item)).call.apply(_ref3, [this].concat(args))), _this7), _this7.











                onClick = function (e) {var
                    class_a = _this7.props.class_a;
                    perr({ id: 'be_ui_vpn_click_ext_promo', type: class_a });
                    return true;
                }, _temp3), _possibleConstructorReturn(_this7, _ret3);}_createClass(Footer_item, [{ key: 'render', value: function render() {var _props = this.props,href = _props.href,class_a = _props.class_a,str_h2 = _props.str_h2,str_p = _props.str_p,str_msg = _props.str_msg;return _react2.default.createElement('a', { href: href, className: class_a, target: '_blank', rel: 'noopener noreferrer' }, _react2.default.createElement('div', { className: 'wrapper' }, str_msg, _react2.default.createElement('i', { className: 'icon' })), _react2.default.createElement(Tooltip, { title: str_h2 }, _react2.default.createElement('p', null, str_p)));} }]);return Footer_item;}(PureComponent);var


        Footer = function (_PureComponent3) {_inherits(Footer, _PureComponent3);function Footer() {var _ref4;var _temp4, _this8, _ret4;_classCallCheck(this, Footer);for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {args[_key4] = arguments[_key4];}return _ret4 = (_temp4 = (_this8 = _possibleConstructorReturn(this, (_ref4 = Footer.__proto__ || Object.getPrototypeOf(Footer)).call.apply(_ref4, [this].concat(args))), _this8), _this8.
                state = {}, _temp4), _possibleConstructorReturn(_this8, _ret4);}_createClass(Footer, [{ key: 'componentDidMount', value: function componentDidMount()
                {
                    var _this = this;var _api2 =
                    api,be_premium = _api2.be_premium;
                    return (0, _etask3.default)([function () {
                        return be_premium ? be_premium.ecall('is_active') : null;
                    }, function (is_premium) {_this.setState({ is_premium: is_premium });
                    }]);
                } }, { key: 'render', value: function render()
                {var
                    is_premium = this.state.is_premium;
                    var need_exe = _util6.default.os_mac() ? 'mac' : 'win';
                    var s = ['more-from-hola', is_premium && 'more-from-hola-premium'];
                    return _react2.default.createElement('div', { className: (0, _classnames3.default)(s) },
                    _react2.default.createElement('div', { className: 'more-from-hola-items' },
                    _react2.default.createElement(Footer_item, { href: 'https://play.google.com/store/apps/details?id=org.hola&referrer=utm_source%3Dholaext', class_a: 'more-android',
                        str_h2: 'Hola VPN on Android', str_p: 'Unblock any website or app' }),
                    _react2.default.createElement(Footer_item, { href: 'https://itunes.apple.com/il/app/hola-privacy-vpn/id903869356?mt=8', class_a: 'more-ios', str_h2: 'Hola VPN on iOS',
                        str_p: 'Unblock any website or app' }),
                    IF(need_exe == 'win') &&
                    _react2.default.createElement(Footer_item, { href: 'https://hola.org/downloads', class_a: 'more-win',
                        str_h2: 'Hola VPN on Windows',
                        str_p: 'Unblock any website or app' }),
                    IF(need_exe == 'mac') &&
                    _react2.default.createElement(Footer_item, { href: 'https://hola.org/downloads', class_a: 'more-mac',
                        str_h2: 'Hola VPN on macOS', str_p: 'Unblock any website or app' }),
                    IF(is_premium) &&
                    _react2.default.createElement(Footer_item, { href: 'http://hola.org/accelerator?utm_source=holaext',
                        class_a: 'more-va', str_h2: 'Accelerator',
                        str_p: 'Stream videos faster' }),
                    IF(is_premium) &&
                    _react2.default.createElement(Footer_item, { href: 'https://hola.org/adblocker?utm_source=holaext',
                        class_a: 'more-ab', str_h2: 'Ad remover',
                        str_p: 'Block annoying ads, malware and tracking' }),
                    IF(!is_premium) &&
                    _react2.default.createElement(Footer_item, { href: plus_ref('ext_more_by_hola',
                        { root_url: this.props.root_url }),
                        class_a: 'more-premium', str_h2: 'Hola VPN PLUS',
                        str_p: 'Try out Hola VPN PLUS', str_msg: 'Upgrade to' })));


                } }]);return Footer;}(PureComponent);var


        Main_switch = function (_PureComponent4) {_inherits(Main_switch, _PureComponent4);function Main_switch() {var _ref5;var _temp5, _this9, _ret5;_classCallCheck(this, Main_switch);for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {args[_key5] = arguments[_key5];}return _ret5 = (_temp5 = (_this9 = _possibleConstructorReturn(this, (_ref5 = Main_switch.__proto__ || Object.getPrototypeOf(Main_switch)).call.apply(_ref5, [this].concat(args))), _this9), _this9.
                state = {}, _this9.



























































































                onMouseLeave = function (e) {return _this9.setState({ inside: false });}, _this9.
                onClick = function (e) {
                    var value = !_this9.props.value;
                    _this9.setState({ inside: true });
                    if (_this9.props.onClick)
                    {
                        _this9.props.onClick.call(_this9, { type: 'hola', event: e, value: value,
                            ref: _this9 });
                    }
                }, _temp5), _possibleConstructorReturn(_this9, _ret5);}_createClass(Main_switch, [{ key: 'componentDidMount', value: function componentDidMount() {this.setState({ value: !!this.props.value });} }, { key: 'render_tooltip', value: function render_tooltip(_ref6) {var is_protect = _ref6.is_protect;var _props2 = this.props,root_url = _props2.root_url,value = _props2.value,is_mitm = _props2.is_mitm,is_protect_pc = _props2.is_protect_pc,is_protect_browser = _props2.is_protect_browser;var country = _country2.default.code2label(this.props.country || '');var src_country = _country2.default.code2label(this.props.src_country || '');var flag_country = !is_mitm && !is_protect;var tooltip_opts = { position: 'bottom', icon_div_cls: flag_country ? 'fsvg_4x3' : 'f32', icon_cls: (0, _classnames3.default)('flag', this.props.country, { 'flag-country': flag_country, 'flag-unblock': is_mitm, 'flag-protect': is_protect }) };if (is_protect) {if (is_protect_pc) {return _react2.default.createElement(Tooltip, _extends({}, tooltip_opts, { title: _react2.default.createElement('span', null, 'All your PC traffic is secured') }), _react2.default.createElement('p', null, 'Click to stop protecting your PC traffic'));}if (is_protect_browser) {return _react2.default.createElement(Tooltip, _extends({}, tooltip_opts, { title: _react2.default.createElement('span', null, 'All your browser traffic is secured') }), _react2.default.createElement('p', null, 'Click to stop protecting your browser traffic'));}if (value) {return _react2.default.createElement(Tooltip, _extends({}, tooltip_opts, { title: _react2.default.createElement('span', null, 'Your connection with ', _react2.default.createElement('b', null, root_url), ' is secured') }), _react2.default.createElement('p', null, 'Click to stop protecting your connection with ', _react2.default.createElement('b', null, root_url)));}return _react2.default.createElement(Tooltip, _extends({}, tooltip_opts, { title: _react2.default.createElement('span', null, 'Secure your connection') }), _react2.default.createElement('p', null, 'Click to encrypt and protect all your traffic with ', _react2.default.createElement('b', null, root_url)));}if (is_mitm) {if (value) {return _react2.default.createElement(Tooltip, _extends({}, tooltip_opts, { title: _react2.default.createElement('span', null, _react2.default.createElement('b', null, root_url), ' is unblocked') }), _react2.default.createElement('p', null, 'Click to stop VPN and stop unblocking ', ' ', _react2.default.createElement('b', null, root_url)));}return _react2.default.createElement(Tooltip, _extends({}, tooltip_opts, { title: _react2.default.createElement('span', null, _react2.default.createElement('b', null, root_url), ' is blocked by your country') }), _react2.default.createElement('p', null, 'Click to start VPN for ', _react2.default.createElement('b', null, root_url), ' and unblock it'));}if (value) {return _react2.default.createElement(Tooltip, _extends({}, tooltip_opts, { title: _react2.default.createElement('span', null, _react2.default.createElement('b', null, root_url), ' country is ', country) }), _react2.default.createElement('p', null, 'Click to stop VPN for ', _react2.default.createElement('b', null, root_url), ' and change country back to ', src_country));}return _react2.default.createElement(Tooltip, _extends({}, tooltip_opts, { title: _react2.default.createElement('span', null, 'Change country to ', country) }), _react2.default.createElement('p', null, 'Click to start VPN for ', _react2.default.createElement('b', null, root_url), ' and change country to ', country));} }, { key: 'render', value: function render() {var _classnames;var inside = this.state.inside;var _props3 = this.props,_props3$type = _props3.type,type = _props3$type === undefined ? 'unblock' : _props3$type,tooltip = _props3.tooltip,value = _props3.value;var s = (0, _classnames3.default)((_classnames = {}, _defineProperty(_classnames, type + '-switch', 1), _defineProperty(_classnames, 'active', value), _defineProperty(_classnames, 'inside', inside), _classnames));var is_protect = type == 'protect';return _react2.default.createElement('div', { className: 'main-switch' }, _react2.default.createElement('div', { className: s, onClick: this.onClick, onMouseEnter: this.onMouseEnter, onMouseLeave: this.onMouseLeave }, is_protect ? (0, _locale2.default)('Protect') : (0, _locale2.default)('Unblock')), !!tooltip && this.render_tooltip({ is_protect: is_protect }));} }]);return Main_switch;}(PureComponent);


        E.format_time = function (ms) {
            var pad = function pad(num) {return ('000' + num).slice(-2);};
            var sec = Math.floor(ms / 1000);
            var hours = Math.floor(sec / (60 * 60));
            sec -= hours * 60 * 60;
            var mins = Math.floor(sec / 60);
            sec -= mins * 60;
            return (hours ? pad(hours) + 'h ' : '') + pad(mins) + 'm ' + pad(sec) + 's';
        };var

        Trial_timer = function (_PureComponent5) {_inherits(Trial_timer, _PureComponent5);
            function Trial_timer(props) {_classCallCheck(this, Trial_timer);var _this10 = _possibleConstructorReturn(this, (Trial_timer.__proto__ || Object.getPrototypeOf(Trial_timer)).call(this,
                props));_this10.











                timer_tick = function () {
                    var trial_left = _this10.get_trial_left();
                    _this10.setState({ trial_left: trial_left });
                    _this10.timer = trial_left > 0 ? setTimeout(_this10.timer_tick, _date2.default.ms.SEC) :
                    null;
                };_this10.state = { trial_left: _this10.get_trial_left() };_this10.timer_tick();return _this10;}_createClass(Trial_timer, [{ key: 'componentWillUnmount', value: function componentWillUnmount() {if (this.timer) this.timer = clearTimeout(this.timer);} }, { key: 'get_trial_left', value: function get_trial_left() {var trial = this.props.trial;return trial ? Math.max(trial.expire_ts - Date.now(), 0) : 0;} }, { key: 'render', value: function render()
                {var
                    state = this.state,props = this.props;
                    if (!state.trial_left)
                    return null;
                    var ref = 'trial_timer_' + props.root_url.replace(/\./g, '_');
                    return [
                    _react2.default.createElement('a', { className: 'trial-timer', target: '_blank', rel: 'noopener noreferrer',
                        href: plus_ref(ref, { root_url: props.root_url }), key: 'timer' },
                    E.format_time(state.trial_left)),

                    _react2.default.createElement(Tooltip, { position: 'bottom', title: 'Upgrade to PLUS!',
                        key: 'tooltip' },
                    _react2.default.createElement('p', null, 'Get unlimited unblocking time for ', props.root_url, '.'))];


                } }]);return Trial_timer;}(PureComponent);var


        Popular_view_item = function (_React$PureComponent2) {_inherits(Popular_view_item, _React$PureComponent2);function Popular_view_item() {var _ref7;var _temp6, _this11, _ret6;_classCallCheck(this, Popular_view_item);for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {args[_key6] = arguments[_key6];}return _ret6 = (_temp6 = (_this11 = _possibleConstructorReturn(this, (_ref7 = Popular_view_item.__proto__ || Object.getPrototypeOf(Popular_view_item)).call.apply(_ref7, [this].concat(args))), _this11), _this11.
                state = { img_show: false }, _this11.
                on_load = function () {return _this11.setState({ img_show: true, img_error: false });}, _this11.
                on_error = function () {return _this11.setState({ img_error: true });}, _this11.
                on_click = function () {
                    var p = _this11.props;
                    var is_mac = _browser2.default.os == 'macos';
                    if (!is_mac || !api.is_popular_page())
                    return api.set_active_url(p.root_url);
                    api.perr_event('popular_unblock_attempt', {
                        info: { unblock_attempt_url: p.root_url } });

                    return _browser2.default.tabs.create({ url: api.get_popular_url(), active: true });
                }, _temp6), _possibleConstructorReturn(_this11, _ret6);}_createClass(Popular_view_item, [{ key: 'render', value: function render()
                {
                    var p = this.props;var
                    state = this.state;
                    var cls = (0, _classnames3.default)('popup-popular-item',
                    p.is_ps ? 'premium-site' : 'free-site');
                    var cls_i = (0, _classnames3.default)('popup-popular-item-image',
                    'icon-' + p.root_url.replace(/\./g, '-'),
                    { 'icon-error': state.img_error });
                    return _react2.default.createElement('div', { title: p.root_url, className: cls, onClick: this.on_click },
                    _react2.default.createElement('i', { className: cls_i },
                    _react2.default.createElement('img', { className: 'popup-popular-item-icon',
                        style: { display: !state.img_show && 'none' },
                        onLoad: this.on_load, onError: this.on_error,
                        src: _url2.default.add_proto(p.root_url) + '/favicon.ico' })),

                    _react2.default.createElement('span', { className: 'popup-popular-item-name' }, p.root_url));

                } }]);return Popular_view_item;}(_react2.default.PureComponent);var


        Popular_view = function (_PureComponent6) {_inherits(Popular_view, _PureComponent6);function Popular_view() {var _ref8;var _temp7, _this12, _ret7;_classCallCheck(this, Popular_view);for (var _len7 = arguments.length, args = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {args[_key7] = arguments[_key7];}return _ret7 = (_temp7 = (_this12 = _possibleConstructorReturn(this, (_ref8 = Popular_view.__proto__ || Object.getPrototypeOf(Popular_view)).call.apply(_ref8, [this].concat(args))), _this12), _this12.
                state = { list: [], top_urls: [] }, _this12.






                update_list = function () {
                    var _this = _this12;
                    (0, _etask3.default)(regeneratorRuntime.mark(function _callee() {var list, root_urls, list_ps;return regeneratorRuntime.wrap(function _callee$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:
                                        list = api.get('unblocking_rate') || [];
                                        root_urls = list.map(function (p) {return p.root_url;});_context2.next = 4;return (
                                            api.be_premium.ecall('get_force_premium_rules',
                                            [root_urls, { ignore_install_version: true }]));case 4:list_ps = _context2.sent;
                                        list = list.map(function (p, i) {
                                            var site_conf = _util6.default.get_site_conf(api.be_ext, p.root_url);
                                            return _extends({}, p, {
                                                is_ps: _util2.default.get(site_conf, 'require_plus') || list_ps[i] });
                                        });
                                        _this.setState({ list: list, top_urls: root_urls });case 7:case 'end':return _context2.stop();}}}, _callee, this);}));

                }, _this12.
                on_focus = function () {
                    perr({ id: 'be_ui_popular_input_focus', info: {
                            root_url: api.get_root(), url: api.get_url() } });
                }, _this12.
                on_redirect = function (search) {return (0, _etask3.default)(regeneratorRuntime.mark(function _callee2() {return regeneratorRuntime.wrap(function _callee2$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:
                                        perr({ id: 'be_ui_popular_click_go', info: {
                                                root_url: api.get_root(), url: api.get_url(), search: search } });_context3.next = 3;return (
                                            api.be_tabs.ecall('set_force_suggestion',
                                            [api.get_tab_id(), true]));case 3:
                                        _browser2.default.tabs.update(api.get_tab_id(), { url: search, active: true });
                                        api.ui_popup.close_popup();case 5:case 'end':return _context3.stop();}}}, _callee2, this);}));}, _temp7), _possibleConstructorReturn(_this12, _ret7);}_createClass(Popular_view, [{ key: 'componentDidMount', value: function componentDidMount() {this.on(api, 'change:unblocking_rate', this.update_list);this.update_list();perr({ id: 'be_ui_popular_view', info: { root_url: api.get_root(), url: api.get_url() } });} }, { key: 'render', value: function render()

                {var _state2 =
                    this.state,list = _state2.list,top_urls = _state2.top_urls;
                    return _react2.default.createElement('div', { className: 'popular-view' },
                    _react2.default.createElement(_common_ui2.default.Search_field, { on_focus: this.on_focus,
                        on_redirect: this.on_redirect, top_urls: top_urls }),
                    _react2.default.createElement('div', { className: 'popup-popular-list' },
                    list.map(function (p) {return _react2.default.createElement(Popular_view_item, _extends({ key: p.root_url }, p));})),

                    _react2.default.createElement('div', { className: 'popular-view-footer' },
                    _react2.default.createElement('a', { href: api.get_popular_url(), target: '_blank',
                        rel: 'noopener noreferrer' }, 'More sites in your country...')));




                } }]);return Popular_view;}(PureComponent);var


        Stub_unblock = function (_PureComponent7) {_inherits(Stub_unblock, _PureComponent7);function Stub_unblock() {_classCallCheck(this, Stub_unblock);return _possibleConstructorReturn(this, (Stub_unblock.__proto__ || Object.getPrototypeOf(Stub_unblock)).apply(this, arguments));}_createClass(Stub_unblock, [{ key: 'render', value: function render()
                {var
                    root_url = this.props.root_url;
                    if (api.be_ext.get('is_premium') || !_util6.default.is_google(root_url))
                    return null;
                    var link = plus_ref('stub_unblock', { root_url: root_url });
                    return _react2.default.createElement('div', { className: 'stub-unblock' }, 'To change IP for ',
                    _react2.default.createElement('b', null, root_url), ', upgrade to ',
                    _react2.default.createElement('a', { rel: 'noopener noreferrer', target: '_blank', href: link }, 'PLUS'));

                } }]);return Stub_unblock;}(PureComponent);var

        Enable_view = function (_PureComponent8) {_inherits(Enable_view, _PureComponent8);function Enable_view() {var _ref9;var _temp8, _this14, _ret8;_classCallCheck(this, Enable_view);for (var _len8 = arguments.length, args = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {args[_key8] = arguments[_key8];}return _ret8 = (_temp8 = (_this14 = _possibleConstructorReturn(this, (_ref9 = Enable_view.__proto__ || Object.getPrototypeOf(Enable_view)).call.apply(_ref9, [this].concat(args))), _this14), _this14.
                state = { bottom_component: 'buttons', needs_plus: false }, _this14.
                rate_us_urls = {
                    chrome: 'https://chrome.google.com/webstore/detail' +
                    '/hola-better-internet/gkojfkhlekighikafcpjkiklfbnlmeio/reviews',
                    opera: 'https://addons.opera.com/en/extensions/details' +
                    '/hola-better-internet/#feedback-container',
                    firefox: 'https://addons.mozilla.org/ru/firefox/addon/hola-unblocker/' }, _this14.

                on_stars_click = function (num) {
                    perr({ id: 'be_vpn_rating_rate', rate: num });
                    api.be_info.ecall('set_vpn_last_rating', [num]);
                    _this14.setState({ bottom_component: 'rated' });
                }, _this14.
                click_yes = function (event) {
                    var vpn_work_yes = get_info('vpn_work_yes', 0);
                    if (api.be_info)
                    api.be_info.ecall('increment_vpn_work_yes', []);
                    var rating = get_info('vpn_last_rating', 0);
                    var show_rating = rating < 5 && vpn_work_yes % 4 == 0;
                    _this14.setState({ bottom_component: show_rating ? 'rating' : 'rated' });
                    _this14.props.click_yes && _this14.props.click_yes();
                }, _this14.
                disable_react_ui = function () {
                    var conf = _storage2.default.get_json('hola_conf') || {};
                    _util2.default.set(conf, 'react.enabled_ui', false);
                    _storage2.default.set_json('hola_conf', conf);
                    api.be_vpn.force_bext_config_update();
                    if (api.ui_popup)
                    api.ui_popup.close_popup();
                }, _this14.
                render_rated = function () {
                    var rating = get_info('vpn_last_rating', 0);
                    if (rating == 5 && !get_info('rate_on_store'))
                    {
                        api.be_info.ecall('set_rate_on_store', [Date.now()]);
                        api.be_util.open_new_tab({ url: _this14.rate_us_urls[browser] });
                        return null;
                    }
                    var show_link = rating == 5 && browser == 'chrome';
                    return _react2.default.createElement(Vpn_rated, { link: show_link && _this14.rate_us_urls.chrome,
                        show_premium: !api.be_ext.get('is_premium') });
                }, _this14.
                render_bottom = function () {var _this15 = _this14,
                    props = _this15.props;
                    switch (_this14.state.bottom_component) {

                        case 'buttons':
                            return _react2.default.createElement(Vpn_work_buttons, { report_action: props.report_action,
                                country: props.country,
                                click_no: props.click_no, click_yes: _this14.click_yes });
                        case 'awesome':return _react2.default.createElement(Vpn_awesome_button, null);
                        case 'rating':return _react2.default.createElement(Vpn_rating, { on_rate: _this14.on_stars_click });
                        case 'rated':return _this14.render_rated();
                        default:_zerr2.default.notice('unexpected bottom buttons state :' +
                            _this14.state.bottom_component);}

                }, _this14.
                click_on_protect = function (e) {
                    api.loader.enable(true);
                    if (!api.be_ext.get('is_premium'))
                    return _this14.setState({ needs_plus: true });
                    var host = api.get_host();
                    api.protect_ui.set_enabled(e.value, host, [host], false);
                }, _this14.
                toggle_on_protect = function (state, yes) {
                    _this14.setState({ needs_plus: state });
                    if (yes)
                    {
                        _util6.default.open_tab({ url: plus_ref('ext_protect',
                            { root_url: api.get_root() }), force_new: true });
                    }
                }, _temp8), _possibleConstructorReturn(_this14, _ret8);}_createClass(Enable_view, [{ key: 'render', value: function render()
                {var
                    props = this.props;
                    var is_debug = api.be_dev_mode && api.be_dev_mode.get('dev_mode');
                    return _react2.default.createElement('div', null,
                    _react2.default.createElement(Vpn_modal_view, { show: this.state.needs_plus, signin: 'modal_get_plus',
                        message: 'Upgrade to <b>PLUS</b> for online security',
                        text_yes: 'Get PLUS', on_toggle: this.toggle_on_protect }),
                    _react2.default.createElement('div', { className: 'unblock-protect-view' },
                    _react2.default.createElement('div', null,
                    _react2.default.createElement(Main_switch, { root_url: props.root_url,
                        tooltip: props.tooltip, onClick: props.on_unblock,
                        value: props.is_unblock, country: props.country,
                        src_country: props.src_country, is_mitm: props.is_mitm })),

                    _react2.default.createElement('div', null,
                    _react2.default.createElement(Main_switch, { root_url: props.root_url, tooltip: props.tooltip,
                        onClick: this.click_on_protect, value: props.is_protect,
                        type: 'protect', is_protect_pc: props.is_protect_pc,
                        is_protect_browser: props.is_protect_browser }))),


                    _react2.default.createElement(Vpn_title_view, {
                        before: props.is_mitm ? 'unblocked!' : 'country is:' }),
                    _react2.default.createElement(Vpn_country_selected_view, { country: props.selected_country,
                        on_country_select: props.on_country_select,
                        is_mitm: props.is_mitm, is_protect: props.is_protect }),
                    is_debug &&
                    _react2.default.createElement('a', { onClick: this.disable_react_ui }, 'Disable react view'),
                    _react2.default.createElement('div', { className: 'popup-more' }, this.render_bottom()));

                } }]);return Enable_view;}(PureComponent);var


        Vpn_rating = function (_React$PureComponent3) {_inherits(Vpn_rating, _React$PureComponent3);function Vpn_rating() {_classCallCheck(this, Vpn_rating);return _possibleConstructorReturn(this, (Vpn_rating.__proto__ || Object.getPrototypeOf(Vpn_rating)).apply(this, arguments));}_createClass(Vpn_rating, [{ key: 'render', value: function render()
                {var
                    props = this.props;
                    perr({ id: 'be_vpn_rating_display' });
                    return _react2.default.createElement('div', { className: 'popup-rating' },
                    _react2.default.createElement('h3', { className: 'popup-rating-title popup-more-title' },
                    (0, _locale2.default)('Rate us')),
                    _react2.default.createElement('div', { className: 'popup-rating-msg' }, (0, _locale2.default)('Thank you!')),
                    _react2.default.createElement('div', { className: 'popup-rating-container' },
                    _react2.default.createElement('span', { onClick: function onClick() {return props.on_rate(1);} }),
                    _react2.default.createElement('span', { onClick: function onClick() {return props.on_rate(2);} }),
                    _react2.default.createElement('span', { onClick: function onClick() {return props.on_rate(3);} }),
                    _react2.default.createElement('span', { onClick: function onClick() {return props.on_rate(4);} }),
                    _react2.default.createElement('span', { onClick: function onClick() {return props.on_rate(5);} })));


                } }]);return Vpn_rating;}(_react2.default.PureComponent);var


        Vpn_awesome_button = function (_React$PureComponent4) {_inherits(Vpn_awesome_button, _React$PureComponent4);function Vpn_awesome_button() {var _ref10;var _temp9, _this17, _ret9;_classCallCheck(this, Vpn_awesome_button);for (var _len9 = arguments.length, args = Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {args[_key9] = arguments[_key9];}return _ret9 = (_temp9 = (_this17 = _possibleConstructorReturn(this, (_ref10 = Vpn_awesome_button.__proto__ || Object.getPrototypeOf(Vpn_awesome_button)).call.apply(_ref10, [this].concat(args))), _this17), _this17.











                click_yes = function (event) {
                    event.stopPropagation();
                    if (_this17.props.click_yes)
                    _this17.props.click_yes(event);
                }, _temp9), _possibleConstructorReturn(_this17, _ret9);}_createClass(Vpn_awesome_button, [{ key: 'render', value: function render() {return _react2.default.createElement('div', { className: 'popup-more-row' }, _react2.default.createElement('h3', { className: 'popup-more-title' }, _react2.default.createElement('span', { className: 'popup-more-title-text' })), _react2.default.createElement('button', { onClick: this.click_yes, className: 'popup-button popup-button-yes popup-button-response' }, (0, _locale2.default)('Awesome!')));} }]);return Vpn_awesome_button;}(_react2.default.PureComponent);var


        Vpn_rated = function (_React$PureComponent5) {_inherits(Vpn_rated, _React$PureComponent5);function Vpn_rated() {var _ref11;var _temp10, _this18, _ret10;_classCallCheck(this, Vpn_rated);for (var _len10 = arguments.length, args = Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {args[_key10] = arguments[_key10];}return _ret10 = (_temp10 = (_this18 = _possibleConstructorReturn(this, (_ref11 = Vpn_rated.__proto__ || Object.getPrototypeOf(Vpn_rated)).call.apply(_ref11, [this].concat(args))), _this18), _this18.
                on_try_premium = function () {
                    var ref = _this18.rating == 5 ? 'ext_working' : 'ext_not_working';
                    perr({ id: 'be_try_plus_' + ref,
                        info: { root_url: api.get_root(), country: api.get('country') } });
                    api.ui_popup.open_page(plus_ref(ref, { root_url: api.get_root() }));
                }, _this18.
                on_rate_us = function () {perr({ id: 'be_rate_webstore_click' });}, _temp10), _possibleConstructorReturn(_this18, _ret10);}_createClass(Vpn_rated, [{ key: 'render', value: function render()
                {var
                    props = this.props;
                    return _react2.default.createElement('div', { className: 'popup-rated-view' },
                    props.link && _react2.default.createElement('a', { target: '_blank', rel: 'noopener noreferrer',
                        href: props.link, onClick: this.on_rate_us, className: 'rate-us' },
                    (0, _locale2.default)('Rate us in webstore')),
                    props.show_premium && _react2.default.createElement('button', { onClick: this.on_try_premium,
                        className: 'popup-button popup-button-try' },
                    (0, _locale2.default)('Try Hola VPN PLUS')));

                } }]);return Vpn_rated;}(_react2.default.PureComponent);var

        Vpn_work_buttons = function (_React$PureComponent6) {_inherits(Vpn_work_buttons, _React$PureComponent6);function Vpn_work_buttons() {var _ref12;var _temp11, _this19, _ret11;_classCallCheck(this, Vpn_work_buttons);for (var _len11 = arguments.length, args = Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {args[_key11] = arguments[_key11];}return _ret11 = (_temp11 = (_this19 = _possibleConstructorReturn(this, (_ref12 = Vpn_work_buttons.__proto__ || Object.getPrototypeOf(Vpn_work_buttons)).call.apply(_ref12, [this].concat(args))), _this19), _this19.
                state = {
                    click_no_count: {} }, _this19.

                click_yes = function (event) {
                    event.stopPropagation();
                    if (_this19.props.click_yes)
                    _this19.props.click_yes(event);
                    _this19.reset_no_count();
                }, _this19.
                click_no = function (event) {
                    var count = _this19.state.click_no_count[api.get_tab_id()];
                    if (_this19.props.click_no)
                    _this19.props.click_no(event, count);
                    _this19.setState({
                        click_no_count: _this19.update_click_no_count(1),
                        show_report_link: true });

                }, _temp11), _possibleConstructorReturn(_this19, _ret11);}_createClass(Vpn_work_buttons, [{ key: 'update_click_no_count', value: function update_click_no_count(
                is_increase) {
                    var count = this.state.click_no_count;
                    var tab_id = api.get_tab_id();
                    count[tab_id] = is_increase ? (count[tab_id] || 0) + 1 : 0;
                    return count;
                } }, { key: 'is_show_report_link', value: function is_show_report_link()
                {
                    return api.be_ext.get('enable_unsupported') &&
                    this.state.click_no_count[api.get_tab_id()] >= 1;
                } }, { key: 'reset_no_count', value: function reset_no_count()
                {
                    this.setState({ click_no_count: this.update_click_no_count() });
                } }, { key: 'render', value: function render()
                {var
                    props = this.props;
                    var show_report_link = this.is_show_report_link();
                    return _react2.default.createElement('div', { className: 'popup-more' },
                    _react2.default.createElement('h3', { className: 'popup-more-title' },
                    _react2.default.createElement('span', { className: 'popup-more-title-text' }, (0, _locale2.default)('Did it work?')),
                    show_report_link && _react2.default.createElement('button', { className: 'popup-more-report',
                        onClick: props.report_action }, (0, _locale2.default)('Report a problem'))),


                    _react2.default.createElement('div', { className: 'popup-more-row' },
                    _react2.default.createElement('button', { className: 'popup-button popup-button-yes',
                        onClick: this.click_yes }, (0, _locale2.default)('Oh, yes!')),
                    _react2.default.createElement('button', { className: 'popup-button popup-button-no',
                        onClick: this.click_no }, (0, _locale2.default)('No, fix it'))));


                } }]);return Vpn_work_buttons;}(_react2.default.PureComponent);var


        Vpn_title_view = function (_React$PureComponent7) {_inherits(Vpn_title_view, _React$PureComponent7);function Vpn_title_view() {_classCallCheck(this, Vpn_title_view);return _possibleConstructorReturn(this, (Vpn_title_view.__proto__ || Object.getPrototypeOf(Vpn_title_view)).apply(this, arguments));}_createClass(Vpn_title_view, [{ key: 'render', value: function render()
                {var _props4 =
                    this.props,after = _props4.after,sub_title = _props4.sub_title,before = _props4.before;
                    return _react2.default.createElement('div', { className: 'popup-hover-title flex' },
                    _react2.default.createElement('div', { className: 'popup-enabled-title' },
                    _react2.default.createElement('h2', { className: 'popup-title' },
                    _react2.default.createElement('span', { className: 'popup-title-container' },
                    _react2.default.createElement('span', { className: 'popup-title-text' },
                    after && _react2.default.createElement('span', { className: 'sp_after' }, (0, _locale2.default)(after)),
                    _react2.default.createElement('span', { className: 'ellipsis' }, api.get_root()),
                    before && _react2.default.createElement('span', { className: 'sp_before' }, (0, _locale2.default)(before))),

                    sub_title &&
                    _react2.default.createElement('span', { className: 'popup-title-subview' }, (0, _locale2.default)(sub_title))))));




                } }]);return Vpn_title_view;}(_react2.default.PureComponent);var


        Vpn_country_selected_view = function (_React$PureComponent8) {_inherits(Vpn_country_selected_view, _React$PureComponent8);function Vpn_country_selected_view() {var _ref13;var _temp12, _this21, _ret12;_classCallCheck(this, Vpn_country_selected_view);for (var _len12 = arguments.length, args = Array(_len12), _key12 = 0; _key12 < _len12; _key12++) {args[_key12] = arguments[_key12];}return _ret12 = (_temp12 = (_this21 = _possibleConstructorReturn(this, (_ref13 = Vpn_country_selected_view.__proto__ || Object.getPrototypeOf(Vpn_country_selected_view)).call.apply(_ref13, [this].concat(args))), _this21), _this21.
                state = { show_dropdown: false }, _this21.
                toggle = function (isOpen) {
                    _this21.setState({ show_dropdown: isOpen });
                    var body = (0, _jquery2.default)('body');
                    body.toggleClass('gray-cover-opened', isOpen);
                    if (isOpen)
                    {
                        body.on('click.country_list_click', function (event) {
                            if (!(0, _jquery2.default)(event.target).parents('.country-selection').length)
                            _this21.hide();
                        });
                    } else

                    body.off('click.country_list_click');
                }, _this21.
                show = function () {return _this21.toggle(true);}, _this21.
                hide = function () {return _this21.toggle(false);}, _this21.
                on_select = function (country) {
                    _this21.hide();
                    if (_this21.props.on_country_select)
                    _this21.props.on_country_select(country);
                }, _temp12), _possibleConstructorReturn(_this21, _ret12);}_createClass(Vpn_country_selected_view, [{ key: 'render', value: function render()
                {var _props5 =
                    this.props,country = _props5.country,is_mitm = _props5.is_mitm,is_protect = _props5.is_protect;
                    return _react2.default.createElement('div', { className: 'country_selected react-ui' },
                    _react2.default.createElement(Vpn_country_button, { country: country, click_on_flag: this.show,
                        click_on_caret: this.show, is_mitm: is_mitm,
                        is_protect: is_protect }),
                    this.state.show_dropdown &&
                    _react2.default.createElement(Vpn_countries_dropdown, { on_select: this.on_select }));

                } }]);return Vpn_country_selected_view;}(_react2.default.PureComponent);var


        Disable_view = function (_Vpn_country_selected) {_inherits(Disable_view, _Vpn_country_selected);function Disable_view() {_classCallCheck(this, Disable_view);return _possibleConstructorReturn(this, (Disable_view.__proto__ || Object.getPrototypeOf(Disable_view)).apply(this, arguments));}_createClass(Disable_view, [{ key: 'get_countries', value: function get_countries()
                {var
                    host = this.props.host;
                    var popular_countries = get_popular_country(host);
                    var tld = _util4.default.get_tld_country(host || api.get_host());
                    var ratings = [popular_countries[0], popular_countries[1]];
                    if (tld && tld != ratings[0].proxy_country &&
                    tld != ratings[1].proxy_country)
                    {
                        ratings.push({ proxy_country: tld, rating: 0.1 });
                        ratings.sort(function (a, b) {return b.rating - a.rating;});
                    }
                    return ratings;
                } }, { key: 'render', value: function render()
                {var _this23 = this;var _get_countries =
                    this.get_countries(),_get_countries2 = _slicedToArray(_get_countries, 2),country = _get_countries2[0],second_country = _get_countries2[1];
                    return _react2.default.createElement('div', { className: 'popup-enabled popup-multiselect' },
                    _react2.default.createElement('div', { className: 'popup-enabled-content' },
                    _react2.default.createElement(Vpn_title_view, { after: is_mitm_site() ? 'Unblock' : 'Change',
                        before: 'country to:' }),
                    _react2.default.createElement('div', { className: 'country_selected react-ui row' },
                    _react2.default.createElement(Vpn_country_button, { className: 'country_selection_left',
                        country: second_country.proxy_country,
                        click_on_flag: function click_on_flag() {return _this23.on_select(second_country);} }),
                    _react2.default.createElement(Vpn_country_button, { className: 'country_selection_center',
                        country: country.proxy_country,
                        click_on_flag: function click_on_flag() {return _this23.on_select(country);},
                        click_on_caret: this.show }),
                    _react2.default.createElement(Vpn_country_button, { className: 'country_selection_right',
                        country: null, click_on_flag: this.show,
                        click_on_caret: this.show }),
                    this.state.show_dropdown &&
                    _react2.default.createElement(Vpn_countries_dropdown, { on_select: this.on_select }))));



                } }]);return Disable_view;}(Vpn_country_selected_view);


        function get_popular_country(host) {
            var has_rule_rating = host && host != api.get('rule_ratings.root_url');
            return _util4.default.get_popular_country({
                host: host || api.get_host(),
                rule_ratings: has_rule_rating ? false : api.get('rule_ratings') });

        }var

        Vpn_countries_dropdown = function (_React$PureComponent9) {_inherits(Vpn_countries_dropdown, _React$PureComponent9);function Vpn_countries_dropdown() {var _ref14;var _temp13, _this24, _ret13;_classCallCheck(this, Vpn_countries_dropdown);for (var _len13 = arguments.length, args = Array(_len13), _key13 = 0; _key13 < _len13; _key13++) {args[_key13] = arguments[_key13];}return _ret13 = (_temp13 = (_this24 = _possibleConstructorReturn(this, (_ref14 = Vpn_countries_dropdown.__proto__ || Object.getPrototypeOf(Vpn_countries_dropdown)).call.apply(_ref14, [this].concat(args))), _this24), _this24.





















                item_selected = function (country) {
                    if (_this24.props.on_select)
                    _this24.props.on_select(country);
                }, _temp13), _possibleConstructorReturn(_this24, _ret13);}_createClass(Vpn_countries_dropdown, [{ key: 'get_popular_country', value: function get_popular_country() {var site_conf = _util6.default.get_site_conf(api.be_ext, api.get_root());var suggestion_conf = _util6.default.get_suggestion_conf(site_conf, api.get('country'));var countries = (suggestion_conf || {}).proxy || [];return countries.filter(function (c) {return c != '*';}).concat(this.get_popular_().filter(function (p) {return !countries.includes(p);}));} }, { key: 'get_popular_', value: function get_popular_() {return get_popular_country(this.props.host).map(function (c) {return c.proxy_country;});} }, { key: 'get_all_countries', value: function get_all_countries(is_premium) {var _this25 = this;var vpn_countries = api.be_ext.get('vpn_countries') || [];var hide_countries = _util2.default.bool_lookup('kp');return _countries2.default.proxy_countries.bext.filter(function (c) {return !hide_countries[c.toLowerCase()];}).map(function (c) {return { country: c, name: (0, _locale2.default)(c), type: !is_premium && 'free', full_vpn: vpn_countries.includes(c.toLowerCase()) };}).filter(function (c) {return !_this25.props.only_protected || c.full_vpn;}).sort(function (c) {return c.name;});} }, { key: 'render', value: function render()
                {var _this26 = this;
                    var is_premium = api.be_ext.get('is_premium');
                    var unblock = !api.protect_ui.is_enabled() &&
                    api.be_vpn.get('mitm_ext_ui_enabled');
                    return _reactDom2.default.createPortal(_react2.default.createElement('div', { className: 'dropdown-menu country-selection dropdown-menu-open',

                        onClick: function onClick(e) {return e.stopPropagation();} },
                    _react2.default.createElement('ul', { role: 'menu' },
                    _react2.default.createElement(Vpn_countries_item, { name: (0, _locale2.default)('Stop VPN'), disable: true,
                        on_click: this.item_selected }),
                    _react2.default.createElement('li', { className: 'divider' }),
                    is_premium && _react2.default.createElement(Vpn_countries_item, { name: (0, _locale2.default)('Protect'),
                        country: 'us', protect: '1', on_click: this.item_selected }),
                    this.get_popular_country().map(function (c) {return (
                            _react2.default.createElement(Vpn_countries_item, { key: c.country, name: (0, _locale2.default)(c.toUpperCase()),
                                country: c, on_click: _this26.item_selected }));}),
                    _react2.default.createElement('li', { className: 'divider' }),
                    this.get_all_countries(is_premium).map(function (c) {return _react2.default.createElement(Vpn_countries_item, _extends({},
                        c, { key: c.country, on_click: _this26.item_selected }));}),
                    unblock && _react2.default.createElement(Vpn_countries_item, { country: 'mitm', name: (0, _locale2.default)('Unblock'),
                        mitm: true, on_click: this.item_selected }))),

                    document.body);
                } }]);return Vpn_countries_dropdown;}(_react2.default.PureComponent);var


        Vpn_countries_item = function (_React$PureComponent10) {_inherits(Vpn_countries_item, _React$PureComponent10);function Vpn_countries_item() {var _ref15;var _temp14, _this27, _ret14;_classCallCheck(this, Vpn_countries_item);for (var _len14 = arguments.length, args = Array(_len14), _key14 = 0; _key14 < _len14; _key14++) {args[_key14] = arguments[_key14];}return _ret14 = (_temp14 = (_this27 = _possibleConstructorReturn(this, (_ref15 = Vpn_countries_item.__proto__ || Object.getPrototypeOf(Vpn_countries_item)).call.apply(_ref15, [this].concat(args))), _this27), _this27.






                on_click = function (event, info) {
                    event.stopPropagation();
                    if (!info.disable)
                    perr({ id: 'be_ui_vpn_click_flag' });
                    if (_this27.props.on_click)
                    _this27.props.on_click(info);
                }, _temp14), _possibleConstructorReturn(_this27, _ret14);}_createClass(Vpn_countries_item, [{ key: 'flag_class', value: function flag_class() {var props = this.props;return ['ui_lock_container', 'flag', props.disable && 'flag_disable' || props.mitm && 'flag_unblock' || props.protect && 'flag_protect' || props.country.toLowerCase()];} }, { key: 'render', value: function render()
                {var _this28 = this;var
                    props = this.props;
                    return _react2.default.createElement('li', { className: 'country' },
                    _react2.default.createElement('a', { className: 'f32 ui_lock_parent',
                        onClick: function onClick(e) {return _this28.on_click(e, props);} },
                    _react2.default.createElement('span', { className: (0, _classnames3.default)(this.flag_class()) }),
                    _react2.default.createElement('span', { className: 'flag_name', title: props.name }, props.name),
                    props.is_premium && _react2.default.createElement('span', { className: 'flag_type' }, 'T(\'PLUS\')')));


                } }]);return Vpn_countries_item;}(_react2.default.PureComponent);var

        Vpn_country_button = function (_React$PureComponent11) {_inherits(Vpn_country_button, _React$PureComponent11);function Vpn_country_button() {_classCallCheck(this, Vpn_country_button);return _possibleConstructorReturn(this, (Vpn_country_button.__proto__ || Object.getPrototypeOf(Vpn_country_button)).apply(this, arguments));}_createClass(Vpn_country_button, [{ key: 'render', value: function render()
                {var
                    props = this.props;
                    var country = props.country || '';
                    var country_label = (0, _locale2.default)(country && country.toUpperCase() || 'More...');
                    var flag_classes = ['flag', country.toLowerCase() || 'flag_other'];
                    if (props.is_mitm)
                    flag_classes = ['flag_mitm'];
                    if (props.is_protect)
                    flag_classes = ['flag_protect'];
                    if (props.fade_head)
                    flag_classes.push('flag_fade');
                    if (props.show_plus_logo)
                    flag_classes.push('show_plus_logo');
                    var classNames = ['r_country_list_view', 'country_selection_opt'].
                    concat([props.className]);
                    return _react2.default.createElement('span', { className: (0, _classnames3.default)(classNames) },
                    _react2.default.createElement('span', { className: 'dropdown r_country_list r_country_list_dropdown' },
                    _react2.default.createElement('a', { className: 'list_head btn r_btn-trans r_btn-rm-border' },
                    _react2.default.createElement('span', { className: 'hoverable', onClick: props.click_on_flag },
                    _react2.default.createElement('a', { className: 'fsvg_4x3' },
                    _react2.default.createElement('span', { className: (0, _classnames3.default)(flag_classes) })),

                    !(props.is_mitm || props.is_protect) &&
                    _react2.default.createElement('div', { className: 'r_list_head_label' }, country_label)),

                    props.click_on_caret &&
                    _react2.default.createElement('span', { className: 'caret hoverable hoverable-x',
                        onClick: props.click_on_caret }))));



                } }]);return Vpn_country_button;}(_react2.default.PureComponent);var


        Vpn_modal_view = function (_React$PureComponent12) {_inherits(Vpn_modal_view, _React$PureComponent12);_createClass(Vpn_modal_view, [{ key: 'componentDidMount', value: function componentDidMount()
                {var _this31 = this;
                    (0, _jquery2.default)('body').on('click.vpn_modal_view', function (e) {
                        if (_this31.state.show && !(0, _jquery2.default)(e.target).parents('.modal-view').length)
                        _this31.hide();
                    });
                } }, { key: 'componentWillUnmount', value: function componentWillUnmount()
                {
                    (0, _jquery2.default)('body').off('click.vpn_modal_view');
                } }]);






            function Vpn_modal_view(props) {_classCallCheck(this, Vpn_modal_view);var _this30 = _possibleConstructorReturn(this, (Vpn_modal_view.__proto__ || Object.getPrototypeOf(Vpn_modal_view)).call(this,
                props));_this30.toggle = function (isShow, yesClicked) {_this30.setState({ show: isShow });_this30.props.on_toggle(isShow, yesClicked);};_this30.show = function () {return _this30.toggle(true);};_this30.hide = function () {return _this30.toggle(false);};
                _this30.state = { show: props.show };return _this30;
            }_createClass(Vpn_modal_view, [{ key: 'componentWillReceiveProps', value: function componentWillReceiveProps(
                nextProps) {
                    this.setState({ show: nextProps.show });
                } }, { key: 'render', value: function render()
                {var _this32 = this;var
                    props = this.props;
                    var signin_url = 'https://hola.org/signin?utm_source=holaext' +
                    '&utm_content=' + props.signin;
                    var style = { display: !this.state.show && 'none' };
                    return _reactDom2.default.createPortal(_react2.default.createElement('div', { className: 'modal-view react-ui',
                        style: style },
                    _react2.default.createElement('div', { className: 'btn_close', onClick: this.hide }),
                    props.signin && _react2.default.createElement('a', { target: '_blank', className: 'sign-in',
                        rel: 'noopener noreferrer', href: signin_url }, (0, _locale2.default)('Log in')),
                    _react2.default.createElement('div', { className: 'message',
                        dangerouslySetInnerHTML: { __html: (0, _locale2.default)(props.message || 'message') } }),
                    _react2.default.createElement('div', { className: 'buttons' },
                    _react2.default.createElement('div', { className: 'btn_no', onClick: this.hide },
                    (0, _locale2.default)(props.text_no || 'No, thanks!')),
                    _react2.default.createElement('div', { className: 'btn_yes', onClick: function onClick() {return _this32.toggle(false, true);} },
                    (0, _locale2.default)(props.text_yes || 'yes')))),

                    document.body);
                } }]);return Vpn_modal_view;}(_react2.default.PureComponent);


        E.Progress_bar = function (_PureComponent9) {_inherits(Progress_bar, _PureComponent9);function Progress_bar() {_classCallCheck(this, Progress_bar);return _possibleConstructorReturn(this, (Progress_bar.__proto__ || Object.getPrototypeOf(Progress_bar)).apply(this, arguments));}_createClass(Progress_bar, [{ key: 'render', value: function render()
                {
                    var style = { visibility: this.props.visible ? 'visible' : 'hidden' };
                    return _react2.default.createElement('div', { className: 'progress-bar', style: style });
                } }]);return Progress_bar;}(PureComponent);


        E.render_enable_view = function (root) {var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            _reactDom2.default.render(_react2.default.createElement(Enable_view, opt), root);};

        E.render_disable_view = function (root) {var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            _reactDom2.default.render(_react2.default.createElement(Disable_view, opt), root);};

        E.unmountComponentAtNode = function (node) {
            _reactDom2.default.unmountComponentAtNode(node);};

        E.render_main_switch = function (root) {var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            _reactDom2.default.render(_react2.default.createElement(Main_switch, opt), root);
        };

        E.render_footer = function (root) {var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            _reactDom2.default.render(_react2.default.createElement(Footer, opt), root);};

        E.render_upgrade_link = function (root) {var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            _reactDom2.default.render(_react2.default.createElement(Upgrade_link, opt), root);};

        E.render_trial_timer = function (root) {var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            _reactDom2.default.render(_react2.default.createElement(Trial_timer, opt), root);};

        E.render_popular_view = function (root) {var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            _reactDom2.default.render(_react2.default.createElement(Popular_view, opt), root);};

        E.render_stub_unblock = function (root) {var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            _reactDom2.default.render(_react2.default.createElement(Stub_unblock, opt), root);};

        E.render_free_tooltip = function (root) {var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            _reactDom2.default.render(_react2.default.createElement(Free_tooltip, opt), root);
        };exports.default =

        E;});})();
//# sourceMappingURL=ui_lib.js.map
