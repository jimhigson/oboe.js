/**
 * Isn't this the cutest little pub-sub you've ever seen?
 * 
 * Over time this should be refactored towards a Node-like
 *    EventEmitter so that under Node an actual EE acn be used.
 *    http://nodejs.org/api/events.html
 */
function pubSub(){

   var listeners = {};
                             
   return {

      on:function( eventId, fn ) {
         
         listeners[eventId] = cons(fn, listeners[eventId]);

         return this; // chaining
      }, 
    
      emit:varArgs(function ( eventId, parameters ) {
               
         each( 
            partialComplete( apply, parameters ), 
            listeners[eventId]
         );
      }),
      
      un: function( eventId, handler ) {
         listeners[eventId] = without(listeners[eventId], handler);
      }           
   };
}