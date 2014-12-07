describe('data throttle', function() {

   describe('forwards short input while the time is within budget', function() {
      
      var inputFromHttp = singleEventPubSub('data');
      var throttledOutput = fakePubSub(['data']);
      var time = sinon.useFakeTimers(500);
      
      throttle(inputFromHttp.on, throttledOutput('data').emit);
      
      it('fires straight through within the allowed time', function() {
         
         inputFromHttp.emit('text 1');

         time.tick(maxPumpDuration - 1); 

         inputFromHttp.emit('text 2');
         
         expect( throttledOutput ).toHaveOutputEvents(
            {type: 'data', args: ['text 1']}
         ,  {type: 'data', args: ['text 2']}
         );
      });
      
      xit( "doesn't propagate immediately once time budget is spent", function() {
         
         time.tick(1);

         // more input should not propagate yet, we have taken too long
         inputFromHttp.emit('text 3');

         expect( throttledOutput.events.length ).toBe(2);
      });
      
   });

   xit('splits up long input', function() {

      var inputEvent = singleEventPubSub('data');
      var outputBus = fakePubSub(['data']);
      var time = sinon.useFakeTimers(500);
      //                  .         .         .         .         .         .         .         .         .         .
      var hundredChars = '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890';
      var twoHundredChars = hundredChars + hundredChars;

      throttle(inputEvent.on, outputBus('data').emit);

      inputEvent.emit(twoHundredChars);
       
      expect( outputBus.events ).toBe([
            {type: 'data', args: [hundredChars]}
      ]);
   });
   
   
   beforeEach(function () {
      this.addMatchers({
         toHaveOutputEvents: varArgs(function( expectedEvents ){
            var actualBus = this.actual;
            var actualEvents = actualBus.events;
            
            this.message = function() {
               return 'expected events ' +
                  JSON.stringify(expectedEvents) +
                  ' to equal ' +
                  JSON.stringify(actualEvents);
            };
            
            console.log(JSON.stringify(expectedEvents) == JSON.stringify(actualEvents));
            
            return JSON.stringify(expectedEvents) == JSON.stringify(actualEvents);
         })
      });
   });

});
