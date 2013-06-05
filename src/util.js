function lastOf(array) {
   return array[array.length-1];
}

function isArray(a) {
   return a && a.constructor === Array;
}

function toArray(arrayLikeThing, startIndex) {
   return Array.prototype.slice.call(arrayLikeThing, startIndex);
}

/*
   Call each of a list of functions with the same arguments, ignoring any return
   values.
 */
function callAll( fns, args ) {

   fns.forEach(function( fn ){
      fn.apply(null, args);
   });
}

/* call a list of functions with the same args until one returns truthy.

   Returns the first return value that is given that is non-truthy.
   
   If none are found, calls onFail and returns whatever that gives    
 */
function firstMatching( fns, args, onFail ) {

   var rtn;

   for (var i = 0; i < fns.length; i++) {
            
      if( rtn = fns[i].apply(null, args) ) {
         return rtn;
      }      
   }  
   
   return onFail();
}


/** Partially complete the given function by filling it in with all arguments given
 *  after the function itself. Returns the partially completed version.    
 */
function partialComplete( fn /* arg1, arg2, arg3 ... */ ) {

   var args = toArray(arguments);
   args[0] = null; // the first argument to bind should be null since we
                   // wish to specify no context

   return fn.bind.apply(fn, args); 
}

function always(){return true}