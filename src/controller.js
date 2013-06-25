

function controller(httpMethodName, url, body, doneCallback) {

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
                         partialComplete(events.notify, NODE_FOUND_EVENT),
      
                         // when a node is found, notify matching path listeners:                                        
                         partialComplete(events.notify, PATH_FOUND_EVENT)
                     );
   
   clarinetParser.onerror =  
       function(e) {
          events.notifyErr(e);
            
          // the json is invalid, give up and close the parser to prevent getting any more:
          clarinetParser.close();
       };
                     
   /* Given a value from the user to send as the request body, return in a form
      that is suitable to sending over the wire. Which is, either a string or
      null.                     
    */
   function validatedBody( body ) {
      if( !body )
         return null;
   
      return isString(body)? body: JSON.stringify(body);
   }                        
                                                                                                                            
   streamingXhr(
      httpMethodName,
      url, 
      validatedBody(body),
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
      
   return {      
      onPath: partialComplete(events.on, PATH_FOUND_EVENT),
      
      onNode: partialComplete(events.on, NODE_FOUND_EVENT),
      
      onError: events.onError,
      
      root: objectSoFar
   };                                         
}