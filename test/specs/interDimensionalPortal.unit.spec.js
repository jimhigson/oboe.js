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

            eventEmitter.emit('calculation-done', {n:n, 'fib(n)': answer});
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
         expect(resultGiven).toEqual({n:39, 'fib(n)':63245986}); // trust me on this one
      })
   });

   it('can field multiple events', function(){

      function fibServer( eventEmitter, serverParams ) {

         function fib(n) {
            return n < 2 ? n : fib(n - 1) + fib(n - 2);
         }

         eventEmitter.on('start-calculation', function(n){

            var answer = fib(n); // takes ~1s to calculate by recursion

            eventEmitter.emit('calculation-done', {n:n, 'fib(n)': answer});
         });
      }

      var bus = pubSub(),
          results = {},
          done = sinon.spy(function(result){ 
             results[result.n] = result['fib(n)']; 
          });

      interDimensionalPortal(environment, fibServer, [], bus, ['start-calculation'], ['calculation-done'] );

      bus.emit('start-calculation', 38);
      bus.emit('start-calculation', 39);
      bus.on('calculation-done', done);

      waitsFor(function(){return done.callCount ==2}, 'calculation to come back twice', 3000);

      runs( function(){
         expect(results).toEqual({
            '38':39088169,
            '39':63245986
         });
      })
   });   

   it('can pass startup parameters to child thread', function(){

      function additionServer( eventEmitter, startNumber ) {

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

   it('can accept multiple arguments', function(){

      function sillyStringServer( eventEmitter, start, end ) {

         eventEmitter.on('start', function(input){

            eventEmitter.emit('done', start + input + end);
         });
      }

      var bus = pubSub(),
         done = sinon.stub();

      interDimensionalPortal(environment, sillyStringServer, ['Hello ', '!'], bus, ['start'], ['done'] );

      bus.emit('start', 'Robby');
      bus.on('done', done);

      waitsFor(function(){return done.called}, 'calculation to come back', 3000);

      runs( function(){
         var resultGiven = done.firstCall.args[0];
         expect(resultGiven).toBe('Hello Robby!');
      })
   });
   
   it('can accept non-scalar arguments', function(){

      function sillyStringServer( eventEmitter, config ) {

         eventEmitter.on('start', function(input){

            eventEmitter.emit('done', config.start + input + config.end);
         });
      }

      var bus = pubSub(),
         done = sinon.stub();

      interDimensionalPortal(environment, sillyStringServer, [{start:'Hello ', end:'!'}], bus, ['start'], ['done'] );

      bus.emit('start', 'Robby');
      bus.on('done', done);

      waitsFor(function(){return done.called}, 'calculation to come back', 3000);

      runs( function(){
         var resultGiven = done.firstCall.args[0];
         expect(resultGiven).toBe('Hello Robby!'); 
      })
   });   

});
