/**
 * 
 * @param eventBus
 * @param clarinetParser
 * @param {Function} jsonRoot a function which returns the json root so far
 */
function instanceController(on, notify, clarinetParser, jsonRoot, sXhr) {
  
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
         // callback for when the response is complete                                 
         clarinetParser.close();
      }
   );
  
   // react to errors by putting them on the event bus
   clarinetParser.onerror = function(e) {          
      notify(ERROR_EVENT, e);
      
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
      
         try{
            var maybeMatchingMapping = matchesJsonPath( ascent );
         } catch(e) {
            // I'm hoping evaluating the jsonPath won't throw any Errors but in case it does I
            // want to catch as early as possible:
            notify(ERROR_EVENT, Error('Error evaluating pattern ' + pattern + ': ' + e.message));            
         }
        
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
         if( maybeMatchingMapping !== false ) {                                 
           
            try{
               notifyCallback(callback, maybeMatchingMapping, ascent);
               
            } catch(e) {
               notify(ERROR_EVENT, e);
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
                                               
   return { 
      abort       : sXhr.abort,
      addCallback : addPathOrNodeListener, 
      onError     : partialComplete(on, ERROR_EVENT),
      root        : jsonRoot     
   };                                                         
}