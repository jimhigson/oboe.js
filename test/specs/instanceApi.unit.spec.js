
describe('instance api',function(){
 
   var emit, on, un, api;
 
   beforeEach(function(){
      var bus = spiedPubSub();
            
      api = instanceApi(bus);      
   });
      
   function anAscent(){
      return list(namedNode(ROOT_PATH, {}) );
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
   
      it('calls node callback when notified of matching node', function() {
      
         var callback = jasmine.createSpy('node callback');
      
         api.on('node', 'a_pattern', callback); 
      
         expect(callback).not.toHaveBeenCalled()
          
         emit( 'node:a_pattern', {}, list(namedNode(ROOT_PATH, {}) ) );

         expect(callback).toHaveBeenCalledWith( {}, [], [{}] );      
      });

      it('calls path callback when notified of matching path', function() {
      
         var callback = jasmine.createSpy('path callback');
      
         api.on('path', 'a_pattern', callback); 
      
         expect(callback).not.toHaveBeenCalled()
          
         emit( 'path:a_pattern', undefined, list(namedNode(ROOT_PATH, undefined) ) );

         expect(callback).toHaveBeenCalledWith( undefined, [], [undefined] );      
      });
         
      it('allows short-cut node matching', function() {
      
         var callback1 = jasmine.createSpy(),
             callback2 = jasmine.createSpy(),
             ascent2 = ascentFrom({ l1:       {l2:      {l3:'leaf'}}});
             
         api.on('node', {
            pattern1: callback1, 
            pattern2: callback2
         }); 
      
         expect(callback1).not.toHaveBeenCalled()
         expect(callback2).not.toHaveBeenCalled()
         
         emit( 'node:pattern1', {}, anAscent())
         
         expect(callback1).toHaveBeenCalled()
         expect(callback2).not.toHaveBeenCalled()
         
         emit( 'node:pattern2', {}, anAscent())
         
         expect(callback2).toHaveBeenCalled()            
      });
      
      it('doesn\'t call node callback on path found', function() {
      
         var callback = jasmine.createSpy('node callback');
      
         api.on('node', 'a_pattern', callback); 
      
         expect(callback).not.toHaveBeenCalled()
          
         emit( 'path:a_pattern', {}, list(namedNode(ROOT_PATH, {}) ) );

         expect(callback).not.toHaveBeenCalled();      
      });   
                    
      it('doesn\'t call again after forget called from inside callback', function() {
      
         var callback = jasmine.createSpy().andCallFake(function(){
            this.forget();
         }),
             ascent = list(namedNode('node', {}));
      
         api.on('node', 'a_pattern', callback);      
                     
         emit( 'node:a_pattern', {}, ascent);
         
         expect(callback.call.length).toBe(1)      
         
         emit( 'node:a_pattern', {}, ascent);
         
         expect(callback.calls.length).toBe(1)   
      });           
   });


   describe('when errors occur in callbacks', function(){

      it('is protected from error in node callback', function() {
         var e = "an error";  
         var callback = jasmine.createSpy().andThrow(e);
         
         expect(function(){   
            api.on('node', 'a_pattern', callback);
         }).not.toThrow();
            
         emit( 'node:a_pattern', {}, anAscent())
         
         expect(callback).toHaveBeenCalled()
         expect(emit).toHaveBeenCalledWith(FAIL_EVENT, errorReport(undefined, undefined, e))               
      });
      
      it('is protected from error in node callback added via shortcut', function() {
         var e = "an error";  
         var callback = jasmine.createSpy().andThrow(e);
     
         expect(function(){
            api.on('node', {'a_pattern': callback});
         }).not.toThrow(); 
            
         emit( 'node:a_pattern', {}, anAscent())

         expect(callback).toHaveBeenCalled()         
         expect(emit).toHaveBeenCalledWith(FAIL_EVENT, errorReport(undefined, undefined, e))               
      });   
      
      it('is protected from error in path callback', function() {
         var e = "an error";  
         var callback = jasmine.createSpy().andThrow(e);            
   
         expect(function(){   
            api.on('path', 'a_pattern', callback);
         }).not.toThrow();          
            
         emit( 'path:a_pattern', {}, anAscent())
         
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
               
         expect(function(){   
            api.done( callback);
         }).not.toThrow();        
            
         emit( 'node:!', {}, anAscent())
         
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
      var callback = jasmine.createSpy();
   
      api.on('done', callback); 
   
      expect(callback).not.toHaveBeenCalled()
       
      emit( 'node:!', {}, anAscent())
      
      expect(callback).toHaveBeenCalled()      
   });
      
   it('emits ABORTING when .abort() is called', function() {
      api.abort();
      expect(emit).toHaveBeenCalledWith(ABORTING);
   });   

});
