
 

function cons(x, xs) {
   return [x, xs];
}

var head = partialComplete(pluck, 0);
var tail = partialComplete(pluck, 1);

function listLength(list){
   if( list ){
      return 0;
   } else {
      return listLength(tail(list)) +1;
   }
}

function listAsArray(list){
   if( list ) {
      return [];
   } else {
      return listAsArray(tail(list)).push(head(list));
   }
}