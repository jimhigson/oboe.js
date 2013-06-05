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
(function (streamingXhr) {

   /**
    * Fetch something over ajax, calling back as often as new data is available.
    * 
    * @param {String} url
    * @param {Function(String nextResponseDrip)} streamCallback
    *    A callback to be called repeatedly as the input comes in.
    *    Will be passed the new string since the last call.
    * @param {Function(String wholeResponse)} doneCallback
    *    A callback to be called when the request is complete.
    *    Will be passed the total response
    */
   streamingXhr.fetch = function(url, streamCallback, doneCallback){
      doneCallback = doneCallback || always;
   
      var xhr = new XMLHttpRequest();
      var charsSent = 0;

      xhr.open("GET", url, true);
      xhr.send(null);

      function handleInput() {

         if( xhr.responseText.length > charsSent ) {

            var newResponseText = xhr.responseText.substr(charsSent);

            charsSent = xhr.responseText.length;

            streamCallback( newResponseText );
         }
      }
      
      function handleDone() {
         // in case the xhr doesn't support partial loading, by registering the same callback
         // onload, we at least get the whole response. This shouldn't be necessary once
         // polling is implemented in lieu of onprogress.      
         handleInput();
         
         doneCallback( xhr.responseText );
      }      
         
      listenToXhr( xhr, handleInput, handleDone);
   };
   
   /* little abstration to get XHRs working sensibly in IE */
   function listenToXhr(xhr, progressListener, completeListener) {
      
      xhr.onprogress = progressListener;
      xhr.onload = completeListener;
   }

})(typeof exports === "undefined" ? streamingXhr = {} : exports);
