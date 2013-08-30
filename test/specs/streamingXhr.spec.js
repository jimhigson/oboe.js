
describe("streamingXhr", function(){

   describe("calls get through to browser xhr correctly", function(){
                               
      var notifyStub = jasmine.createSpy('eventBus.notify');                                 
                               
      it('gives xhr null when body is undefined', function(){
      
         streamingXhr(notifyStub).req('GET', 'http://example.com', undefined);
         
         expect( lastCreatedXhrInstance.send ).toHaveBeenGivenBody(null);
      })
      
      it('gives xhr null when body is null', function(){
      
         streamingXhr(notifyStub).req('GET', 'http://example.com', null);
         
         expect( lastCreatedXhrInstance.send ).toHaveBeenGivenBody(null);
      })      
      
      it('give xhr string request body', function(){
      
         streamingXhr(notifyStub).req('GET', 'http://example.com', 'my_data');
         
         expect( lastCreatedXhrInstance.send ).toHaveBeenGivenBody('my_data');
      })
      
      it('gives xhr a json encoded request body when given an object', function(){
   
         var payload = {a:'A', b:'B'};
         
         streamingXhr(notifyStub).req('GET', 'http://example.com', payload);
         
         expect( lastCreatedXhrInstance.send ).toHaveBeenGivenBody(JSON.stringify( payload ) );      
      });      
      
      it('should be able to abort an xhr once started', function(){
         var sXhr = streamingXhr(notifyStub);
         
         sXhr.req('GET', 'http://example.com', 'my_data');
         
         sXhr.abort();
                  
         expect( lastCreatedXhrInstance.abort.called ).toBe(true);                  
      });


      var FakeXhrClass, lastCreatedXhrInstance;      

      beforeEach( function() {
      
         FakeXhrClass = sinon.useFakeXMLHttpRequest();
         
         FakeXhrClass.onCreate = function(xhr) {
            lastCreatedXhrInstance = xhr;
            sinon.spy(lastCreatedXhrInstance, 'send');
            sinon.spy(lastCreatedXhrInstance, 'abort');
         };      
         
         this.addMatchers({
         
            toHaveBeenGivenBody:function( expectedBody ) {
               var sendMethod = this.actual;
               
               return sendMethod.firstCall.args[0] == expectedBody;               
            }
         
         });
      });
      
      afterEach(function() {
         FakeXhrClass.restore();   
      });
   });   
               
});


