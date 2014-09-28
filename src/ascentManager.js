
/** 
 * A bridge used to assign stateless functions to listen to clarinet.
 * 
 * As well as the parameter from clarinet, each callback will also be passed
 * the result of the last callback.
 * 
 * This may also be used to clear all listeners by assigning zero handlers:
 * 
 *    ascentManager( clarinet, {} )
 */
function ascentManager(oboeBus, handlers){
   "use strict";
   
   var id = {},
       state;

   function stateAfter(handler) {
      return function(param){
         state = handler( state, param);
      }
   }
   
   for( var eventName in handlers ) {

      oboeBus(eventName).on(stateAfter(handlers[eventName]), id);
   }

   oboeBus(ABORTING).on(function(){
      
      for( var eventName in handlers ) {
         oboeBus(eventName).un(id);
      }
   });   
}
