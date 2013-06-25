var NODE_FOUND_EVENT = 'n',
    PATH_FOUND_EVENT = 'p';

function pubSub(){

   var listeners = {n:[], p:[]},
       errorListeners = [];
                    
   function errorHappened(error) {
      callAll( errorListeners, error );            
   }       
   
   return {
      notify:function ( eventId /* arguments... */ ) {
               
         applyAll( listeners[eventId], toArray(arguments,1) );
      },
      on:function( eventId, fn ) {      
         listeners[eventId].push(fn);                                         
      },
      
      /**
       * 
       * @param error
       */
      notifyErr: errorHappened,
         
      /**
       * Add a new json path to the parser, which will be called when a value is found at the given path
       *
       * @param {Function} callback
       */
      onError: function (callback) {   
         errorListeners.push(callback);
         return this; // chaining
      }      
      
   };
}