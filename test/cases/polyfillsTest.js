/** These tests test the functionality of polyfills used for old and low-quality browsers
 *  such as IE8. On better browsers they are just testing the browser's inbuilt 
 *  methods but it is nice to have some consistency
 */

(function(){


   TestCase("polyfillsTests", {
   
      testFilterWorksWhenReturningSomeItems: function() {
         givenTheArray([1,2,3,4,5,6,7,8,9])
            .whenFilteringBy(odd)
            .then([1,3,5,7,9])
      }
      
   ,  testFilterWorksWhenReturningNoItems: function() {
         givenTheArray([1,2,3,4,5,6,7,8,9])
            .whenFilteringBy(never)
            .then([])
      }
      
   ,  testFilterWorksWhenReturningAllItems: function() {
         givenTheArray([1,2,3,4,5,6,7,8,9])
            .whenFilteringBy(always)
            .then([1,2,3,4,5,6,7,8,9])
      }
            
   ,  testForEachCallsTheCorrectNumberOftimes: function() {
         
         var func = sinon.spy();
         
         [1,2,3].forEach(func);
         
         assertEquals(3, func.callCount); 
      }
      
   ,  testForEachCallsWithEachItemFromTheArray: function() {
         
         var func = sinon.spy();
         
         [1,2,3].forEach(func);
         
         assertTrue(func.calledWith(1)); 
         assertTrue(func.calledWith(2)); 
         assertTrue(func.calledWith(3)); 
      }
      
   ,  testMap: function() {
                  
         assertEquals([2,4,6], [1,2,3].map(doubleUp));          
      }                                                            
   });
       
   function odd(n){ return n % 2 ===1 }
   function always(){return true}       
   function never(){return false}       
   function doubleUp(n){return n * 2}       
       
   function givenTheArray( startArray ) {
      
      return {
         whenFilteringBy: function( filterCondition ) {
            
            return {
               then: function( expectedResult ) {
                  
                  assertEquals( expectedResult, startArray.filter( filterCondition ) );
               }
            }
         }
      };
   }

})();