function instanceApi(emit, on, un, jsonPathCompiler){

   var oboeApi,
       addDoneListener = partialComplete(
                              addNodeOrPathListenerApi, 
                              'node', '!');
                              
   function addPathOrNodeCallback( type, pattern, callback ) {
   
      var compiledJsonPath = jsonPathCompiler( pattern ),
                
          underlyingEvent = {node:NODE_FOUND, path:PATH_FOUND}[type];
          
      on( underlyingEvent, function handler( ascent ){ 
 
         var maybeMatchingMapping = compiledJsonPath( ascent );
     
         /* Possible values for maybeMatchingMapping are now:

            false: 
               we did not match 
  
            an object/array/string/number/null: 
               we matched and have the node that matched.
               Because nulls are valid json values this can be null.
  
            undefined: 
               we matched but don't have the matching node yet.
               ie, we know there is an upcoming node that matches but we 
               can't say anything else about it. 
         */
         if( maybeMatchingMapping !== false ) {                                 

            if( !notifyCallback(callback, nodeOf(maybeMatchingMapping), ascent) ) {
            
               un(underlyingEvent, handler);
            }
         }
      });   
   }   
   
   function notifyCallback(callback, node, ascent) {
      /* 
         We're now calling back to outside of oboe where the Lisp-style 
         lists that we are using internally will not be recognised 
         so convert to standard arrays. 
   
         Also, reverse the order because it is more common to list paths 
         "root to leaf" than "leaf to root" 
      */
            
      var descent     = reverseList(ascent),
      
          // To make a path, strip off the last item which is the special
          // ROOT_PATH token for the 'path' to the root node
          path       = listAsArray(tail(map(keyOf,descent))),
          ancestors  = listAsArray(map(nodeOf, descent)),
          keep       = true;
          
      oboeApi.forget = function(){
         keep = false;
      };           
      
      callback( node, path, ancestors );         
            
      delete oboeApi.forget;
      
      return keep;          
   }
      
   function protectedCallback( callback ) {
      return function() {
         try{      
            callback.apply(oboeApi, arguments);   
         }catch(e)  {
         
            // An error occured during the callback, publish it on the event bus 
            emit(FAIL_EVENT, errorReport(undefined, undefined, e));
         }      
      }   
   }
   
   
   /**
    * Add several listeners at a time, from a map
    */
   function addListenersMap(eventId, listenerMap) {
   
      for( var pattern in listenerMap ) {
         addPathOrNodeCallback(eventId, pattern, listenerMap[pattern]);
      }
   }    
      
   /**
    * implementation behind .onPath() and .onNode()
    */       
   function addNodeOrPathListenerApi( eventId, jsonPathOrListenerMap, callback ){
   
      if( isString(jsonPathOrListenerMap) ) {
         addPathOrNodeCallback( 
            eventId, 
            jsonPathOrListenerMap,
            protectedCallback(callback)
         );
      } else {
         addListenersMap(eventId, jsonPathOrListenerMap);
      }
      
      return oboeApi; // chaining
   }
      
   /**
    * implementation behind oboe().on()
    */       
   var addListener = varArgs(function( eventId, parameters ){

      return apply(parameters, oboeApi[eventId]);
   });   
   
   // some interface methods are only filled in after we recieve
   // values and are noops before that:          
   on(ROOT_FOUND, function(root) {
      oboeApi.root = functor(root);   
   });
   
   on(HTTP_START, function(_statusCode, headers) {
      oboeApi.header = 
         function(name) {
            return name ? headers[name] 
                        : headers
                        ;
         }
   });
   
   /**
    * Construct and return the public API of the Oboe instance to be 
    * returned to the calling application
    */       
    
   return oboeApi = {
      on    :  addListener,   
      done  :  addDoneListener,       
      node  :  partialComplete(addNodeOrPathListenerApi, 'node'),
      path  :  partialComplete(addNodeOrPathListenerApi, 'path'),      
      start :  partialComplete(on, HTTP_START),
      fail  :  partialComplete(on, FAIL_EVENT),
      abort :  partialComplete(emit, ABORTING),
      header:  noop,
      root  :  noop
   };   
}   
   