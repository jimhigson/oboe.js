/* Tests the streaming xhr without stubbing anything. Really just a test that 
*  we've got the interface of the in-browser XHR object pinned down  */

(function(){

   AsyncTestCase("testStreamingXhr", {

      // shorten the waiting time before a test fails. Default 30s is too long:
      setUp: function(){
         jstestdriver.plugins.async.CallbackPool.TIMEOUT = ASYNC_TEST_TIMEOUT;
      },
   
      testCanAjaxInASmallKnownFile: function(queue) {
      
         var combinedResult = '';
      
         queue.call("ask the streaming xhr to fetch", function(callbacks){

            // in practice, since we're running on an internal network and this is a small file,
            // we'll probably only get one callback         
            streamingXhr.fetch(
               '/test/test/json/smallestPossible.json', 
               callbacks.add(function(nextDrip){
                  combinedResult += nextDrip;                                                                                     
               })
            );            
         });

         queue.call("check we got the json back", function(){
            assertEquals('{}', combinedResult);
         });      
      },
      
      testCanAjaxInAVeryLargeFileWithoutMissingAny: function(queue) {
      
         var combinedResult = '';
      
         queue.call("ask the streaming xhr to fetch", function(callbacks){

            // since this is a large file, even serving locally we're going to get multiple callbacks:       
            streamingXhr.fetch(
               '/test/test/json/twentyThousandRecords.json',
                
               function(nextDrip){            
                  combinedResult += nextDrip;                                                                                     
               },
               
               // callback for when the stream is complete. we register this just so that jstd knows
               // when to move onto the next queuer            
               callbacks.noop()
            )         
         });

         queue.call("check we got the correct json back", function(){
         
            // should have given valid json;
            var parsedResult = JSON.parse(combinedResult);
            
            // as per the name, should have 20,000 records in that file:                     
            assertEquals(20000, parsedResult.result.length);
         });      
      },
      
      testDoesntCallbackWithoutNewData: function(queue) {
            
         queue.call("ask the streaming xhr to fetch", function(callbacks){

            // since this is a large file, even serving locally we're going to get multiple callbacks:       
            streamingXhr.fetch(
               '/test/test/json/twentyThousandRecords.json',
                
               function(nextDrip){            
                  if( nextDrip.length === 0 ) {
                     fail('zero-length drip received');
                  }                                                                                     
               },
               
               // callback for when the stream is complete. we register this just so that jstd knows
               // we're done
               callbacks.noop()
            )         
         });
      
      },      
      
      testAjaxingInAVeryLargeFileGivesMoreThanOneCallback: function(queue) {
      
         var numberOfProgressCallbacks = 0;
      
         queue.call("ask the streaming xhr to fetch", function(callbacks){
         
            // since this is a large file, even serving locally we're going to get multiple callbacks:       
            streamingXhr.fetch(
               '/test/test/json/twentyThousandRecords.json',
                
               function onProgress(){ numberOfProgressCallbacks++; },
               
               // callback for when the stream is complete. we register this just so that jstd knows
               // when to move onto the next queuer            
               callbacks.noop()
            )                     
         });

         queue.call("check we got multiple callbacks", function(){
                                        
            if( numberOfProgressCallbacks < 2)(
               fail("I had " + numberOfProgressCallbacks + " progress callback(s), should have" +
                   " had multiple")                
            );
         });      
      }            
   });
   

})();