
function cons(x, xs) {
   return Object.freeze([x, xs]);
}

var head = partialComplete(pluck, 0);
var tail = partialComplete(pluck, 1);
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
   // could be done as a reduce

   if( !list ) {
      return [];
   } else {
      var array = listAsArray(tail(list));
      array.unshift(head(list)); 
      return array;
   }
}

function map(fn, list) {
   if( !list ) {
      return emptyList;
   } else {
      return cons(fn(head(list)), map(fn,tail(list)));
   }
}

/*function lastInList(list) {
   if( !tail(list) ) {
      return head(list);
   }
   return lastInList(tail(list));
}*/