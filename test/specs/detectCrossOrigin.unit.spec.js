
describe("detecting cross-origin-ness", function() {

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
   
   describe('can parse URLs', function() {

      var noInformationRegardingOrigin = {
         protocol: '',
         host: '',
         port: ''
      };      
      
      beforeEach(function() {
         this.addMatchers({
            toParseTo:function(expected) {

               var actualUrl = this.actual;
               var actualUrlParsed = parseUrlOrigin(actualUrl);
               
               this.message = function(){
                  return 'expected ' + actualUrl  
                                   + ' to parse to ' + JSON.stringify(expected) 
                                   + ' but got ' + JSON.stringify(actualUrlParsed);
               };
               
               return (actualUrlParsed.protocol == expected.protocol) &&
                      (actualUrlParsed.host     == expected.host) &&
                      (actualUrlParsed.port     == expected.port);
            }
         });
      });
      
      it( 'parses absolute path only', function() {
         expect('/foo/bar').toParseTo(noInformationRegardingOrigin);
      });

      it( 'parses absolute path with extension', function() {
          expect('/foo/bar.jpg').toParseTo(noInformationRegardingOrigin);
      });

      it( 'parses absolute path with extension and query', function() {
          expect('/foo/bar.jpg?foo=bar&woo=doo').toParseTo(noInformationRegardingOrigin);
      });

      it( 'parses relative path only', function() {
          expect('foo/bar').toParseTo(noInformationRegardingOrigin);
      });

      it( 'parses relative path with extension', function() {
          expect('foo/bar.jpg').toParseTo(noInformationRegardingOrigin);
      });

      it( 'parses a url with domain but no protocol', function() {
         
          expect('//example.com/foo/bar.jpg').toParseTo({
             protocol:'',
             host:'example.com',
             port:''
          });
      });

      it( 'parses a url with one-word domain', function() {

         expect('//database/foo/bar.jpg').toParseTo({
            protocol:'',
            host:'database',
            port:''
         });
      });

      it( 'parses a url with one-word domain and port', function() {

         expect('//search:9200/foo/bar').toParseTo({
            protocol:'',
            host:'search',
            port:'9200'
         });
      });


      it( 'parses a url with domain with a hyphen', function() {

         expect('//example-site.org/foo/bar.jpg').toParseTo({
            protocol:'',
            host:'example-site.org',
            port:''
         });
      });      
      
      it( 'parses a url with domain with a number', function() {

         expect('//123.org.uk/foo/bar.jpg').toParseTo({
            protocol:'',
            host:'123.org.uk',
            port:''
         });
      });

      it( 'parses a url with a protocol', function() {

         expect('http://example.com/foo').toParseTo({
            protocol:'http:',
            host:'example.com',
            port:''
         });
      });

      it( 'parses a url with a protocol and a port', function() {

         expect('http://elasticsearch:9200/tweets').toParseTo({
            protocol:'http:',
            host:'elasticsearch',
            port:'9200'
         });
      });

      it( 'parses a url with a protocol and a port implicitly at the root', function() {

         expect('http://elasticsearch:9200').toParseTo({
            protocol:'http:',
            host:'elasticsearch',
            port:'9200'
         });
      });      

   });
      
   describe('for http page with implicit port', function() {
      var currentPageLocation = {
         protocol:'http:',
         host:'www.google.co.uk',
         port:''
      };
      
      var expectedResults = {
         '/foo/bar': false,
         'foo/bar': false,
         'http://localhost:9876/foo': true,
         '//localhost:9876/foo': true,
         'http://otherhost:9876/foo': true,
         'http://localhost:8081/foo': true,
         'https://localhost:9876/foo': true,
         'ftp://localhost:9876/foo': true,
         '//otherhost:9876/foo': true,
         '//localhost:8080/foo': true
      };
      
      for( var ajaxUrl in expectedResults ) {
                  
         var expectToBeCrossOrigin = expectedResults[ajaxUrl],
             desc = (expectToBeCrossOrigin? 'cross-origin' : 'same-origin');
         
         it( 'from ' + putTogether(currentPageLocation) + ' should detect ' + ajaxUrl + ' as ' + desc, function( ajaxUrl, expectedResult ) {

            expect( isCrossOrigin(currentPageLocation, parseUrlOrigin(ajaxUrl))).toEqual(expectedResult);
            
         }.bind(this, ajaxUrl, expectToBeCrossOrigin));
      }
   });
   
   function putTogether(origin) {
      return origin.protocol + '//' + origin.host + (origin.port? ':' + origin.port : '');
   }
   
});
