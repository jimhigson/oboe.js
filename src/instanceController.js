/**
 * This file implements a light-touch central controller for an instance 
 * of Oboe which provides the methods used for interacting with the instance 
 * from the calling app.
 */
 
 
function instanceController(  oboeBus, 
                              contentBuilderHandlers) {
                                
   ascentManager(oboeBus, contentBuilderHandlers);
  
   // react to errors by putting them on the event bus
   // TODO: route more directly
   oboeBus(SAX_ERROR).on( function(e) {          
      oboeBus(FAIL_EVENT).emit(          
         errorReport(undefined, undefined, e)
      );
      // note: don't close clarinet here because if it was not expecting
      // end of the json it will throw an error
   }); 
}
