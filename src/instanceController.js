/**
 * This file implements a light-touch central controller for an instance 
 * of Oboe which provides the methods used for interacting with the instance 
 * from the calling app.
 */
 
 
function instanceController(  emit, on, un, 
                              clarinetParser, contentBuilderHandlers) {
  
   var oboeApi, rootNode, responseHeaders,
       addDoneListener = partialComplete(
                              addNodeOrPathListenerApi, 
                              NODE_FOUND, 
                              '!');

   // when the root node is found grap a reference to it for later      
   on(ROOT_FOUND, function(root) {
      rootNode = root;   
   });
   
   on(HTTP_START, function(_statusCode, headers) {
      responseHeaders = headers;
   });
                              
   on(STREAM_DATA,         
      function (nextDrip) {
         // callback for when a bit more data arrives from the streaming XHR         
          
         try {
            
            clarinetParser.write(nextDrip);            
         } catch(e) { 
            /* we don't have to do anything here because we always assign
               a .onerror to clarinet which will have already been called 
               by the time this exception is thrown. */                
         }
      }
   );
   
   /* At the end of the http content close the clarinet parser.
      This will provide an error if the total content provided was not 
      valid json, ie if not all arrays, objects and Strings closed properly */
   on(STREAM_END, clarinetParser.close.bind(clarinetParser));
   

   /* If we abort this Oboe's request stop listening to the clarinet parser. 
      This prevents more tokens being found after we abort in the case where 
      we aborted during processing of an already filled buffer. */
   on( ABORTING, function() {
      clarinetListenerAdaptor(clarinetParser, {});
   });   

   clarinetListenerAdaptor(clarinetParser, contentBuilderHandlers);
  
   // react to errors by putting them on the event bus
   clarinetParser.onerror = function(e) {          
      emit(
         FAIL_EVENT, 
         errorReport(undefined, undefined, e)
      );
      
      // note: don't close clarinet here because if it was not expecting
      // end of the json it will throw an error
   };

   function addPathOrNodeCallback( eventId, pattern, callback ) {
   
      var matchesJsonPath = jsonPathCompiler( pattern );
   
      // Add a new callback adaptor to the eventBus.
      // This listener first checks that he pattern matches then if it does, 
      // passes it onto the callback. 
      on( eventId, function handler( ascent ){ 
 
         var maybeMatchingMapping = matchesJsonPath( ascent );
     
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

            if( !notifyCallback(callback, maybeMatchingMapping, ascent) ) {
            
               un(eventId, handler);
            }
         }
      });   
   }   
   
   function notifyCallback(callback, matchingMapping, ascent) {
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
      
      callback( nodeOf(matchingMapping), path, ancestors );         
            
      delete oboeApi.forget;
      
      return keep;          
   }

   function protectedCallback( callback, context ) {
      return function() {
         try{      
            callback.apply(context||oboeApi, arguments);   
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
   function addNodeOrPathListenerApi( eventId, jsonPathOrListenerMap,
                                      callback, callbackContext ){
 
      if( isString(jsonPathOrListenerMap) ) {
         addPathOrNodeCallback( 
            eventId, 
            jsonPathOrListenerMap,
            protectedCallback(callback, callbackContext)
         );
      } else {
         addListenersMap(eventId, jsonPathOrListenerMap);
      }
      
      return this; // chaining
   }
      
   /**
    * implementation behind oboe().on()
    */       
   function addListener( eventId, listener ){
         
      switch(eventId) {
         case NODE_FOUND:
         case PATH_FOUND:
            apply(arguments, addNodeOrPathListenerApi);
            break;
            
         case 'done':
            addDoneListener(listener);         
            break;
            
         default:
            // for cases: 'fail', 'start'
            on(eventId, listener);
      }                     
                                               
      return this; // chaining
   }   
   
   /**
    * Construct and return the public API of the Oboe instance to be 
    * returned to the calling application
    */
   return oboeApi = { 
      path  :  partialComplete(addNodeOrPathListenerApi, PATH_FOUND), 
      node  :  partialComplete(addNodeOrPathListenerApi, NODE_FOUND),
      on    :  addListener,
      start :  partialComplete(addListener, HTTP_START),
      fail  :  partialComplete(on, FAIL_EVENT),
      done  :  addDoneListener,
      abort :  partialComplete(emit, ABORTING),
      header:  function(name) {
                  return name ? responseHeaders && responseHeaders[name] 
                              : responseHeaders
                              ;
               },
      root  :  function rootNodeFunctor() {
                  return rootNode;
               }
   };
}