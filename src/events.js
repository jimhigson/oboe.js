/**
 * This file declares some constants to use as names for event types.
 */

// the events which are never exported are kept as
// the smallest possible representation, in numbers:
var _S = 1

// fired whenever a new node starts in the JSON stream:
var NODE_OPENED = _S++

// fired whenever a node closes in the JSON stream:
var NODE_CLOSED = _S++

// called if a .node callback returns a value -
var NODE_SWAP = _S++
var NODE_DROP = _S++

var FAIL_EVENT = 'fail'

var ROOT_NODE_FOUND = _S++
var ROOT_PATH_FOUND = _S++

var HTTP_START = 'start'
var STREAM_DATA = 'data'
var STREAM_END = 'end'
var ABORTING = _S++

// SAX events butchered from Clarinet
var SAX_KEY = _S++
var SAX_VALUE_OPEN = _S++
var SAX_VALUE_CLOSE = _S++

function errorReport (statusCode, body, error) {
  try {
    var jsonBody = JSON.parse(body)
  } catch (e) { }

  return {
    statusCode: statusCode,
    body: body,
    jsonBody: jsonBody,
    thrown: error
  }
}

export {
  NODE_OPENED,
  NODE_CLOSED,
  NODE_SWAP,
  NODE_DROP,
  FAIL_EVENT,
  ROOT_NODE_FOUND,
  ROOT_PATH_FOUND,

  HTTP_START,
  STREAM_DATA,
  STREAM_END,
  ABORTING,

  SAX_KEY,
  SAX_VALUE_OPEN,
  SAX_VALUE_CLOSE,

  errorReport
}
