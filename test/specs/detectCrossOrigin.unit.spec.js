
describe("detecting cross origin-ness of URLS", function() {

   // page location needs to be of the form given by window.location:
   //
   // {
   //    protocol:'http:'        (nb: includes the colon, not just name)
   //    host:'google.co.uk',
   //    port:'80'               (or '')
   // }
   //
   // so, cases are:
   //    protocol:
   //          given in ajax, the same as page
   //          given in ajax, different from page
   //          not given in ajax url   
   //    host:
   //          given in ajax, the same as page
   //          given in ajax, different from page
   //          not given in ajax url
   //    port: given in both and same
   //          different
   //          both not given
   //          given as 80 in ajax url but not page, and page is http
   //          given as non-80 in ajax url but not page, and page is http
   //          given as 433 in ajax url but not page, and page is https
   //          given as non-433 in ajax url but not page, and page is https
   //          given in page but not ajax url
   
      
   describe('for http page with implicit port', function() {
      var currentPageLocation = {
         protocol:'http',
         host:'www.google.co.uk',
         port:''
      };
      
      var expectedResults = {
         '/foo/bar': false,
         'foo/bar': false,
         'http://localhost:9876/foo': false,
         '//localhost:9876/foo': true,
         'http://otherhost:9876/foo': true,
         'http://localhost:8081/foo': true,
         'https://localhost:9876/foo': true,
         'ftp://localhost:9876/foo': true,
         '//otherhost:9876/foo': true,
         '//localhost:8080/foo': true
      };
      
      for( var ajaxUrl in expectedResults ) {
         
         var expectedResult = expectedResults[ajaxUrl];
         
         it( 'should return  ' + expectedResult + ' for url ' + ajaxUrl, function( ajaxUrl, expectedResult ) {
            
            expect( isCrossOrigin(currentPageLocation, ajaxUrl).toEqual(expectedResult) );
            
         }.bind(ajaxUrl, expectedResult));
      }
   });
});
