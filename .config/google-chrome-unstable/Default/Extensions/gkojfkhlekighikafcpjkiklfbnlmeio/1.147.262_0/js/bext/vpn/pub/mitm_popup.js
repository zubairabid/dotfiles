// LICENSE_CODE ZON
;(function () {
    'use strict'; define(['exports', 'jquery', 'react', 'react-dom', '/bext/pub/browser.js', '/util/util.js', '/util/etask.js', '/svc/vpn/pub/util.js', '/bext/pub/util.js', '/bext/vpn/pub/watermark.js', '/bext/pub/popup_lib.js', 'regenerator-runtime'], function (exports, _jquery, _react, _reactDom, _browser, _util, _etask, _util3, _util5, _watermark, _popup_lib) {Object.defineProperty(exports, "__esModule", { value: true });var _jquery2 = _interopRequireDefault(_jquery);var _react2 = _interopRequireDefault(_react);var _reactDom2 = _interopRequireDefault(_reactDom);var _browser2 = _interopRequireDefault(_browser);var _util2 = _interopRequireDefault(_util);var _etask2 = _interopRequireDefault(_etask);var _util4 = _interopRequireDefault(_util3);var _util6 = _interopRequireDefault(_util5);var _watermark2 = _interopRequireDefault(_watermark);var _popup_lib2 = _interopRequireDefault(_popup_lib);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}var _get = function get(object, property, receiver) {if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {var parent = Object.getPrototypeOf(object);if (parent === null) {return undefined;} else {return get(parent, property, receiver);}} else if ("value" in desc) {return desc.value;} else {var getter = desc.get;if (getter === undefined) {return undefined;}return getter.call(receiver);}};function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}











        var E = {};
        var assign = Object.assign;
        var be_ui_popup_ext = void 0,be_popup_main = void 0,be_vpn = void 0,be_info = void 0,be_ext = void 0;

        _browser2.default.assert_popup('be_mitm_popup');

        var get_url = function get_url() {return _util2.default.get(window, 'hola.tpopup_opt.url');};
        var get_tab_id = function get_tab_id() {return _util2.default.get(window, 'hola.tpopup_opt.tab_id');};
        var get_root_url = function get_root_url() {return _util4.default.get_root_url(get_url());};

        function skip_watermark() {
            var root_url = get_root_url();
            return _util6.default.is_google(root_url) || _util6.default.is_youtube(root_url);
        }

        var perr = function perr(id, info) {
            info = assign({ url: get_url() }, info);
            _popup_lib2.default.perr_ok({ id: id, info: info }, true);
        };

        var WATERMARK = 'watermark',SUGGESTION = 'suggestion';
        var SUBSCRIBE = 'subscribe';var
        Mitm_suggestion = function (_React$Component) {_inherits(Mitm_suggestion, _React$Component);
            function Mitm_suggestion(props) {_classCallCheck(this, Mitm_suggestion);var _this2 = _possibleConstructorReturn(this, (Mitm_suggestion.__proto__ || Object.getPrototypeOf(Mitm_suggestion)).call(this,
                props));_this2.








                close_click = function () {
                    perr('mitm_popup_suggestion_close');
                    _this2.ignore();
                };_this2.
                no_click = function () {
                    perr('mitm_popup_suggestion_no');
                    _this2.ignore();
                };_this2.
                yes_click = function () {
                    perr('mitm_popup_suggestion_yes');
                    be_vpn.fcall('mitm_set_unblock', [get_url()]);
                    _this2.props.close_cb();
                };var width = 550,height = 370;_this2.props.size_cb({ width: width + 8, height: height + 8, center: true, fade: true }, { width: width, height: height });return _this2;}_createClass(Mitm_suggestion, [{ key: 'ignore', value: function ignore() {be_vpn.fcall('mitm_set_ignore', [get_url(), get_tab_id()]);this.props.close_cb({ close_tpopup: true });} }, { key: 'render', value: function render()
                {
                    return (
                        _react2.default.createElement(_watermark2.default.Wrap, null,
                        _react2.default.createElement(_watermark2.default.Modal_header, { close_click: this.close_click }),
                        _react2.default.createElement(_watermark2.default.Suggestion_body, { is_mitm: true,
                            yes_click: this.yes_click,
                            no_click: this.no_click })));


                } }]);return Mitm_suggestion;}(_react2.default.Component);var


        Mitm_popup = function (_watermark$Popup_base) {_inherits(Mitm_popup, _watermark$Popup_base);function Mitm_popup() {var _ref;var _temp, _this3, _ret;_classCallCheck(this, Mitm_popup);for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {args[_key] = arguments[_key];}return _ret = (_temp = (_this3 = _possibleConstructorReturn(this, (_ref = Mitm_popup.__proto__ || Object.getPrototypeOf(Mitm_popup)).call.apply(_ref, [this].concat(args))), _this3), _this3.






















                on_body_click = function () {
                    if (_this3.state.mode == SUBSCRIBE)
                    _this3.close_cb();
                }, _this3.
                close_cb = function (opt) {
                    if (_this3.state.is_plus || skip_watermark() || opt && opt.close_tpopup)
                    return void _this3.props.on_close();var
                    mode = _this3.state.mode;
                    if (mode == SUGGESTION || mode == SUBSCRIBE)
                    _this3.set_mode(WATERMARK);else
                    if (mode == WATERMARK)
                    _this3.set_mode(SUBSCRIBE);
                }, _temp), _possibleConstructorReturn(_this3, _ret);}_createClass(Mitm_popup, [{ key: 'componentDidMount', value: function componentDidMount() {_get(Mitm_popup.prototype.__proto__ || Object.getPrototypeOf(Mitm_popup.prototype), 'componentDidMount', this).call(this);var _this = this;this.on_manual_unblock = function () {return (0, _etask2.default)(regeneratorRuntime.mark(function _callee() {var enabled;return regeneratorRuntime.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:_context.next = 2;return be_vpn.ecall('is_mitm_active_manual', [get_tab_id()]);case 2:enabled = _context.sent;if (_this.state.mode == SUGGESTION && enabled) _this.close_cb();case 4:case 'end':return _context.stop();}}}, _callee, this);}));};be_vpn.on('mitm_manual_unblock', this.on_manual_unblock);be_ui_popup_ext.on('body_click', this.on_body_click);} }, { key: 'componentWillUnmount', value: function componentWillUnmount() {_get(Mitm_popup.prototype.__proto__ || Object.getPrototypeOf(Mitm_popup.prototype), 'componentWillUnmount', this).call(this);be_vpn.off('mitm_manual_unblock', this.on_manual_unblock);be_ui_popup_ext.off('body_click', this.on_body_click);} }, { key: 'componentDidUpdate', value: function componentDidUpdate(prev_props, prev_state) {_get(Mitm_popup.prototype.__proto__ || Object.getPrototypeOf(Mitm_popup.prototype), 'componentDidUpdate', this).call(this, prev_props, prev_state);if (this.state.is_plus && this.state.mode == SUBSCRIBE) this.props.on_close();} }, { key: 'render_inner', value: function render_inner()
                {var
                    state = this.state;
                    return state.mode == WATERMARK ?
                    _react2.default.createElement(_watermark2.default.Watermark, { is_mitm: true,
                        position: state.position,
                        position_cb: this.position_cb,
                        close_cb: this.close_cb,
                        show_vpn_ui_cb: this.show_vpn_ui_cb,
                        size_cb: this.size_cb }) :
                    state.mode == SUBSCRIBE ?
                    _react2.default.createElement(_watermark2.default.Subscribe, { close_cb: this.close_cb,
                        is_mitm: true, size_cb: this.size_cb }) :
                    _react2.default.createElement(Mitm_suggestion, { close_cb: this.close_cb,
                        size_cb: this.size_cb });
                } }]);return Mitm_popup;}(_watermark2.default.Popup_base);


        var inited = void 0;
        E.init = function (ui_popup) {
            if (inited)
            return;
            inited = true;
            be_ui_popup_ext = ui_popup;
            be_popup_main = ui_popup.be_popup_main;
            be_vpn = ui_popup.be_vpn;
            be_info = ui_popup.be_info;
            be_ext = ui_popup.be_ext;
            _watermark2.default.init(ui_popup);
        };

        E.render = function () {return (0, _etask2.default)(regeneratorRuntime.mark(function _callee2() {var enabled, default_pos, position, el, unmount, on_close, on_show_vpn_ui;return regeneratorRuntime.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:_context2.next = 2;return (
                                    be_vpn.ecall('is_mitm_active_manual', [get_tab_id()]));case 2:enabled = _context2.sent;if (!(
                                enabled && skip_watermark())) {_context2.next = 6;break;}

                                perr('mitm_watermark_skip');return _context2.abrupt('return');case 6:


                                default_pos = _util2.default.get(be_ext.get('bext_config'),
                                'geo_popup.watermark.position', 'top_right');_context2.next = 9;return (
                                    be_info.ecall('get_site_storage', [get_root_url(),
                                    'watermark_pos', default_pos]));case 9:position = _context2.sent;
                                (0, _jquery2.default)('html').css({ width: '100%', height: '100%', maxWidth: '100%',
                                    maxHeight: '100%' });
                                (0, _jquery2.default)('body').css({ animation: 'none' });
                                el = (0, _jquery2.default)('<div class=mitm-popup-root/>').appendTo((0, _jquery2.default)('body'));
                                unmount = function unmount() {
                                    _reactDom2.default.unmountComponentAtNode(el[0]);
                                    el.remove();
                                };
                                on_close = function on_close() {
                                    unmount();
                                    be_popup_main.close_tpopup();
                                };
                                on_show_vpn_ui = function on_show_vpn_ui() {
                                    unmount();
                                    (0, _jquery2.default)('#all').attr('style', '');
                                    (0, _jquery2.default)('#all').attr('class', '');
                                    be_ui_popup_ext.set_tpopup_type(null);
                                };
                                _reactDom2.default.render(_react2.default.createElement(Mitm_popup, {
                                    on_close: on_close,
                                    on_show_vpn_ui: on_show_vpn_ui,
                                    position: position,
                                    mode: enabled ? WATERMARK : SUGGESTION }), el[0]);case 17:case 'end':return _context2.stop();}}}, _callee2, this);}));};exports.default =


        E;});})();
//# sourceMappingURL=mitm_popup.js.map
