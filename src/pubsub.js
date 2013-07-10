var NODE_FOUND_EVENT = 'n',
    PATH_FOUND_EVENT = 'p',
    ERROR_EVENT = 'e';

function pubSub(){

   var listeners = {n:[], p:[], e:[]};
                             
   return {
      notify:varArgs(1, function ( eventId, parameters ) {
               
         applyAll( listeners[eventId], parameters );
      }),
      on:function( eventId, fn ) {      
         listeners[eventId].push(fn);
         return this; // chaining                                         
      }            
   };
}