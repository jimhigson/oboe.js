jsonPathTokens(function (pathNodeDesc, doubleDotDesc, dotDesc, bangDesc, emptyDesc ) {

   TestCase("jsonPathTokensTest", {
   
      
      testFieldListMatchesCorrectly: function() {
      
         givenDescriptor(pathNodeDesc)
            .whenDescribing(   '{}'        ).shouldFind({fieldList:''       })
            .whenDescribing(   '{a}'       ).shouldFind({fieldList:'a'      })
            .whenDescribing(   '{r2 d2}'   ).shouldFind({fieldList:'r2 d2'  })
            .whenDescribing(   '{1 2}'     ).shouldFind({fieldList:'1 2'    })
            .whenDescribing(   '{a b}'     ).shouldFind({fieldList:'a b'    })  
            .whenDescribing(   '{a  b}'    ).shouldFind({fieldList:'a  b'   })
            .whenDescribing(   '{a   b}'   ).shouldFind({fieldList:'a   b'  })
            .whenDescribing(   '{a  b  c}' ).shouldFind({fieldList:'a  b  c'})
            
            .whenDescribing('{a'           ).shouldFind({})
      },
      
      testObjectNotation: function() {
      
         givenDescriptor(pathNodeDesc)
            .whenDescribing(    'aaa'              ).shouldFind({name:'aaa'})
            .whenDescribing(    '$aaa'             ).shouldFind({name:'aaa', capturing:true})
            .whenDescribing(    'aaa{a b c}'       ).shouldFind({name:'aaa', fieldList:'a b c'})
            .whenDescribing(    '$aaa{a b c}'      ).shouldFind({name:'aaa', capturing:true, fieldList:'a b c'})
            
            .whenDescribing( '.a'             ).shouldFind({})
            .whenDescribing( 'a.b'            ).shouldFind({name: 'a'})
            .whenDescribing( '$$a'            ).shouldFind({})
            .whenDescribing( '.a{'            ).shouldFind({})
      },
      
      testNamedArrayNotation: function() {
      
         givenDescriptor(pathNodeDesc)
            .whenDescribing(    '["foo"]'          ).shouldFind({name: 'foo'})
            .whenDescribing(    '$["foo"]'         ).shouldFind({name: 'foo', capturing:true})
            .whenDescribing(    '["foo"]{a b c}'   ).shouldFind({name: 'foo', fieldList:'a b c'})
            .whenDescribing(    '$["foo"]{a b c}'  ).shouldFind({name: 'foo', capturing:true, fieldList:'a b c'})
            
            .whenDescribing( '[]'             ).shouldFind({})                      
            .whenDescribing( '[foo]'          ).shouldFind({})            
            .whenDescribing( '[""]'           ).shouldFind({})            
            .whenDescribing( '["foo"]["bar"]' ).shouldFind({name:'foo'})            
            .whenDescribing( '[".foo"]'       ).shouldFind({})                        
      },
      
      testNumberedArrayNotation: function() {
      
         givenDescriptor(pathNodeDesc)
            .whenDescribing(    '[2]'              ).shouldFind({name:2})
            .whenDescribing(    '[123]'            ).shouldFind({name:123})
            .whenDescribing(    '$[2]'             ).shouldFind({name:2, capturing:true})
            .whenDescribing(    '[2]{a b c}'       ).shouldFind({name:2, fieldList:'a b c'})
            .whenDescribing(    '$[2]{a b c}'      ).shouldFind({name:2, capturing:true, fieldList:'a b c'})
            
            .whenDescribing( '[]' ).shouldFind({})            
            .whenDescribing( '[""]' ).shouldFind({})            
      }
      
   ,  testCanParseNodeDescriptionWithNameAndFieldList: function() {
      
         givenDescriptor(pathNodeDesc)
            .whenDescribing('foo{a b}')
            .shouldFind({  capturing:  false,
                           name:       'foo',
                           fieldList:  'a b'
                        });
      
      }
      
   ,  testCanParseNodeDescriptionWithNameOnly: function() {
      
         givenDescriptor(pathNodeDesc)
            .whenDescribing('foo')
            .shouldFind({  capturing:  false,
                           name:       'foo',
                           fieldList:  null
                        });
      
      }
      
   ,  testCanParseCapturingNodeDescriptionWithNameAndFieldList: function() {
      
         givenDescriptor(pathNodeDesc)
            .whenDescribing('$foo{a b}')
            .shouldFind({  capturing:  true,
                           name:       'foo',
                           fieldList:  'a b'
                        });
      
      }      
      
   ,  testCanParseNodeDescriptionWithNameOnlyInArrayNotation: function() {      
         givenDescriptor(pathNodeDesc)
            .whenDescribing('["foo"]')
            .shouldFind({  capturing:  false,
                           name:       'foo',
                           fieldList:  null
                        });
      
      }
      
     ,  testCanParseNodeDescriptionInPureDuckTypeNotation: function() {      
         givenDescriptor(pathNodeDesc)
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
         if( !expected.capturing && !expected.name && !expected.fieldList ) {
            return this; // wasn't expecting to find anything
         }
      
         throw new Error('wanted to find ' + JSON.stringify(expected) + ' but did not find any matches');
      }
            
      assertEquals( 'capturing not found correctly' , !!expected.capturing     , !!this._found[1] );   
      assertEquals( 'name not found correctly'      , expected.name || ''      , this._found[2]   );
      assertEquals( 'fieldList not found correctly' , expected.fieldList || '' , this._found[3] || '' );
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

});