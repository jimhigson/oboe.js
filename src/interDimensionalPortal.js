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

            console.log(
               (thread ? 'parent' : 'child') +
               ' forwarding via portal "' + eventName + '"' +
                  (value ? ' = ' + JSON.stringify(value) : ' (no value)'));
            dispatch([eventName, value]);
         });
      });
   }
   
   function receive(eventEmitter, thread){

      function handle(event){
         var data = event.data;

         console.log( 
            (thread ? 'parent' : 'child') +
            ' received via portal "' + data[0] + '"' + 
               (data[1] ? ' = ' + JSON.stringify(data[1]) : ' (no value)')
         );
         eventEmitter.emit(data[0], data[1]);
      }
      
      if(thread){
         thread.onmessage = handle;
      } else {
         onmessage = handle;
      }
   }
   
   function waitForStart( startFn ){
      
      console.log('worker waiting for setup message');
      // Wait for the one-off initialisation message. This handler will be overwritten
      // shortly when the initialisation message arrives 
      onmessage = function( initialisationMessage ){
         console.log(
            'worker: got setup message with config ' + 
            JSON.stringify(initialisationMessage.data[1])
         );
         
         var childSideBus = pubSub();
         var config = initialisationMessage.data;
         var eventsToSendToParent = config[0];
         var startFnParameters = config[1];
         
         forward(childSideBus, eventsToSendToParent);
         receive(childSideBus);

         startFnParameters.unshift(childSideBus);
         startFn.apply(null, startFnParameters);

         console.log('worker: ready for events');
      }
   }

   function codeForChildThread(childLibs, childServer) {

      return childLibs
         // we need stringified functions for all libs, plus forward and receive
         .concat(forward, receive).map(String)
         // and we'll need the worker to wait for the start signal:
         .concat('(' + String(waitForStart) + ')' + '(' + String(childServer) + ')');
   }

   return function (childLibs, childServer, eventsToChild, eventsFromChild){

      var blobUrl = window.URL.createObjectURL(
         new Blob(
            codeForChildThread(childLibs, childServer)
            ,  {type:'text/javascript'}
         )
      );
      
      return varArgs( function(parentSideBus, childServerArgs){
      
         var worker = new Worker(blobUrl);
            
         console.log('created blob and worker');
         worker.postMessage([
            eventsFromChild
         ,  childServerArgs
         ]);
         console.log('sent first message to worker');
         
         forward(parentSideBus, eventsToChild, worker);
         receive(parentSideBus, worker);
      });
   }

}());
