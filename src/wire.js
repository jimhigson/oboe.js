function wire (httpMethodName, url, body, callback, headers){
   var eventBus = pubSub();
               
   streamingXhr(  eventBus.fire, eventBus.on,
                  new XMLHttpRequest(), 
                  httpMethodName, url, body, headers );                              
     
   return instanceController( eventBus.fire, eventBus.on, 
                              clarinet.parser(), incrementalContentBuilder(eventBus.fire), callback);
}
