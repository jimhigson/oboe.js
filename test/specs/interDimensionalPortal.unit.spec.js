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

   describe('can be used to perform slow calculations', function() {
   
      function calcServer( bus ) {
   
         function fib(n) {
            return n < 2 ? n : fib(n - 1) + fib(n - 2);
         }
   
         function fact(n) {
            return n < 2 ? 1 : n * fact(n-1);
         }      
   
         bus.on('start-fib', function(n){
   
            bus.emit('fib-started', {n:n});
            
            var answer = fib(n); // takes ~1s to calculate by recursion for n = 39 on a 2012 Macbook Air
   
            bus.emit('fib-done', {n:n, 'fib(n)': answer});
         });
   
         bus.on('start-factoral', function(n){
   
            bus.emit('factoral-started', {n:n});
   
            var answer = fact(n);
   
            bus.emit('factoral-done', {n:n, 'n!': answer});
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
   });

   describe('parametrised program', function(){

      function additionEngine( eventEmitter, a ) {

         eventEmitter.on('do-add', function(b){

            var answer = a + b; // takes ~1s to calculate by recursion

            eventEmitter.emit('add-done', {a:a, b:b, 'a+b':answer});
         });
      }

      var childProgram = interDimensionalPortal(environment, additionEngine, ['do-add'], ['add-done']);
      
      it('can pass startup parameters to child thread', function(){
   
         var bus = pubSub(),
             done = jasmine.createSpy();
   
         childProgram(bus, 4);
   
         bus.emit('do-add', 2);
         bus.on('add-done', done);
   
         waitsFor(function(){return done.callCount > 0}, 'calculation to come back', 3000);
   
         runs( function(){
            expect(done).toHaveBeenCalledWith({a:4, b:2, 'a+b':6}); 
         })
      });

      it('can start two instances of the same child program with the same event bus', function(){

         var bus = pubSub(),
             done = jasmine.createSpy();

         childProgram(bus, 4);
         childProgram(bus, 8);

         bus.emit('do-add', 2);
         bus.emit('do-add', 3);
         bus.on('add-done', done);

         waitsFor(function(){return done.callCount == 4}, 'calculation to come back', 3000);

         runs( function(){
            expect(done).toHaveBeenCalledWith({a:4, b:2, 'a+b':6});
            expect(done).toHaveBeenCalledWith({a:4, b:3, 'a+b':7});
            expect(done).toHaveBeenCalledWith({a:8, b:2, 'a+b':10});
            expect(done).toHaveBeenCalledWith({a:8, b:3, 'a+b':11});
         })
      });

      it('can start two instances of the same child program with different event buses', function(){

         var add4Bus = pubSub(),
             add8Bus = pubSub(),
             add4Results = jasmine.createSpy('add four program result listener'),
             add8Results = jasmine.createSpy('add eight program result listener');

         childProgram(add4Bus, 4);
         childProgram(add8Bus, 8);

         add4Bus.emit('do-add', 2);
         add8Bus.emit('do-add', 3);
         
         add4Bus.on('add-done', add4Results);
         add8Bus.on('add-done', add8Results);

         function gotResultsBack(){
            return (add4Results.callCount > 0) && 
                   (add8Results.callCount > 0);
         }
         
         waitsFor(gotResultsBack, 'calculation to come back', 3000);

         runs( function(){
            expect(add4Results).toHaveBeenCalledWith({a:4, b:2, 'a+b':6});
            expect(add8Results).toHaveBeenCalledWith({a:8, b:3, 'a+b':11});
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

      waitsFor(function(){return done.called}, 'round-trip to complete', 3000);

      runs( function(){
         var resultGiven = done.firstCall.args[0];
         expect(resultGiven).toBe('Hello Robby!'); 
      })
   });
   
   describe('echoing back various different data types without corruption', function(){
      
      function echoServer( bus ) {
         bus.on('in', function(content){
            bus.emit('out', content);
         });
      }

      it( 'works for an object', function(){

         var childProgram = interDimensionalPortal(environment, echoServer, ['in'], ['out']),
            bus = pubSub(),
            done = sinon.stub();

         childProgram(bus);

         bus.emit('in', {"a-string":"s"});
         bus.on('out', done);

         waitsFor(function(){return done.called}, 'echo to come back', 3000);
         runs( function(){
            var resultGiven = done.firstCall.args[0];
            expect(resultGiven).toEqual({"a-string":"s"});
         })

      });      
      
      it( 'works for JSON string with hyphen', function(){
      
         var childProgram = interDimensionalPortal(environment, echoServer, ['in'], ['out']),
             bus = pubSub(),
             done = sinon.stub();
   
         childProgram(bus);
         
         bus.emit('in', '{"a-string":"s"}');
         bus.on('out', done);
   
         waitsFor(function(){return done.called}, 'echo to come back', 3000);
         runs( function(){
            var resultGiven = done.firstCall.args[0];
            expect(resultGiven).toBe('{"a-string":"s"}');
         })
      });

      it( 'works for a number', function(){

         var childProgram = interDimensionalPortal(environment, echoServer, ['in'], ['out']),
            bus = pubSub(),
            done = sinon.stub();

         childProgram(bus);

         bus.emit('in', 101);
         bus.on('out', done);

         waitsFor(function(){return done.called}, 'echo to come back', 3000);
         runs( function(){
            var resultGiven = done.firstCall.args[0];
            expect(resultGiven).toEqual(101);
         })

      });      
   });

});
