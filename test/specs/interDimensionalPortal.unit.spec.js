describe('interDimensionalPortal', function(){

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
   
   it('can be used as a calc server using Oboe.js internal environment', function(){
      
      function childServer( eventEmitter ) {

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

      portal(environment, childServer, bus, ['start-calculation'], ['calculation-done'] );

      bus.emit('start-calculation', 39);
      bus.on('calculation-done', done);

      waitsFor(function(){return done.called}, 'calculation to come back', 3000);

      runs( function(){
         var resultGiven = done.firstCall.args[0];
         expect(resultGiven).toBe(63245986); // trust me on this one
      })
   });

});
