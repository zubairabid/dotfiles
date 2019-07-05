// LICENSE_CODE ZON
;(function () {
    'use strict'; define(['exports', 'underscore', 'classnames', 'jquery', 'react', 'react-dom', 'conf', '/util/date.js', '/util/util.js', '/util/url.js', '/util/etask.js', '/bext/pub/browser.js', '/bext/vpn/pub/ui_lib.js', '/bext/vpn/pub/page_lib.js', '/bext/pub/lib.js', '/bext/vpn/pub/util.js', '/bext/vpn/pub/privacy.js', '/svc/account/pub/membership.js', 'regenerator-runtime'], function (exports, _underscore, _classnames, _jquery, _react, _reactDom, _conf, _date, _util, _url, _etask, _browser, _ui_lib, _page_lib, _lib, _util3, _privacy, _membership) {Object.defineProperty(exports, "__esModule", { value: true });exports.init = undefined;var _underscore2 = _interopRequireDefault(_underscore);var _classnames2 = _interopRequireDefault(_classnames);var _jquery2 = _interopRequireDefault(_jquery);var _react2 = _interopRequireDefault(_react);var _reactDom2 = _interopRequireDefault(_reactDom);var _conf2 = _interopRequireDefault(_conf);var _date2 = _interopRequireDefault(_date);var _util2 = _interopRequireDefault(_util);var _url2 = _interopRequireDefault(_url);var _etask2 = _interopRequireDefault(_etask);var _browser2 = _interopRequireDefault(_browser);var _ui_lib2 = _interopRequireDefault(_ui_lib);var _lib2 = _interopRequireDefault(_lib);var _util4 = _interopRequireDefault(_util3);var _privacy2 = _interopRequireDefault(_privacy);var _membership2 = _interopRequireDefault(_membership);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}var _get = function get(object, property, receiver) {if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {var parent = Object.getPrototypeOf(object);if (parent === null) {return undefined;} else {return get(parent, property, receiver);}} else if ("value" in desc) {return desc.value;} else {var getter = desc.get;if (getter === undefined) {return undefined;}return getter.call(receiver);}};var _slicedToArray = function () {function sliceIterator(arr, i) {var _arr = [];var _n = true;var _d = false;var _e = undefined;try {for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"]) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}return function (arr, i) {if (Array.isArray(arr)) {return arr;} else if (Symbol.iterator in Object(arr)) {return sliceIterator(arr, i);} else {throw new TypeError("Invalid attempt to destructure non-iterable instance");}};}();function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};function _objectWithoutProperties(obj, keys) {var target = {};for (var i in obj) {if (keys.indexOf(i) >= 0) continue;if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;target[i] = obj[i];}return target;}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}



















        var assign = Object.assign,T = _ui_lib2.default.T;
        var be_ext = void 0,be_rule = void 0,be_info = void 0,be_premium = void 0,be_vpn = void 0,be_svc = void 0,be_bg_ajax = void 0;

        var perr = function perr(id, info) {return (
                _lib2.default.perr_ok({ id: id, info: info }, true));};var

        Switch = function (_React$Component) {_inherits(Switch, _React$Component);function Switch() {var _ref;var _temp, _this2, _ret;_classCallCheck(this, Switch);for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {args[_key] = arguments[_key];}return _ret = (_temp = (_this2 = _possibleConstructorReturn(this, (_ref = Switch.__proto__ || Object.getPrototypeOf(Switch)).call.apply(_ref, [this].concat(args))), _this2), _this2.
                toggle = function () {var
                    on_change = _this2.props.on_change;
                    if (on_change)
                    _this2.props.on_change(!_this2.props.checked);
                }, _temp), _possibleConstructorReturn(_this2, _ret);}_createClass(Switch, [{ key: 'render', value: function render()
                {var
                    checked = this.props.checked;
                    var cls = 'switch' + (checked ? ' switch-checked' : '');
                    return (
                        _react2.default.createElement('button', { type: 'button', role: 'switch', 'aria-checked': checked,
                            className: cls, onClick: this.toggle }));

                } }]);return Switch;}(_react2.default.Component);

        Switch.defaultProps = {
            on_change: function on_change() {} };


        function Label_checkbox(props) {var
            children = props.children,input_props = _objectWithoutProperties(props, ['children']);
            return _react2.default.createElement('label', { className: 'label-checkbox' },
            _react2.default.createElement('input', _extends({ type: 'checkbox' }, input_props)),
            _react2.default.createElement('div', { className: 'content' }, children));

        }

        var Link_button = function Link_button(props) {
            var on_click = function on_click(e) {
                if (!props.href)
                e.preventDefault();
                if (props.on_click)
                props.on_click(e);
            };
            return _react2.default.createElement('a', { className: (0, _classnames2.default)('link-button', props.cls),
                style: props.style, href: props.href, onClick: on_click,
                target: props.new_tab ? '_blank' : undefined },
            props.children);

        };

        var Link_line = function Link_line(props) {return (
                _react2.default.createElement('div', { className: 'link-line' },
                _react2.default.createElement(Link_button, { href: props.href }, props.children)));};


        var Row = function Row(props) {return (
                _react2.default.createElement('div', { className: 'row-sp1' },
                _react2.default.createElement('div', { className: (0, _classnames2.default)('row-children', props.cls) },
                props.children)));};



        function Report_problem() {
            return (
                _react2.default.createElement('div', { className: 'section report-problem' },
                _react2.default.createElement('a', { className: 'title', href: 'about.html#report_issue' },
                _react2.default.createElement(T, null, 'Report a problem'))));



        }

        var date2display = function date2display(d) {return d ? _date2.default.strftime('%o %B %Y', (0, _date2.default)(d)) : '-';};

        var Mobile_cancel_notice = function Mobile_cancel_notice(props) {
            var store = _membership2.default.is_ios(props.membership) ? 'App Store' :
            'Google Play';
            var faq_url = props.hola_faq ? '/faq#premium-cancel' :
            _membership2.default.is_ios(props.membership) ?
            'https://support.apple.com/en-il/HT202039' :
            'https://support.google.com/googleplay/answer/7018481';
            return _react2.default.createElement('p', null, 'Note: To cancel your subscription, you must use ',
            store, '. See ',
            _react2.default.createElement('a', { href: faq_url }, 'the FAQ.'));

        };var

        Cancel_modal = function (_PureComponent) {_inherits(Cancel_modal, _PureComponent);function Cancel_modal() {var _ref2;var _temp2, _this3, _ret2;_classCallCheck(this, Cancel_modal);for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {args[_key2] = arguments[_key2];}return _ret2 = (_temp2 = (_this3 = _possibleConstructorReturn(this, (_ref2 = Cancel_modal.__proto__ || Object.getPrototypeOf(Cancel_modal)).call.apply(_ref2, [this].concat(args))), _this3), _this3.




                on_change = function (e) {return _this3.setState(_defineProperty({}, e.target.name, e.target.value));}, _this3.

























































































                perr_commit = function () {
                    perr('cancel_subscription', {
                        user: _util2.default.get(_this3.props.user, 'hola_uid'),
                        is_mobile: _membership2.default.is_mobile(_this3.props.membership) });
                }, _this3.
                on_back = function () {
                    if (_this3.state.step == 'cancel')
                    {
                        _this3.perr_commit();
                        return _this3.cancel_subscr();
                    }
                    var step = _this3.history.pop();
                    if (!step)
                    return _this3.props.close();
                    _this3.setState({ step: step });
                }, _this3.
                on_next = function () {
                    var _this = _this3;var
                    step = _this3.state.step;
                    _this3.history.push(step);
                    return (0, _etask2.default)(regeneratorRuntime.mark(function _callee() {var next_step;return regeneratorRuntime.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:
                                        next_step = void 0;_context.t0 =
                                        step;_context.next = _context.t0 ===

                                        'faq' ? 4 : _context.t0 ===
                                        'reason' ? 6 : 20;break;case 4:next_step = 'reason';return _context.abrupt('break', 23);case 6:if (!
                                        _membership2.default.is_mobile(_this.props.membership)) {_context.next = 18;break;}

                                        _this.perr_commit();_context.next = 10;return (
                                            _this.send_reason());case 10:if (!_context.sent) {_context.next = 14;break;}_context.t1 = 'cancel_mobile';_context.next = 15;break;case 14:_context.t1 =
                                        'reason';case 15:next_step = _context.t1;_context.next = 19;break;case 18:


                                        next_step = 'cancel';case 19:return _context.abrupt('break', 23);case 20:


                                        be_premium.refresh_user({ force_premium: true });
                                        next_step = undefined;
                                        _this.props.close();case 23:

                                        _this.setState({ step: next_step });case 24:case 'end':return _context.stop();}}}, _callee, this);}));

                }, _temp2), _possibleConstructorReturn(_this3, _ret2);}_createClass(Cancel_modal, [{ key: 'componentDidMount', value: function componentDidMount() {this.setState({ step: 'faq' });this.history = [];} }, { key: 'render_faq', value: function render_faq() {var Faq = function Faq(props) {return _react2.default.createElement('a', { href: 'https://hola.org/faq#' + props.id }, props.children);};var body = _react2.default.createElement('div', null, _react2.default.createElement('p', null, _react2.default.createElement('b', null, 'Common issues:')), _react2.default.createElement('ul', null, _react2.default.createElement('li', null, _react2.default.createElement(Faq, { id: 'premium-streamingservices' }, 'Netflix/Hulu issues')), _react2.default.createElement('li', null, _react2.default.createElement(Faq, { id: 'premium-slowconn' }, 'Slow connection')), _react2.default.createElement('li', null, _react2.default.createElement(Faq, { id: 'premium-appearfree' }, 'My account appears as free'))), _react2.default.createElement('p', null, 'Search the ', _react2.default.createElement(Faq, { id: 'faq' }, 'Full FAQs')), _react2.default.createElement('p', null, 'Still need help? ', _react2.default.createElement('a', { href: '/premium_support' }, 'Contact us!')));return { title: T('Technical issue?'), next_label: T('Still want to cancel'), body: body };} }, { key: 'render_reason', value: function render_reason() {var reason = this.state.reason || '';var body = _react2.default.createElement('input', { className: 'hfill', name: 'reason', value: reason, onChange: this.on_change, placeholder: 'Problems with a specific site? ' + 'Slow connection? Please let us know.' });return { title: T('Before you go... tell us why?'), next_label: T('Continue'), next_disabled: reason.trim().length < 8, body: body };} }, { key: 'render_cancel', value: function render_cancel() {var cancel_error = this.state.cancel_error;var body = _react2.default.createElement('div', null, _react2.default.createElement('p', null, 'The subscription allows you to enjoy uninterrupted secure browsing and unblocking of all your favorite sites, on all your devices.'), cancel_error && _react2.default.createElement(Alert_message, { type: 'error' }, cancel_error));return { title: T('Are you sure you want to cancel your subscription?'), next_label: T('Keep using Hola VPN'), back_label: T('Cancel my subscription'), body: body };} }, { key: 'render_cancel_mobile', value: function render_cancel_mobile() {return { next_label: T('Ok'), back_label: false, body: _react2.default.createElement(Mobile_cancel_notice, { membership: this.props.membership }) };} }, { key: 'cancel_subscr', value: function cancel_subscr() {var _this = this;return (0, _etask2.default)(regeneratorRuntime.mark(function _callee2() {var data, res;return regeneratorRuntime.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:this.on('uncaught', function () {return _this.setState({ cancel_error: 'Unknown error' });});data = { reason: _this.state.reason };_context2.next = 4;return be_bg_ajax.ecall('hola_api_call', ['users/payment/cancel_subscription?no_redirect=1', { method: 'POST', text: true, data: data }]);case 4:res = _context2.sent;if (!(res != 'ok')) {_context2.next = 7;break;}throw new Error();case 7:be_premium.refresh_user({ force_premium: true });_this.props.close();case 9:case 'end':return _context2.stop();}}}, _callee2, this);}));} }, { key: 'send_reason', value: function send_reason() {var _this = this;return (0, _etask2.default)(regeneratorRuntime.mark(function _callee3() {var data, res;return regeneratorRuntime.wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:_context3.prev = 0;data = { reason: _this.state.reason };_context3.next = 4;return be_bg_ajax.ecall('hola_api_call', ['users/payment/update_reason', { method: 'POST', text: true, data: data }]);case 4:res = _context3.sent;return _context3.abrupt('return', res.trim() == 'ok');case 8:_context3.prev = 8;_context3.t0 = _context3['catch'](0);return _context3.abrupt('return', false);case 11:case 'end':return _context3.stop();}}}, _callee3, this, [[0, 8]]);}));} }, { key: 'render', value: function render()
                {var
                    step = this.state.step;
                    var res = this['render_' + step] && this['render_' + step]();
                    if (!res)
                    return null;
                    var actions = [
                    res.back_label !== false && _react2.default.createElement('a', { key: 'back', className: 'btn-secondary',
                        onClick: this.on_back },
                    T(res.back_label || 'Go back')),

                    _react2.default.createElement('a', { key: 'next', className: (0, _classnames2.default)({ disabled: res.next_disabled }),
                        onClick: !res.next_disabled && this.on_next },
                    res.next_label)];


                    return _react2.default.createElement(_page_lib.Modal, { title: res.title, on_close: this.props.close,
                        action: actions },
                    res.body);

                } }]);return Cancel_modal;}(_page_lib.PureComponent);


        function Alert_message(props) {var
            duration = props.duration;
            if (duration && props.ts + duration < Date.now())
            return null;
            return _react2.default.createElement('div', { className: (0, _classnames2.default)('alert-message', props.type) },
            props.children);

        }

        function create_alert_info(type, message, duration) {
            return { type: type, message: message, duration: duration, ts: Date.now() };}var

        Account_details = function (_PureComponent2) {_inherits(Account_details, _PureComponent2);

            function Account_details(props) {_classCallCheck(this, Account_details);var _this4 = _possibleConstructorReturn(this, (Account_details.__proto__ || Object.getPrototypeOf(Account_details)).call(this,
                props));_this4.state = { password: '', new_pass: '' };_this4.











                on_change = function (e) {return _this4.setState(_defineProperty({}, e.target.name, e.target.value));};_this4.
                switch_show = function (key) {return _this4.setState(_defineProperty({}, key, !_this4.state[key]));};_this4.
                update_alert = function (id, type, message, duration) {var _this4$state$alerts =
                    _this4.state.alerts,alerts = _this4$state$alerts === undefined ? {} : _this4$state$alerts;
                    if (!type)
                    return _this4.setState({ alerts: _extends({}, alerts, _defineProperty({}, id, undefined)) });
                    _this4.setState({ alerts: _extends({}, alerts, _defineProperty({},
                        id, create_alert_info(type, message, duration))) });
                    if (duration)
                    setTimeout(function () {return _this4.forceUpdate();}, duration);
                };_this4.
                logout_sessions = function () {
                    var _this = _this4;
                    (0, _etask2.default)(regeneratorRuntime.mark(function _callee4() {var res;return regeneratorRuntime.wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:
                                        this.on('uncaught', function () {
                                            _this.update_alert('logout', 'error',
                                            'Unsuccessful logout all sessions except me');
                                        });
                                        _this.update_alert('logout');_context4.next = 4;return (
                                            be_bg_ajax.ecall('hola_api_call',
                                            ['users/logout/others', { method: 'POST', text: true }]));case 4:res = _context4.sent;if (!(
                                        res != 'ok')) {_context4.next = 7;break;}throw (
                                            new Error());case 7:
                                        _this.update_alert('logout', 'success',
                                        'Successful logout all sessions except me', 3000);case 8:case 'end':return _context4.stop();}}}, _callee4, this);}));

                };_this4.
                change_password = function () {
                    var _this = _this4;var _this4$state =
                    _this4.state,password = _this4$state.password,new_pass = _this4$state.new_pass;
                    return (0, _etask2.default)(regeneratorRuntime.mark(function _callee5() {var data, res;return regeneratorRuntime.wrap(function _callee5$(_context5) {while (1) {switch (_context5.prev = _context5.next) {case 0:
                                        this.on('uncaught', function () {
                                            _this.update_alert('password', 'error',
                                            'Current password is incorrect');
                                        });
                                        _this.update_alert('password');if (!(
                                        !password || !new_pass)) {_context5.next = 4;break;}return _context5.abrupt('return',

                                        _this.update_alert('password', 'error',
                                        'Please fill all fields'));case 4:

                                        data = { password: password, new_pass: new_pass, service: true };_context5.next = 7;return (
                                            be_bg_ajax.ecall('hola_api_call',
                                            ['users/change_password', { method: 'POST', data: data, text: true }]));case 7:res = _context5.sent;if (!(
                                        res != 'ok')) {_context5.next = 10;break;}throw (
                                            new Error());case 10:_context5.next = 12;return (
                                            _this.logout_sessions());case 12:
                                        _this.setState({ show_change_password: false });
                                        _this.update_alert('password', 'success',
                                        'Password successfully changed', 3000);case 14:case 'end':return _context5.stop();}}}, _callee5, this);}));

                };_this4.
                avangate_update_cc = function () {
                    var _this = _this4;
                    return (0, _etask2.default)(regeneratorRuntime.mark(function _callee6() {var url;return regeneratorRuntime.wrap(function _callee6$(_context6) {while (1) {switch (_context6.prev = _context6.next) {case 0:
                                        this.on('uncaught', function () {
                                            _this.update_alert('avangate_update_cc', 'error',
                                            'Unknown error');
                                        });
                                        _this.update_alert('avangate_update_cc');_context6.next = 4;return (
                                            be_bg_ajax.ecall('hola_api_call',
                                            ['users/payment/single_sign_on']));case 4:url = _context6.sent;if (
                                        _url2.default.is_valid_url(url)) {_context6.next = 7;break;}throw (
                                            new Error());case 7:
                                        location.href = url.replace('?', 'payment_methods/?');case 8:case 'end':return _context6.stop();}}}, _callee6, this);}));

                };_this4.switch_show_password = _this4.switch_show.bind(_this4, 'show_change_password');_this4.switch_show_manage = _this4.switch_show.bind(_this4, 'show_manage_subscr');_this4.switch_show_cancel = _this4.switch_show.bind(_this4, 'show_cancel_modal');return _this4;}_createClass(Account_details, [{ key: 'componentDidMount', value: function componentDidMount() {this.model_to_state(be_premium, 'membership');be_premium.refresh_user({ force_premium: true });} }, { key: 'render_alerts', value: function render_alerts(
                keys) {var _state$alerts =
                    this.state.alerts,alerts = _state$alerts === undefined ? {} : _state$alerts;
                    return Object.entries(alerts).
                    filter(function (_ref3) {var _ref4 = _slicedToArray(_ref3, 2),key = _ref4[0],value = _ref4[1];return !!value && keys.includes(key);}).
                    map(function (_ref5) {var _ref6 = _slicedToArray(_ref5, 2),key = _ref6[0],_ref6$ = _ref6[1],message = _ref6$.message,props = _objectWithoutProperties(_ref6$, ['message']);return (
                            _react2.default.createElement(Alert_message, _extends({ key: key }, props),
                            message));});

                } }, { key: 'render', value: function render()
                {var _props =
                    this.props,user = _props.user,is_plus = _props.is_plus;var _state =

                    this.state,show_change_password = _state.show_change_password,show_manage_subscr = _state.show_manage_subscr,show_cancel_modal = _state.show_cancel_modal;
                    var m = this.state.membership;
                    var is_active = _membership2.default.is_active(m);
                    var status = !_membership2.default.is_active(m) ? 'Stopped' :
                    _membership2.default.is_in_trial(m) ? 'Free trial' : 'Valid';
                    return _react2.default.createElement(_page_lib.Section, { title: T('Account details:') },
                    _react2.default.createElement(_page_lib.Label_line, { label: T('Account ID:') },
                    user.displayName, ' (', user.hola_uid, ')'),

                    _react2.default.createElement(_page_lib.Label_line, { label: T('Membership:') },
                    is_plus ? 'PLUS' : 'FREE'),

                    _react2.default.createElement(_page_lib.Label_line, null,
                    _react2.default.createElement(Row, { cls: 'hfill' },
                    _react2.default.createElement(Link_button, { on_click: this.switch_show_password },
                    show_change_password ? 'Hide change password' :
                    'Change password'),

                    _react2.default.createElement(Link_button, { on_click: this.logout_sessions }, 'Logout all sessions except me')),



                    this.render_alerts(['logout', 'password']),
                    show_change_password && _react2.default.createElement('div', null,
                    _react2.default.createElement(_page_lib.Label_line, { label: T('Current password:') },
                    _react2.default.createElement('input', { name: 'password', type: 'password',
                        onChange: this.on_change })),

                    _react2.default.createElement(_page_lib.Label_line, { label: T('New password:') },
                    _react2.default.createElement('input', { name: 'new_pass', type: 'password',
                        onChange: this.on_change })),

                    _react2.default.createElement(_page_lib.Label_line, { label: ' ' },
                    _react2.default.createElement(Link_button, { cls: 'btn-primary', style: { marginRight: '20px' },
                        on_click: this.change_password }, 'Change password'),


                    _react2.default.createElement(Link_button, { href: 'https://hola.org/forgot_password',
                        new_tab: true }, 'Forgot your password?')))),





                    is_active && _react2.default.createElement(_page_lib.Label_line, { label: T('Subscribed on:') },
                    _membership2.default.is_mobile(m) ? 'Mobile' : 'Desktop'),

                    is_active && _react2.default.createElement(_page_lib.Label_line, { label: T('Subscription:') },
                    _membership2.default.period_str(m)),

                    is_active && m.cancelled && _react2.default.createElement(_page_lib.Label_line, null, 'You cancelled your subscription. It will remain active until ',

                    date2display(m.end), '.'),

                    is_active && _react2.default.createElement(_page_lib.Label_line, null,
                    _react2.default.createElement(Row, { cls: 'center' },
                    _react2.default.createElement(Link_button, { on_click: this.switch_show_manage },
                    show_manage_subscr ? T('Hide') : T('Manage'))),


                    show_manage_subscr && _react2.default.createElement('div', null,
                    _react2.default.createElement(_page_lib.Label_line, { label: T('Started on:') },
                    _membership2.default.period_start_str(m)),

                    _react2.default.createElement(_page_lib.Label_line, {
                        label: T(m.period == '1 D' ? 'Expires on:' : 'Next renewal:') },
                    _membership2.default.period_end_str(m)),

                    _react2.default.createElement(_page_lib.Label_line, { label: T('Payment method:') },
                    _membership2.default.payment_label(m),
                    m.gateway == 'avangate' && _react2.default.createElement('div', null,
                    _react2.default.createElement(Link_button, { on_click: this.avangate_update_cc }, 'Update Credit card')),



                    this.render_alerts(['avangate_update_cc'])),

                    _react2.default.createElement(_page_lib.Label_line, { label: T('Subscription status:') },
                    status,
                    _membership2.default.is_cancellable(m) && _react2.default.createElement('div', null,
                    _react2.default.createElement(Link_button, { on_click: this.switch_show_cancel }, 'Cancel subscription'),


                    show_cancel_modal &&
                    _react2.default.createElement(Cancel_modal, { close: this.switch_show_cancel,
                        user: user, membership: m }))),


                    _membership2.default.is_cancellable_mobile(m) && _react2.default.createElement(_page_lib.Label_line, null,
                    _react2.default.createElement(Mobile_cancel_notice, { membership: m })))),



                    _react2.default.createElement(Link_line, { href: 'https://hola.org/cp' },
                    _react2.default.createElement(T, null, 'My account')));


                } }]);return Account_details;}(_page_lib.PureComponent);


        function Rule_item(props) {var
            rule = props.rule,href = props.href,cls = props.cls,on_remove = props.on_remove,on_switch = props.on_switch,title = props.title;
            return (
                _react2.default.createElement('li', { key: rule.name, className: (0, _classnames2.default)('rule-item', cls) },
                _react2.default.createElement('div', { className: 'icon-' + (props.icon || rule.mode || 'unblock') }),
                _react2.default.createElement('div', { className: 'f32' },
                _react2.default.createElement('i', { className: 'flag ' + rule.country })),

                href && _react2.default.createElement('a', { className: 'rule-name', href: href, target: '_blank',
                    rel: 'noopener noreferrer' },
                rule.name),

                title && _react2.default.createElement('div', { className: 'rule-name' }, _react2.default.createElement(T, null, title)),
                on_switch && _react2.default.createElement(Switch, { checked: rule.enabled, on_change: on_switch }),
                on_remove && _react2.default.createElement('div', { className: 'icon-remove', title: T('Delete'),
                    onClick: function onClick() {return on_remove(rule);} })));


        }var

        Unblock = function (_PureComponent3) {_inherits(Unblock, _PureComponent3);function Unblock() {var _ref7;var _temp3, _this5, _ret3;_classCallCheck(this, Unblock);for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {args[_key3] = arguments[_key3];}return _ret3 = (_temp3 = (_this5 = _possibleConstructorReturn(this, (_ref7 = Unblock.__proto__ || Object.getPrototypeOf(Unblock)).call.apply(_ref7, [this].concat(args))), _this5), _this5.













                remove_rule = function (rule) {
                    var _this = _this5;
                    (0, _etask2.default)(regeneratorRuntime.mark(function _callee7() {var opt;return regeneratorRuntime.wrap(function _callee7$(_context7) {while (1) {switch (_context7.prev = _context7.next) {case 0:if (!
                                        rule.mitm) {_context7.next = 5;break;}_context7.next = 3;return (

                                            be_vpn.fcall('mitm_set_ignore', [rule.url]));case 3:
                                        _this.load_mitm_rules();return _context7.abrupt('return');case 5:


                                        opt = assign({ enabled: 0, del: 1 }, _underscore2.default.pick(rule, 'sid', 'name',
                                        'type', 'md5', 'country'));_context7.next = 8;return (
                                            be_rule.fcall('set_rule', [opt]));case 8:
                                        be_rule.trigger('fetch_rules');case 9:case 'end':return _context7.stop();}}}, _callee7, this);}));

                }, _this5.
                render_rule = function (rule) {
                    var href = 'http://' + (_url2.default.get_host(_url2.default.add_proto(rule.link || '') + '/') ||
                    rule.name);
                    return _react2.default.createElement(Rule_item, { rule: rule, href: href, on_remove: _this5.remove_rule,
                        cls: { 'rule-disabled': !rule.enabled } });
                }, _this5.
                switch_all_browser = function (enable) {
                    be_vpn.fcall('set_enabled_for_browser', [enable, { country: 'us' }]);}, _this5.
                switch_protect_pc = function (enable) {
                    be_vpn.fcall('set_enabled_for_pc', [enable, { country: 'us' }]);}, _temp3), _possibleConstructorReturn(_this5, _ret3);}_createClass(Unblock, [{ key: 'componentDidMount', value: function componentDidMount() {this.model_to_state(be_rule, 'rules');this.model_to_state(be_vpn, ['protect_pc', 'protect_browser']);this.model_to_state(be_svc, 'vpn_country');this.load_mitm_rules();} }, { key: 'load_mitm_rules', value: function load_mitm_rules() {var _this = this;(0, _etask2.default)(regeneratorRuntime.mark(function _callee8() {var rules;return regeneratorRuntime.wrap(function _callee8$(_context8) {while (1) {switch (_context8.prev = _context8.next) {case 0:_context8.next = 2;return be_vpn.fcall('get_mitm_unblock_rules');case 2:rules = _context8.sent;_this.setState({ mitm_rules: rules });case 4:case 'end':return _context8.stop();}}}, _callee8, this);}));} }, { key: 'get_rules', value: function get_rules()
                {var
                    state = this.state;
                    var rules = [],all_browser = void 0;
                    Object.values(_util2.default.get(state, 'rules.unblocker_rules', {})).
                    forEach(function (rule) {
                        if (_util4.default.is_all_browser(rule))
                        all_browser = rule;else

                        rules.push(rule);
                    });
                    (state.mitm_rules || []).forEach(function (r) {return rules.push({ name: r.host, url: r.url,
                            country: r.proxy_country, enabled: true, mitm: true });});
                    var protect_pc = { mode: 'protect', country: state.vpn_country || 'us',
                        enabled: !!state.vpn_country };
                    all_browser = all_browser || { country: 'us', enabled: 0 };
                    return { rules: rules, all_browser: all_browser, protect_pc: protect_pc };
                } }, { key: 'render', value: function render()
                {var _get_rules =
                    this.get_rules(),rules = _get_rules.rules,all_browser = _get_rules.all_browser,protect_pc = _get_rules.protect_pc;var _props2 =
                    this.props,country = _props2.country,is_plus = _props2.is_plus;
                    var popular_url = 'https://hola.org/unblock/popular' + (country ?
                    '/' + country.toLowerCase() : '') + '?utm_source=holaext_settings';
                    return _react2.default.createElement(_page_lib.Section, { title: T('Unblock') },
                    _react2.default.createElement('ul', null,
                    is_plus && this.state.protect_browser &&
                    _react2.default.createElement(Rule_item, { rule: all_browser, title: 'Protect browser',
                        on_switch: this.switch_all_browser, icon: 'protect' }),
                    is_plus && this.state.protect_pc &&
                    _react2.default.createElement(Rule_item, { rule: protect_pc, title: 'Protect entire PC',
                        on_switch: this.switch_protect_pc, icon: 'protect' }),
                    _react2.default.createElement('li', { className: 'sub-section' },
                    _react2.default.createElement('h3', { className: 'title' }, _react2.default.createElement(T, null, 'Sites')),
                    !!rules.length &&
                    _react2.default.createElement('ul', null, rules.map(this.render_rule)),
                    _react2.default.createElement('a', { className: 'popular-btn', target: '_blank',
                        rel: 'noopener noreferrer', href: popular_url },
                    _react2.default.createElement(T, null, 'Unblock more sites...')))));




                } }]);return Unblock;}(_page_lib.PureComponent);var


        Popups = function (_PureComponent4) {_inherits(Popups, _PureComponent4);function Popups() {var _ref8;var _temp4, _this6, _ret4;_classCallCheck(this, Popups);for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {args[_key4] = arguments[_key4];}return _ret4 = (_temp4 = (_this6 = _possibleConstructorReturn(this, (_ref8 = Popups.__proto__ || Object.getPrototypeOf(Popups)).call.apply(_ref8, [this].concat(args))), _this6), _this6.
                state = { rules: [] }, _this6.








                update_rules = function () {
                    var _this = _this6;
                    (0, _etask2.default)(regeneratorRuntime.mark(function _callee9() {var all_sites, rules;return regeneratorRuntime.wrap(function _callee9$(_context9) {while (1) {switch (_context9.prev = _context9.next) {case 0:
                                        all_sites = false;_context9.next = 3;return (
                                            be_info.ecall('get_dont_show_rules',
                                            ['default']));case 3:rules = _context9.sent;
                                        if (rules.includes('all'))
                                        {
                                            all_sites = true;
                                            rules = rules.filter(function (r) {return r != 'all';});
                                        }
                                        _this.setState({ rules: rules, all_sites: all_sites });case 6:case 'end':return _context9.stop();}}}, _callee9, this);}));

                }, _this6.
                on_change = function (enable) {
                    be_info.ecall('set_dont_show_again', [{ root_url: 'all',
                        period: 'default', type: 'default', src: 'settings',
                        unset: !enable }]);
                }, _this6.
                on_remove = function (_ref9) {var name = _ref9.name;
                    be_info.ecall('set_dont_show_again', [{ root_url: name, type: 'default',
                        unset: true }]);
                }, _this6.
                render_rule = function (root_url) {
                    var href = 'http://' + root_url;
                    return _react2.default.createElement(Rule_item, { rule: { name: root_url }, href: href,
                        on_remove: _this6.on_remove, cls: 'rule-item-popups' });
                }, _temp4), _possibleConstructorReturn(_this6, _ret4);}_createClass(Popups, [{ key: 'componentDidMount', value: function componentDidMount() {be_info.on('change:settings', this.update_rules);this.update_rules();} }, { key: 'componentWillUnmount', value: function componentWillUnmount() {_get(Popups.prototype.__proto__ || Object.getPrototypeOf(Popups.prototype), 'componentWillUnmount', this).call(this);be_info.off('change:settings', this.update_rules);} }, { key: 'render', value: function render()
                {var _state2 =
                    this.state,rules = _state2.rules,all_sites = _state2.all_sites;
                    return _react2.default.createElement(_page_lib.Section, { title: T('Popups') },
                    _react2.default.createElement('ul', null,
                    _react2.default.createElement('li', { className: 'settings-item' },
                    _react2.default.createElement(T, null, 'Don\'t show popup for any site'),
                    _react2.default.createElement(Switch, { checked: all_sites, on_change: this.on_change })),

                    _react2.default.createElement('li', { className: 'sub-section' },
                    _react2.default.createElement('h3', { className: 'title' }, _react2.default.createElement(T, null, 'Sites')),
                    !!rules.length &&
                    _react2.default.createElement('ul', null, rules.map(this.render_rule)))));



                } }]);return Popups;}(_page_lib.PureComponent);var


        Peer = function (_React$Component2) {_inherits(Peer, _React$Component2);function Peer() {var _ref10;var _temp5, _this7, _ret5;_classCallCheck(this, Peer);for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {args[_key5] = arguments[_key5];}return _ret5 = (_temp5 = (_this7 = _possibleConstructorReturn(this, (_ref10 = Peer.__proto__ || Object.getPrototypeOf(Peer)).call.apply(_ref10, [this].concat(args))), _this7), _this7.
                state = { checked: true }, _this7.
                on_change = function () {
                    var _this = _this7;
                    (0, _etask2.default)(regeneratorRuntime.mark(function _callee10() {return regeneratorRuntime.wrap(function _callee10$(_context10) {while (1) {switch (_context10.prev = _context10.next) {case 0:
                                        _this.setState({ checked: false });_context10.next = 3;return (
                                            _etask2.default.sleep(100));case 3:
                                        _this.setState({ checked: true, modal: true });case 4:case 'end':return _context10.stop();}}}, _callee10, this);}));

                }, _this7.
                on_close_modal = function () {return _this7.setState({ modal: false });}, _temp5), _possibleConstructorReturn(_this7, _ret5);}_createClass(Peer, [{ key: 'render_modal', value: function render_modal()
                {
                    var plus_url = _util4.default.plus_ref('p2p_settings');
                    var get_plus = _react2.default.createElement('a', { className: 'upgrade-btn', href: plus_url,
                        target: '_blank', rel: 'noopener noreferrer' },
                    _react2.default.createElement(T, null, 'Upgrade to'), _react2.default.createElement('i', { className: 'icon-plus' }));

                    return _react2.default.createElement(_page_lib.Modal, { title: T('Upgrade to'), action: get_plus,
                        on_close: this.on_close_modal }, 'Upgrade to PLUS to stop sharing idle resources');


                } }, { key: 'render', value: function render()
                {var
                    is_plus = this.props.is_plus;
                    return _react2.default.createElement(_page_lib.Section, { title: T('Peer to peer') },
                    _react2.default.createElement('ul', null,
                    _react2.default.createElement('li', { className: 'settings-item' },
                    is_plus && _react2.default.createElement(T, null, 'Never share idle resources'),
                    !is_plus && _react2.default.createElement(T, null, 'Allow to be a peer and share resources'),
                    !is_plus && _react2.default.createElement(Switch, { checked: this.state.checked,
                        on_change: this.on_change }))),


                    this.state.modal && this.render_modal());

                } }]);return Peer;}(_react2.default.Component);var


        Legal = function (_PureComponent5) {_inherits(Legal, _PureComponent5);function Legal() {var _ref11;var _temp6, _this8, _ret6;_classCallCheck(this, Legal);for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {args[_key6] = arguments[_key6];}return _ret6 = (_temp6 = (_this8 = _possibleConstructorReturn(this, (_ref11 = Legal.__proto__ || Object.getPrototypeOf(Legal)).call.apply(_ref11, [this].concat(args))), _this8), _this8.



                show_privacy = function (e) {
                    e.preventDefault();
                    _this8.setState({ modal: true });
                }, _this8.
                hide_privacy = function () {return _this8.setState({ modal: false });}, _this8.
                on_change = function () {
                    var agree_ts = _this8.state.agree_ts ? '' : Date.now();
                    _this8.setState({ agree_ts: agree_ts });
                    window.be_bg_main.ecall('set_agree_ts', [agree_ts]);
                }, _temp6), _possibleConstructorReturn(_this8, _ret6);}_createClass(Legal, [{ key: 'componentDidMount', value: function componentDidMount() {this.model_to_state(window.be_bg_main, 'agree_ts');} }, { key: 'render_modal', value: function render_modal()
                {
                    return _react2.default.createElement(_page_lib.Modal, { className: 'page-modal-legal', title: _privacy2.default.title,
                        on_close: this.hide_privacy },
                    _react2.default.createElement(_privacy2.default.Text, null));

                } }, { key: 'render', value: function render()
                {
                    return _react2.default.createElement(_page_lib.Section, { title: T('Legal'), cls: 'section-legal' },
                    _react2.default.createElement('ul', null,
                    _react2.default.createElement('li', { className: 'settings-item' },
                    _react2.default.createElement(Label_checkbox, { onChange: this.on_change,
                        checked: !!this.state.agree_ts }, 'I agree that Hola can use my personal information as described in the ',

                    ' ',
                    _react2.default.createElement('a', { href: '', onClick: this.show_privacy,
                        onMouseDown: function onMouseDown(e) {return e.preventDefault();} }, _privacy2.default.title)))),



                    this.state.modal && this.render_modal());

                } }]);return Legal;}(_page_lib.PureComponent);var


        Settings = function (_PureComponent6) {_inherits(Settings, _PureComponent6);function Settings() {_classCallCheck(this, Settings);return _possibleConstructorReturn(this, (Settings.__proto__ || Object.getPrototypeOf(Settings)).apply(this, arguments));}_createClass(Settings, [{ key: 'componentDidMount', value: function componentDidMount()
                {
                    perr('settings_show');
                    this.model_to_state(be_premium, 'user');
                    this.model_to_state(be_ext, 'is_premium', 'is_plus');
                    this.model_to_state(be_info, 'country');
                    this.model_to_state(be_svc, 'version');
                    be_svc.fcall('update_info');
                } }, { key: 'render', value: function render()
                {var
                    state = this.state;
                    var user_info = { user: state.user, is_plus: state.is_plus };
                    return (
                        _react2.default.createElement(_page_lib.Page_layout, _extends({}, user_info, { title: T('Settings'), cls: 'settings' }),
                        _react2.default.createElement(Report_problem, null),
                        state.user && _react2.default.createElement(Account_details, user_info),
                        _react2.default.createElement(Unblock, { country: state.country, is_plus: state.is_plus }),
                        _react2.default.createElement(Popups, null),
                        !!state.version && _react2.default.createElement(Peer, { is_plus: state.is_plus }),
                        !!_conf2.default.check_agree_ts && _react2.default.createElement(Legal, null),
                        _react2.default.createElement(_page_lib.Legal_section, null,
                        _react2.default.createElement(Link_line, { href: 'about.html' },
                        _react2.default.createElement(T, null, 'About')))));




                } }]);return Settings;}(_page_lib.PureComponent);


        var uninit = function uninit() {
            _browser2.default.backbone.client.stop('be_bg_main');
            _browser2.default.backbone.client.stop('be_ext');
            _browser2.default.backbone.client.stop('be_rule');
            _browser2.default.backbone.client.stop('be_premium');
            _browser2.default.backbone.client.stop('be_vpn');
            _browser2.default.backbone.client.stop('be_svc');
            _browser2.default.backbone.client.stop('be_info');
            _browser2.default.backbone.client.stop('be_bg_ajax');
        };

        var init = exports.init = function init() {
            (0, _jquery2.default)(window).on('unload', uninit);
            _browser2.default.init({ context: null });
            window.be_bg_main = _browser2.default.backbone.client.start('be_bg_main');
            be_ext = _browser2.default.backbone.client.start('be_ext');
            be_rule = _browser2.default.backbone.client.start('be_rule');
            be_premium = _browser2.default.backbone.client.start('be_premium');
            be_vpn = _browser2.default.backbone.client.start('be_vpn');
            be_svc = _browser2.default.backbone.client.start('be_svc');
            be_info = _browser2.default.backbone.client.start('be_info');
            be_bg_ajax = _browser2.default.backbone.client.start('be_bg_ajax');
            _reactDom2.default.render(_react2.default.createElement(Settings, null), (0, _jquery2.default)('.react-root')[0]);
        };});})();
//# sourceMappingURL=settings.js.map
