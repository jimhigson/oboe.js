
var jsonPathCompiler = (function () {

   /** 
    * tokenExprs is an array of pairs. Each pair contains a regular expression for matching a 
    * jsonpath language feature and a function for parsing that feature.
    */
   var tokenExprs = (function(){
   
      /**
       * Expression for:
       *    *
       *    [*]
       * 
       * @returns {Object|false} either the object that was found, or false if nothing was found         
       */
      function unnamedNodeExpr(previousExpr, capturing, _nameless, pathStack, nodeStack, stackIndex ){
      
         // a '*' doesn't put any extra criteria on the matching, it just defers to the previous expression:
         var previous = previousExpr(pathStack, nodeStack, stackIndex-1);                   
                  
         return previous && returnValueForMatch(capturing, previous, nodeStack, stackIndex);
      }
      
      /**
       * Expression for a named path node, expressed as:
       *    foo
       *    ["foo"]
       *    [2]
       * 
       * @returns {Object|false} either the object that was found, or false if nothing was found
       */
      function namedNodeExpr(previousExpr, capturing, name, pathStack, nodeStack, stackIndex ) {
                                               
         // in implementation, is like unnamednodeExpr except that we need the name to match.
         // Once name matches, defer to unnamedNodeExpr:                                                                  
         return (pathStack[stackIndex] == name) && unnamedNodeExpr(previousExpr, capturing, name, pathStack, nodeStack, stackIndex );               
      }      
      
      /**
       * Expression for .. (double dot) token              
       * 
       * @returns {Object|false} either the object that was found, or false if nothing was found         
       */   
      function multipleUnnamedNodesExpr(previousExpr, _neverCaptures, _nameless, pathStack, nodeStack, stackIndex ) {
               
         // past the start, not a match:
         if( stackIndex < -1 ) {
            return false;
         }
      
         return stackIndex == -1 || // -1 is the root 
                previousExpr(pathStack, nodeStack, stackIndex) || 
                multipleUnnamedNodesExpr(previousExpr, _neverCaptures, _nameless, pathStack, nodeStack, stackIndex-1);         
      }      
      
      /**
       * Expression for $ - matches only the root element of the json
       * 
       * @returns {Object|false} either the object that was found, or false if nothing was found         
       */   
      function rootExpr(_cantHaveExprsBeforeRoot, capturing, _nameless, pathStack, nodeStack, stackIndex ){
         return stackIndex == -1 && returnValueForMatch(capturing, true, nodeStack, stackIndex);
      }   
      
      /**
       * Expression for . does no tests since . is just a separator. Just passes through to the
       * next function in the chain.
       * 
       * @returns {Object|false} either the object that was found, or false if nothing was found         
       */   
      function passthroughExpr(previousExpr, _neverCaptures, _nameless, pathStack, nodeStack, stackIndex) {
         return previousExpr(pathStack, nodeStack, stackIndex);
      }   
      
      /**
       * Expression for the empty string. As the jsonPath parser generates the path parser, it will eventually
       * run out of tokens and get to the empty string. So, all generated parsers will be wrapped in this function.
       * 
       * Initialises the stackIndex and kicks off the other expressions.   
       * 
       * @returns {Object|false} either the object that was found, or false if nothing was found         
       */   
      function statementExpr(startingExpr, _neverCaptures, _nameless, pathStack, nodeStack){
      
         // kick off the parsing by passing through to the first expression with the stackIndex set to the
         // top of the stack:
         var exprMatch = startingExpr(pathStack, nodeStack, pathStack.length-1);
                               
         // Returning exactly true indicates that there has been a match but no node is captured. 
         // By default, the node at the top of the stack gets returned. Just like in css4 selector 
         // spec, if there is no $, the last node in the selector is the one being styled.                      
                         
         return exprMatch === true ? lastOf(nodeStack) : exprMatch;
      }      
                 
      /** extraction of some common logic used by expression when they have matched.
       *  If is a capturing node, will return it's item on the nodestack. Otherwise, will return the item
       *  from the nodestack given by the previous expression, or true if none
       */
      function returnValueForMatch(capturing, previousExprEvaluation, nodeStack, stackIndex) {
         return capturing? nodeStack[stackIndex+1] : (previousExprEvaluation || true);
      }
           
      /**
       * Each of the sub-arrays has at index 0 a pattern matching the token.
       * At index 1 is the expression function to return a function to parse that expression
       */
      function tokenExpr(pattern, expr) {
         return {pattern:pattern, expr:expr};
      }     
      
      var nameInObjectNotation    = /^(\$?)(\w+)/       
      ,   numberInArrayNotation   = /^(\$?)\[(\d+)\]/
      ,   nameInArrayNotation     = /^(\$?)\["(\w+)"\]/
      ,   doubleDot               = /^\.\./
      ,   bang                    = /^(\$?)!/
      ,   starInObjectNotation    = /^(\$?)\*/
      ,   starInArrayNotation     = /^(\$?)\[\*\]/
      ,   dot                     = /^\./
      ,   emptyString             = /^$/;
      
      // a mapping of token regular expressions to the functions which evalate conformance to the jsonPath 
      // language feature represented by that token:      
      return [
         tokenExpr(nameInObjectNotation   , namedNodeExpr),
         tokenExpr(numberInArrayNotation  , namedNodeExpr),
         tokenExpr(nameInArrayNotation    , namedNodeExpr),
         tokenExpr(starInObjectNotation   , unnamedNodeExpr),
         tokenExpr(starInArrayNotation    , unnamedNodeExpr),         
         tokenExpr(doubleDot              , multipleUnnamedNodesExpr),
         tokenExpr(dot                    , passthroughExpr),         
         tokenExpr(bang                   , rootExpr),             
         tokenExpr(emptyString            , statementExpr)
      ];
   })(); // end of tokenExprs definition
   
     
   /** 
    * Recursively compile a jsonPath into a function.
    * Each recursive call wraps the parser generated by its inner calls.
    * We parse the jsonPath spec from left to right, generating a parser which parses the found paths from 
    * right to left (or, deepest to shallowest path names).
    */
   function compileJsonPathToFunction( jsonPath, compiledSoFar ) {
                
      for (var i = 0; i < tokenExprs.length; i++) {
         var tokenMatch = tokenExprs[i].pattern.exec(jsonPath);
             
         if(tokenMatch) {
            var capturing = !!tokenMatch[1],
                name = tokenMatch[2],
                
                // partially complete the expression with the previous expr, the capturing flag and the name
                // (some exprs ignore some of these params)  
                parser = tokenExprs[i].expr.bind(null, compiledSoFar, capturing, name);
                
            // Recurse to parse the rest of the jsonPath expression, unless there is none:
            return jsonPath? compileJsonPathToFunction(jsonPath.substr(tokenMatch[0].length), parser) : parser;
         }
      }
      
      // couldn't find any match, jsonPath is probably invalid:
      throw Error('"' + jsonPath + '" could not be tokenised');      
   }

   /**
    * A function that, given a jsonPath string, returns a function that tests against that
    * jsonPath.
    * 
    *    String jsonPath -> (String[] pathStack, Object[] nodeStack) -> Boolean|Object
    *    
    * The returned function returns false if there was no match, the node which was captured (using $)
    * if any expressions in the jsonPath are capturing, or true if there is a match but no capture.
    */
   return function (jsonPath) {        
      try {
         // Kick off the recursive parsing of the jsonPath with a function which always returns true.
         // This means that jsonPaths which don't start with the root specifier ('!') can match at any depth
         // in the tree. So long as they match the part specified, they don't care what the ancestors of the
         // matched part are.         
         return compileJsonPathToFunction(jsonPath, function(){return true});
      } catch( e ) {
         throw Error('Could not compile "' + jsonPath + '" because ' + e);
      }
   };
   
})();
