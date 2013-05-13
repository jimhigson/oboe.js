
/** The purpose of this file is to simulate a slow-loading ajax call of some template-based data.
 *    */
var FakeAjax = (function(){
   
   /** I can't remember if Javascript objects are deterministic in their ordering, but in practice
    *  they always output to JSON in the order that the keys were added. Make things a bit more
    *  interesting by randomising that order
    */
   function randomiseMapOrder(map) {
      var randomkeys = _.shuffle( _.keys(map) ),
          newMap = {};
      
      _.each( randomkeys, function( key ) {
         newMap[key] = map[key];      
      });
      
      return newMap;
   }      
   
   return {
      /**
       * Drip the data in, x chars at a time.
       * 
       * @param {Number} dripSize how many chars to fake the load of at once
       * @param {Number} dripInterval how often to fake a drip of data arriving
       * @param {String -> *} callback for when data arrives, should accept the new data 
       *    as a string 
       */
      fetch: function loadThrottled(dripSize, dripInterval, callback) {
         
         var fullData = JSON.stringify(randomiseMapOrder(RandomJson.expandJsonTemplate(dataTemplate)));      
            
         var cursorPosition = 0;         
            
         var intervalId = window.setInterval(function(){
         
            var nextDrip = fullData.substr(cursorPosition, dripSize);         
            
            cursorPosition += dripSize;
                           
            callback(nextDrip);                     
            
            if( cursorPosition >= fullData.length ) {
               window.clearInterval(intervalId);
            }                                                        
      
         }, dripInterval);
      }
   };

}());

