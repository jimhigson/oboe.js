(function(){

   TestCase("pathsTest", {
   
      testMatchesRoot: function() {
         givenAPattern('!')
            .thenShouldMatch(       [])
             .thenShouldNotMatch(   ['a'])
             .thenShouldNotMatch(   ['a','b'])
      }
      
   ,  testMatchesSingleStarAloneAnywhere: function() {
         givenAPattern('*')
            .thenShouldMatch(       [])
            .thenShouldMatch(       ['a'])
            .thenShouldMatch(       ['a','b'])
      }
      
   ,  testMatchingForAllDescendantsOfRootMatchAnythingExceptTheRoot: function() {
         givenAPattern('!..*')
            .thenShouldNotMatch(    [])
            .thenShouldMatch(       ['a'])
            .thenShouldMatch(       ['a','b'])
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
             .thenShouldNotMatch(   [])         
            .thenShouldMatch(       ['foo'])      
            .thenShouldMatch(       ['a', 'foo'])
            .thenShouldNotMatch(    ['a', 'foo', 'a'])            
            .thenShouldMatch(       ['a', 'foo', 'foo'])
            .thenShouldMatch(       ['a', 'a', 'foo'])
            .thenShouldNotMatch(    ['a', 'a', 'foot'])            
            .thenShouldNotMatch(    ['a', 'foo', 'foo', 'a'])
      }
      
   ,  testAncestorOfRootRelationshipCanBeImplicit: function() {
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

   ,  testCanReturnCorrectNamedNodeInCss4StylePattern: function() {      
         givenAPattern('!..$foo.*.bar')         
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
      
   ,  testCanReturnCorrectNodeInInStarCss4StylePattern: function() {      
         givenAPattern('!..foo.$*.bar')         
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
      
   ,  testCanReturnCorrectNodeWithArrayStarCss4StylePattern: function() {      
         givenAPattern('!..foo.[$*].bar')         
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
      
   ,  testCanReturnCorrectNodeWithArrayNumberedCss4StylePattern: function() {      
         givenAPattern('!..foo.[$2].bar')         
            .thenShouldNotMatch( [] )         
            .thenShouldNotMatch( ['foo'] )
      }
      
   ,  testCanReturnCorrectNodeWithArrayNumberedCss4StylePattern: function() {      
         givenAPattern('!..foo.[$2].bar')         
            .thenShouldNotMatch( [] )         
            .thenShouldNotMatch( ['foo'] )
      }            
                                                    
        
   });
   
   function givenAPattern( pattern ) {
   
      return new Asserter(pattern);     
   }
   
   function Asserter( pattern ){
      this._pattern = pattern;
      
      try {
         this._compiledPattern = jsonPathCompiler(pattern);
      } catch( e ) {
         fail( 'problem parsing:' + pattern + "\n" + e );
      }          
   }
   
   Asserter.prototype.thenShouldMatch = function(path) {

      try{   
         assertTrue( 
            'pattern ' + this._pattern + ' should have matched ' + '(' + path.join('.') + ')'
         ,   this._compiledPattern(path) 
         );
      } catch( e ) {
         fail( 'Error running pattern "' + this._pattern + '" against path ' + '(' + path.join('.') + ')' + "\n" + e );      
      }      
      
      return this;
   };
   
   Asserter.prototype.thenShouldNotMatch = function(path) {
   
      try{
         assertFalse( 
            'pattern ' + this._pattern + ' should not have matched ' + '(' + path.join('.') + ')'
         ,  this._compiledPattern(path)
         );
      } catch( e ) {
         fail( 'Error running pattern "' + this._pattern + '" against path ' + '(' + path.join('.') + ')' + "\n" + e );      
      }    
        
      return this;         
   };
   
   Asserter.prototype.thenShouldMatchPathAndNodes = function(path, nodes) {
   
      try{
         assertFalse( 
            'pattern ' + this._pattern + ' should not have matched ' + '(' + path.join('.') + ')'
         ,  this._compiledPattern(path)
         );
      } catch( e ) {
         fail( 'Error running pattern "' + this._pattern + '" against path ' + '(' + path.join('.') + ')' + "\n" + e );      
      }    
        
      return this;         
   };   

})();