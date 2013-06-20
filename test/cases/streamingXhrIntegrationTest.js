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
            streamingXhr(
               'GET', '/test/test/json/smallestPossible.json', 
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
            streamingXhr(
               'GET', '/test/test/json/twentyThousandRecords.json',
                
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
      
      testCanAjaxInAStreamingFileWithoutMissingAny: function(queue) {
      
         var combinedResult = '';
      
         queue.call("ask the streaming xhr to fetch", function(callbacks){

            // since this is a large file, even serving locally we're going to get multiple callbacks:       
            streamingXhr(
               'GET', cacheBustUrl('/stream/tenSlowNumbers'),
                
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
            try{
               var parsedResult = JSON.parse(combinedResult);
            } catch(e) {
               fail('could not parse json "' + combinedResult + '" because ' + e
                   + ' this might happen if the browsers are connecting directly' 
                   + ' to jstd instead of through the proxy'
                   );
            }
            
            // as per the name, should have 20,000 records in that file:                     
            assertEquals([0,1,2,3,4,5,6,7,8,9], parsedResult);
         });      
      },      
      
      testDoesntCallbackWithoutNewData: function(queue) {
            
         queue.call("ask the streaming xhr to fetch", function(callbacks){

            // since this is a large file, even serving locally we're going to get multiple callbacks:       
            streamingXhr(
               'GET', '/test/test/json/twentyThousandRecords.json',
                
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
      
      testAjaxingOverStreamingHttpGivesMultipleCallbacks: function(queue) {
            
         var numberOfProgressCallbacks = 0;
      
         queue.call("ask the streaming xhr to fetch", function(callbacks){
         
            // since this is a large file, even serving locally we're going to get multiple callbacks:       
            streamingXhr(
               'GET', cacheBustUrl('/stream/tenSlowNumbers'),
                
               function onProgress(){ 
                  numberOfProgressCallbacks++; 
               },
               
               // callback for when the stream is complete. we register this just so that jstd knows
               // when to move onto the next queuer            
               callbacks.noop()
            )                     
         });

         queue.call("check we got multiple callbacks", function(){
                                   
            // realistically, should have had 10 or 20, but this isn't deterministic so
            // 3 is enough to indicate the results didn't all arrive in one big blob.                                               
            if( numberOfProgressCallbacks < 3)(
               fail("I had " + numberOfProgressCallbacks + " progress callback(s), should have" +
                   " had at least 3. If this doesn't test the browser's XHR might not support" +
                   " reading partial responses. Unfortunately this is inevitable in IE less than" +
                   " version 10.")                
            );
         });      
      }            
   });
   
   function cacheBustUrl(url) {
      var now = Date.now? Date.now() : new Date().valueOf();
   
      return url + '/cacheBusted/' + now + '.txt';
   }

})();