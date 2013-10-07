
describe("oboe performance (real http)", function(){
   
   it('is benchmarked', function() {
      var startTime = now();
      var doneFn = jasmine.createSpy('done');
      var callCount = 0;
   
      oboe('/testServer/static/json/oneHundredRecords.json')
         .node('!.$result..{age name company}', function(){callCount++})
         .done( doneFn );
          
      waitsFor( function(){ return doneFn.calls.length == 1 }, 'the request to complete', ASYNC_TEST_TIMEOUT )
      
      runs( function(){
         expect(callCount).toBe(100);
         console.log('took ' + (now() - startTime) + 'ms to evaluate a complex ' +
            'expression 100 times');  
      });                
   })
   
   
   
   function now() {
      return new Date().valueOf()   
   }        
});  



