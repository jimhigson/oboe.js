

function controller(eventBus, clarinetParser, httpMethodName, url, httpRequestBody, doneCallback) {

   var                
       notify = eventBus.notify, // shortcut
       on = eventBus.on,
                                                    
       /**
        * @type {Function}
        */          
       objectSoFar = jsonBuilder(clarinetParser, notify);
   
   clarinetParser.onerror =  
       function(e) {          
          notify(ERROR_EVENT, e);
            
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
                 
   /**
    *  
    */
   function addNewCallback( eventId, pattern, callback ) {
   
      var test = jsonPathCompiler( pattern );
   
      // Add a new listener to the eventBus.
      // This listener first checks that he pattern matches then if it does, 
      // passes it onto the callback. 
      on( eventId, function(path, nodeList){ 
      
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
               callback(foundNode, path, nodeList );
            } catch(e) {
               notify(ERROR_EVENT, Error('Error thrown by callback: ' + e.message));
            }
         }
      });   
   }   
                                          
   return instanceApi(on, objectSoFar, addNewCallback);                                                         
}