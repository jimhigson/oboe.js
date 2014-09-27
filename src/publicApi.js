// export public API
function oboe(arg1) {

   if( arg1 ) {
      if (isOfType(String, arg1) || isOfType(Function, arg1.read)) {

         //  simple version for GETs. Signature is:
         //    oboe( url )
         //  or, under node:
         //    oboe( readableStream )
         return applyDefaults(
            wire,
            arg1 // url
         );
      } else {
   
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
      }
   } else {
      // wire up a no-AJAX Oboe. Will have to have content 
      // fed in externally and using .emit.
      return wire();
   }
}
