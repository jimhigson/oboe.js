/**
 * isn't this the smallest little pub-sub library you've ever seen?
 */
function pubSub(){

   var listeners = {};
                             
   return {

      on:function( eventId, fn ) {
         (listeners[eventId] || (listeners[eventId] = [])).push(fn);
             
         return this; // chaining                                         
      }, 
   
      fire:varArgs(function ( eventId, parameters ) {
               
         listeners[eventId] && applyAll( listeners[eventId] , parameters );
      })           
   };
}