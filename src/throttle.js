
var 
    maxDripSizeChars = 100,
    maxPumpDuration = 16;

/**
 * @param {Function} onInput
 * @param {Function} emitOutput
 */
function throttle(onInput, emitOutput) {
   
   var buffer = '',
       alreadyRunThisFrame = false,
       scheduledTimeout;
      
   function scheduleNext() {

      console.log('scheduling a new frame');

      scheduledTimeout = window.setTimeout(function() {
         alreadyRunThisFrame = true;
         dripSomeContentThrough();
      }, 0);
   }
   
   function dripSomeContentThrough() {

      var pumpStart = Date.now();

      function timeLeft() {
         return Date.now() < (pumpStart + maxPumpDuration);         
      }

      do {
         var drip = buffer.substr(0, maxDripSizeChars);
         
         buffer = buffer.substr(maxDripSizeChars);

         emitOutput(drip);

      } while( buffer && timeLeft() );
      
      if( buffer )
         scheduleNext();
      else
         scheduledTimeout = undefined;
   }
   
   onInput(function( dataIn ){
      
      console.log('got some data', dataIn);
      
      buffer = buffer + dataIn;
      
      console.log('buffer is now', buffer);
      console.log('timeout exists?', !!scheduledTimeout);

      if( !scheduledTimeout ) {
         
         // We want to put out right away, in this frame if nothing
         // is already scheduled. This avoids the delay of needing
         // a new frame.
         dripSomeContentThrough();
      }
         
   });

   // TODO: use high-res timers
   
   // TODO: aborting - drop all buffered input and cancel timeouts
   
   // TODO: end of data event propagation
   
   // TODO: no window in window.setTimeout ?
   
}


