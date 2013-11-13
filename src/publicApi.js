// export public API
function oboe(arg1, arg2) {

   if( arg1 ) {
      if (arg1.url) {
   
         // method signature is:
         //    oboe({method:m, url:u, body:b, headers:{...}})
   
         return wire(
            (arg1.method || 'GET'),
            url(arg1.url, arg1.cached),
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
   } else {
      // wire up a no-AJAX Oboe. Will have to have content 
      // fed in externally and fed in using .emit.
      return wire();
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
