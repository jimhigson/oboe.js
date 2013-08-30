

function pubSub(){

   var listeners = {};
                             
   return {
      notify:varArgs(function ( eventId, parameters ) {
               
         listeners[eventId] && applyAll( listeners[eventId] , parameters );
      }),
      on:function( eventId, fn ) {
         (listeners[eventId] || (listeners[eventId] = [])).push(fn);
            
         return this; // chaining                                         
      }            
   };
}