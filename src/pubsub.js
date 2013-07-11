var TYPE_NODE = 'n',
    TYPE_PATH = 'p',
    ERROR_EVENT = 'e';

function pubSub(){

   var listeners = {n:[], p:[], e:[]};
                             
   return {
      notify:varArgs(function ( eventId, parameters ) {
               
         applyAll( listeners[eventId], parameters );
      }),
      on:function( eventId, fn ) {      
         listeners[eventId].push(fn);
         return this; // chaining                                         
      }            
   };
}