
function instanceApi(bus, jsonPathCompiler){

   var oboeApi,
       addDoneListener = partialComplete(
           addNodeOrPathListenerApi, 
                              'node', '!');
   
   
   function startMatchingPattern(matchEventName, predicateEventName, pattern) {

      var compiledJsonPath = jsonPathCompiler( pattern );

      bus.on(predicateEventName, function (ascent) {

         var maybeMatchingMapping = compiledJsonPath(ascent);

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
         if (maybeMatchingMapping !== false) {

            bus.emit(matchEventName, nodeOf(maybeMatchingMapping), ascent);
         }
      }, pattern);
   }                   
                              
   function addPathOrNodeListener( type, pattern, callback ) {
   
      var predicateEventName = {node:NODE_FOUND, path:PATH_FOUND}[type],
          matchEventName = type + ':' + pattern,          
          
          safeCallback = protectedCallback(callback);
          
      if (!bus.listeners(matchEventName)) {          
         startMatchingPattern(matchEventName, predicateEventName, pattern);
      }
      
      bus.on( matchEventName, function(node, ascent) {
      
            if( !notifyCallback(safeCallback, node, ascent) ) {         
               bus.un(matchEventName, callback);
            }         
         
         }, callback)
      
         // if the match even listener is later removed, clean up by removing
         // the underlying listener if nothing else is using that pattern:
         .on('removeListener', function(eventName, listenerId){
         
            if( eventName == matchEventName && listenerId == callback ) {
               // if there wasn't another listener as well as this one, remove
               // the listener above against the underlying pattern      
               if( bus.listeners( matchEventName )) {
                  bus.un( predicateEventName, pattern );
               }
            }
         });   
   }   
   
   function removePathOrNodeListener( type, pattern, callback ) {
      bus.un(type + ':' + pattern, callback)
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
            bus.emit(FAIL_EVENT, errorReport(undefined, undefined, e));
         }      
      }   
   }

   /** 
    * a version of on which first wraps the callback with
    * protection against errors being thrown
    */
   function safeOn( eventName, callback ){
      bus.on(eventName, protectedCallback(callback));
      return oboeApi;
   }
      
   /**
    * Add several listeners at a time, from a map
    */
   function addListenersMap(eventId, listenerMap) {
   
      for( var pattern in listenerMap ) {
         addPathOrNodeListener(eventId, pattern, listenerMap[pattern]);
      }
   }    
      
   /**
    * implementation behind .onPath() and .onNode()
    */       
   function addNodeOrPathListenerApi( eventId, jsonPathOrListenerMap, callback ){
   
      if( isString(jsonPathOrListenerMap) ) {
         addPathOrNodeListener( 
            eventId, 
            jsonPathOrListenerMap,
            callback
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

      if( oboeApi[eventId] ) {
      
         // event has some special handling:
         apply(parameters, oboeApi[eventId]);
      } else {
      
         // the even has no special handling, add it directly to
         // the event bus:         
         var listener = parameters[0]; 
         bus.on(eventId, listener);
      }
      
      return oboeApi;
   });   
   
   // some interface methods are only filled in after we recieve
   // values and are noops before that:          
   bus.on(ROOT_FOUND, function(root) {
      oboeApi.root = functor(root);   
   });
   
   bus.on(HTTP_START, function(_statusCode, headers) {
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
      start :  partialComplete(safeOn, HTTP_START),
      // fail doesn't use safeOn because that could lead to non-terminating loops
      fail  :  partialComplete(bus.on, FAIL_EVENT),
      abort :  partialComplete(bus.emit, ABORTING),
      header:  noop,
      root  :  noop
   };   
}   
   