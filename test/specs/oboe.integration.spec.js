
describe("oboe integration (real http)", function(){

   it('gets all expected callbacks by time request finishes',  function() {
       
      var asserter = givenAnOboeInstance('/testServer/tenSlowNumbers')
         .andWeAreListeningForNodes('![*]');         
      
      waitsFor( asserter.toComplete(), 'the request to complete', ASYNC_TEST_TIMEOUT);

      runs(function(){
               
         asserter.thenTheInstance(
             matched(0).atPath([0])
         ,   matched(1).atPath([1])
         ,   matched(2).atPath([2])
         ,   matched(3).atPath([3])
         ,   matched(4).atPath([4])
         ,   matched(5).atPath([5])
         ,   matched(6).atPath([6])
         ,   matched(7).atPath([7])
         ,   matched(8).atPath([8])
         ,   matched(9).atPath([9])
         );        
      });
   })
   
   it('can abort once some data has been found in streamed response',  function() {
       
      var aborted = false; 
       
      var asserter = givenAnOboeInstance('/testServer/tenSlowNumbers')
         .andWeAreListeningForNodes('![5]', function(){
             asserter.andWeAbortTheRequest();
             aborted = true;
          });         
      
      waitsFor( function(){return aborted}, 'the request to be aborted', ASYNC_TEST_TIMEOUT);
      
      // in case we didn't abort, wait a little longer. If we didn't really abort we'd get the
      // rest of the data now and the test would fail:
      waitsFor( someSecondsToPass(3), ASYNC_TEST_TIMEOUT);      

      runs( function(){
         asserter.thenTheInstance(
            // because the request was aborted on index array 5, we got 6 numbers (inc zero)
            // not the whole ten.
            hasRootJson([0,1,2,3,4,5])
         );
      });
   })
   
   it('can abort once some data has been found in not very streamed response',  function() {
       
      // like above but we're getting a static file not the streamed numbers. This means
      // we'll almost certainly read in the whole response as one onprogress it is on localhost
      // and the json is very small 

      var aborted = false; 
       
      var asserter = givenAnOboeInstance('/testServer/static/json/firstTenNaturalNumbers.json')
         .andWeAreListeningForNodes('![5]', function(){
             asserter.andWeAbortTheRequest();
             aborted = true;
          });         
      
      waitsFor( function(){return aborted}, 'the request to be aborted', ASYNC_TEST_TIMEOUT);
      
      // in case we didn't abort, wait a little longer. If we didn't really abort we'd get the
      // rest of the data now and the test would fail:
      waitsFor( someSecondsToPass(1), ASYNC_TEST_TIMEOUT);      

      runs( function(){
         asserter.thenTheInstance(
            // because the request was aborted on index array 5, we got 6 numbers (inc zero)
            // not the whole ten.
            hasRootJson([0,1,2,3,4,5])
         );
      });
   })      
   
   it('gives full json to callback when request finishes',  function() {
                  
      var fullResponse = null;
      function whenDoneFn(obj) {                              
         fullResponse = obj;               
      }                  
                           
      oboe.doGet( '/testServer/static/json/firstTenNaturalNumbers.json')
         .done(whenDoneFn);   
      
      waitsFor( function(){ return !!fullResponse }, 'the request to complete', ASYNC_TEST_TIMEOUT )
      
      runs( function(){
         expect(fullResponse).toEqual([0,1,2,3,4,5,6,7,8,9])
      });      
   })
   
   it('gives header to server side',  function() {

      var countGotBack = 0;

      oboe(                      
         {  url: '/testServer/echoBackHeaders',
            headers: {'x-snarfu':'SNARF', 'x-foo':'BAR'}
         }

      ).node( 'x-snarfu', function( headerValue ){
       
         expect( headerValue ).toBe( 'SNARF' )
         countGotBack++;
         
      }).node( 'x-foo', function( headerValue ){
       
         expect( headerValue ).toBe( 'BAR' )
         countGotBack++;
      })         
      
      waitsFor( function(){ return countGotBack == 2 }, 'the request to complete', ASYNC_TEST_TIMEOUT )            
   })
   
   it('is benchmarked', function() {
      var startTime = new Date().valueOf();
      var doneFn = jasmine.createSpy('done');
      var callCount = 0;
   
      oboe('/testServer/static/json/oneHundredRecords.json')
         .node('!.$result..{age name company}', function(){callCount++})
         .done( doneFn );
          
      waitsFor( function(){ return doneFn.calls.length == 1 }, 'the request to complete', ASYNC_TEST_TIMEOUT )
      
      runs( function(){
         expect(callCount).toBe(100);
         console.log('took ' + ((new Date().valueOf()) - startTime) + 'ms to evaluate a complex ' +
            'expression 100 times');  
      });                
   })
   
   it('can listen for nodes via nodejs-style syntax',  function() {

      var countGotBack = 0;

      oboe(
         '/testServer/static/json/firstTenNaturalNumbers.json'
      ).on('node', '!.*', function( number ){
         countGotBack++;          
      });         
      
      waitsFor( function(){ return countGotBack == 10 }, 'ten callbacks', ASYNC_TEST_TIMEOUT )            
   })
   
   it('can listen for paths via nodejs-style syntax',  function() {

      var countGotBack = 0;

      oboe(
         '/testServer/static/json/firstTenNaturalNumbers.json'
      ).on('path', '!.*', function( number ){
         countGotBack++;          
      });         
      
      waitsFor( function(){ return countGotBack == 10 }, 'ten callbacks', ASYNC_TEST_TIMEOUT )            
   })      
   
   it('fires error on 404',  function() {

      var gotError = false

      oboe('/testServer/doesNotExist'
      ).fail(function(){
      
         gotError = true
      });
      
      waitsFor( function(){ return gotError }, 'the request to fail', ASYNC_TEST_TIMEOUT )            
   })   
      
   function someSecondsToPass(waitSecs) {
      
      function now(){
         // IE8 doesn't have Date.now() 
         return new Date().getTime();
      }
      
      var waitStart = now(),
          waitMs = waitSecs * 1000;
      
      return function(){
         return now() > (waitStart + waitMs); 
      }
   }
     
});  



