var NODE_FOUND_EVENT = 'n',
    PATH_FOUND_EVENT = 'p';

function pubSub(){

   var listeners = {n:[], p:[]},
       errorListeners = [];

   /**
    * Test if something found in the json matches the pattern and, if it does,
    * calls the callback.
    * 
    * After partial completion of the first three args, we are left with a function which when called with the details 
    * of something called in the parsed json, calls the listener if it matches.
    * 
    * @param test
    * @param callback
    * @param callbackContext
    */
   function callConditionally( test, callback, callbackContext, path, ancestors, nodeList ) {
     
      var foundNode = test( path, nodeList );
     
      // Possible values for foundNode are now:
      //
      //    false: 
      //       we did not match
      //
      //    an object/array/string/number/null: 
      //       that node is the one that matched. Because json can have nulls, this can 
      //       be null.
      //
      //    undefined: like above, but we don't have the node yet. ie, we know there is a
      //       node that matches but we don't know if it is an array, object, string
      //       etc yet so we can't say anything about it. Null isn't used here because
      //       it would be indistinguishable from us finding a node with a value of
      //       null.
      //                      
      if( foundNode !== false ) {                                 
        
         // change curNode to foundNode when it stops breaking tests
         try{
            callback.call(callbackContext, foundNode, path, ancestors );
         } catch(e) {
            errorHappened(Error('Error thrown by callback ' + e.message));
         }
      }   
   }
                 
   /**
    * Notify any of the listeners in a list that are interested in the path or node that was
    * just found.
    * 
    * @param {Array} listenerList one of listenerMap[NODE_FOUND_EVENT] or 
    *                listenerMap[PATH_FOUND_EVENT]
    */  
   /**
    * @returns {*} an identifier that can later be used to de-register this listener
    */
   function pushListener(listenerList, pattern, callback, callbackContext) {
         
      listenerList.push( 
         partialComplete(
            callConditionally,
            jsonPathCompiler(pattern),
            callback, 
            callbackContext || window
         ) 
      );            
   }

   /**
    * implementation behind .onPath() and .onNode(): add several listeners in one call  
    * @param listenerMap
    */
   function pushListeners(listenerList, listenerMap) {
   
      // TODO: document this call style
      for( var pattern in listenerMap ) {
         pushListener(listenerList, pattern, listenerMap[pattern]);
      }
   }
   
   function errorHappened(error) {
      callAll( errorListeners, error );            
   }       
   
   return {
      notify:function ( eventId, node, path, ancestors ) {
            
         var nodeList = ancestors.concat([node]),
             listenerList = listeners[eventId];
   
         callAll( listenerList, path, ancestors, nodeList );
      },
      on:function( eventId, jsonPath, callback, callbackContext ) {
      
         var listenerList = listeners[eventId];
         
         if( isString(jsonPath) ) {
            pushListener(listenerList, jsonPath, callback, callbackContext);
         } else {
            pushListeners(listenerList, jsonPath);
         }
         return this; // chaining                                 
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