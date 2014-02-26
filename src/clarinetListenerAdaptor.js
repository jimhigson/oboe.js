
/** 
 * A bridge used to assign stateless functions to listen to clarinet.
 * 
 * As well as the parameter from clarinet, each callback will also be passed
 * the result of the last callback.
 * 
 * This may also be used to clear all listeners by assigning zero handlers:
 * 
 *    clarinetListenerAdaptor( clarinet, {} )
 */
function clarinetListenerAdaptor(clarinetParser, handlers){
    
   var state;

   SAX_EVENTS.forEach(function(eventType){
 
      var handlerFunction = handlers[eventType];
      
      clarinetParser[eventType] = handlerFunction && 
                                       function(param) {
                                          state = handlerFunction( state, param);
                                       };
   });
}
