/**
 * This file implements a light-touch central controller for an instance 
 * of Oboe which provides the methods used for interacting with the instance 
 * from the calling app.
 */
 
 
function instanceController(  oboeBus, 
                              contentBuilderHandlers) {
                                
   ascentManager(oboeBus, contentBuilderHandlers);
   
}
