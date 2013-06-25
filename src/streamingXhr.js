/**
 * An xhr wrapper that calls a callback whenever some more of the
 * response is available, without waiting for all of it.
 * 
 * This probably needs more development and testing more than most other parts 
 * of Oboe.
 *
 * TODO:
 *    error handling
 *    allow setting of request params
 *    
 * Fetch something over ajax, calling back as often as new data is available.
 * 
 * None of the parameters are optional.
 * 
 * @param {String} method one of 'GET' 'POST' 'PUT' 'DELETE'
 * @param {String} url
 * @param {String|Object|undefined} data
 * @param {Function} progressCallback in form Function(String nextResponseDrip)
 *    A callback to be called repeatedly as the input comes in.
 *    Will be passed the new string since the last call.
 * @param {Function} doneCallback in form Function(String wholeResponse)
 *    A callback to be called when the request is complete.
 *    Will be passed the total response
 * @param {String} data some content to be sent with the request. Only valid
 *                 if method is POST or PUT.
 */
function streamingXhr(method, url, data, progressCallback, doneCallback) {
   
   /* Given a value from the user to send as the request body, return in a form
      that is suitable to sending over the wire. Which is, either a string or
      null.   
      
      TODO: make a streamingXhrTest to validate this works. Can sinon stub XHRs?
    */
   function validatedRequestBody( body ) {
      if( !body )
         return null;
   
      return isString(body)? body: JSON.stringify(body);
   }   
   
   /* xhr2 already supports everything that we need so very little abstraction required.\
   *  listenToXhr2 is one of two possible values to use as listenToXhr  
   */
   function listenToXhr2(xhr, progressListener, completeListener) {      
      xhr.onprogress = progressListener;
      xhr.onload = completeListener;
   }

   /* xhr1 supports little so a bit more work is needed 
    * listenToXhr1 is one of two possible values to use as listenToXhr  
    */           
   function listenToXhr1(xhr, progressListener, completeListener){
   
      // unfortunately there is no point polling the responsetext, these bad old browsers rarely make
      // that possible. Instead, we'll just have to wait for the request to be complete, degrading gracefully
      // to standard Ajax.      
   
      // handle the request being complete: 
      xhr.onreadystatechange = function() {     
         if(xhr.readyState == 4 && xhr.status == 200) {
            progressListener();             
            completeListener();
         }                           
      };
   }
         
   var xhr = new XMLHttpRequest(),
       browserSupportsXhr2 = ('onprogress' in xhr),    
       listenToXhr = browserSupportsXhr2? listenToXhr2 : listenToXhr1,
       numberOfCharsAlreadyGivenToCallback = 0;

   function handleProgress() {
      
      var textSoFar = xhr.responseText;
      
      // give the new text to the callback.
      // on older browsers, the new text will alwasys be the whole response. 
      // On newer/better ones it'll be just the little bit that we got since last time:         
      progressCallback( textSoFar.substr(numberOfCharsAlreadyGivenToCallback) );

      numberOfCharsAlreadyGivenToCallback = len(textSoFar);
   }
            
   listenToXhr( xhr, handleProgress, doneCallback);
   
   xhr.open(method, url, true);
   xhr.send(validatedRequestBody(data));   
}
