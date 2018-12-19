(function (Platform) {
  function now () {
    return new Date().valueOf()
  }

  describe('oboe performance (real http)', function () {
    // Used to spy on global functions like setTimeout
    var oboe

    if (!Platform.isNode) {
      oboe = window.oboe
    } else {
      oboe = require('../../dist/oboe-node.js')
    }

    function url (path) {
      if (Platform.isNode) {
        return 'http://localhost:4567/' + path
      } else {
        return '/testServer/' + path
      }
    }

    it('is benchmarked with a complex jsonpath', function (done) {
      var callCount = 0
      var startTime = now()

      oboe(url('static/json/oneHundredRecords.json'))
        .node('!.$result..{age name company}', function () {
          callCount++
        })
        .done(function () {
          var timeDiff = now() - startTime
          expect(callCount).toBe(100)
          console.log('took ' + timeDiff + 'ms to evaluate a complex ' +
            'expression many times, finding 100 matches')
          done()
        })
    })

    it('is benchmarked with a simple jsonpath', function (done) {
      var callCount = 0
      var startTime = now()

      oboe(url('static/json/oneHundredRecords.json'))
        .node('name', function () {
          callCount++
        })
        .done(function () {
          var timeDiff = now() - startTime
          expect(callCount).toBe(100)
          console.log('took ' + timeDiff + 'ms to evaluate a complex ' +
            'expression many times, finding 100 matches')
          done()
        })
    })
  })
})(typeof Platform === 'undefined' ? require('../libs/platform.js') : Platform)
