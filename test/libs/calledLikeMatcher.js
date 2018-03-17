var calledLikeMatcher = {
  /* Under Jasmine's toHaveBeenCalledLike, subject(foo, undefined)
     is considered different from subject(foo). This is slightly
     looser and considers those equal.
   */
  toHaveBeenCalledLike: function (util) {
    return {
      compare: function (/* expectedArgs */) {
        var expectedArgs = Array.prototype.slice.apply(arguments)
        var actual = expectedArgs.shift()
        var actualCalls = actual.calls.all()
        var message

        if (!actualCalls || actualCalls.length === 0) {
          message = 'Expected spy ' + actual.identity + ' to have been called like ' + jasmine.pp(expectedArgs) + ' but it has never been called.'
          return false
        }

        message = 'Expected spy ' + actual.identity + ' to have been called like ' + jasmine.pp(expectedArgs) + ' but it was never called.'

        var pass = actualCalls.some(function (actualCall) {
          var actualArgs = actualCall.args

          // check for one too many arguments given. But this is ok
          // if the extra arg is undefined.
          if (actualArgs[expectedArgs.length] !== undefined) {
            message = 'Expected spy ' + actual.identity + ' to have been called like ' + jasmine.pp(expectedArgs) + ' but actual calls were ' + jasmine.pp(actualArgs).replace(/^\[ | \]$/g, '')
            return false
          }

          return expectedArgs.every(function (expectedArg, index) {
            if (!util.equals(actualArgs[index], expectedArg)) {
              message = 'Expected spy ' + actual.identity + ' to have been called like ' + jasmine.pp(expectedArgs) + ' but actual calls were ' + jasmine.pp(actualArgs).replace(/^\[ | \]$/g, '')
              return false
            }
            return true
          })
        })

        return { pass: pass, message: message }
      }
    }
  }
}

export { calledLikeMatcher }
