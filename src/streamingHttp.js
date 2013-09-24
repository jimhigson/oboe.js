/**
 * An xhr wrapper that calls a callback whenever some more of the
 * response is available, without waiting for all of it.
 * 
 * This probably needs more development and testing more than most other parts 
 * of Oboe.
 *    
 * Fetch something over ajax, calling back as often as new data is available.
 * 
 * None of the parameters are optional.
 * 
 * @param {Function} fire a function to pass events to when something happens
 * @param {Function} on a function to use to subscribe to events
 * @param {XMLHttpRequest} xhr the xhr to use as the transport
 * @param {String} method one of 'GET' 'POST' 'PUT' 'DELETE'
 * @param {String} url
 * @param {String|Object} data some content to be sent with the request. Only valid
 *                        if method is POST or PUT.
 * @param {Object} [headers] the http request headers to send                       
 */
function streamingHttp(fire, on, xhr, method, url, data, headers) {
        
   var numberOfCharsAlreadyGivenToCallback = 0;
         
   on( ABORTING, function(){
      // when an ABORTING message is put on the event bus abort the ajax request
   
      // if we keep the state change listener, aborting gives it a callback the same as
      // a successful request so null it out.
      xhr.onreadystatechange = null;
      xhr.abort();
   });

   /** Given a value from the user to send as the request body, return in a form
    *  that is suitable to sending over the wire. Returns either a string, or null.        
    */
   function validatedRequestBody( body ) {
      if( !body )
         return null;
   
      return isString(body)? body: JSON.stringify(body);
   }      

   /** 
    * Handle input from the underlying xhr: either a state change,
    * the progress event or the request being complete.
    */
   function handleProgress() {
                        
      var textSoFar = xhr.responseText,
          newText = textSoFar.substr(numberOfCharsAlreadyGivenToCallback);
      
      // give the new text to the callback.
      // on older browsers, the new text will alwasys be the whole response. 
      // On newer/better ones it'll be just the little bit that we got since last time.
      // On browsers which send progress events for the last bit of the response, if we
      // are responding to the laod event it is now empty         
      if( newText ) {
         fire( HTTP_PROGRESS_EVENT, newText );
      } 

      numberOfCharsAlreadyGivenToCallback = len(textSoFar);
   }
   
   if('onprogress' in xhr){
      xhr.onprogress = handleProgress;
   }
   
   xhr.onreadystatechange = function() {
            
      if(xhr.readyState == 4 ) {

         // is this a 2xx http code?
         var sucessful = String(xhr.status)[0] == 2;
         
         if( sucessful ) {
            // In Chrome 29 (not 28) no onprogress is fired when a response is complete before the
            // onload. We need to always do handleInput in case we get the load but have
            // not had a final progress event. This may change in future but let's take the safest
            // approach and assume we might not have received a progress event for every bit of
            // data before we get the load event.
            handleProgress();
            
            fire( HTTP_DONE_EVENT );
         } else {
         
            fire( ERROR_EVENT );
         }
      }
   };

   xhr.open(method, url, true);
   
   for( var headerName in headers ){
      xhr.setRequestHeader(headerName, headers[headerName]);
   }
   
   xhr.send(validatedRequestBody(data));
}
