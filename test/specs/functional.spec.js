
describe("functional", function() {

   describe("varargs", function() {
   
      it('works with fixed arguments', function() {
            
            var received1, received2, received3;
         
            function f(r1, r2, r3){
               received1 = r1;
               received2 = r2;
               received3 = r3;
            }
         
            var varargsSpy = varArgs(f);
            
            varargsSpy('a', 'b', 'c', 'd', 'e', 'f');
            
            assertEquals('a', received1);
            assertEquals('b', received2);
            assertEquals(['c', 'd', 'e', 'f'], received3);
      });
         
      it("works with no fixed arguments", function() {
         
         var received1 = 'not yet set';
      
         function f(r1){
            received1 = r1;
         }
      
         var varargsSpy = varArgs(f);
         
         varargsSpy('a', 'b', 'c', 'd', 'e', 'f');
         
         assertEquals(['a', 'b', 'c', 'd', 'e', 'f'], received1);
      });
         
              
      it('propagates the return value', function() {
               
         var varargsTestFn = varArgs(function(){ return 'expected' });
                  
         assertEquals('expected', varargsTestFn());
      });   
   });
   
   
   describe('compose', function() {
   
      it('executes composed functions right-to-left', function(){
         function dub(n){ return n*2 }
         function inc(n){ return n+1 }
         function half(n){ return n/2 }
         
         var composed = compose(dub, inc, half);  // composed(x) = dub(inc(half(x)))
         
         assertEquals( 4 , composed(2)); // if this gives 2.5 the order is wrong      
      });
      
      it('can compose head to take an item off a list and then use it', function() {
         var list = cons( {a:1}, emptyList );
   
         assertEquals(1, compose(attr('a'), head)( list ));      
      });
      
      it('gives an identity function when making a composition of zero functions', function() {
         var id = compose();
         
         assertEquals( 2 , id(2));      
      });
       
   });
   
});