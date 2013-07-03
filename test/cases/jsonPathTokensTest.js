(function(){

   TestCase("jsonPathTokensTest", {
   
      
      testFieldListMatchesCorrectly: function() {
      
         givenTheRegex(optionalFieldList)
            .shouldMatch(   '{}'        ).finding('')
            .shouldMatch(   '{a}'       ).finding('a')
            .shouldMatch(   '{r2 d2}'   ).finding('r2 d2')
            .shouldMatch(   '{1 2}'     ).finding('1 2')
            .shouldMatch(   '{a b}'     ).finding('a b')  
            .shouldMatch(   '{a  b}'    ).finding('a  b')
            .shouldMatch(   '{a   b}'   ).finding('a   b')
            .shouldMatch(   '{a  b  c}' ).finding('a  b  c')
            
            .shouldNotMatch('a'       )
            .shouldNotMatch('a b'     )
            .shouldNotMatch('{a'      )
            .shouldNotMatch('a}'      )
            .shouldNotMatch('.a'      )
      },
      
      testObjectNotation: function() {
      
         givenTheRegex(jsonPathNamedNodeInObjectNotation)
            .shouldMatch(    'aaa'              )
            .shouldMatch(    '$aaa'             )
            .shouldMatch(    'aaa{a b c}'       )
            .shouldMatch(    '$aaa{a b c}'      )
            
            .shouldNotMatch( '.a'      )
            .shouldNotMatch( 'a.b'      )
            .shouldNotMatch( '$$a'      )
            .shouldNotMatch( '.a{'      )
      },
      
      testNamedArrayNotation: function() {
      
         givenTheRegex(jsonPathNamedNodeInArrayNotation)
            .shouldMatch(    '["foo"]'          )
            .shouldMatch(    '$["foo"]'         )
            .shouldMatch(    '["foo"]{a b c}'   )
            .shouldMatch(    '$["foo"]{a b c}'  )
            
            .shouldNotMatch( '[]' )            
            .shouldNotMatch( '[2]' )            
            .shouldNotMatch( '[foo]' )            
            .shouldNotMatch( '[""]' )            
            .shouldNotMatch( '["foo"]["bar"]' )            
            .shouldNotMatch( '[".foo"]' )            
            .shouldNotMatch( '.foo' )            
      },
      
      testNumberedArrayNotation: function() {
      
         givenTheRegex(jsonPathNumberedNodeInArrayNotation)
            .shouldMatch(    '[2]'              )
            .shouldMatch(    '[123]'            )
            .shouldMatch(    '$[2]'             )
            .shouldMatch(    '[2]{a b c}'       )
            .shouldMatch(    '$[2]{a b c}'      )
            
            .shouldNotMatch( '[]' )            
            .shouldNotMatch( '["foo"]' )            
            .shouldNotMatch( '[foo]' )            
            .shouldNotMatch( '[""]' )            
            .shouldNotMatch( '.foo' )            
      }
      
   ,  testCanParseNodeDescriptionWithNameAndFieldList: function() {
      
         givenDescriptor(jsonPathNodeDescription)
            .whenDescribing('foo{a b}')
            .shouldFind({  capturing:  false,
                           name:       'foo',
                           fieldList:  'a b'
                        });
      
      }
      
   ,  testCanParseNodeDescriptionWithNameOnly: function() {
      
         givenDescriptor(jsonPathNodeDescription)
            .whenDescribing('foo')
            .shouldFind({  capturing:  false,
                           name:       'foo',
                           fieldList:  null
                        });
      
      }
      
   ,  testCanParseCapturingNodeDescriptionWithNameAndFieldList: function() {
      
         givenDescriptor(jsonPathNodeDescription)
            .whenDescribing('$foo{a b}')
            .shouldFind({  capturing:  true,
                           name:       'foo',
                           fieldList:  'a b'
                        });
      
      }      
      
   ,  testCanParseNodeDescriptionWithNameOnlyInArrayNotation: function() {      
         givenDescriptor(jsonPathNodeDescription)
            .whenDescribing('["foo"]')
            .shouldFind({  capturing:  false,
                           name:       'foo',
                           fieldList:  null
                        });
      
      }
      
     ,  testCanParseNodeDescriptionInPureDuckTypeNotation: function() {      
         givenDescriptor(jsonPathNodeDescription)
            .whenDescribing('{a b c}')
            .shouldFind({  capturing:  false,
                           name:       '',
                           fieldList:  'a b c'
                        });
      
      }                        
      
   }); 
  
   function givenDescriptor(descriptor) {
      return new NodeDescriptionAsserter(descriptor);
   }
  
   function NodeDescriptionAsserter( descriptor ) {
      this._descriptor = descriptor;         
   }
   
   NodeDescriptionAsserter.prototype.whenDescribing = function( pathFragment ){
      this._found = this._descriptor(pathFragment);
      return this;         
   };
  
   NodeDescriptionAsserter.prototype.shouldFind = function( expected ){
   
      if( expected && !this._found ) {
         throw new Error('wanted to find ' + JSON.stringify(expected) + ' but did not find any matches');
      }
   
      assertEquals( expected.capturing,   !!this._found[1] );   
      assertEquals( expected.name,          this._found[2] );
      assertEquals( expected.fieldList,     this._found[3] );
      return this;      
   };  
  
  
  
   function givenTheRegex( pattern ) {   
      return new RegexMatchAsserter(pattern);     
   }
      
   function RegexMatchAsserter( pattern ){
      this._regex = pattern;                
   }
   
   RegexMatchAsserter.prototype.shouldMatch = function(candidate) {
       
      this._candidate = candidate;       
       
      assertTrue(
       
          'pattern ' + this._regex + ' should have matched all of "' + candidate + '" but found only ' +
              JSON.stringify( this._regex.exec( candidate ) )
      ,   this._matched( candidate )               
      );      
      
      return this;
   };
   
   RegexMatchAsserter.prototype.shouldNotMatch = function(candidate) {

      this._candidate = candidate;

      assertFalse(
       
         'pattern ' + this._regex + ' should not have matched "' + candidate + '" but found' +
             JSON.stringify( this._regex.exec( candidate ) )         
      ,   this._matched( candidate ) 
      );      
      
      return this;
   };
   
   RegexMatchAsserter.prototype.finding = function(expected) {
      
      var result = this._regex.exec( this._candidate );

      assertEquals( expected,  result[1]);
      
      return this;
   };   
   
   RegexMatchAsserter.prototype._matched = function(candidate) {
      
      var result = this._regex.exec( candidate );
      return !!(result && (result[0] === candidate));  
   };
   
   RegexMatchAsserter.prototype.capturing = function(arrayOfExpected) {
            
      return this;
   };      

})();