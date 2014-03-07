describe('interDimensionalPortal unit', function(){

   var environment = [
      function head(o){return o[0]},
      function tail(o){return o[1]},
      apply, 
      applyEach, 
      cons, 
      varArgs, 
      singleEventPubSub, 
      pubSub
   ];
   
   it('can be used for a calc server using elements from Oboe.js internal environment', function(){
      
      function fibServer( eventEmitter, serverParams ) {

         function fib(n) {
            return n < 2 ? n : fib(n - 1) + fib(n - 2);
         }

         eventEmitter.on('start-calculation', function(n){

            var answer = fib(n); // takes ~1s to calculate by recursion

            eventEmitter.emit('calculation-done', answer)
         });
      }

      var bus = pubSub(),
          done = sinon.stub();

      interDimensionalPortal(environment, fibServer, [], bus, ['start-calculation'], ['calculation-done'] );

      bus.emit('start-calculation', 39);
      bus.on('calculation-done', done);

      waitsFor(function(){return done.called}, 'calculation to come back', 3000);

      runs( function(){
         var resultGiven = done.firstCall.args[0];
         expect(resultGiven).toBe(63245986); // trust me on this one
      })
   });

   it('can pass startup parameters to child thread', function(){

      function additionServer( eventEmitter, params ) {
         var startNumber = params[0];

         eventEmitter.on('start-calculation', function(n){

            var answer = startNumber + n; // takes ~1s to calculate by recursion

            eventEmitter.emit('calculation-done', answer)
         });
      }

      var bus = pubSub(),
          done = sinon.stub();

      interDimensionalPortal(environment, additionServer, [4], bus, ['start-calculation'], ['calculation-done'] );

      bus.emit('start-calculation', 2);
      bus.on('calculation-done', done);

      waitsFor(function(){return done.called}, 'calculation to come back', 3000);

      runs( function(){
         var resultGiven = done.firstCall.args[0];
         expect(resultGiven).toBe(6); // 4 + 2 = 6 
      })
   });   

});
