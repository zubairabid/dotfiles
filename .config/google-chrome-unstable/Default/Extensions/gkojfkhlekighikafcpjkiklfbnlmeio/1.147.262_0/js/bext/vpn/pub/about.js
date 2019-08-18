// LICENSE_CODE ZON
;(function () {
    'use strict'; define(['exports', 'react', 'react-dom', '/bext/vpn/pub/page_lib.js', 'classnames', '/bext/vpn/pub/ui_lib.js', '/bext/pub/util.js', '/bext/pub/browser.js', '/util/url.js', '/bext/pub/lib.js', 'regenerator-runtime'], function (exports, _react, _reactDom, _page_lib, _classnames, _ui_lib, _util, _browser, _url, _lib) {Object.defineProperty(exports, "__esModule", { value: true });exports.init = undefined;var _react2 = _interopRequireDefault(_react);var _reactDom2 = _interopRequireDefault(_reactDom);var _classnames2 = _interopRequireDefault(_classnames);var _ui_lib2 = _interopRequireDefault(_ui_lib);var _util2 = _interopRequireDefault(_util);var _browser2 = _interopRequireDefault(_browser);var _url2 = _interopRequireDefault(_url);var _lib2 = _interopRequireDefault(_lib);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}












        var T = _ui_lib2.default.T;
        var RMT = void 0,be_ext = void 0,be_premium = void 0;

        var REPORT_HASH = '#report_issue';var
        Report_problem = function (_React$Component) {_inherits(Report_problem, _React$Component);function Report_problem() {var _ref;var _temp, _this, _ret;_classCallCheck(this, Report_problem);for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {args[_key] = arguments[_key];}return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Report_problem.__proto__ || Object.getPrototypeOf(Report_problem)).call.apply(_ref, [this].concat(args))), _this), _this.
                state = { valid_email: true }, _this.
                on_hash_change = function () {
                    var old_modal = !!_this.state.modal;
                    var modal = window.location.hash == REPORT_HASH;
                    _this.setState({ modal: modal });
                    if (old_modal != modal && modal)
                    {
                        _lib2.default.perr_err({ id: 'be_report_problem', info: { perr: 1 },
                            rate_limit: { count: 1 } });
                    }
                }, _this.









                hide_modal = function () {
                    window.location.hash = '';
                }, _this.
                verify_email = function () {var _this$state$email =
                    _this.state.email,email = _this$state$email === undefined ? '' : _this$state$email;
                    _this.setState({ valid_email: _url2.default.is_valid_email(email) });
                }, _this.



                send_report = function () {var _this$state =
                    _this.state,email = _this$state.email,subj = _this$state.subj,desc = _this$state.desc,url = _this$state.url;
                    var info = { email: email, subj: subj, desc: desc, url: url };
                    var be_bg_main = void 0;
                    if (be_bg_main = window.be_bg_main)
                    {
                        try {info.bg_log = be_bg_main.get_log(be_ext.get('is_premium'));}
                        catch (e) {info.bg_log_err = e;}
                    }
                    _lib2.default.perr_ok({ id: 'be_issue_report', info: info });
                    _this.hide_modal();
                    _this.setState({ email: '', subj: '', desc: '', url: '' });
                }, _temp), _possibleConstructorReturn(_this, _ret);}_createClass(Report_problem, [{ key: 'componentDidMount', value: function componentDidMount() {window.addEventListener('hashchange', this.on_hash_change, false);this.on_hash_change();var qs = _url2.default.qs_parse(window.location.search.replace(/^\?/, ''));this.setState({ url: qs.url, subj: qs.subj });} }, { key: 'componentWillUnmount', value: function componentWillUnmount() {window.removeEventListener('hashchange', this.on_hash_change);} }, { key: 'on_change', value: function on_change(key, ev) {this.setState(_defineProperty({}, key, ev.target.value));} }, { key: 'render_modal', value: function render_modal()
                {var _state =
                    this.state,valid_email = _state.valid_email,email = _state.email,subj = _state.subj;
                    var send_report = _react2.default.createElement('a', { className: 'send-report-btn',
                        onClick: this.send_report }, _react2.default.createElement(T, null, 'Send'));
                    return _react2.default.createElement(_page_lib.Modal, { title: T('Report a problem'), on_close: this.hide_modal,
                        action: send_report },
                    _react2.default.createElement('div', { className: (0, _classnames2.default)('form-group',
                        { 'has-error': !valid_email }) },
                    _react2.default.createElement('input', { type: 'text', placeholder: 'Your e-mail',
                        className: 'form-control', onBlur: this.verify_email,
                        value: email, onChange: this.on_change.bind(this, 'email') }),
                    !valid_email &&
                    _react2.default.createElement('span', { className: 'help-block' }, 'Please enter a valid email.')),

                    _react2.default.createElement('div', { className: 'form-group' },
                    _react2.default.createElement('input', { type: 'text', placeholder: 'Subject', className: 'form-control',
                        value: subj, onChange: this.on_change.bind(this, 'subj') })),

                    _react2.default.createElement('div', { className: 'form-group' },
                    _react2.default.createElement('textarea', { placeholder: 'Description', rows: '10',
                        className: 'form-control',
                        onChange: this.on_change.bind(this, 'desc') })));


                } }, { key: 'render', value: function render()
                {
                    return _react2.default.createElement('div', { className: 'section report-problem' },
                    _react2.default.createElement('a', { className: 'title', href: '#report_issue' },
                    _react2.default.createElement(T, null, 'Report a problem')),

                    this.state.modal && this.render_modal());

                } }]);return Report_problem;}(_react2.default.Component);var


        About_details = function (_PureComponent) {_inherits(About_details, _PureComponent);

            function About_details(props) {_classCallCheck(this, About_details);var _this2 = _possibleConstructorReturn(this, (About_details.__proto__ || Object.getPrototypeOf(About_details)).call(this,
                props));_this2.state = {};_this2.






                on_title_click = function () {
                    var now = Date.now();
                    if (!_this2.dev_mode_first_ts || now - _this2.dev_mode_first_ts > 5000)
                    {
                        _this2.dev_mode_first_ts = now;
                        _this2.dev_mode_counter = 0;
                    }
                    _this2.dev_mode_counter++;
                    if (_this2.dev_mode_counter != 5)
                    return;
                    _this2.dev_mode_counter = 0;
                    _this2.dev_mode_first_ts = 0;
                    var mode = !RMT.be_dev_mode.get('dev_mode');
                    RMT.be_dev_mode.fcall('enable', [mode]);
                };_this2.
                send_email = function (e) {
                    _lib2.default.perr_err({ id: 'be_report_problem',
                        info: { email: 1 }, rate_limit: { count: 1 } });
                    return;
                };_this2.dev_mode_counter = 0;_this2.dev_mode_first_ts = 0;return _this2;}_createClass(About_details, [{ key: 'componentDidMount', value: function componentDidMount() {this.model_to_state(RMT.be_dev_mode, 'dev_mode');} }, { key: 'render', value: function render()
                {
                    var lines = [];
                    var mailto_val = _util2.default.problem_mailto_url(function (s, val) {return (
                            lines.push({ key: s.trim(), value: val }));});
                    return _react2.default.createElement(_page_lib.Section, { title: T('About Hola'), on_click: this.on_title_click },
                    lines.map(function (line) {return _react2.default.createElement(_page_lib.Label_line, { key: line.key, label: T(line.key) },
                        line.value);}),

                    _react2.default.createElement(_page_lib.Label_line, null, 'Send email to ',
                    _react2.default.createElement(_ui_lib2.default.Link_mailto, { on_click: this.send_email,
                        body: mailto_val })),

                    this.state.dev_mode && _react2.default.createElement(_page_lib.Label_line, null, 'Dev mode'));

                } }]);return About_details;}(_page_lib.PureComponent);var


        About_layout = function (_PureComponent2) {_inherits(About_layout, _PureComponent2);function About_layout() {_classCallCheck(this, About_layout);return _possibleConstructorReturn(this, (About_layout.__proto__ || Object.getPrototypeOf(About_layout)).apply(this, arguments));}_createClass(About_layout, [{ key: 'componentDidMount', value: function componentDidMount()
                {
                    this.model_to_state(be_premium, 'user');
                    this.model_to_state(be_ext, 'is_premium', 'is_plus');
                } }, { key: 'render', value: function render()
                {var
                    state = this.state;
                    var user_info = { user: state.user, is_plus: state.is_plus };
                    return (
                        _react2.default.createElement(_page_lib.Page_layout, _extends({}, user_info, { title: T('About'), cls: 'about' }),
                        _react2.default.createElement(Report_problem, null),
                        _react2.default.createElement(About_details, null),
                        _react2.default.createElement(_page_lib.Legal_section, null)));


                } }]);return About_layout;}(_page_lib.PureComponent);


        var uninit = function uninit() {
            _browser2.default.backbone.client.stop('be_bg_main');
            _browser2.default.backbone.client.stop('be_ext');
            _browser2.default.backbone.client.stop('be_premium');
        };

        var init = exports.init = function init() {
            window.addEventListener('unload', uninit);
            _browser2.default.init({ context: null });
            RMT = window.be_bg_main = _browser2.default.backbone.client.start('be_bg_main');
            be_ext = _browser2.default.backbone.client.start('be_ext');
            be_premium = _browser2.default.backbone.client.start('be_premium');
            _reactDom2.default.render(_react2.default.createElement(About_layout, null), document.querySelector('.react-root'));
        };});})();
//# sourceMappingURL=about.js.map
