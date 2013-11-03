/** 
 * Over time this should be refactored towards a Node-like
 *    EventEmitter so that under Node an actual EE acn be used.
 *    http://nodejs.org/api/events.html
 */
function pubSub(){

   var listeners = {};
                             
   return {

      on:function( eventId, listener, idToken, cleanupOnRemove ) {
         
         var tuple = {
            listener: listener
         ,  id:       idToken || listener
         ,  clean:    cleanupOnRemove  || noop
         };
         
         listeners[eventId] = cons( tuple, listeners[eventId] );

         return this; // chaining
      },
     
      emit:varArgs(function ( eventId, parameters ) {
         
         function emitInner(tuple) {                  
            tuple.listener.apply(null, parameters);               
         }                    
                                                                              
         applyEach( 
            emitInner, 
            listeners[eventId]
         );
      }),
      
      un: function( eventId, idToken ) {
              
         listeners[eventId] = without(
            listeners[eventId], 
            function(tuple){
               return tuple.id == idToken;
            },
            function(tuple){
               tuple.clean();
            }
         );         
      }           
   };
}