
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
         expect('*').toMatchPath(            []          );
         expect('*').toMatchPath(            ['a']       );
         expect('*').toMatchPath(            ['a', 2]    );
         expect('*').toMatchPath(            ['a','b']   );
      });
      
      it('should match empty pattern universally', function() {
         expect('').toMatchPath(             []          );
         expect('').toMatchPath(             ['a']       );
         expect('').toMatchPath(             ['a', 2]    );
         expect('').toMatchPath(             ['a','b']   );
      });      
      
      it('should match !..* against anything but the root', function() {
         
         expect('!..*').not.toMatchPath(     []          );
         expect('!..*').toMatchPath(         ['a']       );
         expect('!..*').toMatchPath(         ['a','b']   );      
      });
      
      it('should match *..* against anything except the root since it requires a decendant ' +
          'which the root will never satisfy because it cannot have an ancestor', function() {
          
         expect('*..*').not.toMatchPath(     []          );
         expect('*..*').toMatchPath(         ['a']       );
         expect('*..*').toMatchPath(         ['a','b']   );

      });
      
      it('should match !.foo against foo node at first level only', function(){
         
         expect('!.foo').toMatchPath(        ['foo']     );      
         expect('!.foo').not.toMatchPath(    []          );
         expect('!.foo').not.toMatchPath(    ['foo', 'bar']);
         expect('!.foo').not.toMatchPath(    ['bar']     );      
      });
      
      it('should match !..foo against any path ending in foo', function(){
         
         expect('!..foo').not.toMatchPath(   []);         
         expect('!..foo').toMatchPath(       ['foo']);      
         expect('!..foo').toMatchPath(       ['a', 'foo']);
         expect('!..foo').not.toMatchPath(   ['a', 'foo', 'a']);            
         expect('!..foo').toMatchPath(       ['a', 'foo', 'foo']);
         expect('!..foo').toMatchPath(       ['a', 'a', 'foo']);
         expect('!..foo').not.toMatchPath(   ['a', 'a', 'foot']);            
         expect('!..foo').not.toMatchPath(   ['a', 'foo', 'foo', 'a']);      
      });
      
      it('should match ..foo like !..foo', function() {
         expect('..foo').not.toMatchPath(   []);         
         expect('..foo').toMatchPath(       ['foo']);      
         expect('..foo').toMatchPath(       ['a', 'foo']);
         expect('..foo').not.toMatchPath(   ['a', 'foo', 'a']);            
         expect('..foo').toMatchPath(       ['a', 'foo', 'foo']);
         expect('..foo').toMatchPath(       ['a', 'a', 'foo']);
         expect('..foo').not.toMatchPath(   ['a', 'a', 'foot']);            
         expect('..foo').not.toMatchPath(   ['a', 'foo', 'foo', 'a']);      
      });
      
      it('should match foo like !..foo or ..foo', function() {
         expect('foo').not.toMatchPath(   []);         
         expect('foo').toMatchPath(       ['foo']);      
         expect('foo').toMatchPath(       ['a', 'foo']);
         expect('foo').not.toMatchPath(   ['a', 'foo', 'a']);            
         expect('foo').toMatchPath(       ['a', 'foo', 'foo']);
         expect('foo').toMatchPath(       ['a', 'a', 'foo']);
         expect('foo').not.toMatchPath(   ['a', 'a', 'foot']);            
         expect('foo').not.toMatchPath(   ['a', 'foo', 'foo', 'a']);      
      });      
      
      it('is not fooled by substrings in path nodes', function(){
         expect('!.foo').not.toMatchPath(    ['foot'])
      }); 
   }); 
   
   /*{   
                                        
   ,  testMatchingTwoNamedAncestorsOfRootWorks: function() {
         expect('!..foo.bar')
             .not.toMatchPath(   [])         
            .not.toMatchPath(    ['foo'])      
            .not.toMatchPath(    ['a', 'foo'])
            .toMatchPath(       ['a', 'foo', 'bar'])            
            .not.toMatchPath(    ['a', 'foo', 'foo'])
            .toMatchPath(       ['a', 'a', 'a', 'foo', 'bar'])
            .not.toMatchPath(    ['a', 'a', 'a', 'foo', 'bar', 'a'])
      }
      
   ,  testMatchingTwoNamedAncestorsOfImpliedRootWorks: function() {
         expect('foo.bar')
             .not.toMatchPath(   [])         
            .not.toMatchPath(    ['foo'])      
            .not.toMatchPath(    ['a', 'foo'])
            .toMatchPath(       ['a', 'foo', 'bar'])            
            .not.toMatchPath(    ['a', 'foo', 'foo'])
            .toMatchPath(       ['a', 'a', 'a', 'foo', 'bar'])
            .not.toMatchPath(    ['a', 'a', 'a', 'foo', 'bar', 'a'])
      }      
      
   ,  testMatchingTwoNamedAncestorsSeperatedByStar: function() {
         expect('!..foo.*.bar')
             .not.toMatchPath(   [])         
            .not.toMatchPath(    ['foo'])      
            .not.toMatchPath(    ['a', 'foo'])
            .not.toMatchPath(    ['a', 'foo', 'bar'])            
            .toMatchPath(       ['a', 'foo', 'a', 'bar'])            
            .not.toMatchPath(    ['a', 'foo', 'foo'])
            .not.toMatchPath(    ['a', 'a', 'a', 'foo', 'bar'])
            .toMatchPath(       ['a', 'a', 'a', 'foo', 'a', 'bar'])
            .not.toMatchPath(    ['a', 'a', 'a', 'foo', 'bar', 'a'])
            .not.toMatchPath(    ['a', 'a', 'a', 'foo', 'a', 'bar', 'a'])
      }                  
      
   ,  testMatchingAnyNamedChildOfRootWorks: function() {
         expect('!.*')
            .toMatchPath(       ['foo'])      
            .toMatchPath(      ['bar'])            
            .not.toMatchPath(    [])
            .not.toMatchPath(    ['foo', 'bar'])
      }
      
   ,  testMatchingSequenceOfNamesWorks: function() {
         expect('!.a.b')
            .toMatchPath(       ['a', 'b'])      
            .not.toMatchPath(    [])            
            .not.toMatchPath(    ['a'])
      }
      
   ,  testNumericIndex: function() {
         expect('!.a.2')
            .toMatchPath(       ['a', 2])      
            .toMatchPath(       ['a', '2'])      
            .not.toMatchPath(    [])            
            .not.toMatchPath(    ['a'])
      }
                 
   ,  testNumericExpressedInArrayNotation: function() {
         expect('!.a[2]')
            .toMatchPath(       ['a', 2])      
            .toMatchPath(       ['a', '2'])      
            .not.toMatchPath(    [])            
            .not.toMatchPath(    ['a'])
      }
      
   ,  testArrayNotation: function() {
         expect('!["a"][2]')
            .toMatchPath(       ['a', 2])      
            .toMatchPath(       ['a', '2'])      
            .not.toMatchPath(    [])            
            .not.toMatchPath(    ['a'])
      }
      
   ,  testArrayNotationAtRoot: function() {
         expect('![2]')
            .toMatchPath(       [2])      
            .toMatchPath(       ['2'])      
            .not.toMatchPath(    [])            
            .not.toMatchPath(    ['a'])
      }
      
   ,  testArrayStarNotationAtRoot: function() {
         expect('![*]')
            .toMatchPath(       [2])      
            .toMatchPath(       ['2'])      
            .toMatchPath(       ['a'])            
            .not.toMatchPath(    [])            
      }            
      
   ,  testTrickyCase: function() {
         expect('!..foods..fr')
            .toMatchPath(       ['foods', 2, 'name', 'fr']);      
      }
      
   ,  testDoubleDotFollowedByStar: function() {      
         expect('!..*.bar')         
             .toMatchPath(['anything', 'bar']);1
      }
      
   ,  testDoubleDotFollowedByArrayStyleStar: function() {      
         expect('!..[*].bar')         
             .toMatchPath(['anything', 'bar']);1
      }                    

   // now several tests for css4-style pattern matching
   
   ,  testCanReturnsLastNodeInNonCss4StylePattern: function() {
         // let's start with a counter-example without $ syntax   
         expect('foo.*')                     
            .toMatchPath( 
                  [        'a',       'foo',     'a'], 
                  ['root', 'gparent', 'parent',  'target'])
                     .returning('target');
      }   
   
   ,  testCanReturnCorrectNamedNodeInSimpleCss4StylePattern: function() {      
         expect('$foo.*')                     
            .toMatchPath( 
                  [        'a',      'foo',     'a'], 
                  ['root', 'parent', 'target',  'child'])
                     .returning('target');
      }
      
   ,  testCanReturnCorrectNamedNodeInCss4StylePatternWhenFollowedByDoubleDot: function() {      
         expect('!..$foo..bar')                     
            .toMatchPath( 
                  [        'p',      'foo',    'c',      'bar'], 
                  ['root', 'parent', 'target', 'child',  'gchild'])
                     .returning('target');            
      }
      
   ,  testCanMatchChildrenOfRootWileReturningTheRoot: function() {      
         expect('$!.*')                     
            .toMatchPath( 
                  [        'a'    ], 
                  ['root', 'child'])
                     .returning('root');     
      }                  
      
   ,  testCanReturnCorrectNodeWithArrayStringNotationCss4StylePattern: function() {      
         expect('$["foo"].bar')         
             .toMatchPath( 
                   [        'foo',    'bar'  ], 
                   ['root', 'target', 'child'])
                      .returning('target');
      }
      
   ,  testCanReturnCorrectNodeWithArrayNumberedNotationCss4StylePattern: function() {      
         expect('$[2].bar')         
             .toMatchPath( 
                   [        '2',      'bar'  ], 
                   ['root', 'target', 'child'])
                      .returning('target');
      }      
      
   ,  testCanReturnCorrectNodeInInStarCss4StylePattern: function() {      
         expect('!..$*.bar')         
             .toMatchPath( 
                   [        'anything', 'bar'  ], 
                   ['root', 'target',   'child'])
                      .returning('target');
      }
      
   ,  testCanReturnCorrectNodeInInArrayStarCss4StylePattern: function() {      
         expect('!..$[*].bar')         
             .toMatchPath( 
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
         
         expect('{name email}')         
             .toMatchPath( 
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
         
         expect('{people}.{jack}.{name email}')         
             .toMatchPath( 
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
         
         expect('{name email}')         
             .not.toMatchPath( 
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
         
         expect('men.{name email}')         
             .not.toMatchPath( 
                   [          'women',          'betty'                 ], 
                   [rootJson, rootJson.women,   rootJson.women.betty    ]);
      }
      
   ,  testDuckMatchFailsWhenAppliedToNonObject: function() {
   
         var rootJson = [ 1, 2, 3 ];    
         
         expect('{spin taste}')         
             .not.toMatchPath( 
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


