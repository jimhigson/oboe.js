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

   function calcServer( eventEmitter ) {

      function fib(n) {
         return n < 2 ? n : fib(n - 1) + fib(n - 2);
      }

      function fact(n) {
         return n < 2 ? 1 : n * fact(n-1);
      }      

      eventEmitter.on('start-fib', function(n){

         eventEmitter.emit('fib-started', {n:n});
         
         var answer = fib(n); // takes ~1s to calculate by recursion for n = 39 on a 2012 Macbook Air

         eventEmitter.emit('fib-done', {n:n, 'fib(n)': answer});
      });

      eventEmitter.on('start-factoral', function(n){

         eventEmitter.emit('factoral-started', {n:n});

         var answer = fact(n);

         eventEmitter.emit('factoral-done', {n:n, 'n!': answer});
      });      
   }
   
   
   it('can be used for a calc server', function(){
      
      var childProgram = interDimensionalPortal(environment, calcServer, ['start-fib'], ['fib-done']),
          bus = pubSub(),
          done = sinon.stub();

      childProgram(bus);

      bus.emit('start-fib', 39);
      bus.on('fib-done', done);

      waitsFor(function(){return done.called}, 'calculation to come back', 5000);

      runs( function(){
         var resultGiven = done.firstCall.args[0];
         expect(resultGiven).toEqual({n:39, 'fib(n)':63245986}); // trust me on this one
      })
   });

   it('can send several events of same type', function(){

      var childProgram = interDimensionalPortal(environment, calcServer, ['start-fib'], ['fib-done']),
          bus = pubSub(),
          results = {};

      childProgram(bus);
      
      bus.emit('start-fib', 12);
      bus.emit('start-fib', 13);
      bus.emit('start-fib', 14);
      bus.on('fib-done', function done(result){
         results[result.n] = result['fib(n)'];
      });

      function gotAll(){
         return results[12] && results[13] && results[14]
      }

      waitsFor(gotAll, 'all calculations to come back', 3000);

      runs( function(){
         expect(results).toEqual({
            '12':144,
            '13':233,
            '14':377
         });
      })
   });

   it('can send events of multiple types in both directions', function(){

      var childProgram = interDimensionalPortal(
            environment, calcServer,
            ['start-fib', 'start-factoral'],
            ['fib-started', 'factoral-started', 'fib-done', 'factoral-done']
         ),
         bus = pubSub(),
         attemptedFib = {},
         fibResults = {},
         attemptedFact = {},
         factResults = {};

      bus.on('fib-started', function (result){
         attemptedFib[result.n] = true;
      });
      bus.on('fib-done', function (result){
         fibResults[result.n] = result['fib(n)'];
      });
      bus.on('factoral-started', function (result){
         attemptedFact[result.n] = true;
      });
      bus.on('factoral-done', function (result){
         factResults[result.n] = result['n!'];
      });

      childProgram(bus);
      
      bus.emit('start-fib', 12);
      bus.emit('start-fib', 13);
      bus.emit('start-fib', 14);
      bus.emit('start-factoral', 5);
      bus.emit('start-factoral', 6);

      function gotAll(){
         return attemptedFib[12] && attemptedFib[13] && attemptedFib[14] 
             && fibResults[12] && fibResults[13] && fibResults[14]
             && attemptedFact[5] && attemptedFact[6]
             && factResults[5] && factResults[6]
      }

      waitsFor(gotAll, 'all calculations to come back', 3000);

      runs( function(){
         expect(attemptedFib).toEqual({
            '12':true,
            '13':true,
            '14':true
         });         
         expect(fibResults).toEqual({
            '12':144,
            '13':233,
            '14':377
         });
         expect(attemptedFact).toEqual({
            '5':true,
            '6':true
         });
         expect(factResults).toEqual({
            '5':120,
            '6':720
         });
      })
   });   

   describe('parametrised program', function(){

      function additionServer( eventEmitter, a ) {

         eventEmitter.on('start-fib', function(b){

            var answer = a + b; // takes ~1s to calculate by recursion

            eventEmitter.emit('fib-done', {a:a, b:b, 'a+b':answer});
         });
      }

      var childProgram = interDimensionalPortal(environment, additionServer, ['start-fib'], ['fib-done']);      
      
      it('can pass startup parameters to child thread', function(){
   
         var bus = pubSub(),
             done = sinon.stub();
   
         childProgram(bus, 4);
   
         bus.emit('start-fib', 2);
         bus.on('fib-done', done);
   
         waitsFor(function(){return done.called}, 'calculation to come back', 3000);
   
         runs( function(){
            var resultGiven = done.firstCall.args[0];
            expect(resultGiven).toEqual({a:4, b:2, 'a+b':6}); 
         })
      });
   });

   it('can accept multiple arguments', function(){

      function multipleArgumentSillyStringServer( eventEmitter, start, end ) {

         eventEmitter.on('start', function(input){

            eventEmitter.emit('done', start + input + end);
         });
      }

      var childProgram = interDimensionalPortal(environment, multipleArgumentSillyStringServer, ['start'], ['done']),
          bus = pubSub(),
          done = sinon.stub();

      childProgram(bus, 'Hello ', '!');

      bus.emit('start', 'Robby');
      bus.on('done', done);

      waitsFor(function(){return done.called}, 'calculation to come back', 3000);

      runs( function(){
         var resultGiven = done.firstCall.args[0];
         expect(resultGiven).toBe('Hello Robby!');
      })
   });
   
   it('can accept non-scalar arguments', function(){

      function nonScalarSillyStringServer( eventEmitter, config ) {

         eventEmitter.on('start', function(input){

            eventEmitter.emit('done', config.start + input + config.end);
         });
      }

      var childProgram = interDimensionalPortal(environment, nonScalarSillyStringServer, ['start'], ['done']),
          bus = pubSub(),
          done = sinon.stub();

      childProgram(bus, {start:'Hello ', end:'!'});

      bus.emit('start', 'Robby');
      bus.on('done', done);

      waitsFor(function(){return done.called}, 'calculation to come back', 3000);

      runs( function(){
         var resultGiven = done.firstCall.args[0];
         expect(resultGiven).toBe('Hello Robby!'); 
      })
   });   

});
