
describe('instance api',function(){
 
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
      
      api = instanceApi(emit, on, un, jsonPathCompiler);      
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
      
         var callback = jasmine.createSpy(),
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
      
    
      it('allows short-cut node matching', function() {
      
         var callback1 = jasmine.createSpy(),
             callback2 = jasmine.createSpy(),
             ascent1 = anAscentMatching('pattern1'),
             ascent2 = anAscentMatching('pattern2');
             
         api.on('node', {
            pattern1: callback1, 
            pattern2: callback2
         }); 
      
         expect(callback1).not.toHaveBeenCalled()
         expect(callback2).not.toHaveBeenCalled()
         
         emit( NODE_FOUND, ascent1)
         
         expect(callback1).toHaveBeenCalled()
         expect(callback2).not.toHaveBeenCalled()
         
         emit( NODE_FOUND, ascent2)
         
         expect(callback2).toHaveBeenCalled()            
      });
   
      it('doesn\'t call node callback on path found', function() {
      
         var callback = jasmine.createSpy(),
             ascent = anAscentMatching('a_pattern');
      
         api.on('node', 'a_pattern', callback); 
            
         emit( PATH_FOUND, ascent)
         
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
      
         
      it('doesn\'t call again after forget called from inside callback', function() {
      
         var callback = jasmine.createSpy().andCallFake(function(){
            this.forget();
         }),
             ascent = anAscentMatching('a_pattern');
      
         api.on('node', 'a_pattern', callback);      
                     
         emit( NODE_FOUND, ascent)
         
         expect(callback.call.length).toBe(1)      
         
         emit( NODE_FOUND, ascent)
         
         expect(callback.calls.length).toBe(1)   
      });   
            
   });
   
   describe('when errors occur in callbacks', function(){
   
      it('is protected from error in node callback', function() {
         var e = "an error";  
         var callback = jasmine.createSpy().andThrow(e);
         var ascent = anAscentMatching('a_pattern');      
   
         expect(function(){   
            api.on('node', 'a_pattern', callback);
         }).not.toThrow();
            
         emit( NODE_FOUND, ascent)
         
         expect(callback).toHaveBeenCalled()
         expect(emit).toHaveBeenCalledWith(FAIL_EVENT, errorReport(undefined, undefined, e))               
      });
      
      it('is protected from error in node callback added via shortcut', function() {
         var e = "an error";  
         var callback = jasmine.createSpy().andThrow(e);
         var ascent = anAscentMatching('a_pattern');      
      
         expect(function(){
            api.on('node', {'a_pattern': callback});
         }).not.toThrow(); 
            
         emit( NODE_FOUND, ascent)

         expect(callback).toHaveBeenCalled()         
         expect(emit).toHaveBeenCalledWith(FAIL_EVENT, errorReport(undefined, undefined, e))               
      });   
      
      it('is protected from error in path callback', function() {
         var e = "an error";  
         var callback = jasmine.createSpy().andThrow(e);
         var ascent = anAscentMatching('a_pattern');            
   
         expect(function(){   
            api.on('path', 'a_pattern', callback);
         }).not.toThrow();          
            
         emit( PATH_FOUND, ascent)
         
         expect(callback).toHaveBeenCalled()
         expect(emit).toHaveBeenCalledWith(FAIL_EVENT, errorReport(undefined, undefined, e))   
      });   
   
      it('is protected from error in start callback', function() {
         var e = "an error";   
         var callback = jasmine.createSpy().andThrow(e);            
   
         expect(function(){   
            api.on('start', callback);
         }).not.toThrow();        
            
         emit( HTTP_START)
         
         expect(callback).toHaveBeenCalled()
         expect(emit).toHaveBeenCalledWith(FAIL_EVENT, errorReport(undefined, undefined, e))   
      });   
      
      it('is protected from error in done callback', function() {
         var e = "an error";   
         var callback = jasmine.createSpy().andThrow(e);
         var ascent = anAscentMatching('!');            
   
         expect(function(){   
            api.done( callback);
         }).not.toThrow();        
            
         emit( NODE_FOUND, ascent)
         
         expect(callback).toHaveBeenCalled()
         expect(emit).toHaveBeenCalledWith(FAIL_EVENT, errorReport(undefined, undefined, e))      
      });
   });
   
   it('adds as standard event if unknown event type is listened to', function() {
      var spy1 = jasmine.createSpy();
      var spy2 = jasmine.createSpy();
      
      expect(function(){         
         api
            .on('xyzzy', spy1)
            .on('end_of_universe', spy2);
      }).not.toThrow();
      
      expect( on ).toHaveBeenCalledWith('xyzzy', spy1);
      expect( on ).toHaveBeenCalledWith('end_of_universe', spy2);
   });   
   
   it('calls done callback on end of JSON', function() {
      var callback = jasmine.createSpy(),
          rootAscent = anAscentMatching('!');
   
      api.on('done', callback); 
   
      expect(callback).not.toHaveBeenCalled()
       
      emit( NODE_FOUND, rootAscent)
      
      expect(callback).toHaveBeenCalled()      
   });
      
   it('emits ABORTING when .abort() is called', function() {
      api.abort();
      expect(emit).toHaveBeenCalledWith(ABORTING);
   });   

});
