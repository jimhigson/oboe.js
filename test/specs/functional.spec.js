
describe("functional", function() {

   describe("varargs", function() {
   
      describe('with fixed arguments', function() {
            
            var received1, received2, receivedRest;
         
            function f(a1, a2, array){
               received1 = a1;
               received2 = a2;
               receivedRest = array;
            }
         
            var varargsSpy = varArgs(f);
            
            varargsSpy('a', 'b', 'c', 'd', 'e', 'f');
            
            it( 'passes through the first arguments as-is' , function() {
            
               expect(received1).toBe('a');
               expect(received2).toBe('b');            
            });
            
            it( 'passes through the rest as an array', function() {
            
               expect(receivedRest).toEqual(['c', 'd', 'e', 'f']);
            });
      });
         
      it("works with no fixed arguments", function() {
          
         var received1 = 'not yet set';
      
         function f(r1){
            received1 = r1;
         }
      
         var varargsSpy = varArgs(f);
         
         varargsSpy('a', 'b', 'c', 'd', 'e', 'f');
         
         expect(received1).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
      });
         
              
      it('propagates the return value', function() {
               
         var varargsTestFn = varArgs(function(){ return 'expected' });
                  
         expect( varargsTestFn() ).toBe('expected');                   
      });   
   });
   
   
   describe('compose', function() {
   
      it('executes composed functions right-to-left', function(){
         function dub(n){ return n*2 }
         function inc(n){ return n+1 }
         function half(n){ return n/2 }
         
         var composed = compose(dub, inc, half);  // composed(x) = dub(inc(half(x)))
         
         expect(composed(2)).toBe( 4 ); // if this gives 2.5 the order is wrong      
      });
      
      it('can compose head to take an item off a list and then use it', function() {
         var list = cons( {a:1}, emptyList );
   
         expect( compose(attr('a'), head)( list ) ).toBe(1);      
      });
      
      it('gives an identity function when making a composition of zero functions', function() {
         var id = compose();
         
         expect( id(2) ).toBe(2);      
      });
       
   });
   
});