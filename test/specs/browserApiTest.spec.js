
/*
   Tests that calling .doGet(), .doPost(), .doPut(), .doDelete() pass through to streamingXhr
   correctly. streamingXhr is a stub so no actual calls are made. 
   
   Technically this tests some of controller.js as well as browserApi.js but the tests were
   written before the logic was split into two.
 */

var streamingStub;

function streamingXhrShouldHaveBeenGiven(/* arguments */) {

   var expected = Array.prototype.slice.apply(arguments);

   function alwaysCalledWith( expectedArgs ){
   
      return streamingStub.alwaysCalledWithMatch.apply( streamingStub, expectedArgs );    
   }
   
   if( !alwaysCalledWith(expected) ) {
   
      fail( 
         'arguments given to streamingXhr not as expected. Wanted:'
      ,     anyToString(expected)
      ,  'but have (first recorded) call:'
      ,     anyToString(streamingStub.args[0])
      );
   }   
}

describe("calls to browser api propagate to streaming xhr", function(){

   beforeEach(function() {
      streamingStub = sinon.stub(window, 'streamingXhr');      
   });
   
   afterEach( function() {
      streamingStub.restore();   
   });
              
   // GET
   it('can make a Get', function(){   
      var doneCallback = sinon.stub();
   
      oboe.doGet('http://example.com/oboez', doneCallback);
      
      streamingXhrShouldHaveBeenGiven(
         'GET',
         'http://example.com/oboez',
         undefined,
         sinon.match.func,
         sinon.match.func
      );   
   })
      
   it('can make a GetViaOptionsObject', function(){   
      var doneCallback = sinon.stub();
   
      oboe.doGet({url: 'http://example.com/oboez', success: doneCallback});
      
      streamingXhrShouldHaveBeenGiven(
         'GET',
         'http://example.com/oboez',
         undefined,
         sinon.match.func,
         sinon.match.func
      );   
   })   
   
   // DELETE
   it('can make a Delete', function(){
      var doneCallback = sinon.stub();
   
      oboe.doDelete('http://example.com/oboez', doneCallback);
    
      streamingXhrShouldHaveBeenGiven(
         'DELETE',
         'http://example.com/oboez',
         undefined,
         sinon.match.func,
         sinon.match.func
      );
   })
   
   it('can make a DeleteViaOptionsObject', function(){   
      var doneCallback = sinon.stub();
   
      oboe.doDelete({url: 'http://example.com/oboez', success: doneCallback});
      
      streamingXhrShouldHaveBeenGiven(
         'DELETE',
         'http://example.com/oboez',
         undefined,
         sinon.match.func,
         sinon.match.func
      );   
   })   
     
         
   // POST
   it('can make a Post', function(){
      var doneCallback = sinon.stub();
   
      oboe.doPost('http://example.com/oboez', 'my_data', doneCallback);
      
      streamingXhrShouldHaveBeenGiven(
         'POST',
         'http://example.com/oboez',
         'my_data',
         sinon.match.func,
         sinon.match.func
      );   
   })
   
   it('can make a CanPostAnObject', function(){
      var doneCallback = sinon.stub();
   
      oboe.doPost('http://example.com/oboez', [1,2,3,4,5], doneCallback);
      
      streamingXhrShouldHaveBeenGiven( 
         'POST',
         'http://example.com/oboez',
         [1,2,3,4,5],
         sinon.match.func,
         sinon.match.func
      );   
   })   
   
   it('can make a PostViaOptionsObject', function(){   
      var doneCallback = sinon.stub();
   
      oboe.doPost({url: 'http://example.com/oboez', body:'my_data', success: doneCallback});
      
      streamingXhrShouldHaveBeenGiven( 
         'POST',
         'http://example.com/oboez',
         'my_data',
         sinon.match.func,
         sinon.match.func
      );   
   })   
   
   // PUT   
   it('can make a Put', function(){
      var doneCallback = sinon.stub();
   
      oboe.doPut('http://example.com/oboez', 'my_data', doneCallback);
      
      streamingXhrShouldHaveBeenGiven( 
         'PUT',
         'http://example.com/oboez',
         'my_data',
         sinon.match.func,
         sinon.match.func
      );   
   })
      
});



