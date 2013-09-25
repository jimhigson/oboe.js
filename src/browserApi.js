
// export public API
window.oboe          = apiMethod('GET');
window.oboe.doGet    = window.oboe;
window.oboe.doDelete = apiMethod('DELETE');
window.oboe.doPost   = apiMethod('POST', true);
window.oboe.doPut    = apiMethod('PUT', true);

function apiMethod(httpMethodName, mayHaveRequestBody) {
               
   return function(firstArg){
           
      if (isString(firstArg)) {
      
         // parameters specified as arguments
         //
         //  if (mayHaveContext == true) method signature is:
         //     .doMethod( url, content, callback )
         //
         //  else it is:
         //     .doMethod( url, callback )            
         //                                
         return wire(
                  httpMethodName,
                  firstArg,                                  // url
                  mayHaveRequestBody && arguments[1],        // body
                  arguments[mayHaveRequestBody? 2 : 1]       // callback
         );
      } else {
      
         // method signature is:
         //    .doMethod({url:u, body:b, complete:c, headers:{...}})
         
         return wire(   
                  httpMethodName,
                  firstArg.url,
                  firstArg.body,
                  firstArg.complete,
                  firstArg.headers 
         );
      }
                                                   
   };
}   

