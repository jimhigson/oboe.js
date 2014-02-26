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
    STREAM_DATA     = 'content',
    STREAM_END      = _S++,
    ABORTING        = _S++,

    // SAX events butchered from Clarinet
    SAX_VALUE        = _S++,
    SAX_KEY          = _S++,
    SAX_OPEN_OBJECT  = _S++,
    SAX_CLOSE_OBJECT = _S++,
    SAX_OPEN_ARRAY   = _S++,
    SAX_CLOSE_ARRAY  = _S++;
    
function errorReport(statusCode, body, error) {
   try{
      var jsonBody = JSON.parse(body);
   }catch(e){}

   return {
      statusCode:statusCode,
      body:body,
      jsonBody:jsonBody,
      thrown:error
   };
}    
