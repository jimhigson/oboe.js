/* Tests the streaming xhr without stubbing anything. Really just a test that 
*  we've got the interface of the in-browser XHR object pinned down  */

(function(){

   AsyncTestCase("testStreamingXhr", {

      // shorten the waiting time before a test fails. Default 30s is too long:
      setUp: function(){
         jstestdriver.plugins.async.CallbackPool.TIMEOUT = 2000; //2seconds
      },
   
      testCanAjaxInASmallKnownFile: function(queue) {
      
         var combinedResult = '';
      
         queue.call("ask the streaming xhr to fetch", function(callbacks){

            // in practice, since we're running on an internal network and this is a small file,
            // we'll probably only get one callback         
            streamingXhr.fetch('/test/test/json/smallestPossible.json', callbacks.add(function(nextDrip){
               combinedResult += nextDrip;                                                                                     
            }));            
         });

         queue.call("check we got the json back", function(){
            assertEquals('{}', combinedResult);
         });      
      },
      
      testCanAjaxInAVeryLargeFile: function(queue) {
      
         var combinedResult = '';
      
         queue.call("ask the streaming xhr to fetch", function(callbacks){

            // since this is a large file, even serving locally we're going to get multiple callbacks:       
            streamingXhr.fetch('/test/test/json/tenThousandRecords.json', function(nextDrip){
               console.log('got a bit of json');
               combinedResult += nextDrip;                                                                                     
            },
            // callback for when the stream is complete. we register this just so that jstd knows
            // when to move onto the next queuer            
            callbacks.add(function(){}));            
         });

         queue.call("check we got the correct json back", function(){
         
            // should have given valid json;
            var parsedResult = JSON.parse(combinedResult);
            
            // should have 10,000 records:                     
            assertEquals(10000, parsedResult.result.length);
         });      
      }      
   });
   

})();