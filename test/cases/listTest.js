
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
      
   ,  testAsListWithNonEmptyList: function() {
         assertEquals(['a','b','c'], listAsArray( asList(['a','b','c']) )  );
      }
      
   ,  testAsListWithEmptyList: function() {
         assertEquals([], listAsArray( asList([]) )  );
      }            

   ,  testListEvery: function() {
         var l = list(1,2,3,4,5,6,7,8,9,10);
         
         function isANumber(n) {
            return typeof n == 'number';
         }
         
         function isOdd(n) {
            return n % 2 == 0;
         }
         
         function isLessThanTen(n) {
            return n < 10;
         }
         
         function isLessThanOrEqualToTen(n) {
            return n <= 10;
         }                           
         
         assertTrue(  listEvery(isANumber,                l ));
         assertFalse( listEvery(isOdd,                    l ));
         assertFalse( listEvery(isLessThanTen,            l ));
         assertTrue(  listEvery(isLessThanOrEqualToTen,   l ));

      }                        
      
   ,  'testFoldListWhereOrderDoesntMatter': function() {
         function add(n, m){ return n+m }
         
         var sum = foldR(add, 0, list(1,2,3,4));
         
         assertEquals(10, sum);
      }
      
   ,  'testFoldListUsesStartValue': function() {
         function divide(n, m){ return n / m }
         
         var result = foldR(divide, 100, list(2, 2));
         
         //   (100/2) / 2  = 25 
         
         assertEquals(25, result);
      }
      
   ,  'testFoldOrder': function() {
         function functionString(stringSoFar, fnName){ return fnName + '(' + stringSoFar + ')' }
         
         var functionStringResult = foldR(functionString, 'x', list('a', 'b', 'c'));
         
         // if order were wrong, might give c(b(a(x)))
                  
         assertEquals('a(b(c(x)))', functionStringResult);
      }                    
   
   });

})();