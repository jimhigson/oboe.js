
/** 
 * If no implementation of a method called (methodName) exists fill it in with the
 * implementation given as (filler).
 */ 
function polyfill(type, methodName, filler) {
   var proto = type.prototype;
   proto[methodName] = proto[methodName] || filler;
}

/**
 * Here we have a minimal set of polyfills needed to let the code run in older browsers such
 * as IE8.
 * 
 * If you already have polyfills in your webapp or you don't need to support bad browsers, feel free 
 * to make a custom build without this. However, it is as small as it can be to get the job done.
 * 
 */   


// Array.forEach has to be a polyfill, clarinet expects it
// Ignoring all but function argument since not needed, eg can't take a context
//       Clarinet needs this          
polyfill(Array, 'forEach', function( func ){
     
   for( var i = 0 ; i < len(this) ; i++ ) {      
      func(this[i]);    
   }              
});         
      

// Array.filter has to be a polyfill, clarinet expects it.
// Ignoring all but function argument since not needed, eg can't take a context
//       Clarinet needs this
polyfill(Array, 'filter', function( filterCondition ){         

   var passes = [];

   // let's use the .forEach we declared above to implement .filter:
   this.forEach(function(item){      
      if( filterCondition( item ) ) {
         passes.push(item);
      }                  
   });
   
   return passes;
   
});  
        
// allow binding. Minimal version which includes binding of context only, not arguments as well
polyfill(Function, 'bind', function( context /*, arg1, arg2 ... */ ){
   var f = this;

   return function( /* yet more arguments */ ) {                        
      return f.apply(context, arguments);
   }
});   
