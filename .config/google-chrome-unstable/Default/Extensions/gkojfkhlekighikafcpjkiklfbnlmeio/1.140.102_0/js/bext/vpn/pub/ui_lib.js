// LICENSE_CODE ZON
;(function () {
    'use strict'; define(['exports', 'react', 'react-dom', 'classnames', '/util/url.js', '/util/util.js', '/util/zerr.js', '/util/date.js', '/bext/pub/locale.js', '/util/etask.js', '/bext/pub/browser.js', '/bext/vpn/pub/util.js', '/bext/pub/util.js', '/util/country.js', 'regenerator-runtime'], function (exports, _react, _reactDom, _classnames2, _url, _util, _zerr, _date, _locale, _etask2, _browser, _util3, _util5, _country) {Object.defineProperty(exports, "__esModule", { value: true });var _react2 = _interopRequireDefault(_react);var _reactDom2 = _interopRequireDefault(_reactDom);var _classnames3 = _interopRequireDefault(_classnames2);var _url2 = _interopRequireDefault(_url);var _util2 = _interopRequireDefault(_util);var _zerr2 = _interopRequireDefault(_zerr);var _date2 = _interopRequireDefault(_date);var _locale2 = _interopRequireDefault(_locale);var _etask3 = _interopRequireDefault(_etask2);var _browser2 = _interopRequireDefault(_browser);var _util4 = _interopRequireDefault(_util3);var _util6 = _interopRequireDefault(_util5);var _country2 = _interopRequireDefault(_country);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}















        var E = {};
        var api = void 0;
        var plus_ref = _util4.default.plus_ref;

        function perr(opt) {
            var be_popup_lib = window.popup_main && window.popup_main.be_popup_lib;
            return be_popup_lib.perr_ok(opt);
        }

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
            var sec = Math.floor(ms / 1000);
            var hours = Math.floor(sec / (60 * 60));
            sec -= hours * 60 * 60;
            var mins = Math.floor(sec / 60);
            sec -= mins * 60;
            return (hours ? hours + 'h ' : '') + mins + 'm ' + sec + 's';
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

                    _react2.default.createElement(Tooltip, { position: 'bottom', title: 'Upgrade to PLUS now!',
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
                state = { list: [] }, _this12.






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
                                        _this.setState({ list: list });case 7:case 'end':return _context2.stop();}}}, _callee, this);}));

                }, _this12.
                on_focus = function () {
                    perr({ id: 'be_ui_popular_input_focus', info: {
                            root_url: api.get_root(), url: api.get_url() } });
                }, _this12.
                on_key_press = function (e) {
                    if (e.key != 'Enter')
                    return;
                    _this12.on_search();
                }, _this12.
                on_change = function (e) {var _this12$setState;
                    e.preventDefault();
                    _this12.setState((_this12$setState = {}, _defineProperty(_this12$setState, e.target.name, e.target.value), _defineProperty(_this12$setState, 'error', false), _this12$setState));
                }, _this12.
                on_search = function (e) {
                    e && e.preventDefault();var
                    search = _this12.state.search;
                    var err = void 0,root_url = void 0;
                    try {
                        if (!_url2.default.is_valid_url(search) && (err = 'valid_url'))
                        return _this12.setState({ error: true });var _zurl$parse =
                        _url2.default.parse(search),hostname = _zurl$parse.hostname,href = _zurl$parse.href;
                        root_url = _url2.default.get_root_domain(hostname);
                        if (!root_url && (err = 'no_root_url'))
                        return _this12.setState({ error: true });
                        if (api.skip_url({ url: href, ignore_curr_url: true }) && (
                        err = 'skip_url'))
                        {
                            return _this12.setState({ error: true });
                        }
                    } finally {
                        perr({ id: 'be_ui_popular_click_go', info: {
                                root_url: api.get_root(), url: api.get_url(), search: search, err: err } });
                    }
                    api.set_active_url(root_url);
                }, _temp7), _possibleConstructorReturn(_this12, _ret7);}_createClass(Popular_view, [{ key: 'componentDidMount', value: function componentDidMount() {this.on(api, 'change:unblocking_rate', this.update_list);this.update_list();perr({ id: 'be_ui_popular_view', info: { root_url: api.get_root(), url: api.get_url() } });} }, { key: 'render', value: function render()
                {var _state2 =
                    this.state,list = _state2.list,error = _state2.error;
                    return _react2.default.createElement('div', { className: 'popular-view' },
                    _react2.default.createElement('div', { className: 'search-field' },
                    _react2.default.createElement('input', { type: 'text', name: 'search', onFocus: this.on_focus,
                        placeholder: (0, _locale2.default)('Enter site to unblock'),
                        onKeyPress: this.on_key_press, onChange: this.on_change }),
                    _react2.default.createElement('button', { onClick: this.on_search }),
                    error && _react2.default.createElement('div', { className: 'error' }, 'Enter a valid site or url (eg. netflix.com)')),



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

                } }]);return Stub_unblock;}(PureComponent);


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
            _reactDom2.default.render(_react2.default.createElement(Stub_unblock, opt), root);};exports.default =

        E;});})();
//# sourceMappingURL=ui_lib.js.map
