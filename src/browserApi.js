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
         var 
            eventBus = pubSub(),
            fire = eventBus.fire,
            on = eventBus.on,            
            sXhr = streamingXhr(fire, on),
            clarinetParser = clarinet.parser(),
            rootJsonFn = incrementalContentBuilder(clarinetParser, fire, on),             
            instController = instanceController(clarinetParser, rootJsonFn, fire, on),
 
            /**
             * create a shortcutted version of controller.start for once arguments have been
             * extracted from their various orders
             */
            start = function (url, body, callback){ 
               if( callback ) {
                  on(HTTP_DONE_EVENT, compose(callback, rootJsonFn));
               }
                   
               sXhr( httpMethodName, url, body );
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
            //    .method({url:u, body:b, complete:c})
            
            start(   firstArg.url,
                     firstArg.body,
                     firstArg.complete );
         }
                                           
         // return the controller to ask as the api for this instance                   
         return instController;           
      };
   }   

})();