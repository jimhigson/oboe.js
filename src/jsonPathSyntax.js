var jsonPathSyntax = (function() {

   // The regular expressions all start with ^ because we only want to find matches at the start of the jsonPath
   // spec that we are given. As we parse, substrings are taken so the string is consumed from left to right, 
   // allowing new token regexes to match.
   //    For all regular expressions:
   //       The first subexpression is the $ (if the token is eligible to capture)
   //       The second subexpression is the name of the expected path node (if the token may have a name)
   
   var jsonPathClause = varArgs(function( strings ) {
           
      strings.unshift(/^/);
      
      return RegExp(strings.map(attr('source')).join(''));
   });

   var possiblyCapturing =           /(\$?)/
   ,   namedNode =                   /(\w+|\*)/
   ,   namePlaceholder =             /()/
   ,   nodeInArrayNotation =         /\["(\w+)"\]/
   ,   numberedNodeInArrayNotation = /\[(\d+|\*)\]/
   ,   fieldList =                      /{([\w ]*?)}/
   ,   optionalFieldList =           /(?:{([\w ]*?)})?/
    
                  
   ,   jsonPathNamedNodeInObjectNotation     = jsonPathClause(possiblyCapturing, namedNode, optionalFieldList)
                                                                                       //   foo or *
   
   ,   jsonPathNamedNodeInArrayNotation      = jsonPathClause(possiblyCapturing, nodeInArrayNotation, optionalFieldList)
                                                                                       //   ["foo"]  
       
   ,   jsonPathNumberedNodeInArrayNotation   = jsonPathClause(possiblyCapturing, numberedNodeInArrayNotation, optionalFieldList)
                                                                                       //   [2] or [*]
      
   ,   jsonPathPureDuckTyping                = jsonPathClause(possiblyCapturing, namePlaceholder, fieldList)
   
   ,   jsonPathDoubleDot                     = jsonPathClause(/\.\./)                  //   ..
   
   ,   jsonPathDot                           = jsonPathClause(/\./)                    //   .
   
   ,   jsonPathBang                          = jsonPathClause(possiblyCapturing, /!/)  //   !
   
   ,   emptyString                           = jsonPathClause(/$/)                     //   nada!
   
   ,   
   //  see jsonPathNodeDescription below
       nodeExpressions = [
            jsonPathNamedNodeInObjectNotation
         ,  jsonPathNamedNodeInArrayNotation
         ,  jsonPathNumberedNodeInArrayNotation
         ,  jsonPathPureDuckTyping 
       ]
         
   ,   jsonPathNodeDescription = apply(lazyUnion, nodeExpressions.map(regexDescriptor))         
   ;      

   /** allows exporting of a regular expression under a generified function interface
    * @param regex
    */
   function regexDescriptor(regex) {
      return function(candidate){
         return regex.exec(candidate);
      }
   }
  
   /* we export only a single function. When called, this function injects into a scope the
      descriptor functions from this scope which we want to make available elsewhere. 
    */
   return function (fn){      
      return fn( 
          jsonPathNodeDescription,
          regexDescriptor(jsonPathDoubleDot),
          regexDescriptor(jsonPathDot),
          regexDescriptor(jsonPathBang),
          regexDescriptor(emptyString) );
   }; 

}());