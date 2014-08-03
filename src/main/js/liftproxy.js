!function(e){"use strict";var t,n,i=[];if(typeof global=="object"&&global){t=global}else if(typeof window!=="undefined"){t=window}else{t={}}n=t.DeepDiff;if(n){i.push(function(){if("undefined"!==typeof n&&t.DeepDiff===h){t.DeepDiff=n;n=e}})}function r(e,t){e.super_=t;e.prototype=Object.create(t.prototype,{constructor:{value:e,enumerable:false,writable:true,configurable:true}})}function f(e,t){Object.defineProperty(this,"kind",{value:e,enumerable:true});if(t&&t.length){Object.defineProperty(this,"path",{value:t,enumerable:true})}}function a(e,t,n){a.super_.call(this,"E",e);Object.defineProperty(this,"lhs",{value:t,enumerable:true});Object.defineProperty(this,"rhs",{value:n,enumerable:true})}r(a,f);function u(e,t){u.super_.call(this,"N",e);Object.defineProperty(this,"rhs",{value:t,enumerable:true})}r(u,f);function l(e,t){l.super_.call(this,"D",e);Object.defineProperty(this,"lhs",{value:t,enumerable:true})}r(l,f);function o(e,t,n){o.super_.call(this,"A",e);Object.defineProperty(this,"index",{value:t,enumerable:true});Object.defineProperty(this,"item",{value:n,enumerable:true})}r(o,f);function s(e,t,n){var i=e.slice((n||t)+1||e.length);e.length=t<0?e.length+t:t;e.push.apply(e,i);return e}function c(t,n,i,r,f,h,p){f=f||[];var b=f.slice(0);if(h){if(r&&r(b,h))return;b.push(h)}var d=typeof t;var v=typeof n;if(d==="undefined"){if(v!=="undefined"){i(new u(b,n))}}else if(v==="undefined"){i(new l(b,t))}else if(d!==v){i(new a(b,t,n))}else if(t instanceof Date&&n instanceof Date&&t-n!=0){i(new a(b,t,n))}else if(d==="object"&&t!=null&&n!=null){p=p||[];if(p.indexOf(t)<0){p.push(t);if(Array.isArray(t)){var y,m=t.length,g=function(e){i(new o(b,y,e))};for(y=0;y<t.length;y++){if(y>=n.length){i(new o(b,y,new l(e,t[y])))}else{c(t[y],n[y],g,r,[],null,p)}}while(y<n.length){i(new o(b,y,new u(e,n[y++])))}}else{var w=Object.keys(t);var D=Object.keys(n);w.forEach(function(f){var a=D.indexOf(f);if(a>=0){c(t[f],n[f],i,r,b,f,p);D=s(D,a)}else{c(t[f],e,i,r,b,f,p)}});D.forEach(function(t){c(e,n[t],i,r,b,t,p)})}p.length=p.length-1}}else if(t!==n){if(!(d==="number"&&isNaN(t)&&isNaN(n))){i(new a(b,t,n))}}}function h(t,n,i,r){r=r||[];c(t,n,function(e){if(e){r.push(e)}},i);return r.length?r:e}function p(e,t,n){if(n.path&&n.path.length){var i=e[t],r,f=n.path.length-1;for(r=0;r<f;r++){i=i[n.path[r]]}switch(n.kind){case"A":p(i[n.path[r]],n.index,n.item);break;case"D":delete i[n.path[r]];break;case"E":case"N":i[n.path[r]]=n.rhs;break}}else{switch(n.kind){case"A":p(e[t],n.index,n.item);break;case"D":e=s(e,t);break;case"E":case"N":e[t]=n.rhs;break}}return e}function b(e,t,n){if(!(n instanceof f)){throw new TypeError("[Object] change must be instanceof Diff")}if(e&&t&&n){var i=e,r,a;a=n.path.length-1;for(r=0;r<a;r++){if(typeof i[n.path[r]]==="undefined"){i[n.path[r]]={}}i=i[n.path[r]]}switch(n.kind){case"A":p(i[n.path[r]],n.index,n.item);break;case"D":delete i[n.path[r]];break;case"E":case"N":i[n.path[r]]=n.rhs;break}}}function d(e,t,n){if(e&&t){var i=function(i){if(!n||n(e,t,i)){b(e,t,i)}};c(e,t,i)}}Object.defineProperties(h,{diff:{value:h,enumerable:true},observableDiff:{value:c,enumerable:true},applyDiff:{value:d,enumerable:true},applyChange:{value:b,enumerable:true},isConflict:{get:function(){return"undefined"!==typeof n},enumerable:true},noConflict:{value:function(){if(i){i.forEach(function(e){e()});i=null}return h},enumerable:true}});if(typeof module!="undefined"&&module&&typeof exports=="object"&&exports&&module.exports===exports){module.exports=h}else{t.DeepDiff=h}}();

angular
  .module('lift-ng', [])
  .service('liftProxy', ['$http', '$q', function ($http, $q) {
    var svc = {
      callbacks: {},
      request: function (requestData) {
        var random = function() {
          var text = "";
          var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

          for( var i=0; i < 20; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

          return text;
        };

        var q = $q.defer();
        var id = random();
        var req = requestData.name+'='+encodeURIComponent(JSON.stringify({id:id, data:requestData.data}));
        var cleanup = function() {delete svc.callbacks[id];};

        var responseToQ = function(data) {
          if (data.success) {
            if (data.data) {
              q.resolve(data.data);
            }
            else {
              q.resolve();
            }
          } else {
            q.reject(data.msg)
          }
          cleanup();
        };

        svc.callbacks[id] = responseToQ;

        var returnQ = function(response) {
          var data = response.data;
          if(!data.future) {
            responseToQ(data)
          }
          return q.promise;
        };

        return $http.post('ajax_request/' + lift_page + '/', req, {
          headers : {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
          }
        }).then(returnQ);
      },
      response: function(response) {
        // The callback won't exist in the case of multiple apps on one page.
        var cb = svc.callbacks[response.id];
        if(typeof cb !== "undefined" && cb !== null)
          cb(response);
      }
    };

    return svc;
  }
]);
