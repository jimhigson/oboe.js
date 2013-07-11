
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

function foldList(fn, startValue, list) {
   
   if( !list ) {
      return startValue;
   }
    
   return fn(head(list), foldList(fn, startValue, tail(list)));
}

function asList(array){

   return array.reduce( function(listSoFar, nextItem) {
      return cons(nextItem, listSoFar);
   }, emptyList );   
}

/*function lastInList(list) {
   if( !tail(list) ) {
      return head(list);
   }
   return lastInList(tail(list));
}*/