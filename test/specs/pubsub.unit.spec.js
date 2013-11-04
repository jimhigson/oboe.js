describe('pub sub', function(){

   it('is able to subscribe', function(){
   
      var events = pubSub();
      
      expect(function(){
         events.on('somethingHappening', function(){});
      }).not.toThrow();
   
   });
   
   it('is able to notify a subscribed function without an event object', function(){
   
      var events = pubSub(),
          listener = jasmine.createSpy('listener');
      

      events.on('somethingHappening', listener);
      
      events.emit('somethingHappening');
      
      expect(listener).toHaveBeenCalled();
   });
   
   it('is able to notify a subscribed function without a single event object', function(){
   
      var events = pubSub(),
          listener = jasmine.createSpy('listener');      

      events.on('somethingHappening', listener);
      
      events.emit('somethingHappening', 'somethingFunky');
      
      expect(listener).toHaveBeenCalledWith('somethingFunky');
   });   
   
   it('notifies of new listeners when added with an id', function() {
      var events = pubSub(),
          listenerListener = jasmine.createSpy('listenerListener');      

      events.on('newListener', listenerListener);
      events.on('foo', noop, 'id1');
            
      expect(listenerListener).toHaveBeenCalledWith('foo', noop, 'id1');   
   });
   
   it('notifies of new listeners when added without an id', function() {
      var events = pubSub(),
          listenerListener = jasmine.createSpy('listenerListener');      

      events.on('newListener', listenerListener);
      events.on('foo', noop);
            
      expect(listenerListener).toHaveBeenCalledWith('foo', noop, noop);   
   });   
   
   it('can pass through multiple parameters', function(){
   
      var events = pubSub(),
          listener = jasmine.createSpy('listener');
       
      events.on('somethingHappening', listener);
      
      events.emit('somethingHappening', 'a', 'b', 'c');
      
      expect(listener).toHaveBeenCalledWith('a', 'b', 'c');
   });   
   
   it('notifies multiple listeners of the same event', function(){
   
      var events = pubSub(),
          listenerA = jasmine.createSpy('listenerA'),
          listenerA2 = jasmine.createSpy('listenerA2');
      
      events.on('eventA', listenerA);
      events.on('eventA', listenerA2);
      
      events.emit('eventA');
      
      expect(listenerA).toHaveBeenCalled();
      expect(listenerA2).toHaveBeenCalled();           
   });
   
   it('allows many listeners to be registered for an event', function(){
   
      var events = pubSub(),
          listenerA = jasmine.createSpy('listenerA'),
          listenerB = jasmine.createSpy('listenerB');
      
      events.on('popularEventA', listenerA);
      events.on('popularEventA', listenerA);
      events.on('popularEventA', listenerA);

      events.on('popularEventB', listenerB);
      events.on('popularEventB', listenerB);
      events.on('popularEventB', listenerB);
      
      events.on('popularEventA', listenerA);
      events.on('popularEventA', listenerA);
      events.on('popularEventA', listenerA);

      events.on('popularEventB', listenerB);
      events.on('popularEventB', listenerB);
      events.on('popularEventB', listenerB);
      
      events.on('popularEventA', listenerA);
      events.on('popularEventA', listenerA);
      events.on('popularEventA', listenerA);
      
      events.on('popularEventB', listenerB);
      events.on('popularEventB', listenerB);
      events.on('popularEventB', listenerB);
                       
      events.emit('popularEventB');
      events.emit('popularEventA');
      events.emit('popularEventB');
      events.emit('popularEventA');
      
      expect(listenerA.calls.length).toBe(18);
      expect(listenerB.calls.length).toBe(18);           
   });   
   
   it('has a chainable on function', function(){
   
      var events = pubSub(),
          listenerA = jasmine.createSpy('listenerA'),
          listenerB = jasmine.createSpy('listenerB');
      
      events.on('eventA', listenerA)
            .on('eventA', listenerB)
            .emit('eventA');
      
      expect(listenerA).toHaveBeenCalled();
      expect(listenerB).toHaveBeenCalled();           
   });      
   
   it('should notify of the correct event', function(){
   
      var events = pubSub(),
          listenerA = jasmine.createSpy('listenerA'),
          listenerB = jasmine.createSpy('listenerB');
      

      events.on('eventA', listenerA);
      events.on('eventB', listenerB);
      
      events.emit('eventA');
      
      expect(listenerA).toHaveBeenCalled();
      expect(listenerB).not.toHaveBeenCalled();
      
      events.emit('eventB');
      
      expect(listenerB).toHaveBeenCalled();      
   });
   
   it('allows an event to be removed', function(){
   
      var events = pubSub(),
          listenerA  = jasmine.createSpy('listenerA'),
          listenerA2 = jasmine.createSpy('listenerA2'),
          listenerB  = jasmine.createSpy('listenerB');
      
      events.on('eventA', listenerA);
      events.on('eventA', listenerA2);
      events.on('eventB', listenerB);
      
      events.emit('eventA');
      events.emit('eventB');
      
      expect(listenerA.calls.length).toBe(1);      
      
      events.un('eventA', listenerA);      

      events.emit('eventA');

      expect(listenerA.calls.length).toBe(1);
      expect(listenerA2.calls.length).toBe(2);      
   });
   
   it('allows an event to be removed by an id', function(){
      var events = pubSub(),
          listenerFoo         = jasmine.createSpy('listenerFoo'),
          listenerBar         = jasmine.createSpy('listenerBar'),
          listenerUnrelated   = jasmine.createSpy('listenerUnrelated');
      
      events.on('eventA', listenerFoo,  'FOO_ID');
      events.on('eventA', listenerBar, 'BAR_ID');
      events.on('eventB', listenerUnrelated);
      
      events.emit('eventA');
      events.emit('eventB');
      
      expect(listenerFoo.calls.length).toBe(1);      
      
      events.un('eventA', 'FOO_ID');      

      events.emit('eventA');

      expect(listenerFoo.calls.length).toBe(1);
      expect(listenerBar.calls.length).toBe(2);
      
      events.un('eventA', 'BAR_ID');
      events.emit('eventA');          
           
      expect(listenerBar.calls.length).toBe(2);       
   })
   
   it('allows an event to be removed by an id', function(){
      var events = pubSub(),
          listenerA  = jasmine.createSpy('listenerA'),
          listenerA2 = jasmine.createSpy('listenerA2'),
          listenerB  = jasmine.createSpy('listenerB');
      
      events.on('eventA', listenerA,  'id1');
      events.on('eventA', listenerA2, 'id2');
      events.on('eventB', listenerB);
      
      events.emit('eventA');
      events.emit('eventB');
      
      expect(listenerA.calls.length).toBe(1);      
      
      events.un('eventA', 'id1');      

      events.emit('eventA');

      expect(listenerA.calls.length).toBe(1);
      expect(listenerA2.calls.length).toBe(2);     
   })

   it('does not fire removeListener if nothing is removed', function() {
      
      var events = pubSub(),   
          removeListenerListener = jasmine.createSpy('removeListenerListener'),
          fooListener = jasmine.createSpy('fooListener');
      
      events.on('removeListener', removeListenerListener);

      events.on('foo', fooListener);
      events.un('foo', 'wrong_item');
       
      expect(removeListenerListener).not.toHaveBeenCalled();         
   });
   
   it('fires removeListener when a listener is removed', function(){
      var events = pubSub(),   
          removeListenerListener = jasmine.createSpy('removeListenerListener');
   
      events.on('removeListener', removeListenerListener);
      
      events.on('foo', noop);
      events.un('foo', noop);
      
      expect(removeListenerListener).toHaveBeenCalledWith('foo', noop, noop);     
   })
   
   it('allows a cleanup function to be called when a listener is removed ' +
      'by specifying callback', function() {
      var events = pubSub(),   
          removeListenerListener = jasmine.createSpy('removeListenerListener');
   
      events.on('removeListener', removeListenerListener);
      
      events.on('foo', noop, 'a');
      events.un('foo', 'a');
      
      expect(removeListenerListener).toHaveBeenCalledWith('foo', noop, 'a');     
   })               
   
   it('handles numberic event codes', function(){
   
      var events = pubSub(),
          listenerA = jasmine.createSpy('listenerA'),
          listenerB = jasmine.createSpy('listenerB');
      

      events.on(1, listenerA);
      events.on(2, listenerB);
      
      events.emit(1);
      
      expect(listenerA).toHaveBeenCalled();
      expect(listenerB).not.toHaveBeenCalled();
      
      events.emit(2);
      
      expect(listenerB).toHaveBeenCalled();      
   });   
   
   it('does not crash if asked to emit an event that has no listeners', function(){
   
      var events = pubSub();
      
      expect(function(){
      
         events.emit('unknown event');
      
      }).not.toThrow();
   
   });   
   
         
});