var NODE_FOUND_EVENT = 'n',
    PATH_FOUND_EVENT = 'p',
    ERROR_EVENT = 'e';

function pubSub(){

   var listeners = {n:[], p:[], e:[]};
                             
   return {
      notify:function ( eventId /* arguments... */ ) {
               
         applyAll( listeners[eventId], toArray(arguments,1) );
      },
      on:function( eventId, fn ) {      
         listeners[eventId].push(fn);
         return this; // chaining                                         
      }            
   };
}