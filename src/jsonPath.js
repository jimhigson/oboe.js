/**
 * One function is exposed. This function takes a jsonPath spec (as a string) and returns a function to test candidate
 * paths for matches. The candidate paths are arrays of strings representing the path from the root of the parsed json to
 * some node in the json.
 * 
 * Naming convention (like erlang) is to start unused variables with an underscore, to avoid confusion with accidental non-use.
 * This is usually where several functions need to keep the same signature but not all use all of the parameters.
 * 
 * This file is coded in a pure functional style. That is, no function has side effects, every function evaluates to the
 * same value for the same arguments and no variables are reassigned. There is also quite a heavy use of partial completion
 * unfortunately Javascript doesn't have currying so this is done via Function.bind() with null as the scope.
 * 
 */
var jsonPathCompiler = (function () {
   
   /**
    * Expression for:
    *    *
    *    [*]
    *    
    * Normally, this would be compiled into a jsonPath parser by partially completing
    *    previousExpr, capturing, name to give a function which takes just the particularities
    *    of the path being evaluated: pathStack, nodeStack, stackIndex. 
    *    
    *    All other fooExpr functions follow this same signature. My means of partial completion, we end up with a parser
    *    in which each function has a reference to the previous one. Once a function is happy that its part of the jsonPath
    *    matches, it delegates the remaining matching to the next function in the chain.
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
             multipleUnnamedNodesExpr(previousExpr, null, null, pathStack, nodeStack, stackIndex-1);         
   }      
   
   /**
    * Expression for $ - matches only the root element of the json
    * 
    * @returns {Object|false} either the object that was found, or false if nothing was found         
    */   
   function rootExpr(_cantHaveExprsBeforeRoot, capturing, _nameless, _pathStack, nodeStack, stackIndex ){
      return stackIndex == -1 && returnValueForMatch(capturing, true, nodeStack, stackIndex);
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

   /** If jsonPath matches the given regular expression pattern, return a partially completed version of expr
    *  which is ready to be used as a jsonPath parser. 
    *  
    *  This function is designed to be partially completed with the pattern and expr, leaving a function
    *  which can be stored in the tokenExprs array. tokenExpr(pattern, expr) is a shorthand for this
    *  partial completion.
    *  
    *  Returns undefined on no match
    *  
    * @param {RegExp} pattern
    * @param {Function} parserGenerator a function which knows how to generate a parser. Either a partial completion of
    *    exprParserGenerator with the expr given, or passthroughParserGenerator.
    * @param {String} jsonPath
    * @param {Function} parserGeneratedSoFar
    * 
    * @param {Function(Function, String)} onSuccess a function to pass the generated parser to if one can be made,
    *    also passes the remaining string from jsonPath that is still to parse
    * 
    * @return {*|undefined}
    */
   function generateTokenParserIfJsonPathMatchesPattern(pattern, parserGenerator, jsonPath, parserGeneratedSoFar, onSuccess) {
      var tokenMatch = pattern.exec(jsonPath);

      if(tokenMatch) {
         var compiledParser = parserGenerator(parserGeneratedSoFar, tokenMatch),
             remaining = jsonPath.substr(tokenMatch[0].length);                
                               
         return onSuccess(remaining, compiledParser);
      }         
   }
   

   /**
    * For when a token match has been found. Compiles the parser for that token.
    * 
    * When partially completed with an expression function, can be used as the parserGenerator
    * argument to compileTokenToParserIfMatches. The other possible value is passthroughParserGenerator.
    * 
    * @param {Function} expr the expression that parses this token 
    * @param {Function} parserGeneratedSoFar the parser already found
    * @param {Array} tokenMatch the match given by the regex engine when the token was found
    */
   function exprParserGenerator( expr, parserGeneratedSoFar, tokenMatch ) {
      var capturing = !!tokenMatch[1],
          name = tokenMatch[2];      
         
      return partialComplete( expr, parserGeneratedSoFar, capturing, name);      
   }

   /**
    * Similar to exprParserGenerator but does not compile any new parser. Simply returns the parser so far.
    * This is useful for generating the parser when matching the '.' (dot) token. This token is a separator and 
    * because the generated jsonPath parser receives already separated input, there is nothing to do. 
    *  
    * @param {Function} parserGeneratedSoFar
    * @param {Array} _tokenMatch the found regular expression when this token was matched. Since we are not
    *    going to be using any expression function, this is ignored.
    */
   function passthroughParserGenerator(parserGeneratedSoFar, _tokenMatch) {
      return parserGeneratedSoFar;
   }   
              
   /**
    * Generate a function which parses the pattern in the given regex. If matches, returns a parser
    * generated from that token that processes the given expr, otherwise returns null.
    * 
    * @returns {Function(Function parserGeneratedSoFar, Function onSucess)}
    */
   function tokenMatcher(pattern, expr) {
   
      // most tokens generate their parser using exprParserGenerator, but if no expr is given, use 
      // passthroughParserGenerator instead
      var parserGenerator = expr? partialComplete( exprParserGenerator, expr) : passthroughParserGenerator;
       
      return partialComplete( generateTokenParserIfJsonPathMatchesPattern, pattern, parserGenerator );
   }
              
   // The regular expressions all start with ^ because we only want to find matches at the start of the jsonPath
   // spec that we are given. As we parse, substrings are taken so the string is consumed from left to right, allowing
   // new token regexes to match.
   //    For all regular expressions:
   //       The first subexpression is the $ (if the token is eligible to capture)
   //       The second subexpression is the name of the expected path node (if the token may have a name)               
   var nameInObjectNotation    = /^(\$?)(\w+)/    
   ,   nameInArrayNotation     = /^(\$?)\["(\w+)"\]/         
   ,   numberInArrayNotation   = /^(\$?)\[(\d+)\]/
   ,   starInObjectNotation    = /^(\$?)\*/
   ,   starInArrayNotation     = /^(\$?)\[\*\]/      
   ,   doubleDot               = /^\.\./
   ,   dot                     = /^\./      
   ,   bang                    = /^(\$?)!/
   ,   emptyString             = /^$/;
     
   // A list of functions which test if a string matches the required patter and, if it does, returns
   // a generated parser for that expression     
   var tokenMatchers = [
       tokenMatcher(nameInObjectNotation   , namedNodeExpr)
   ,   tokenMatcher(nameInArrayNotation    , namedNodeExpr)         
   ,   tokenMatcher(numberInArrayNotation  , namedNodeExpr)
   ,   tokenMatcher(starInObjectNotation   , unnamedNodeExpr)
   ,   tokenMatcher(starInArrayNotation    , unnamedNodeExpr)         
   ,   tokenMatcher(doubleDot              , multipleUnnamedNodesExpr)
   ,   tokenMatcher(dot)                     // dot is just a separator so no expression given, it will not appear 
                                             // in the generated parser    
   ,   tokenMatcher(bang                   , rootExpr)             
   ,   tokenMatcher(emptyString            , statementExpr)
   ];


   /**
    * This value is one possible value for the onSuccess argument of compileTokenToParserIfMatches.
    * When this function is passed, compileTokenToParserIfMatches simply returns the compiledParser that it
    * made, regardless of if there is any remaining jsonPath to be compiled.
    * 
    * The other possible value is compileJsonPathToFunction, which causes it to recursively compile
    * the rest of the string.
    * 
    * @param {String} _remainingJsonPath since this function never recurs, anything left over is ignored.
    * @param {Function} compiledParser
    */
   function returnFoundParser(_remainingJsonPath, compiledParser){ 
      return compiledParser 
   }     
              
   /** 
    * Recursively compile a jsonPath into a function.
    * Each recursive call wraps the parser generated by its inner calls.
    * We parse the jsonPath spec from left to right, generating a parser which parses the found paths from 
    * right to left (or, deepest to shallowest path names).
    * 
    *    (String jsonPath, ((String[], Object[]) -> (Object|Boolean))) -> ((String[], Object[]) -> (Object|Boolean))
    *    
    * or, if we consider Expr = ((String[], Object[]) -> (Object|Boolean)) it can be expressed more simply as:
    * 
    *    (String jsonPath, Expr) -> Expr
    *    
    * In practice, an Expr is any of the functions from tokenExprs[*].expr after being partially completed by 
    * filling in the first three arguments
    * 
    * Note that this function's signature matches the onSuccess callback to compileTokenIfMatches, meaning that
    * compileTokenIfMatches is able to make our recursive call back to here for us.
    */
   function compileJsonPathToFunction( jsonPath, parserGeneratedSoFar ) {

      /**
       * Called when a matching token is found. 
       * 
       * @param {Function} parser the parser that has just been compiled
       * @param {String} remaining the remaining jsonPath that has not been compiled yet
       * 
       * On finding a match, we want to either continue parsing using a recursive call to compileJsonPathToFunction
       * or we want to stop and just return the parser that we've found so far.
       * 
       * We use the jsonPath rather than the remaining to branch on here because it is
       * valid to recur onto an empty string (there's a tokenExpr for that) but it is not
       * valid to recur past that point. 
       */
      var onFind = jsonPath? compileJsonPathToFunction : returnFoundParser;
             
      // to be called by firstMatching if no match could be found. Report the input
      // that could not be tokenized and leave to handlers up-stack to work out what to do.
      function onFail() {
         throw Error('"' + jsonPath + '" could not be tokenised')      
      }
      
      return firstMatching( tokenMatchers, [jsonPath, parserGeneratedSoFar, onFind], onFail );                              
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
         throw Error('Could not compile "' + jsonPath + '" because ' + e.message);
      }
   };
   
})();
