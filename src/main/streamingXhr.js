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

   streamingXhr.fetch = function(url, streamCallback, successCallback){
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
      
      // TODO: where onprogress isn't supported, poll the responseText.      
      xhr.onprogress = handleInput;         
      xhr.onload = successCallback;
   };

})(typeof exports === "undefined" ? streamingXhr = {} : exports);
