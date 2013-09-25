
/*
   Tests that calling .doGet(), .doPost(), .doPut(), .doDelete() pass through to streamingXhr
   correctly. streamingXhr is a stub so no actual calls are made. 
   
   Technically this tests some of instanceController.js as well as browserApi.js but the tests were
   written before the logic was split into two.
 */

describe("browser api", function(){
   "use strict";

   describe("propagates through to wiring function", function(){

      var callbackFunction = function(){};
   
      beforeEach(function() {
         spyOn(window, 'wire');      
      });

      it('exports a usable function for GETs', function(){   
      
         oboe('http://example.com/oboez', callbackFunction)
      
         expect(wire).toHaveBeenCalledWith(
             'GET',
             'http://example.com/oboez',
             undefined,
             callbackFunction
         )      
      })
      
      it('exports a usable function for GETs with a callback function', function(){   
      
         oboe('http://example.com/oboez')
      
         expect(wire).toHaveBeenCalledWith(
             'GET',
             'http://example.com/oboez',
             undefined,                
             undefined                
         )      
      })      

   
      describe('get', function(){
         
         it('works via arguments', function(){   
         
            oboe.doGet('http://example.com/oboez', callbackFunction)
         
            expect(wire).toHaveBeenCalledWith(
                'GET',
                'http://example.com/oboez',
                undefined,
                callbackFunction         
            )      
               
         })
            
         it('works via options object', function(){   
              
            oboe.doGet({url: 'http://example.com/oboez', complete: callbackFunction})
            
            expect(wire).toHaveBeenCalledWith(              
               'GET',
               'http://example.com/oboez',
               undefined,
               callbackFunction,
               undefined
            )   
         })
         
         it('propogates headers', function(){

            var headers = {'X-HEADER-1':'value1', 'X-HEADER-2':'value2'};
            
            oboe.doGet({url: 'http://example.com/oboez', 
                        complete: callbackFunction, 
                        headers:headers})
            
            expect(wire).toHaveBeenCalledWith(              
               'GET',
               'http://example.com/oboez',
               undefined,
               callbackFunction,
               headers
            )   
         })         
            
      });
      
      describe('delete', function(){
         it('works via arguments', function(){
              
            oboe.doDelete('http://example.com/oboez', callbackFunction)
          
            expect(wire).toHaveBeenCalledWith(
               'DELETE',
               'http://example.com/oboez',
               undefined,
               callbackFunction        
            )
         })
         
         it('works via options object', function(){   
               
            oboe.doDelete({url: 'http://example.com/oboez', complete: callbackFunction})
            
            expect(wire).toHaveBeenCalledWith(
               'DELETE',
               'http://example.com/oboez',
               undefined,
               callbackFunction,
               undefined
            )   
         })   
      });
        
            
      describe('post', function(){
         it('works via arguments', function(){
               
            oboe.doPost('http://example.com/oboez', 'my_data', callbackFunction)
            
            expect(wire).toHaveBeenCalledWith(
               'POST',
               'http://example.com/oboez',
               'my_data',               
               callbackFunction        
            )   
         })
         
         it('can post an object', function(){
               
            oboe.doPost('http://example.com/oboez', [1,2,3,4,5], callbackFunction)
            
            expect(wire).toHaveBeenCalledWith(
               'POST',
               'http://example.com/oboez',
               [1,2,3,4,5],               
               callbackFunction        
            )   
         })   
         
         it('works via options object', function(){   
               
            oboe.doPost({url: 'http://example.com/oboez', body:'my_data', complete: callbackFunction})
            
            expect(wire).toHaveBeenCalledWith(              
               'POST',
               'http://example.com/oboez',
               'my_data',
               callbackFunction,
               undefined
            )   
         })   
      });
      
      describe('put', function(){   
         it('can put a string', function(){
               
            oboe.doPut('http://example.com/oboez', 'my_data', callbackFunction)
            
            expect(wire).toHaveBeenCalledWith(
               'PUT',
               'http://example.com/oboez',
               'my_data',
               callbackFunction
            )   
         })
      });
      
   });
      
});



