// LICENSE_CODE ZON
'use strict'; 
(function(){
var define;
var is_node_ff = typeof module=='object' && module.exports;
if (!is_node_ff)
    define = self.define;
define(['jquery'], function($){
var E = {};
$.ajaxTransport('+binary', function(options, originalOptions, jqXHR){
    if (!(window.FormData && ((options.dataType &&
        (options.dataType=='binary')) || (options.data &&
        ((window.ArrayBuffer && options.data instanceof ArrayBuffer) ||
        (window.Blob && options.data instanceof Blob))))))
    {
        return; 
    }
    return {
        send: function(headers, cb){
            var xhr = new XMLHttpRequest();
            var url = options.url, type = options.type;
            var async = options.async || true;
            var dataType = options.responseType=='arraybuffer' ?
                'arraybuffer' : 'blob';
            var data = options.data || null;
            var username = options.username || null;
            var password = options.password || null;
            xhr.addEventListener('load', function(){
                var data = {};
                if (options.responseType=='dataurl')
                {
                    var reader = new FileReader();
                    reader.onload = function(){
                        data[options.dataType] = reader.result;
                        cb(xhr.status, xhr.statusText, data,
                            xhr.getAllResponseHeaders());
                    };
                    reader.readAsDataURL(xhr.response);
                    return;
                }
                data[options.dataType] = xhr.response;
                cb(xhr.status, xhr.statusText, data,
                    xhr.getAllResponseHeaders());
            });

            xhr.open(type, url, async, username, password);
            for (var i in headers)
                xhr.setRequestHeader(i, headers[i]);
            xhr.responseType = dataType;
            xhr.send(data);
        },
        abort: function(){},
    };
});
return E; }); })();
