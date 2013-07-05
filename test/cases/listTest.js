/** These tests test the functionality of polyfills used for old and low-quality browsers
 *  such as IE8. On better browsers they are just testing the browser's inbuilt 
 *  methods but it is nice to have some consistency
 */

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
      testToArray: function() {
      
         var listCBA = cons('c', cons('b', cons('a', emptyList)));
         
         assertEquals(['c','b','a'], listAsArray(listCBA));
      }
      
   ,      
      testToArrayCanHandleEmptyList: function() {
               
         assertEquals([], listAsArray(emptyList));
      }      
      
   ,      
      testReversingLists: function() {
      
         var listCBA = cons('c', cons('b', cons('a', emptyList)));
         
         assertEquals(['a','b','c'], listAsArray(reverseList(listCBA)));
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