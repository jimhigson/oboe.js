function instanceApi(listen, objectSoFar, notifyIfMatches){
   
   /** 
    * @param {String} eventId one of NODE_FOUND_EVENT or PATH_FOUND_EVENT
    */
   function pushListener(eventId, pattern, callback) {
         
      listen( 
         eventId,  
         notifyIfMatches( pattern, callback) 
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
      
      onError: partialComplete(listen, ERROR_EVENT),
      
      root: objectSoFar
   };   

}