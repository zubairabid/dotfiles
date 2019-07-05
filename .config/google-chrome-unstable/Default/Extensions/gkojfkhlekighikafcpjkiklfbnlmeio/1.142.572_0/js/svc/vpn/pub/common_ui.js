// LICENSE_CODE ZON
;(function () {
    'use strict'; var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}
    define(['react', 'react-dom', '/util/etask.js', '/util/url.js'],
    function (React, ReactDOM, etask, zurl) {
        var E = {};

        var T = function T(props) {
            return typeof props == 'string' ? props : props.children;
        };

        E.Search_field = function (_React$Component) {_inherits(Search_field, _React$Component);function Search_field() {var _ref;var _temp, _this, _ret;_classCallCheck(this, Search_field);for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {args[_key] = arguments[_key];}return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Search_field.__proto__ || Object.getPrototypeOf(Search_field)).call.apply(_ref, [this].concat(args))), _this), _this.
                state = { variants: [], search_str: '' }, _this.
                on_focus = function () {
                    if (_this.props.on_focus)
                    _this.props.on_focus();
                    _this.setState({ show_dropdown: true });
                }, _this.
                on_blur = function () {
                    setTimeout(function () {return _this.setState({ show_dropdown: false });}, 100);
                }, _this.
                on_key_press = function (e) {
                    if (e.key != 'Enter')
                    return;
                    _this.on_search();
                }, _this.
                on_change = function (e) {
                    e.preventDefault();
                    var search_str = e.target.value;var _this$props$top_urls =
                    _this.props.top_urls,top_urls = _this$props$top_urls === undefined ? [] : _this$props$top_urls;
                    var variants = top_urls.filter(function (r) {return r.startsWith(search_str);});
                    if (!variants.length)
                    variants = top_urls.filter(function (r) {return r.includes(search_str);});
                    variants = variants.slice(0, 1);
                    _this.setState({ search_str: search_str, variants: variants });
                }, _this.
                on_search = function (e) {var _this$state =
                    _this.state,search_str = _this$state.search_str,variants = _this$state.variants;var
                    on_redirect = _this.props.on_redirect;
                    var res = variants.find(function (r) {return r.startsWith(search_str);});
                    if (res)
                    search_str = res;
                    var redirect_url = zurl.is_valid_url(search_str) ?
                    zurl.add_proto(search_str) :
                    'https://google.com/search?q=' + encodeURIComponent(search_str);
                    on_redirect(redirect_url);
                }, _this.
                on_dd_select = function (v) {
                    _this.setState({ show_dropdown: true, search_str: v }, _this.on_search);
                }, _temp), _possibleConstructorReturn(_this, _ret);}_createClass(Search_field, [{ key: 'render', value: function render()
                {var _this2 = this;var _state =
                    this.state,variants = _state.variants,show_dropdown = _state.show_dropdown,search_str = _state.search_str;
                    return React.createElement('div', { className: 'search-field' },
                    React.createElement('input', { type: 'text', onFocus: this.on_focus,
                        onBlur: this.on_blur, placeholder: 'Enter site to unblock',
                        onKeyPress: this.on_key_press, onChange: this.on_change,
                        value: search_str }),
                    React.createElement('button', { onClick: this.on_search }),
                    search_str && show_dropdown && React.createElement('ul', { className: 'dropdown' },
                    variants.map(function (v) {return (
                            React.createElement('li', { key: v, onClick: function onClick() {return _this2.on_dd_select(v);} }, v));})));


                } }]);return Search_field;}(React.Component);


        var all_plans = {
            free: { name: 'Free', price: 'Free' },
            '1m': { name: '1 Month', price: '11.95', total_price: '11.95',
                period: 'month' },
            '6m': { name: '6 Month', price: '9.00', total_price: '54', discount: 24,
                regular_price: '71.70', period: '6 months' },
            '1y': { name: '1 Year', price: '6.99', total_price: '83.88', discount: 41,
                regular_price: '143.40', period: 'year' },
            '2y': { name: '2 Year', price: '3.99', total_price: '95.75', discount: 66,
                regular_price: '286.80', period: '2 years' },
            '3y': { name: '3 Year', price: '2.99', total_price: '107.55', discount: 75,
                regular_price: '107.55', period: '3 years' } };


        var Plan_name = function Plan_name(props) {
            var plan = all_plans[props.plan];
            return React.createElement('div', { className: 'plan-name' }, React.createElement(T, null, plan.name));
        };

        var Month_price = function Month_price(props) {
            var is_free = props.plan == 'free';
            var plan = all_plans[props.plan];
            return (
                React.createElement('div', { className: 'price' },
                !is_free && '$', React.createElement('span', { className: 'amount' }, plan.price),
                !is_free && React.createElement(T, null, '/mo')));


        };

        var Billed_text = function Billed_text(props) {
            var plan = all_plans[props.plan];
            if (!plan.total_price)
            return null;
            var billed = plan.period ? React.createElement(T, null, 'billed every ', plan.period) : null;
            var regular_price = plan.regular_price ?
            React.createElement('span', { className: 'regular-price' }, '$', plan.regular_price) : null;
            return (
                React.createElement('div', { className: 'sub-title' },
                regular_price, ' $', plan.total_price, ' ', billed));


        };

        var Discount = function Discount(props) {
            var plan = all_plans[props.plan];
            if (!plan || !plan.discount)
            return null;
            return (
                React.createElement('div', { className: 'plan-discount' },
                React.createElement(T, null, 'Save ', React.createElement('span', null, plan.discount), '%')));


        };

        E.Plan = function (_React$PureComponent) {_inherits(Plan, _React$PureComponent);function Plan() {_classCallCheck(this, Plan);return _possibleConstructorReturn(this, (Plan.__proto__ || Object.getPrototypeOf(Plan)).apply(this, arguments));}_createClass(Plan, [{ key: 'render', value: function render()
                {
                    var props = this.props,plan = props.plan;
                    var img_map = { '1m': 3, '6m': 4, '1y': 5, '2y': 5, '3y': 5 };
                    return (
                        React.createElement('a', { className: 'plan-btn plan-btn-' + plan,
                            href: props.href, target: '_blank', rel: 'noopener noreferrer',
                            onClick: function onClick() {return props.on_click(plan);} },
                        React.createElement(Discount, { plan: plan }),
                        React.createElement('div', { className: 'plan-img plan-img-' + img_map[plan] }),
                        React.createElement(Plan_name, { plan: plan }),
                        React.createElement(Month_price, { plan: plan }),
                        React.createElement(Billed_text, { plan: plan }),
                        React.createElement('ul', null,
                        React.createElement('li', null, React.createElement(T, null, 'Unblock any site')),
                        React.createElement('li', null, React.createElement(T, null, 'Unlimited video streaming')),
                        React.createElement('li', null, React.createElement(T, null, '10 connected devices')),
                        React.createElement('li', null, React.createElement(T, null, 'HD video streaming')),
                        React.createElement('li', null, React.createElement(T, null, 'Online privacy & security'))),

                        React.createElement('div', { className: 'moneyback' },
                        React.createElement(T, null, '30-day money-back guarantee')),

                        React.createElement('div', { className: 'payment-methods' },
                        React.createElement('div', { className: 'mastercard' }),
                        React.createElement('div', { className: 'visa' }),
                        React.createElement('div', { className: 'paypal' }))));



                } }]);return Plan;}(React.PureComponent);


        E.Trial_free_plan = function (_React$PureComponent2) {_inherits(Trial_free_plan, _React$PureComponent2);function Trial_free_plan() {_classCallCheck(this, Trial_free_plan);return _possibleConstructorReturn(this, (Trial_free_plan.__proto__ || Object.getPrototypeOf(Trial_free_plan)).apply(this, arguments));}_createClass(Trial_free_plan, [{ key: 'render', value: function render()
                {var
                    props = this.props;
                    var cls = 'plan-btn plan-btn-free' + (props.need_wait ? ' need-wait' :
                    '');
                    return (
                        React.createElement('a', { className: cls, onClick: function onClick() {return props.on_click('free');} },
                        React.createElement('div', { className: 'plan-img plan-img-2' }),
                        React.createElement('div', { className: 'plan-name' }, React.createElement(T, null, 'Free')),
                        React.createElement('div', { className: 'price' },
                        React.createElement('span', { className: 'amount' }, React.createElement(T, null, 'Free'))),

                        React.createElement('div', { className: 'sub-title' }, props.minutes_per_day),
                        React.createElement('ul', null,
                        React.createElement('li', null, props.minutes_per_day, ' ', React.createElement(T, null, 'for ', React.createElement('span', { className: 'site-name' },
                        props.site))),
                        React.createElement('li', null, React.createElement(T, null, '2 connected devices')),
                        React.createElement('li', null, React.createElement(T, null, 'SD video streaming'))),

                        React.createElement('div', { className: 'trial-title' },
                        props.waiting ?
                        React.createElement(T, null, 'Starting in...') :
                        props.trial_left ?
                        React.createElement(T, null, 'Remaining time') :
                        React.createElement(T, null, 'Get more time')),

                        React.createElement('div', { className: props.waiting ? 'wait-time' : 'trial-time' },
                        props.time)));



                } }]);return Trial_free_plan;}(React.PureComponent);


        E.Free_plan = function (_React$PureComponent3) {_inherits(Free_plan, _React$PureComponent3);function Free_plan() {_classCallCheck(this, Free_plan);return _possibleConstructorReturn(this, (Free_plan.__proto__ || Object.getPrototypeOf(Free_plan)).apply(this, arguments));}_createClass(Free_plan, [{ key: 'render', value: function render()
                {var
                    props = this.props;
                    return (
                        React.createElement('a', { className: 'plan-btn plan-btn-free',
                            onClick: function onClick() {return props.on_click('free');} },
                        React.createElement('div', { className: 'plan-img plan-img-2' }),
                        React.createElement('div', { className: 'plan-name' }, React.createElement(T, null, 'Free')),
                        React.createElement('div', { className: 'price' },
                        React.createElement('span', { className: 'amount' }, React.createElement(T, null, 'Free'))),

                        props.sub_title &&
                        React.createElement('div', { className: 'sub-title' }, React.createElement(T, null, props.sub_title)),
                        React.createElement('ul', null,
                        props.list.map(function (v, i) {return React.createElement('li', { key: i }, React.createElement(T, null, v));}))));



                } }]);return Free_plan;}(React.PureComponent);


        return E;});})();
//# sourceMappingURL=common_ui.js.map
