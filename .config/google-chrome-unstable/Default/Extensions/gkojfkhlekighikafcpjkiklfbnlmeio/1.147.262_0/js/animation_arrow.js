// LICENSE_CODE ZON
'use strict'; 

function init(){
    var qs = location.search.substring(1);
    var opt = {};
    qs.split('&').forEach(function(arg){
        var pair = arg.split('=');
        opt[pair[0]] = decodeURIComponent(pair[1]);
    });
    var root = document.querySelector('.moving-anim');
    var arrow = document.querySelector('.arrow');
    var image = document.querySelector('.watermark-image');
    root.classList.add(opt.direction);
    arrow.classList.add('arrow-'+opt.direction);
    image.style.width = opt.width+'px';
    image.style.height = opt.height+'px';
}

document.addEventListener('DOMContentLoaded', init);
