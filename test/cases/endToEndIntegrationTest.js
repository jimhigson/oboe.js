
/* This test case is similar to oboeTest but it makes actual ajax calls instead of relying on the test
   feeding json strings into oboe.
   
   This makes it more complicated because it has to be an asynchronous test. However, it does test end-to-end
   which could pick up integration issues.
   
   It is a smoke test, not an exhaustive exercise of the APIs. That is left to other tests.
 */

(function(){

   AsyncTestCase("endToEndIntegrationTest", {
   
      // shorten the waiting time before a test fails. Default 30s is too long:
      setUp: function(){
         jstestdriver.plugins.async.CallbackPool.TIMEOUT = 1000; //1 second
      }
      
   ,  testGetsJsonPathCallbacksBeforeRequestFinishes: function( queue ) {
      
         var asserter;
   
         queue.call("request the numbers json", function(jstdCallbacks){
         
            asserter = givenAParser()
               .andWeAreListeningForThingsFoundAtPattern('![*]')
               .whenFinishedFetching(
                  'firstTenNaturalNumbers.json',  syncingWith(jstdCallbacks)                  
               );         
         });

         queue.call("should have gotten all the numbers", function( _queue ){
                  
            asserter.thenTheParser(
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
      }
      
   ,  testGetsJsonPathCallbacksBeforeRequestFinishesWhenStartedViaOboeFetch: function( queue ) {
         // the above test uses oboe.parser().fetch(), whereas this one uses oboe.fetch()
         // otherwise they are the same.
      
         var asserter;
   
         queue.call("request the numbers json", function(jstdCallbacks){
         
            asserter = givenAParserFetching('firstTenNaturalNumbers.json', syncingWith(jstdCallbacks))
               .andWeAreListeningForThingsFoundAtPattern('![*]');         
         });

         queue.call("should have gotten all the numbers", function( _queue ){
                  
            asserter.thenTheParser(
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
      }      
      
   ,  testProvidesFullJsonWhenRequestFinishes: function( queue ) {
            
         queue.call("request the numbers json", function(jstdCallbacks){
                  
            givenAParser()
               .whenFinishedFetching(               
                  'firstTenNaturalNumbers.json',
                  syncingWith(jstdCallbacks),
                  function ajaxFinished(wholeJsonFromOboe) {
                                       
                     assertEquals([0,1,2,3,4,5,6,7,8,9], wholeJsonFromOboe);
                  }
               );         
         });         
      }
        
   });  

   // identity function to make some tests more readable
   function syncingWith(a){return a}

})();
