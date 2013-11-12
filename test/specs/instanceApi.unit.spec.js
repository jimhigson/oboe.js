
describe('instance api',function(){
   "use strict";
   
   var oboeBus, oboeInstance;
 
   beforeEach(function(){
      oboeBus = spiedPubSub();
            
      oboeInstance = instanceApi(oboeBus);      
   });
      
   function anAscent(){
      return list(namedNode(ROOT_PATH, {}) );
   }
 
   describe('header method', function(){

      it('returns undefined if not available', function() {
            
         expect( oboeInstance.header() ).toBeUndefined();         
      });
      
      it('can provide object once available', function() {
   
         var headers = {"x-remainingRequests": 100};
         
         oboeBus(HTTP_START).emit( 200, headers );
         
         expect( oboeInstance.header() ).toEqual(headers);   
      });
      
      it('can provide single header once available', function() {
         var headers = {"x-remainingRequests": 100};
         
         oboeBus(HTTP_START).emit( 200, headers );
         
         expect( oboeInstance.header('x-remainingRequests') ).toEqual(100);   
      });
      
      it('gives undefined for non-existent single header', function() {
         var headers = {"x-remainingRequests": 100};
         
         oboeBus(HTTP_START).emit( 200, headers );
         
         expect( oboeInstance.header('x-remainingBathtubs') ).toBeUndefined();   
      });
   });
   
   describe('root method', function(){
      
      it('returns undefined if not available', function() {
            
         expect( oboeInstance.root() ).toBeUndefined();         
      });
      
      it('can provide object once available', function() {
   
         var root = {I:'am', the:'root'};
         
         oboeBus(ROOT_FOUND).emit( root);
         
         expect( oboeInstance.root() ).toEqual(root);   
      });      
   });      
 
   describe('node and path callbacks', function(){
   
      it('calls node callback when notified of matching node', function() {
      
         var callback = jasmine.createSpy('node callback'),
             node = {},
             path = [],
             ancestors = [];
      
         oboeInstance.on('node', 'a_pattern', callback); 
      
         expect(callback).not.toHaveBeenCalled()
          
         oboeBus('node:a_pattern').emit( node, path, ancestors );

         expect(callback).toHaveBeenCalledWith( node, path, ancestors );
      });
      
      it('calls path callback when notified of matching path', function() {
      
         var callback = jasmine.createSpy('path callback'),
             node = {},
             path = [],
             ancestors = [];
      
         oboeInstance.on('path', 'a_pattern', callback); 
      
         expect(callback).not.toHaveBeenCalled()
          
         oboeBus('path:a_pattern').emit( node, path, ancestors );

         expect(callback).toHaveBeenCalledWith( node, path, ancestors );      
      });
         
      it('allows short-cut node matching', function() {
      
         var callback1 = jasmine.createSpy(),
             callback2 = jasmine.createSpy();             
             
         oboeInstance.on('node', {
            pattern1: callback1, 
            pattern2: callback2
         }); 
      
         expect(callback1).not.toHaveBeenCalled()
         expect(callback2).not.toHaveBeenCalled()
         
         oboeBus('node:pattern1').emit( {}, anAscent())
         
         expect(callback1).toHaveBeenCalled()
         expect(callback2).not.toHaveBeenCalled()
         
         oboeBus('node:pattern2').emit( {}, anAscent())
         
         expect(callback2).toHaveBeenCalled()            
      });
      
      it('calls node callback added using 2-arg mode when notified of match to pattern', function() {
      
         var callback = jasmine.createSpy('node callback'),
             node = {},
             path = [],
             ancestors = [];         
      
         oboeInstance.on('node:a_pattern', callback) 
      
         expect(callback).not.toHaveBeenCalled()
          
         oboeBus('node:a_pattern').emit( node, path, ancestors );

         expect(callback).toHaveBeenCalledWith( node, path, ancestors );      
      });
      
      it('allows adding using addListener method', function() {
      
         var callback = jasmine.createSpy('node callback'),
             node = {},
             path = [],
             ancestors = [];         
      
         oboeInstance.addListener('node:a_pattern', callback) 
      
         expect(callback).not.toHaveBeenCalled()
          
         oboeBus('node:a_pattern').emit( node, path, ancestors );

         expect(callback).toHaveBeenCalledWith( node, path, ancestors );      
      });      
      
      it('calls path callback added using 2-arg mode when notified of match to pattern', function() {
      
         var callback = jasmine.createSpy('path callback'),
             node = {},
             path = [],
             ancestors = [];         
      
         oboeInstance.on('path:a_pattern', callback); 
      
         expect(callback).not.toHaveBeenCalled()
          
         oboeBus('path:a_pattern').emit( node, path, ancestors );

         expect(callback).toHaveBeenCalledWith( node, path, ancestors );      
      });      
      
      it('doesn\'t call node callback on path found', function() {
      
         var callback = jasmine.createSpy('node callback');
      
         oboeInstance.on('node', 'a_pattern', callback); 
      
         expect(callback).not.toHaveBeenCalled()
          
         oboeBus('path:a_pattern').emit( {}, list(namedNode(ROOT_PATH, {}) ) );

         expect(callback).not.toHaveBeenCalled();      
      });   
                    
      it('doesn\'t call again after forget called from inside callback', function() {
      
         var callback = jasmine.createSpy().andCallFake(function(){
                           this.forget();
                        }),
             ascent =   list(namedNode('node', {}));
      
         oboeInstance.on('node', 'a_pattern', callback);      
                     
         oboeBus('node:a_pattern').emit( {}, ascent);
         
         expect(callback.call.length).toBe(1)      
         
         oboeBus('node:a_pattern').emit( {}, ascent);
         
         expect(callback.calls.length).toBe(1)   
      });
      
      it('doesn\'t call node callback after callback is removed', function() {
      
         var callback = jasmine.createSpy(),
             ascent = list(namedNode('node', {}));

         oboeInstance.on('node', 'a_pattern', callback);      
         oboeInstance.removeListener('node', 'a_pattern', callback);

         oboeBus('node:a_pattern').emit( {}, ascent);               

         expect(callback).not.toHaveBeenCalled()   
      });
      
      it('doesn\'t call node callback after callback is removed using 2-arg form', function() {
      
         var callback = jasmine.createSpy(),
             ascent = list(namedNode('node', {}));

         oboeInstance.on('node', 'a_pattern', callback);      
         oboeInstance.removeListener('node:a_pattern', callback);

         oboeBus('node:a_pattern').emit( {}, ascent);               

         expect(callback).not.toHaveBeenCalled()   
      });      
      
      it('doesn\'t call path callback after callback is removed', function() {
      
         var callback = jasmine.createSpy(),
             ascent = list(namedNode('path', {}));

         oboeInstance.on('path', 'a_pattern', callback);      
         oboeInstance.removeListener('path', 'a_pattern', callback);

         oboeBus('path:a_pattern').emit( {}, ascent);               

         expect(callback).not.toHaveBeenCalled()   
      });
      
      it('doesn\'t remove callback if wrong pattern is removed', function() {
      
         var callback = jasmine.createSpy(),
             ascent = list(namedNode('node', {}));

         oboeInstance.on('node', 'a_pattern', callback);
               
         oboeInstance.removeListener('node', 'wrong_pattern', callback);

         oboeBus('node:a_pattern').emit( {}, ascent);

         expect(callback).toHaveBeenCalled()   
      });
      
      it('doesn\'t remove callback if wrong callback is removed', function() {
      
         var callback = jasmine.createSpy(),
             wrongCallback = jasmine.createSpy(),
             ascent = list(namedNode('node', {}));

         oboeInstance.on('node', 'a_pattern', callback);
               
         oboeInstance.removeListener('node', 'a_pattern', wrongCallback);

         oboeBus('node:a_pattern').emit( {}, ascent);

         expect(callback).toHaveBeenCalled()   
      });            
      
      it('allows nodes node to be removed in a different ' +
         'style than they were added', function() {
      
         var 
             callback1 = jasmine.createSpy(),
             callback2 = jasmine.createSpy(),
             callback3 = jasmine.createSpy(),
             ascent = list(namedNode('node', {}));

         oboeInstance.node('pattern1', callback1);
         oboeInstance.on('node', 'pattern2', callback2);
         oboeInstance.on('node', {pattern3: callback3});
                        
         oboeInstance.removeListener('node:pattern1', callback1);
         oboeInstance.removeListener('node:pattern2', callback2);
         oboeInstance.removeListener('node:pattern3', callback3);

         oboeBus('node:pattern1').emit( {}, ascent);          
         oboeBus('node:pattern2').emit( {}, ascent);          
         oboeBus('node:pattern3').emit( {}, ascent);          

         expect(callback1).not.toHaveBeenCalled()   
         expect(callback2).not.toHaveBeenCalled()   
         expect(callback3).not.toHaveBeenCalled()   
      });
   });
   
   describe('start event', function() {
      it('notifies .on(start) listener when http response starts', function(){
         var callback = jasmine.createSpy();
      
         oboeInstance.on('start', callback);
         
         expect(callback).not.toHaveBeenCalled()
                   
         oboeBus(HTTP_START).emit( 200, {a_header:'foo'} )
         
         expect(callback).toHaveBeenCalledWith( 200, {a_header:'foo'} )
      });
      
      it('notifies .start listener when http response starts', function(){
         var callback = jasmine.createSpy();
      
         oboeInstance.start(callback);
         
         expect(callback).not.toHaveBeenCalled()
                   
         oboeBus(HTTP_START).emit( 200, {a_header:'foo'} )
         
         expect(callback).toHaveBeenCalledWith( 200, {a_header:'foo'} )
      });       
   
      it('can be de-registered', function() {
         var callback = jasmine.createSpy();
      
         oboeInstance.on('start', callback);
         oboeInstance.removeListener('start', callback);
                   
         oboeBus(HTTP_START).emit( 200, {a_header:'foo'} )
         
         expect(callback).not.toHaveBeenCalled()      
      });
   });
   
     
   describe('done event', function(){
   
      it('calls listener on end of JSON when added using .on(done)', function() {
         var callback = jasmine.createSpy();
      
         oboeInstance.on('done', callback); 
      
         expect(callback).not.toHaveBeenCalled()
          
         oboeBus('node:!').emit( {}, anAscent())
         
         expect(callback).toHaveBeenCalled()      
      });
      
      it('calls listener on end of JSON when added using .done', function() {
         var callback = jasmine.createSpy();
      
         oboeInstance.done(callback); 
      
         expect(callback).not.toHaveBeenCalled()
          
         oboeBus('node:!').emit( {}, anAscent())
         
         expect(callback).toHaveBeenCalled()      
      });      
      
      it('can be de-registered', function() {
         var callback = jasmine.createSpy();
      
         oboeInstance.on('done', callback); 
         oboeInstance.removeListener('done', callback); 
         
         oboeBus('node:!').emit( {}, anAscent())
         
         expect(callback).not.toHaveBeenCalled()      
      });
   });
   
      
   it('emits ABORTING when .abort() is called', function() {
      oboeInstance.abort();
      expect(oboeBus(ABORTING).emit).toHaveBeenCalled()
   });

   describe('errors cases', function(){
   
      describe('calling fail listener', function() {
      
         it('notifies .on(fail) listener when something fails', function(){
            var callback = jasmine.createSpy();
         
            oboeInstance.on('fail', callback);
            
            expect(callback).not.toHaveBeenCalled()
                      
            oboeBus(FAIL_EVENT).emit( 'something went wrong' )
            
            expect(callback).toHaveBeenCalledWith( 'something went wrong' )
         });
         
         it('notifies .fail listener when something fails', function(){
            var callback = jasmine.createSpy();
         
            oboeInstance.fail(callback);
            
            expect(callback).not.toHaveBeenCalled()
                      
            oboeBus(FAIL_EVENT).emit( 'something went wrong' )
            
            expect(callback).toHaveBeenCalledWith( 'something went wrong' )
         });       
      
         it('can be de-registered', function() {
            var callback = jasmine.createSpy();
         
            oboeInstance.on('fail', callback);
            oboeInstance.removeListener('fail', callback);
                      
            oboeBus(FAIL_EVENT).emit( 'something went wrong' )
            
            expect(callback).not.toHaveBeenCalled()      
         });      
      });


      it('is protected from error in node callback', function() {
         var e = "an error";  
         var callback = jasmine.createSpy().andThrow(e);
         
         expect(function(){   
            oboeInstance.on('node', 'a_pattern', callback);
         }).not.toThrow();
            
         oboeBus('node:a_pattern').emit( {}, anAscent())
         
         expect(callback).toHaveBeenCalled()
         expect(oboeBus(FAIL_EVENT).emit)
            .toHaveBeenCalledWith(errorReport(undefined, undefined, e))               
      });
      
      it('is protected from error in node callback added via shortcut', function() {
         var e = "an error";  
         var callback = jasmine.createSpy().andThrow(e);
     
         expect(function(){
            oboeInstance.on('node', {'a_pattern': callback});
         }).not.toThrow(); 
            
         oboeBus('node:a_pattern').emit( {}, anAscent())

         expect(callback).toHaveBeenCalled()         
         expect(oboeBus(FAIL_EVENT).emit)
            .toHaveBeenCalledWith(errorReport(undefined, undefined, e))               
      });   
      
      it('is protected from error in path callback', function() {
         var e = "an error";  
         var callback = jasmine.createSpy().andThrow(e);            
   
         expect(function(){   
            oboeInstance.on('path', 'a_pattern', callback);
         }).not.toThrow();          
            
         oboeBus('path:a_pattern').emit( {}, anAscent())
         
         expect(callback).toHaveBeenCalled()
         expect(oboeBus(FAIL_EVENT).emit)
            .toHaveBeenCalledWith(errorReport(undefined, undefined, e))   
      });   
   
      it('is protected from error in start callback', function() {
         var e = "an error";   
         var callback = jasmine.createSpy().andThrow(e);            
   
         expect(function(){   
            oboeInstance.on('start', callback);
         }).not.toThrow();        
            
         oboeBus(HTTP_START).emit()
         
         expect(callback).toHaveBeenCalled()
         expect(oboeBus(FAIL_EVENT).emit)
            .toHaveBeenCalledWith(errorReport(undefined, undefined, e))   
      });   
      
      it('is protected from error in done callback', function() {
         var e = "an error";   
         var callback = jasmine.createSpy().andThrow(e);
               
         expect(function(){   
            oboeInstance.done( callback);
         }).not.toThrow();        
            
         oboeBus( 'node:!').emit( {}, anAscent())
         
         expect(callback).toHaveBeenCalled()
         expect(oboeBus(FAIL_EVENT).emit)
            .toHaveBeenCalledWith(errorReport(undefined, undefined, e))      
      });
      
   });
   
   describe('unknown event types', function() {
   
      it('can be added and fired', function() {
         var spy1 = jasmine.createSpy();
         var spy2 = jasmine.createSpy();
         
         expect(function(){         
            oboeInstance
               .on('xyzzy', spy1)
               .on('end_of_universe', spy2);
         }).not.toThrow();
         
         oboeInstance.emit('xyzzy', 'hello');
         oboeInstance.emit('end_of_universe', 'oh no!');
            
         expect( spy1 ).toHaveBeenCalledWith('hello');
         expect( spy2 ).toHaveBeenCalledWith('oh no!');
      });
      
      it('is allows removal', function() {
         var spy1 = jasmine.createSpy();
         var spy2 = jasmine.createSpy();
         
         oboeInstance
            .on('xyzzy', spy1)
            .on('end_of_universe', spy2);
            
         oboeInstance.removeListener('xyzzy', spy1);
         oboeInstance.removeListener('end_of_universe', spy2);
         
         oboeInstance.emit('xyzzy', 'hello');
         oboeInstance.emit('end_of_universe', 'oh no!');
            
         expect( spy1 ).not.toHaveBeenCalled()
         expect( spy2 ).not.toHaveBeenCalled()
      });      
   });   
      

});
