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
function lazyUnion( /* f1, f2, f2 ... fn */ ) {

   var fns = toArray(arguments);

   return function( /* p1, p2, p3 ... pn */ ){

      var params = toArray(arguments);

      var maybeValue;
   
      for (var i = 0; i < len(fns); i++) {
         
         maybeValue = apply(fns[i], params);            
               
         if( maybeValue ) {
            return maybeValue;
         }      
      }
   }    
}

/**
 * Apply a an arbitrary condition
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
function partialComplete( fn /* arg1, arg2, arg3 ... */ ) {

   var boundArgs = toArray(arguments, 1);

   return function() {
      var callArgs = boundArgs.concat(toArray(arguments));            
         
      return fn.apply(this, callArgs);
   }; 
}