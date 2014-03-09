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
   
   function waitForStart( startFn ){
      
      // Wait for the one-off initialisation message. This handler will be overwritten
      // shortly when the initialisation message arrives 
      onmessage = function( initialisationMessage ){
         var bus = pubSub();
         var config = initialisationMessage.data;
         
         forward(bus, config[0]);
         receive(bus);
         
         config[1].unshift(bus);
         startFn.apply(null, config[1]);
      }
   }

   function codeForChildThread(childLibs, childServer) {

      return childLibs
         // we need stringified functions for all libs, plus forward and receive
         .concat(forward, receive).map(String)
         // and we'll need the worker to wait for the start signal:
         .concat('(' + String(waitForStart) + ')' + '(' + String(childServer) + ')');
   }

   return function (childLibs, childServer, childServerArgs, parentThreadBus, eventsToChild, eventsFromChild){

      var worker = new Worker(
                        window.URL.createObjectURL(
                           new Blob(
                              codeForChildThread(childLibs, childServer)
                           ,  {type:'text/javascript'}
                           )
                        )
      );
         
      worker.postMessage([eventsFromChild, childServerArgs]);
      
      forward(parentThreadBus, eventsToChild, worker);
      receive(parentThreadBus, worker);
   }

}());
