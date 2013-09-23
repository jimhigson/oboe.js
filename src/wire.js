function start (httpMethodName, url, body, callback, headers){
   var eventBus = pubSub();
               
   streamingXhr( eventBus.fire, eventBus.on, 
                 httpMethodName, url, body, headers );                              
     
   return instanceController( eventBus.fire, eventBus.on, 
                              clarinet.parser(), incrementalContentBuilder(eventBus.fire), callback);
}
