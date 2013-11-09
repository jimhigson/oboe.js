
function instanceApi(bus){

   var oboeApi,
       addDoneListener = partialComplete(
           addNodeOrPathListenerApi, 
           'node', '!');
   
   
   function addPathOrNodeListener( publicApiName, pattern, callback ) {
   
      var matchEventName = publicApiName + ':' + pattern,          
          
          safeCallback = protectedCallback(callback);
                              
      bus(matchEventName).on(  function(node, ascent) {
      
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
         
         safeCallback( node, path, ancestors );         
               
         delete oboeApi.forget;
         
         if(! keep ) {          
            bus(matchEventName).un( callback);
         }
                  
      
      }, callback)

   }   
   
   function removePathOrNodeListener( publicApiName, pattern, callback ) {
      bus(publicApiName + ':' + pattern).un(callback)
   }
         
   function protectedCallback( callback ) {
      return function() {
         try{      
            callback.apply(oboeApi, arguments);   
         }catch(e)  {
         
            // An error occured during the callback, publish it on the event bus 
            bus(FAIL_EVENT).emit( errorReport(undefined, undefined, e));
         }      
      }   
   }

   /** 
    * a version of on which first wraps the callback with
    * protection against errors being thrown
    */
   function safeOn( eventName, callback ){
      bus(eventName).on( protectedCallback(callback));
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
         bus(eventId).on( listener);
      }
      
      return oboeApi;
   });   
   
   // some interface methods are only filled in after we recieve
   // values and are noops before that:          
   bus(ROOT_FOUND).on( function(root) {
      oboeApi.root = functor(root);   
   });
   
   bus(HTTP_START).on( function(_statusCode, headers) {
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
      fail  :  bus(FAIL_EVENT).on,
      abort :  bus(ABORTING).emit,
      header:  noop,
      root  :  noop
   };   
}   
   