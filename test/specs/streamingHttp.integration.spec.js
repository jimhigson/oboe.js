/* Tests the streaming xhr without stubbing anything. Really just a test that 
*  we've got the interface of the in-browser XHR object pinned down  */


describe('streaming xhr integration (real http)', function() {
   "use strict";
 
   it('can ajax in a small known file',  function() {
     
      // in practice, since we're running on an internal network and this is a small file,
      // we'll probably only get one callback         
      streamingHttp(                         
         emit, on,
         httpTransport(),
         'GET', 
         '/testServer/static/json/smallestPossible.json',
         null // this is a GET, no data to send
      ); 
      
      waitForRequestToComplete();            

      runs(function(){
         expect(emit).toHaveGivenStreamEventsInCorrectOrder()
         expect(contentReceived).toParseTo({}) 
      });  
   })
   
   it('fires HTTP_START with status and headers',  function() {
     
      // in practice, since we're running on an internal network and this is a small file,
      // we'll probably only get one callback         
      streamingHttp(                         
         emit, on,
         httpTransport(),
         'GET', 
         '/testServer/echoBackHeadersAsHeaders',
         null, // this is a GET, no data to send
         {'specialheader':'specialValue'}
      ); 
      
      waitForRequestToComplete();            

      runs(function(){
         expect(emit)
            .toHaveBeenCalledWith(
               HTTP_START,
               200,
               jasmine.objectContaining({specialheader:'specialValue'}
            )
         );          
      });  
   })
   
   it('fires HTTP_START, STREAM_DATA and STREAM_END in correct order',  function() {
     
      // in practice, since we're running on an internal network and this is a small file,
      // we'll probably only get one callback         
      streamingHttp(                         
         emit, on,
         httpTransport(),
         'GET', 
         '/testServer/echoBackHeadersAsHeaders',
         null, // this is a GET, no data to send
         {'specialheader':'specialValue'}
      ); 
      
      waitForRequestToComplete();            

      runs(function(){
         expect(emit).toHaveGivenStreamEventsInCorrectOrder()
      });            
   })      
            
   it('can ajax in a very large file without missing any',  function() {
   
  
      // in practice, since we're running on an internal network and this is a small file,
      // we'll probably only get one callback         
      streamingHttp(                         
         emit, on,
         httpTransport(),         
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
   
   it('can ajax in a streaming file without missing any',  function() {
   
   
      // in practice, since we're running on an internal network and this is a small file,
      // we'll probably only get one callback         
      streamingHttp(                       
         emit, on,
         httpTransport(),         
         'GET', 
         '/testServer/tenSlowNumbers?withoutMissingAny',
          null // this is a GET, no data to send      
      );
      
      waitForRequestToComplete();            

      runs(function(){ 
         // as per the name, should have ten numbers in that file:         
         expect(contentReceived).toParseTo([0,1,2,3,4,5,6,7,8,9]);
         expect(emit).toHaveGivenStreamEventsInCorrectOrder()         
      });              
   }) 
   
   it('can make a post request',  function() {
   
      var payload = {'thisWill':'bePosted','andShould':'be','echoed':'back'};
   
      // in practice, since we're running on an internal network and this is a small file,
      // we'll probably only get one callback         
      streamingHttp(                        
         emit, on,
         httpTransport(),         
         'POST',
         '/testServer/echoBackBody',
         payload       
      );
      
      waitForRequestToComplete();            
 
      runs(function(){
         expect(contentReceived).toParseTo(payload);
         expect(emit).toHaveGivenStreamEventsInCorrectOrder()         
      });
     
   })
   
   it('can make a put request',  function() {
   
      var payload = {'thisWill':'bePut','andShould':'be','echoed':'back'};
   
      // in practice, since we're running on an internal network and this is a small file,
      // we'll probably only get one callback         
      streamingHttp(
         emit, on,
         httpTransport(),         
         'PUT',
          '/testServer/echoBackBody',
          payload       
      );
      
      waitForRequestToComplete();            

      runs(function(){
         expect(contentReceived).toParseTo(payload);
         expect(emit).toHaveGivenStreamEventsInCorrectOrder()         
      });
     
   }) 

  
   it('can make a patch request',  function() {
   
      var payload = {'thisWill':'bePatched','andShould':'be','echoed':'back'};
   
      // in practice, since we're running on an internal network and this is a small file,
      // we'll probably only get one callback         
      streamingHttp(
         emit, on,
         httpTransport(),         
         'PATCH',
          '/testServer/echoBackBody',
          payload       
      );
      
      waitForRequestToComplete();            

      runs(function(){
         if( contentReceived == '' &&
             (Platform.internetExplorer || Platform.isPhantom) ) {
            console.warn( 'this user agent seems not to support giving content' 
                          + ' back for of PATCH requests.'
                          + ' This happens on PhantomJS and IE < 9');
         } else {         
            expect(contentReceived).toParseTo(payload);
            expect(emit).toHaveGivenStreamEventsInCorrectOrder();
         }            
      });
     
   })
   
          
   // this test is only activated for non-IE browsers and IE 10 or newer.
   // old and rubbish browsers buffer the xhr response meaning that this 
   // will never pass. But for good browsers it is good to have an integration
   // test to confirm that we're getting it right.           
   if( !Platform.internetExplorer || Platform.internetExplorer >= 10 ) {          
      it('gives multiple callbacks when loading a streaming resource',  function() {
                              
         streamingHttp(                           
            emit, on,
            httpTransport(),            
            'GET',

            '/testServer/tenSlowNumbers',
             null // this is a get: no data to send         
         );                     
         
         waitForRequestToComplete();      
   
         runs(function(){
                                   
            // realistically, should have had 10 or 20, but this isn't deterministic so
            // 3 is enough to indicate the results didn't all arrive in one big blob.
            expect(numberOfProgressCallbacks).toBeGreaterThan(3)
            expect(emit).toHaveGivenStreamEventsInCorrectOrder()            
         });      
      })
                     
      it('gives multiple callbacks when loading a gzipped streaming resource',  function() {
                              
         streamingHttp(                           
            emit, on,
            httpTransport(),            
            'GET',
 
            '/testServer/gzippedTwoHundredItems',
             null // this is a get: no data to send         
         );                     
         
         waitForRequestToComplete();      
   
         runs(function(){
            // some platforms can't help but not work here so warn but don't
            // fail the test:
            if( numberOfProgressCallbacks == 1 && 
                  (Platform.isInternetExplorer || Platform.isPhantom) ) {
               console.warn('This user agent seems to give gzipped responses' +
                   'as a single event, not progressively. This happens on ' +
                   'PhantomJS and IE < 9');
            } else {
               expect(numberOfProgressCallbacks).toBeGreaterThan(1);
            }
         
            expect(emit).toHaveGivenStreamEventsInCorrectOrder();
         });      
      })      
   }
   
   it('does not call back with zero-length data',  function() {
                         
      // since this is a large file, even serving locally we're going to get multiple callbacks:       
      streamingHttp(              
         emit, on,
         httpTransport(),         
         'GET', 
         '/testServer/static/json/oneHundredRecords.json',
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
         // did we emit with STREAM_END as the event name yet?
         
         return emit.calls.some(function( call ){         
            return call.args[0] == STREAM_END;         
         });      
      }, 'streaming xhr to complete', ASYNC_TEST_TIMEOUT);   
   }
   
   beforeEach(function(){
      contentReceived = '';      
      numberOfProgressCallbacks = 0;
      dripsReceived = [];
      requestCompleteListener = jasmine.createSpy();
      
      function prettyPrintEvent(event){

         switch(event) {
            case     HTTP_START:  return 'start';
            case     STREAM_DATA: return 'data';
            case     STREAM_END:  return 'end';
            default: return 'unknown(' + event + ')' 
         }                                    
      }
            
      this.addMatchers({
         toHaveGivenStreamEventsInCorrectOrder: function(){
         
            var emitSpy = this.actual;
            
            var eventsOrder = emitSpy.calls.map(function(call){
               return call.args[0];
            });
            
            this.message = function(){
               return 'events not in correct order. We have: ' +
                        JSON.stringify(
                           eventsOrder.map(prettyPrintEvent)
                        )                          
            };
            
            return   eventsOrder[0] === HTTP_START
                  && eventsOrder[1] === STREAM_DATA
                  && eventsOrder[eventsOrder.length-1] === STREAM_END;
         },
      
         toParseTo:function( expectedObj ){
            
            var actual = this.actual;
            var normalisedActual;
                       
            if( !actual ) {
               this.message = function(){
                  return 'no content has been received';
               }
               return false;
            }                       
                       
            try{
               normalisedActual = JSON.stringify( JSON.parse(actual) );
            }catch(e){
            
               this.message = function(){
                
                  return "Expected to be able to parse the found " +
                      "content as json '" + actual + "' but it " +
                      "could not be parsed";                  
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
                     
         }
      });
      
   });

});