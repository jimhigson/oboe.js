/** 
 * A pub/sub which is responsible for a single event type. A 
 * multi-event type event bus is created by pubSub by collecting
 * several of these.
 * 
 * @param {String} eventType                   
 *    the name of the events managed by this singleEventPubSub
 * @param {singleEventPubSub} [newListener]    
 *    place to notify of new listeners
 * @param {singleEventPubSub} [removeListener] 
 *    place to notify of when listeners are removed
 */
function singleEventPubSub(eventType, newListener, removeListener){

   /** we are optimised for emitting events over firing them.
    *  As well as the tuple list which stores event ids and
    *  listeners there is a list with just the listeners which 
    *  can be iterated more quickly when we are emitting
    */
   var listenerTupleList = [],
       listenerList = [];

   function hasId(id){
      return function(tuple) {
         return tuple.id == id;      
      };  
   }
              
   return {

      /**
       * @param {Function} listener
       * @param {*} listenerId 
       *    an id that this listener can later by removed by. 
       *    Can be of any type, to be compared to other ids using ==
       */
      on:function( listener, listenerId ) {
         
         var tuple = {
            listener: listener
         ,  id:       listenerId || listener // when no id is given use the
                                             // listener function as the id
         };

         if( newListener ) {
            newListener.emit(eventType, listener, tuple.id);
         }

         listenerTupleList.push(tuple);
         listenerList.push(listener);

         return this; // chaining
      },
     
      emit:function () {
         for (var i = 0, n=listenerList.length; i < n; i++) {
            listenerList[i].apply(null, arguments);
         }
      },
      
      un: function( listenerId ) {
             
         for (var i = 0, n=listenerTupleList.length; i < n; i++) {
            
            if( listenerTupleList[i].id == listenerId ) {
               // remove from both arrays:
               var removed = listenerTupleList[i];
               
               listenerTupleList.splice(i, 1);
               listenerList.splice(i, 1);
  
               if( removeListener ) {
                  removeListener.emit(eventType, removed.listener, removed.id);
               }
               return;
            }
         }
      },
      
      listeners: function(){
         // differs from Node EventEmitter: returns list, not array
         return listenerList;
      },
      
      hasListener: function(listenerId){
         var test = listenerId? hasId(listenerId) : always;
      
         return listenerTupleList.some(test);
      }
   };
}
