/*
   Call a single function with the given arguments.
   Basically, a more functional version of the slightly more OO Function#apply for when we don't care about
   the context of the call
 */
function apply(fn, args) {
   return fn.apply(undefined, args);
}

/*
   Call each of a list of functions with the same arguments, where the arguments are given as an
   array. Ignores any return values from the functions.
 */
function applyAll( fns, args ) {

   fns.forEach(function( fn ){
      apply(fn, args);
   });
}


function varArgs(fn){

   // nb: can't use len() here because it is defined using partialComplete which is defined using varargs.
   // While recursive definition is possible in js, it is a stateful language and at this point there is no way
   // that len can be defined
   var numberOfFixedArguments = fn.length -1;
         
   return function(){
   
      var numberOfVaraibleArguments = arguments.length - numberOfFixedArguments,
      
          argumentsToFunction = Array.prototype.slice.call(arguments);
          
      // remove the end of the array and push it back onto itself as a sub-array (sometimes to implement a functional
      // machine we have to sit on top of a *very* non-functional one)
      argumentsToFunction.push( argumentsToFunction.splice(numberOfFixedArguments, numberOfVaraibleArguments) );   
      
      return fn.apply( this, argumentsToFunction );
   }       
}

/**
 *  Call a list of functions with the same args until one returns a truthy result. Equivalent to || in javascript
 *  
 *  So:
 *       lazyUnion([f1,f2,f3 ... fn])( p1, p2 ... pn )
 *       
 *  Is equivalent to: 
 *       apply(f1, [p1, p2 ... pn]) || apply(f2, [p1, p2 ... pn]) || apply(f3, [p1, p2 ... pn]) ... apply(fn, [p1, p2 ... pn])  
 *   
 *  @returns the first return value that is given that is truthy.
 */
var lazyUnion = varArgs(function(fns) {

   return varArgs(function(params){

      var maybeValue;

      for (var i = 0; i < len(fns); i++) {

         maybeValue = apply(fns[i], params);

         if( maybeValue ) {
            return maybeValue;
         }
      }
   });
});

/**
 * Call a list of functions, so long as they continue to return a truthy result. Returns the last result, or the
 * first non-truthy one.
 * 
 */
function lazyIntersection(fn1, fn2) {

   return function (param) {
                                                              
      return fn1(param) && fn2(param);
   };   
}

/** Partially complete the given function by filling it in with all arguments given
 *  after the function itself. Returns the partially completed version.
 */
var partialComplete = varArgs(function( fn, boundArgs ) {

   return varArgs(function( callArgs ) {
            
      return fn.apply(this, boundArgs.concat(callArgs));
   }); 
});


var compose = varArgs(function(fns) {

   function next(valueSoFar, curFn) {  
      return curFn(valueSoFar);   
   }
   
   return function(startValue){
     
      return foldR(next, startValue, asList(fns));
   }
});