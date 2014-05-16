var httpTransport = functor(require('http-https'));

/**
 * A wrapper around the browser XmlHttpRequest object that raises an 
 * event whenever a new part of the response is available.
 * 
 * In older browsers progressive reading is impossible so all the 
 * content is given in a single call. For newer ones several events
 * should be raised, allowing progressive interpretation of the response.
 *      
 * @param {Function} oboeBus an event bus local to this Oboe instance
 * @param {XMLHttpRequest} transport the http implementation to use as the transport. Under normal
 *          operation, will have been created using httpTransport() above
 *          and therefore be Node's http
 *          but for tests a stub may be provided instead.
 * @param {String} method one of 'GET' 'POST' 'PUT' 'PATCH' 'DELETE'
 * @param {String} contentSource the url to make a request to, or a stream to read from
 * @param {String|Null} data some content to be sent with the request.
 *                      Only valid if method is POST or PUT.
 * @param {Object} [headers] the http request headers to send                       
 */  
function streamingHttp(oboeBus, transport, method, contentSource, data, headers) {
   "use strict";

   function readStreamToEventBus(readableStream) {
         
      // use stream in flowing mode   
      readableStream.on('data', function (chunk) {
                                             
         oboeBus(STREAM_DATA).emit( chunk.toString() );
      });
      
      readableStream.on('end', function() {
               
         oboeBus( STREAM_END ).emit();
      });
   }
   
   function readStreamToEnd(readableStream, callback){
      var content = '';
   
      readableStream.on('data', function (chunk) {
                                             
         content += chunk.toString();
      });
      
      readableStream.on('end', function() {
               
         callback( content );
      });
   }
   
   function openUrlAsStream( url ) {
      
      var parsedUrl = require('url').parse(url);
           
      return transport.request({
         hostname: parsedUrl.hostname,
         port: parsedUrl.port, 
         path: parsedUrl.path,
         method: method,
         headers: headers
      });
   }
   
   function fetchUrl() {
      if( !contentSource.match(/https?:\/\//) ) {
         contentSource = 'http://' + contentSource;
      }                           
      
      var req = openUrlAsStream(contentSource);
      
      req.on('response', function(res){
         var statusCode = res.statusCode,
             sucessful = String(statusCode)[0] == 2;
                                                   
         oboeBus(HTTP_START).emit( res.statusCode, res.headers);                                
                                
         if( sucessful ) {          
               
            readStreamToEventBus(res)
            
         } else {
            readStreamToEnd(res, function(errorBody){
               oboeBus(FAIL_EVENT).emit( 
                  errorReport( statusCode, errorBody )
               );
            });
         }      
      });
      
      req.on('error', function(e) {
         oboeBus(FAIL_EVENT).emit( 
            errorReport(undefined, undefined, e )
         );
      });
      
      oboeBus(ABORTING).on( function(){              
         req.abort();
      });
         
      if( data ) {
         req.write(data);
      }
      
      req.end();         
   }
   
   if( isString(contentSource) ) {
      fetchUrl(contentSource);
   } else {
      // contentsource is a stream
      readStreamToEventBus(contentSource);   
   }

}
