
describe("oboe integration (real http)", function(){

   it('gets all expected callbacks by time request finishes',  function() {
       
      var asserter = givenAnOboeInstance('/stream/tenSlowNumbers')
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
       
      var asserter = givenAnOboeInstance('/stream/tenSlowNumbers')
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
       
      var asserter = givenAnOboeInstance('/static/json/firstTenNaturalNumbers.json')
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
   
   it('gives full json to callback when request finishes',  function( queue ) {
            
      var fullResponse = null;            
                           
      oboe.doGet(                      
         '/static/json/firstTenNaturalNumbers.json',
         
         function ajaxFinished(obj) {                              
            fullResponse = obj;               
         }
      );   
      
      waitsFor( function(){ return !!fullResponse }, 'the request to complete', ASYNC_TEST_TIMEOUT )
      
      runs( function(){
         expect(fullResponse).toEqual([0,1,2,3,4,5,6,7,8,9])
      });      
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



