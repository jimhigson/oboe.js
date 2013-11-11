/** 
 * Over time this should be refactored towards a Node-like
 *    EventEmitter so that under Node an actual EE acn be used.
 *    http://nodejs.org/api/events.html
 */
function pubSub(){

   var singles = {},
       newListener = newSingle('newListener'),
       removeListener = newSingle('removeListener'); 
      
   function newSingle(eventName) {
      return singles[eventName] = singleEventPubSub(eventName, newListener, removeListener);   
   }      

   /** pubSub instances are functions */
   function pubSubInstance( eventName ){   
      if( !singles[eventName] ) {
         return newSingle( eventName );
      }
      
      return singles[eventName];   
   }
   
   // convenience EventEmitter-style uncurried form
   pubSubInstance.emit = varArgs(function(eventName, parameters){
      apply( parameters, pubSubInstance( eventName ).emit);
   });
   
   return pubSubInstance;
}