function patternAdapter(oboeBus, jsonPathCompiler) {

   var predicateEventMap = {
      node:oboeBus(NODE_FOUND)
   ,  path:oboeBus(PATH_FOUND)
   };

   function addUnderlyingListener( fullEventName, predicateEvent, compiledJsonPath ){

      var fullEvent = oboeBus(fullEventName);
   
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
   
      oboeBus('removeListener').on( function(removedEventName){

         // if the match even listener is later removed, clean up by removing
         // the underlying listener if nothing else is using that pattern:
      
         if( removedEventName == fullEventName ) {
         
            if( !oboeBus(removedEventName).listeners(  )) {
               predicateEvent.un( fullEventName );
            }
         }
      });   
   }

   oboeBus('newListener').on( function(fullEventName){

      var match = /(node|path):(.*)/.exec(fullEventName);
      
      if( match ) {
         var predicateEvent = predicateEventMap[match[1]];
                    
         if( !predicateEvent.hasListener( fullEventName) ) {  
                  
            addUnderlyingListener(
               fullEventName,
               predicateEvent, 
               jsonPathCompiler( match[2] )
            );
         }
      }    
   })

}