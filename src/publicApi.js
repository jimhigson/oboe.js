// export public API
function oboe(arg1, arg2) {

   if (arg1.url) {

      // method signature is:
      //    oboe({method:m, url:u, body:b, headers:{...}})

      return wire(
         (arg1.method || 'GET'),
         arg1.url,
         arg1.body,
         arg1.headers
      );
   } else {

      //  simple version for GETs. Signature is:
      //    oboe( url )            
      //                                
      return wire(
         'GET',
         arg1, // url
         arg2  // body. Deprecated, use {url:u, body:b} instead
      );
   }
}
