/**
 * This file sits just behind the API which is used to attain a new
 * Oboe instance. It creates the new components that are required
 * and introduces them to each other.
 */

function wire (httpMethodName, contentSource, body, headers, withCredentials){

   var oboeBus = pubSub();
   
   console.log('wiring will invoke the portal');
   
   var clientProgram = interDimensionalPortal(
      workerEnv(),
      
      function(childThreadBus, httpMethodName, contentSource, body, headers, withCredentials){
         console.log('setting up the in-worker wiring to ' + httpMethodName + ' ' + contentSource);

         if( contentSource ) {
            streamingHttp(
               childThreadBus,
               httpTransport(),
               httpMethodName,
               contentSource,
               body,
               headers,
               withCredentials
            );
         }

         clarinet(childThreadBus);
      },
           
      [  // the fetcher/parser needs to know if the request is aborted:
         ABORTING 
         
         // Although unconventional, data can be fed in through the oboe instance. Hence,
         // it needs to be able to send this data to the parser.
      ,  STREAM_DATA
      ,  STREAM_END
      ],
      
      // events to get back from the worker
      [  SAX_VALUE
      ,  SAX_KEY
      ,  SAX_OPEN_OBJECT
      ,  SAX_CLOSE_OBJECT
      ,  SAX_OPEN_ARRAY
      ,  SAX_CLOSE_ARRAY
      ,  FAIL_EVENT
      ]
   );

   clientProgram(oboeBus, httpMethodName, contentSource, body, headers, withCredentials);
   
   // Wire the input stream in if we are given a content source.
   // This will usually be the case. If not, the instance created
   // will have to be passed content from an external source.

   ascentManager(oboeBus, incrementalContentBuilder(oboeBus));
      
   patternAdapter(oboeBus, jsonPathCompiler);      
      
   return new instanceApi(oboeBus);
}
