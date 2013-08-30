describe('pub sub', function(){

   it('should be able to subscribe', function(){
   
      var events = pubSub();
      
      expect(function(){
         events.on('somethingHappening', function(){});
      }).not.toThrow();
   
   });
   
   it('should be able to notify a subscribed function', function(){
   
      var events = pubSub(),
          listener = jasmine.createSpy('listener');
      

      events.on('somethingHappening', listener);
      
      events.notify('somethingHappening');
      
      expect(listener).toHaveBeenCalled();
   });
   
   it('should pass arguments through', function(){
   
      var events = pubSub(),
          listener = jasmine.createSpy('listener');
      

      events.on('somethingHappening', listener);
      
      events.notify('somethingHappening', 'a', 'b', 'c');
      
      expect(listener).toHaveBeenCalledWith('a', 'b', 'c');
   });   
   
   it('should notify of the correct event', function(){
   
      var events = pubSub(),
          listenerA = jasmine.createSpy('listenerA'),
          listenerB = jasmine.createSpy('listenerB');
      

      events.on('eventA', listenerA);
      events.on('eventB', listenerB);
      
      events.notify('eventA');
      
      expect(listenerA).toHaveBeenCalled();
      expect(listenerB).not.toHaveBeenCalled();
      
      events.notify('eventB');
      
      expect(listenerB).toHaveBeenCalled();      
   });
   
         
});