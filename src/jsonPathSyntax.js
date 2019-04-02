import { varArgs, lazyUnion, attr } from './functional'

var jsonPathSyntax = (function () {
  /**
  * Export a regular expression as a simple function by exposing just
  * the Regex#exec. This allows regex tests to be used under the same
  * interface as differently implemented tests, or for a user of the
  * tests to not concern themselves with their implementation as regular
  * expressions.
  *
  * This could also be expressed point-free as:
  *   Function.prototype.bind.bind(RegExp.prototype.exec),
  *
  * But that's far too confusing! (and not even smaller once minified
  * and gzipped)
  */
  var regexDescriptor = function regexDescriptor (regex) {
    return regex.exec.bind(regex)
  }

  /**
  * Join several regular expressions and express as a function.
  * This allows the token patterns to reuse component regular expressions
  * instead of being expressed in full using huge and confusing regular
  * expressions.
  */
  var jsonPathClause = varArgs(function (componentRegexes) {
    // The regular expressions all start with ^ because we
    // only want to find matches at the start of the
    // JSONPath fragment we are inspecting
    componentRegexes.unshift(/^/)

    return regexDescriptor(
      RegExp(
        componentRegexes.map(attr('source')).join('')
      )
    )
  })

  var possiblyCapturing = /(\$?)/
  var namedNode = /([@|\w-_]+|\*)/
  var namePlaceholder = /()/
  var nodeInArrayNotation = /\["([^"]+)"\]/
  var numberedNodeInArrayNotation = /\[(\d+|\*)\]/
  var fieldList = /{([@|\w ]*?)}/
  var optionalFieldList = /(?:{([@|\w ]*?)})?/

  //   foo or *
  var jsonPathNamedNodeInObjectNotation = jsonPathClause(
    possiblyCapturing,
    namedNode,
    optionalFieldList
  )

  //   ["foo"]
  var jsonPathNamedNodeInArrayNotation = jsonPathClause(
    possiblyCapturing,
    nodeInArrayNotation,
    optionalFieldList
  )

  //   [2] or [*]
  var jsonPathNumberedNodeInArrayNotation = jsonPathClause(
    possiblyCapturing,
    numberedNodeInArrayNotation,
    optionalFieldList
  )

  //   {a b c}
  var jsonPathPureDuckTyping = jsonPathClause(
    possiblyCapturing,
    namePlaceholder,
    fieldList
  )

  //   ..
  var jsonPathDoubleDot = jsonPathClause(/\.\./)

  //   .
  var jsonPathDot = jsonPathClause(/\./)

  //   !
  var jsonPathBang = jsonPathClause(
    possiblyCapturing,
    /!/
  )

  //   nada!
  var emptyString = jsonPathClause(/$/)

  /* We export only a single function. When called, this function injects
      into another function the descriptors from above.
    */
  return function (fn) {
    return fn(
      lazyUnion(
        jsonPathNamedNodeInObjectNotation
        , jsonPathNamedNodeInArrayNotation
        , jsonPathNumberedNodeInArrayNotation
        , jsonPathPureDuckTyping
      )
      , jsonPathDoubleDot
      , jsonPathDot
      , jsonPathBang
      , emptyString
    )
  }
}())

export { jsonPathSyntax }
