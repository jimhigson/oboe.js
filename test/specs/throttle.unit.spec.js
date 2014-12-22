ddescribe('data throttle', function() {

   var time;

   beforeEach(function(){
      time = sinon.useFakeTimers(500);
   });
   
   afterEach(function(){
      time.restore();
      time = undefined;
   });

   describe('forwards short input while the time is within budget', function() {
      
      var inputFromHttp = singleEventPubSub('data');
      var throttledOutput = fakePubSub(['data']);
      
      
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

         time.tick(maxPumpDuration - 1); 

         inputFromHttp.emit('second drip');
         
         expect( throttledOutput )
            .toHaveOutputEvents(
               {type: 'data', args: ['first drip']}
            ,  {type: 'data', args: ['second drip']}
            );
      });
      
      it("doesn't propagate immediately once time budget is spent", function() {
         
         time.tick(1);

         // more input should not propagate yet, we have taken too long
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
