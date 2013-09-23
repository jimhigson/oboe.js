
describe("streamingXhr", function(){
   "use strict";

   describe("calls through to browser xhr", function(){
                                                                                              
      it('gives xhr null when body is undefined', function(){
         var eventBus = pubSub(), xhr = xhrStub();
      
         streamingXhr(eventBus.fire, eventBus.on, xhr, 'GET', 'http://example.com', undefined);
         
         expect( xhr.send ).toHaveBeenCalledWith(null);
      })
      
      it('gives xhr null when body is null', function(){
         var eventBus = pubSub(), xhr = xhrStub();
      
         streamingXhr(eventBus.fire, eventBus.on, xhr, 'GET', 'http://example.com', null);
         
         expect( xhr.send ).toHaveBeenCalledWith(null);
      })      
      
      it('give xhr string request body', function(){
         var eventBus = pubSub(), xhr = xhrStub();      
      
         streamingXhr(eventBus.fire, eventBus.on, xhr, 'GET', 'http://example.com', 'my_data');
         
         expect( xhr.send ).toHaveBeenCalledWith('my_data');
      })
      
      it('gives xhr a json encoded request body when given an object', function(){
         var eventBus = pubSub(), xhr = xhrStub();   
         var payload = {a:'A', b:'B'};
         
         streamingXhr(eventBus.fire, eventBus.on, xhr, 'GET', 'http://example.com', payload);
         
         expect( xhr.send ).toHaveBeenCalledWith(JSON.stringify( payload ) );      
      });
      
      it('gives xhr the request headers', function(){
         var eventBus = pubSub(), xhr = xhrStub();           
         var headers = {
            'X-FROODINESS':'frood',
            'X-HOOPINESS':'hoopy'
         };           
           
         streamingXhr(eventBus.fire, eventBus.on, xhr, 'GET', 'http://example.com', undefined, headers);
         
         expect( xhr.setRequestHeader ).toHaveBeenCalledWith( 'X-FROODINESS', 'frood' );      
         expect( xhr.setRequestHeader ).toHaveBeenCalledWith( 'X-HOOPINESS', 'hoopy' );      
      });            
      
      it('should be able to abort an xhr once started', function(){
         var eventBus = pubSub(), xhr = xhrStub();      
         streamingXhr(eventBus.fire, eventBus.on, xhr, 'GET', 'http://example.com', 'my_data');
         
         eventBus.fire(ABORTING);
                  
         expect( xhr.abort ).toHaveBeenCalled();                  
      });
      
      
      function xhrStub() {
         return {
            abort: jasmine.createSpy('abort'),
            open: jasmine.createSpy('open'),
            setRequestHeader: jasmine.createSpy('setRequestHeader'),
            send: jasmine.createSpy('send')
         };
      }
   });   
               
});


