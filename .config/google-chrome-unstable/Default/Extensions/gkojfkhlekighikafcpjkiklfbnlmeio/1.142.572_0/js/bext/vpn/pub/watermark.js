// LICENSE_CODE ZON
;(function () {
    'use strict'; define(['exports', 'jquery', 'react', 'react-dom', 'react-transition-group', '/bext/pub/browser.js', '/util/util.js', '/util/etask.js', '/util/escape.js', '/util/date.js', '/svc/vpn/pub/util.js', '/bext/pub/util.js', '/bext/vpn/pub/ui_lib.js', '/bext/pub/popup_lib.js', '/bext/vpn/pub/util.js', '/util/storage.js', '/protocol/pub/countries.js', '/svc/vpn/pub/common_ui.js', 'regenerator-runtime'], function (exports, _jquery, _react, _reactDom, _reactTransitionGroup, _browser, _util, _etask, _escape, _date, _util3, _util5, _ui_lib, _popup_lib, _util7, _storage, _countries, _common_ui) {Object.defineProperty(exports, "__esModule", { value: true });var _jquery2 = _interopRequireDefault(_jquery);var _react2 = _interopRequireDefault(_react);var _reactDom2 = _interopRequireDefault(_reactDom);var _browser2 = _interopRequireDefault(_browser);var _util2 = _interopRequireDefault(_util);var _etask2 = _interopRequireDefault(_etask);var _escape2 = _interopRequireDefault(_escape);var _date2 = _interopRequireDefault(_date);var _util4 = _interopRequireDefault(_util3);var _util6 = _interopRequireDefault(_util5);var _ui_lib2 = _interopRequireDefault(_ui_lib);var _popup_lib2 = _interopRequireDefault(_popup_lib);var _util8 = _interopRequireDefault(_util7);var _storage2 = _interopRequireDefault(_storage);var _countries2 = _interopRequireDefault(_countries);var _common_ui2 = _interopRequireDefault(_common_ui);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _toConsumableArray(arr) {if (Array.isArray(arr)) {for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];return arr2;} else {return Array.from(arr);}}var _get = function get(object, property, receiver) {if (object === null) object = Function.prototype;var desc = Object.getOwnPropertyDescriptor(object, property);if (desc === undefined) {var parent = Object.getPrototypeOf(object);if (parent === null) {return undefined;} else {return get(parent, property, receiver);}} else if ("value" in desc) {return desc.value;} else {var getter = desc.get;if (getter === undefined) {return undefined;}return getter.call(receiver);}};var _extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}


















        var E = {};
        var assign = Object.assign,T = _ui_lib2.default.T,ms = _date2.default.ms;
        var be_ui_popup_ext = void 0,be_rule = void 0,be_ext = void 0,be_vpn = void 0,be_info = void 0,be_tabs = void 0;
        var be_premium = void 0,be_trial = void 0,be_tpopup = void 0,be_popup_main = void 0;
        var browser = _util6.default.browser();

        _browser2.default.assert_popup('be_watermark_popup');

        var get_url = function get_url() {return _util2.default.get(window, 'hola.tpopup_opt.url');};
        var get_root_url = function get_root_url() {return _util4.default.get_root_url(get_url());};
        var get_tab_id = function get_tab_id() {return _util2.default.get(window, 'hola.tpopup_opt.tab_id');};
        var get_connection_id = function get_connection_id() {return (
                _util2.default.get(window, 'hola.tpopup_opt.connection_id'));};
        var is_tab_active = function is_tab_active() {return be_tabs && be_tabs.get('active.id') == get_tab_id();};
        var flag_cls = function flag_cls(c) {return 'flag ' + (c || '').toLowerCase();};

        var get_rule = function get_rule() {
            var rules = _util8.default.get_rules(be_rule.get('rules'), get_url());
            return rules && rules[0] || null;
        };

        var get_enabled_rule = function get_enabled_rule() {
            var rule = get_rule();
            if (!rule || !rule.enabled || !be_ext.get('r.vpn.on'))
            return null;
            return rule;
        };

        var _perr = function _perr(id, info) {
            var url = get_url(),root_url = get_root_url();
            info = assign({ url: url, root_url: root_url }, info);
            _popup_lib2.default.perr_ok({ id: id, info: info }, true);
        };

        var pref_perr = function pref_perr(_ref, mitm_pref) {var prefix = _ref.prefix,is_mitm = _ref.is_mitm;return function (id, info) {
                prefix = prefix || (is_mitm ? mitm_pref || 'mitm' : 'geo');
                _perr(prefix + '_' + id, info);
            };};

        var get_all_countries = function get_all_countries(src_country) {
            var root_url = get_root_url();
            return (0, _etask2.default)(regeneratorRuntime.mark(function _callee() {var all, cache, rule_ratings, popular;return regeneratorRuntime.wrap(function _callee$(_context) {while (1) {switch (_context.prev = _context.next) {case 0:
                                all = _countries2.default.proxy_countries.bext.filter(function (c) {return c != 'KP';}).
                                sort(function (a, b) {return T(a).localeCompare(T(b));});
                                cache = _storage2.default.get_json('popup_rating_cache');_context.t0 =
                                cache && root_url == cache.root_url &&
                                cache.rule_ratings;if (_context.t0) {_context.next = 7;break;}_context.next = 6;return be_rule.ecall('get_rule_ratings',
                                [{ root_url: root_url, src_country: src_country, limit: 20, vpn_only: true }]);case 6:_context.t0 = _context.sent;case 7:rule_ratings = _context.t0;
                                popular = _util8.default.get_popular_country({ host: root_url,
                                    rule_ratings: rule_ratings }).map(function (v) {return v.proxy_country;});return _context.abrupt('return',
                                popular.concat(all));case 10:case 'end':return _context.stop();}}}, _callee, this);}));

        };

        var start_trial = function start_trial(country) {
            var root_url = get_root_url();
            return (0, _etask2.default)(regeneratorRuntime.mark(function _callee2() {var trial;return regeneratorRuntime.wrap(function _callee2$(_context2) {while (1) {switch (_context2.prev = _context2.next) {case 0:_context2.prev = 0;_context2.next = 3;return (

                                    be_trial.ecall('get_trial_active', [root_url]));case 3:_context2.t0 = _context2.sent;if (_context2.t0) {_context2.next = 8;break;}_context2.next = 7;return (
                                    be_trial.ecall('set_trial', [root_url]));case 7:_context2.t0 = _context2.sent;case 8:trial = _context2.t0;_context2.next = 11;return (
                                    be_info.ecall('set_site_storage', [root_url, 'trial',
                                    { country: country, dont_show_ended: false }]));case 11:return _context2.abrupt('return',
                                trial);case 14:_context2.prev = 14;_context2.t1 = _context2['catch'](0);

                                _perr('geo_suggestion_start_trial_err', { country: country, err: _context2.t1 });throw _context2.t1;case 18:case 'end':return _context2.stop();}}}, _callee2, this, [[0, 14]]);}));



        };

        var _do_unblock = function _do_unblock(country, trial) {
            be_vpn.ecall('enable_geo_rule', [get_url(), country, get_tab_id(),
            trial && 'trial']);
            be_tpopup.fcall('resume_videos', [get_connection_id()]);
        };

        var size_synced = void 0;
        var set_iframe_pos = function set_iframe_pos(opt) {
            var _opt = {
                width: opt.width + 'px',
                height: opt.height + 'px',
                fade: !!opt.fade,
                animate: size_synced && !opt.no_animation,
                animation_time: opt.animation_time,
                no_scale_anim: opt.no_scale_anim };

            _opt.left = _opt.right = _opt.top = _opt.bottom = 'auto';
            if (opt.center)
            {
                _opt.top = _opt.left = '50%';
                _opt.transform = 'translate(-50%, -50%)';
            } else

            {
                var pos = opt.position.split('_');
                _opt[pos[0]] = (opt['margin_' + pos[0]] || 0) + 'px';
                _opt[pos[1]] = (opt['margin_' + pos[1]] || 0) + 'px';
            }
            size_synced = true;
            (0, _jquery2.default)('body').css({ 'pointer-events': 'none' });
            var on_mouse = function on_mouse() {
                document.removeEventListener('mousemove', on_mouse);
                document.removeEventListener('mouseenter', on_mouse);
                document.removeEventListener('mouseleave', on_mouse);
                (0, _jquery2.default)('body').css({ 'pointer-events': '' });
            };
            document.addEventListener('mousemove', on_mouse);
            document.addEventListener('mouseenter', on_mouse);
            document.addEventListener('mouseleave', on_mouse);
            return be_popup_main.resize_tpopup(_opt);
        };

        var set_modal_pos = function set_modal_pos(opt) {
            var css = { width: opt.width + 'px', height: opt.height + 'px' };
            css.left = css.right = css.top = css.bottom = 'auto';
            var pos = opt.position.split('_');
            css[pos[0]] = '0';
            css[pos[1]] = '0';
            (0, _jquery2.default)('#all').css(css);
        };

        E.Wrap = function (props) {return props.children;};

        var WATERMARK = 'watermark',SUGGESTION = 'suggestion';
        var SUBSCRIBE = 'subscribe',VERIFY_EMAIL = 'verify_email';

        E.Modal_header = function Modal_header(props) {
            var url = get_url();
            var login_url = 'https://hola.org/login?' + _escape2.default.qs({ next: url });
            return (
                _react2.default.createElement('div', { className: 'modal-header ' + (props.slide || '') },
                props.back_click &&
                _react2.default.createElement('button', { className: 'go-back', onClick: props.back_click },
                _react2.default.createElement('div', { className: 'icon' })),

                _react2.default.createElement('a', { className: 'logo', href: 'https://hola.org', target: '_blank',
                    rel: 'noopener noreferrer' }),
                props.show_signin &&
                _react2.default.createElement('a', { className: 'sign-in', onClick: props.login_click,
                    href: login_url, target: '_blank', rel: 'noopener noreferrer' },
                _react2.default.createElement(T, null, 'Log in')),
                props.title && _react2.default.createElement('h1', null, _react2.default.createElement(T, null, props.title)),
                _react2.default.createElement('button', { className: 'close', onClick: props.close_click })));


        };

        var get_plans = function get_plans() {
            var conf = be_ext.get('bext_config');
            return _util2.default.get(conf, 'plans', ['1m', '1y']);
        };var

        Slides_switch = function (_React$PureComponent) {_inherits(Slides_switch, _React$PureComponent);
            function Slides_switch(props) {_classCallCheck(this, Slides_switch);var _this2 = _possibleConstructorReturn(this, (Slides_switch.__proto__ || Object.getPrototypeOf(Slides_switch)).call(this,
                props));_this2.







                on_slide_exited = function () {
                    _this2.setState({ current_slide: _this2.state.next_slide,
                        next_slide: null });
                    if (_this2.props.exited_cb)
                    _this2.props.exited_cb();
                };_this2.state = { current_slide: _this2.props.slide, next_slide: null };return _this2;}_createClass(Slides_switch, [{ key: 'componentDidUpdate', value: function componentDidUpdate(prev_props, prev_state) {var props = this.props;if (prev_props.slide != props.slide || prev_props.refresh != props.refresh) this.setState({ current_slide: null, next_slide: props.slide });} }, { key: 'render', value: function render()
                {var
                    state = this.state,props = this.props;
                    var common = {
                        mountOnEnter: true,
                        unmountOnExit: true,
                        timeout: 200,
                        classNames: props.backward ? 'slide-backward' : 'slide-forward',
                        onExited: this.on_slide_exited };

                    return _react2.default.Children.map(props.children, function (child) {
                        return (
                            _react2.default.createElement(_reactTransitionGroup.CSSTransition, _extends({ key: 'transition_' + child.key,
                                'in': state.current_slide == child.key },
                            common),
                            child));


                    });
                } }]);return Slides_switch;}(_react2.default.PureComponent);


        E.Subscribe = function (_React$Component) {_inherits(Subscribe, _React$Component);
            function Subscribe(props) {_classCallCheck(this, Subscribe);var _this3 = _possibleConstructorReturn(this, (Subscribe.__proto__ || Object.getPrototypeOf(Subscribe)).call(this,
                props));_this3.


























                close_click = function () {
                    _this3.perr('close');
                    _this3.props.close_cb();
                };_this3.
                login_click = function () {
                    _browser2.default.cookies.set({
                        url: 'https://hola.org',
                        name: 'bext_login_origin',
                        value: get_root_url(),
                        expirationDate: (Date.now() + 5 * ms.MIN) / 1000 });

                    _this3.perr('login');
                };_this3.
                stop_vpn_click = function () {
                    _this3.perr('stop_vpn');
                    be_vpn.fcall('stop_vpn', [get_url(), get_tab_id()]);
                };_this3.
                back_click = function () {return _this3.set_slide('stop_vpn', true);};_this3.
                hide_popup_click = function () {
                    _this3.perr('hide_popup');
                    _this3.set_slide('subscribe');
                };_this3.
                plan_click = function (plan) {
                    _this3.perr('plan_click', { plan: plan });
                    if (plan == 'free')
                    _this3.props.close_cb();
                };_this3.



                slide_exited_cb = function () {return _this3.sync_size(_this3.state.slide);};_this3.state = _this3.state || {};_this3.state.slide = 'stop_vpn';_this3.state.plans = get_plans();_this3.sync_size(_this3.state.slide);return _this3;}_createClass(Subscribe, [{ key: 'componentDidMount', value: function componentDidMount() {this.perr('show');} }, { key: 'perr', value: function perr(id, info) {pref_perr(this.props)('subscribe_' + id, info);} }, { key: 'sync_size', value: function sync_size(slide) {var width = void 0,height = void 0;if (slide == 'stop_vpn') {width = 550;height = 362;} else {width = 50 + 250 * (get_plans().length + 1) + 40;height = 564;}this.props.size_cb({ width: width + 8, height: height + 8, fade: true, center: true }, { width: width, height: height });} }, { key: 'set_slide', value: function set_slide(slide, backward) {this.setState({ slide: slide, backward: !!backward });} }, { key: 'render_stop_vpn', value: function render_stop_vpn()
                {var
                    props = this.props;
                    return (
                        _react2.default.createElement('div', { className: 'modal-body', key: 'stop_vpn' },
                        _react2.default.createElement('div', { className: 'buttons-container' },
                        _react2.default.createElement(Stop_btn, { on_click: this.stop_vpn_click, title: 'Stop vpn',
                            country: props.country, is_mitm: props.is_mitm }),
                        _react2.default.createElement(Hide_popup_btn, { on_click: this.hide_popup_click,
                            title: 'Hide popup' }))));



                } }, { key: 'render_subscribe', value: function render_subscribe()
                {var _this4 = this;
                    var root_url = get_root_url();
                    var free_list = ['Unblock any site', '2 hour/day video streaming',
                    '2 connected devices', 'SD video streaming'];
                    var ref = (this.props.is_mitm ? 'mitm_popup_' : 'watermark_') +
                    root_url.replace(/\./g, '_');
                    return (
                        _react2.default.createElement('div', { className: 'modal-body subscribe-body', key: 'subscribe' },
                        _react2.default.createElement('div', { className: 'buttons-container' },
                        _react2.default.createElement(_common_ui2.default.Free_plan, { on_click: this.plan_click,
                            sub_title: 'Show popup', list: free_list }),
                        this.state.plans.map(function (plan) {return (
                                _react2.default.createElement(_common_ui2.default.Plan, { key: plan, plan: plan,
                                    on_click: _this4.plan_click,
                                    href: _util8.default.plus_ref(ref, { plan: plan, root_url: root_url }) }));}))));



                } }, { key: 'render', value: function render()
                {var
                    state = this.state;
                    var user_id = be_ext.get('user_id');
                    return (
                        _react2.default.createElement(E.Wrap, null,
                        _react2.default.createElement(E.Modal_header, { login_click: this.login_click,
                            slide: state.slide,
                            show_signin: !user_id,
                            back_click: state.slide == 'subscribe' && this.back_click,
                            title: state.slide == 'subscribe' && 'Choose your plan',
                            close_click: this.close_click }),
                        _react2.default.createElement(Slides_switch, { slide: state.slide,
                            backward: state.backward,
                            exited_cb: this.slide_exited_cb },
                        this.render_stop_vpn(),
                        this.render_subscribe())));



                } }]);return Subscribe;}(_react2.default.Component);var


        Watermark_debug = function (_React$PureComponent2) {_inherits(Watermark_debug, _React$PureComponent2);function Watermark_debug() {var _ref2;var _temp, _this5, _ret;_classCallCheck(this, Watermark_debug);for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {args[_key] = arguments[_key];}return _ret = (_temp = (_this5 = _possibleConstructorReturn(this, (_ref2 = Watermark_debug.__proto__ || Object.getPrototypeOf(Watermark_debug)).call.apply(_ref2, [this].concat(args))), _this5), _this5.
                state = { value: '00:15' }, _this5.
                pattern = '\\d{1,2}:\\d{1,2}', _this5.
                on_change = function (event) {return _this5.setState({ value: event.target.value });}, _this5.
                on_click = function () {var
                    value = _this5.state.value;
                    if (!value.match(_this5.pattern))
                    return;
                    var t = value.split(':');
                    var time = t[0] * ms.MIN + t[1] * ms.SEC;
                    (0, _etask2.default)(regeneratorRuntime.mark(function _callee3() {return regeneratorRuntime.wrap(function _callee3$(_context3) {while (1) {switch (_context3.prev = _context3.next) {case 0:_context3.prev = 0;_context3.next = 3;return (

                                            be_trial.ecall('set_time_left', [get_root_url(), time]));case 3:_context3.next = 8;break;case 5:_context3.prev = 5;_context3.t0 = _context3['catch'](0);
                                        alert(_context3.t0.toString());case 8:case 'end':return _context3.stop();}}}, _callee3, this, [[0, 5]]);}));

                }, _this5.
                on_close_click = function () {
                    _storage2.default.set_json('be_watermark_debug', false);
                    be_vpn.trigger('storage_debug_change');
                }, _temp), _possibleConstructorReturn(_this5, _ret);}_createClass(Watermark_debug, [{ key: 'render', value: function render()
                {var
                    state = this.state,props = this.props;
                    return (
                        _react2.default.createElement('div', { className: 'watermark-debug', style: props.style },
                        _react2.default.createElement('input', { value: state.value, onChange: this.on_change,
                            pattern: this.pattern }),
                        _react2.default.createElement('button', { onClick: this.on_click }, 'set'),
                        _react2.default.createElement('button', { className: 'close', onClick: this.on_close_click })));


                } }]);return Watermark_debug;}(_react2.default.PureComponent);


        E.Watermark = function (_React$PureComponent3) {_inherits(Watermark, _React$PureComponent3);
            function Watermark(props) {_classCallCheck(this, Watermark);var _this6 = _possibleConstructorReturn(this, (Watermark.__proto__ || Object.getPrototypeOf(Watermark)).call(this,
                props));_this6.




















                on_storage_dbg_change = function () {return (
                        _this6.setState({ debug: _storage2.default.get_json('be_watermark_debug') }));};_this6.





































































































                close_click = function () {
                    _this6.perr('close');
                    _this6.props.close_cb();
                };_this6.
                click = function () {
                    _this6.perr('click');
                    _this6.props.show_vpn_ui_cb();
                };_this6.
                trial_timer_click = function () {
                    _this6.perr('trial_timer_click');
                    _this6.props.trial_timer_click_cb();
                };_this6.
                arrow_click = function (e) {
                    var pos = _this6.props.position.split('_');
                    var $el = (0, _jquery2.default)(e.currentTarget);
                    var new_pos = void 0;
                    if ($el.hasClass('arrow-left'))
                    new_pos = pos[0] + '_left';else
                    if ($el.hasClass('arrow-right'))
                    new_pos = pos[0] + '_right';else
                    if ($el.hasClass('arrow-down'))
                    new_pos = 'bottom_' + pos[1];else

                    new_pos = 'top_' + pos[1];
                    if (_this6.state.arrow_hover)
                    {
                        _this6.props.position_cb(new_pos);
                        _this6.setState({ arrow_hover: null });
                    } else

                    _this6.props.position_cb(new_pos);
                    _this6.perr('arrow', { new_pos: new_pos });
                };_this6.
                on_mouse_leave = function (e) {return _this6.setState({ arrow_hover: null, hover: false });};_this6.
                on_body_mouse_move = function (e) {
                    if (!_this6.el || _this6.state.ignore_hover)
                    return;
                    var r = _this6.el.parentElement.getBoundingClientRect();
                    var x = e.clientX,y = e.clientY;
                    var left = r.left - 3; 
                    var right = r.right,top = r.top,bottom = r.bottom;
                    if (_this6.state && _this6.state.debug && _this6.state.hover)
                    {
                        if (_this6.props.position.endsWith('_right'))
                        left -= 120;else

                        right += 120;
                    }
                    var sqr = function sqr(v) {return v * v;};
                    var radius = 14,r2 = sqr(radius),hover = void 0;
                    if (x > right - radius && y > bottom - radius)
                    hover = sqr(x - right + radius) + sqr(y - bottom + radius) <= r2;else
                    if (x > right - radius && y < top + radius)
                    hover = sqr(x - right + radius) + sqr(top + radius - y) <= r2;else
                    if (x < left + radius && y > bottom - radius)
                    hover = sqr(left + radius - x) + sqr(y - bottom + radius) <= r2;else
                    if (x < left + radius && y < top + radius)
                    hover = sqr(left + radius - x) + sqr(top + radius - y) <= r2;else

                    hover = x >= left && x <= right && y >= top && y <= bottom;
                    _this6.setState({ hover: hover });
                };_this6.
                on_arrow_mouse_enter = function (e) {
                    var $el = (0, _jquery2.default)(e.currentTarget),arrow_hover = void 0;
                    if ($el.hasClass('left-right'))
                    arrow_hover = 'left-right';else
                    if ($el.hasClass('up-down'))
                    arrow_hover = 'up-down';
                    _this6.setState({ arrow_hover: arrow_hover });
                };_this6.
                on_arrow_mouse_leave = function (e) {return _this6.setState({ arrow_hover: null });};_this6.





                vpn_work_yes_cb = function (event) {
                    _this6.setState({ hover: false });
                    be_ui_popup_ext.send_vpn_work_report({
                        rule: _this6.get_rule(),
                        src_country: (_this6.props.src_country || '').toLowerCase(),
                        src: 'watermark' });

                };_this6.
                vpn_work_no_cb = function (event) {
                    _this6.setState({ hover: false });
                    var src_country = (_this6.props.src_country || '').toLowerCase();
                    var rule = _this6.get_rule();
                    if (!rule)
                    return;
                    var tab_id = get_tab_id();
                    be_rule.ecall('fix_vpn', [{ rule: rule, root_url: get_root_url(),
                        url: get_url(), tab_id: tab_id, src_country: src_country }]);
                    be_ext.fcall('trigger', ['ui_not_working', { tab_id: tab_id,
                        src: 'watermark' }]);
                    be_ui_popup_ext.send_fix_it_report({ rule: rule, src_country: src_country,
                        event: event.nativeEvent, send_logs: true, src: 'watermark' });
                };_this6.state = { arrow_hover: null, hover: false, ignore_hover: true, debug: _storage2.default.get_json('be_watermark_debug') };_this6.sync_size();return _this6;}_createClass(Watermark, [{ key: 'componentDidMount', value: function componentDidMount() {var _this7 = this;this.perr('show');be_tpopup.on('mouseleave', this.on_mouse_leave);(0, _jquery2.default)('body').on('mousemove', this.on_body_mouse_move);be_vpn.on('storage_debug_change', this.on_storage_dbg_change); 
                    setTimeout(function () {return _this7.setState({ ignore_hover: false });}, 300);} }, { key: 'componentWillUnmount', value: function componentWillUnmount() {be_tpopup.off('mouseleave', this.on_mouse_leave);(0, _jquery2.default)('body').off('mousemove', this.on_body_mouse_move);be_vpn.off('storage_debug_change', this.on_storage_dbg_change);this.hide_arrow_anim();if (this.sync_size_et) this.sync_size_et.return();} }, { key: 'perr', value: function perr(id, info) {pref_perr(this.props)('watermark_' + id, info);} }, { key: 'componentDidUpdate', value: function componentDidUpdate(prev_props, prev_state) {var trial_changed = this.props.trial != prev_props.trial;var position_changed = this.props.position != prev_props.position;var size_changed = this.state.hover != prev_state.hover || trial_changed;if (position_changed || size_changed) this.sync_size(position_changed, size_changed);if (position_changed) this.setState({ hover: false });if (position_changed || trial_changed) this.hide_arrow_anim();else if (this.state.arrow_hover != prev_state.arrow_hover) {if (this.state.arrow_hover) this.show_arrow_anim();else this.hide_arrow_anim();}} }, { key: 'get_size', value: function get_size(arrow_anim) {var width = this.props.is_mitm ? 82 : 95;var height = 28;if (this.props.trial) width += 62;if (this.state.hover) {width = Math.max(width + 50, 166);if (!arrow_anim) height += 75;}return { width: width, height: height };} }, { key: 'get_iframe_size', value: function get_iframe_size(arrow_anim) {var _get_size = this.get_size(),width = _get_size.width,height = _get_size.height;if (!arrow_anim && this.state.debug) width += 115;return { width: width + 12, height: height + 24 };} }, { key: 'sync_size', value: function sync_size(position_changed, size_changed) {var _this = this;if (this.sync_size_et) this.sync_size_et.return();(0, _etask2.default)({ cancel: true }, regeneratorRuntime.mark(function _callee4() {var _this$get_size, width, height, iframe_opt, modal_opt;return regeneratorRuntime.wrap(function _callee4$(_context4) {while (1) {switch (_context4.prev = _context4.next) {case 0:_this.sync_size_et = this;this.finally(function () {_this.sync_size_et = null;});_this$get_size = _this.get_size(), width = _this$get_size.width, height = _this$get_size.height;iframe_opt = assign({}, _this.get_iframe_size(), { margin_right: 15, no_animation: size_changed, animation_time: position_changed ? 300 : 200, no_scale_anim: position_changed, position: _this.props.position });modal_opt = { width: width, height: height, position: _this.props.position };if (size_changed) {_context4.next = 11;break;}set_modal_pos(modal_opt);_context4.next = 9;return set_iframe_pos(iframe_opt);case 9:_context4.next = 22;break;case 11:if (!_this.state.hover) {_context4.next = 17;break;}_context4.next = 14;return set_iframe_pos(iframe_opt);case 14:set_modal_pos(modal_opt);_context4.next = 22;break;case 17:set_modal_pos(modal_opt);_context4.next = 20;return _etask2.default.sleep(300);case 20:_context4.next = 22;return set_iframe_pos(iframe_opt);case 22:case 'end':return _context4.stop();}}}, _callee4, this);}));} }, { key: 'show_arrow_anim', value: function show_arrow_anim() {var _get_iframe_size = this.get_iframe_size(true),width = _get_iframe_size.width,height = _get_iframe_size.height;var arrow = this.state.arrow_hover;var pos = this.props.position.split('_');var direction = void 0,css = {};if (arrow == 'up-down') {css.height = 'calc(100% - ' + height + 'px)';css.width = width + 'px';css[pos[0]] = height + 'px';css[pos[1]] = pos[1] == 'right' ? '15px' : '0';direction = pos[0] == 'top' ? 'down' : 'up';} else {css.width = 'calc(100% - ' + width + 'px)';css.height = height + 'px';css[pos[1]] = width + 'px';css[pos[0]] = '0';direction = pos[1] == 'right' ? 'left' : 'right';}be_tpopup.fcall('show_arrow_anim', [get_connection_id(), { css: css, direction: direction, size: this.get_size(true) }]);} }, { key: 'hide_arrow_anim', value: function hide_arrow_anim() {be_tpopup.fcall('hide_arrow_anim', [get_connection_id()]);} }, { key: 'get_rule', value: function get_rule() {return this.props.is_mitm ? { country: 'us', is_mitm: true, tab_id: get_tab_id() } : get_enabled_rule();} }, { key: 'render', value: function render() {var _this8 = this;var
                    props = this.props,state = this.state;var
                    arrow_hover = state.arrow_hover;
                    var pos = props.position.split('_');
                    var y_direction = pos[0] == 'top' ? 'down' : 'up';
                    var x_direction = pos[1] == 'right' ? 'left' : 'right';
                    var up_down = 'arrow-btn up-down arrow-' + y_direction + ' ' + (
                    arrow_hover == 'up-down' ? ' hover' : '');
                    var left_right = 'arrow-btn left-right arrow-' + x_direction + ' ' + (
                    arrow_hover == 'left-right' ? ' hover' : '');
                    var dbg_style = pos[1] == 'right' ? { left: '-122px' } : { right: '-120px' };
                    return (
                        _react2.default.createElement(E.Wrap, null,
                        _react2.default.createElement('div', { className: 'modal-header' + (state.hover ? ' hover' : ''),
                            ref: function ref(el) {return _this8.el = el;} },
                        _react2.default.createElement('div', { className: 'logo-wrap', onClick: this.click },
                        _react2.default.createElement('div', { className: 'logo' })),

                        _react2.default.createElement('div', { className: 'flag-wrap', onClick: this.click },
                        props.is_mitm &&
                        _react2.default.createElement('div', { className: 'unblocking-img' }),
                        !props.is_mitm &&
                        _react2.default.createElement('div', { className: 'selected-country f32' },
                        _react2.default.createElement('span', { className: flag_cls(props.country) }))),


                        !!props.trial_left &&
                        _react2.default.createElement('div', { className: 'trial-timer', onClick: this.trial_timer_click },
                        _ui_lib2.default.format_time(props.trial_left)),

                        _react2.default.createElement('div', { className: 'arrow-buttons' },
                        _react2.default.createElement('button', { className: left_right, onClick: this.arrow_click,
                            onMouseEnter: this.on_arrow_mouse_enter,
                            onMouseLeave: this.on_arrow_mouse_leave },
                        _react2.default.createElement('div', { className: 'arrow-anim' },
                        _react2.default.createElement('div', { className: 'arrow-icon' }))),


                        _react2.default.createElement('button', { className: up_down, onClick: this.arrow_click,
                            onMouseEnter: this.on_arrow_mouse_enter,
                            onMouseLeave: this.on_arrow_mouse_leave },
                        _react2.default.createElement('div', { className: 'arrow-anim' },
                        _react2.default.createElement('div', { className: 'arrow-icon' })))),



                        _react2.default.createElement('button', { className: 'close', onClick: this.close_click }),
                        state.debug && !!props.trial_left &&
                        _react2.default.createElement(Watermark_debug, { style: dbg_style })),

                        _react2.default.createElement('div', { className: 'modal-body' },
                        state.hover && _react2.default.createElement(Vpn_work_buttons, {
                            no_click: this.vpn_work_no_cb,
                            yes_click: this.vpn_work_yes_cb }))));



                } }]);return Watermark;}(_react2.default.PureComponent);var


        Vpn_work_buttons = function (_React$PureComponent4) {_inherits(Vpn_work_buttons, _React$PureComponent4);function Vpn_work_buttons() {_classCallCheck(this, Vpn_work_buttons);return _possibleConstructorReturn(this, (Vpn_work_buttons.__proto__ || Object.getPrototypeOf(Vpn_work_buttons)).apply(this, arguments));}_createClass(Vpn_work_buttons, [{ key: 'render', value: function render()
                {var
                    props = this.props;
                    return (
                        _react2.default.createElement('div', { className: 'vpn-work-buttons' },
                        _react2.default.createElement('div', { className: 'title' }, _react2.default.createElement(T, null, 'Is it working?')),
                        _react2.default.createElement('div', { className: 'buttons' },
                        _react2.default.createElement('button', { className: 'btn-yes', onClick: props.yes_click },
                        _react2.default.createElement(T, null, 'Yes')),

                        _react2.default.createElement('button', { className: 'btn-no', onClick: props.no_click },
                        _react2.default.createElement(T, null, 'No')))));




                } }]);return Vpn_work_buttons;}(_react2.default.PureComponent);var


        Stop_btn = function (_React$PureComponent5) {_inherits(Stop_btn, _React$PureComponent5);function Stop_btn() {_classCallCheck(this, Stop_btn);return _possibleConstructorReturn(this, (Stop_btn.__proto__ || Object.getPrototypeOf(Stop_btn)).apply(this, arguments));}_createClass(Stop_btn, [{ key: 'render', value: function render()
                {var
                    props = this.props;
                    return (
                        _react2.default.createElement('div', { className: 'action-button stop-btn',
                            onClick: props.on_click },
                        _react2.default.createElement('div', { className: 'action-button-inner' },
                        _react2.default.createElement('div', { className: 'vpn-switch' },
                        _react2.default.createElement('div', { className: 'power-switch' }),
                        _react2.default.createElement('div', { className: 'fsvg_4x3' },
                        _react2.default.createElement('div', { className: flag_cls(props.is_mitm ?
                            'flag_mitm' : props.country || 'us') }),
                        _react2.default.createElement('div', { className: 'strike-line' }))),


                        _react2.default.createElement('div', { className: 'title' }, _react2.default.createElement(T, null, props.title)))));



                } }]);return Stop_btn;}(_react2.default.PureComponent);var


        Hide_popup_btn = function (_React$PureComponent6) {_inherits(Hide_popup_btn, _React$PureComponent6);function Hide_popup_btn() {_classCallCheck(this, Hide_popup_btn);return _possibleConstructorReturn(this, (Hide_popup_btn.__proto__ || Object.getPrototypeOf(Hide_popup_btn)).apply(this, arguments));}_createClass(Hide_popup_btn, [{ key: 'render', value: function render()
                {var
                    props = this.props;
                    return (
                        _react2.default.createElement('div', { className: 'action-button hide-popup-btn',
                            onClick: props.on_click },
                        _react2.default.createElement('div', { className: 'watermark-anim' },
                        _react2.default.createElement('div', { className: 'watermark-image' },
                        _react2.default.createElement('div', { className: 'watermark-image-logo' }),
                        _react2.default.createElement('div', { className: 'watermark-image-close' })),

                        _react2.default.createElement('div', { className: 'cursor' })),

                        _react2.default.createElement('div', { className: 'title' }, _react2.default.createElement(T, null, props.title))));


                } }]);return Hide_popup_btn;}(_react2.default.PureComponent);var


        Mitm_btn = function (_React$PureComponent7) {_inherits(Mitm_btn, _React$PureComponent7);function Mitm_btn() {var _ref3;var _temp2, _this12, _ret2;_classCallCheck(this, Mitm_btn);for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {args[_key2] = arguments[_key2];}return _ret2 = (_temp2 = (_this12 = _possibleConstructorReturn(this, (_ref3 = Mitm_btn.__proto__ || Object.getPrototypeOf(Mitm_btn)).call.apply(_ref3, [this].concat(args))), _this12), _this12.
                on_click = function () {return _this12.props.on_click();}, _temp2), _possibleConstructorReturn(_this12, _ret2);}_createClass(Mitm_btn, [{ key: 'render', value: function render()
                {var
                    enable = this.props.enable;
                    var site = get_root_url();
                    return (
                        _react2.default.createElement('div', { className: 'action-button mitm-unblock',
                            onClick: this.on_click },
                        _react2.default.createElement('div', { className: enable ? 'unlock-anim' : 'lock-anim' },
                        _react2.default.createElement('div', { className: 'power-switch' }),
                        _react2.default.createElement('div', { className: 'img-wrapper' },
                        _react2.default.createElement('div', { className: 'lock-img' }),
                        _react2.default.createElement('div', { className: 'unlock-img' }),
                        _react2.default.createElement('div', { className: 'strike-line' }))),


                        _react2.default.createElement('div', { className: 'title' },
                        enable ?
                        _react2.default.createElement(T, null, 'Unblock ', _react2.default.createElement('span', { className: 'site-name' }, site)) :
                        _react2.default.createElement(T, null, 'Continue without VPN'))));



                } }]);return Mitm_btn;}(_react2.default.PureComponent);var


        Geo_btn = function (_React$PureComponent8) {_inherits(Geo_btn, _React$PureComponent8);function Geo_btn() {var _ref4;var _temp3, _this13, _ret3;_classCallCheck(this, Geo_btn);for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {args[_key3] = arguments[_key3];}return _ret3 = (_temp3 = (_this13 = _possibleConstructorReturn(this, (_ref4 = Geo_btn.__proto__ || Object.getPrototypeOf(Geo_btn)).call.apply(_ref4, [this].concat(args))), _this13), _this13.
                on_click = function () {return _this13.props.on_click(_this13.props.country);}, _temp3), _possibleConstructorReturn(_this13, _ret3);}_createClass(Geo_btn, [{ key: 'render', value: function render()
                {var _props =
                    this.props,country = _props.country,enable = _props.enable;
                    var title = this.props.title || (enable ? country.toUpperCase() :
                    'No VPN');
                    return (
                        _react2.default.createElement('div', { className: 'action-button geo-unblock', onClick: this.on_click },
                        _react2.default.createElement('div', { className: 'action-button-inner' },
                        _react2.default.createElement('div', { className: 'fsvg_4x3 flag-img' },
                        _react2.default.createElement('div', { className: flag_cls(country) })),

                        _react2.default.createElement('div', { className: 'title' }, _react2.default.createElement(T, null, title)))));



                } }]);return Geo_btn;}(_react2.default.PureComponent);var


        Dropdown_list = function (_React$PureComponent9) {_inherits(Dropdown_list, _React$PureComponent9);function Dropdown_list() {_classCallCheck(this, Dropdown_list);return _possibleConstructorReturn(this, (Dropdown_list.__proto__ || Object.getPrototypeOf(Dropdown_list)).apply(this, arguments));}_createClass(Dropdown_list, [{ key: 'componentDidMount', value: function componentDidMount()
                {
                    (0, _jquery2.default)('#all').css({ filter: 'grayscale(1)' });
                    be_ui_popup_ext.on('body_click', this.props.on_hide);
                } }, { key: 'componentWillUnmount', value: function componentWillUnmount()
                {
                    (0, _jquery2.default)('#all').css({ filter: 'none' });
                    be_ui_popup_ext.off('body_click', this.props.on_hide);
                } }, { key: 'render', value: function render()
                {var _this15 = this;
                    var props = this.props,countries = props.countries;
                    var style = {
                        top: props.rect.top + 'px',
                        left: props.rect.left + 'px',
                        width: props.rect.width + 'px',
                        height: props.rect.height + 'px' };

                    return _reactDom2.default.createPortal(
                    _react2.default.createElement('div', { className: 'countries-dropdown-fade', onClick: props.on_hide },
                    _react2.default.createElement('div', { className: 'countries-dropdown', style: style },
                    _react2.default.createElement('ul', null,
                    countries.map(function (c) {return (
                            _react2.default.createElement('li', { key: c, onClick: function onClick() {return _this15.props.on_click(c);} },
                            _react2.default.createElement('span', { className: 'f32' },
                            _react2.default.createElement('span', { className: flag_cls(c) })),

                            _react2.default.createElement(T, null, c.toUpperCase())));})))),



                    document.body);
                } }]);return Dropdown_list;}(_react2.default.PureComponent);var


        More_btn = function (_React$PureComponent10) {_inherits(More_btn, _React$PureComponent10);
            function More_btn(props) {_classCallCheck(this, More_btn);var _this16 = _possibleConstructorReturn(this, (More_btn.__proto__ || Object.getPrototypeOf(More_btn)).call(this,
                props));_this16.


                on_hide_dropdown = function () {return _this16.setState({ opened: false });};_this16.
                on_click = function () {
                    _this16.setState({ rect: _this16.el.getBoundingClientRect(), opened: true });
                };_this16.state = { opened: false };return _this16;}_createClass(More_btn, [{ key: 'render', value: function render()
                {var _this17 = this;var
                    props = this.props,state = this.state,countries = props.countries;
                    var unique_number = new Set(countries).size;
                    var list_text = countries.length < 6 ?
                    countries.slice(1).map(function (c) {return T(c.toUpperCase());}).join(', ') :
                    _react2.default.createElement(T, null, 'Choose from ', _react2.default.createElement('span', null, unique_number), ' countries');
                    return (
                        _react2.default.createElement('div', { className: 'action-button geo-unblock more-btn',
                            ref: function ref(el) {return _this17.el = el;}, onClick: !state.opened && this.on_click },
                        state.opened ?
                        _react2.default.createElement(Dropdown_list, { countries: countries, rect: state.rect,
                            on_click: props.on_click, on_hide: this.on_hide_dropdown }) :
                        _react2.default.createElement('div', { className: 'action-button-inner' },
                        _react2.default.createElement('div', { className: 'fsvg_4x3' },
                        _react2.default.createElement('div', { className: 'flag flag_other' })),

                        _react2.default.createElement('div', { className: 'title' }, _react2.default.createElement(T, null, 'More')),
                        _react2.default.createElement('div', { className: 'more-countries' },
                        list_text))));




                } }]);return More_btn;}(_react2.default.PureComponent);


        E.Suggestion_body = function (_React$PureComponent11) {_inherits(Suggestion_body, _React$PureComponent11);function Suggestion_body() {_classCallCheck(this, Suggestion_body);return _possibleConstructorReturn(this, (Suggestion_body.__proto__ || Object.getPrototypeOf(Suggestion_body)).apply(this, arguments));}_createClass(Suggestion_body, [{ key: 'componentDidMount', value: function componentDidMount()
                {
                    pref_perr(this.props, 'mitm_popup')('suggestion_show');
                } }, { key: 'render', value: function render()
                {
                    var props = this.props,countries = props.countries;
                    var site = get_root_url();
                    var buttons = void 0;
                    if (props.is_mitm)
                    {
                        buttons = [
                        _react2.default.createElement(Mitm_btn, { enable: false, on_click: props.no_click, key: 'no' }),
                        _react2.default.createElement(Mitm_btn, { enable: true, on_click: props.yes_click, key: 'yes' })];

                    } else

                    {
                        buttons = [_react2.default.createElement(Geo_btn, { key: 'no', enable: false,
                            country: props.src_country, on_click: props.no_click })];
                        if (countries.length < 3)
                        {
                            buttons = buttons.concat(countries.map(function (c) {return (
                                    _react2.default.createElement(Geo_btn, { key: 'yes_' + c, enable: true, country: c,
                                        on_click: props.yes_click }));}));
                        } else

                        {
                            buttons.push(_react2.default.createElement(Geo_btn, { key: 'yes_' + countries[0], enable: true,
                                country: countries[0], on_click: props.yes_click }));
                            buttons.push(_react2.default.createElement(More_btn, { key: 'more', countries: countries,
                                on_click: props.yes_click }));
                        }
                    }
                    return (
                        _react2.default.createElement('div', { className: 'modal-body suggestion-body' },
                        props.is_mitm ?
                        _react2.default.createElement('div', { className: 'title' },
                        _react2.default.createElement('div', { className: 'stop-icon' }),
                        _react2.default.createElement(T, null, _react2.default.createElement('span', { className: 'site-name' }, site), ' is blocked in your country or office')) :


                        _react2.default.createElement('div', { className: 'title' }, _react2.default.createElement(T, null, 'Select ',
                        _react2.default.createElement('span', { className: 'site-name' }, site), ' edition:')),

                        _react2.default.createElement('div', { className: 'buttons-container' },
                        buttons)));



                } }]);return Suggestion_body;}(_react2.default.PureComponent);var


        Login_body = function (_React$PureComponent12) {_inherits(Login_body, _React$PureComponent12);function Login_body() {_classCallCheck(this, Login_body);return _possibleConstructorReturn(this, (Login_body.__proto__ || Object.getPrototypeOf(Login_body)).apply(this, arguments));}_createClass(Login_body, [{ key: 'componentDidMount', value: function componentDidMount()
                {
                    _perr('geo_login_show');
                    _browser2.default.cookies.set({
                        url: 'https://hola.org',
                        name: 'email_verify_next_url',
                        value: get_url(),
                        expirationDate: (Date.now() + ms.HOUR) / 1000 });

                } }, { key: 'render', value: function render()
                {
                    var site = get_root_url();
                    var url = _escape2.default.uri('https://hola.org/bext_login',
                    { uuid: _popup_lib2.default.get_uuid(), root_url: get_root_url() });
                    return (
                        _react2.default.createElement('div', { className: 'modal-body login-body' },
                        _react2.default.createElement('div', { className: 'title' },
                        _react2.default.createElement(T, null, 'Sign in to unblock ',
                        _react2.default.createElement('span', { className: 'site-name' }, site)),

                        _react2.default.createElement('span', { className: 'f32' },
                        _react2.default.createElement('span', { className: flag_cls(this.props.country) }))),


                        _react2.default.createElement('div', { className: 'iframe-container' },
                        _react2.default.createElement('iframe', { src: url }))));



                } }]);return Login_body;}(_react2.default.PureComponent);var


        Trial_subscribe_body = function (_React$PureComponent13) {_inherits(Trial_subscribe_body, _React$PureComponent13);
            function Trial_subscribe_body(props) {_classCallCheck(this, Trial_subscribe_body);var _this20 = _possibleConstructorReturn(this, (Trial_subscribe_body.__proto__ || Object.getPrototypeOf(Trial_subscribe_body)).call(this,
                props));_this20.




















































                on_click = function (plan) {
                    var wait_time = _this20.state.wait_time;
                    if (plan != 'free')
                    return void _this20.perr('plan_click', { plan: plan, wait_time: wait_time });
                    if (wait_time)
                    {
                        _this20.perr('plan_wait_click_free');
                        _this20.need_wait();
                        return;
                    }
                    _this20.perr('plan_click_free', { trial_left: _this20.props.trial_left });
                    if (_this20.props.trial_left)
                    return void _this20.props.close_cb();
                    if (!_this20.state.waited)
                    _this20.start_wait_timer();else

                    _this20.props.unblock_cb(_this20.props.country);
                };_this20.state = { plans: get_plans(), wait_time: 0, waited: false, waiting: false };return _this20;}_createClass(Trial_subscribe_body, [{ key: 'componentDidMount', value: function componentDidMount() {var _this = this;(0, _etask2.default)(regeneratorRuntime.mark(function _callee5() {var root_url, grace_period;return regeneratorRuntime.wrap(function _callee5$(_context5) {while (1) {switch (_context5.prev = _context5.next) {case 0:root_url = get_root_url();_context5.next = 3;return be_trial.ecall('is_trial_grace_period', [root_url]);case 3:grace_period = _context5.sent;_this.perr('show', { grace_period: grace_period, tab_active: is_tab_active(), trial_left: _this.props.trial_left });case 5:case 'end':return _context5.stop();}}}, _callee5, this);}));} }, { key: 'componentWillUnmount', value: function componentWillUnmount() {if (this.timer) this.timer = clearTimeout(this.timer);} }, { key: 'perr', value: function perr(id, info) {var prefix = this.props.trial_left ? 'geo_trial_subscribe_' : 'geo_trial_ended_';_perr(prefix + id, info);} }, { key: 'timer_tick', value: function timer_tick(wait_ts) {var _this21 = this;var wait_time = Math.max(wait_ts - Date.now(), 0);this.setState({ wait_time: wait_time });if (wait_time > 0) this.timer = setTimeout(function () {return _this21.timer_tick(wait_ts);}, ms.SEC);else {this.setState({ waited: true });this.props.unblock_cb(this.props.country);}} }, { key: 'start_wait_timer', value: function start_wait_timer() {var _this = this;(0, _etask2.default)(regeneratorRuntime.mark(function _callee6() {var next_trial_ts, wait;return regeneratorRuntime.wrap(function _callee6$(_context6) {while (1) {switch (_context6.prev = _context6.next) {case 0:_context6.next = 2;return be_trial.ecall('get_next_trial_ts', [get_root_url()]);case 2:next_trial_ts = _context6.sent;wait = _util2.default.get(_this.props, 'site_conf.trial.wait', 15 * ms.SEC);_this.timer_tick(Math.max(next_trial_ts, Date.now() + wait));if (wait > 0) {_this.setState({ waiting: true });_this.need_wait();}case 6:case 'end':return _context6.stop();}}}, _callee6, this);}));} }, { key: 'need_wait', value: function need_wait() {var _this22 = this;this.setState({ need_wait: true });setTimeout(function () {return _this22.setState({ need_wait: false });}, 500);} }, { key: 'render', value: function render()
                {var _this23 = this;var
                    props = this.props,state = this.state;
                    var root_url = get_root_url();
                    var ref = 'trial_' + root_url.replace(/\./g, '_');
                    var minutes_per_day = _util2.default.get(props, 'site_conf.plan_free_title') ||
                    _react2.default.createElement(T, null, _react2.default.createElement('span', null, '120'), ' minutes every day');
                    var trial_time = _util2.default.get(props, 'site_conf.trial.period', 15 * ms.MIN);
                    var timer_ms = state.waiting ? state.wait_time : props.trial_left ||
                    trial_time;
                    return (
                        _react2.default.createElement('div', { className: 'modal-body subscribe-body' },
                        _react2.default.createElement('div', { className: 'buttons-container' },
                        _react2.default.createElement(_common_ui2.default.Trial_free_plan, { on_click: this.on_click,
                            site: root_url,
                            need_wait: state.need_wait,
                            waiting: state.waiting,
                            minutes_per_day: minutes_per_day,
                            time: _ui_lib2.default.format_time(timer_ms),
                            trial_left: props.trial_left }),
                        this.state.plans.map(function (plan) {return (
                                _react2.default.createElement(_common_ui2.default.Plan, { key: plan, plan: plan,
                                    on_click: _this23.on_click,
                                    href: _util8.default.plus_ref(ref, { plan: plan, root_url: root_url }) }));}))));



                } }]);return Trial_subscribe_body;}(_react2.default.PureComponent);var


        Geo_suggestion = function (_React$PureComponent14) {_inherits(Geo_suggestion, _React$PureComponent14);
            function Geo_suggestion(props) {_classCallCheck(this, Geo_suggestion);var _this24 = _possibleConstructorReturn(this, (Geo_suggestion.__proto__ || Object.getPrototypeOf(Geo_suggestion)).call(this,
                props));_this24.






































                slide_exited_cb = function () {
                    _this24.sync_size(_this24.props.slide);
                };_this24.

                close_click = function () {
                    _this24.perr('suggestion_close');
                    _this24.ignore();
                };_this24.
                no_click = function () {
                    _this24.perr('suggestion_no');
                    _this24.ignore();
                };_this24.
                yes_click = function (country) {
                    _this24.perr('suggestion_yes', { country: country });
                    _this24.props.unblock_cb(country);
                };_this24.
                try_again = function () {
                    var country = _this24.props.country;
                    _this24.perr('suggestion_try_again', { country: country });
                    _this24.props.unblock_cb(country);
                };_this24.state = {};_this24.sync_size(props.slide);return _this24;}_createClass(Geo_suggestion, [{ key: 'componentDidUpdate', value: function componentDidUpdate(prev_props, prev_state) {if (prev_props.trial_error != this.props.trial_error) this.sync_size(this.props.slide);} }, { key: 'perr', value: function perr(id, info) {pref_perr(this.props)(id, info);} }, { key: 'sync_size', value: function sync_size(slide) {var width = void 0,height = void 0; 
                    if (slide == 'trial_subscribe') {width = 50 + 250 * (get_plans().length + 1) + 40;height = 564;} else if (slide == 'login') {width = 550;height = 510;} else if (slide == 'stop_vpn_confirmation') {width = 550;height = 362;} else {width = 270 + 220 * Math.min(this.props.countries.length, 2);height = 390;}if (this.props.trial_error) height += 30;this.props.size_cb({ width: width + 8, height: height + 8, fade: true, center: true }, { width: width, height: height });} }, { key: 'ignore', value: function ignore() {this.props.close_cb();} }, { key: 'render', value: function render() {var
                    props = this.props;
                    return (
                        _react2.default.createElement(E.Wrap, null,
                        _react2.default.createElement(E.Modal_header, { close_click: this.close_click,
                            title: props.slide == 'trial_subscribe' && 'Choose your plan',
                            show_signin: false, slide: props.slide }),
                        _react2.default.createElement(_ui_lib2.default.Progress_bar, { visible: props.busy }),
                        props.trial_error &&
                        _react2.default.createElement('div', { className: 'error-message' },
                        _react2.default.createElement(T, null, 'We\'ve encountered an error. Please ', _react2.default.createElement('a', {
                            onClick: this.try_again }, _react2.default.createElement(T, null, 'try again')))),

                        _react2.default.createElement(Slides_switch, { slide: props.slide,
                            exited_cb: this.slide_exited_cb },
                        _react2.default.createElement(E.Suggestion_body, { key: 'suggestion',
                            countries: props.countries,
                            src_country: props.src_country,
                            yes_click: this.yes_click,
                            no_click: this.no_click,
                            prefix: props.prefix }),
                        _react2.default.createElement(Login_body, { key: 'login', country: props.country }),
                        _react2.default.createElement(Trial_subscribe_body, { key: 'trial_subscribe',
                            site_conf: props.site_conf,
                            trial_left: props.trial_left,
                            country: props.country,
                            close_cb: props.close_cb,
                            unblock_cb: props.unblock_cb }),
                        _react2.default.createElement(Stop_vpn_confirmation, { key: 'stop_vpn_confirmation',
                            country: props.country, is_mitm: false,
                            close_vpn: this.close_click }))));



                } }]);return Geo_suggestion;}(_react2.default.PureComponent);var


        Stop_vpn_confirmation = function (_React$PureComponent15) {_inherits(Stop_vpn_confirmation, _React$PureComponent15);function Stop_vpn_confirmation() {var _ref5;var _temp4, _this25, _ret4;_classCallCheck(this, Stop_vpn_confirmation);for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {args[_key4] = arguments[_key4];}return _ret4 = (_temp4 = (_this25 = _possibleConstructorReturn(this, (_ref5 = Stop_vpn_confirmation.__proto__ || Object.getPrototypeOf(Stop_vpn_confirmation)).call.apply(_ref5, [this].concat(args))), _this25), _this25.
                stop_vpn = function () {
                    var root_url = get_root_url();
                    pref_perr(_this25.props)('watermark_stop_vpn');
                    be_trial.ecall('on_popup_closed', [root_url]);
                    be_info.fcall('set_site_storage', [root_url,
                    'trial.dont_show_ended', true]);
                    be_vpn.fcall('stop_vpn', [get_url(), get_tab_id()]);
                }, _temp4), _possibleConstructorReturn(_this25, _ret4);}_createClass(Stop_vpn_confirmation, [{ key: 'render', value: function render()
                {var
                    country = this.props.country;
                    return _react2.default.createElement('div', { className: 'modal-body stop-vpn-confirmation' },
                    _react2.default.createElement('div', { className: 'title' }, _react2.default.createElement(T, null, 'Do you want to stop trial?')),
                    _react2.default.createElement('div', { className: 'buttons-container' },
                    _react2.default.createElement(Stop_btn, { on_click: this.stop_vpn, title: 'Stop trial',
                        country: country }),
                    _react2.default.createElement(Geo_btn, { on_click: this.props.close_vpn, title: 'Back to trial',
                        country: country })));


                } }]);return Stop_vpn_confirmation;}(_react2.default.PureComponent);var


        Verify_email = function (_React$PureComponent16) {_inherits(Verify_email, _React$PureComponent16);
            function Verify_email(props) {_classCallCheck(this, Verify_email);var _this26 = _possibleConstructorReturn(this, (Verify_email.__proto__ || Object.getPrototypeOf(Verify_email)).call(this,
                props));_this26.









                resend_click = function () {
                    _this26.setState({ resent: _this26.state.resent + 1 });
                    be_info.ecall('resend_verification_email');
                    _perr('geo_verify_email_resend');
                };_this26.state = { resent: 0 };var width = 550;var height = 310;_this26.props.size_cb({ width: width + 8, height: height + 8, fade: true, center: true }, { width: width, height: height });return _this26;}_createClass(Verify_email, [{ key: 'componentDidMount', value: function componentDidMount() {_perr('geo_verify_email_show');} }, { key: 'render', value: function render()
                {var
                    state = this.state,props = this.props;
                    var email = _util2.default.get(props, 'user.emails.0.value');
                    var slide = 'verify_email';
                    return (
                        _react2.default.createElement(E.Wrap, null,
                        _react2.default.createElement(E.Modal_header, null),
                        _react2.default.createElement(Slides_switch, { slide: slide, refresh: state.resent },
                        _react2.default.createElement('div', { key: slide, className: 'modal-body verify-email-body' },
                        _react2.default.createElement('div', { className: 'title' },
                        _react2.default.createElement(T, null, 'Verify your email address')),

                        _react2.default.createElement('p', null, _react2.default.createElement(T, null, 'Verification email was sent to ', _react2.default.createElement('b', null, email))),
                        _react2.default.createElement('p', null, _react2.default.createElement(T, null, 'Check your mailbox and follow the instructions to complete the registration process.')),

                        _react2.default.createElement('div', { className: 'resend-btn', onClick: this.resend_click },
                        _react2.default.createElement(T, null, 'Resend email', state.resent ? ' again' : '')),

                        _react2.default.createElement('p', null, _react2.default.createElement(T, null, 'Problems? Contact us at ', _react2.default.createElement('a', { href: 'mailto:help@hola.org',
                            target: '_parent' }, 'help@hola.org')))))));




                } }]);return Verify_email;}(_react2.default.PureComponent);


        E.Popup_base = function (_React$Component2) {_inherits(Popup_base, _React$Component2);
            function Popup_base(props) {_classCallCheck(this, Popup_base);var _this27 = _possibleConstructorReturn(this, (Popup_base.__proto__ || Object.getPrototypeOf(Popup_base)).call(this,
                props));_this27.






















                size_cb = function (iframe_opt, modal_opt) {var
                    position = _this27.state.position;
                    set_modal_pos(_extends({ position: position }, modal_opt));
                    set_iframe_pos(_extends({ position: position }, iframe_opt));
                };_this27.
                show_vpn_ui_cb = function () {
                    set_iframe_pos({ width: 274, height: 431, margin_top: 5, margin_left: 5,
                        margin_bottom: 5, margin_right: 15, fade: false,
                        position: _this27.state.position, animation_time: 300 });
                    _this27.props.on_show_vpn_ui();
                };_this27.
                position_cb = function (position) {
                    be_info.fcall('set_site_storage', [get_root_url(),
                    'watermark_pos', position]);
                    _this27.setState({ position: position });
                };_this27.state = { mode: props.mode, position: props.position, is_plus: be_ext.get('is_premium') };return _this27;}_createClass(Popup_base, [{ key: 'componentDidMount', value: function componentDidMount() {var _this28 = this;this.on_premium_change = function () {return _this28.setState({ is_plus: be_ext.get('is_premium') });};be_ext.on('change:is_premium', this.on_premium_change);this.update_container();} }, { key: 'componentWillUnmount', value: function componentWillUnmount() {be_ext.off('change:is_premium', this.on_premium_change);} }, { key: 'componentDidUpdate', value: function componentDidUpdate(prev_props, prev_state) {if (this.state.mode != prev_state.mode) this.update_container();} }, { key: 'update_container', value: function update_container() {(0, _jquery2.default)('#all').attr('class', this.state.mode);} }, { key: 'set_mode', value: function set_mode(
                mode) {
                    if (this.state.mode == mode)
                    return;
                    this.setState({ mode: mode });
                } }, { key: 'render', value: function render()
                {
                    return _reactDom2.default.createPortal(
                    _react2.default.createElement('div', { className: 'modal' }, this.render_inner()),
                    (0, _jquery2.default)('#all')[0]);
                } }]);return Popup_base;}(_react2.default.Component);var


        Watermark_popup = function (_E$Popup_base) {_inherits(Watermark_popup, _E$Popup_base);
            function Watermark_popup(props) {_classCallCheck(this, Watermark_popup);var _this29 = _possibleConstructorReturn(this, (Watermark_popup.__proto__ || Object.getPrototypeOf(Watermark_popup)).call(this,
                props));_initialiseProps.call(_this29);
                var state = _this29.state = _this29.state || {};
                state.trial = props.trial;
                state.slide = props.slide;
                state.countries = props.countries;
                state.country = props.country;
                if (state.trial)
                {
                    state.trial_left = _this29.get_trial_left();
                    _this29.monitor_trial();
                }return _this29;
            }_createClass(Watermark_popup, [{ key: 'componentDidMount', value: function componentDidMount()
                {
                    _get(Watermark_popup.prototype.__proto__ || Object.getPrototypeOf(Watermark_popup.prototype), 'componentDidMount', this).call(this);
                    be_premium.on('user_updated', this.on_user_updated);
                    be_vpn.on('force_trial', this.on_force_trial);
                    be_vpn.on('trial_timer_click', this.trial_timer_click_cb);
                    be_ext.on('trial_start', this.on_trial_start);
                    be_ext.on('trial_change', this.on_trial_change);
                    be_ui_popup_ext.on('body_click', this.on_body_click);
                } }, { key: 'componentWillUnmount', value: function componentWillUnmount()
                {
                    _get(Watermark_popup.prototype.__proto__ || Object.getPrototypeOf(Watermark_popup.prototype), 'componentWillUnmount', this).call(this);
                    be_premium.off('user_updated', this.on_user_updated);
                    be_vpn.off('force_trial', this.on_force_trial);
                    be_vpn.off('trial_timer_click', this.trial_timer_click_cb);
                    be_ext.off('trial_start', this.on_trial_start);
                    be_ext.off('trial_change', this.on_trial_change);
                    be_ui_popup_ext.off('body_click', this.on_body_click);
                    if (this.trial_timer)
                    this.trial_timer = clearTimeout(this.trial_timer);
                } }, { key: 'componentDidUpdate', value: function componentDidUpdate(
                prev_props, prev_state) {
                    _get(Watermark_popup.prototype.__proto__ || Object.getPrototypeOf(Watermark_popup.prototype), 'componentDidUpdate', this).call(this, prev_props, prev_state);
                    if (this.state.mode == SUBSCRIBE && this.can_close_watermark())
                    this.props.on_close();
                    if (this.state.trial != prev_state.trial)
                    this.monitor_trial();
                } }, { key: 'get_trial_left', value: function get_trial_left()















































                {
                    var trial = this.state.trial;
                    if (!trial)
                    return;
                    return Math.max(trial.expire_ts - Date.now(), 0);
                } }, { key: 'monitor_trial', value: function monitor_trial()
                {var _this30 = this;
                    var trial = this.state.trial;
                    if (!trial)
                    {
                        this.trial_timer = null;
                        return;
                    }
                    var trial_left = this.get_trial_left();
                    this.setState({ trial_left: trial_left });
                    if (trial_left <= 0)
                    {
                        this.trial_timer = null;
                        this.on_trial_ended();
                        return;
                    }
                    this.trial_timer = setTimeout(function () {return _this30.monitor_trial();}, _date2.default.ms.SEC);
                } }, { key: 'can_close_watermark', value: function can_close_watermark()
                {
                    return this.state.is_plus && !this.state.trial;
                } }, { key: 'on_trial_ended', value: function on_trial_ended()
                {
                    this.setState({ slide: 'trial_subscribe', trial: null,
                        trial_expired: true });
                    this.set_mode(SUGGESTION);
                } }, { key: 'do_unblock', value: function do_unblock(
                country) {
                    _do_unblock(country, this.state.trial);
                    this.set_mode(WATERMARK);
                } }, { key: 'render_inner', value: function render_inner()
























































































                {var
                    state = this.state,props = this.props;
                    switch (state.mode) {

                        case WATERMARK:return _react2.default.createElement(E.Watermark, {
                                country: state.country,
                                position: state.position,
                                trial: state.trial,
                                trial_left: state.trial_left,
                                position_cb: this.position_cb,
                                close_cb: this.close_cb,
                                show_vpn_ui_cb: this.show_vpn_ui_cb,
                                trial_timer_click_cb: this.trial_timer_click_cb,
                                size_cb: this.size_cb });
                        case SUBSCRIBE:return _react2.default.createElement(E.Subscribe, {
                                country: state.country,
                                close_cb: this.close_cb,
                                size_cb: this.size_cb });
                        case SUGGESTION:return _react2.default.createElement(Geo_suggestion, {
                                country: state.country,
                                countries: state.countries,
                                trial_left: state.trial_left,
                                src_country: props.src_country,
                                site_conf: props.site_conf,
                                slide: state.slide,
                                trial_error: state.trial_error,
                                busy: state.busy,
                                close_cb: this.close_cb,
                                unblock_cb: this.unblock_cb,
                                size_cb: this.size_cb,
                                prefix: props.prefix });
                        case VERIFY_EMAIL:return _react2.default.createElement(Verify_email, {
                                user: props.user,
                                size_cb: this.size_cb,
                                verified_cb: this.verified_cb });}

                } }]);return Watermark_popup;}(E.Popup_base);var _initialiseProps = function _initialiseProps() {var _this31 = this;this.on_force_trial = function (opt) {if (opt.tab_id != get_tab_id() || _this31.state.mode != SUGGESTION || !opt.country) {return;}if (_this31.state.slide == 'suggestion') _this31.unblock_cb(opt.country);else _this31.setState({ country: opt.country });};this.on_trial_start = function () {var _this = _this31;(0, _etask2.default)(regeneratorRuntime.mark(function _callee8() {var root_url, trial, country;return regeneratorRuntime.wrap(function _callee8$(_context8) {while (1) {switch (_context8.prev = _context8.next) {case 0:root_url = get_root_url();_context8.next = 3;return be_trial.ecall('get_trial_active', [root_url]);case 3:trial = _context8.sent;if (!trial) {_context8.next = 10;break;}_context8.next = 7;return be_info.ecall('get_site_storage', [root_url, 'trial.country']);case 7:country = _context8.sent;_this.setState({ trial: trial, country: country, trial_expired: false });_this.set_mode(WATERMARK);case 10:case 'end':return _context8.stop();}}}, _callee8, this);}));};this.on_trial_change = function (root_url, trial) {if (root_url == get_root_url()) _this31.setState({ trial: trial });};this.on_user_updated = function () {var state = _this31.state,_this = _this31;(0, _etask2.default)(regeneratorRuntime.mark(function _callee9() {var trial;return regeneratorRuntime.wrap(function _callee9$(_context9) {while (1) {switch (_context9.prev = _context9.next) {case 0:if (!(state.mode != SUGGESTION || state.slide != 'login' || !be_ext.get('user_id'))) {_context9.next = 2;break;}return _context9.abrupt('return');case 2:if (!_this.geo_login_success_sent) _perr('geo_login_success');_this.geo_login_success_sent = true;_context9.next = 6;return be_trial.ecall('get_trial_active', [get_root_url()]);case 6:trial = _context9.sent;_this.setState({ trial: trial }, function () {return _this.unblock_cb(_this.state.country);});case 8:case 'end':return _context9.stop();}}}, _callee9, this);}));};this.unblock_cb = function (country) {if (_this31.unblock_et) return;var _this = _this31;_this31.setState({ country: country });(0, _etask2.default)(regeneratorRuntime.mark(function _callee10() {var root_url, site_conf, trial;return regeneratorRuntime.wrap(function _callee10$(_context10) {while (1) {switch (_context10.prev = _context10.next) {case 0:_this.unblock_et = this;_this.setState({ busy: true });this.finally(function () {_this.unblock_et = null;_this.setState({ busy: false });});root_url = get_root_url();_perr('geo_suggestion_unblock', { country: country, slide: _this.state.slide, user_id: be_ext.get('user_id'), root_url: root_url });site_conf = _this.props.site_conf || {};if (!(!site_conf.require_plus || _this.state.is_plus || _this.state.trial)) {_context10.next = 9;break;}_this.do_unblock(country);return _context10.abrupt('return');case 9:if (be_ext.get('user_id')) {_context10.next = 13;break;}_this.setState({ slide: 'login' });_this.set_mode(SUGGESTION);return _context10.abrupt('return');case 13:_context10.next = 15;return be_trial.ecall('get_next_trial_ts', [root_url]);case 15:_context10.t0 = _context10.sent;_context10.t1 = Date.now();if (!(_context10.t0 > _context10.t1)) {_context10.next = 21;break;}_this.setState({ slide: 'trial_subscribe' });_this.set_mode(SUGGESTION);return _context10.abrupt('return');case 21:_context10.prev = 21;_context10.next = 24;return start_trial(country);case 24:trial = _context10.sent;_this.setState({ trial: trial, trial_error: null }, function () {return _this.do_unblock(country);});_context10.next = 31;break;case 28:_context10.prev = 28;_context10.t2 = _context10['catch'](21);_this.setState({ trial_error: _context10.t2.message || true });case 31:case 'end':return _context10.stop();}}}, _callee10, this, [[21, 28]]);}));};this.on_body_click = function () {if (_this31.state.mode == WATERMARK && _this31.can_close_watermark()) _this31.props.on_close();else if (_this31.state.mode == SUBSCRIBE) _this31.set_mode(WATERMARK);};this.close_cb = function () {var mode = _this31.state.mode;var type = mode == SUGGESTION ? 'suggestion' : 'watermark';if (_this31.can_close_watermark()) return void _this31.props.on_close({ type: type });else if (mode == SUGGESTION) {if (_this31.state.trial) return void _this31.set_mode(WATERMARK);var trial_expired = _this31.state.trial_expired;if (trial_expired && _this31.state.slide == 'trial_subscribe') return void _this31.setState({ slide: 'stop_vpn_confirmation' });if (trial_expired && _this31.state.slide == 'stop_vpn_confirmation') return void _this31.setState({ slide: 'trial_subscribe' });var root_url = get_root_url(); 
                    be_trial.ecall('on_popup_closed', [root_url]);if (_this31.state.slide == 'trial_subscribe' || _this31.state.slide == 'stop_vpn_confirmation') {be_info.fcall('set_site_storage', [root_url, 'trial.dont_show_ended', true]);}_this31.props.on_close({ type: type });return;}if (mode == SUBSCRIBE) _this31.set_mode(WATERMARK);else if (mode == WATERMARK) _this31.set_mode(SUBSCRIBE);};this.trial_timer_click_cb = function () {_this31.setState({ slide: 'trial_subscribe' });_this31.set_mode(SUGGESTION);};this.verified_cb = function () {
            };};
        var inited = void 0;
        E.init = function (ui_popup) {
            if (inited)
            return;
            inited = true;
            be_ui_popup_ext = ui_popup;
            be_rule = ui_popup.be_rule;
            be_ext = ui_popup.be_ext;
            be_vpn = ui_popup.be_vpn;
            be_info = ui_popup.be_info;
            be_premium = ui_popup.be_premium;
            be_trial = ui_popup.be_trial;
            be_tabs = ui_popup.be_tabs;
            be_tpopup = ui_popup.be_tpopup;
            be_popup_main = ui_popup.be_popup_main;
        };

        var el = void 0;
        var unmount = function unmount() {
            _reactDom2.default.unmountComponentAtNode(el[0]);
            el.remove();
        };

        var on_close = function on_close(opt) {
            opt = opt || {};
            unmount();
            be_ui_popup_ext.set_dont_show_again({
                tab_id: get_tab_id(),
                root_url: get_root_url(),
                period: 'default',
                src: 'x_btn',
                type: opt.type || 'watermark' });

        };

        var on_show_vpn_ui = function on_show_vpn_ui() {
            unmount();
            (0, _jquery2.default)('#all').attr('style', '');
            (0, _jquery2.default)('#all').attr('class', '');
            be_ui_popup_ext.set_tpopup_type(null);
        };

        E.render = function () {var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};return (0, _etask2.default)(regeneratorRuntime.mark(function _callee7() {var url, root_url, user, position, site_conf, is_trial_ended, trial, is_grace_period, force_trial, force_country, rule_enabled, mode, slide, countries, country, src_country, suggestion_conf, suggested, all_index, _suggested, all, rule;return regeneratorRuntime.wrap(function _callee7$(_context7) {while (1) {switch (_context7.prev = _context7.next) {case 0:
                                url = get_url();
                                root_url = get_root_url();if (!(


                                browser == 'firefox')) {_context7.next = 5;break;}_context7.next = 5;return (
                                    be_premium.fcall('refresh_user'));case 5:
                                user = be_premium.get('user');_context7.next = 8;return (
                                    be_info.ecall('get_site_storage', [get_root_url(),
                                    'watermark_pos', 'top_right']));case 8:position = _context7.sent;_context7.next = 11;return (
                                    be_vpn.ecall('get_site_conf', [url]));case 11:site_conf = _context7.sent;_context7.t0 =
                                !be_ext.get('is_premium');if (!_context7.t0) {_context7.next = 17;break;}_context7.next = 16;return (
                                    be_trial.ecall('is_trial_expired', [root_url]));case 16:_context7.t0 = _context7.sent;case 17:is_trial_ended = _context7.t0;_context7.next = 20;return (
                                    be_trial.ecall('get_trial_active', [root_url]));case 20:trial = _context7.sent;_context7.next = 23;return (
                                    be_trial.ecall('is_trial_grace_period',
                                    [root_url]));case 23:is_grace_period = _context7.sent;_context7.next = 26;return (
                                    be_info.ecall('get_site_storage', [root_url,
                                    'force_trial']));case 26:force_trial = _context7.sent;
                                force_country = force_trial && force_trial.country;if (!
                                force_trial) {_context7.next = 31;break;}_context7.next = 31;return (

                                    be_info.ecall('set_site_storage', [root_url, 'force_trial',
                                    null]));case 31:

                                rule_enabled = get_enabled_rule();
                                if (rule_enabled && !trial && site_conf && site_conf.require_plus &&
                                !be_ext.get('is_premium') && !is_grace_period)
                                {
                                    _perr('rule_without_trial', site_conf);
                                    be_vpn.fcall('stop_vpn', [url, get_tab_id()]);
                                    rule_enabled = null;
                                }
                                mode = void 0, slide = void 0, countries = void 0, country = void 0;
                                src_country = be_info.get('country');
                                suggestion_conf = _util6.default.get_suggestion_conf(site_conf, src_country) ||
                                {};
                                suggested = force_country || suggestion_conf.proxy;if (!(
                                opt.suggest_country || opt.force_suggestion)) {_context7.next = 42;break;}_context7.next = 40;return (

                                    get_all_countries(src_country));case 40:suggested = _context7.sent;
                                if (opt.suggest_country)
                                {
                                    suggested = suggested.filter(function (c) {return c != opt.suggest_country;});
                                    suggested.unshift(opt.suggest_country);
                                }case 42:

                                if (suggested && !Array.isArray(suggested))
                                suggested = [suggested];if (!(
                                force_country && !is_trial_ended && !trial)) {_context7.next = 61;break;}

                                country = force_country;if (!
                                user) {_context7.next = 57;break;}_context7.prev = 46;_context7.next = 49;return (

                                    start_trial(country));case 49:trial = _context7.sent;_context7.next = 54;break;case 52:_context7.prev = 52;_context7.t1 = _context7['catch'](46);case 54:
                                if (trial)
                                {
                                    _do_unblock(country, trial);
                                    mode = WATERMARK;
                                }_context7.next = 59;break;case 57:



                                mode = SUGGESTION;
                                slide = 'login';case 59:_context7.next = 86;break;case 61:if (!(


                                (!rule_enabled || is_grace_period) && suggested &&
                                suggested.length && !trial)) {_context7.next = 84;break;}

                                mode = SUGGESTION;if (!
                                suggested) {_context7.next = 73;break;}

                                suggested = suggested.map(function (c) {return c.toLowerCase();});
                                all_index = suggested.indexOf('*');if (!(
                                all_index != -1)) {_context7.next = 72;break;}_context7.next = 69;return (

                                    get_all_countries(src_country));case 69:all = _context7.sent;
                                all = all.filter(function (c) {return !suggested.includes(c);});
                                (_suggested = suggested).splice.apply(_suggested, [all_index, 1].concat(_toConsumableArray(all)));case 72:

                                countries = suggested;case 73:

                                slide = is_trial_ended ? 'trial_subscribe' : 'suggestion';if (!
                                is_trial_ended) {_context7.next = 82;break;}

                                rule = get_rule();_context7.t2 =
                                force_country || rule && rule.country;if (_context7.t2) {_context7.next = 81;break;}_context7.next = 80;return (
                                    be_info.ecall('get_site_storage', [root_url,
                                    'trial.country']));case 80:_context7.t2 = _context7.sent;case 81:country = _context7.t2;case 82:_context7.next = 86;break;case 84:




                                country = rule_enabled && rule_enabled.country || 'us';
                                mode = WATERMARK;case 86:

                                if (0 && _util8.default.must_verify_email(user))
                                mode = VERIFY_EMAIL;
                                (0, _jquery2.default)('html').css({ width: '100%', height: '100%', maxWidth: '100%',
                                    maxHeight: '100%' });
                                (0, _jquery2.default)('body').css({ animation: 'none' });
                                el = (0, _jquery2.default)('<div class=watermark-popup-root/>').appendTo((0, _jquery2.default)('body'));
                                _reactDom2.default.render(_react2.default.createElement(Watermark_popup, {
                                    on_close: on_close,
                                    on_show_vpn_ui: on_show_vpn_ui,
                                    position: position,
                                    mode: mode,
                                    slide: slide,
                                    user: user,
                                    country: country,
                                    countries: countries,
                                    src_country: src_country,
                                    site_conf: site_conf,
                                    trial: trial,
                                    prefix: opt.prefix }), el[0]);case 91:case 'end':return _context7.stop();}}}, _callee7, this, [[46, 52]]);}));};exports.default =


        E;});})();
//# sourceMappingURL=watermark.js.map
