/* Tests the streaming xhr without stubbing anything */

(function(){

   AsyncTestCase("testStreamingXhr", {
   
      testCanAjaxInASmallKnownFile: function(queue) {
      
         var combinedResult = '';
      
         queue.call("ask the streaming xhr to fetch", function(callbacks){

            // in practice, since we're running on an internal network and this is a small file,
            // we'll probably only get one callback         
            streamingXhr.fetch('/test/test/json/smallestPossible.json', callbacks.add(function(nextDrip){
               combinedResult += nextDrip;                                                                                     
            }));            
         });

         queue.call("check we got the json back", function(callbacks){
            assertEquals('{}', combinedResult);
         });      
      }
   });
   

})();