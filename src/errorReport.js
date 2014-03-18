/**
 * Create an object to represent an error case. Note that this object cannot
 * have a reference to an actual Error instance. The reason for this is that
 * Error instances cannot be serialised for passing between threads.
 */
function errorReport(statusCode, body, error) {
   try{
      var jsonBody = JSON.parse(body);
   }catch(e){}

   return {
      statusCode:statusCode,
      body:body,
      jsonBody:jsonBody,
      message:(error && error.message)
   };
}
