
describe('instance api and pattern adaptor composed',function(){
 
   var emit, on, un, api, matches;
 
   beforeEach(function(){
      var bus = pubSub();
      
      matches = {};
     
      emit = spyOn( bus, 'emit' ).andCallThrough();
      on = spyOn( bus, 'on' ).andCallThrough();
      un = spyOn( bus, 'un' ).andCallThrough();
            
      function jsonPathCompiler(pattern){

         function compiled ( ascent ){         
            if( matches[pattern] === ascent ) {
               return head(ascent);
            } else {
               return false;
            }
         }
         
         return compiled;
      }

      api = instanceApi(bus);
      
      // For now, tie the patternAdapter into the bus. Split tests up
      // once this works:      
      patternAdapter(bus, jsonPathCompiler);
   });
      
   function anAscentMatching(pattern) {
      var ascent = list(namedNode('node', {}));

      matches[pattern] = ascent;  

      return ascent;
   }
 
   it('has chainable methods that don\'t explode',  function() {
      // test that nothing forgot to return 'this':

      expect(function(){      
         function fn(){}
             
         api
            .path('*', fn)
            .node('*', fn)
            .fail(fn).path('*', fn)
            .path({'*':fn})
            .node({'*': fn})
            .done(fn)
            .path({'*':fn})
            .start(fn)
            .on('path','*', fn)
            .on('node','*', fn)
            .fail(fn)
            .on('path','*', fn)
            .on('path',{'*':fn})
            .on('node',{'*': fn})
            .on('path',{'*':fn})
            .on('done',fn)
            .on('start',fn);   
      }).not.toThrow();
   })

   describe('header method', function(){

      it('returns undefined if not available', function() {
            
         expect( api.header() ).toBeUndefined();         
      });
      
      it('can provide object once available', function() {
   
         var headers = {"x-remainingRequests": 100};
         
         emit( HTTP_START, 200, headers );
         
         expect( api.header() ).toEqual(headers);   
      });
      
      it('can provide single header once available', function() {
         var headers = {"x-remainingRequests": 100};
         
         emit( HTTP_START, 200, headers );
         
         expect( api.header('x-remainingRequests') ).toEqual(100);   
      });
      
      it('gives undefined for non-existent single header', function() {
         var headers = {"x-remainingRequests": 100};
         
         emit( HTTP_START, 200, headers );
         
         expect( api.header('x-remainingBathtubs') ).toBeUndefined();   
      });
   });
   
   describe('root method', function(){
      
      it('returns undefined if not available', function() {
            
         expect( api.root() ).toBeUndefined();         
      });
      
      it('can provide object once available', function() {
   
         var root = {I:'am', the:'root'};
         
         emit( ROOT_FOUND,  root);
         
         expect( api.root() ).toEqual(root);   
      });      
   });      
 
   describe('node and path callbacks', function(){
      it('calls node callback on matching node', function() {
      
         var callback = jasmine.createSpy('node callback'),
             ascent = anAscentMatching('a_pattern');
      
         api.on('node', 'a_pattern', callback); 
      
         expect(callback).not.toHaveBeenCalled()
          
         emit( NODE_FOUND, ascent)

         expect(callback).toHaveBeenCalled()      
      });
      
      it('calls path callback on matching path', function() {
      
         var callback = jasmine.createSpy(),
             ascent = anAscentMatching('a_pattern');
      
         api.on('path', 'a_pattern', callback); 
      
         expect(callback).not.toHaveBeenCalled()
         
         emit( PATH_FOUND, ascent)
         
         expect(callback).toHaveBeenCalled()      
      });
      
      it('does not call node callback on non-matching node', function() {
      
         var callback = jasmine.createSpy(),
             ascent = anAscentMatching('a_pattern');
      
         api.on('node', 'a_different_pattern', callback); 
            
         emit( NODE_FOUND, ascent)
         
         expect(callback).not.toHaveBeenCalled()      
      });   
                  
      it('calls node callback again on second match', function() {
      
         var callback = jasmine.createSpy(),
             ascent = anAscentMatching('a_pattern');
      
         api.on('node', 'a_pattern', callback); 
            
         emit( NODE_FOUND, ascent)
         
         expect(callback.call.length).toBe(1)      
         
         emit( NODE_FOUND, ascent)
         
         expect(callback.calls.length).toBe(2)
      });   
                           
   });
       
});
