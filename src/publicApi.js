// export public API
function oboe(arg1, arg2) {

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
         //                                
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

// add methods to be called to set up as a worker thread:
oboe._wire = {
   wireToFetch:wireToFetch
}

