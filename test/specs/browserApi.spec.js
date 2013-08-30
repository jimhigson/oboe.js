
/*
   Tests that calling .doGet(), .doPost(), .doPut(), .doDelete() pass through to streamingXhr
   correctly. streamingXhr is a stub so no actual calls are made. 
   
   Technically this tests some of instanceController.js as well as browserApi.js but the tests were
   written before the logic was split into two.
 */

describe("browser api", function(){

   describe("propagates through to streaming xhr", function(){

      var callbackPlaceholder = function(){},
          lastCreatedSxhr;
   
      beforeEach(function() {
         spyOn(window, 'streamingXhr').andCallFake(function(){

            lastCreatedSxhr = {
               req:  jasmine.createSpy('streamingXhr().req'),            
               abort:jasmine.createSpy('streamingXhr().abort')
            };
             
            return lastCreatedSxhr; 
         });      
      });
      afterEach(function(){
         lastCreatedSxhr = null;
      });
   
      describe('get', function(){
         
         it('works via arguments', function(){   
         
            oboe.doGet('http://example.com/oboez', callbackPlaceholder)
         
            expect(lastCreatedSxhr.req).toHaveBeenCalledWith(
                'GET',
                'http://example.com/oboez',
                undefined
            )      
               
         })
            
         it('works via options object', function(){   
              
            oboe.doGet({url: 'http://example.com/oboez', success: callbackPlaceholder})
            
            expect(lastCreatedSxhr.req).toHaveBeenCalledWith(
               'GET',
               'http://example.com/oboez',
               undefined
            )   
         })
            
      });
      
      describe('delete', function(){
         it('works via arguments', function(){
              
            oboe.doDelete('http://example.com/oboez', callbackPlaceholder)
          
            expect(lastCreatedSxhr.req).toHaveBeenCalledWith(
               'DELETE',
               'http://example.com/oboez',
               undefined
            )
         })
         
         it('works via options object', function(){   
               
            oboe.doDelete({url: 'http://example.com/oboez', success: callbackPlaceholder})
            
            expect(lastCreatedSxhr.req).toHaveBeenCalledWith(
               'DELETE',
               'http://example.com/oboez',
               undefined
            )   
         })   
      });
        
            
      describe('post', function(){
         it('works via arguments', function(){
               
            oboe.doPost('http://example.com/oboez', 'my_data', callbackPlaceholder)
            
            expect(lastCreatedSxhr.req).toHaveBeenCalledWith(
               'POST',
               'http://example.com/oboez',
               'my_data'
            )   
         })
         
         it('can post an object', function(){
               
            oboe.doPost('http://example.com/oboez', [1,2,3,4,5], callbackPlaceholder)
            
            expect(lastCreatedSxhr.req).toHaveBeenCalledWith(
               'POST',
               'http://example.com/oboez',
               [1,2,3,4,5]
            )   
         })   
         
         it('works via options object', function(){   
               
            oboe.doPost({url: 'http://example.com/oboez', body:'my_data', success: callbackPlaceholder})
            
            expect(lastCreatedSxhr.req).toHaveBeenCalledWith(
               'POST',
               'http://example.com/oboez',
               'my_data'
            )   
         })   
      });
      
      describe('put', function(){   
         it('can put a string', function(){
               
            oboe.doPut('http://example.com/oboez', 'my_data', callbackPlaceholder)
            
            expect(lastCreatedSxhr.req).toHaveBeenCalledWith(
               'PUT',
               'http://example.com/oboez',
               'my_data'
            )   
         })
      });
      
   });
      
});



