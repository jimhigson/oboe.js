/**
 * @param {Function} jsonRoot a function which returns the json root so far
 */
function instanceController(fire, on, clarinetParser, contentBuilderHandlers, doneCallback) {
  
   var oboeApi, rootNode;
      
   on(ROOT_FOUND, function(root) {
      rootNode = root;   
   });                         
  
   on(HTTP_PROGRESS_EVENT,         
      function (nextDrip) {
         // callback for when a bit more data arrives from the streaming XHR         
          
         try {
            
            clarinetParser.write(nextDrip);            
         } catch(e) { 
            // we don't have to do anything here because we always assign a .onerror
            // to clarinet which will have already been called by the time this 
            // exception is thrown.                
         }
      }
   );
   
   on(HTTP_DONE_EVENT,
      function() {
                                         
         clarinetParser.close();
         
         doneCallback && doneCallback(rootNode);         
      }
   );
   
   /**
    * If we abort this Oboe's request stop listening to the clarinet parser. This prevents more tokens
    * being found after we abort in the case where we aborted while reading though an already filled buffer.
    */
   on( ABORTING, function() {
      clarinetListenerAdaptor(clarinetParser, {});
   });   

   clarinetListenerAdaptor(clarinetParser, contentBuilderHandlers);
  
   // react to errors by putting them on the event bus
   clarinetParser.onerror = function(e) {          
      fire(ERROR_EVENT, e);
      
      // note: don't close clarinet here because if it was not expecting
      // end of the json it will throw an error
   };

   /**
    *  
    */
   function addPathOrNodeListener( eventId, pattern, callback ) {
   
      var matchesJsonPath = jsonPathCompiler( pattern );
   
      // Add a new listener to the eventBus.
      // This listener first checks that he pattern matches then if it does, 
      // passes it onto the callback. 
      on( eventId, function( ascent ){ 
      
         var maybeMatchingMapping = matchesJsonPath( ascent );
     
         // Possible values for maybeMatchingMapping are now:
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
         if( maybeMatchingMapping !== false ) {                                 

            try{              
               notifyCallback(callback, maybeMatchingMapping, ascent);
            } catch(e) {
               // an error could have happened in the callback. Put it
               // on the event bus 
               fire(ERROR_EVENT, e);
            }               
         }
      });   
   }   
   
   function notifyCallback(callback, matchingMapping, ascent) {
      // We're now calling back to outside of oboe where there is no concept of the
      // functional-style lists that we are using internally so convert into standard
      // arrays. Reverse the order because it is more natural to receive in order 
      // "root to leaf" than "leaf to root"             
            
      var descent     = reverseList(ascent),
      
            // for the path list, also need to remove the last item which is the special
            // token for the 'path' to the root node
          path       = listAsArray(tail(map(keyOf,descent))),
          ancestors  = listAsArray(map(nodeOf, descent)); 
      
      callback( nodeOf(matchingMapping), path, ancestors );  
   }
  
   function addListenersMap(eventId, listenerMap) {
   
      for( var pattern in listenerMap ) {
         addPathOrNodeListener(eventId, pattern, listenerMap[pattern]);
      }
   }    
      
   /**
    * implementation behind .onPath() and .onNode(): add one or several listeners in one call  
    * depending on the argument types
    */       
   function addListenerApi( eventId, jsonPathOrListenerMap, callback, callbackContext ){
   
      if( isString(jsonPathOrListenerMap) ) {
         addPathOrNodeListener(eventId, jsonPathOrListenerMap, callback.bind(callbackContext||oboeApi));
      } else {
         addListenersMap(eventId, jsonPathOrListenerMap);
      }
      
      return this; // chaining
   }         

   return oboeApi = { 
      onError     :  partialComplete(on, ERROR_EVENT),
      onPath      :  partialComplete(addListenerApi, TYPE_PATH), 
      onNode      :  partialComplete(addListenerApi, TYPE_NODE),
      abort       :  partialComplete(fire, ABORTING),
      root        :  function rootNodeFunctor() {
                        return rootNode;
                     }
   };
}