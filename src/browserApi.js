(function(){

   /* export public API */
   window.oboe = {
      doGet:   apiMethod('GET'),
      doDelete:apiMethod('DELETE'),
      doPost:  apiMethod('POST', true),
      doPut:   apiMethod('PUT', true)
   };
   
   function apiMethod(httpMethodName, mayHaveRequestBody) {
                  
      return function(firstArg){
       
         function start (url, body, callback, headers){
            var eventBus = pubSub();
                        
            streamingXhr( eventBus.fire, eventBus.on, 
                          httpMethodName, url, body, headers );                              
                      
            return instanceController( eventBus.fire, eventBus.on, 
                                       clarinet.parser(), incrementalContentBuilder(eventBus.fire), callback);
         }
          
         if (isString(firstArg)) {
         
            // parameters specified as arguments
            //
            //  if (mayHaveContext == true) method signature is:
            //     .doMethod( url, content, callback )
            //
            //  else it is:
            //     .doMethod( url, callback )            
            //                                
            return start(
                     firstArg,                                  // url
                     mayHaveRequestBody && arguments[1],        // body
                     arguments[mayHaveRequestBody? 2 : 1]       // callback
            );
         } else {
         
            // method signature is:
            //    .doMethod({url:u, body:b, complete:c, headers:{...}})
            
            return start(   
                     firstArg.url,
                     firstArg.body,
                     firstArg.complete,
                     firstArg.headers 
            );
         }
                                                      
      };
   }   

})();