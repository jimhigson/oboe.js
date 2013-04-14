
var jsonPathCompiler = (function () {

   /**
    * Expression for a named path node
    */
   function namedNodeExpr(previousExpr, name) {
      return function( pathArray, pathArrayIndex ){
         return pathArray[pathArrayIndex] == name && previousExpr(pathArray, pathArrayIndex-1);         
      }
   }

   /**
    * Expression for *, [*] etc
    */
   function anyNodeExpr(previousExpr){
      return function( pathArray, pathArrayIndex ){
      
         return previousExpr(pathArray, pathArrayIndex-1);
      }
   }
   
   /**
    * Expression for ..
    */   
   function multipleUnnamedNodesExpr(previousExpr){
      return function multiple( pathArray, pathArrayIndex ){
      
         // past the start, not a match:
         if( pathArrayIndex < -1 ) {
            return false;
         }
      
         return pathArrayIndex == -1 || // -1 is sometimes the root 
                previousExpr(pathArray, pathArrayIndex) || 
                multiple(pathArray, pathArrayIndex-1);         
      }   
   }
   
   /**
    * Expression for . does nothing since . has no meaning, just passes through to the
    * next in the chain
    */   
   function passthrough(previousExpr) {
      return previousExpr;   
   }   
   
   /**
    * Expression for $ - matches only the root element of the json
    */   
   function rootExpr() {
      return function( pathArray, pathArrayIndex ){
         return pathArrayIndex == -1;
      }   
   }

   /**
    * Wrapper for an expression that makes up a statement.
    * Returns a function that acts as the kick-off point for evaluating the expression
    */   
   function statement(lastStatementExpr) {
      return function(pathArray){
         return lastStatementExpr(pathArray, pathArray.length-1);
      }
   }

   /**
    * Each of the sub-arrays has at index 0 a pattern matching the token.
    * At index 1 is the expression function to return a function to parse that expression
    */     
   var tokenExprs = [
      [/^(\w+)/       , namedNodeExpr],
      [/^\[(\d+)\]/   , namedNodeExpr],
      [/^\["(\w+)"\]/ , namedNodeExpr],
      [/^\.\./        , multipleUnnamedNodesExpr],
      [/^\$/          , rootExpr],      
      [/^\*/          , anyNodeExpr],
      [/^\[\*\]/      , anyNodeExpr],      
      [/^\./          , passthrough]
   ];

   /** 
    * compile the next part of a jsonPath
    */
   function compileNextToken( jsonPath, previousParser ) {
      // terminal case for the recursion:
      if( jsonPath.length == 0 ) {
         return previousParser;
      }        
        
      for (var i = 0; i < tokenExprs.length; i++) {
         var tokenExpr = tokenExprs[i],
             match = tokenExpr[0].exec(jsonPath),
             tokenExprParser = tokenExpr[1];
   
         if(match) {
            var remainingString = jsonPath.substr(match[0].length),
                parser = tokenExprParser(previousParser, match[1]);
         
            return compileNextToken(remainingString, parser);
         }
      }
      throw Error('got stuck at "' + jsonPath + '"');      
   }

   /**
    * A function that, given a jsonPath string, returns a function that tests against that
    * jsonPath.
    */
   return function compileJsonPath(jsonPath) {
        
      try {        
         return statement(compileNextToken(jsonPath, function(){return true}));
      } catch( e ) {
         throw Error('Could not compile ' + jsonPath + ' because ' + e);
      }
   };
   
})();
