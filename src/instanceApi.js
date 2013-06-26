/* 
   The API that is given out when a new Oboe instance is created.
    
   This file handles the peculiarities of being able to add listeners in a couple of different syntaxes
   and returns the object that exposes a small number of methods.
 */

function instanceApi(controller, eventBus, incrementalParsedContent){
   
   /**
    * implementation behind .onPath() and .onNode(): add several listeners in one call  
    * @param listenerMap
    */
   function pushListeners(eventId, listenerMap) {
   
      for( var pattern in listenerMap ) {
         controller.addNewCallback(eventId, pattern, listenerMap[pattern]);
      }
   }    
      
   /**
    * implementation behind .onPath() and .onNode(): add one or several listeners in one call  
    * depending on the argument types
    */       
   function addNodeOrPathListener( eventId, jsonPathOrListenerMap, callback, callbackContext ){
   
      if( isString(jsonPathOrListenerMap) ) {
         controller.addNewCallback(eventId, jsonPathOrListenerMap, callback.bind(callbackContext));
      } else {
         pushListeners(eventId, jsonPathOrListenerMap);
      }
      
      return this; // chaining
   }         

   return {      
      onPath: partialComplete(addNodeOrPathListener, PATH_FOUND_EVENT),
      
      onNode: partialComplete(addNodeOrPathListener, NODE_FOUND_EVENT),
      
      onError: partialComplete(eventBus.on, ERROR_EVENT),
      
      root: incrementalParsedContent
   };   

}