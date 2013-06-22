(function(){

   /* export public API */
   window.oboe = {
      doGet:httpApiMethod('GET'),
      doDelete:httpApiMethod('DELETE'),
      doPost:httpApiMethod('POST', true),
      doPut:httpApiMethod('PUT', true)
   };
   
   /** add an http method to the public api */
   function httpApiMethod(httpMethodName, mayHaveContent) {
         
      var 
          // make name like 'doGet' out of name like 'GET'
          bodyArgumentIndex =     mayHaveContent?  1 : -1, // minus one = always undefined - method can't send data
          callbackArgumentIndex = mayHaveContent? 2 : 1;           
      
      // make the above method available without creating an oboe instance first via
      // the public api:
      return function(firstArg){
         var url, body, doneCallback;

         if (isString(firstArg)) {
            // parameters specified as arguments
            //
            //  if mayHaveContext, signature is:
            //     .method( url, content, callback )
            //  else it is:
            //     .method( url, callback )            
            //                                
            url = firstArg;
            body = arguments[bodyArgumentIndex];
            doneCallback = arguments[callbackArgumentIndex]
         } else {
            // parameters specified as options object:
            url = firstArg.url;
            body = firstArg.body;
            doneCallback = firstArg.complete;
         }

         return new Oboe(httpMethodName, url, body, doneCallback);         
      };
   }   

})();