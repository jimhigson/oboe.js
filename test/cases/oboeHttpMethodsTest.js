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
   
   testOboeIsChainableWhenGottenViaShortcut: function() {
      // while we've got the transport stubed, let's sneak in a chainability test:
      
      function noop(){}
      
      oboe.doGet('http://example.com/oboez')
         .onPath('*', noop).onFind('*', noop).onError(noop).onPath('!', noop);
   },
   
   testOboeIsChainableWhenGottenViaCreate: function() {
      // while we've got the transport stubed, let's sneak in a chainability test:
      
      function noop(){}
      
      oboe.create().doGet('http://example.com/oboez')
         .onPath('*', noop).onFind('*', noop).onError(noop).onPath('!', noop);
   },   
   
   // GET
   testGetViaShortcut:function(){   
      var doneCallback = sinon.stub();
   
      oboe.doGet('http://example.com/oboez', doneCallback);
      
      assertTrue( streamingStub.alwaysCalledWithMatch(
         'GET',
         'http://example.com/oboez',
         sinon.match.typeOf('undefined'),
         sinon.match.func,
         sinon.match.func
      ));   
   },
   
   testGetViaInstantiationFirst:function(){
      var doneCallback = sinon.stub();
   
      oboe.create().doGet('http://example.com/oboez', doneCallback);
      
      assertTrue( streamingStub.alwaysCalledWithMatch(
         'GET',
         'http://example.com/oboez',
         sinon.match.typeOf('undefined'),
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
         sinon.match.typeOf('undefined'),
         sinon.match.func,
         sinon.match.func
      ));   
   },   
   
   // DELETE
   testDeleteViaShortcut:function(){
      var doneCallback = sinon.stub();
   
      oboe.create().doDelete('http://example.com/oboez', doneCallback);
      
      assertTrue( streamingStub.alwaysCalledWithMatch(
         'DELETE',
         'http://example.com/oboez',
         sinon.match.typeOf('undefined'),
         sinon.match.func,
         sinon.match.func
      ));   
   },
   
   testDeleteViaInstantiationFirst:function(){
      var doneCallback = sinon.stub();
   
      oboe.create().doDelete('http://example.com/oboez', doneCallback);
      
      assertTrue( streamingStub.alwaysCalledWithMatch(
         'DELETE',
         'http://example.com/oboez',
         sinon.match.typeOf('undefined'),
         sinon.match.func,
         sinon.match.func
      ));   
   },   
         
   // POST
   testPostViaShortcut:function(){
      var doneCallback = sinon.stub();
   
      oboe.create().doPost('http://example.com/oboez', 'my_data', doneCallback);
      
      assertTrue( streamingStub.alwaysCalledWithMatch(
         'POST',
         'http://example.com/oboez',
         'my_data',
         sinon.match.func,
         sinon.match.func
      ));   
   },
   
   testPostViaInstantiationFirst:function(){
      var doneCallback = sinon.stub();
   
      oboe.create().doPost('http://example.com/oboez', 'my_data', doneCallback);
      
      assertTrue( streamingStub.alwaysCalledWithMatch(
         'POST',
         'http://example.com/oboez',
         'my_data',
         sinon.match.func,
         sinon.match.func
      ));   
   },
   
   testPostViaOptionsObject:function(){   
      var doneCallback = sinon.stub();
   
      oboe.doPost({url: 'http://example.com/oboez', data:'my_data', success: doneCallback});
      
      assertTrue( streamingStub.alwaysCalledWithMatch(
         'POST',
         'http://example.com/oboez',
         'my_data',
         sinon.match.func,
         sinon.match.func
      ));   
   },   
   
   // PUT
   testPutViaShortcut:function(){
      var doneCallback = sinon.stub();
   
      oboe.create().doPut('http://example.com/oboez', 'my_data', doneCallback);
      
      assertTrue( streamingStub.alwaysCalledWithMatch(
         'PUT',
         'http://example.com/oboez',
         'my_data',
         sinon.match.func,
         sinon.match.func
      ));   
   },
   
   testPutViaInstantiationFirst:function(){
      var doneCallback = sinon.stub();
   
      oboe.create().doPut('http://example.com/oboez', 'my_data', doneCallback);
      
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
