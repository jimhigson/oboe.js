
// The regular expressions all start with ^ because we only want to find matches at the start of the jsonPath
// spec that we are given. As we parse, substrings are taken so the string is consumed from left to right, 
// allowing new token regexes to match.
//    For all regular expressions:
//       The first subexpression is the $ (if the token is eligible to capture)
//       The second subexpression is the name of the expected path node (if the token may have a name)

var regexSource = partialComplete(pluck, 'source');

function r(componentRegexes) {

   return RegExp( componentRegexes.map(regexSource).join('') );
}

function jsonPathClause() {
   
   var strings = toArray(arguments);
   
   strings.unshift(/^/);
   
   return r(strings);
}

function unquotedArrayNotation(contents) {
   return r([/\[/, contents, /\]/]);
}

var possiblyCapturing =           /(\$?)/
,   namedNode =                   /(\w+)/
,   namedNodeInArrayNotation =    /\["(\w+)"\]/
,   numberedNodeInArrayNotation = unquotedArrayNotation( /(\d+)/ )
,   anyNodeInArrayNotation =      unquotedArrayNotation( /\*/ )
;    
               
var jsonPathNamedNodeInObjectNotation     = jsonPathClause(possiblyCapturing, namedNode)
//                                           /^(\$?)(\w+)/             //   foo

,   jsonPathNamedNodeInArrayNotation      = jsonPathClause(possiblyCapturing, namedNodeInArrayNotation)
//                                           /^(\$?)\["(\w+)"\]/       //   ["foo"]
    
,   jsonPathNumberedNodeInArrayNotation   = jsonPathClause(possiblyCapturing, numberedNodeInArrayNotation)
//                                           /^(\$?)\[(\d+)\]/         //   [2]

,   jsonPathStarInObjectNotation          = jsonPathClause(possiblyCapturing, /\*/)
//                                           /^(\$?)\*/                //   *

,   jsonPathStarInArrayNotation           = jsonPathClause(possiblyCapturing, anyNodeInArrayNotation)
//                                           /^(\$?)\[\*\]/            //   [*]

,   jsonPathDoubleDot                     = jsonPathClause(/\.\./)
//                                           /^\.\./                   //   ..

,   jsonPathDot                           = jsonPathClause(/\./)
//                                           /^\./                     //   .

,   jsonPathBang                          = jsonPathClause(possiblyCapturing, /!/)
//                                           /^(\$?)!/                 //   !

,   emptyString                           = jsonPathClause(/$/)
//                                           /^$/                      //   nada!
;  