
/*
   Tests that calling .doGet(), .doPost(), .doPut(), .doDelete() pass through to streamingXhr
   correctly. streamingXhr is a stub so no actual calls are made. 
   
   Technically this tests some of instanceController.js as well as browserApi.js but the tests were
   written before the logic was split into two.
 */

describe("browser api", function(){
   "use strict";

   describe("propagates through to streaming xhr", function(){

      var callbackPlaceholder = function(){};
   
      beforeEach(function() {
         spyOn(window, 'streamingXhr');      
      });
   
      describe('get', function(){
         
         it('works via arguments', function(){   
         
            oboe.doGet('http://example.com/oboez', callbackPlaceholder)
         
            expect(streamingXhr).toHaveBeenCalledWith(
                jasmine.any(Function),
                jasmine.any(Function),
                'GET',
                'http://example.com/oboez',
                undefined,
                undefined                
            )      
               
         })
            
         it('works via options object', function(){   
              
            oboe.doGet({url: 'http://example.com/oboez', success: callbackPlaceholder})
            
            expect(streamingXhr).toHaveBeenCalledWith(
               jasmine.any(Function), 
               jasmine.any(Function),
               'GET',
               'http://example.com/oboez',
               undefined,
               undefined
            )   
         })
         
         it('propogates headers', function(){

            var headers = {'X-HEADER-1':'value1', 'X-HEADER-2':'value2'};
            
            oboe.doGet({url: 'http://example.com/oboez', 
                        success: callbackPlaceholder, 
                        headers:headers})
            
            expect(streamingXhr).toHaveBeenCalledWith(
               jasmine.any(Function), 
               jasmine.any(Function),
               'GET',
               'http://example.com/oboez',
               undefined,
               headers
            )   
         })         
            
      });
      
      describe('delete', function(){
         it('works via arguments', function(){
              
            oboe.doDelete('http://example.com/oboez', callbackPlaceholder)
          
            expect(streamingXhr).toHaveBeenCalledWith(
               jasmine.any(Function), 
               jasmine.any(Function),
               'DELETE',
               'http://example.com/oboez',
               undefined,
               undefined               
            )
         })
         
         it('works via options object', function(){   
               
            oboe.doDelete({url: 'http://example.com/oboez', success: callbackPlaceholder})
            
            expect(streamingXhr).toHaveBeenCalledWith(
               jasmine.any(Function), 
               jasmine.any(Function),
               'DELETE',
               'http://example.com/oboez',
               undefined,
               undefined               
            )   
         })   
      });
        
            
      describe('post', function(){
         it('works via arguments', function(){
               
            oboe.doPost('http://example.com/oboez', 'my_data', callbackPlaceholder)
            
            expect(streamingXhr).toHaveBeenCalledWith(
               jasmine.any(Function), 
               jasmine.any(Function),
               'POST',
               'http://example.com/oboez',
               'my_data',
               undefined               
            )   
         })
         
         it('can post an object', function(){
               
            oboe.doPost('http://example.com/oboez', [1,2,3,4,5], callbackPlaceholder)
            
            expect(streamingXhr).toHaveBeenCalledWith(
               jasmine.any(Function), 
               jasmine.any(Function),
               'POST',
               'http://example.com/oboez',
               [1,2,3,4,5],
               undefined               
            )   
         })   
         
         it('works via options object', function(){   
               
            oboe.doPost({url: 'http://example.com/oboez', body:'my_data', success: callbackPlaceholder})
            
            expect(streamingXhr).toHaveBeenCalledWith(
               jasmine.any(Function), 
               jasmine.any(Function),
               'POST',
               'http://example.com/oboez',
               'my_data',
               undefined               
            )   
         })   
      });
      
      describe('put', function(){   
         it('can put a string', function(){
               
            oboe.doPut('http://example.com/oboez', 'my_data', callbackPlaceholder)
            
            expect(streamingXhr).toHaveBeenCalledWith(
               jasmine.any(Function), 
               jasmine.any(Function),
               'PUT',
               'http://example.com/oboez',
               'my_data',
               undefined               
            )   
         })
      });
      
   });
      
});



