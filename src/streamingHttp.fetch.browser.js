import { STREAM_DATA, FAIL_EVENT, STREAM_END, HTTP_START, ABORTING, errorReport } from './events'
import { isCrossOrigin, parseUrlOrigin } from './detectCrossOrigin.browser'

function fetchTransport () {
  return fetch
}

/**
 * A wrapper around the browser XmlHttpRequest object that raises an
 * event whenever a new part of the response is available.
 *
 * In older browsers progressive reading is impossible so all the
 * content is given in a single call. For newer ones several events
 * should be raised, allowing progressive interpretation of the response.
 *
 * @param {Function} oboeBus an event bus local to this Oboe instance
 * @param {Function} fetch the browser fetch api to use as the transport. Under normal
 *          operation, will have been created using httpTransport() above
 *          but for tests a stub can be provided instead.
 * @param {String} method one of 'GET' 'POST' 'PUT' 'PATCH' 'DELETE'
 * @param {String} url the url to make a request to
 * @param {String|Null} data some content to be sent with the request.
 *                      Only valid if method is POST or PUT.
 * @param {Object} [headers] the http request headers to send
 * @param {boolean} withCredentials the XHR withCredentials property will be
 *    set to this value
 */
function streamingFetch (oboeBus, fetch, method, url, data, headers, withCredentials) {
  'use strict'

  var decoder = new TextDecoder()

  var featchHeaders = headers ? new Headers(headers) : new Headers()

  if (!isCrossOrigin(window.location, parseUrlOrigin(url))) {
    featchHeaders.append('X-Requested-With', 'XMLHttpRequest')
  }

  fetch(url, {
    method: method,
    body: data,
    headers: featchHeaders,
    credentials: withCredentials ? 'include' : 'same-origin'
  }).then(function (response) {
    var responseHeaders = getHeaders({}, response.headers, response.headers.keys())

    oboeBus(HTTP_START).emit(
      response.status,
      responseHeaders
    )

    var reader = response.body.getReader()

    oboeBus(ABORTING).on(function () {
      reader.cancel()
    })

    if (response.ok) {
      stream(oboeBus, reader, decoder)
    } else {
      oboeBus(FAIL_EVENT).emit(errorReport(
        response.status,
        response.statusText
      ))
    }
  }).catch(function (error) {
    oboeBus(FAIL_EVENT).emit(errorReport(
      undefined,
      error
    ))
  })
}

function getHeaders (memo, headers, keys) {
  var key = keys.next()
  if (key.done) {
    return memo
  } else {
    memo[key.value] = headers.get(key.value)
    return getHeaders(memo, headers, keys)
  }
}

function stream (oboeBus, reader, decoder) {
  reader.read().then(function (result) {
    var chunk = decoder.decode(result.value || new Uint8Array(), {
      stream: !result.done
    })

    oboeBus(STREAM_DATA).emit(chunk)

    if (result.done) {
      oboeBus(STREAM_END).emit()
    } else {
      stream(oboeBus, reader, decoder)
    }
  })
}

function isFetchAvailable () {
  return !!window.fetch
}

export { fetchTransport, streamingFetch, isFetchAvailable }
