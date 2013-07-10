
(function(){


   TestCase("listsTest", {
   
      testConsHeadAndTail: function() {
      
         var emptyList = emptyList;
         
         var listA   = cons('a', emptyList);
         var listBA  = cons('b', listA);
         var listCBA = cons('c', listBA);
         
         assertEquals('c', head(listCBA));
         assertEquals('b', head(tail(listCBA)));
         assertEquals('a', head(tail(tail(listCBA))));
      }
      
   ,      
      testListAsArray: function() {
      
         var listCBA = cons('c', cons('b', cons('a', emptyList)));
         
         assertEquals(['c','b','a'], listAsArray(listCBA));
      }
      
   ,      
      testListAsArrayCanHandleEmptyList: function() {
               
         assertEquals([], listAsArray(emptyList));
      }      
      
   ,      
      testReversingLists: function() {
      
         var listCBA = cons('c', cons('b', cons('a', emptyList)));
         
         assertEquals(['a','b','c'], listAsArray(reverseList(listCBA)));
      }
      
   ,  testMap: function() {
         var naturals = cons(1, cons(2, cons(3, emptyList)));
         var evens = cons(2, cons(4, cons(6, emptyList)));
         
         function doubleIt(n){return n * 2}
         
         assertEquals(evens, map(doubleIt, naturals));
      }      
      /*
   ,      
      testLastInList: function() {
      
         var listCBA = cons('c', cons('b', cons('a', emptyList)));
         
         assertEquals(['a'], lastInList(listCBA));
      }
      
   ,      
      testLastInListForSingletonList: function() {
      
         var listA = cons('a', emptyList);
         
         assertEquals(['a'], lastInList(listA));
      }
      
   ,      
      testLastInListForEmptyList: function() {
      
         try{            
            assertEquals(['a'], lastInList(emptyList));
            
            fail('should have thrown an exception so shouldn\'t have gotten to here');
         }catch(e){
            // expecting failure
         }
      }  
      */                                         
      
            
   
   });

})();