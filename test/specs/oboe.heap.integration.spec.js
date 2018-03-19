(function (Platform) {
  describe('oboe integration (real http)', function () {
    var ASYNC_TEST_TIMEOUT = 15 * 1000 // 15 seconds
    jasmine.DEFAULT_TIMEOUT_INTERVAL = ASYNC_TEST_TIMEOUT

    var oboe = window.oboe
    var testUrl = window.testUrl

    if (Platform.isChrome) {
      describe('heap tests', function () {
        it('should not grow memory by more than expected', function (done) {
          var startHeap = window.performance.memory.usedJSHeapSize

          var nodes = []
          oboe({
            url: testUrl('largeResponse?limit=10000')
          })
            .node('!.*', function (node) {
              nodes.push(node)
              return oboe.drop
            })
            .fail(function (error) {
              console.error(error.thrown)
              done(error.thrown)
            })
            .done(function (fullResponse) {
              expect(fullResponse.length).toBe(10000)
              var endHeap = window.performance.memory.usedJSHeapSize
              console.log('Start Heap: ', startHeap)
              console.log('End Heap: ', endHeap)
              // when this fails this is by a factor in the hundreds
              expect(((endHeap - startHeap) / startHeap)).toBeLessThan(15)
              done()
            })
        }, 30000)
      })
    }
  })
})(typeof Platform === 'undefined' ? require('../libs/platform.js') : Platform)
