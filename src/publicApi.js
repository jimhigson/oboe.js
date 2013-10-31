// export public API
function oboe(firstArg) {

   if (firstArg.url) {

      // method signature is:
      //    .oboe({method:m, url:u, body:b, complete:c, headers:{...}})

      return wire(
          (firstArg.method || 'GET'),
          firstArg.url,
          firstArg.body,
          firstArg.headers
      );
   } else {

      // parameters specified as arguments
      //
      //  if (mayHaveContext == true) method signature is:
      //     .doMethod( url, content )
      //
      //  else it is:
      //     .doMethod( url )            
      //                                
      return wire(
          'GET',
          firstArg // url
      );
   }
}
