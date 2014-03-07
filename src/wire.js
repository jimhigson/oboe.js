/**
 * This file sits just behind the API which is used to attain a new
 * Oboe instance. It creates the new components that are required
 * and introduces them to each other.
 */

function wireToFetch(oboeBus, httpMethodName, contentSource, body, headers, withCredentials){
   
   if( contentSource ) {

      streamingHttp(
         oboeBus,
         httpTransport(),
         httpMethodName,
         contentSource,
         body,
         headers,
         withCredentials
      );
   }

   clarinet(oboeBus);   
}

function wire (httpMethodName, contentSource, body, headers, withCredentials){

   var oboeBus = pubSub();
   
   interDimensionalPortal(
      oboeBus,
      
      [_oboeWrapper], // puts oboe in global namespace of child thread
      
      function( childBus, httpMethodName, contentSource, body, headers, withCredentials ){
         oboe.wire.wireToFetch(childBus, httpMethodName, contentSource, body, headers, withCredentials)
      },
      
      [  httpMethodName, contentSource, body, headers, withCredentials],
      
      [  ABORTING],  // events to underlying
      
      [  SAX_VALUE
      ,  SAX_KEY
      ,  SAX_OPEN_OBJECT
      ,  SAX_CLOSE_OBJECT
      ,  SAX_OPEN_ARRAY
      ,  SAX_CLOSE_ARRAY
      ,  FAIL_EVENT
      ]    // events from underlying
   );
   
   // Wire the input stream in if we are given a content source.
   // This will usually be the case. If not, the instance created
   // will have to be passed content from an external source.

   ascentManager(oboeBus, incrementalContentBuilder(oboeBus));
      
   patternAdapter(oboeBus, jsonPathCompiler);      
      
   return new instanceApi(oboeBus);
}
