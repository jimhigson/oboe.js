function patternAdapter(bus, jsonPathCompiler) {

   var predicateEventMap = {
      node:bus(NODE_FOUND)
   ,  path:bus(PATH_FOUND)
   };

   function addUnderlyingListener( fullEventName, predicateEvent, pattern ){

      var compiledJsonPath = jsonPathCompiler( pattern ),
          fullEvent = bus(fullEventName);
   
      predicateEvent.on( function (ascent) {

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

            fullEvent.emit(nodeOf(maybeMatchingMapping), ascent);
         }
      }, fullEventName);
   
      bus('removeListener').on( function(removedEventName){

         // if the match even listener is later removed, clean up by removing
         // the underlying listener if nothing else is using that pattern:
      
         if( removedEventName == fullEventName ) {
         
            if( !bus(removedEventName).listeners(  )) {
               predicateEvent.un( fullEventName );
            }
         }
      });   
   }

   bus('newListener').on( function(fullEventName){

      var match = /(\w+):(.*)/.exec(fullEventName),
          predicateEvent = match && predicateEventMap[match[1]];
                    
      if( predicateEvent && !predicateEvent.hasListener( fullEventName) ) {  
               
         addUnderlyingListener(
            fullEventName,
            predicateEvent, 
            match[2]
         );
      }    
   })

}