/**
 * @function
 * 
 * @param childFn
 * @param parentThreadBus
 * @param eventsToChild
 * @param eventsFromChild
 */
var portal = (function(){
   "use strict";

   function forward(eventEmitter, eventNames, thread){
            
      eventNames.forEach(function(eventName){
         
         eventEmitter.on(eventName, function(val){
            
            var event = {name: eventName, value: val};
            
            if( thread ){
               thread.postMessage(event);
            }else{
               postMessage(event);
            }
         });
      });
   }
   
   function receive(eventEmitter, thread){

      function handle(event){
         var data = event.data;

         eventEmitter.emit(data.name, data.value);
      }
      
      if(thread){
         thread.onmessage = handle;
      } else {
         onmessage = handle;
      }
   }

   function codeForChildThread(childLibs, childServer, eventsFromChild) {

      return childLibs
                  .concat(forward, receive).map(String)
                  .concat(
                     'var bus=pubSub();',
                     'forward(bus,' + JSON.stringify(eventsFromChild) + ');',
                     'receive(bus);',
                     '(' + String(childServer) + '(bus))');
   }

   return function (childLibs, childServer, parentThreadBus, eventsToChild, eventsFromChild){

      var code = codeForChildThread(childLibs, childServer, eventsFromChild),
          // http://developer.mozilla.org/en-US/docs/Web/API/Blob
          blob = new Blob(code, {type:'text/javascript'}),
          worker = new Worker(window.URL.createObjectURL(blob));
         
      forward(parentThreadBus, eventsToChild, worker);
      receive(parentThreadBus, worker);
   }

}());
