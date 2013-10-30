// from gist https://gist.github.com/monsur/706839

/**
 * XmlHttpRequest's getAllResponseHeaders() method returns a string of response
 * headers according to the format described here:
 * http://www.w3.org/TR/XMLHttpRequest/#the-getallresponseheaders-method
 * This method parses that string into a user-friendly key/value pair object.
 */
function parseResponseHeaders(headerStr) {
   var headers = {};
   if (!headerStr) {
      return headers;
   }
   headerStr.split('\u000d\u000a').forEach(function(headerPair){

      // Can't use split() here because it does the wrong thing
      // if the header value has the string ": " in it.
      var index = headerPair.indexOf('\u003a\u0020');
      if (index > 0) {
         var key = headerPair.substring(0, index);
         var val = headerPair.substring(index + 2);
         headers[key] = val;
      }

   });
   return headers;
}