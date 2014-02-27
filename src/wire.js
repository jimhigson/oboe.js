/**
 * This file sits just behind the API which is used to attain a new
 * Oboe instance. It creates the new components that are required
 * and introduces them to each other.
 */

function wire (httpMethodName, contentSource, body, headers, withCredentials){

   var oboeBus = pubSub();

   headers = headers ? 
                       // Shallow-clone the headers array. This allows it to be
                       // modified without side effects to the caller. We don't
                       // want to change objects that the user passes in.
                       JSON.parse(JSON.stringify(headers)) 
                     : {};
   
   if( body ) {
      if( !isString(body) ) {
         
         // If the body is not a string, stringify it. This allows objects to
         // be given which will be sent as JSON.
         body = JSON.stringify(body);
         
         // Default Content-Type to JSON unless given otherwise.
         headers['Content-Type'] = headers['Content-Type'] || 'application/json';
      }
   } else {
      body = null;
   }
   
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

   clarinet(oboeBus);

   ascentManager(oboeBus, incrementalContentBuilder(oboeBus));
      
   patternAdapter(oboeBus, jsonPathCompiler);      
      
   return new instanceApi(oboeBus);
}
