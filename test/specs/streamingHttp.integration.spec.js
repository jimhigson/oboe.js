/* Tests the streaming xhr without stubbing anything. Really just a test that 
*  we've got the interface of the in-browser XHR object pinned down  */

describe('streaming xhr integration (real http)', function() {
   "use strict";
 
   it('can ajax in a small known file',  function() {
     
      // in practice, since we're running on an internal network and this is a small file,
      // we'll probably only get one callback         
      streamingHttp(                         
         emit, on,
         new XMLHttpRequest(),
         'GET', 
         '/testServer/static/json/smallestPossible.json',
         null // this is a GET, no data to send);
      ); 
      
      waitForRequestToComplete();            

      runs(function(){
         expect(contentReceived).toParseTo({}); 
      });  
   })
              
   it('can ajax in a very large file without missing any',  function() {
   
  
      // in practice, since we're running on an internal network and this is a small file,
      // we'll probably only get one callback         
      streamingHttp(                         
         emit, on,
         new XMLHttpRequest(),         
         'GET', 
         '/testServer/static/json/twentyThousandRecords.json',
         null // this is a GET, no data to send      
      );
      
      waitForRequestToComplete();            

      runs(function(){
         var parsedResult;
      
         expect(function(){

            parsedResult = JSON.parse(contentReceived);
            
         }).not.toThrow();

         // as per the name, should have 20,000 records in that file:                     
         expect(parsedResult.result.length).toEqual(20000);
      });  
   })
   
   it('can ajax in a streaming file without missing any',  function(queue) {
   
   
      // in practice, since we're running on an internal network and this is a small file,
      // we'll probably only get one callback         
      streamingHttp(                       
         emit, on,
         new XMLHttpRequest(),         
         'GET', 
         '/testServer/tenSlowNumbers',
          null // this is a GET, no data to send      
      );
      
      waitForRequestToComplete();            

      runs(function(){ 
         // as per the name, should have ten numbers in that file:         
         expect(contentReceived).toParseTo([0,1,2,3,4,5,6,7,8,9]);
      });              
   }) 
   
   it('can make a post request',  function(queue) {
   
      var payload = {'thisWill':'bePosted','andShould':'be','echoed':'back'};
   
      // in practice, since we're running on an internal network and this is a small file,
      // we'll probably only get one callback         
      streamingHttp(                        
         emit, on,
         new XMLHttpRequest(),         
         'POST',
         '/testServer/echoBackBody',
         payload       
      );
      
      waitForRequestToComplete();            
 
      runs(function(){
         expect(contentReceived).toParseTo(payload);
      });
     
   })
   
   it('can make a put request',  function(queue) {
   
      var payload = {'thisWill':'bePosted','andShould':'be','echoed':'back'};
   
      // in practice, since we're running on an internal network and this is a small file,
      // we'll probably only get one callback         
      streamingHttp(
         emit, on,
         new XMLHttpRequest(),         
         'PUT',
          '/testServer/echoBackBody',
          payload       
      );
      
      waitForRequestToComplete();            

      runs(function(){
         expect(contentReceived).toParseTo(payload);
      });
     
   }) 

   it('can make a patch request',  function(queue) {
   
      var payload = {'thisWill':'bePosted','andShould':'be','echoed':'back'};
   
      // in practice, since we're running on an internal network and this is a small file,
      // we'll probably only get one callback         
      streamingHttp(
         emit, on,
         new XMLHttpRequest(),         
         'PATCH',
          '/testServer/echoBackBody',
          payload       
      );
      
      waitForRequestToComplete();            

      runs(function(){
         expect(contentReceived).toParseTo(payload);
      });
     
   })   
          
   // this test is only activated for non-IE browsers and IE 10 or newer.
   // old and rubbish browsers buffer the xhr response meaning that this 
   // will never pass. But for good browsers it is good to have an integration
   // test to confirm that we're getting it right.           
   if( !internetExplorer || internetExplorer >= 10 ) {          
      it('gives multiple callbacks when loading a streaming resource',  function(queue) {
                              
         streamingHttp(                           
            emit, on,
            new XMLHttpRequest(),            
            'GET',

            '/testServer/tenSlowNumbers',
             null // this is a get: no data to send         
         );                     
         
         waitForRequestToComplete();      
   
         runs(function(){
                                   
            // realistically, should have had 10 or 20, but this isn't deterministic so
            // 3 is enough to indicate the results didn't all arrive in one big blob.
            expect(numberOfProgressCallbacks).toBeGreaterThan(3);
         });      
      })
                     
      it('gives multiple callbacks when loading a gzipped streaming resource',  function(queue) {
                              
         streamingHttp(                           
            emit, on,
            new XMLHttpRequest(),            
            'GET',
 
            '/testServer/gzippedTwoHundredItems',
             null // this is a get: no data to send         
         );                     
         
         waitForRequestToComplete();      
   
         runs(function(){
            expect(numberOfProgressCallbacks).toBeGreaterThan(1);
         });      
      })      
   }
   
   it('does not call back with zero-length data',  function(queue) {
                         
      // since this is a large file, even serving locally we're going to get multiple callbacks:       
      streamingHttp(              
         emit, on,
         new XMLHttpRequest(),         
         'GET', 
         '/testServer/static/json/twentyThousandRecords.json',
         null // this is a GET: no data to send      
      );         

      waitForRequestToComplete()
      
      runs(function(){
      
         expect(dripsReceived.length).toBeGreaterThan(0);
      
         dripsReceived.forEach(function(drip) {            
            expect(drip.length).not.toEqual(0);                                                                                     
         });
      
      })   
   })              


   var requestCompleteListener,
       contentReceived,
       numberOfProgressCallbacks,
       dripsReceived,
       emit, on;
   
   function waitForRequestToComplete(){
      waitsFor(function(){     
         return requestCompleteListener.called;      
      }, 'streaming xhr to complete', ASYNC_TEST_TIMEOUT);   
   }
   
   beforeEach(function(){
      contentReceived = '';      
      numberOfProgressCallbacks = 0;
      dripsReceived = [];
      requestCompleteListener = sinon.stub();
            
      this.addMatchers({
         toParseTo:function( expectedObj ){
            
            var normalisedActual;
            
            try{
               normalisedActual = JSON.stringify( JSON.parse(this.actual) );
            }catch(e){
            
               this.message = function(){
                  return "Expected to be able to parse the found content as json " + this.actual;                  
               }
               
               return false;            
            }   
            
            this.message = function(){
               return "The found json parsed but did not match " + JSON.stringify(expectedObj) + 
                        " because found " + this.actual; 
            }
            
            return (normalisedActual === JSON.stringify(expectedObj));
         }
      });
      
      on = jasmine.createSpy();
      
      emit = jasmine.createSpy().andCallFake(function( eventName, eventContent ){
      
         if( eventName == STREAM_DATA ) {
            numberOfProgressCallbacks ++;
            contentReceived += eventContent;
            dripsReceived.push(eventContent);
                     
         } else if( eventName == STREAM_END ) {
            requestCompleteListener();
         }
      });
      
   });

});