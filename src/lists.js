
function cons(x, xs) {
   return [x, xs];
}

var head = attr(0);
var tail = attr(1);
var emptyList = null;

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

function listAsArray(list){

   return foldR( function(arraySoFar, listItem){
      
      arraySoFar.unshift(listItem);
      return arraySoFar;
           
   }, [], list );
   
}

function map(fn, list) {

   return list
            ?  cons(fn(head(list)), map(fn,tail(list)))
            :  emptyList
            ;
}

/**
   @pram {Function} fn     (rightEval, curVal) -> result 
 */
function foldR(fn, startValue, list) {
      
   return list 
            ?  fn(foldR(fn, startValue, tail(list)), head(list))
            : startValue
            ;
}

/* return true if the given function holds for every item in 
 * the list 
 */
function listEvery(fn, list) {
   
   return !list || 
          fn(head(list)) && listEvery(fn, tail(list));
}

/**
 * This doesn't make any sense if we're doing pure functional because it doesn't return
 * anything. Hence, this is only really useful for callbacks if fn has side-effects. 
 * 
 * @param fn
 * @param list
 */
function listEach(fn, list) {

   if( list ){  
      fn(head(list));
      listEvery(fn, tail(list));
   }
}

/* convert an array to a list */
function asList(array){

   var l = emptyList;

   for( var i = array.length ; i--; ) {
      l = cons(array[i], l);      
   }

   return l;   
}

var list = varArgs(asList);
