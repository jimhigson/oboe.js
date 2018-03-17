import {
  HTTP_START,
  STREAM_DATA,
  STREAM_END,
  SAX_KEY,
  SAX_VALUE_OPEN,
  SAX_VALUE_CLOSE,
  FAIL_EVENT
} from '../../src/events'

function prettyPrintEvent (event) {
  switch (event) {
    case HTTP_START: return 'start'
    case STREAM_DATA: return 'data'
    case STREAM_END: return 'end'
    case SAX_KEY: return 'sax_key'
    case SAX_VALUE_OPEN: return 'sax_open'
    case SAX_VALUE_CLOSE: return 'sax_close'
    case FAIL_EVENT: return 'fail'
    default: return 'unknown(' + event + ')'
  }
}

export { prettyPrintEvent }
