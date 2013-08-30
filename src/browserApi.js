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
             contentBuilder = incrementalContentBuilder(clarinetParser, eventBus.notify),             
             instController = instanceController( eventBus, clarinetParser, contentBuilder),
 
             /**
              * create a shortcutted version of controller.start, could also be done with .bind
              * in supporting browsers
              */
             start = function (url, body, callback){ 
                instController.fetch( httpMethodName, url, body, callback );
             };
             
         if (isString(firstArg)) {
         
            // parameters specified as arguments
            //
            //  if (mayHaveContext == true) method signature is:
            //     .method( url, content, callback )
            //
            //  else it is:
            //     .method( url, callback )            
            //                                
            start(   firstArg,                                       // url
                     mayHaveRequestBody? arguments[1] : undefined,   // body
                     arguments[mayHaveRequestBody? 2 : 1] );         // callback
         } else {
         
            
            // method signature is:
            //    .method({url:u, body:b, doneCallback:c})
            
            start(   firstArg.url,
                     firstArg.body,
                     firstArg.complete );
         }
                                           
         // return an api to control this oboe instance                   
         return instanceApi(instController, contentBuilder)           
      };
   }   

})();