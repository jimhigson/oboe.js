// export public API
function apiMethod(defaultHttpMethod, arg1, arg2) {

   if (arg1.url) {

      // method signature is:
      //    oboe({method:m, url:u, body:b, headers:{...}})

      return wire(
         (arg1.method || defaultHttpMethod),
         url(arg1.url, arg1.cached),
         arg1.body,
         arg1.headers
      );
   } else {

      //  simple version for GETs. Signature is:
      //    oboe( url )            
      //                                
      return wire(
         defaultHttpMethod,
         arg1, // url
         arg2  // body. Deprecated, use {url:u, body:b} instead
      );
   }
   
   function url(baseUrl, cached) {
     
      if( cached === false ) {
           
         if( baseUrl.indexOf('?') == -1 ) {
            baseUrl += '?';
         } else {
            baseUrl += '&';
         }
         
         baseUrl += '_=' + new Date().getTime();
      }
      return baseUrl;
   }
}

var oboe = partialComplete(apiMethod, 'GET');
// add deprecated methods, to be removed in v2.0.0:
oboe.doGet    = oboe;
oboe.doDelete = partialComplete(apiMethod, 'DELETE');
oboe.doPost   = partialComplete(apiMethod, 'POST');
oboe.doPut    = partialComplete(apiMethod, 'PUT');
oboe.doPatch  = partialComplete(apiMethod, 'PATCH');