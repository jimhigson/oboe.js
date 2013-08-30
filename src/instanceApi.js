/* 
   The API that is given out when a new Oboe instance is created.
    
   This file handles the peculiarities of being able to add listeners in a couple of different syntaxes
   and returns the object that exposes a small number of methods.
 */

function instanceApi(instController){
   
   /**
    * implementation behind .onPath() and .onNode(): add several listeners in one call  
    * @param listenerMap
    */
   function pushListeners(eventId, listenerMap) {
   
      for( var pattern in listenerMap ) {
         instController.addCallback(eventId, pattern, listenerMap[pattern]);
      }
   }    
      
   /**
    * implementation behind .onPath() and .onNode(): add one or several listeners in one call  
    * depending on the argument types
    */       
   function addNodeOrPathListener( eventId, jsonPathOrListenerMap, callback, callbackContext ){
   
      if( isString(jsonPathOrListenerMap) ) {
         instController.addCallback(eventId, jsonPathOrListenerMap, callback.bind(callbackContext));
      } else {
         pushListeners(eventId, jsonPathOrListenerMap);
      }
      
      return this; // chaining
   }         

   instController.onPath = partialComplete(addNodeOrPathListener, TYPE_PATH); 
   instController.onNode = partialComplete(addNodeOrPathListener, TYPE_NODE); 

   return instController;   
}