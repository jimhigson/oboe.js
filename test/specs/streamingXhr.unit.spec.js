
describe("streamingXhr", function(){
   "use strict";

   describe("calls through to browser xhr", function(){
                                                                                              
      it('gives xhr null when body is undefined', function(){
      
         streamingXhr(eventBus.fire, eventBus.on, 'GET', 'http://example.com', undefined);
         
         expect( lastCreatedXhrInstance.send ).toHaveBeenGivenBody(null);
      })
      
      it('gives xhr null when body is null', function(){
      
         streamingXhr(eventBus.fire, eventBus.on, 'GET', 'http://example.com', null);
         
         expect( lastCreatedXhrInstance.send ).toHaveBeenGivenBody(null);
      })      
      
      it('give xhr string request body', function(){
      
         streamingXhr(eventBus.fire, eventBus.on, 'GET', 'http://example.com', 'my_data');
         
         expect( lastCreatedXhrInstance.send ).toHaveBeenGivenBody('my_data');
      })
      
      it('gives xhr a json encoded request body when given an object', function(){
   
         var payload = {a:'A', b:'B'};
         
         streamingXhr(eventBus.fire, eventBus.on, 'GET', 'http://example.com', payload);
         
         expect( lastCreatedXhrInstance.send ).toHaveBeenGivenBody(JSON.stringify( payload ) );      
      });
      
      it('gives xhr the request headers', function(){
           
         var headers = {
            'X-FROODINESS':'frood',
            'X-HOOPINESS':'hoopy'
         };           
           
         streamingXhr(eventBus.fire, eventBus.on, 'GET', 'http://example.com', undefined, headers);
         
         expect( lastCreatedXhrInstance ).toHaveBeenGivenHeader( 'X-FROODINESS', 'frood' );      
         expect( lastCreatedXhrInstance ).toHaveBeenGivenHeader( 'X-HOOPINESS', 'hoopy' );      
      });            
      
      it('should be able to abort an xhr once started', function(){
      
         streamingXhr(eventBus.fire, eventBus.on, 'GET', 'http://example.com', 'my_data');
         
         eventBus.fire(ABORTING);
                  
         expect( lastCreatedXhrInstance.abort.called ).toBe(true);                  
      });


      var FakeXhrClass, lastCreatedXhrInstance,
          eventBus;            

      beforeEach( function() {
      
         eventBus = pubSub();      
      
         FakeXhrClass = sinon.useFakeXMLHttpRequest();
         
         FakeXhrClass.onCreate = function(xhr) {
            lastCreatedXhrInstance = xhr;
            sinon.spy(lastCreatedXhrInstance, 'send');
            sinon.spy(lastCreatedXhrInstance, 'setRequestHeader');
            sinon.spy(lastCreatedXhrInstance, 'abort');
         };      
         
         this.addMatchers({
         
            toHaveBeenGivenBody:function( expectedBody ) {
               var sendMethod = this.actual;
               
               return sendMethod.firstCall.args[0] == expectedBody;               
            },
            
            toHaveBeenGivenHeader:function( expectedName, expectedValue ) {

               return lastCreatedXhrInstance.setRequestHeader.calledWith(expectedName, expectedValue);
            }            
         
         });
      });
      
      afterEach(function() {
         FakeXhrClass.restore();   
      });
   });   
               
});


