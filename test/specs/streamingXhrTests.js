(function(){
/*
   Tests that calling .doGet(), .doPost(), .doPut(), .doDelete() pass through to streamingXhr
   correctly. streamingXhr is a stub so no actual calls are made. 
 */

var FakeXhrClass, lastCreatedXhrInstance;

TestCase("streamingXhr", {


                               
   testUndefinedDataImpliesNullRequestBody:function(){
   
      streamingXhr('GET', 'http://example.com', undefined, function(){}, function(){});
      
      assertEquals(null, lastCreatedXhrInstance.requestBody);
   },
   
   testStringDataIsPassedThroughToRequestBody:function(){
   
      streamingXhr('GET', 'http://example.com', 'my_data', function(){}, function(){});
      
      assertEquals(lastCreatedXhrInstance.send.firstCall.args[0], 'my_data');
   },
   
   testObjectDataIsJsonEncoded:function(){

      var payload = {a:'A', b:'B'};
      streamingXhr('GET', 'http://example.com', payload, function(){}, function(){});
      
      assertEquals(JSON.parse(lastCreatedXhrInstance.send.firstCall.args[0]), payload);      
   },      
   
   
   
   setUp: function() {
      FakeXhrClass = sinon.useFakeXMLHttpRequest();
      
      FakeXhrClass.onCreate = function(xhr) {
         lastCreatedXhrInstance = xhr;
         sinon.spy(lastCreatedXhrInstance, 'send');
      };      
   },
   
   tearDown: function() {
      FakeXhrClass.restore();   
   }   
            
      
});


})();
