// LICENSE_CODE ZON
'use strict'; 
define(['jquery', 'underscore', '/util/etask.js', '/bext/pub/browser.js'],
    function($, _, etask, B){
var E = {};
var assign = Object.assign;

function iframe_int(){
    var E_int = {}, $frame, $fade, $, $arrow_anim;

    E_int.init_jquery = function(){ return $ = window.$.noConflict(true); };

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
        $fade = $('<div>').css({position: 'fixed', border: 'none',
            top: '0', left: '0', width: '100%', height: '100%',
            'background-color': 'rgba(0, 0, 0, 0.3)', visibility: 'visibile',
            zIndex: 2147483646}).appendTo($frame.parent());
        if ($fade[0].animate)
        {
            $fade[0].animate([{opacity: '0'}, {opacity: '1'}],
                {duration: 300, easing: 'ease-in'});
        }
    }

    function animate($el, css, time, cb){
        if (!$el[0].animate)
        {
            $el.css(css);
            cb();
            return;
        }
        var first = $el[0].getBoundingClientRect();
        $el.css(Object.assign({'transform-origin': 'top left'}, css));
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

    function animate_iframe($el, css, time, no_scale_anim){
        if (no_scale_anim)
            return animate($el, css, time);
        var prev_css = $el.attr('style');
        $el.css(css);
        if (prev_css==$el.attr('style'))
            return;
        $el.css({opacity: 0});
        var $dummy = $('<div>').attr('style', prev_css)
            .css({background: 'white'}).insertAfter($el);
        animate($dummy, css, time, function(){
            $el.css({opacity: 1});
            $dummy.remove();
        });
    }

    E_int.add = function(opt){
        if ($frame)
            return $frame;
        $frame = $('<iframe>').css({position: 'absolute', border: 'none',
            overflow: 'hidden', visibility: 'visibile', zIndex: 100000})
            .appendTo(opt.parent||document.body);
        if (opt.url)
            $frame.attr('src', opt.url);
        return $frame;
    };

    E_int.resize = function(opt){
        if (!$frame)
            return;
        var css = {width: opt.width, height: opt.height};
        if (opt.top)
            css.top = opt.top;
        if (opt.left)
            css.left = opt.left;
        if (opt.right)
            css.right = opt.right;
        if (opt.bottom)
            css.bottom = opt.bottom;
        if (opt.animate)
            animate_iframe($frame, css, opt.animation_time, opt.no_scale_anim);
        else
            $frame.css(css);
        if (opt.fade!==undefined)
            set_fade(opt.fade);
    };

    E_int.show_arrow_anim = function(opt){
        if ($arrow_anim)
            $arrow_anim.remove();
        $arrow_anim = $('<iframe>').attr('src', opt.url).css(Object.assign({
            position: 'fixed',
            border: 'none',
            overflow: 'hidden',
            visibility: 'visibile',
            zIndex: 2147483647,
            'pointer-events': 'none',
        }, opt.css)).appendTo($frame.parent());
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
