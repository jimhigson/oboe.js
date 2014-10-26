
var minDataIntervalMs = 16,
    maxDripSizeChars = 100;


/**
 * @param {Function} onInput
 * @param {Function} emitOutput
 */
function throttle(onInput, emitOutput) {
   
   var buffer = '',
       scheduled;
      
   function scheduleNext() {

      scheduled = window.setTimeout(actionThrottleFrame, minDataIntervalMs);
   }
   
   function actionThrottleFrame() {
      
      var drip = buffer.substr(0, maxDripSizeChars),
          buffer = buffer.substr(maxDripSizeChars); 
          
      if( drip )
         emitOutput(drip);
      
      if( buffer )
         scheduleNext();
      else
         scheduled = false;
   }
   
   onInput(function( dataIn ){
      
      buffer = buffer + dataIn;

      if( !scheduled )
         scheduleNext();
   });
   
   // TODO: aborting
   
   // TODO: end of data event propagation
   
}


