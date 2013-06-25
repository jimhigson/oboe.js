

function controller(httpMethodName, url, httpRequestBody, doneCallback) {

   var 
       // the api available on an oboe instance. Will expose 3 methods, onPath, onNode and onError               
       events = pubSub(),
              
       clarinetParser = clarinet.parser(),           
                                      
       // create a json builder and store a function that can be used to get the
       // root of the json later:
       /**
        * @type {Function}
        */          
       objectSoFar = jsonBuilder(
                         clarinetParser,
                          
                         // when a node is found, notify matching node listeners:
                         partialComplete(somethingFound, NODE_FOUND_EVENT),
      
                         // when a node is found, notify matching path listeners:                                        
                         partialComplete(somethingFound, PATH_FOUND_EVENT)
                     );
   
   clarinetParser.onerror =  
       function(e) {
          events.notify(ERROR_EVENT, e);
            
          // the json is invalid, give up and close the parser to prevent getting any more:
          clarinetParser.close();
       };
                     
                                                                                                                                                    
   streamingXhr(
      httpMethodName,
      url, 
      httpRequestBody,
      function (nextDrip) {
         // callback for when a bit more data arrives from the streaming XHR         
          
         try {
            clarinetParser.write(nextDrip);
         } catch(e) {
            // we don't have to do anything here because we always assign a .onerror
            // to clarinet which will have already been called by the time this 
            // exception is thrown.                
         }
      },
      function() {
         // callback for when the response is complete                     
         clarinetParser.close();
         
         doneCallback && doneCallback(objectSoFar());
      });
              
   function somethingFound(eventId, node, path, ancestors) {
      var nodeList = ancestors.concat([node]);
      
      events.notify(eventId, path, ancestors, nodeList);   
   }              
              
   /**
    * Test if something found in the json matches the pattern and, if it does,
    * calls the callback.
    * 
    * After partial completion of the first three args, we are left with a function which when called with the details 
    * of something called in the parsed json, calls the listener if it matches.
    * 
    * @param test
    * @param callback
    */
   function notifyConditionally( test, callback, path, ancestors, nodeList ) {
     
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
            callback(foundNode, path, ancestors );
         } catch(e) {
            events.notify(ERROR_EVENT, Error('Error thrown by callback ' + e.message));
         }
      }   
   }
   
   /** 
    * @param {String} eventId one of NODE_FOUND_EVENT or PATH_FOUND_EVENT
    */
   function pushListener(eventId, pattern, callback) {
         
      events.on( 
         eventId,  
         partialComplete(
            notifyConditionally,
            jsonPathCompiler(pattern),
            callback
         ) 
      );            
   }

   /**
    * implementation behind .onPath() and .onNode(): add several listeners in one call  
    * @param listenerMap
    */
   function pushListeners(eventId, listenerMap) {
   
      // TODO: document this call style
      for( var pattern in listenerMap ) {
         pushListener(eventId, pattern, listenerMap[pattern]);
      }
   }    
      
   /**
    * implementation behind .onPath() and .onNode(): add one or several listeners in one call  
    * depending on the argument types
    */       
   function addNodeOrPathListener( eventId, jsonPathOrListenerMap, callback, callbackContext ){
   
      if( isString(jsonPathOrListenerMap) ) {
         pushListener(eventId, jsonPathOrListenerMap, callback.bind(callbackContext));
      } else {
         pushListeners(eventId, jsonPathOrListenerMap);
      }
      
      return this; // chaining
   }      
      
   return {      
      onPath: partialComplete(addNodeOrPathListener, PATH_FOUND_EVENT),
      
      onNode: partialComplete(addNodeOrPathListener, NODE_FOUND_EVENT),
      
      onError: partialComplete(events.on, ERROR_EVENT),
      
      root: objectSoFar
   };                                         
}