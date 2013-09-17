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
            var 
               eventBus = pubSub(),
               fire = eventBus.fire,
               on = eventBus.on;

            // let's kick off ajax and building up the content. 
            // both of these plug into the event bus to receive and send events.
            
            streamingXhr(fire, on, httpMethodName, url, body, headers );                              
                      
            return instanceController(fire, on, clarinet.parser(), incrementalContentBuilder(fire), callback);
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