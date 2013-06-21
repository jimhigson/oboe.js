(function(){
/*
   Tests that calling .get(), .post(), .put(), .delete() pass through to streamingXhr
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
      // while we've got the transport stubed, let's sneak in a few extra tests:
      
      function noop(){}
      
      oboe.get('http://example.com/oboez')
         .onPath('*', noop).onFind('*', noop).onError('*', noop).onPath('!', noop);
   },
   
   testOboeIsChainableWhenGottenViaCreate: function() {
      // while we've got the transport stubed, let's sneak in a few extra tests:
      
      function noop(){}
      
      oboe.create().get('http://example.com/oboez')
         .onPath('*', noop).onFind('*', noop).onError('*', noop).onPath('!', noop);
   },   
   
   // GET
   testGetViaShortcut:function(){   
      var callback = function callback(){};
   
      oboe.get('http://example.com/oboez', callback);
      
      assertTrue( streamingStub.alwaysCalledWithMatch(
         'GET',
         'http://example.com/oboez',
         sinon.match.typeOf('undefined'),
         sinon.match.func,
         sinon.match.func
      ));   
   },
   
   testGetViaInstantiationFirst:function(){
      var callback = function callback(){};
   
      oboe.create().get('http://example.com/oboez', callback);
      
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
      var callback = function callback(){};
   
      oboe.create().delete('http://example.com/oboez', callback);
      
      assertTrue( streamingStub.alwaysCalledWithMatch(
         'DELETE',
         'http://example.com/oboez',
         sinon.match.typeOf('undefined'),
         sinon.match.func,
         sinon.match.func
      ));   
   },
   
   testDeleteViaInstantiationFirst:function(){
      var callback = function callback(){};
   
      oboe.create().delete('http://example.com/oboez', callback);
      
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
      var callback = function callback(){};
   
      oboe.create().post('http://example.com/oboez', 'my_data', callback);
      
      assertTrue( streamingStub.alwaysCalledWithMatch(
         'POST',
         'http://example.com/oboez',
         'my_data',
         sinon.match.func,
         sinon.match.func
      ));   
   },
   
   testPostViaInstantiationFirst:function(){
      var callback = function callback(){};
   
      oboe.create().post('http://example.com/oboez', 'my_data', callback);
      
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
      var callback = function callback(){};
   
      oboe.create().put('http://example.com/oboez', 'my_data', callback);
      
      assertTrue( streamingStub.alwaysCalledWithMatch(
         'PUT',
         'http://example.com/oboez',
         'my_data',
         sinon.match.func,
         sinon.match.func
      ));   
   },
   
   testPutViaInstantiationFirst:function(){
      var callback = function callback(){};
   
      oboe.create().put('http://example.com/oboez', 'my_data', callback);
      
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
