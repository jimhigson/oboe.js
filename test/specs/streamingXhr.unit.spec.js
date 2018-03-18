import { pubSub } from '../../src/pubSub'
import { streamingHttp } from '../../src/streamingHttp.browser'
import { ABORTING } from '../../src/events'

describe('streamingHttp', function () {
  'use strict'

  var eventBus
  var xhr

  function xhrStub () {
    return jasmine.createSpyObj('xhr', ['abort', 'open', 'setRequestHeader', 'send'])
  }

  beforeEach(function () {
    eventBus = pubSub()
    xhr = xhrStub()
  })

  describe('calls through to browser xhr', function () {
    it('gives xhr null when body is null', function () {
      streamingHttp(eventBus, xhr, 'GET', 'http://example.com', null)

      expect(xhr.send).toHaveBeenCalledWith(null)
    })

    it('give xhr string request body', function () {
      streamingHttp(eventBus, xhr, 'GET', 'http://example.com', 'my_data')

      expect(xhr.send).toHaveBeenCalledWith('my_data')
    })

    it('gives xhr the request headers', function () {
      var headers = {
        'X-FROODINESS': 'frood',
        'X-HOOPINESS': 'hoopy'
      }

      streamingHttp(eventBus, xhr, 'GET', 'http://example.com', undefined, headers)

      expect(xhr.setRequestHeader).toHaveBeenCalledWith('X-FROODINESS', 'frood')
      expect(xhr.setRequestHeader).toHaveBeenCalledWith('X-HOOPINESS', 'hoopy')
    })

    it('should be able to abort an xhr once started', function () {
      streamingHttp(eventBus, xhr, 'GET', 'http://example.com', 'my_data')

      eventBus(ABORTING).emit()

      expect(xhr.abort).toHaveBeenCalled()
    })
  })
})
