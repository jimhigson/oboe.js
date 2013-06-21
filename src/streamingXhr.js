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
 */
var streamingXhr = (function (XHR) {
   
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
         
   /* listenToXhr will be set to the appropriate function for XHR1 or XHR2 depending on what the browser
    * supports
    * 
    * @function
    * 
    * @param {XmlHttpRequest} xhr
    * @param {Function} progressListener
    * @param {Function} completeListener
    */
   var browserSupportsXhr2 = ('onprogress' in new XHR()),    
       listenToXhr = browserSupportsXhr2? listenToXhr2 : listenToXhr1;
      
   /**
    * Fetch something over ajax, calling back as often as new data is available.
    * 
    * None of the parameters are optional.
    * 
    * @param {String} method one of 'GET' 'POST' 'PUT' 'DELETE'
    * @param {String} url
    * @param {String|null} data
    * @param {Function(String nextResponseDrip)} progressCallback
    *    A callback to be called repeatedly as the input comes in.
    *    Will be passed the new string since the last call.
    * @param {Function(String wholeResponse)} doneCallback
    *    A callback to be called when the request is complete.
    *    Will be passed the total response
    * @param {String} data some content to be sent with the request. Only valid
    *                 if method is POST or PUT.
    */
   return function(method, url, data, progressCallback, doneCallback) {
      // TODO: in if in node, use require('http') instead of ajax
      
      var xhr = new XHR(),
          numberOfCharsAlreadyGivenToCallback = 0;

      xhr.open(method, url, true);
      xhr.send(data);

      function handleProgress() {
         
         var textSoFar = xhr.responseText;
         
         // give the new text to the callback.
         // on older browsers, the new text will alwasys be the whole response. 
         // On newer/better ones it'll be just the little bit that we got since last time:         
         progressCallback( textSoFar.substr(numberOfCharsAlreadyGivenToCallback) );

         numberOfCharsAlreadyGivenToCallback = len(textSoFar);
      }
               
      listenToXhr( xhr, handleProgress, doneCallback);
   };

})(XMLHttpRequest);
