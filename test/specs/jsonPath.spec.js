
describe('jsonPath', function(){

   describe('compiles valid syntax while rejecting invalid', function() {

      function compiling(pattern) {
         return function(){
            jsonPathCompiler(pattern);
         }
      }

      it("compiles a basic pattern without throwing", function(){
      
         expect(compiling('!')).not.toThrow();
       
      });
      
      describe("syntactically invalid patterns", function() {
      
         it("fail on single invalid token", function(){
         
            expect(compiling('-')).toThrow();
          
         });
         
         it("fail on invalid pattern with some valid tokens", function(){
         
            expect(compiling('foo-')).toThrow();
          
         });
         
         it("fail on unclosed duck clause", function(){
         
            expect(compiling('{foo')).toThrow();
          
         });
         
         it("fail on token with capture alone", function(){
         
            expect(compiling('foo$')).toThrow(); 
          
         });         
      });                   
      
   });   
   
   describe('patterns match correct paths', function() {
   
      beforeEach( function(){
         this.addMatchers({
            toMatchPath:function( pathStack ) {

               var pattern = this.actual;            
               var ascent = convertToAscent(pathStack);
                              
               var compiledPattern = jsonPathCompiler(pattern);
               
               try{                  
                  return !!compiledPattern(ascent);
               } catch( e ) {
                  this.message = function(){
                     return 'Error thrown running pattern "' + pattern + 
                            '" against path [' + pathStack.join(',') + ']' + "\n" + (e.stack || e.message) 
                  };
                  return false;      
               } 
            }            
         });
      
      });
     
      describe('when pattern has only bang', function() {
         it("should match root", function(){
            
            expect('!').toMatchPath([]);         
         });
         
         it("should miss non-root", function(){
            
            expect('!').not.toMatchPath(['a']);
            expect('!').not.toMatchPath(['a', 'b']);
         
         });
      });
      
      it('should match * universally', function() {
         expect('*').toMatchPath( []         );
         expect('*').toMatchPath( ['a']      );
         expect('*').toMatchPath( ['a', 2]   );
         expect('*').toMatchPath( ['a','b']  );
      });
      
      it('should match empty pattern universally', function() {
         expect('').toMatchPath( []         );
         expect('').toMatchPath( ['a']      );
         expect('').toMatchPath( ['a', 2]   );
         expect('').toMatchPath( ['a','b']  );
      });      
      
      
   }); 
   
   /*{   
     
                                  
   ,  testMatchingForAllDescendantsOfRootMatchAnythingExceptTheRoot: function() {
         givenAPattern('!..*')
            .thenShouldNotMatch(    [])
            .thenShouldMatch(       ['a'])
            .thenShouldMatch(       ['a','b']);                                  
      }
      
   ,  testMatchingForAllDescendantsOfAUniversallyMatchedRootMatchAnythingExceptTheRoot: function() {
         givenAPattern('*..*')
            .thenShouldNotMatch(    [])
            .thenShouldMatch(       ['a'])
            .thenShouldMatch(       ['a','b']);                                  
      }      
            
   ,  testMatchingNamedChildOfRootWorks: function() {
         givenAPattern('!.foo')
            .thenShouldMatch(       ['foo'])      
            .thenShouldNotMatch(    [])
            .thenShouldNotMatch(    ['foo', 'bar'])
            .thenShouldNotMatch(    ['bar'])
      }
      
   ,  testIsNotFooledBySubstringPatterns: function() {
         givenAPattern('!.foo')
            .thenShouldNotMatch(    ['foot'])      
      }      
      
   ,  testMatchingNamedAncestorOfRootWorks: function() {
         givenAPattern('!..foo')
            .thenShouldNotMatch(    [])         
            .thenShouldMatch(       ['foo'])      
            .thenShouldMatch(       ['a', 'foo'])
            .thenShouldNotMatch(    ['a', 'foo', 'a'])            
            .thenShouldMatch(       ['a', 'foo', 'foo'])
            .thenShouldMatch(       ['a', 'a', 'foo'])
            .thenShouldNotMatch(    ['a', 'a', 'foot'])            
            .thenShouldNotMatch(    ['a', 'foo', 'foo', 'a'])
      }
      
   ,  testAncestorOfRootRelationshipCanBeImplicit: function() {
         givenAPattern('..foo')
             .thenShouldNotMatch(   [])         
            .thenShouldMatch(       ['foo'])      
            .thenShouldMatch(       ['a', 'foo'])
            .thenShouldNotMatch(    ['a', 'foo', 'a'])            
            .thenShouldMatch(       ['a', 'foo', 'foo'])
            .thenShouldMatch(       ['a', 'a', 'foo'])
            .thenShouldNotMatch(    ['a', 'a', 'foot'])            
            .thenShouldNotMatch(    ['a', 'foo', 'foo', 'a'])
      }
      
   ,  testAncestorOfRootRelationshipCanBeEvenMoreImplicit: function() {
         givenAPattern('foo')
             .thenShouldNotMatch(   [])         
            .thenShouldMatch(       ['foo'])      
            .thenShouldMatch(       ['a', 'foo'])
            .thenShouldNotMatch(    ['a', 'foo', 'a'])            
            .thenShouldMatch(       ['a', 'foo', 'foo'])
            .thenShouldMatch(       ['a', 'a', 'foo'])
            .thenShouldNotMatch(    ['a', 'a', 'foot'])            
            .thenShouldNotMatch(    ['a', 'foo', 'foo', 'a'])
      }            
      
   ,  testMatchingTwoNamedAncestorsOfRootWorks: function() {
         givenAPattern('!..foo.bar')
             .thenShouldNotMatch(   [])         
            .thenShouldNotMatch(    ['foo'])      
            .thenShouldNotMatch(    ['a', 'foo'])
            .thenShouldMatch(       ['a', 'foo', 'bar'])            
            .thenShouldNotMatch(    ['a', 'foo', 'foo'])
            .thenShouldMatch(       ['a', 'a', 'a', 'foo', 'bar'])
            .thenShouldNotMatch(    ['a', 'a', 'a', 'foo', 'bar', 'a'])
      }
      
   ,  testMatchingTwoNamedAncestorsOfImpliedRootWorks: function() {
         givenAPattern('foo.bar')
             .thenShouldNotMatch(   [])         
            .thenShouldNotMatch(    ['foo'])      
            .thenShouldNotMatch(    ['a', 'foo'])
            .thenShouldMatch(       ['a', 'foo', 'bar'])            
            .thenShouldNotMatch(    ['a', 'foo', 'foo'])
            .thenShouldMatch(       ['a', 'a', 'a', 'foo', 'bar'])
            .thenShouldNotMatch(    ['a', 'a', 'a', 'foo', 'bar', 'a'])
      }      
      
   ,  testMatchingTwoNamedAncestorsSeperatedByStar: function() {
         givenAPattern('!..foo.*.bar')
             .thenShouldNotMatch(   [])         
            .thenShouldNotMatch(    ['foo'])      
            .thenShouldNotMatch(    ['a', 'foo'])
            .thenShouldNotMatch(    ['a', 'foo', 'bar'])            
            .thenShouldMatch(       ['a', 'foo', 'a', 'bar'])            
            .thenShouldNotMatch(    ['a', 'foo', 'foo'])
            .thenShouldNotMatch(    ['a', 'a', 'a', 'foo', 'bar'])
            .thenShouldMatch(       ['a', 'a', 'a', 'foo', 'a', 'bar'])
            .thenShouldNotMatch(    ['a', 'a', 'a', 'foo', 'bar', 'a'])
            .thenShouldNotMatch(    ['a', 'a', 'a', 'foo', 'a', 'bar', 'a'])
      }                  
      
   ,  testMatchingAnyNamedChildOfRootWorks: function() {
         givenAPattern('!.*')
            .thenShouldMatch(       ['foo'])      
            .thenShouldMatch(      ['bar'])            
            .thenShouldNotMatch(    [])
            .thenShouldNotMatch(    ['foo', 'bar'])
      }
      
   ,  testMatchingSequenceOfNamesWorks: function() {
         givenAPattern('!.a.b')
            .thenShouldMatch(       ['a', 'b'])      
            .thenShouldNotMatch(    [])            
            .thenShouldNotMatch(    ['a'])
      }
      
   ,  testNumericIndex: function() {
         givenAPattern('!.a.2')
            .thenShouldMatch(       ['a', 2])      
            .thenShouldMatch(       ['a', '2'])      
            .thenShouldNotMatch(    [])            
            .thenShouldNotMatch(    ['a'])
      }
                 
   ,  testNumericExpressedInArrayNotation: function() {
         givenAPattern('!.a[2]')
            .thenShouldMatch(       ['a', 2])      
            .thenShouldMatch(       ['a', '2'])      
            .thenShouldNotMatch(    [])            
            .thenShouldNotMatch(    ['a'])
      }
      
   ,  testArrayNotation: function() {
         givenAPattern('!["a"][2]')
            .thenShouldMatch(       ['a', 2])      
            .thenShouldMatch(       ['a', '2'])      
            .thenShouldNotMatch(    [])            
            .thenShouldNotMatch(    ['a'])
      }
      
   ,  testArrayNotationAtRoot: function() {
         givenAPattern('![2]')
            .thenShouldMatch(       [2])      
            .thenShouldMatch(       ['2'])      
            .thenShouldNotMatch(    [])            
            .thenShouldNotMatch(    ['a'])
      }
      
   ,  testArrayStarNotationAtRoot: function() {
         givenAPattern('![*]')
            .thenShouldMatch(       [2])      
            .thenShouldMatch(       ['2'])      
            .thenShouldMatch(       ['a'])            
            .thenShouldNotMatch(    [])            
      }            
      
   ,  testTrickyCase: function() {
         givenAPattern('!..foods..fr')
            .thenShouldMatch(       ['foods', 2, 'name', 'fr']);      
      }
      
   ,  testDoubleDotFollowedByStar: function() {      
         givenAPattern('!..*.bar')         
             .thenShouldMatch(['anything', 'bar']);1
      }
      
   ,  testDoubleDotFollowedByArrayStyleStar: function() {      
         givenAPattern('!..[*].bar')         
             .thenShouldMatch(['anything', 'bar']);1
      }                    

   // now several tests for css4-style pattern matching
   
   ,  testCanReturnsLastNodeInNonCss4StylePattern: function() {
         // let's start with a counter-example without $ syntax   
         givenAPattern('foo.*')                     
            .thenShouldMatch( 
                  [        'a',       'foo',     'a'], 
                  ['root', 'gparent', 'parent',  'target'])
                     .returning('target');
      }   
   
   ,  testCanReturnCorrectNamedNodeInSimpleCss4StylePattern: function() {      
         givenAPattern('$foo.*')                     
            .thenShouldMatch( 
                  [        'a',      'foo',     'a'], 
                  ['root', 'parent', 'target',  'child'])
                     .returning('target');
      }
      
   ,  testCanReturnCorrectNamedNodeInCss4StylePatternWhenFollowedByDoubleDot: function() {      
         givenAPattern('!..$foo..bar')                     
            .thenShouldMatch( 
                  [        'p',      'foo',    'c',      'bar'], 
                  ['root', 'parent', 'target', 'child',  'gchild'])
                     .returning('target');            
      }
      
   ,  testCanMatchChildrenOfRootWileReturningTheRoot: function() {      
         givenAPattern('$!.*')                     
            .thenShouldMatch( 
                  [        'a'    ], 
                  ['root', 'child'])
                     .returning('root');     
      }                  
      
   ,  testCanReturnCorrectNodeWithArrayStringNotationCss4StylePattern: function() {      
         givenAPattern('$["foo"].bar')         
             .thenShouldMatch( 
                   [        'foo',    'bar'  ], 
                   ['root', 'target', 'child'])
                      .returning('target');
      }
      
   ,  testCanReturnCorrectNodeWithArrayNumberedNotationCss4StylePattern: function() {      
         givenAPattern('$[2].bar')         
             .thenShouldMatch( 
                   [        '2',      'bar'  ], 
                   ['root', 'target', 'child'])
                      .returning('target');
      }      
      
   ,  testCanReturnCorrectNodeInInStarCss4StylePattern: function() {      
         givenAPattern('!..$*.bar')         
             .thenShouldMatch( 
                   [        'anything', 'bar'  ], 
                   ['root', 'target',   'child'])
                      .returning('target');
      }
      
   ,  testCanReturnCorrectNodeInInArrayStarCss4StylePattern: function() {      
         givenAPattern('!..$[*].bar')         
             .thenShouldMatch( 
                   [        'anything', 'bar'  ], 
                   ['root', 'target',   'child'])
                      .returning('target');
      }
      
      
      
   ,  testCanDuckMatchSuccessfully: function() {
   
         var rootJson = {  
                           people:{                           
                              jack:{                               
                                 name:  'Jack'
                              ,  email: 'jack@example.com'
                              }
                           }
                        };    
         
         givenAPattern('{name email}')         
             .thenShouldMatch( 
                   [          'people',          'jack'                 ], 
                   [rootJson, rootJson.people,   rootJson.people.jack   ])
                   
                      .returning({name:  'Jack',  email: 'jack@example.com'});
      }
      
   ,  testCanDuckMatchSuccessOnSeveralLevelsOfAPath: function() {
   
         var rootJson = {  
                           people:{                           
                              jack:{                               
                                 name:  'Jack'
                              ,  email: 'jack@example.com'
                              }
                           }
                        };    
         
         givenAPattern('{people}.{jack}.{name email}')         
             .thenShouldMatch( 
                   [          'people',          'jack'                 ], 
                   [rootJson, rootJson.people,   rootJson.people.jack   ])
                   
                      .returning({name:  'Jack',  email: 'jack@example.com'});
      }      
      
   ,  testCanDuckMatchUnsuccessfullyWhenAFieldIsMissing: function() {
   
         var rootJson = {  
                           people:{                           
                              jack:{
                                 // no name here!
                                 email: 'jack@example.com'
                              }
                           }
                        };    
         
         givenAPattern('{name email}')         
             .thenShouldNotMatch( 
                   [          'people',          'jack'                 ], 
                   [rootJson, rootJson.people,   rootJson.people.jack   ]);
      }
      
   ,  testCanFailADuckMatchExpressionBecauseUpstreamPathIsWrong: function() {
   
         var rootJson = {  
                           women:{                           
                              betty:{
                                 name:'Betty' 
                              ,  email: 'betty@example.com'
                              }
                           },
                           men:{
                              // we don't have non here!
                           }
                        };    
         
         givenAPattern('men.{name email}')         
             .thenShouldNotMatch( 
                   [          'women',          'betty'                 ], 
                   [rootJson, rootJson.women,   rootJson.women.betty    ]);
      }
      
   ,  testDuckMatchFailsWhenAppliedToNonObject: function() {
   
         var rootJson = [ 1, 2, 3 ];    
         
         givenAPattern('{spin taste}')         
             .thenShouldNotMatch( 
                   [         '0'           ], 
                   [rootJson, rootJson[0]  ]);
                   
      }
   }   
   */   
   
   function givenAPattern( pattern ) {
   
      return new Asserter(pattern);     
   }
   
   // for the given pattern, return an array of empty objects of the one greater length to
   // stand in for the nodestack in the cases where we only care about match or not match.
   // one greater because the root node doesnt have a name
   function fakeNodeStack(path){
   
      var rtn = path.map(function(){return {}});
      
      rtn.unshift({iAm:'root'});
      return rtn;      
   }
   
   function Asserter( pattern ){
      this._pattern = pattern;
      
      try {
         this._compiledPattern = jsonPathCompiler(pattern);
      } catch( e ) {
         fail( 'problem parsing:' + pattern + "\n" + (e.stack || e.message) );
      }          
   }
   
   function convertToAscent(pathStack, nodeStack){
   
      // first, make a defensive copy of the vars so that we can mutate them at will:
      pathStack = pathStack && JSON.parse(JSON.stringify(pathStack));
      nodeStack = nodeStack && JSON.parse(JSON.stringify(nodeStack));      
   
      // change the two parameters into the test from  arrays (which are easy to write as in-line js) to
      // lists (which is what the code under test needs) 
   
      nodeStack = nodeStack || fakeNodeStack(pathStack);
      
      pathStack.unshift(ROOT_PATH);
      
      // NB: can't use the more functional Array.prototype.reduce here, IE8 doesn't have it and might not 
      // be polyfilled
      
      var ascent = emptyList;

      for (var i = 0; i < pathStack.length; i++) {
         
         var mapping = {key: pathStack[i], node:nodeStack[i]};
                        
         ascent = cons( mapping, ascent );
      }
      
      return ascent;      
   }
   
   Asserter.prototype.thenShouldMatch = function(pathStack, nodeStack) {

      var ascent = convertToAscent(pathStack, nodeStack);
      
      try{   
         this._lastResult = this._compiledPattern(ascent);
      } catch( e ) {
         fail( 'Error thrown running pattern "' + this._pattern + 
                  '" against path [' + pathStack.join(',') + ']' + "\n" + (e.stack || e.message) );      
      }
                  
      assertTrue( 
         'pattern ' + this._pattern + ' should have matched ' + JSON.stringify(pathStack)
      ,   !!this._lastResult 
      );            
      
      return this;
   };
   
   Asserter.prototype.thenShouldNotMatch = function(pathStack, nodeStack) {

      var ascent = convertToAscent(pathStack, nodeStack);

      try{
         this._lastResult = this._compiledPattern(ascent);
      } catch( e ) {
         fail( 'Error thrown running pattern "' + this._pattern + 
                  '" against path ' + '[' + pathStack.join(',') + ']' + "\n" + (e.stack || e.message) );      
      }
      
      assertFalse( 
         'pattern ' + this._pattern + ' should not have matched [' + pathStack.join(',') + '] but ' +
             'did, returning ' + JSON.stringify(this._lastResult)
      ,  !!this._lastResult
      );          
        
      return this;         
   };
   
   Asserter.prototype.returning = function(node) {
      assertEquals(node, nodeOf(this._lastResult));
      
      return this;
   };
   
   });   


