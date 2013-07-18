var jsonPathSyntax = (function() {

   // The regular expressions all start with ^ because we only want to find matches at the start of the jsonPath
   // spec that we are given. As we parse, substrings are taken so the string is consumed from left to right, 
   // allowing new token regexes to match.
   //    For all regular expressions:
   //       The first subexpression is the $ (if the token is eligible to capture)
   //       The second subexpression is the name of the expected path node (if the token may have a name)


   /** allows exporting of a regular expression as a generified function interface by encapsulating just the exec
    *  function
    *  
    *  @type {Function}
    *  
    *  @param {RegExp} regex the regular expression to export
    *  @returns a function which is equivalent to calling exec on that regular expression
    */
   var regexDescriptor =   function regexDescriptor(regex) {
                              return regex.exec.bind(regex);
                           }, 
  
       jsonPathClause =    varArgs(function( componentRegexes ) {
           
                              componentRegexes.unshift(/^/);
                           
                              return regexDescriptor(RegExp(componentRegexes.map(attr('source')).join('')));
                           }),

       possiblyCapturing =           /(\$?)/
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
   
   ;
   
  
   /* we export only a single function. When called, this function injects into a scope the
      descriptor functions from this scope which we want to make available elsewhere. 
    */
   return function (fn){      
      return fn( 
         lazyUnion(
            jsonPathNamedNodeInObjectNotation
         ,  jsonPathNamedNodeInArrayNotation
         ,  jsonPathNumberedNodeInArrayNotation
         ,  jsonPathPureDuckTyping 
         )
      ,  jsonPathDoubleDot
      ,  jsonPathDot
      ,  jsonPathBang
      ,  emptyString 
      );
   }; 

}());