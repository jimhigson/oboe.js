function lastOf(array) {
   return array[len(array)-1];
}

function isArray(a) {
   return a && a.constructor === Array;
}

function len(array){
   return array.length;
}

function toArray(arrayLikeThing, startIndex) {
   return Array.prototype.slice.call(arrayLikeThing, startIndex);
}

function isString(thing) {
   return typeof thing == 'string';
}

/** I don't like saying foo !=== undefined very much because of the double-negative. I find
 *  defined(foo) easier to read.
 *  
 * @param {*} value anything
 */ 
function defined( value ) {
   return value !== undefined;
}

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



/** Call a list of functions with the same args until one returns a defined result.
 *
 *  Returns the first return value that is given that is not undefined.
 * 
 *  If none are found, calls onFail and returns whatever that gives, or if no onFail is given,
 *  returns undefined
 * 
 *  @param {Function[]} fns
 *  @param {*} args
 *  @param {Function} [onFail]
 */
function firstReturningSomething( fns, args, onFail ) {

   var rtn;

   for (var i = 0; i < len(fns); i++) {
            
      if( rtn = fns[i].apply(undefined, args) ) {
         return rtn;
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

function always(){return true}