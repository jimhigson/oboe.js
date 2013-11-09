function patternAdapter(bus, jsonPathCompiler) {

   function addUnderlyingListener( matchEventName, predicateEventName, pattern ){

      var compiledJsonPath = jsonPathCompiler( pattern );
   
      bus(predicateEventName).on( function (ascent) {

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
             
            bus(matchEventName).emit(nodeOf(maybeMatchingMapping), ascent);
         }
      }, matchEventName);
   
   
      bus('removeListener').on( function(removedEventName){
   
         // if the match even listener is later removed, clean up by removing
         // the underlying listener if nothing else is using that pattern:
      
         if( removedEventName == matchEventName ) {
         
            if( !bus(removedEventName).listeners(  )) {
               bus( predicateEventName ).un( matchEventName );
            }
         }
      });   
   }

   bus('newListener').on( function(matchEventName){

      var match = /(\w+):(.*)/.exec(matchEventName),
          predicateEventName = match && {node:NODE_FOUND, path:PATH_FOUND}[match[1]];
                    
      if( predicateEventName && !bus( predicateEventName ).hasListener( matchEventName) ) {  
               
         addUnderlyingListener(
            matchEventName,
            predicateEventName, 
            match[2]
         );
      }    
   })

}