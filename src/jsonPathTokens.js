
// The regular expressions all start with ^ because we only want to find matches at the start of the jsonPath
// spec that we are given. As we parse, substrings are taken so the string is consumed from left to right, 
// allowing new token regexes to match.
//    For all regular expressions:
//       The first subexpression is the $ (if the token is eligible to capture)
//       The second subexpression is the name of the expected path node (if the token may have a name)               
var jsonPathNamedNodeInObjectNotation     = /^(\$?)(\w+)/             //  foo
,   jsonPathNamedNodeInArrayNotation      = /^(\$?)\["(\w+)"\]/       //  ["foo"]    
,   jsonPathNumberedNodeInArrayNotation   = /^(\$?)\[(\d+)\]/         //  [2]
,   jsonPathStarInObjectNotation          = /^(\$?)\*/                //  [*]
,   jsonPathStarInArrayNotation           = /^(\$?)\[\*\]/            //  *
,   jsonPathDoubleDot                     = /^\.\./                   //  ..
,   jsonPathDot                           = /^\./                     //  .
,   jsonPathBang                          = /^(\$?)!/                 //  !
,   emptyString                           = /^$/                      // nada!
;  