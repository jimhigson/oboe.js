function spiedPubSub() {

   var realPubSub = pubSub();

   function fakedPubSub( eventName ) {
        
      var single = realPubSub(eventName);

      var alreadySpied = !!single.emit.isSpy;
      
      if( !alreadySpied ) {   
         spyOn( single, 'emit' ).andCallThrough();
         spyOn( single, 'on'   ).andCallThrough();
         spyOn( single, 'un'   ).andCallThrough();
      }
      
      return single;
   }
   
   fakedPubSub.emit = realPubSub.emit;
   fakedPubSub.on = realPubSub.on;
   fakedPubSub.un = realPubSub.un;
   
   return fakedPubSub;
}

function fakePubSub( eventNames ) {

   var eventTypes = {};
   var eventsEmitted = [];   
   var eventNamesEmitted = [];
   var eventTypesEmitted = {};
   var callCount = {};
      
   function emitRecorder(eventName) {
      return function record() {
         
         var args = Array.prototype.slice.apply(arguments);
         
         eventsEmitted.push({
            type: eventName, 
            args: args
         });
         
         eventNamesEmitted.push(eventName);
         eventTypesEmitted[eventName].push(args);
         callCount[eventName]++;
      }
   }      
   
   eventNames.forEach(function (eventName) {

      var callthroughOnEmit = function(){};
      var recordEmit = emitRecorder(eventName);
      
      var singleInstanceStub = {
         emit:  jasmine.createSpy(eventName + '/emit')
                     .andCallFake(function(){
                        recordEmit.apply(this, arguments);
                        callthroughOnEmit.apply(this, arguments);
                     })
      ,  on:    jasmine.createSpy(eventName + '/on')
      ,  un:    jasmine.createSpy(eventName + '/un')
      ,  onEmit: function(f) {
            callthroughOnEmit = f;
         }
      };

      eventTypes[eventName] = singleInstanceStub;
      eventTypesEmitted[eventName] = [];
      callCount[eventName] = 0;
   });

   function fakeBus( eventName ) {
      return eventTypes[eventName];
   }
   
   fakeBus.events            = eventsEmitted;
   fakeBus.eventNames        = eventNamesEmitted;
   fakeBus.eventTypesEmitted = eventTypesEmitted;
   fakeBus.callCount         = callCount;

   // shortcutted version of calls - bus#on and bus#emit
   ['emit', 'on'].forEach(function(nameOfMethodOnBus){
   
      fakeBus[nameOfMethodOnBus] = varArgs(function(eventName, parameters){
         apply( parameters, eventTypes[eventName][nameOfMethodOnBus]);
      });
   });

   return fakeBus;
}

function eventBlackBox( pubsub, eventNames ) {
   
   var recording = [];
   
   eventNames.forEach(function(eventName){
      pubsub(eventName).on(function(val, val2){
         recording.push({
            type: eventName, 
            values: arguments,
            val: val,
            val2: val
         });
      });
   });
   
   return recording;
}
