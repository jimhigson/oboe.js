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
      
         // wire everything up:
         var eventBus = pubSub(),
             clarinetParser = clarinet.parser(),
             parsedContentSoFar = incrementalContentBuilder(clarinetParser, eventBus.notify),             
             controller = oboeController( eventBus, clarinetParser, parsedContentSoFar),      
            
         //  now work out what the arguments mean:   
             url, body, doneCallback;

         if (isString(firstArg)) {
            /*console.log( 'apiMethod called', 
                           anyToString(arguments), 
                           bodyArgumentIndex, 
                           arguments[-1] 
            );*/
         
            // parameters specified as arguments
            //
            //  if mayHaveContext, signature is:
            //     .method( url, content, callback )
            //  else it is:
            //     .method( url, callback )            
            //                                
            url = firstArg;
            body = mayHaveRequestBody? arguments[1] : undefined;
            doneCallback = arguments[mayHaveRequestBody? 2 : 1]
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