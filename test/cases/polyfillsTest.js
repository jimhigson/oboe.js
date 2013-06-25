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
            
   ,  testBindCallsOriginalFunction: function() {
         
         var callCount = 0;
         
         var bound = (function(){ 
            callCount++; 
         }).bind({});
         
         bound();
         
         assertEquals(1, callCount);
      }      
      
   ,  testBindPreservesContext: function() {
         
         var bound = (function(){ 
            assertEquals('a', this) 
         }).bind('a');
         
         bound(); 
      }
            
   ,  testBindPropagatesCallTimeArguments: function() {
         
         var bound = (function(arg1, arg2){ 
            assertEquals('b', arg1 ); 
            assertEquals('c', arg2 ); 
         }).bind('a');
         
         bound('b', 'c'); 
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