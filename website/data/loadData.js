function expandJsonTemplate( jsonTemplate ) {
            
   return randomiseMapOrder(jsonTemplate);
         
}

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