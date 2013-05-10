function lastOf(array) {
   return array[array.length-1];
}

function isArray(a) {
   return a && a.constructor === Array;
}

/* call a list of functions with the same args until one returns truthy.

   Returns the first return value that is given that is non-truthy.
   
   If none are found, calls onFail    
 */
function firstMatching( fns, args, onFail ) {

   var rtn;

   for (var i = 0; i < fns.length; i++) {
            
      if( rtn = fns[i].apply(null, args) ) {
         return rtn;
      }      
   }  
   
   onFail();
}