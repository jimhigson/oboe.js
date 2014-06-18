// export public API
function oboe(arg1) {

   if( arg1 ) {
      if (arg1.url) {
   
         // method signature is:
         //    oboe({method:m, url:u, body:b, headers:{...}})
   
         return applyDefaults(
            wire,
            arg1.url,
            arg1.method,
            arg1.body,
            arg1.headers,
            arg1.withCredentials,
            arg1.cached
         );
      } else {
   
         //  simple version for GETs. Signature is:
         //    oboe( url )
         //  or, under node:
         //    oboe( readableStream )
         return applyDefaults(
            wire,
            arg1 // url
         );
      }
   } else {
      // wire up a no-AJAX Oboe. Will have to have content 
      // fed in externally and using .emit.
      return wire();
   }
}
