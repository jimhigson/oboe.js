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
   
   /** Given a value from the user to send as the request body, return in a form
    *  that is suitable to sending over the wire. Returns either a string, or null.        
    */
   function validatedRequestBody( body ) {
      if( !body )
         return null;
   
      return isString(body)? body: JSON.stringify(body);
   }   
   
   /** xhr2 already supports everything that we need so just a bit of abstraction required.
    *  listenToXhr2 is one of two possible values to use as listenToXhr  
    */
   function listenToXhr2(xhr) {
      // In Chrome 29 (not 28) no onprogress is fired when a response is complete before the
      // onload. We need to always do handleInput in case we get the load even but have
      // not had a progress event..
         
      xhr.onprogress = handleInput;
      xhr.onload = function() {  
         handleInput();
         doneCallback();
      };
   }
   
   /** xhr1 is quite primative so a bit more work is needed to connect to it 
    *  listenToXhr1 is one of two possible values to use as listenToXhr  
    */           
   function listenToXhr1(xhr){
   
      // unfortunately there is no point polling the responsetext, these bad old browsers 
      // don't make the partial text accessible - it is undefined until the request finishes 
      // and then it is everything.
      // Instead, we just have to wait for the request to be complete and degrade gracefully
      // to non-streaming Ajax.      
      xhr.onreadystatechange = function() {     
         if(xhr.readyState == 4 && xhr.status == 200) {
            handleInput();
            doneCallback();            
         }                            
      };
   }   
   
   /** 
    * Handle input from the underlying xhr: either a state change,
    * the progress event or the request being complete.
    */
   function handleInput() {
                        
      var textSoFar = xhr.responseText,
          newText = textSoFar.substr(numberOfCharsAlreadyGivenToCallback);
      
      // give the new text to the callback.
      // on older browsers, the new text will alwasys be the whole response. 
      // On newer/better ones it'll be just the little bit that we got since last time.
      // On browsers which send progress events for the last bit of the response, if we
      // are responding to the laod event it is now empty         
      newText && progressCallback( newText );

      numberOfCharsAlreadyGivenToCallback = len(textSoFar);
   }
         
   var 
      xhr = new XMLHttpRequest(),
   
      listenToXhr = 'onprogress' in xhr? listenToXhr2 : listenToXhr1,
       
      numberOfCharsAlreadyGivenToCallback = 0;
            
   listenToXhr( xhr );
   
   xhr.open(method, url, true);
   xhr.send(validatedRequestBody(data));   
}
