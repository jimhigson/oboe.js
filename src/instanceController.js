/**
 * This file implements a light-touch central controller for an instance 
 * of Oboe which provides the methods used for interacting with the instance 
 * from the calling app.
 */
 
 
function instanceController(  oboeBus, 
                              clarinetParser, contentBuilderHandlers) {
                                
   oboeBus(STREAM_DATA).on( clarinetParser.write.bind(clarinetParser));      
   
   /* At the end of the http content close the clarinet parser.
      This will provide an error if the total content provided was not 
      valid json, ie if not all arrays, objects and Strings closed properly */
   oboeBus(STREAM_END).on( clarinetParser.close.bind(clarinetParser));
   

   /* If we abort this Oboe's request stop listening to the clarinet parser. 
      This prevents more tokens being found after we abort in the case where 
      we aborted during processing of an already filled buffer. */
   oboeBus(ABORTING).on( function() {
      clarinetListenerAdaptor(clarinetParser, {});
   });   

   clarinetListenerAdaptor(clarinetParser, contentBuilderHandlers);
  
   // react to errors by putting them on the event bus
   clarinetParser[SAX_ERROR] = function(e) {          
      oboeBus(FAIL_EVENT).emit(          
         errorReport(undefined, undefined, e)
      );
      
      // note: don't close clarinet here because if it was not expecting
      // end of the json it will throw an error
   };   
}
