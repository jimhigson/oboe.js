
var jsonPathCompiler = (function () {

   /** 
    * tokenExprs is an array of pairs. Each pair contains a regular expression for matching a 
    * jsonpath language feature and a function for parsing that feature.
    */
   var tokenExprs = (function(){
      /**
       * Expression for a named path node
       * 
       * @returns {Object|False} either the object that was found, or false if nothing was found
       */
      function namedNodeExpr(previousExpr, name, pathStack, nodeStack, stackIndex ) {
         return pathStack[stackIndex] == name && previousExpr(pathStack, nodeStack, stackIndex-1);         
      }
   
      /**
       * Expression for *, [*] etc
       * 
       * @returns {Object|False} either the object that was found, or false if nothing was found         
       */
      function anyNodeExpr(previousExpr, ignoredSubexpression, pathStack, nodeStack, stackIndex ){      
         return previousExpr(pathStack, nodeStack, stackIndex-1);
      }
      
      /**
       * Expression for .. (double dot) token              
       * 
       * @returns {Object|False} either the object that was found, or false if nothing was found         
       */   
      function multipleUnnamedNodesExpr(previousExpr, ignoredSubexpression, pathStack, nodeStack, stackIndex ) {
         
         // past the start, not a match:
         if( stackIndex < -1 ) {
            return false;
         }
      
         return stackIndex == -1 || // -1 is sometimes the root 
                previousExpr(pathStack, stackIndex) || 
                multipleUnnamedNodesExpr(previousExpr, ignoredSubexpression, pathStack, nodeStack, stackIndex-1);         
      }      
      
      /**
       * Expression for $ - matches only the root element of the json
       * 
       * @returns {Object|False} either the object that was found, or false if nothing was found         
       */   
      function rootExpr(ignoredPreviousExprs, ignoredSubexpression, pathStack, nodeStack, stackIndex ){
         return stackIndex == -1;
      }   
      
      /**
       * Expression for . does no tests since . is just a seperator. Just passes through to the
       * next function in the chain.
       * 
       * @returns {Object|False} either the object that was found, or false if nothing was found         
       */   
      function passthroughExpr(previousExpr, ignoredSubexpression, pathStack, nodeStack, stackIndex) {
         return previousExpr(pathStack, nodeStack, stackIndex);
      }   
           
      /**
       * Each of the sub-arrays has at index 0 a pattern matching the token.
       * At index 1 is the expression function to return a function to parse that expression
       */
      function tokenExpr(pattern, parser) {
         return {pattern:pattern, parser:parser};
      }     
      
      return [
         tokenExpr(/^(\$?)(\w+)/        , namedNodeExpr),
         tokenExpr(/^\[(\$?)(\d+)\]/    , namedNodeExpr),
         tokenExpr(/^\[(\$?)"(\w+)"\]/  , namedNodeExpr),
         tokenExpr(/^\.\./              , multipleUnnamedNodesExpr),
         tokenExpr(/^(\$?)!/            , rootExpr),      
         tokenExpr(/^(\$?)\*/           , anyNodeExpr),
         tokenExpr(/^\[(\$?)\*\]/       , anyNodeExpr),      
         tokenExpr(/^\./                , passthroughExpr)
      ];
   })(); // end of tokenExprs definition
   
   
   /**
    * Given a parser for a token, parse the statement ending in that token against a pathStack
    * 
    * @returns {Object|False} either the object that was found, or false if nothing was found         
    */   
   function statement(lastStatementExpr, pathStack, nodeStack){
      return lastStatementExpr(pathStack, nodeStack, pathStack.length-1);
   }   

   /** 
    * compile the next part of a jsonPath
    */
   function compileNextToken( jsonPath, compiledSoFar ) {
                
      for (var i = 0; i < tokenExprs.length; i++) {
         var tokenMatch = tokenExprs[i].pattern.exec(jsonPath);
             
         if(tokenMatch) {
            var parser = tokenExprs[i].parser.bind(null, compiledSoFar, tokenMatch[2]),
                remainingString = jsonPath.substr(tokenMatch[0].length);
         
            return remainingString? compileNextToken(remainingString, parser) : parser;
         }
      }
      
      // couldn't find any match, jsonPath is probably invalid:
      throw Error('got stuck at "' + jsonPath + '"');      
   }

   /**
    * A function that, given a jsonPath string, returns a function that tests against that
    * jsonPath.
    * 
    *    String -> (String[] -> Boolean)
    */
   return function (jsonPath) {        
      try {        
         return statement.bind(null, compileNextToken(jsonPath, function(){return true}));
      } catch( e ) {
         throw Error('Could not compile "' + jsonPath + '" because ' + e);
      }
   };
   
})();
