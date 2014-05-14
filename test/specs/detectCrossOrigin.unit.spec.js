
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
                  
          expect('/foo/bar').toParseTo({
             protocol:'',
             host:'',
             port:''
          });
         
      });

      it( 'parses absolute path with extension', function() {
         
          expect('/foo/bar.jpg').toParseTo({
             protocol:'',
             host:'',
             port:''
          });
         
      });

      it( 'parses absolute path with extension with query', function() {
         
          expect('/foo/bar.jpg?foo=bar&woo=doo').toParseTo({
             protocol:'',
             host:'',
             port:''
          });
         
      });

      it( 'parses relative path only', function() {
         
          expect('foo/bar').toParseTo({
             protocol:'',
             host:'',
             port:''
          });
         
      });

      it( 'parses relative path with extension', function() {
         
          expect('foo/bar.jpg').toParseTo({
             protocol:'',
             host:'',
             port:''
          });
         
      });

      it( 'parses a url with domain', function() {
         
          expect('example.com/foo/bar.jpg').toParseTo({
             protocol:'',
             host:'example.com',
             port:''
          });
         
      });

      it( 'parses a domain with a hyphen', function() {
         
          expect('example-site.com/foo/bar.jpg').toParseTo({
             protocol:'',
             host:'example-site.com',
             port:''
          });
         
      });

      it( 'parses a url with domain with a number', function() {

         expect('123.com/foo/bar.jpg').toParseTo({
            protocol:'',
            host:'123.com',
            port:''
         });

      });


      it( 'parses a domain-relative path', function() {
         
          expect('//example.com/foo/bar.jpg').toParseTo({
             protocol:'',
             host:'example.com',
             port:''
          });
         
      });

      it( 'parses a domain-relative path with a hypen in the domain', function() {
         
          expect('//example-site.com/foo/bar.jpg').toParseTo({
             protocol:'',
             host:'example-site.com',
             port:''
          });
         
      });

      it( 'parses a domain-relative path to the root of the domain', function() {
         
          expect('//example-site.com/').toParseTo({
             protocol:'',
             host:'example-site.com',
             port:''
          });
      });

      it( 'parses a domain-relative path to the implicit root of the domain', function() {

         expect('//example-site.com').toParseTo({
            protocol:'',
            host:'example-site.com',
            port:''
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
