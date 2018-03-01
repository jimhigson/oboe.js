import { pubSub } from './pubSub';
import { ascentManager } from './ascentManager';
import { incrementalContentBuilder } from './incrementalContentBuilder';
import { patternAdapter } from './patternAdapter';
import { jsonPathCompiler } from './jsonPath';
import { instanceApi } from './instanceApi';
import { clarinet } from './libs/clarinet';

import { streamingHttp, httpTransport } from './streamingHttp.node';

/**
 * This file sits just behind the API which is used to attain a new
 * Oboe instance. It creates the new components that are required
 * and introduces them to each other.
 */

function wire (httpMethodName, contentSource, body, headers, withCredentials, disableBufferCheck){

   var oboeBus = pubSub();
   
   // Wire the input stream in if we are given a content source.
   // This will usually be the case. If not, the instance created
   // will have to be passed content from an external source.
  
   if( contentSource ) {

      streamingHttp( oboeBus,
                     httpTransport(), 
                     httpMethodName,
                     contentSource,
                     body,
                     headers,
                     withCredentials
      );
   }

   var options = {
      disableBufferCheck: disableBufferCheck
   };
   clarinet(oboeBus, options);

   ascentManager(oboeBus, incrementalContentBuilder(oboeBus));
      
   patternAdapter(oboeBus, jsonPathCompiler);      
      
   return instanceApi(oboeBus, contentSource);
}

export { wire };