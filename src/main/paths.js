
var paths = (function (paths) {

   function namedNodeExpr(previousExpr, name) {
      return function( pathArray, pathArrayIndex ){
         return pathArray[pathArrayIndex] == name && previousExpr(pathArray, pathArrayIndex-1);         
      }
   }
   
   function anyNodeExpr(previousExpr){
      return function( pathArray, pathArrayIndex ){
      
         return previousExpr(pathArray, pathArrayIndex-1);
      }
   }
   
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
   
   function passthrough(previousExpr) {
      return previousExpr;   
   }   
   
   function rootExpr() {
      return function( pathArray, pathArrayIndex ){
         return pathArrayIndex == -1;
      }   
   }
     
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

   function compileJsonPath(jsonPath, previousParser) {
        

         // terminal case for the recursion:
         if( jsonPath.length == 0 ) {
            return previousParser;
         }        
           
         for (var i = 0; i < tokenExprs.length; i++) {
            var tokenExpr = tokenExprs[i],
                match = tokenExpr[0].exec(jsonPath),
                tokenParserFunction =  tokenExpr[1];
      
            if(match) {
               var remainingString = jsonPath.substr(match[0].length),
                   parser = tokenParserFunction(previousParser, match[1]);
            
               return compileJsonPath(remainingString, parser);
            }
         }
         throw new Error('got stuck at "' + jsonPath + '"');      

        

   }
   
   return {
      compile: function( jsonPath ){
   
         try {
            var compiled = compileJsonPath(jsonPath, function(){return true;});
         } catch( e ) {
            throw new Error('Could not compile ' + jsonPath + e);
         } 
   
         return {
            test: function(path){
               return compiled(path, path.length-1);
            }         
         };      
      }
   };
   
})( typeof exports === "undefined" ? {} : exports );
