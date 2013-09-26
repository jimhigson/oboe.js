var _S = 0,
    // NODE_FOUND, PATH_FOUND and ERROR_EVENT feature in public API, therefore are strings
    NODE_FOUND    = 'node',  
    PATH_FOUND    = 'path',        
    // these are never exported, so are numbers:
    ERROR_EVENT   = _S++,    
    ROOT_FOUND    = _S++,    
    NEW_CONTENT = _S++,
    END_OF_CONTENT = _S++,
    ABORTING = _S++;