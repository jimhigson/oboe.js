/**
 * This file implements a light-touch central controller for an instance 
 * of Oboe which provides the methods used for interacting with the instance 
 * from the calling app.
 */
 
 
function instanceController(  emit, on, un, 
                              clarinetParser, contentBuilderHandlers) {
                                
   on(STREAM_DATA,         
      function (nextDrip) {
         // callback for when a bit more data arrives from the streaming XHR         
          
         try {
            
            clarinetParser.write(nextDrip);            
         } catch(e) { 
            /* we don't have to do anything here because we always assign
               a .onerror to clarinet which will have already been called 
               by the time this exception is thrown. */                
         }
      }
   );
   
   /* At the end of the http content close the clarinet parser.
      This will provide an error if the total content provided was not 
      valid json, ie if not all arrays, objects and Strings closed properly */
   on(STREAM_END, clarinetParser.close.bind(clarinetParser));
   

   /* If we abort this Oboe's request stop listening to the clarinet parser. 
      This prevents more tokens being found after we abort in the case where 
      we aborted during processing of an already filled buffer. */
   on( ABORTING, function() {
      clarinetListenerAdaptor(clarinetParser, {});
   });   

   clarinetListenerAdaptor(clarinetParser, contentBuilderHandlers);
  
   // react to errors by putting them on the event bus
   clarinetParser.onerror = function(e) {          
      emit(
         FAIL_EVENT, 
         errorReport(undefined, undefined, e)
      );
      
      // note: don't close clarinet here because if it was not expecting
      // end of the json it will throw an error
   };
   
   return new instanceApi(emit, on, un, jsonPathCompiler);
}