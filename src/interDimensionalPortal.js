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

      var target = thread || this;

      eventNames.forEach(function(eventName){

         eventEmitter.on(eventName, function(value){

            console.log(
               (thread ? 'parent' : 'child') +
               ' forwarding via portal "' + eventName + '"' +
                  (value ? ' = ' + JSON.stringify(value) : ' (no value)'));

            target.postMessage([eventName, value]);
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
      
      (thread||this).onmessage = handle;
   }
   
   function waitForStart( startFn, eventsTypesToForwardToParent ){

      var childSideBus = pubSub();
      
      console.log('worker waiting for setup message');
      // Wait for the one-off initialisation message. This handler will be overwritten
      // shortly when the initialisation message arrives 
      this.onmessage = function( initialisationMessage ){

         var startFnParameters = initialisationMessage.data;

         console.log(
            'worker: got setup message with config ' +
               JSON.stringify(startFnParameters)
         );

         forward(childSideBus, eventsTypesToForwardToParent);
         receive(childSideBus);

         startFnParameters.unshift(childSideBus);
         startFn.apply(null, startFnParameters);

         console.log('worker: ready for events');
      }
   }

   function codeForChildThread(childLibs, childServer, eventTypesChildProduces) {

      return childLibs
         // we need stringified functions for all libs, plus forward and receive
         .concat(forward, receive).map(String)
         // and we'll need the worker to wait for the start signal:
         .concat(
            '(' + String(waitForStart) + ')' +
            '(' + String(childServer) + ',' + JSON.stringify(eventTypesChildProduces) + ')'
         );
   }

   return function (childLibs, childServer, eventTypesChildConsumes, eventTypesChildProduces){

      var blobUrl = window.URL.createObjectURL(
         new Blob(
            codeForChildThread(childLibs, childServer, eventTypesChildProduces)
         ,  {type:'text/javascript'}
         )
      );
      
      return varArgs( function(parentSideBus, childServerArgs){
         var worker = new Worker(blobUrl);
            
         console.log('created blob and worker');
         worker.postMessage(childServerArgs);
         console.log('sent first message to worker');
         
         forward(parentSideBus, eventTypesChildConsumes, worker);
         receive(parentSideBus, worker);
      });
   }

}());
