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
 * @param {Function} fire a function to pass events to when something happens
 * @param {Function} on a function to use to subscribe to events
 * @param {XMLHttpRequest} http the http implementation to use as the transport. Under normal
 *          operation, will have been created using httpTransport() above
 *          and therefore be Node's http
 *          but for tests a stub may be provided instead.
 * @param {String} method one of 'GET' 'POST' 'PUT' 'DELETE'
 * @param {String} url the url to make a request to
 * @param {String|Object} data some content to be sent with the request.
 *                        Only valid if method is POST or PUT.
 * @param {Object} [headers] the http request headers to send                       
 */  
function streamingHttp(fire, on, http, method, url, data, headers) {
         
   function validatedRequestBody( body ) {
      if( !body )
         return null;
   
      return isString(body)? body: JSON.stringify(body);
   }      
               
   url = require('url').parse('http://' + url);

   var req = http.request({
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: headers
   }, function(res) {
      
      var statusCode = res.statusCode,
          sucessful = String(statusCode)[0] == 2;
                             
      if( sucessful ) {          
            
         res.on('data', function (chunk) {
                           
            fire( NEW_CONTENT, chunk.toString() );
         });
         
         res.on('end', function() {
                  
            fire( END_OF_CONTENT );
         });
         
      } else {
      
         fire( ERROR_EVENT, statusCode );
      }
   });
   
   req.on('error', function(e) {
      fire( ERROR_EVENT, e );
   });
   
   on( ABORTING, function(){              
      req.abort();
   });
   
   var body = validatedRequestBody(data);
   
   if( body ) {
      req.write(validatedRequestBody(data));
   }
   
   req.end();

}
