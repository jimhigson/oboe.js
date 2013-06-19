
Welcome to the oboe.js source.
 
The codebase is made from a few main components:
 
`oboe.js` Creates the window.oboe object which is the only API entry point.
   Composes the other parts and does some event dispatching.
       
The rest are used by oboe.js but not exposed from outside the API once Oboe has been compiled:        
          
`jsonBuilder.js` A wrapper around the [Clarinet](https://github.com/dscape/clarinet) SAX JSON parser that progressively builds up DOM-style
   JSON based on SAX calls. Listens to the callbacks from Clarinet, builds up the objects being described
   and notifies via further callbacks when intereting things happen.  
`jsonPath.js` A JSON path parser written using purely functional Javascript    
`streamingXhr.js` A basic wrapper around the browser's XHR to provide a streaming interface
   
When the source is built into the distributable js, a single object is exposed at window.oboe    
 
Happy hacking!
