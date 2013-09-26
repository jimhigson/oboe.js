function wire (httpMethodName, url, body, headers){
   var eventBus = pubSub();
               
   streamingHttp(  eventBus.fire, eventBus.on,
                  new XMLHttpRequest(), 
                  httpMethodName, url, body, headers );                              
     
   return instanceController( eventBus.fire, eventBus.on, 
                              clarinet.parser(), incrementalContentBuilder(eventBus.fire) );
}
