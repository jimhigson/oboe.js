jsonPathSyntax(function (pathNodeDesc, doubleDotDesc, dotDesc, bangDesc, emptyDesc ) {

   describe('json path token parser', function() {
   
      it('field list matches correctly',  function() {
      
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
      })
      
      it('object notation',  function() {
      
         givenDescriptor(pathNodeDesc)
            .whenDescribing(    'aaa'              ).shouldFind({name:'aaa'})
            .whenDescribing(    '$aaa'             ).shouldFind({name:'aaa', capturing:true})
            .whenDescribing(    'aaa{a b c}'       ).shouldFind({name:'aaa', fieldList:'a b c'})
            .whenDescribing(    '$aaa{a b c}'      ).shouldFind({name:'aaa', capturing:true, fieldList:'a b c'})
            
            .whenDescribing( '.a'             ).shouldFind({})
            .whenDescribing( 'a.b'            ).shouldFind({name: 'a'})
            .whenDescribing( '$$a'            ).shouldFind({})
            .whenDescribing( '.a{'            ).shouldFind({})
      })
      
      it('named array notation',  function() {
      
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
      })
      
      it('numbered array notation',  function() {
      
         givenDescriptor(pathNodeDesc)
            .whenDescribing(    '[2]'              ).shouldFind({name:'2'})
            .whenDescribing(    '[123]'            ).shouldFind({name:'123'})
            .whenDescribing(    '$[2]'             ).shouldFind({name:'2', capturing:true})
            .whenDescribing(    '[2]{a b c}'       ).shouldFind({name:'2', fieldList:'a b c'})
            .whenDescribing(    '$[2]{a b c}'      ).shouldFind({name:'2', capturing:true, fieldList:'a b c'})
            
            .whenDescribing( '[]' ).shouldFind({})            
            .whenDescribing( '[""]' ).shouldFind({})            
      })
      
     it('can parse node description with name and field list',  function() {
      
         givenDescriptor(pathNodeDesc)
            .whenDescribing('foo{a b}')
            .shouldFind({  capturing:  false,
                           name:       'foo',
                           fieldList:  'a b'
                        });
      
      })
      
     it('can parse node description with name only',  function() {
      
         givenDescriptor(pathNodeDesc)
            .whenDescribing('foo')
            .shouldFind({  capturing:  false,
                           name:       'foo',
                           fieldList:  null
                        });
      
      })
      
     it('can parse capturing node description with name and field list',  function() {
      
         givenDescriptor(pathNodeDesc)
            .whenDescribing('$foo{a b}')
            .shouldFind({  capturing:  true,
                           name:       'foo',
                           fieldList:  'a b'
                        });
      
      })     
      
      it('can parse node description with name only in array notation',  function() {      
         givenDescriptor(pathNodeDesc)
            .whenDescribing('["foo"]')
            .shouldFind({  capturing:  false,
                           name:       'foo',
                           fieldList:  null
                        });
      
      })
      
      it('can parse node description in pure duck type notation',  function() {      
         givenDescriptor(pathNodeDesc)
            .whenDescribing('{a b c}')
            .shouldFind({  capturing:  false,
                           name:       '',
                           fieldList:  'a b c'
                        });
      
      })                       
         
    
     
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
         
         expect(!!this._found[1])      .toBe(!!expected.capturing);
         expect(this._found[2])        .toBe(expected.name || '');
         expect(this._found[3] || '')  .toBe(expected.fieldList || '');
               
         return this;      
      };  
              
      function RegexMatchAsserter( pattern ){
         this._regex = pattern;                
      }
           
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

});