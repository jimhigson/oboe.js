import { fetchTransport, isFetchAvailable, streamingFetch } from './streamingHttp.fetch.browser'
import { xhrTransport, streamingXhr } from './streamingHttp.xhr.browser'

function httpTransport () {
  if (isFetchAvailable()) {
    return fetchTransport()
  }

  return xhrTransport()
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
 * @param {XMLHttpRequest} xhr the xhr to use as the transport. Under normal
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
var streamingHttp = isFetchAvailable() ? streamingFetch : streamingXhr

export { httpTransport, streamingHttp }
