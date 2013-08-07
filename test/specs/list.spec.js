
describe("Lists", function(){

   function assertEquals(expected, actual) {
      expect(actual).toEqual(expected);
   }
   
   function assertTrue(actual) {
      expect(actual).toBe(true);
   }
   
   function assertFalse(actual) {
      expect(actual).toBe(false);
   }   

   it("can use cons, head and tail", function() {
      var emptyList = emptyList;
      
      var listA   = cons('a', emptyList);
      var listBA  = cons('b', listA);
      var listCBA = cons('c', listBA);
      
      expect(head(listCBA)).toBe('c');
      expect(head(tail(listCBA))).toBe('b'); 
      expect(head(tail(tail(listCBA)))).toBe('a');
   });


   it("can convert to an array", function() {
   
      var listCBA = cons('c', cons('b', cons('a', emptyList)));
      
      assertEquals(['c','b','a'], listAsArray(listCBA));   
   });
   
   it("can convert empty list to an array", function(){
      assertEquals([], listAsArray(emptyList));
   });
   
   it("can reverse the order of a list", function() {
      var listCBA = cons('c', cons('b', cons('a', emptyList)));
               
      assertEquals(['a','b','c'], listAsArray(reverseList(listCBA)));   
   });
   
   it("can map over a list", function() {
      var naturals = cons(1, cons(2, cons(3, emptyList)));
      var evens = cons(2, cons(4, cons(6, emptyList)));
      
      function doubleIt(n){return n * 2}
      
      assertEquals(evens, map(doubleIt, naturals));
   });
   
   it("can convert non empty list to an array", function(){
      assertEquals(['a','b','c'], listAsArray( asList(['a','b','c']) )  );
   });
   
   it("can convert empty array to list", function() {
      assertEquals([], listAsArray( asList([]) )  );
   });
   
   it("can assert every item in a list holds for a given test", function(){
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
   });
   
   it("can fold list where order doesnt matter", function(){
      function add(n, m){ return n+m }
      
      var sum = foldR(add, 0, list(1,2,3,4));
      
      assertEquals(10, sum);   
   });
   
   it("can fold list where start value matters", function(){
      function divide(n, m){ return n / m }
      
      var result = foldR(divide, 100, list(2, 2));
      
      //   (100/2) / 2  = 25       
      assertEquals(25, result);   
   });

   it("can fold list in the correct order", function(){
      function functionString(stringSoFar, fnName){ return fnName + '(' + stringSoFar + ')' }
      
      var functionStringResult = foldR(functionString, 'x', list('a', 'b', 'c'));
      
      // if order were wrong, might give c(b(a(x)))
               
      assertEquals('a(b(c(x)))', functionStringResult);   
   });
});
