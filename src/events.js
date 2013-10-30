/**
 * This file declares some constants to use as names for event types.
 */

var // NODE_FOUND, PATH_FOUND and ERROR_EVENT feature 
    // in the public API via .on('node', ...) or .on('path', ...)
    // so these events are strings
    NODE_FOUND    = 'node',  
    PATH_FOUND    = 'path',   
         
    // these events are never exported so are kept as 
    // the smallest possible representation, numbers:
    _S = 0,
    FAIL_EVENT   = 'fail',    
    ROOT_FOUND    = _S++,    
    HTTP_START = 'start',
    STREAM_DATA = _S++,
    STREAM_END = _S++,
    ABORTING = _S++;
    
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