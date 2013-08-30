
describe("streamingXhr", function(){

   var FakeXhrClass, lastCreatedXhrInstance;

   describe("requests should get through to browser xhr correctly", function(){
                               
      it('gives xhr null when body is undefined', function(){
      
         streamingXhr('GET', 'http://example.com', undefined, function(){}, function(){});
         
         expect( lastCreatedXhrInstance.send ).toHaveBeenGiven(null);
      })
      
      it('gives xhr null when body is null', function(){
      
         streamingXhr('GET', 'http://example.com', null, function(){}, function(){});
         
         expect( lastCreatedXhrInstance.send ).toHaveBeenGiven(null);
      })      
      
      it('give xhr string request body', function(){
      
         streamingXhr('GET', 'http://example.com', 'my_data', function(){}, function(){});
         
         expect( lastCreatedXhrInstance.send ).toHaveBeenGiven('my_data');
      })
      
      it('gives xhr a json encoded request body when given an object', function(){
   
         var payload = {a:'A', b:'B'};
         
         streamingXhr('GET', 'http://example.com', payload, function(){}, function(){});
         
         expect( lastCreatedXhrInstance.send ).toHaveBeenGiven(JSON.stringify( payload ) );      
      });      
      

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


