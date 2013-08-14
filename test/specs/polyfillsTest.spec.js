/** These tests test the functionality of polyfills used for old and low-quality browsers
 *  such as IE8. On better browsers they are just testing the browser's inbuilt 
 *  methods but it is nice to have some consistency
 */

describe("polyfills", function(){

   describe('filter', function(){
   
      it("can return a subset", function() {
         givenTheArray([1,2,3,4,5,6,7,8,9])
            .whenFilteringBy(odd)
            .then([1,3,5,7,9])
      });
      
      it("can return no items", function() {
         givenTheArray([1,2,3,4,5,6,7,8,9])
            .whenFilteringBy(never)
            .then([])
      });
   
      it("can return all items", function() {
         givenTheArray([1,2,3,4,5,6,7,8,9])
            .whenFilteringBy(always)
            .then([1,2,3,4,5,6,7,8,9])
      });
   });
  
   describe("bind", function(){
      it("calls the original function", function() {
         var callCount = 0;
         
         var bound = (function(){ 
            callCount++; 
         }).bind({});
         
         bound();
         
         expect( callCount ).toBe(1);   
      });
      
      it("uses the given context", function() {
         var bound = (function(){ 
            expect(this).toEqual('a'); 
         }).bind('a');
         
         bound();   
      });
      
      it("propagates call-time arguments", function() {
         
         var bound = (function(arg1, arg2){
         
            expect( arg1 ).toBe('b');
            expect( arg2 ).toBe('c');
             
         }).bind('a');
         
         bound('b', 'c'); 
      });      
   });          
      
   describe("foreach", function(){
      it("calls the correct number of times", function() {
         
         var func = sinon.spy();
         
         [1,2,3].forEach(func);
         
         expect( func.callCount ).toEqual(3); 
      });
      
      it("calls with every item from the array", function() {
         
         var func = sinon.spy();
         
         [1,2,3].forEach(func);
         
         expect(func.calledWith(1)).toBe(true); 
         expect(func.calledWith(2)).toBe(true); 
         expect(func.calledWith(3)).toBe(true); 
      });
   });
   
   it("polyfills map correctly", function() {
               
      expect( [1,2,3].map(doubleUp) ).toEqual( [2,4,6] );          
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

});
