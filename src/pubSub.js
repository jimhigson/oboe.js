/**
 * Isn't this the cutest little pub-sub you've ever seen?
 * 
 * Does not allow unsubscription because is never needed inside Oboe.
 * Instead, when an Oboe instance is finished the whole of it should be
 * available for GC'ing.
 */
function pubSub(){

   var listeners = {};
                             
   return {

      on:function( eventId, fn ) {
         
         listeners[eventId] = cons(fn, listeners[eventId]);

         return this; // chaining
      }, 
    
      fire:varArgs(function ( eventId, parameters ) {
               
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