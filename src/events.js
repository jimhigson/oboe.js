/**
 * This file declares some constants to use as names for event types.
 */

var // the events which are never exported are kept as 
    // the smallest possible representation, in numbers:
    _S = 1,

    // fired whenever a new node starts in the JSON stream:
    NODE_OPENED     = _S++,

    // fired whenever a node closes in the JSON stream:
    NODE_CLOSED     = _S++,
                
    FAIL_EVENT      = 'fail',
   
    ROOT_NODE_FOUND = _S++,
    ROOT_PATH_FOUND = _S++,
   
    HTTP_START      = 'start',
    STREAM_DATA     = 'data',
    STREAM_END      = 'end',
    ABORTING        = 'aborting',

    // SAX events butchered from Clarinet
    SAX_VALUE        = 'SAX_VALUE',
    SAX_KEY          = 'SAX_KEY',
    SAX_OPEN_OBJECT  = 'SAX_OPEN_OBJECT',
    SAX_CLOSE_OBJECT = 'SAX_CLOSE_OBJECT',
    SAX_OPEN_ARRAY   = 'SAX_OPEN_ARRAY',
    SAX_CLOSE_ARRAY  = 'SAX_CLOSE_ARRAY';


