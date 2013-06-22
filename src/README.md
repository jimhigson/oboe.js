
Welcome to the oboe.js source.
 
The codebase is made from a few main components:
 
`controller.js` ties everything together   
`api.js` Creates the window.oboe object which is the only API entry point.  
`jsonPath.js` A JSON path parser written using purely functional Javascript                         
`jsonBuilder.js` A wrapper around the [Clarinet](https://github.com/dscape/clarinet) SAX JSON parser that progressively builds up DOM-style
   JSON based on SAX calls. Listens to the callbacks from Clarinet, builds up the objects being described
   and notifies via further callbacks when intereting things happen.      
`streamingXhr.js` A basic wrapper around the browser's XHR to provide a streaming interface
`pubsub.js` A not at all general purpose event handling thing
`lib/polyfillspubsub.js` Compatability with IE8 and IE9
   
When the source is built into the distributable js, a single object is exposed at window.oboe    
 
Happy hacking!
