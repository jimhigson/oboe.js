function httpTransport(){
   return new XMLHttpRequest();
}

/**
 * A wrapper around the browser XmlHttpRequest object that raises an 
 * event whenever a new part of the response is available.
 * 
 * In older browsers progressive reading is impossible so all the 
 * content is given in a single call. For newer ones several events
 * should be raised, allowing progressive interpretation of the response.
 *      
 * @param {Function} oboeBus an event bus local to this Oboe instance
 * @param {XMLHttpRequest} xhr the xhr to use as the transport. Under normal
 *          operation, will have been created using httpTransport() above
 *          but for tests a stub can be provided instead.
 * @param {String} method one of 'GET' 'POST' 'PUT' 'PATCH' 'DELETE'
 * @param {String} url the url to make a request to
 * @param {String|Object} data some content to be sent with the request.
 *                        Only valid if method is POST or PUT.
 * @param {Object} [headers] the http request headers to send                       
 */  
function streamingHttp(oboeBus, xhr, method, url, data, headers) {
           
   var emitStreamData = oboeBus(STREAM_DATA).emit,
       emitFail       = oboeBus(FAIL_EVENT).emit,
       numberOfCharsAlreadyGivenToCallback = 0;      

   // When an ABORTING message is put on the event bus abort 
   // the ajax request         
   oboeBus( ABORTING ).on( function(){
  
      // if we keep the onreadystatechange while aborting the XHR gives 
      // a callback like a successful call so first remove this listener
      // by assigning null:
      xhr.onreadystatechange = null;
            
      xhr.abort();
   });

   /** Given a value from the user to send as the request body, return in
    *  a form that is suitable to sending over the wire. Returns either a 
    *  string, or null.        
    */
   function validatedRequestBody( body ) {
      if( !body )
         return null;
   
      return isString(body)? body: JSON.stringify(body);
   }      

   /** 
    * Handle input from the underlying xhr: either a state change,
    * the progress event or the request being complete.
    */
   function handleProgress() {
                        
      var textSoFar = xhr.responseText,
          newText = textSoFar.substr(numberOfCharsAlreadyGivenToCallback);
      
      
      /* Raise the event for new text.
      
         On older browsers, the new text is the whole response. 
         On newer/better ones, the fragment part that we got since 
         last progress. */
         
      if( newText ) {
         emitStreamData( newText );
      } 

      numberOfCharsAlreadyGivenToCallback = len(textSoFar);
   }
   
   
   if('onprogress' in xhr){  // detect browser support for progressive delivery
      xhr.onprogress = handleProgress;
   }
   
   xhr.onreadystatechange = function() {
      
      switch( xhr.readyState ) {
               
         case 2:       
         
            oboeBus( HTTP_START ).emit( 
               xhr.status,
               parseResponseHeaders(xhr.getAllResponseHeaders()) );
            return;
            
         case 4:       
            // is this a 2xx http code?
            var successful = String(xhr.status)[0] == 2;
            
            if( successful ) {
               // In Chrome 29 (not 28) no onprogress is emitted when a response
               // is complete before the onload. We need to always do handleInput
               // in case we get the load but have not had a final progress event.
               // This looks like a bug and may change in future but let's take
               // the safest approach and assume we might not have received a 
               // progress event for each part of the response
               handleProgress();
               
               oboeBus(STREAM_END).emit();
            } else {

               emitFail( errorReport(
                  xhr.status, 
                  xhr.responseText
               ));
            }
      }
   };

   // errors on the http-level, such as 404 are reported through 
   // .onreadystatechange but connection errors, such as the network 
   // going down throw error events.
   // 
   //  Spec:
   //    http://www.w3.org/TR/XMLHttpRequest/#event-xhr-error
   //
   //  jQuery catching these:
   //    https://github.com/jquery/jquery/blob/master/src/ajax/xhr.js#L110
   xhr.onerror = function() {
      emitFail( errorReport(0, '', Error('connection lost')) );
   }; 

   try{
   
      xhr.open(method, url, true);
   
      for( var headerName in headers ){
         xhr.setRequestHeader(headerName, headers[headerName]);
      }
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');             
      
      xhr.send(validatedRequestBody(data));
      
   } catch( e ) {
      // To keep a consistent interface with Node, we can't emit an event here.
      // Node's streaming http adaptor receives the error as an asynchronous
      // event rather than as an exception. If we emitted now, the Oboe user
      // has had no chance to add a .fail listener so there is no way
      // the event could be useful. For both these reasons defer the
      // firing to the next JS frame.  
      window.setTimeout(
         partialComplete(emitFail, errorReport(undefined, undefined, e))
      ,  0
      );
   }            
}
