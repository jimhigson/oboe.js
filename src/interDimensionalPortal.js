/**
 * @function
 * 
 * @param childFn
 * @param parentThreadBus
 * @param eventsToChild
 * @param eventsFromChild
 */
var interDimensionalPortal = (function(){
   "use strict";

   function forward(eventEmitter, eventNames, thread){
            
      var dispatch = thread? thread.postMessage.bind(thread) : postMessage;
      
      eventNames.forEach(function(eventName){
         
         eventEmitter.on(eventName, function(value){

            dispatch([eventName, value]);
         });
      });
   }
   
   function receive(eventEmitter, thread){

      function handle(event){
         var data = event.data;

         eventEmitter.emit(data[0], data[1]);
      }
      
      if(thread){
         thread.onmessage = handle;
      } else {
         onmessage = handle;
      }
   }

   function codeForChildThread(childLibs, childServer, childServerParams, eventsFromChild) {

      return childLibs
                  .concat(forward, receive).map(String)
                  .concat(
                     'var bus=pubSub();',
                     'forward(bus,' + JSON.stringify(eventsFromChild) + ');',
                     'receive(bus);',
                     '(' + String(childServer) + '(bus,' + JSON.stringify(childServerParams) + '))');
   }

   return function (childLibs, childServer, childServerParams, parentThreadBus, eventsToChild, eventsFromChild){

      var code = codeForChildThread(childLibs, childServer, childServerParams, eventsFromChild),
          // http://developer.mozilla.org/en-US/docs/Web/API/Blob
          blob = new Blob(code, {type:'text/javascript'}),
          worker = new Worker(window.URL.createObjectURL(blob));
         
      forward(parentThreadBus, eventsToChild, worker);
      receive(parentThreadBus, worker);
   }

}());
