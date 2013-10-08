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
    ERROR_EVENT   = _S++,    
    ROOT_FOUND    = _S++,    
    NEW_CONTENT = _S++,
    END_OF_CONTENT = _S++,
    ABORTING = _S++;