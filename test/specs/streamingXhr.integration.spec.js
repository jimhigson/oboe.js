/* Tests the streaming xhr without stubbing anything. Really just a test that 
*  we've got the interface of the in-browser XHR object pinned down  */

describe('streaming xhr with via real http', function() {
 
   // shorten the waiting time before a test fails. Default 30s is too long:
   beforeEach( function(){
      //jstestdriver.plugins.async.CallbackPool.TIMEOUT = ;
   })

   it('can ajax in a small known file',  function() {
   
      var combinedResult = '',
          requestCompleteStub = sinon.stub();
   
      // in practice, since we're running on an internal network and this is a small file,
      // we'll probably only get one callback         
      streamingXhr(
         'GET', 
         '/static/json/smallestPossible.json',
         null, // this is a GET, no data to send               
          
         function(nextDrip){
            combinedResult += nextDrip;                                                                                     
         },
         
         requestCompleteStub
      )
      
      waitsFor(function(){     
         return requestCompleteStub.called;      
      }, 'streaming xhr to complete', ASYNC_TEST_TIMEOUT);            

      runs(function(){
         expect(combinedResult).toEqual('{}');
      });  
   })
              
   it('can ajax in a very large file without missing any',  function() {
   
      var combinedResult = '',
          requestCompleteStub = sinon.stub();
   
      // in practice, since we're running on an internal network and this is a small file,
      // we'll probably only get one callback         
      streamingXhr(
         'GET', 
         '/static/json/twentyThousandRecords.json',
         null, // this is a GET, no data to send               
          
         function(nextDrip){
            combinedResult += nextDrip;                                                                                     
         },
         
         requestCompleteStub
      )
      
      waitsFor(function(){     
         return requestCompleteStub.called;      
      }, 'streaming xhr to complete', ASYNC_TEST_TIMEOUT);            

      runs(function(){
         var parsedResult = JSON.parse(combinedResult);
         
         // as per the name, should have 20,000 records in that file:                     
         expect(parsedResult.result.length).toEqual(20000);
      });  
   })
   
   it('can ajax in a streaming file without missing any',  function(queue) {
   
      var combinedResult = '',
          requestCompleteStub = sinon.stub();
   
      // in practice, since we're running on an internal network and this is a small file,
      // we'll probably only get one callback         
      streamingXhr(
        'GET', 
         cacheBustUrl('/stream/tenSlowNumbers'),
         null, // this is a GET, no data to send               
          
         function(nextDrip){
            combinedResult += nextDrip;                                                                                     
         },
         
         requestCompleteStub
      )
      
      waitsFor(function(){     
         return requestCompleteStub.called;      
      }, 'streaming xhr to complete', ASYNC_TEST_TIMEOUT);            

      runs(function(){
         // should have given valid json;
         try{
            var parsedResult = JSON.parse(combinedResult);
         } catch(e) {
            fail('could not parse json "' + combinedResult + '" because ' + e
                + ' this might happen if the browsers are connecting directly' 
                + ' to jstd instead of through the proxy'
                );
         }
         
         // as per the name, should have ten numbers in that file:
         expect(parsedResult).toEqual([0,1,2,3,4,5,6,7,8,9]);
      });              
   })
   
   it('can make a post request',  function(queue) {
   
      var payload = {'thisWill':'bePosted','andShould':'be','echoed':'back'},
          combinedResult = '',
          requestCompleteStub = sinon.stub();
   
      // in practice, since we're running on an internal network and this is a small file,
      // we'll probably only get one callback         
      streamingXhr(
        'POST',
         cacheBustUrl('/stream/echoback.json'),
         payload, // this is a GET, no data to send               
          
         function(nextDrip){
            combinedResult += nextDrip;                                                                                     
         },
         
         requestCompleteStub
      )
      
      waitsFor(function(){     
         return requestCompleteStub.called;      
      }, 'streaming xhr to complete', ASYNC_TEST_TIMEOUT);            

      runs(function(){
         // should have given valid json;
         try{
            var parsedResult = JSON.parse(combinedResult);
         } catch(e) {
            fail('could not parse json "' + combinedResult + '" because ' + e
                + ' this might happen if the browsers are connecting directly' 
                + ' to jstd instead of through the proxy'
                );
         }
                              
         expect(parsedResult).toEqual(payload);
      });
     
   })
   
   it('can make a put request',  function(queue) {
   
      var payload = {'thisWill':'bePosted','andShould':'be','echoed':'back'},
          combinedResult = '',
          requestCompleteStub = sinon.stub();
   
      // in practice, since we're running on an internal network and this is a small file,
      // we'll probably only get one callback         
      streamingXhr(
        'PUT',
         cacheBustUrl('/stream/echoback.json'),
         payload, // this is a GET, no data to send               
          
         function(nextDrip){
            combinedResult += nextDrip;                                                                                     
         },
         
         requestCompleteStub
      )
      
      waitsFor(function(){     
         return requestCompleteStub.called;      
      }, 'streaming xhr to complete', ASYNC_TEST_TIMEOUT);            

      runs(function(){
         // should have given valid json;
         try{
            var parsedResult = JSON.parse(combinedResult);
         } catch(e) {
            fail('could not parse json "' + combinedResult + '" because ' + e
                + ' this might happen if the browsers are connecting directly' 
                + ' to jstd instead of through the proxy'
                );
         }
                              
         expect(parsedResult).toEqual(payload);
      });
     
   })   
   
   it('does not call back with zero-length data',  function(queue) {
         
      var requestCompleteStub = sinon.stub();         
         
      // since this is a large file, even serving locally we're going to get multiple callbacks:       
      streamingXhr(
         'GET', '/static/json/twentyThousandRecords.json',
         null, // this is a GET: no data to send               
          
         function(nextDrip){            
            expect(nextDrip.length).not.toEqual(0);                                                                                     
         },
         
         requestCompleteStub
      )         

      waitsFor(function(){     
         return requestCompleteStub.called;      
      }, 'streaming xhr to complete', ASYNC_TEST_TIMEOUT);
      
      runs(function(){})   
   })      
   
   xit('AjaxingOverStreamingHttpGivesMultipleCallbacks',  function(queue) {
         
      var numberOfProgressCallbacks = 0;
   
      queue.call("ask the streaming xhr to fetch", function(callbacks){
      
         // since this is a large file, even serving locally we're going to get multiple callbacks:       
         streamingXhr(
            'GET', cacheBustUrl('/stream/tenSlowNumbers'),
            null, // this is a get: no data to send               
             
            function onProgress(){ 
               numberOfProgressCallbacks++; 
            },
            
            // callback for when the stream is complete. we register this just so that jstd knows
            // when to move onto the next queuer            
            callbacks.noop()
         )                     
      });

      queue.call("check we got multiple callbacks", function(){
                                
         // realistically, should have had 10 or 20, but this isn't deterministic so
         // 3 is enough to indicate the results didn't all arrive in one big blob.                                               
         if( numberOfProgressCallbacks < 3)(
            fail("I had " + numberOfProgressCallbacks + " progress callback(s), should have" +
                " had at least 3. If this doesn't test the browser's XHR might not support" +
                " reading partial responses. Unfortunately this is inevitable in IE less than" +
                " version 10.")                
         );
      });      
   })           
      
   function cacheBustUrl(url) {
      var now = Date.now? Date.now() : new Date().valueOf();
   
      return url + '/cacheBusted/' + now + '.txt';
   }

});