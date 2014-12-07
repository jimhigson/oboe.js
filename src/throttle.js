
var 
    maxDripSizeChars = 100,
    maxPumpDuration = 16;

/**
 * @param {Function} onInput
 * @param {Function} emitOutput
 */
function throttle(onInput, emitOutput) {

   // TODO: use high-res timers   
   
   var buffer = '',
       scheduledTimeout;
      
   function scheduleNext() {

      scheduledTimeout = window.setTimeout(dripSomeContentThrough, 0);
   }
   
   function dripSomeContentThrough() {

      var pumpStart = Date.now();

      function withinPumpTime() {
         return Date.now() < (pumpStart + maxPumpDuration);
      }

      do {
         var drip = buffer.substr(0, maxDripSizeChars);
         
         buffer = buffer.substr(maxDripSizeChars);

         emitOutput(drip);

      } while( buffer && withinPumpTime() );
      
      if( buffer )
         scheduleNext();
      else
         scheduledTimeout = undefined;
   }
   
   onInput(function( dataIn ){
      
      buffer = buffer + dataIn;

      if( !scheduledTimeout ) {
         
         // We want to put out right away, in this frame if nothing
         // is already scheduled. This avoids the delay of needing
         // a new frame.
         dripSomeContentThrough();
      }
         
   });
   
   // TODO: aborting - drop all buffered input and cancel timeouts
   
   // TODO: end of data event propagation
   
}


