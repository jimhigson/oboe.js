/** 
 * Over time this should be refactored towards a Node-like
 *    EventEmitter so that under Node an actual EE acn be used.
 *    http://nodejs.org/api/events.html
 */
function pubSub(){

   var listeners = {};

   function hasId(id){
      return function(tuple) {
         return tuple.id == id;      
      };  
   }

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
       * @param eventName
       * @param listener
       * @param listenerId
       */
      on:function( eventName, listener, listenerId ) {
         
         var tuple = {
            listener: listener
         ,  id:       listenerId || listener // when no id is given use the
                                             // listener function as the id
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
            hasId(listenerId),
            function(tuple){
               removed = tuple;
            }
         );    
         
         if( removed ) {
            emit('removeListener', eventName, removed.listener, removed.id);
         }     
      },
      
      listeners: function( eventName ){
         // differs from Node EventEmitter: returns list, not array
         return map(attr('listener'), listeners[eventName]);
      },
      
      hasListener: function(eventName, listenerId){
         var test = listenerId? hasId(listenerId) : always;
      
         return defined(first( test, listeners[eventName]));
      }
   };
}