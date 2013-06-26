(function(){

   /* export public API */
   window.oboe = {
      doGet:   apiMethod('GET'),
      doDelete:apiMethod('DELETE'),
      doPost:  apiMethod('POST', true),
      doPut:   apiMethod('PUT', true)
   };
   
   function apiMethod(httpMethodName, mayHaveRequestBody) {
         
      var 
          // make name like 'doGet' out of name like 'GET'
          bodyArgumentIndex =     mayHaveRequestBody?  1 : -1, // minus one = always undefined - method can't send data
          callbackArgumentIndex = mayHaveRequestBody? 2 : 1;           
      

      return function(firstArg){
      
         // wire everything up:
         var eventBus = pubSub(),
             clarinetParser = clarinet.parser(),
             parsedContentSoFar = incrementalParsedContent(clarinetParser, eventBus.notify),             
             controller = oboeController( eventBus, clarinetParser, parsedContentSoFar),      
            
         // now work out what the arguments mean:   
             url, body, doneCallback;

         if (isString(firstArg)) {
            // parameters specified as arguments
            //
            //  if mayHaveContext, signature is:
            //     .method( url, content, callback )
            //  else it is:
            //     .method( url, callback )            
            //                                
            url = firstArg;
            body = arguments[bodyArgumentIndex];
            doneCallback = arguments[callbackArgumentIndex]
         } else {
            // parameters specified as options object:
            url = firstArg.url;
            body = firstArg.body;
            doneCallback = firstArg.complete;
         }

         // start the request:
         controller.start(httpMethodName, url, body, doneCallback);         
                  
         // return an api to control this oboe instance                   
         return instanceApi(controller, eventBus, parsedContentSoFar)           
      };
   }   

})();