
Welcome to the oboe.js source.
 
The codebase is made from a few main components:
 
`controller.js` ties everything together   
`browser-api.js` Creates the window.oboe object which is the only API entry point.  
`jsonPath.js` A JSON path parser written using purely functional Javascript                         
`incrementalParsedContent.js` A wrapper around the [Clarinet](https://github.com/dscape/clarinet) SAX JSON parser 
   that progressively builds up a model of the parsed JSON based on the SAX-style calls. Notifies when interesting 
   things happen.      
`streamingXhr.js` A basic wrapper around the browser's XHR to provide a streaming interface
`pubsub.js` A nano event handling thing
`instance-api.js` Defines the interface that is available on Oboe instances 
`lib/polyfillspubsub.js` Compatability with IE8 and IE9
   
When the source is built into the distributable js, a single object is exposed at window.oboe    
 
Happy hacking!
