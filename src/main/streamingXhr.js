/**
 * An xhr wrapper that calls a callback whenever some of the
 * response is available, without waiting for all of it
 *
 * TODO:
 *    error handling
 *    allow setting of request params and other such options
 *    x-browser testing, compatability
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
      
      xhr.onprogress = handleInput;         
      xhr.onload = successCallback;
   };

})(typeof exports === "undefined" ? streamingXhr = {} : exports);
