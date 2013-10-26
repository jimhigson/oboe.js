/**
 * This file sits just behind the API which is used to attain a new
 * Oboe instance. It creates the new components that are required
 * and introduces them to each other.
 */

function wire (httpMethodName, contentSource, body, headers){

   var eventBus = pubSub();
               
   streamingHttp( eventBus.emit, eventBus.on,
                  httpTransport(), 
                  httpMethodName, contentSource, body, headers );                              
     
   return instanceController( 
               eventBus.emit, eventBus.on, eventBus.un, 
               clarinet.parser(), 
               incrementalContentBuilder(eventBus.emit) 
   );
}
