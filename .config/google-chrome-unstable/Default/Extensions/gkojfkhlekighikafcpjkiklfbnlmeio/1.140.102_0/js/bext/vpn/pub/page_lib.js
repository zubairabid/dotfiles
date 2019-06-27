// LICENSE_CODE ZON
;(function () {
    'use strict'; define(['exports', 'react', 'react-dom', 'classnames', '/bext/vpn/pub/ui_lib.js', '/bext/vpn/pub/util.js', 'regenerator-runtime'], function (exports, _react, _reactDom, _classnames, _ui_lib, _util) {Object.defineProperty(exports, "__esModule", { value: true });exports.Modal = exports.PureComponent = exports.Page_layout = undefined;exports.
















































        Section = Section;exports.








        Label_line = Label_line;exports.






























































        Legal_section = Legal_section;var _react2 = _interopRequireDefault(_react);var _reactDom2 = _interopRequireDefault(_reactDom);var _classnames2 = _interopRequireDefault(_classnames);var _ui_lib2 = _interopRequireDefault(_ui_lib);var _util2 = _interopRequireDefault(_util);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}var _slicedToArray = function () {function sliceIterator(arr, i) {var _arr = [];var _n = true;var _d = false;var _e = undefined;try {for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i["return"]) _i["return"]();} finally {if (_d) throw _e;}}return _arr;}return function (arr, i) {if (Array.isArray(arr)) {return arr;} else if (Symbol.iterator in Object(arr)) {return sliceIterator(arr, i);} else {throw new TypeError("Invalid attempt to destructure non-iterable instance");}};}();function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}var T = _ui_lib2.default.T;var Header = function Header(props) {var logo_url = 'https://hola.org?utm_source=holaext&utm_content=settings';var cp_url = 'https://hola.org/cp?utm_source=holaext&utm_content=settings';var login_url = 'https://hola.org/signin?utm_source=holaext&utm_content=settings';var upgrade_url = _util2.default.plus_ref('ext_settings_upgrade');var logo_cls = 'logo ' + (props.is_plus ? 'logo-plus' : 'logo-free');return _react2.default.createElement('div', { className: 'header' }, _react2.default.createElement('a', { className: logo_cls, target: '_blank', rel: 'noopener noreferrer', href: logo_url }), _react2.default.createElement('div', { className: 'title' }, props.title), !props.is_plus && _react2.default.createElement('div', { className: 'upgrade-btn' }, _react2.default.createElement('a', { target: '_blank', rel: 'noopener noreferrer', href: upgrade_url }, _react2.default.createElement(T, null, 'Upgrade to'))), props.user && _react2.default.createElement('a', { className: 'user-name', target: '_blank', rel: 'noopener noreferrer', href: cp_url }, props.user.displayName), !props.user && _react2.default.createElement('a', { className: 'login-btn', target: '_blank', rel: 'noopener noreferrer', href: login_url }, 'Sign in'));};var Page_layout = exports.Page_layout = function (_React$Component) {_inherits(Page_layout, _React$Component);function Page_layout() {_classCallCheck(this, Page_layout);return _possibleConstructorReturn(this, (Page_layout.__proto__ || Object.getPrototypeOf(Page_layout)).apply(this, arguments));}_createClass(Page_layout, [{ key: 'render', value: function render() {var _props = this.props,user = _props.user,is_plus = _props.is_plus,title = _props.title;return _react2.default.createElement('div', { className: (0, _classnames2.default)('page-layout', this.props.cls) }, _react2.default.createElement(Header, { user: user, is_plus: is_plus, title: title }), _react2.default.createElement('div', { className: 'content' }, this.props.children));} }]);return Page_layout;}(_react2.default.Component);function Section(props) {return _react2.default.createElement('div', { className: (0, _classnames2.default)('section', props.cls) }, _react2.default.createElement('div', { className: 'title', onClick: props.on_click }, props.title), _react2.default.createElement('div', { className: 'card' }, props.children));}function Label_line(props) {return _react2.default.createElement('label', { className: 'label-line' }, props.label && _react2.default.createElement('div', { className: 'label-line-label' }, props.label), _react2.default.createElement('div', { className: 'label-line-children' }, props.children));}var PureComponent = exports.PureComponent = function (_React$Component2) {_inherits(PureComponent, _React$Component2);function PureComponent(props) {_classCallCheck(this, PureComponent);var _this2 = _possibleConstructorReturn(this, (PureComponent.__proto__ || Object.getPrototypeOf(PureComponent)).call(this, props));_this2._mts_events = {};_this2.state = {};return _this2;}_createClass(PureComponent, [{ key: '_model_to_state', value: function _model_to_state(model, key, key_state) {var _this3 = this;var ev_name = 'change:' + key;var entry = this._mts_events[ev_name] = { model: model, fn: function fn() {return _this3.setState(_defineProperty({}, key_state || key, model.get(key)));} };model.on(ev_name, entry.fn);this.setState(_defineProperty({}, key_state || key, model.get(key)));} }, { key: 'model_to_state', value: function model_to_state(model, key, key_state) {var _this4 = this;if (Array.isArray(key)) return key.forEach(function (k) {return _this4._model_to_state(model, k);});this._model_to_state(model, key, key_state);} }, { key: 'componentWillUnmount', value: function componentWillUnmount() {Object.entries(this._mts_events).forEach(function (_ref) {var _ref2 = _slicedToArray(_ref, 2),ev_name = _ref2[0],_ref2$ = _ref2[1],model = _ref2$.model,fn = _ref2$.fn;return model.off(ev_name, fn);});} }]);return PureComponent;}(_react2.default.Component);var Modal = exports.Modal = function (_React$Component3) {_inherits(Modal, _React$Component3);function Modal(props) {_classCallCheck(this, Modal);var _this5 = _possibleConstructorReturn(this, (Modal.__proto__ || Object.getPrototypeOf(Modal)).call(this, props));_this5.el = document.createElement('div');_this5.el.classList.add('page-layout');return _this5;}_createClass(Modal, [{ key: 'componentDidMount', value: function componentDidMount() {document.body.appendChild(this.el);} }, { key: 'componentWillUnmount', value: function componentWillUnmount() {document.body.removeChild(this.el);} }, { key: 'render', value: function render() {return _reactDom2.default.createPortal(_react2.default.createElement('div', { className: (0, _classnames2.default)('page-modal', this.props.className) }, _react2.default.createElement('div', { className: 'page-modal-body' }, _react2.default.createElement('div', { className: 'page-modal-title' }, _react2.default.createElement('h3', null, this.props.title), _react2.default.createElement('div', { className: 'icon-remove', title: T('Close'), onClick: this.props.on_close })), _react2.default.createElement('div', { className: 'page-modal-content' }, this.props.children), this.props.action && _react2.default.createElement('div', { className: 'page-modal-actions' }, this.props.action))), this.el);} }]);return Modal;}(_react2.default.Component);function Legal_section(props) {
            return _react2.default.createElement(Section, { title: T('Legal') },
            _react2.default.createElement(Label_line, { label: T('Privacy Policy') },
            _react2.default.createElement('a', { href: 'https://hola.org/legal/privacy' }, 'https://hola.org/legal/privacy')),



            _react2.default.createElement(Label_line, { label: T('End User License') },
            _react2.default.createElement('a', { href: 'https://hola.org/legal/sla' }, 'https://hola.org/legal/sla')),



            props.children);

        }});})();
//# sourceMappingURL=page_lib.js.map
