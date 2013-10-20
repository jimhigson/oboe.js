// export public API
var oboe = apiMethod('GET');
oboe.doGet    = oboe;
oboe.doDelete = apiMethod('DELETE');
oboe.doPost   = apiMethod('POST', true);
oboe.doPut    = apiMethod('PUT', true);
oboe.doPatch  = apiMethod('PATCH', true);

function apiMethod(httpMethodName, mayHaveRequestBody) {
               
   return function(firstArg){
           
      if (isString(firstArg)) {
      
         // parameters specified as arguments
         //
         //  if (mayHaveContext == true) method signature is:
         //     .doMethod( url, content )
         //
         //  else it is:
         //     .doMethod( url )            
         //                                
         return wire(
                  httpMethodName,
                  firstArg,                                  // url
                  mayHaveRequestBody && arguments[1]         // body
         );
      } else {
      
         // method signature is:
         //    .doMethod({url:u, body:b, complete:c, headers:{...}})
         
         return wire(   
                  httpMethodName,
                  firstArg.url,
                  firstArg.body,
                  firstArg.headers 
         );
      }
   };
}   