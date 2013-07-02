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

/*
   Call each of a list of functions with the same arguments, where the arguments are given using varargs
   array. Ignores any return values from the functions.
 */
function callAll( fns /*, arg1, arg2, arg3...*/ ) {
   applyAll(fns, toArray(arguments, 1));
}


/** Call a list of functions with the same args until one returns a truthy result.
 *
 *  Returns the first return value that is given that is truthy.
 * 
 *  If none are found, calls onFail and returns whatever that gives, or if no onFail is given,
 *  returns undefined
 * 
 *  @param {Function[]} fns
 *  @param {*} args
 *  @param {Function} [onFail]
 */
function firstMatching( fns, args, onFail ) {

   var maybeMatch;

   for (var i = 0; i < len(fns); i++) {
      
      maybeMatch = apply(fns[i], args);            
            
      if( maybeMatch ) {
         return maybeMatch;
      }      
   }  
   
   return onFail && onFail();
}

/** Partially complete the given function by filling it in with all arguments given
 *  after the function itself. Returns the partially completed version.    
 */
function partialComplete( fn /* arg1, arg2, arg3 ... */ ) {

   var boundArgs = toArray(arguments, 1);

   return function() {
      var callArgs = boundArgs.concat(toArray(arguments));            
         
      return fn.apply(this, callArgs);
   }; 
}