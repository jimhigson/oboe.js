function httpTransport(){
   return require('http');
}

/**
 * A wrapper around the browser XmlHttpRequest object that raises an 
 * event whenever a new part of the response is available.
 * 
 * In older browsers progressive reading is impossible so all the 
 * content is given in a single call. For newer ones several events
 * should be raised, allowing progressive interpretation of the response.
 *      
 * @param {Function} emit a function to pass events to when something happens
 * @param {Function} on a function to use to subscribe to events
 * @param {XMLHttpRequest} http the http implementation to use as the transport. Under normal
 *          operation, will have been created using httpTransport() above
 *          and therefore be Node's http
 *          but for tests a stub may be provided instead.
 * @param {String} method one of 'GET' 'POST' 'PUT' 'PATCH' 'DELETE'
 * @param {String} contentSource the url to make a request to, or a stream to read from
 * @param {String|Object} data some content to be sent with the request.
 *                        Only valid if method is POST or PUT.
 * @param {Object} [headers] the http request headers to send                       
 */  
function streamingHttp(emit, on, http, method, contentSource, data, headers) {

   function readStreamToEventBus(readableStream) {
         
      // use stream in flowing mode   
      readableStream.on('data', function (chunk) {
                                             
         emit( STREAM_DATA, chunk.toString() );
      });
      
      readableStream.on('end', function() {
               
         emit( STREAM_END );
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
   
   function fetchUrl( url ) {
      if( !contentSource.match(/http:\/\//) ) {
         contentSource = 'http://' + contentSource;
      }                           
                           
      var parsedUrl = require('url').parse(contentSource); 
   
      var req = http.request({
         hostname: parsedUrl.hostname,
         port: parsedUrl.port, 
         path: parsedUrl.pathname,
         method: method,
         headers: headers 
      });
      
      req.on('response', function(res){
         var statusCode = res.statusCode,
             sucessful = String(statusCode)[0] == 2;
                                
         if( sucessful ) {          
               
            readStreamToEventBus(res)
            
         } else {
            readStreamToEnd(res, function(errorBody){
               emit( 
                  ERROR_EVENT, 
                  errorReport( statusCode, errorBody )
               );
            });
         }      
      });
      
      req.on('error', function(e) {
         emit( 
            ERROR_EVENT, 
            errorReport(undefined, undefined, e )
         );
      });
      
      on( ABORTING, function(){              
         req.abort();
      });
         
      if( data ) {
         var body = isString(data)? data: JSON.stringify(data);
         req.write(body);
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
