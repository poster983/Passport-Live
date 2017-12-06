!function(t){function e(r){if(n[r])return n[r].exports;var i=n[r]={i:r,l:!1,exports:{}};return t[r].call(i.exports,i,i.exports,e),i.l=!0,i.exports}var n={};e.m=t,e.c=n,e.d=function(t,n,r){e.o(t,n)||Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:r})},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=17)}([function(t,e){e.urlQuery=(t=>query=Object.keys(t).filter(function(e){return void 0!==t[e]&&null!==t[e]}).map(e=>encodeURIComponent(e)+"="+encodeURIComponent(t[e])).join("&")),e.throwError=(t=>{if(t.isFetch)e=$("<span> ERROR: "+t.response.status+" "+t.message+"</span>").append($("<br/> <span> <strong>"+decodeURIComponent(t.response.headers.get("errormessage"))+"</strong> </span>"));else if(t.status)e=$("<span> ERROR: "+t.status+" "+t.statusText+"</span>").append($("<br/> <span> <strong>"+decodeURIComponent(t.getResponseHeader("errormessage"))+"</strong> </span>"));else if(t.message)e=$("<span> ERROR: "+t.message+"</span>");else var e=$("<span> ERROR! Check The Console For More Details.</span>");Materialize.toast(e,4e3),console.error(t)}),e.fetch=((t,n,r)=>new Promise((i,o)=>{r||(r={}),r.query?r.query="?"+e.urlQuery(r.query):r.query="",r.head||(r.head={}),r.auth&&(r.head["x-xsrf-token"]=getCookie("XSRF-TOKEN")),fetch(n+r.query,{method:t,headers:new Headers({"x-xsrf-token":getCookie("XSRF-TOKEN")}),credentials:"same-origin"}).then(e.fetchStatus).then(e.fetchJSON).then(t=>i(t)).catch(t=>o(t))})),e.fetchStatus=(t=>{if(t.status>=200&&t.status<300)return t;var e=new Error(t.statusText);throw e.isFetch=!0,e.response=t,e}),e.fetchJSON=(t=>t.json()),e.uuidv4=(()=>([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,t=>(t^crypto.getRandomValues(new Uint8Array(1))[0]&15>>t/4).toString(16))),e.setCookie=((t,e,n)=>{var r=new Date;r.setTime(r.getTime()+24*n*60*60*1e3);var i="expires="+r.toUTCString();document.cookie=t+"="+e+";"+i+";path=/"}),e.getCookie=(t=>{var e=("; "+document.cookie).split("; "+t+"=");if(2==e.length)return e.pop().split(";").shift()}),e.distinctKeys=(t=>Object.keys(t.reduce(function(t,e){return Object.assign(t,e)},{}))),e.thisUser=(()=>e.getCookie("ACCOUNT-ID"))},function(t,e,n){(function(){var e,r,i;e=n(2),r=n(3),i=function(t,n,i){return r(e(t),n,i)},t.exports={VERSION:"0.3.2",typeCheck:i,parsedTypeCheck:r,parseType:e}}).call(this)},function(t,e){(function(){function e(t){var e;if(null==(e=t[0]))throw new Error("Unexpected end of input.");return e}function n(t){var n;if(n=e(t),!c.test(n))throw new Error("Expected text, got '"+n+"' instead.");return t.shift()}function r(t,n){var r;if((r=e(t))!==n)throw new Error("Expected '"+n+"', got '"+r+"' instead.");return t.shift()}function i(t,e){return t[0]===e?t.shift():null}function o(t){var o,a,s,c,l;for(o={},r(t,"{"),a=!1;;){if(i(t,"...")){a=!0;break}if(s=function(t){var e,i;return e=n(t),r(t,":"),i=u(t),[e,i]}(t),c=s[0],l=s[1],o[c]=l,i(t,","),"}"===e(t))break}return r(t,"}"),{structure:"fields",of:o,subset:a}}function a(t){switch(t[0]){case"[":return function(t){var n;if(r(t,"["),"]"===e(t))throw new Error("Must specify type of Array - eg. [Type], got [] instead.");return n=u(t),r(t,"]"),{structure:"array",of:n}}(t);case"(":return function(t){var n;if(n=[],r(t,"("),")"===e(t))throw new Error("Tuple must be of at least length 1 - eg. (Type), got () instead.");for(;n.push(u(t)),i(t,","),")"!==e(t););return r(t,")"),{structure:"tuple",of:n}}(t);case"{":return o(t)}}function s(t){var i,o,s,u;if(i=e(t),(o="*"===i)||c.test(i))return s=o?r(t,"*"):n(t),(u=a(t))?(u.type=s,u):{type:s};if(!(u=a(t)))throw new Error("Unexpected character: "+i);return u}function u(t){var n,r,o,a,u;if("::"===e(t))throw new Error("No comment before comment separator '::' found.");for(null!=(n=t[1])&&"::"===n&&(t.shift(),t.shift()),r=[],o={},"Maybe"===e(t)&&(t.shift(),r=[{type:"Undefined"},{type:"Null"}],o={Undefined:!0,Null:!0});a=s(t),u=a.type,o[u]||r.push(a),o[u]=!0,i(t,"|"););return r}var c,l;c=/[\$\w]+/,l=RegExp("\\.\\.\\.|::|->|"+c.source+"|\\S","g"),t.exports=function(t){var e,n;if(!t.length)throw new Error("No type specified.");if(e=t.match(l)||[],function(t,e){for(var n=-1,r=e.length>>>0;++n<r;)if(t===e[n])return!0;return!1}("->",e))throw new Error("Function types are not supported. To validate that something is a function, you may use 'Function'.");try{return u(e)}catch(r){throw n=r,new Error(n.message+" - Remaining tokens: "+JSON.stringify(e)+" - Initial input: '"+t+"'")}}}).call(this)},function(t,e,n){(function(){function e(t,e){if(!(t instanceof Object))return!1;switch(e.structure){case"fields":return function(t,e){var n,i,o,a,s,u,c;n={},i=0;for(o in t)n[o]=!0,i++;a=0;for(s in u=e.of){if(c=u[s],!r(t[s],c))return!1;n[s]&&a++}return e.subset||i===a}(t,e);case"array":return function(t,e){return a(function(t){return r(t,e.of)},t)}(t,e);case"tuple":return function(t,e){var n,i,o,a,s;for(n=0,i=0,a=(o=e.of).length;i<a;++i){if(s=o[i],!r(t[n],s))return!1;n++}return t.length<=n}(t,e)}}function r(t,n){if("Array"!==f.call(n).slice(8,-1))throw new Error("Types must be in an array. Input: "+t+".");return o(function(n){return function(t,n){var r,i,o,a;if(r=n.type,i=n.structure,r)return"*"===r||((o=l[r]||u[r])?o.typeOf===f.call(t).slice(8,-1)&&o.validate(t):r===f.call(t).slice(8,-1)&&(!i||e(t,n)));if(i)return(!(a=c[i])||a===f.call(t).slice(8,-1))&&e(t,n);throw new Error("No type defined. Input: "+t+".")}(t,n)},n)}var i,o,a,s,u,c,l,f={}.toString;i=n(4),o=i.any,a=i.all,s=i.isItNaN,u={Number:{typeOf:"Number",validate:function(t){return!s(t)}},NaN:{typeOf:"Number",validate:s},Int:{typeOf:"Number",validate:function(t){return!s(t)&&t%1==0}},Float:{typeOf:"Number",validate:function(t){return!s(t)}},Date:{typeOf:"Date",validate:function(t){return!s(t.getTime())}}},c={array:"Array",tuple:"Array"},t.exports=function(t,e,n){return null==n&&(n={}),l=n.customTypes||{},r(e,t)}}).call(this)},function(t,e,n){function r(t,e){var n,r=function(i){return t.length>1?function(){var o=i?i.concat():[];return n=e?n||this:this,o.push.apply(o,arguments)<t.length&&arguments.length?r.call(n,o):t.apply(n,o)}:t};return r()}var i,o,a,s,u,c,l,f,h,p={}.toString;i=n(5),o=n(6),a=n(7),s=n(8),u=n(9),c=function(t){return t},l=r(function(t,e){return p.call(e).slice(8,-1)===t}),f=r(function(t,e){var n,r=[];for(n=0;n<t;++n)r.push(e);return r}),s.empty=o.empty,s.slice=o.slice,s.take=o.take,s.drop=o.drop,s.splitAt=o.splitAt,s.takeWhile=o.takeWhile,s.dropWhile=o.dropWhile,s.span=o.span,s.breakStr=o.breakList,(h={Func:i,List:o,Obj:a,Str:s,Num:u,id:c,isType:l,replicate:f}).each=o.each,h.map=o.map,h.filter=o.filter,h.compact=o.compact,h.reject=o.reject,h.partition=o.partition,h.find=o.find,h.head=o.head,h.first=o.first,h.tail=o.tail,h.last=o.last,h.initial=o.initial,h.empty=o.empty,h.reverse=o.reverse,h.difference=o.difference,h.intersection=o.intersection,h.union=o.union,h.countBy=o.countBy,h.groupBy=o.groupBy,h.fold=o.fold,h.foldl=o.foldl,h.fold1=o.fold1,h.foldl1=o.foldl1,h.foldr=o.foldr,h.foldr1=o.foldr1,h.unfoldr=o.unfoldr,h.andList=o.andList,h.orList=o.orList,h.any=o.any,h.all=o.all,h.unique=o.unique,h.uniqueBy=o.uniqueBy,h.sort=o.sort,h.sortWith=o.sortWith,h.sortBy=o.sortBy,h.sum=o.sum,h.product=o.product,h.mean=o.mean,h.average=o.average,h.concat=o.concat,h.concatMap=o.concatMap,h.flatten=o.flatten,h.maximum=o.maximum,h.minimum=o.minimum,h.maximumBy=o.maximumBy,h.minimumBy=o.minimumBy,h.scan=o.scan,h.scanl=o.scanl,h.scan1=o.scan1,h.scanl1=o.scanl1,h.scanr=o.scanr,h.scanr1=o.scanr1,h.slice=o.slice,h.take=o.take,h.drop=o.drop,h.splitAt=o.splitAt,h.takeWhile=o.takeWhile,h.dropWhile=o.dropWhile,h.span=o.span,h.breakList=o.breakList,h.zip=o.zip,h.zipWith=o.zipWith,h.zipAll=o.zipAll,h.zipAllWith=o.zipAllWith,h.at=o.at,h.elemIndex=o.elemIndex,h.elemIndices=o.elemIndices,h.findIndex=o.findIndex,h.findIndices=o.findIndices,h.apply=i.apply,h.curry=i.curry,h.flip=i.flip,h.fix=i.fix,h.over=i.over,h.split=s.split,h.join=s.join,h.lines=s.lines,h.unlines=s.unlines,h.words=s.words,h.unwords=s.unwords,h.chars=s.chars,h.unchars=s.unchars,h.repeat=s.repeat,h.capitalize=s.capitalize,h.camelize=s.camelize,h.dasherize=s.dasherize,h.values=a.values,h.keys=a.keys,h.pairsToObj=a.pairsToObj,h.objToPairs=a.objToPairs,h.listsToObj=a.listsToObj,h.objToLists=a.objToLists,h.max=u.max,h.min=u.min,h.negate=u.negate,h.abs=u.abs,h.signum=u.signum,h.quot=u.quot,h.rem=u.rem,h.div=u.div,h.mod=u.mod,h.recip=u.recip,h.pi=u.pi,h.tau=u.tau,h.exp=u.exp,h.sqrt=u.sqrt,h.ln=u.ln,h.pow=u.pow,h.sin=u.sin,h.tan=u.tan,h.cos=u.cos,h.acos=u.acos,h.asin=u.asin,h.atan=u.atan,h.atan2=u.atan2,h.truncate=u.truncate,h.round=u.round,h.ceiling=u.ceiling,h.floor=u.floor,h.isItNaN=u.isItNaN,h.even=u.even,h.odd=u.odd,h.gcd=u.gcd,h.lcm=u.lcm,h.VERSION="1.1.2",t.exports=h},function(t,e){function n(t,e){var n,r=function(i){return t.length>1?function(){var o=i?i.concat():[];return n=e?n||this:this,o.push.apply(o,arguments)<t.length&&arguments.length?r.call(n,o):t.apply(n,o)}:t};return r()}var r,i,o,a,s,u,c=[].slice,l={}.toString;r=n(function(t,e){return t.apply(null,e)}),i=function(t){return n(t)},o=n(function(t,e,n){return t(n,e)}),a=function(t){return function(e){return function(){return t(e(e)).apply(null,arguments)}}(function(e){return function(){return t(e(e)).apply(null,arguments)}})},s=n(function(t,e,n,r){return t(e(n),e(r))}),u=function(t){var e;return e={},function(){var n,r,i;return n=c.call(arguments),r=function(){var t,e,r,o=[];for(t=0,r=(e=n).length;t<r;++t)i=e[t],o.push(i+l.call(i).slice(8,-1));return o}().join(""),e[r]=r in e?e[r]:t.apply(null,n)}},t.exports={curry:i,flip:o,fix:a,apply:r,over:s,memoize:u}},function(t,e){function n(t,e){var n,r=function(i){return t.length>1?function(){var o=i?i.concat():[];return n=e?n||this:this,o.push.apply(o,arguments)<t.length&&arguments.length?r.call(n,o):t.apply(n,o)}:t};return r()}function r(t,e){for(var n=-1,r=e.length>>>0;++n<r;)if(t===e[n])return!0;return!1}function i(t){return!t}var o,a,s,u,c,l,f,h,p,d,m,g,v,y,b,w,x,j,_,C,O,E,I,k,D,$,R,T,A,S,B,P,M,N,z,L,U,W,K,q,F,V,G,Y,X,H,J,Z,Q,tt,et,nt,rt,it,ot,at,st,ut,ct,lt,ft,ht,pt,dt,mt,gt,vt,yt,bt,wt={}.toString,xt=[].slice;o=n(function(t,e){var n,r;for(n=0,r=e.length;n<r;++n)t(e[n]);return e}),a=n(function(t,e){var n,r,i,o=[];for(n=0,r=e.length;n<r;++n)i=e[n],o.push(t(i));return o}),s=function(t){var e,n,r,i=[];for(e=0,n=t.length;e<n;++e)(r=t[e])&&i.push(r);return i},u=n(function(t,e){var n,r,i,o=[];for(n=0,r=e.length;n<r;++n)t(i=e[n])&&o.push(i);return o}),c=n(function(t,e){var n,r,i,o=[];for(n=0,r=e.length;n<r;++n)t(i=e[n])||o.push(i);return o}),l=n(function(t,e){var n,r,i,o,a;for(n=[],r=[],i=0,o=e.length;i<o;++i)(t(a=e[i])?n:r).push(a);return[n,r]}),f=n(function(t,e){var n,r,i;for(n=0,r=e.length;n<r;++n)if(i=e[n],t(i))return i}),h=p=function(t){return t[0]},d=function(t){if(t.length)return t.slice(1)},m=function(t){return t[t.length-1]},g=function(t){if(t.length)return t.slice(0,-1)},v=function(t){return!t.length},y=function(t){return t.concat().reverse()},b=function(t){var e,n,i,o;for(e=[],n=0,i=t.length;n<i;++n)r(o=t[n],e)||e.push(o);return e},w=n(function(t,e){var n,i,o,a,s,u=[];for(n=[],i=0,o=e.length;i<o;++i)r(s=t(a=e[i]),n)||(n.push(s),u.push(a));return u}),x=j=n(function(t,e,n){var r,i;for(r=0,i=n.length;r<i;++r)e=t(e,n[r]);return e}),_=C=n(function(t,e){return x(t,e[0],e.slice(1))}),O=n(function(t,e,n){var r;for(r=n.length-1;r>=0;--r)e=t(n[r],e);return e}),E=n(function(t,e){return O(t,e[e.length-1],e.slice(0,-1))}),I=n(function(t,e){var n,r,i;for(n=[],r=e;null!=(i=t(r));)n.push(i[0]),r=i[1];return n}),k=function(t){return[].concat.apply([],t)},D=n(function(t,e){var n;return[].concat.apply([],function(){var r,i,o,a=[];for(r=0,o=(i=e).length;r<o;++r)n=i[r],a.push(t(n));return a}())}),$=function(t){var e;return[].concat.apply([],function(){var n,r,i,o=[];for(n=0,i=(r=t).length;n<i;++n)e=r[n],"Array"===wt.call(e).slice(8,-1)?o.push($(e)):o.push(e);return o}())},R=function(t){var e,n,i,o,a,s,u,c;e=xt.call(arguments,1),n=[];t:for(i=0,o=t.length;i<o;++i){for(a=t[i],s=0,u=e.length;s<u;++s)if(c=e[s],r(a,c))continue t;n.push(a)}return n},T=function(t){var e,n,i,o,a,s,u,c;e=xt.call(arguments,1),n=[];t:for(i=0,o=t.length;i<o;++i){for(a=t[i],s=0,u=e.length;s<u;++s)if(c=e[s],!r(a,c))continue t;n.push(a)}return n},A=function(){var t,e,n,i,o,a,s,u;for(e=[],n=0,i=(t=xt.call(arguments)).length;n<i;++n)for(a=0,s=(o=t[n]).length;a<s;++a)r(u=o[a],e)||e.push(u);return e},S=n(function(t,e){var n,r,i,o;for(n={},r=0,i=e.length;r<i;++r)(o=t(e[r]))in n?n[o]+=1:n[o]=1;return n}),B=n(function(t,e){var n,r,i,o,a;for(n={},r=0,i=e.length;r<i;++r)(a=t(o=e[r]))in n?n[a].push(o):n[a]=[o];return n}),P=function(t){var e,n;for(e=0,n=t.length;e<n;++e)if(!t[e])return!1;return!0},M=function(t){var e,n;for(e=0,n=t.length;e<n;++e)if(t[e])return!0;return!1},N=n(function(t,e){var n,r,i;for(n=0,r=e.length;n<r;++n)if(i=e[n],t(i))return!0;return!1}),z=n(function(t,e){var n,r,i;for(n=0,r=e.length;n<r;++n)if(i=e[n],!t(i))return!1;return!0}),L=function(t){return t.concat().sort(function(t,e){return t>e?1:t<e?-1:0})},U=n(function(t,e){return e.concat().sort(t)}),W=n(function(t,e){return e.concat().sort(function(e,n){return t(e)>t(n)?1:t(e)<t(n)?-1:0})}),K=function(t){var e,n,r;for(e=0,n=0,r=t.length;n<r;++n)e+=t[n];return e},q=function(t){var e,n,r;for(e=1,n=0,r=t.length;n<r;++n)e*=t[n];return e},F=V=function(t){var e,n,r;for(e=0,n=0,r=t.length;n<r;++n)e+=t[n];return e/t.length},G=function(t){var e,n,r,i,o;for(e=t[0],n=0,i=(r=t.slice(1)).length;n<i;++n)(o=r[n])>e&&(e=o);return e},Y=function(t){var e,n,r,i,o;for(e=t[0],n=0,i=(r=t.slice(1)).length;n<i;++n)(o=r[n])<e&&(e=o);return e},X=n(function(t,e){var n,r,i,o,a;for(n=e[0],r=0,o=(i=e.slice(1)).length;r<o;++r)t(a=i[r])>t(n)&&(n=a);return n}),H=n(function(t,e){var n,r,i,o,a;for(n=e[0],r=0,o=(i=e.slice(1)).length;r<o;++r)t(a=i[r])<t(n)&&(n=a);return n}),J=Z=n(function(t,e,n){var r,i;return r=e,[e].concat(function(){var e,o,a,s=[];for(e=0,a=(o=n).length;e<a;++e)i=o[e],s.push(r=t(r,i));return s}())}),Q=tt=n(function(t,e){if(e.length)return J(t,e[0],e.slice(1))}),et=n(function(t,e,n){return n=n.concat().reverse(),J(t,e,n).reverse()}),nt=n(function(t,e){if(e.length)return e=e.concat().reverse(),J(t,e[0],e.slice(1)).reverse()}),rt=n(function(t,e,n){return n.slice(t,e)}),it=n(function(t,e){return t<=0?e.slice(0,0):e.slice(0,t)}),ot=n(function(t,e){return t<=0?e:e.slice(t)}),at=n(function(t,e){return[it(t,e),ot(t,e)]}),st=n(function(t,e){var n,r;if(!(n=e.length))return e;for(r=0;r<n&&t(e[r]);)r+=1;return e.slice(0,r)}),ut=n(function(t,e){var n,r;if(!(n=e.length))return e;for(r=0;r<n&&t(e[r]);)r+=1;return e.slice(r)}),ct=n(function(t,e){return[st(t,e),ut(t,e)]}),lt=n(function(t,e){return ct(function(){var t=arguments;return function(){var e,n;for(n=t[0].apply(this,arguments),e=1;e<t.length;++e)n=t[e](n);return n}}(t,i),e)}),ft=n(function(t,e){var n,r,i,o,a,s;for(n=[],r=e.length,i=0,o=t.length;i<o&&(a=i,s=t[i],a!==r);++i)n.push([s,e[a]]);return n}),ht=n(function(t,e,n){var r,i,o,a,s,u;for(r=[],i=n.length,o=0,a=e.length;o<a&&(s=o,u=e[o],s!==i);++o)r.push(t(u,n[s]));return r}),pt=function(){var t,e,n,r,i,o,a,s,u,c=[];for(e=void 0,n=0,r=(t=xt.call(arguments)).length;n<r;++n)e<=(o=(i=t[n]).length)||(e=o);for(n=0;n<e;++n){for(a=n,s=[],u=0,r=t.length;u<r;++u)i=t[u],s.push(i[a]);c.push(s)}return c},dt=function(t){var e,n,r,i,o,a,s,u=[];for(n=void 0,r=0,i=(e=xt.call(arguments,1)).length;r<i;++r)n<=(a=(o=e[r]).length)||(n=a);for(r=0;r<n;++r)s=r,u.push(t.apply(null,function(){var t,n,r,i=[];for(t=0,r=(n=e).length;t<r;++t)o=n[t],i.push(o[s]);return i}()));return u},mt=n(function(t,e){return t<0?e[e.length+t]:e[t]}),gt=n(function(t,e){var n,r,i;for(n=0,r=e.length;n<r;++n)if(i=n,e[n]===t)return i}),vt=n(function(t,e){var n,r,i,o=[];for(n=0,r=e.length;n<r;++n)i=n,e[n]===t&&o.push(i);return o}),yt=n(function(t,e){var n,r,i,o;for(n=0,r=e.length;n<r;++n)if(i=n,o=e[n],t(o))return i}),bt=n(function(t,e){var n,r,i,o=[];for(n=0,r=e.length;n<r;++n)i=n,t(e[n])&&o.push(i);return o}),t.exports={each:o,map:a,filter:u,compact:s,reject:c,partition:l,find:f,head:h,first:p,tail:d,last:m,initial:g,empty:v,reverse:y,difference:R,intersection:T,union:A,countBy:S,groupBy:B,fold:x,fold1:_,foldl:j,foldl1:C,foldr:O,foldr1:E,unfoldr:I,andList:P,orList:M,any:N,all:z,unique:b,uniqueBy:w,sort:L,sortWith:U,sortBy:W,sum:K,product:q,mean:F,average:V,concat:k,concatMap:D,flatten:$,maximum:G,minimum:Y,maximumBy:X,minimumBy:H,scan:J,scan1:Q,scanl:Z,scanl1:tt,scanr:et,scanr1:nt,slice:rt,take:it,drop:ot,splitAt:at,takeWhile:st,dropWhile:ut,span:ct,breakList:lt,zip:ft,zipWith:ht,zipAll:pt,zipAllWith:dt,at:mt,elemIndex:gt,elemIndices:vt,findIndex:yt,findIndices:bt}},function(t,e){function n(t,e){var n,r=function(i){return t.length>1?function(){var o=i?i.concat():[];return n=e?n||this:this,o.push.apply(o,arguments)<t.length&&arguments.length?r.call(n,o):t.apply(n,o)}:t};return r()}var r,i,o,a,s,u,c,l,f,h,p,d,m,g;r=function(t){var e,n,r=[];for(e in t)n=t[e],r.push(n);return r},i=function(t){var e,n=[];for(e in t)n.push(e);return n},o=function(t){var e,n,r,i={};for(e=0,n=t.length;e<n;++e)i[(r=t[e])[0]]=r[1];return i},a=function(t){var e,n,r=[];for(e in t)n=t[e],r.push([e,n]);return r},s=n(function(t,e){var n,r,i,o={};for(n=0,r=t.length;n<r;++n)i=n,o[t[n]]=e[i];return o}),u=function(t){var e,n,r,i;e=[],n=[];for(r in t)i=t[r],e.push(r),n.push(i);return[e,n]},c=function(t){var e;for(e in t)return!1;return!0},l=n(function(t,e){var n;for(n in e)t(e[n]);return e}),f=n(function(t,e){var n,r,i={};for(n in e)r=e[n],i[n]=t(r);return i}),h=function(t){var e,n,r={};for(e in t)(n=t[e])&&(r[e]=n);return r},p=n(function(t,e){var n,r,i={};for(n in e)t(r=e[n])&&(i[n]=r);return i}),d=n(function(t,e){var n,r,i={};for(n in e)t(r=e[n])||(i[n]=r);return i}),m=n(function(t,e){var n,r,i,o;n={},r={};for(i in e)(t(o=e[i])?n:r)[i]=o;return[n,r]}),g=n(function(t,e){var n,r;for(n in e)if(r=e[n],t(r))return r}),t.exports={values:r,keys:i,pairsToObj:o,objToPairs:a,listsToObj:s,objToLists:u,empty:c,each:l,map:f,filter:p,compact:h,reject:d,partition:m,find:g}},function(t,e){function n(t,e){var n,r=function(i){return t.length>1?function(){var o=i?i.concat():[];return n=e?n||this:this,o.push.apply(o,arguments)<t.length&&arguments.length?r.call(n,o):t.apply(n,o)}:t};return r()}var r,i,o,a,s,u,c,l,f,h,p,d,m;r=n(function(t,e){return e.split(t)}),i=n(function(t,e){return e.join(t)}),o=function(t){return t.length?t.split("\n"):[]},a=function(t){return t.join("\n")},s=function(t){return t.length?t.split(/[ ]+/):[]},u=function(t){return t.join(" ")},c=function(t){return t.split("")},l=function(t){return t.join("")},f=function(t){return t.split("").reverse().join("")},h=n(function(t,e){var n,r;for(n="",r=0;r<t;++r)n+=e;return n}),p=function(t){return t.charAt(0).toUpperCase()+t.slice(1)},d=function(t){return t.replace(/[-_]+(.)?/g,function(t,e){return(null!=e?e:"").toUpperCase()})},m=function(t){return t.replace(/([^-A-Z])([A-Z]+)/g,function(t,e,n){return e+"-"+(n.length>1?n:n.toLowerCase())}).replace(/^([A-Z]+)/,function(t,e){return e.length>1?e+"-":e.toLowerCase()})},t.exports={split:r,join:i,lines:o,unlines:a,words:s,unwords:u,chars:c,unchars:l,reverse:f,repeat:h,capitalize:p,camelize:d,dasherize:m}},function(t,e){function n(t,e){var n,r=function(i){return t.length>1?function(){var o=i?i.concat():[];return n=e?n||this:this,o.push.apply(o,arguments)<t.length&&arguments.length?r.call(n,o):t.apply(n,o)}:t};return r()}var r,i,o,a,s,u,c,l,f,h,p,d,m,g,v,y,b,w,x,j,_,C,O,E,I,k,D,$,R,T,A,S;r=n(function(t,e){return t>e?t:e}),i=n(function(t,e){return t<e?t:e}),o=function(t){return-t},a=Math.abs,s=function(t){return t<0?-1:t>0?1:0},u=n(function(t,e){return~~(t/e)}),c=n(function(t,e){return t%e}),l=n(function(t,e){return Math.floor(t/e)}),f=n(function(t,e){var n;return(t%(n=e)+n)%n}),h=function(t){return 1/t},d=2*(p=Math.PI),m=Math.exp,g=Math.sqrt,v=Math.log,y=n(function(t,e){return Math.pow(t,e)}),b=Math.sin,w=Math.tan,x=Math.cos,j=Math.asin,_=Math.acos,C=Math.atan,O=n(function(t,e){return Math.atan2(t,e)}),E=function(t){return~~t},I=Math.round,k=Math.ceil,D=Math.floor,$=function(t){return t!=t},R=function(t){return t%2==0},T=function(t){return t%2!=0},A=n(function(t,e){var n;for(t=Math.abs(t),e=Math.abs(e);0!==e;)n=t%e,t=e,e=n;return t}),S=n(function(t,e){return Math.abs(Math.floor(t/A(t,e)*e))}),t.exports={max:r,min:i,negate:o,abs:a,signum:s,quot:u,rem:c,div:l,mod:f,recip:h,pi:p,tau:d,exp:m,sqrt:g,ln:v,pow:y,sin:b,tan:w,cos:x,acos:_,asin:j,atan:C,atan2:O,truncate:E,round:I,ceiling:k,floor:D,isItNaN:$,even:R,odd:T,gcd:A,lcm:S}},function(t,e,n){var r=n(11),i=n(0),o=n(1).typeCheck,a=n(13);class s{constructor(t,e,n){if(n||(n={}),!o("[Object]",e))throw new TypeError("data must be an array of objects");this.data=e,this.container=t,this.options=n,this.table={}}generate(t){return new Promise((e,n)=>{this._sortData(this.data,t).then(({columns:t,rows:r})=>{var a=[];let s=$("<thead/>");a.push(new Promise((e,n)=>{let r=$("<tr/>");for(let n=0;n<t.length;n++)if(r.append($("<th/>").html(t[n])),n>=t.length-1)return s.append(r),e()})),this.table.body={},this.table.body.id="__TABLE_BODY_ID_"+i.uuidv4()+"__";let u=$("<tbody/>").attr("id",this.table.body.id);a.push(new Promise((e,i)=>{this._compileRow(t,r).then(t=>(u.append(t),e())).catch(t=>n(t))})),Promise.all(a).then(()=>{this.container.append($("<table/>").addClass(this.options.tableClasses).append(s).append(u)),this.table.data={head:t,rows:r},o("Function",this.options.afterGenerate)&&this.options.afterGenerate(),e()}).catch(t=>n(t))})})}_compileRow(t,e){return new Promise((n,r)=>{let i=[];for(let r=0;r<e.length;r++){let o=$("<tr/>").attr("id",e[r].rowID),a=e[r].getBody();for(let s=0;s<t.length;s++)if(o.append($("<td/>").html(a[t[s]])),s>=t.length-1&&i.push(o),s>=t.length-1&&r>=e.length-1)return n(i)}})}addData(t){if(!o("[Object]",t))throw new TypeError("data must be an array of objects");this.data=this.data.concat(t)}replaceData(t){if(!o("[Object]",t))throw new TypeError("data must be an array of objects");this.data=t}destroyTable(){this.data=[],containerElement.empty()}parseRowID(t){return t.substring(12,t.length-2)}getDirtyRowID(t){return"__TABLE_ROW_"+t+"__"}selectRowElm(t){return $("#"+t)}appendRow(t,e){return new Promise((n,r)=>{this.addData(t),this._sortData(t,e).then(({rows:t})=>{this._compileRow(this.table.data.head,t).then(t=>{$("#"+this.table.body.id).append(t),o("Function",this.options.afterGenerate)&&this.options.afterGenerate(),n()}).catch(t=>r(t))}).catch(t=>r(t))})}deleteRow(t){this.selectRowElm(t).remove()}_sortData(t,e){return new Promise((n,s)=>{var u=[],c=[];for(let s=0;s<t.length;s++){let l={};l.shownData=t[s],l.rowID="__TABLE_ROW_"+i.uuidv4()+"__",this.options.idKey&&l.shownData[this.options.idKey]&&(l.rowID="__TABLE_ROW_"+a.get(l.shownData,this.options.idKey.split("."))+"__"),l.getRowID=(()=>this.parseRowID(l.rowID)),this.options.hiddenKeys&&(l.hiddenData=a.keys(l.shownData,{filter:t=>this.options.hiddenKeys.includes(t.join("."))}).reduce((t,e)=>(a.set(t,e,a.get(l.shownData,e)),t),{}),this.options.ignoredKeys?this.options.ignoredKeys=this.options.ignoredKeys.concat(this.options.hiddenKeys):this.options.ignoredKeys=this.options.hiddenKeys),this.options.ignoredKeys&&(l.shownData=a.keys(l.shownData,{filter:t=>!this.options.ignoredKeys.includes(t.join("."))}).reduce((t,e)=>(a.set(t,e,a.get(l.shownData,e)),t),{}));let f=[];f.push(new Promise((t,e)=>{if(!o("Function",this.options.inject))return t();this.options.inject(l,n=>{if(!o("[{column: String, strictColumn: Maybe Boolean, dom: *}]",n))return e(new TypeError("inject callback expected a single paramater with type structure: [{column: String, strictColumn: Maybe Boolean, dom: *}]"));this._compileInject(n).then(e=>t(e))})})),f.push(new Promise((t,n)=>{if(!o("Function",e))return t();e(l,e=>{if(!o("[{column: String, strictColumn: Maybe Boolean, dom: *}]",e))return n(new TypeError("inject callback expected a single paramater with type structure: [{column: String, strictColumn: Maybe Boolean, dom: *}]"));this._compileInject(e).then(e=>t(e))})})),Promise.all(f).then(([e,i])=>{e&&i?l.injectedData=Object.assign(e,i):e?l.injectedData=e:i&&(l.injectedData=i);let a=r(l.shownData,{safe:!0});if(l.injectedData?this.options.preferInject?l.shownKeys=[...new Set([...Object.keys(a),...Object.keys(l.injectedData)])]:l.shownKeys=[...new Set([...Object.keys(l.injectedData),...Object.keys(a)])]:l.shownKeys=Object.keys(a),u=[...new Set([...u,...l.shownKeys])],l.getBody=(()=>this.options.preferInject?Object.assign(a,l.injectedData):Object.assign(l.injectedData,a)),c.push(l),s>=t.length-1)return o("[String]",this.options.sort)?u.sort((t,e)=>this.options.sort.indexOf(t)-this.options.sort.indexOf(e)):o("Function",this.options.sort)&&u.sort(this.options.sort),n({columns:u,rows:c})}).catch(t=>{throw t})}})}_compileInject(t){return new Promise(e=>{let n={};if(t.length<1)return e(n);for(let i=0;i<t.length;i++)if(t[i].strictColumn?n[t[i].column]=t[i].dom:n=Object.assign(n,r({[t[i].column.split(".")]:t[i].dom},{safe:!0})),i>=t.length-1)return e(n)})}}t.exports=s},function(t,e,n){function r(t,e){function n(t,s,u){u=u||1,Object.keys(t).forEach(function(c){var l=t[c],f=e.safe&&Array.isArray(l),h=Object.prototype.toString.call(l),p=o(l),d=s?s+r+c:c;if(!f&&!p&&("[object Object]"===h||"[object Array]"===h)&&Object.keys(l).length&&(!e.maxDepth||u<i))return n(l,d,u+1);a[d]=l})}var r=(e=e||{}).delimiter||".",i=e.maxDepth,a={};return n(t),a}function i(t,e){function n(t){var n=Number(t);return isNaN(n)||-1!==t.indexOf(".")||e.object?t:n}var r=(e=e||{}).delimiter||".",a=e.overwrite||!1,s={};if(o(t)||"[object Object]"!==Object.prototype.toString.call(t))return t;return Object.keys(t).sort(function(t,e){return t.length-e.length}).forEach(function(o){for(var u=o.split(r),c=n(u.shift()),l=n(u[0]),f=s;void 0!==l;){var h=Object.prototype.toString.call(f[c]),p="[object Object]"===h||"[object Array]"===h;if(!a&&!p&&void 0!==f[c])return;(a&&!p||!a&&null==f[c])&&(f[c]="number"!=typeof l||e.object?{}:[]),f=f[c],u.length>0&&(c=n(u.shift()),l=n(u[0]))}f[c]=i(t[o],e)}),s}var o=n(12);t.exports=r,r.flatten=r,r.unflatten=i},function(t,e){function n(t){return!!t.constructor&&"function"==typeof t.constructor.isBuffer&&t.constructor.isBuffer(t)}t.exports=function(t){return null!=t&&(n(t)||function(t){return"function"==typeof t.readFloatLE&&"function"==typeof t.slice&&n(t.slice(0,0))}(t)||!!t._isBuffer)}},function(t,e,n){"use strict";function*r(t,e,n){if(null!==t&&void 0!==t&&!(e.depth>0&&n&&n.length>=e.depth)&&"string"!=typeof t){n=n||[];for(var i of e.all?Object.getOwnPropertyNames(t):Object.keys(t))if(!(e.noindex&&t instanceof Array&&/^[0-9]+$/.test(i))){var o=n.slice(0);if(o.push(i),!e.filter||e.filter(o,t[i],!e.all||t.propertyIsEnumerable(i))){var a=r(t[i],e,o),s=a.next();e.leaf?s.done?yield o:(yield s.value,yield*a):(yield o,s.done||(yield s.value,yield*a))}}}}function i(t,e,n){for(var r=t,i=0;i<e.length;i++){if(i==e.length-1)return[r,e[i]];if(!(e[i]in r)||void 0===r[e[i]]){if(!n)return;if(!Object.isExtensible(r))throw`Inextensible object: ${e.slice(0,i).join(".")}`;r[e[i]]={}}if("null"===(r=r[e[i]])||"object"!=typeof r&&"function"!=typeof r){if(n)throw`Inextensible object: ${e.slice(0,i+1).join(".")}`;return}}}function o(t,e){var n=i(t,e,!1);if(n){var r=n[0][n[1]];return delete n[0][n[1]],r}}function a(t,e,n){var r=i(t,e,!0);return r[0][r[1]]=n}function s(t,e){var n=i(t,e,!1);return n?n[0][n[1]]:void 0}t.exports={keys:function(t,e){var n;(n="number"==typeof e?{depth:e}:"function"==typeof e?{filter:e}:"object"==typeof e&&null!==e?e:{}).depth=n.depth||0;var i=[];for(var o of r(t,n))i.push(o);return i},set:a,get:s,touch:function(t,e,n){var r=i(t,e,!0);if(r[1]in r[0])return r[0][r[1]];if(!Object.isExtensible(r[0]))throw`Inextensible object: ${e.slice(0,e.length-1).join(".")}`;return r[0][r[1]]=n},type:function(t,e){return typeof s(t,e)},rename:function(t,e,n){return a(t,n,o(t,e))},delete:o,exists:function(t,e){var n=i(t,e,!1);return!!n&&n[0].propertyIsEnumerable(n[1])},accessor:function(t,e){var n=i(t,e,!0);if(n)return{get:()=>n[0][n[1]],set:t=>n[0][n[1]]=t}}}},,,,function(t,e,n){var r=n(18),i=n(0),o=null;window.onload=function(){console.log(i.thisUser()),(o=new r($("#editScheduleContainer"))).generate().catch(t=>i.throwError(t))}},function(t,e,n){var r=n(10),i=n(19),o=n(20),a=n(21),s=n(0);class u{constructor(t,e){this.container=t,e||(e={}),this.options=e,this.periodSelectClass="__PERIOD_SELECT_"+s.uuidv4()+"__",this.autocompleteClass="__SCHEDULE_AUTOCOMPLETE_"+s.uuidv4()+"__",this.addRowButtonID="__ADD_ROW_PERIOD_"+s.uuidv4()+"__",this.autocompleteREGEX=new RegExp(/( --- )+(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/)}generate(){return new Promise((t,e)=>{let n=[];n.push(a.getScheduleConfig()),n.push(i.getSchedules(this.options.accountID)),n.push(o.getWithClasses()),Promise.all(n).then(([t,n,i])=>{this.allClassAccounts=i;let o={},a=new Promise(t=>{for(let e=0;e<this.allClassAccounts.length;e++)if(this.allClassAccounts[e].name.salutation?o[this.allClassAccounts[e].name.salutation+" "+this.allClassAccounts[e].name.first+" "+this.allClassAccounts[e].name.last+" --- "+this.allClassAccounts[e].email]=null:o[this.allClassAccounts[e].name.first+" "+this.allClassAccounts[e].name.last+" --- "+this.allClassAccounts[e].email]=null,e>=this.allClassAccounts.length-1)return t()}),u=new r(this.container,[{}],{preferInject:!1,idKey:"id",ignoredKeys:["id"],inject:(n,r)=>{let i="__AUTOCOMPLETE_"+s.uuidv4();this._periodDom(u,n.rowID,t.periods).then(t=>r([{column:"Period",strictColumn:!0,dom:t},{column:"Location",strictColumn:!0,dom:$("<span/>").prepend($("<a/>").addClass("left btn-floating waves-effect waves-light").attr("data-location",!1).css("transform","translateY(0%)").on("click",t=>{"true"==$(t.currentTarget).attr("data-location")?($("#"+i+"_DIV__").slideUp(500),$(t.currentTarget).siblings("p").slideDown(500),$(t.currentTarget).attr("data-location",!1).css("transform","translateY(0%)").find("i").html("add_location"),this.checkValidity().catch(t=>e(t))):($("#"+i+"_DIV__").slideDown(500),$(t.currentTarget).siblings("p").slideUp(500),$(t.currentTarget).attr("data-location",!0).css("transform","translateY(50%)").find("i").html("location_off"),this.checkValidity().catch(t=>e(t)))}).append($("<i/>").addClass("material-icons").html("add_location"))).append($("<p/>").html(" &nbsp; No set location").css("transform","translateY(50%)")).append($("<div/>").addClass("input-field col s10").css("display","none").attr("id",i+"_DIV__").append($("<input/>").attr("type","text").attr("id",i).addClass(this.autocompleteClass+" autocomplete").attr("data-autocomplete-period",null).on("keyup",t=>{this.checkValidity().catch(t=>e(t))})).append($("<label/>").attr("for",i).html("Search Teachers")))}]))},afterGenerate:()=>{$("select").material_select(),a.then(()=>{$("input."+this.autocompleteClass).autocomplete({data:o,limit:5,onAutocomplete:t=>{console.log(t),this.checkValidity().catch(t=>e(t))},minLength:1})}).catch(t=>e(t))}});u.generate().then(()=>{let r=n.studentType,i=[];if(r){let n=Object.keys(r.schedule);for(let r=0;r<n.length;r++){let o=s.uuidv4();this._periodDom(u,o,t.periods,n[r]).then(t=>{i.push({Period:$("<span/>").append(t).html(),id:o}),r>=n.length-1&&u.appendRow(i)}).catch(t=>e(t))}}this.container.append($("<a/>").attr("id",this.addRowButtonID).addClass("waves-effect waves-light btn").append($("<i/>").addClass("material-icons left").html("add")).html("Add Period").on("click",()=>{$("#"+this.addRowButtonID).attr("disabled",!0),u.appendRow([{}])}))})}).catch(e)})}_periodSelectElm(t,e){return new Promise((n,r)=>{let i=$("<select/>").addClass(this.periodSelectClass).on("change",()=>{this.checkValidity().catch(t=>r(t))});e?i.append($("<option/>").attr("value","").attr("disabled",!0).html("Choose a period")):i.append($("<option/>").attr("value","").attr("disabled",!0).attr("selected",!0).html("Choose a period"));for(let r=0;r<t.length;r++)if(t[r]==e?i.append($("<option/>").attr("value",t[r]).attr("selected",!0).html(t[r].toUpperCase())):i.append($("<option/>").attr("value",t[r]).html(t[r].toUpperCase())),r>=t.length-1){n($("<div/>").addClass("input-field col s10").append(i))}})}_periodDom(t,e,n,r){return new Promise((i,o)=>{this._periodSelectElm(n,r).then(n=>i($("<span/>").prepend($("<a/>").addClass("left btn-floating waves-effect waves-light delete-row").css("transform","translateY(50%)").on("click",()=>{$("#"+this.addRowButtonID).attr("disabled",!1),t.deleteRow(e)}).append($("<i/>").addClass("material-icons").html("delete"))).append(n))).catch(t=>o(t))})}_checkPeriodSelect(){return new Promise((t,e)=>{let n=$("select."+this.periodSelectClass),r=[];for(let e=0;e<n.length;e++){if(r.includes(n[e].value))return t({valid:!1,problemRowElement:$(n[e]).parentsUntil("td")});if(r.push(n[e].value),n[e].value.length<1)return t({valid:!1,problemRowElement:$(n[e]).parentsUntil("td")});if(e>=n.length-1)return t({valid:!0})}})}_checkLocation(){return new Promise((t,e)=>{let n=$("input."+this.autocompleteClass);for(let e=0;e<n.length;e++){if("true"==$(n[e]).parentsUntil("td").find("a[data-location]").attr("data-location")&&(n[e].value.length<1||n[e].value.search(this.autocompleteREGEX)<0))return t({valid:!1,problemRowElement:$(n[e]).parentsUntil("td")});if(e>=n.length-1)return t({valid:!0})}})}checkValidity(){return new Promise((t,e)=>{let n=[];n.push(this._checkPeriodSelect()),n.push(this._checkLocation()),Promise.all(n).then(([e,n])=>(console.log(n),$("a[data-location]").removeClass("pulse red").fadeIn(1e3),$("a.delete-row").removeClass("pulse red").fadeIn(1e3),n.valid?e.valid?($("#"+this.addRowButtonID).attr("disabled",!1),t({valid:!0})):(e.problemRowElement.find("a.delete-row").addClass("pulse red").fadeIn(1e3),$("#"+this.addRowButtonID).attr("disabled",!0),t(e)):(n.problemRowElement.find("a[data-location]").addClass("pulse red").fadeIn(1e3),$("#"+this.addRowButtonID).attr("disabled",!0),t(n)))).catch(t=>e(t))})}}t.exports=u},function(t,e,n){var r=n(0);e.getSchedules=(t=>(void 0===t&&(t=""),r.fetch("GET","/api/account/schedule/"+t,{auth:!0})))},function(t,e,n){var r=n(0);e.getWithClasses=(()=>r.fetch("GET","/api/account/hasClasses",{auth:!0}))},function(t,e,n){var r=n(0);e.getScheduleConfig=(()=>r.fetch("GET","/api/server/config/schedule/",{auth:!1}))}]);