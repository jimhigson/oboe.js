/*!
 * v2.1.4-114-g2338caf
 * 
 */
!function(n,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define("oboe",[],t):"object"==typeof exports?exports.oboe=t():n.oboe=t()}(global,(function(){return function(n){var t={};function e(r){if(t[r])return t[r].exports;var i=t[r]={i:r,l:!1,exports:{}};return n[r].call(i.exports,i,i.exports,e),i.l=!0,i.exports}return e.m=n,e.c=t,e.d=function(n,t,r){e.o(n,t)||Object.defineProperty(n,t,{enumerable:!0,get:r})},e.r=function(n){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(n,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(n,"__esModule",{value:!0})},e.t=function(n,t){if(1&t&&(n=e(n)),8&t)return n;if(4&t&&"object"==typeof n&&n&&n.__esModule)return n;var r=Object.create(null);if(e.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:n}),2&t&&"string"!=typeof n)for(var i in n)e.d(r,i,function(t){return n[t]}.bind(null,i));return r},e.n=function(n){var t=n&&n.__esModule?function(){return n.default}:function(){return n};return e.d(t,"a",t),t},e.o=function(n,t){return Object.prototype.hasOwnProperty.call(n,t)},e.p="",e(e.s=4)}([function(n,t){n.exports=require("url")},function(n,t,e){var r=t.http=e(2),i=t.https=e(3),o=e(0);function u(n){return"string"==typeof n&&(n=o.parse(n)),"https:"===n.protocol?i:r}t.get=function(n,t){return u(n).get(n,t)},t.request=function(n,t){return u(n).request(n,t)},t.getModule=u},function(n,t){n.exports=require("http")},function(n,t){n.exports=require("https")},function(n,t,e){"use strict";e.r(t);var r=c((function(n,t){var e=t.length;return c((function(r){for(var i=0;i<r.length;i++)t[e+i]=r[i];return t.length=e+r.length,n.apply(this,t)}))}));c((function(n){var t=m(n);function e(n,t){return[f(n,t)]}return c((function(n){return w(e,n,t)[0]}))}));function i(n,t){return function(){return n.call(this,t.apply(this,arguments))}}function o(n){return function(t){return t[n]}}var u=c((function(n){return c((function(t){for(var e,r=0;r<o("length")(n);r++)if(e=f(t,n[r]))return e}))}));function f(n,t){return t.apply(void 0,n)}function c(n){var t=n.length-1,e=Array.prototype.slice;if(0===t)return function(){return n.call(this,e.call(arguments))};if(1===t)return function(){return n.call(this,arguments[0],e.call(arguments,1))};var r=Array(n.length);return function(){for(var i=0;i<t;i++)r[i]=arguments[i];return r[t]=e.call(arguments,t),n.apply(this,r)}}function a(n,t){return function(e){return n(e)&&t(e)}}function s(){}function l(){return!0}function d(n){return function(){return n}}function p(n,t){return[n,t]}var v=o(0),h=o(1);function m(n){return S(n.reduce((t=p,function(n,e){return t(e,n)}),null));var t}var b=c(m);function g(n){return w((function(n,t){return n.unshift(t),n}),[],n)}function y(n,t){return t?p(n(v(t)),y(n,h(t))):null}function w(n,t,e){return e?n(w(n,t,h(e)),v(e)):t}function x(n,t,e){return function n(e,r){return e?t(v(e))?(r(v(e)),h(e)):p(v(e),n(h(e),r)):null}(n,e||s)}function O(n,t){n&&(v(n).apply(null,t),O(h(n),t))}function S(n){return function n(t,e){return t?n(h(t),p(v(t),e)):e}(n,null)}function j(n,t){return t&&t.constructor===n}var I=o("length"),L=r(j,String);function C(n){return void 0!==n}function k(n,t){return function(n){return null!==n&&"object"==typeof n}(t)&&function n(t,e){return!e||t(v(e))&&n(t,h(e))}((function(n){return n in t}),n)}function _(n,t,e,r,i,o,u){return i=i?JSON.parse(JSON.stringify(i)):{},r?(L(r)||(r=JSON.stringify(r),i["Content-Type"]=i["Content-Type"]||"application/json"),i["Content-Length"]=i["Content-Length"]||r.length):r=null,n(e||"GET",function(n,t){return!1===t&&(-1===n.indexOf("?")?n+="?":n+="&",n+="_="+(new Date).getTime()),n}(t,u),r,i,o||!1)}function E(n,t,e){var r,i;function o(n){return function(t){return t.id===n}}return{on:function(e,o){var u={listener:e,id:o||e};return t&&t.emit(n,e,u.id),r=p(u,r),i=p(e,i),this},emit:function(){O(i,arguments)},un:function(t){var u;r=x(r,o(t),(function(n){u=n})),u&&(i=x(i,(function(n){return n===u.listener})),e&&e.emit(n,u.listener,u.id))},listeners:function(){return i},hasListener:function(n){return C(function n(t,e){return e&&(t(v(e))?v(e):n(t,h(e)))}(n?o(n):l,r))}}}function M(n,t){return{key:n,node:t}}var A=o("key"),N=o("node"),T=1,q=T++,R=T++,P=T++,U=T++,B=T++,J=T++,$=T++,z=T++,D=T++,F=T++;function G(n,t,e){try{var r=JSON.parse(t)}catch(n){}return{statusCode:n,body:t,jsonBody:r,thrown:e}}var W={};function H(n){var t=n(q).emit,e=n(R).emit,r=n(J).emit,i=n(B).emit;function o(n,t,e){N(v(n))[t]=e}function u(n,e,r){n&&o(n,e,r);var i=p(M(e,r),n);return t(i),i}var f={};return f[D]=function(n,t){if(!n)return r(t),u(n,W,t);var e=function(n,t){var e=N(v(n));return j(Array,e)?u(n,I(e),t):n}(n,t),i=h(e),f=A(v(e));return o(i,f,t),p(M(f,t),i)},f[F]=function(n){return e(n),h(n)||i(N(v(n)))},f[z]=u,f}function K(n,t){var e={node:n(R),path:n(q)};function r(t,e,r){var i=n(t).emit;e.on((function(n){var t=r(n);!1!==t&&function(n,t,e){var r=S(e);n(t,g(h(y(A,r))),g(y(N,r)))}(i,N(t),n)}),t),n("removeListener").on((function(r){r===t&&(n(r).listeners()||e.un(t))}))}n("newListener").on((function(n){var i=/(node|path):(.*)/.exec(n);if(i){var o=e[i[1]];o.hasListener(n)||r(n,o,t(i[2]))}}))}var Q,V,X,Y,Z,nn,tn,en,rn,on,un,fn=(Q=c((function(n){return n.unshift(/^/),(t=RegExp(n.map(o("source")).join(""))).exec.bind(t);var t})),Y=Q(V=/(\$?)/,/([\w-_]+|\*)/,X=/(?:{([\w ]*?)})?/),Z=Q(V,/\["([^"]+)"\]/,X),nn=Q(V,/\[(\d+|\*)\]/,X),tn=Q(V,/()/,/{([\w ]*?)}/),en=Q(/\.\./),rn=Q(/\./),on=Q(V,/!/),un=Q(/$/),function(n){return n(u(Y,Z,nn,tn),en,rn,on,un)})((function(n,t,e,o,f){var c=i(A,v),s=i(N,v);function d(n,t){return!!t[1]?a(n,v):n}function p(n){if(n===l)return l;return a((function(n){return c(n)!==W}),i(n,h))}function g(){return function(n){return c(n)===W}}function y(n,t,e,r,i){var o=n(e);if(o){var u=function(n,t,e){return w((function(n,t){return t(n,e)}),t,n)}(t,r,o);return i(e.substr(I(o[0])),u)}}function x(n,t){return r(y,n,t)}var O=u(x(n,b(d,(function(n,t){var e=t[3];return e?a(i(r(k,m(e.split(/\W+/))),s),n):n}),(function(n,t){var e=t[2];return a(e&&"*"!==e?function(n){return String(c(n))===e}:l,n)}),p)),x(t,b((function(n){if(n===l)return l;var t=g(),e=n,r=p((function(n){return i(n)})),i=u(t,e,r);return i}))),x(e,b()),x(o,b(d,g)),x(f,b((function(n){return function(t){var e=n(t);return!0===e?v(t):e}}))),(function(n){throw Error('"'+n+'" could not be tokenised')}));function S(n,t){return t}function j(n,t){return O(n,t,n?j:S)}return function(n){try{return j(n,l)}catch(t){throw Error('Could not compile "'+n+'" because '+t.message)}}}));function cn(n,t){var e,i=/^(node|path):./,o=n(B),u=n(U).emit,a=n(P).emit,l=c((function(t,r){if(e[t])f(r,e[t]);else{var o=n(t),u=r[0];i.test(t)?p(o,h(u)):o.on(u)}return e}));function p(n,t,r){r=r||t;var i=v(t);return n.on((function(){var t=!1;e.forget=function(){t=!0},f(arguments,i),delete e.forget,t&&n.un(r)}),r),e}function v(n){return function(){try{return n.apply(e,arguments)}catch(n){setTimeout((function(){throw new Error(n.message)}))}}}function h(n){return function(){var t=n.apply(this,arguments);C(t)&&(t===vn.drop?u():a(t))}}function m(t,e,r){var i;i="node"===t?h(r):r,p(function(t,e){return n(t+":"+e)}(t,e),i,r)}function b(n,t,r){return L(t)?m(n,t,r):function(n,t){for(var e in t)m(n,e,t[e])}(n,t),e}return n(J).on((function(n){e.root=d(n)})),n("start").on((function(n,t){e.header=function(n){return n?t[n]:t}})),e={on:l,addListener:l,removeListener:function(t,r,i){if("done"===t)o.un(r);else if("node"===t||"path"===t)n.un(t+":"+r,i);else{var u=r;n(t).un(u)}return e},emit:n.emit,node:r(b,"node"),path:r(b,"path"),done:r(p,o),start:r((function(t,r){return n(t).on(v(r),r),e}),"start"),fail:n("fail").on,abort:n($).emit,header:s,root:s,source:t}}function an(n){var t,e,r,i,o=n(z).emit,u=n(D).emit,f=n(F).emit,c=n("fail").emit,a=/[\\"\n]/g,s=0,l=s++,d=s++,p=s++,v=s++,h=s++,m=s++,b=s++,g=s++,y=s++,w=s++,x=s++,O=s++,S=s++,j=s++,I=s++,L=s++,C=s++,k=s++,_=s++,E=s++,M=65536,A="",N=!1,T=!1,q=l,R=[],P=null,U=0,B=0,J=0,$=0,W=1;function H(n){void 0!==i&&(u(i),f(),i=void 0),t=Error(n+"\nLn: "+W+"\nCol: "+$+"\nChr: "+e),c(G(void 0,void 0,t))}function K(n){return"\r"===n||"\n"===n||" "===n||"\t"===n}n("data").on((function(n){if(t)return;if(T)return H("Cannot write after close");var c=0;e=n[0];for(;e&&(c>0&&(r=e),e=n[c++]);)switch(J++,"\n"===e?(W++,$=0):$++,q){case l:if("{"===e)q=p;else if("["===e)q=h;else if(!K(e))return H("Non-whitespace before {[.");continue;case g:case p:if(K(e))continue;if(q===g)R.push(y);else{if("}"===e){u({}),f(),q=R.pop()||d;continue}R.push(v)}if('"'!==e)return H('Malformed object key should start with " ');q=b;continue;case y:case v:if(K(e))continue;if(":"===e)q===v?(R.push(v),void 0!==i&&(u({}),o(i),i=void 0),B++):void 0!==i&&(o(i),i=void 0),q=d;else if("}"===e)void 0!==i&&(u(i),f(),i=void 0),f(),B--,q=R.pop()||d;else{if(","!==e)return H("Bad object");q===v&&R.push(v),void 0!==i&&(u(i),f(),i=void 0),q=g}continue;case h:case d:if(K(e))continue;if(q===h){if(u([]),B++,q=d,"]"===e){f(),B--,q=R.pop()||d;continue}R.push(m)}if('"'===e)q=b;else if("{"===e)q=p;else if("["===e)q=h;else if("t"===e)q=w;else if("f"===e)q=S;else if("n"===e)q=C;else if("-"===e)A+=e;else if("0"===e)A+=e,q=20;else{if(-1==="123456789".indexOf(e))return H("Bad value");A+=e,q=20}continue;case m:if(","===e)R.push(m),void 0!==i&&(u(i),f(),i=void 0),q=d;else{if("]"!==e){if(K(e))continue;return H("Bad array")}void 0!==i&&(u(i),f(),i=void 0),f(),B--,q=R.pop()||d}continue;case b:void 0===i&&(i="");var s=c-1;n:for(;;){for(;U>0;)if(P+=e,e=n.charAt(c++),4===U?(i+=String.fromCharCode(parseInt(P,16)),U=0,s=c-1):U++,!e)break n;if('"'===e&&!N){q=R.pop()||d,i+=n.substring(s,c-1);break}if(!("\\"!==e||N||(N=!0,i+=n.substring(s,c-1),e=n.charAt(c++))))break;if(N){if(N=!1,"n"===e?i+="\n":"r"===e?i+="\r":"t"===e?i+="\t":"f"===e?i+="\f":"b"===e?i+="\b":"u"===e?(U=1,P=""):i+=e,e=n.charAt(c++),s=c-1,e)continue;break}a.lastIndex=c;var z=a.exec(n);if(!z){c=n.length+1,i+=n.substring(s,c-1);break}if(c=z.index+1,!(e=n.charAt(z.index))){i+=n.substring(s,c-1);break}}continue;case w:if(!e)continue;if("r"!==e)return H("Invalid true started with t"+e);q=x;continue;case x:if(!e)continue;if("u"!==e)return H("Invalid true started with tr"+e);q=O;continue;case O:if(!e)continue;if("e"!==e)return H("Invalid true started with tru"+e);u(!0),f(),q=R.pop()||d;continue;case S:if(!e)continue;if("a"!==e)return H("Invalid false started with f"+e);q=j;continue;case j:if(!e)continue;if("l"!==e)return H("Invalid false started with fa"+e);q=I;continue;case I:if(!e)continue;if("s"!==e)return H("Invalid false started with fal"+e);q=L;continue;case L:if(!e)continue;if("e"!==e)return H("Invalid false started with fals"+e);u(!1),f(),q=R.pop()||d;continue;case C:if(!e)continue;if("u"!==e)return H("Invalid null started with n"+e);q=k;continue;case k:if(!e)continue;if("l"!==e)return H("Invalid null started with nu"+e);q=_;continue;case _:if(!e)continue;if("l"!==e)return H("Invalid null started with nul"+e);u(null),f(),q=R.pop()||d;continue;case E:if("."!==e)return H("Leading zero not followed by .");A+=e,q=20;continue;case 20:if(-1!=="0123456789".indexOf(e))A+=e;else if("."===e){if(-1!==A.indexOf("."))return H("Invalid number has two dots");A+=e}else if("e"===e||"E"===e){if(-1!==A.indexOf("e")||-1!==A.indexOf("E"))return H("Invalid number has two exponential");A+=e}else if("+"===e||"-"===e){if("e"!==r&&"E"!==r)return H("Invalid symbol in number");A+=e}else A&&(u(parseFloat(A)),f(),A=""),c--,q=R.pop()||d;continue;default:return H("Unknown state: "+q)}J>=M&&(D=0,void 0!==i&&i.length>65536&&(H("Max buffer length exceeded: textNode"),D=Math.max(D,i.length)),A.length>65536&&(H("Max buffer length exceeded: numberNode"),D=Math.max(D,A.length)),M=65536-D+J);var D})),n("end").on((function(){if(q===l)return u({}),f(),void(T=!0);q===d&&0===B||H("Unexpected end");void 0!==i&&(u(i),f(),i=void 0);T=!0}))}var sn=e(0),ln=d(e(1));function dn(n,t,e,r,i,o){var u=!1;function f(t){t.on("data",(function(t){u||n("data").emit(t.toString())})),t.on("end",(function(){u||n("end").emit()}))}L(r)?function(){if(!r.match(/https?:\/\//))throw new Error('Supported protocols when passing a URL into Oboe are http and https. If you wish to use another protocol, please pass a ReadableStream (http://nodejs.org/api/stream.html#stream_class_stream_readable) like oboe(fs.createReadStream("my_file")). I was given the URL: '+r);var c,a,s=(c=r,a=new sn.URL(c),t.request({hostname:a.hostname,port:a.port,path:a.pathname+(a.search||""),method:e,headers:o,protocol:a.protocol}));s.on("response",(function(t){var e,r,i,o=t.statusCode,u="2"===String(o)[0];n("start").emit(t.statusCode,t.headers),u?f(t):(r=function(t){n("fail").emit(G(o,t))},i="",(e=t).on("data",(function(n){i+=n.toString()})),e.on("end",(function(){r(i)})))})),s.on("error",(function(t){n("fail").emit(G(void 0,void 0,t))})),n($).on((function(){u=!0,s.abort()})),i&&s.write(i),s.end()}():f(r)}function pn(n,t,e,r,i){var o=function(){var n={},t=r("newListener"),e=r("removeListener");function r(r){return n[r]=E(r,t,e),n[r]}function i(t){return n[t]||r(t)}return["emit","on","un"].forEach((function(n){i[n]=c((function(t,e){f(e,i(t)[n])}))})),i}();return t&&dn(o,ln(),n,t,e,r),an(o),function(n,t){var e,r={};function i(n){return function(t){e=n(e,t)}}for(var o in t)n(o).on(i(t[o]),r);n(P).on((function(n){var t=v(e),r=A(t),i=h(e);i&&(N(v(i))[r]=n)})),n(U).on((function(){var n=v(e),t=A(n),r=h(e);r&&delete N(v(r))[t]})),n($).on((function(){for(var e in t)n(e).un(r)}))}(o,H(o)),K(o,fn),cn(o,t)}function vn(n){var t=b("resume","pause","pipe"),e=r(k,t);return n?e(n)||L(n)?_(pn,n):_(pn,n.url,n.method,n.body,n.headers,n.withCredentials,n.cached):pn()}vn.drop=function(){return vn.drop};t.default=vn}]).default}));