ddescribe('data throttle', function() {

   var clock;

   beforeEach(function(){
      clock = sinon.useFakeTimers();
   });
   
   afterEach(function(){
      clock.restore();
      clock = undefined;
   });

   describe('forwards short input while the time is within budget', function() {
      
      var inputFromHttp = singleEventPubSub('data');
      var throttledOutput = fakePubSub(['data']);
      var datacallbackDuration = 0;

      throttledOutput('data').onEmit(function () {
         clock.now += datacallbackDuration;
      });
      
      throttle(inputFromHttp.on, throttledOutput('data').emit);

      it('single, short, timely input', function() {

         inputFromHttp.emit('first drip');

         // note: time doesn't tick here - passing through the
         // throttle is in the same frame

         expect( throttledOutput )
            .toHaveOutputEvents(
               {type: 'data', args: ['first drip']}
         );
      });
      
      it('fires straight through within the allowed time', function() {

         clock.tick(maxPumpDuration - 1); 

         inputFromHttp.emit('second drip');
         
         expect( throttledOutput )
            .toHaveOutputEvents(
               {type: 'data', args: ['first drip']}
            ,  {type: 'data', args: ['second drip']}
            );
      });
      
      it("doesn't propagate immediately after time budget is spent", function() {

         console.log('time is now', clock.now);
         
         clock.tick(1);

         // more input should not propagate yet, we have taken too long
         // This doesn't really work. Time should be incremented from INSIDE the
         // callback.
         // Would calling .tick from inside there do the job? Probably not, since
         // we wouldn't expect the event bus listener to call the setTimeout
         // callback.
         //
         // Unclear how to mock timers for this.
         //    Need to be able to:
         //    Advance Date.now() from inside the callback (simulating it taking some time to complete)
         //    Seperately, make callbacks happen
         //
         // Looks like can't increment clock.now directly, or timeouts jumped over
         // will not fire
         // timeouts have property at this.timeouts[id].callAt which must be between
         // the old clock.now and the clock.tick(¬increment) 
         
         
         console.log('time is now', clock.now);
         
         inputFromHttp.emit('third drip');

         expect( throttledOutput )
            .toHaveFiredEventNames('data', 'data');
      });
   });

   xit('splits up long input', function() {

      var inputEvent = singleEventPubSub('data');
      var outputBus = fakePubSub(['data']);
      
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
                        
            return JSON.stringify(expectedEvents) == JSON.stringify(actualEvents);
         }),
         
         toHaveFiredEventNames: varArgs(function( expectedEventNames ){
            var actualBus = this.actual;
            var actualEventNames = actualBus.events.map(function(event){
               return event.type;
            });

            this.message = function() {
               return 'expected event names ' +
                  expectedEventNames.join() +
                  ' to equal ' +
                  actualEventNames.join();
            };

            return JSON.stringify(actualEventNames) == JSON.stringify(expectedEventNames);
         })
      });
   });

});
