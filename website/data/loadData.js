

function expandJsonTemplate( jsonTemplate ) {
            
   return randomiseMapOrder(jsonTemplate);
         
}

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

function loadThrottled(fullData, dripSize, dripInterval, callback) {
      
   var cursorPosition = 0;         
      
   var intervalId = window.setInterval(function(){
   
      var nextDrip = fullData.substr(cursorPosition, dripSize);         
      
      cursorPosition += dripSize;
      
      console.log('next drip is', nextDrip);
               
      callback(nextDrip);                     
      
      if( cursorPosition >= fullData.length ) {
         window.clearInterval(intervalId);
      }                                                        

   }, dripInterval);
}

