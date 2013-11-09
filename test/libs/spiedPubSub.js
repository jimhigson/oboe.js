function spiedPubSub() {

   var realPubSub = pubSub();

   return function( eventName ) {
        
      var single = realPubSub(eventName);
   
      if( !single.emit.isSpy ) {   
         spyOn( single, 'emit' ).andCallThrough();
         spyOn( single, 'on'   ).andCallThrough();
         spyOn( single, 'un'   ).andCallThrough();
      }
      
      return single;
   }
}   