/**
 *
 *  Results from the jstd-karma adaptor weren't showing when run through grunt + karma
 *  this wrapper around the jstd-adaptor.js fail just makes sure they get logged.
 *  
 */
 
(function(){ 
 
   var oldFail = fail;
 
   fail = function(){
   
      if( arguments.length ) {
         console.log.apply(console, arguments);
      }
   
      oldFail.call(this, arguments);
   };
   
})();   