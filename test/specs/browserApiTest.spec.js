
/*
   Tests that calling .doGet(), .doPost(), .doPut(), .doDelete() pass through to streamingXhr
   correctly. streamingXhr is a stub so no actual calls are made. 
   
   Technically this tests some of controller.js as well as browserApi.js but the tests were
   written before the logic was split into two.
 */

describe("calls to browser api propagate to streaming xhr", function(){

   var callbackPlaceholder = function(){};

   beforeEach(function() {
      spyOn(window, 'streamingXhr');      
   });
   
   // GET
   it('can make a get', function(){   
   
      oboe.doGet('http://example.com/oboez', callbackPlaceholder)
   
      expect( streamingXhr ).toHaveBeenCalledWith(
          'GET',
          'http://example.com/oboez',
          undefined,
          jasmine.any(Function),
          jasmine.any(Function)
      )      
         
   })
      
   it('can make a get via options object', function(){   
        
      oboe.doGet({url: 'http://example.com/oboez', success: callbackPlaceholder})
      
      expect( streamingXhr ).toHaveBeenCalledWith(
         'GET',
         'http://example.com/oboez',
         undefined,
         jasmine.any(Function),
         jasmine.any(Function)
      )   
   })   
   
   // DELETE
   it('can make a delete', function(){
        
      oboe.doDelete('http://example.com/oboez', callbackPlaceholder)
    
      expect( streamingXhr ).toHaveBeenCalledWith(
         'DELETE',
         'http://example.com/oboez',
         undefined,
         jasmine.any(Function),
         jasmine.any(Function)
      )
   })
   
   it('can make a delete via options object', function(){   
         
      oboe.doDelete({url: 'http://example.com/oboez', success: callbackPlaceholder})
      
      expect( streamingXhr ).toHaveBeenCalledWith(
         'DELETE',
         'http://example.com/oboez',
         undefined,
         jasmine.any(Function),
         jasmine.any(Function)
      )   
   })   
     
         
   // POST
   it('can make a post', function(){
         
      oboe.doPost('http://example.com/oboez', 'my_data', callbackPlaceholder)
      
      expect( streamingXhr ).toHaveBeenCalledWith(
         'POST',
         'http://example.com/oboez',
         'my_data',
         jasmine.any(Function),
         jasmine.any(Function)
      )   
   })
   
   it('can make a can post an object', function(){
         
      oboe.doPost('http://example.com/oboez', [1,2,3,4,5], callbackPlaceholder)
      
      expect( streamingXhr ).toHaveBeenCalledWith(
         'POST',
         'http://example.com/oboez',
         [1,2,3,4,5],
         jasmine.any(Function),
         jasmine.any(Function)
      )   
   })   
   
   it('can make a post via options object', function(){   
         
      oboe.doPost({url: 'http://example.com/oboez', body:'my_data', success: callbackPlaceholder})
      
      expect( streamingXhr ).toHaveBeenCalledWith(
         'POST',
         'http://example.com/oboez',
         'my_data',
         jasmine.any(Function),
         jasmine.any(Function)
      )   
   })   
   
   // PUT   
   it('can make a put', function(){
         
      oboe.doPut('http://example.com/oboez', 'my_data', callbackPlaceholder)
      
      expect( streamingXhr ).toHaveBeenCalledWith(
         'PUT',
         'http://example.com/oboez',
         'my_data',
         jasmine.any(Function),
         jasmine.any(Function)
      )   
   })
      
});



