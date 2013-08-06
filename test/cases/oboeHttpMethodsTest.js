(function(){
/*
   Tests that calling .doGet(), .doPost(), .doPut(), .doDelete() pass through to streamingXhr
   correctly. streamingXhr is a stub so no actual calls are made. 
 */

var streamingStub;

function streamingXhrShouldHaveBeenGiven(/* arguments */) {

   var expected = Array.prototype.slice.apply(arguments);

   function alwaysCalledWith( expectedArgs ){
   
      return streamingStub.alwaysCalledWithMatch.apply( streamingStub, expectedArgs );    
   }

   if( !alwaysCalledWith(expected) ) {
   
      fail( 'arguments given to streamingXhr not as expected. Wanted:',
            JSON.stringify( expected ),
            'but have calls:',
            JSON.stringify(streamingStub.args)
      );
   }   
}

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
      
      streamingXhrShouldHaveBeenGiven(
         'GET',
         'http://example.com/oboez',
         undefined,
         sinon.match.func,
         sinon.match.func
      );   
   },
      
   testGetViaOptionsObject:function(){   
      var doneCallback = sinon.stub();
   
      oboe.doGet({url: 'http://example.com/oboez', success: doneCallback});
      
      streamingXhrShouldHaveBeenGiven(
         'GET',
         'http://example.com/oboez',
         undefined,
         sinon.match.func,
         sinon.match.func
      );   
   },   
   
   // DELETE
   testDelete:function(){
      var doneCallback = sinon.stub();
   
      oboe.doDelete('http://example.com/oboez', doneCallback);
    
      streamingXhrShouldHaveBeenGiven(
         'DELETE',
         'http://example.com/oboez',
         undefined,
         sinon.match.func,
         sinon.match.func
      );
   },
     
         
   // POST
   testPost:function(){
      var doneCallback = sinon.stub();
   
      oboe.doPost('http://example.com/oboez', 'my_data', doneCallback);
      
      streamingXhrShouldHaveBeenGiven(
         'POST',
         'http://example.com/oboez',
         'my_data',
         sinon.match.func,
         sinon.match.func
      );   
   },
   
   testCanPostAnObject:function(){
      var doneCallback = sinon.stub();
   
      oboe.doPost('http://example.com/oboez', [1,2,3,4,5], doneCallback);
      
      streamingXhrShouldHaveBeenGiven( 
         'POST',
         'http://example.com/oboez',
         [1,2,3,4,5],
         sinon.match.func,
         sinon.match.func
      );   
   },   
   
   testPostViaOptionsObject:function(){   
      var doneCallback = sinon.stub();
   
      oboe.doPost({url: 'http://example.com/oboez', body:'my_data', success: doneCallback});
      
      streamingXhrShouldHaveBeenGiven( 
         'POST',
         'http://example.com/oboez',
         'my_data',
         sinon.match.func,
         sinon.match.func
      );   
   },   
   
   // PUT
   
   testPut:function(){
      var doneCallback = sinon.stub();
   
      oboe.doPut('http://example.com/oboez', 'my_data', doneCallback);
      
      streamingXhrShouldHaveBeenGiven( 
         'PUT',
         'http://example.com/oboez',
         'my_data',
         sinon.match.func,
         sinon.match.func
      );   
   }
            
      
});


})();
