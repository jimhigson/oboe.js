
describe("end to end integration test of while library", function(){

   it('gets all expected callbacks by time request finishes',  function() {
       
      var asserter = givenAnOboeInstance('/static/json/firstTenNaturalNumbers.json')
         .andWeAreListeningForNodes('![*]');         
      
      waitsFor( asserter.toComplete(), 'the request to complete', ASYNC_TEST_TIMEOUT);

      runs(function(){
               
         asserter.thenTheInstance(
             matched(0).atPath([0])
         ,   matched(1).atPath([1])
         ,   matched(2).atPath([2])
         ,   matched(3).atPath([3])
         ,   matched(4).atPath([4])
         ,   matched(5).atPath([5])
         ,   matched(6).atPath([6])
         ,   matched(7).atPath([7])
         ,   matched(8).atPath([8])
         ,   matched(9).atPath([9])
         );        
      });
   })
   
   it('gives full json to callback when request finishes',  function( queue ) {
            
      var fullResponse = null;            
                           
      oboe.doGet(                      
         '/static/json/firstTenNaturalNumbers.json',
         
         function ajaxFinished(obj) {                              
            fullResponse = obj;               
         }
      );   
      
      waitsFor( function(){ return !!fullResponse }, 'the request to complete', ASYNC_TEST_TIMEOUT )
      
      runs( function(){
         expect(fullResponse).toEqual([0,1,2,3,4,5,6,7,8,9])
      });      
   })
     
});  



