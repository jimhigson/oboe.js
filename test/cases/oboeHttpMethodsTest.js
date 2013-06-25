(function(){
/*
   Tests that calling .doGet(), .doPost(), .doPut(), .doDelete() pass through to streamingXhr
   correctly. streamingXhr is a stub so no actual calls are made. 
 */

var streamingStub;

TestCase("oboeTestHttp", {

   setUp: function() {
      streamingStub = sinon.stub(window, 'streamingXhr');      
   },
   
   tearDown: function() {
      streamingStub.restore();   
   },
        
   // GET
   testGetViaShortcut:function(){   
      var doneCallback = sinon.stub();
   
      oboe.doGet('http://example.com/oboez', doneCallback);
      
      assertTrue( streamingStub.alwaysCalledWithMatch(
         'GET',
         'http://example.com/oboez',
         undefined,
         sinon.match.func,
         sinon.match.func
      ));   
   },
      
   testGetViaOptionsObject:function(){   
      var doneCallback = sinon.stub();
   
      oboe.doGet({url: 'http://example.com/oboez', success: doneCallback});
      
      assertTrue( streamingStub.alwaysCalledWithMatch(
         'GET',
         'http://example.com/oboez',
         undefined,
         sinon.match.func,
         sinon.match.func
      ));   
   },   
   
   // DELETE
   testDelete:function(){
      var doneCallback = sinon.stub();
   
      oboe.doDelete('http://example.com/oboez', doneCallback);
      
      assertTrue( streamingStub.alwaysCalledWithMatch(
         'DELETE',
         'http://example.com/oboez',
         undefined,
         sinon.match.func,
         sinon.match.func
      ));   
   },
     
         
   // POST
   testPost:function(){
      var doneCallback = sinon.stub();
   
      oboe.doPost('http://example.com/oboez', 'my_data', doneCallback);
      
      assertTrue( streamingStub.alwaysCalledWithMatch(
         'POST',
         'http://example.com/oboez',
         'my_data',
         sinon.match.func,
         sinon.match.func
      ));   
   },
   
   testCanPostAnObject:function(){
      var doneCallback = sinon.stub();
   
      oboe.doPost('http://example.com/oboez', [1,2,3,4,5], doneCallback);
      
      assertTrue( streamingStub.alwaysCalledWithMatch(
         'POST',
         'http://example.com/oboez',
         [1,2,3,4,5],
         sinon.match.func,
         sinon.match.func
      ));   
   },   
   
   testPostViaOptionsObject:function(){   
      var doneCallback = sinon.stub();
   
      oboe.doPost({url: 'http://example.com/oboez', body:'my_data', success: doneCallback});
      
      assertTrue( streamingStub.alwaysCalledWithMatch(
         'POST',
         'http://example.com/oboez',
         'my_data',
         sinon.match.func,
         sinon.match.func
      ));   
   },   
   
   // PUT
   
   testPut:function(){
      var doneCallback = sinon.stub();
   
      oboe.doPut('http://example.com/oboez', 'my_data', doneCallback);
      
      assertTrue( streamingStub.alwaysCalledWithMatch(
         'PUT',
         'http://example.com/oboez',
         'my_data',
         sinon.match.func,
         sinon.match.func
      ));   
   }
            
      
});


})();
