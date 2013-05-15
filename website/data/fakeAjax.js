
/** The purpose of this file is to simulate a slow-loading ajax call of some template-based data.
 *    */
var FakeAjax = (function(){
   "use strict";   
        
   return {
      /**
       * Drip the data in, x chars at a time.
       * 
       * @param {String} payload the thing to fake the loading of
       * @param {Number} dripSize how many chars to fake the load of at once
       * @param {Number} dripInterval how often to fake a drip of data arriving
       * @param {String -> *} callback for when data arrives, should accept the new data 
       *    as a string 
       */
      fetch: function loadThrottled(payload, dripSize, dripInterval, callback) {
                          
         var cursorPosition = 0;         
            
         var intervalId = window.setInterval(function(){
         
            var nextDrip = payload.substr(cursorPosition, dripSize);         
            
            cursorPosition += dripSize;
                           
            callback(nextDrip);                     
            
            if( cursorPosition >= payload.length ) {
               window.clearInterval(intervalId);
            }                                                        
      
         }, dripInterval);
      }
   };

}());

