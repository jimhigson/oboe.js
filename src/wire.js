/**
 * This file sits just behind the API which is used to attain a new
 * Oboe instance. It creates the new components that are required
 * and introduces them to each other.
 */

function wire (httpMethodName, url, body, headers){

   var eventBus = pubSub();
               
   streamingHttp( eventBus.fire, eventBus.on,
                  httpTransport(), 
                  httpMethodName, url, body, headers );                              
     
   return instanceController( 
               eventBus.fire, eventBus.on, 
               clarinet.parser(), 
               incrementalContentBuilder(eventBus.fire) 
   );
}
