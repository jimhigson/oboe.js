
describe("streamingXhr", function(){

   describe("requests should get through to browser xhr correctly", function(){
                               
      var notifyStub = jasmine.createSpy('eventBus.notify');                                 
                               
      it('gives xhr null when body is undefined', function(){
      
         streamingXhr(notifyStub).req('GET', 'http://example.com', undefined);
         
         expect( lastCreatedXhrInstance.send ).toHaveBeenGiven(null);
      })
      
      it('gives xhr null when body is null', function(){
      
         streamingXhr(notifyStub).req('GET', 'http://example.com', null);
         
         expect( lastCreatedXhrInstance.send ).toHaveBeenGiven(null);
      })      
      
      it('give xhr string request body', function(){
      
         streamingXhr(notifyStub).req('GET', 'http://example.com', 'my_data');
         
         expect( lastCreatedXhrInstance.send ).toHaveBeenGiven('my_data');
      })
      
      it('gives xhr a json encoded request body when given an object', function(){
   
         var payload = {a:'A', b:'B'};
         
         streamingXhr(notifyStub).req('GET', 'http://example.com', payload);
         
         expect( lastCreatedXhrInstance.send ).toHaveBeenGiven(JSON.stringify( payload ) );      
      });      


      var FakeXhrClass, lastCreatedXhrInstance;      

      beforeEach( function() {
         FakeXhrClass = sinon.useFakeXMLHttpRequest();
         
         FakeXhrClass.onCreate = function(xhr) {
            lastCreatedXhrInstance = xhr;
            sinon.spy(lastCreatedXhrInstance, 'send');
         };      
         
         this.addMatchers({
         
            toHaveBeenGiven:function( expectedBody ) {
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


