// export public API
function oboe(firstArg) {

   if (firstArg.url) {

      // method signature is:
      //    oboe({method:m, url:u, body:b, complete:c, headers:{...}})

      return wire(
          (firstArg.method || 'GET'),
          firstArg.url,
          firstArg.body,
          firstArg.headers
      );
   } else {

      //  simple version for GETs. Signature is:
      //    oboe( url )            
      //                                
      return wire(
          'GET',
          firstArg // url
      );
   }
}
