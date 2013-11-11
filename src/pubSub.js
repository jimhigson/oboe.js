/**
 * pubSub is a curried[1] interface for listening to and emitting
 * events.
 * 
 * If we get a bus:
 *    
 *    var bus = pubSub();
 * 
 * We can listen to event 'foo' like:
 * 
 *    bus('foo').on(myCallback)
 *    
 * And emit event foo like:
 * 
 *    bus('foo').emit()
 *    
 * or, with a parameter:
 * 
 *    bus('foo').emit('bar')
 *     
 * Functions can be cached. Ie:
 * 
 *    var fooEmitter = bus('foo').emit
 *    fooEmitter('bar');  // emit an event
 *    fooEmitter('baz');  // emit another
 *    
 * There's also an uncurried[2] shortcut:
 * 
 *    bus.emit('foo', 'bar')
 * 
 * [1]: http://en.wikipedia.org/wiki/Curry_(programming_language)
 * [2]: http://zvon.org/other/haskell/Outputprelude/uncurry_f.html
 */
function pubSub(){

   var singles = {},
       newListener = newSingle('newListener'),
       removeListener = newSingle('removeListener'); 
      
   function newSingle(eventName) {
      return singles[eventName] = singleEventPubSub(
         eventName, 
         newListener, 
         removeListener
      );   
   }      

   /** pubSub instances are functions */
   function pubSubInstance( eventName ){   
      if( !singles[eventName] ) {
         return newSingle( eventName );
      }
      
      return singles[eventName];   
   }
   
   // convenience EventEmitter-style uncurried form
   pubSubInstance.emit = varArgs(function(eventName, parameters){
      apply( parameters, pubSubInstance( eventName ).emit);
   });
   
   return pubSubInstance;
}