/**
 * An xhr wrapper that calls a callback whenever some more of the
 * response is available, without waiting for all of it.
 * 
 * This probably needs more development and testing more than most other parts 
 * of Oboe.
 *
 * TODO:
 *    error handling
 *    allow setting of request params and other such options
 *    x-browser testing, compatibility
 */
var streamingXhr = (function () {
   
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
   function listenToXhr1(xhr, _progressListener, completeListener){
   
      // unfortunately there is no point polling the responsetext, these bad old browsers rarely make
      // that possible. Instead, we'll just have to wait for the request to be complete, degrading gracefully
      // to standard Ajax.      
   
      // handle the request being complete: 
      xhr.onreadystatechange = function() {     
         if(this.readyState == 4 && this.status == 200 ) {             
            completeListener();
         }                           
      };
   }
      
   function browserSupportsXhr2(){
      return ('onprogress' in new XMLHttpRequest());
   }      
   
   /* listenToXhr will be set to the appropriate function for XHR1 or XHR2 depending on what the browser
    * supports
    * 
    * @function
    * 
    * @param {XmlHttpRequest} xhr
    * @param {Function} progressListener
    * @param {Function} completeListener
    */
   var listenToXhr = browserSupportsXhr2()? listenToXhr2 : listenToXhr1;
      
   /**
    * Fetch something over ajax, calling back as often as new data is available.
    * 
    * @param {String} method one of 'GET' 'POST' 'PUT' 'DELETE'
    * @param {String} url
    * @param {Function(String nextResponseDrip)} progressCallback
    *    A callback to be called repeatedly as the input comes in.
    *    Will be passed the new string since the last call.
    * @param {Function(String wholeResponse)} doneCallback
    *    A callback to be called when the request is complete.
    *    Will be passed the total response
    * @param {String} data some content to be sent with the request. Only valid
    *                 if method is POST or PUT.
    */
   return function(method, url, progressCallback, doneCallback, data) {
      // TODO: in if in node, use require('http') instead of ajax
   
      doneCallback = doneCallback || always;
   
      var xhr = new XMLHttpRequest();
      var numberOfCharsGivenToCallback = 0;

      xhr.open(method, url, true);
      xhr.send(data || null);

      function handleProgress() {
         
         try{
            var textSoFar = xhr.responseText;
         } catch(e) {
            // ie sometimes errors if you try to get the responseText too early but just
            // ignore it when this happens.
            return;
         }
         
         if( len(textSoFar) > numberOfCharsGivenToCallback ) {

            var latestText = textSoFar.substr(numberOfCharsGivenToCallback);

            progressCallback( latestText );

            numberOfCharsGivenToCallback = len(textSoFar);
         }
      }
      
      function handleDone() {
         // in case the xhr doesn't support partial loading, by registering the same callback
         // onload, we at least get the whole response. This shouldn't be necessary once
         // polling is implemented in lieu of onprogress.      
         handleProgress();
         
         doneCallback( xhr.responseText );
      }      
         
      listenToXhr( xhr, handleProgress, handleDone);
   };

})();
