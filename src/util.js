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
   Call each of a list of functions with the same arguments, ignoring any return
   values.
 */
function callAll( fns /*, arg1, arg2, arg3...*/ ) {
   applyAll(fns, toArray(arguments, 1));
}

function applyAll( fns, args ) {

   fns.forEach(function( fn ){
      fn.apply(undefined, args);
   });
}

/* call a list of functions with the same args until one returns truthy.

   Returns the first return value that is given that is non-truthy.
   
   If none are found, calls onFail and returns whatever that gives    
 */
function firstMatching( fns, args, onFail ) {

   var rtn;

   for (var i = 0; i < len(fns); i++) {
            
      if( rtn = fns[i].apply(undefined, args) ) {
         return rtn;
      }      
   }  
   
   return onFail();
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