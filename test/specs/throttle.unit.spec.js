describe('data throttle', function() {

   it('forwards short input while the time is within budget', function() {
      
      var inputEvent = singleEventPubSub('data');
      var outputBus = fakePubSub(['data']);
      var time = sinon.useFakeTimers(500);
      
      throttle(inputEvent.on, outputBus('data').emit);
      
      inputEvent.fire('text 1');

      time.tick(15);
      
      inputEvent.fire('text 2');
      
      time.tick(1);

      inputEvent.fire('text 3'); // should not fire yet, we have taken too long
      
      expect( outputBus.events ).toBe([
         {type: 'data', args: ['text1']}
      ,  {type: 'data', args: ['text2']}
      ]);
   });

   it('splits up long input', function() {

      var inputEvent = singleEventPubSub('data');
      var outputBus = fakePubSub(['data']);
      var time = sinon.useFakeTimers(500);
      //                  .         .         .         .         .         .         .         .         .         .
      var hundredChars = '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890';
      var twoHundredChars = hundredChars + hundredChars;

      throttle(inputEvent.on, outputBus('data').emit);

      inputEvent.fire(twoHundredChars);

      expect( outputBus.events ).toBe([
            {type: 'data', args: [hundredChars]}
      ]);
   });   

});
