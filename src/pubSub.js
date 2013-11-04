/** 
 * Over time this should be refactored towards a Node-like
 *    EventEmitter so that under Node an actual EE acn be used.
 *    http://nodejs.org/api/events.html
 */
function pubSub(){

   var listeners = {};

   var emit = varArgs(function ( eventName, parameters ) {
            
      function emitInner(tuple) {                  
         tuple.listener.apply(null, parameters);               
      }                    
                                                                           
      applyEach( 
         emitInner, 
         listeners[eventName]
      );
   });
                             
   return {

      /**
       * 
       * @param eventName
       * @param listener
       * @param listenerId
       * @param {Function} cleanupOnRemove if this listener is later 
       *    removed, a function to call just prior to its removal
       */
      on:function( eventName, listener, listenerId, cleanupOnRemove ) {
         
         var tuple = {
            listener: listener
         ,  id:       listenerId || listener // when no id is given use the
                                             // listener function as the id
         ,  clean:    cleanupOnRemove  || noop
         };

         emit('newListener', eventName, listener, tuple.id);
         
         listeners[eventName] = cons( tuple, listeners[eventName] );

         return this; // chaining
      },
     
      emit:emit,
      
      un: function( eventName, listenerId ) {
             
         var removed;             
              
         listeners[eventName] = without(
            listeners[eventName], 
            function(tuple){
               return tuple.id == listenerId;
            },
            function(tuple){
               removed = tuple;
            }
         );    
         
         if( removed ) {
            emit('removeListener', eventName, removed.listener, removed.id);
         }     
      },
      
      listeners: function( eventName ){
      
         return listeners[eventName];
      }     
   };
}