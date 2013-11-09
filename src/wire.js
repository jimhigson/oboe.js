/**
 * This file sits just behind the API which is used to attain a new
 * Oboe instance. It creates the new components that are required
 * and introduces them to each other.
 */

function wire (httpMethodName, contentSource, body, headers){

   var oboeBus = pubSub();
               
   streamingHttp( oboeBus,
                  httpTransport(), 
                  httpMethodName, contentSource, body, headers );                              
     
   instanceController( 
               oboeBus, 
               clarinet.parser(), 
               incrementalContentBuilder(oboeBus) 
   );
      
   patternAdapter(oboeBus, jsonPathCompiler);      
      
   return new instanceApi(oboeBus);
}
