/**
 * isn't this the smallest little pub-sub library you've ever seen?
 */
function pubSub(){

   var listeners = {};
                             
   return {

      on:function( eventId, fn ) {
         
         listeners[eventId] = cons(fn, listeners[eventId]);

         return this; // chaining
      }, 
    
      fire:function ( eventId, event ) {
              
         listEach(
            partialComplete( apply, event && [event] ), 
            listeners[eventId]
         );
      }           
   };
}