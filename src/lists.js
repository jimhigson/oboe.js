
function cons(x, xs) {
   
   // Lists are all immutable. Object.freeze provides this in newer Javascript engines.
   return Object.freeze({h:x, t:xs});
}

var head = attr('h');
var tail = attr('t');
var emptyList = null;

/** Converts an array to a list 
 * 
 *  asList([a,b,c]) = cons(a,cons(b,cons(c,emptyList))); 
 **/
function asList(array){

   var l = emptyList;

   for( var i = array.length ; i--; ) {
      l = cons(array[i], l);      
   }

   return l;   
}

/**
 * A varargs version of as List
 * 
 *  asList(a,b,c) = cons(a,cons(b,cons(c,emptyList)));
 */
var list = varArgs(asList);

/**
 * Convert a list back to a js native array
 */
function listAsArray(list){

   return foldR( function(arraySoFar, listItem){
      
      arraySoFar.unshift(listItem);
      return arraySoFar;
           
   }, [], list );
   
}

/**
 * Map a function over a list 
 */
function map(fn, list) {

   return list
            ? cons(fn(head(list)), map(fn,tail(list)))
            : emptyList
            ;
}

/**
 * foldR implementation. Reduce a list down to a single value.
 * 
 * @pram {Function} fn     (rightEval, curVal) -> result 
 */
function foldR(fn, startValue, list) {
      
   return list 
            ? fn(foldR(fn, startValue, tail(list)), head(list))
            : startValue
            ;
}

/** 
 * Returns true if the given function holds for every item in 
 * the list, false otherwise 
 */
function listEvery(fn, list) {
   
   return !list || 
          fn(head(list)) && listEvery(fn, tail(list));
}

/**
 * Apply a function to every item in a list
 * 
 * This doesn't make any sense if we're doing pure functional because it doesn't return
 * anything. Hence, this is only really useful for callbacks if fn has side-effects. 
 */
function listEach(fn, list) {

   if( list ){  
      fn(head(list));
      listEvery(fn, tail(list));
   }
}

/**
 * Reverse the order of a list
 */
function reverseList(list){

   // js re-implementation of 3rd solution from:
   //    http://www.haskell.org/haskellwiki/99_questions/Solutions/5
   function reverseInner( list, reversed ) {
      if( !list ) {
         return reversed;
      }
      
      return reverseInner(tail(list), cons(head(list), reversed))
   }

   return reverseInner(list, emptyList);
}