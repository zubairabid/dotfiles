// LICENSE_CODE ZON
'use strict'; 
define(['jquery', 'underscore', '/util/etask.js', '/bext/pub/browser.js'],
    function($, _, etask, B){
var E = {};
var assign = Object.assign;

function iframe_int(){
    var E_int = {}, $frame, $fade, $, $arrow_anim;

    E_int.init_jquery = function(){ return $ = window.$.noConflict(true); };

    var auto_px = {width: 1, height: 1, top: 1, left: 1, right: 1, bottom: 1,
        'max-width': 1, 'max-height': 1, 'min-width': 1, 'min-height': 1};
    function is_number(n){ return !isNaN(parseFloat(n)) && isFinite(n); }
    function set_css($el, css_styles){
        Object.entries(css_styles).forEach(function(prop){
            var name = prop[0], value = prop[1];
            if (value && is_number(value) && auto_px[name])
                value += 'px';
            $el[0].style.setProperty(name, value, 'important');
        });
        return $el;
    }

    function rm_fade(){
        if (!$fade)
            return;
        $fade.remove();
        $fade = null;
    }

    function set_fade(show){
        if (!show)
        {
            if (!$fade)
                return;
            if ($fade[0].animate)
            {
                $fade[0].animate([{opacity: '1'}, {opacity: '0'}],
                    {duration: 300, easing: 'ease-in'})
                .addEventListener('finish', rm_fade);
            }
            else
                rm_fade();
            return;
        }
        if ($fade)
            return;
        $fade = set_css($('<div>'), {position: 'fixed', border: 'none',
            top: '0', left: '0', width: '100%', height: '100%',
            'background-color': 'rgba(0, 0, 0, 0.3)', visibility: 'visibile',
            'z-index': 2147483646}).appendTo($frame.parent());
        if ($fade[0].animate)
        {
            $fade[0].animate([{opacity: '0'}, {opacity: '1'}],
                {duration: 300, easing: 'ease-in'});
        }
    }

    function animate($el, css, time, cb){
        if (!$el[0].animate)
        {
            set_css($el, css);
            cb();
            return;
        }
        var first = $el[0].getBoundingClientRect();
        set_css($el, Object.assign({'transform-origin': 'top left'}, css));
        var last = $el[0].getBoundingClientRect();
        var scale_x = first.width/last.width;
        var scale_y = first.height/last.height;
        var dx = first.left-last.left;
        var dy = first.top-last.top;
        if (!dx && !dy && scale_x==1 && scale_y==1)
            return void cb();
        var translate = 'translate('+dx+'px, '+dy+'px)';
        var scale = 'scale('+scale_x+', '+scale_y+')';
        $el[0].animate([
            {transform: translate+' '+scale},
            {transform: 'translate(0, 0) scale(1, 1)'}
        ], {duration: time||200, easing: 'ease-in'})
        .addEventListener('finish', function(){
            if (cb)
                cb();
        });
    }

    function get_pos_css($el){
        var rect = $el[0].getBoundingClientRect();
        return {position: 'fixed', 'z-index': 2147483647, height: rect.height,
            width: rect.width, top: rect.top, left: rect.left};
    }

    function animate_iframe($el, css, time, no_scale_anim){
        if (no_scale_anim)
            return animate($el, css, time);
        var prev_pos = get_pos_css($el);
        set_css($el, css);
        var next_pos = get_pos_css($el);
        if (JSON.stringify(prev_pos)==JSON.stringify(next_pos))
            return;
        set_css($el, {opacity: 0});
        var $dummy = set_css($('<div>'), Object.assign(prev_pos,
            {background: 'white'})).insertAfter($el);
        animate($dummy, next_pos, time, function(){
            set_css($el, {opacity: 1});
            $dummy.remove();
        });
    }

    E_int.add = function(opt, styles){
        if ($frame)
            return $frame;
        var css = Object.assign({position: 'absolute', border: 'none',
            overflow: 'hidden', visibility: 'visibile', 'z-index': 100000},
            styles||{});
        $frame = set_css($('<iframe>'), css)
            .appendTo(opt.parent||document.body);
        if (opt.url)
            $frame.attr('src', opt.url);
        return $frame;
    };

    E_int.resize = function(opt){
        if (!$frame)
            return;
        var css = {width: opt.width, height: opt.height,
            margin: opt.margin||''};
        if (opt.top!==undefined)
            css.top = opt.top;
        if (opt.left!==undefined)
            css.left = opt.left;
        if (opt.right!==undefined)
            css.right = opt.right;
        if (opt.bottom!==undefined)
            css.bottom = opt.bottom;
        if (opt.animate)
            animate_iframe($frame, css, opt.animation_time, opt.no_scale_anim);
        else
            set_css($frame, opt);
        if (opt.fade!==undefined)
            set_fade(opt.fade);
    };

    E_int.show_arrow_anim = function(opt){
        if ($arrow_anim)
            $arrow_anim.remove();
        $arrow_anim = set_css($('<iframe>'), Object.assign({
            position: 'fixed',
            border: 'none',
            overflow: 'hidden',
            visibility: 'visibile',
            'z-index': 2147483647,
            'pointer-events': 'none',
        }, opt.css)).attr('src', opt.url).appendTo($frame.parent());
    };

    E_int.hide_arrow_anim = function(){
        if ($arrow_anim)
            $arrow_anim.remove();
        $arrow_anim = null;
    };

    E_int.remove = function(){
        if (!$frame)
            return;
        rm_fade();
        $frame.remove();
        $frame = null;
        E_int.hide_arrow_anim();
    };
    E_int.css = set_css;

    return E_int;
}

E.get_inject_code = function(func, opt){
    if (opt.no_func_wrap)
        return opt.func_is_str ? func : func.toString();
    return '('+func.toString()+')(('+iframe_int.toString()+')(),'
    +JSON.stringify(opt||{})+')';
};

E.inject = function(tab_id, func, opt, details){
    details = details||{};
    var tabapi = B.tabid2api(tab_id);
    var code = E.get_inject_code(func, opt);
    if (B.have['tabs.executeScript.matchAboutBlank'])
        details.matchAboutBlank = true;
    if (!window.chrome)
    {
        return etask({cancel: true}, [function(){
            return etask.cb_apply(B.tabs, '.execute_script', [tabapi,
                assign({file: ['jquery.min.js'], code: code}, details)]);
        }]);
    }
    return etask({cancel: true}, [function(){
        return etask.cb_apply(B.tabs, '.execute_script', [tabapi,
            assign({file: '/js/jquery.min.js'}, details)]);
    }, function(){
        return etask.cb_apply(B.tabs, '.execute_script', [tabapi,
            assign({code: code}, details)]);
    }]);
};

E.execute = function(tab_id, func, opt){
    B.tabs.execute_script(B.tabid2api(tab_id), {allFrames: true,
        code: '('+func.toString()+')('+JSON.stringify(opt||{})+')'});
};

return E;
});
