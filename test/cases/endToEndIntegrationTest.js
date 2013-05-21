
/* This test case is similar to oboeTest but it makes actual ajax calls instead of relying on the test
   feeding json strings into oboe.
   
   This makes it more complicated because it has to be an asynchronous test. However, it does test end-to-end
   which could pick up integration issues.
   
   It is a smoke test, not an exhaustive exercise of the APIs. That is left to other tests.
 */

(function(){

   AsyncTestCase("endToEndIntegrationTest", {
      
      testGetsJsonPathCallbacksBeforeRequestFinishes: function( queue ) {
      
         var asserter = givenAParser();
   
         queue.call("request the numbers json", function(callbacks){
         
            asserter
               .andWeAreListeningForThingsFoundAtPattern('![*]')
               .whenFinishedFetching(
                  'firstTenNaturalNumbers.json', 
                  callbacks
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
      
   ,  testProvidesFullJsonWhenRequestFinishes: function( queue ) {
            
         queue.call("request the numbers json", function(callbacks){
                  
            givenAParser()
               .whenFinishedFetching(               
                  'firstTenNaturalNumbers.json',
                  callbacks,
                  function ajaxFinished(wholeJsonFromOboe) {
                                       
                     assertEquals([0,1,2,3,4,5,6,7,8,9], wholeJsonFromOboe);
                  }
               );         
         });         
      }
   })   

})();
