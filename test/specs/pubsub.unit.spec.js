describe('pub sub', function(){

   it('should be able to subscribe', function(){
   
      var events = pubSub();
      
      expect(function(){
         events.on('somethingHappening', function(){});
      }).not.toThrow();
   
   });
   
   it('should be able to notify a subscribed function without an event object', function(){
   
      var events = pubSub(),
          listener = jasmine.createSpy('listener');
      

      events.on('somethingHappening', listener);
      
      events.fire('somethingHappening');
      
      expect(listener).toHaveBeenCalled();
   });
   
   it('should pass first argument through as the event', function(){
   
      var events = pubSub(),
          listener = jasmine.createSpy('listener');
       
      events.on('somethingHappening', listener);
      
      events.fire('somethingHappening', 'a', 'b', 'c');
      
      expect(listener).toHaveBeenCalledWith('a');
   });   
   
   it('should notify multiple listeners of the same event', function(){
   
      var events = pubSub(),
          listenerA = jasmine.createSpy('listenerA'),
          listenerA2 = jasmine.createSpy('listenerA2');
      
      events.on('eventA', listenerA);
      events.on('eventA', listenerA2);
      
      events.fire('eventA');
      
      expect(listenerA).toHaveBeenCalled();
      expect(listenerA2).toHaveBeenCalled();           
   });
   
   it('should allow many listeners to be registered for an event', function(){
   
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
                       
      events.fire('popularEventB');
      events.fire('popularEventA');
      events.fire('popularEventB');
      events.fire('popularEventA');
      
      expect(listenerA.calls.length).toBe(18);
      expect(listenerB.calls.length).toBe(18);           
   });   
   
   it('should have a chainable on function', function(){
   
      var events = pubSub(),
          listenerA = jasmine.createSpy('listenerA'),
          listenerB = jasmine.createSpy('listenerB');
      
      events.on('eventA', listenerA)
            .on('eventA', listenerB)
            .fire('eventA');
      
      expect(listenerA).toHaveBeenCalled();
      expect(listenerB).toHaveBeenCalled();           
   });      
   
   it('should notify of the correct event', function(){
   
      var events = pubSub(),
          listenerA = jasmine.createSpy('listenerA'),
          listenerB = jasmine.createSpy('listenerB');
      

      events.on('eventA', listenerA);
      events.on('eventB', listenerB);
      
      events.fire('eventA');
      
      expect(listenerA).toHaveBeenCalled();
      expect(listenerB).not.toHaveBeenCalled();
      
      events.fire('eventB');
      
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
      
      events.fire('eventA');
      events.fire('eventB');
      
      expect(listenerA.calls.length).toBe(1);      
      
      events.un('eventA', listenerA);      

      events.fire('eventA');

      expect(listenerA.calls.length).toBe(1);
      expect(listenerA2.calls.length).toBe(2);      
   });   
   
   it('should handle numberic event codes', function(){
   
      var events = pubSub(),
          listenerA = jasmine.createSpy('listenerA'),
          listenerB = jasmine.createSpy('listenerB');
      

      events.on(1, listenerA);
      events.on(2, listenerB);
      
      events.fire(1);
      
      expect(listenerA).toHaveBeenCalled();
      expect(listenerB).not.toHaveBeenCalled();
      
      events.fire(2);
      
      expect(listenerB).toHaveBeenCalled();      
   });   
   
   it('should not crash if asked to fire an event that has no listeners', function(){
   
      var events = pubSub();
      
      expect(function(){
      
         events.fire('unknown event');
      
      }).not.toThrow();
   
   });   
   
         
});