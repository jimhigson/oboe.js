
describe("oboe integration (real http)", function() {

   var isNode = typeof window === "undefined"

   var oboe =     isNode 
               ?  require('../../dist/oboe-node.js') 
               :  (window.oboe)
               ;
            
   var ASYNC_TEST_TIMEOUT = 15 * 1000; // 15 seconds
   
   function url( path ){
      if( isNode ) {
         return 'localhost:4567/' + path;
      } else {
         return '/testServer/' + path;
      }
   }            

   it('gets all expected callbacks by time request finishes', function () {

      oboe(url('tenSlowNumbers'))
          .node('![*]', callbackSpy)
          .done(whenDoneFn);

      waitsFor(function () {
         return !!fullResponse
      }, 'the request to complete', ASYNC_TEST_TIMEOUT);

      runs(function () {

         expect(callbackSpy).toHaveBeenCalledWith(0, [0], [fullResponse, 0]);
         expect(callbackSpy).toHaveBeenCalledWith(1, [1], [fullResponse, 1]);
         expect(callbackSpy).toHaveBeenCalledWith(2, [2], [fullResponse, 2]);
         expect(callbackSpy).toHaveBeenCalledWith(3, [3], [fullResponse, 3]);
         expect(callbackSpy).toHaveBeenCalledWith(4, [4], [fullResponse, 4]);
         expect(callbackSpy).toHaveBeenCalledWith(5, [5], [fullResponse, 5]);
         expect(callbackSpy).toHaveBeenCalledWith(6, [6], [fullResponse, 6]);
         expect(callbackSpy).toHaveBeenCalledWith(7, [7], [fullResponse, 7]);
         expect(callbackSpy).toHaveBeenCalledWith(8, [8], [fullResponse, 8]);
         expect(callbackSpy).toHaveBeenCalledWith(9, [9], [fullResponse, 9]);

      });
   })

   it('can abort once some data has been found in streamed response', function () {
  
      var req = oboe(url('tenSlowNumbers'))
                  .node('![5]', abortCallback);

      waitsFor(theRequestToBeAborted, 'the request to be aborted', ASYNC_TEST_TIMEOUT);

      // in case we didn't abort, wait a little longer. If we didn't really abort we'd get the
      // rest of the data now and the test would fail:
      waitsFor(someSecondsToPass(2), ASYNC_TEST_TIMEOUT);

      runs(function () {
         // because the request was aborted on index array 5, we got 6 numbers (inc zero)
         // not the whole ten.      
      
         expect(req.root()).toEqual([0, 1, 2, 3, 4, 5]);
      
      });
   })

   it('can abort once some data has been found in not very streamed response', function () {

      // like above but we're getting a static file not the streamed numbers. This means
      // we'll almost certainly read in the whole response as one onprogress it is on localhost
      // and the json is very small 

      var req = oboe(url('static/json/firstTenNaturalNumbers.json'))
                  .node('![5]', abortCallback);

      waitsFor(theRequestToBeAborted, 'the request to be aborted', ASYNC_TEST_TIMEOUT);

      // in case we didn't abort, wait a little longer. If we didn't really abort we'd get the
      // rest of the data now and the test would fail:
      waitsFor(someSecondsToPass(2), ASYNC_TEST_TIMEOUT);

      runs(function () {
         // because the request was aborted on index array 5, we got 6 numbers (inc zero)
         // not the whole ten.      
      
         expect(req.root()).toEqual([0, 1, 2, 3, 4, 5]);      
      });
   })

   it('gives full json to callback when request finishes', function () {

      oboe.doGet(url('static/json/firstTenNaturalNumbers.json'))
          .done(whenDoneFn);

      waitsFor(function () {
         return !!fullResponse
      }, 'the request to complete', ASYNC_TEST_TIMEOUT)

      runs(function () {
         expect(fullResponse).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
      });
   })

   it('gives header to server side', function () {

      var countGotBack = 0;

      oboe(
          {  url:url('echoBackHeaders'),
             headers:{'x-snarfu':'SNARF', 'x-foo':'BAR'}
          } 
  
      ).node('x-snarfu', function (headerValue) {

         expect(headerValue).toBe('SNARF')
         countGotBack++;      
      
      }).node('x-foo', function (headerValue) {

         expect(headerValue).toBe('BAR')
         countGotBack++;
      }) 
  
      waitsFor(function () {
         return countGotBack == 2
      }, 'the request to complete', ASYNC_TEST_TIMEOUT)
   })

   it('can listen for nodes via nodejs-style syntax', function () {

      var countGotBack = 0;

      oboe(url('static/json/firstTenNaturalNumbers.json'))
         .on('node', '!.*', function (number) {
            countGotBack++;
         });

      waitsFor(function () {
         return countGotBack == 10
      }, 'ten callbacks', ASYNC_TEST_TIMEOUT)
   })

   it('can listen for paths via noeejs-style syntax', function () {

      var countGotBack = 0;

      oboe(url('static/json/firstTenNaturalNumbers.json'))
      
         .on('path', '!.*', function (number) { 
            countGotBack++;
         });

      waitsFor(function () {
         return countGotBack == 10
      }, 'ten callbacks', ASYNC_TEST_TIMEOUT)
   })

   it('fires error on 404', function () {

      var gotError = false

      oboe(url('doesNotExist'))
         .fail(function () {

            gotError = true
         });

      waitsFor(function () {
         return gotError
      }, 'the request to fail', ASYNC_TEST_TIMEOUT)
   })

   function someSecondsToPass(waitSecs) {

      function now() {
         // IE8 doesn't have Date.now() 
         return new Date().getTime();
      }

      var waitStart = now(),
          waitMs = waitSecs * 1000;

      return function () {
         return now() > (waitStart + waitMs);
      }
   }
   
   var callbackSpy,
       fullResponse,
       aborted;
   
   function abortCallback() {
      this.abort();
      aborted = true;
   }   
   
   function theRequestToBeAborted() {
      return aborted
   }   
      
   function whenDoneFn(obj) {
      fullResponse = obj;
   }

   beforeEach(function () {
      aborted = false;
      fullResponse = null;
      callbackSpy = jasmine.createSpy('callbackSpy');      
   });   

});  



