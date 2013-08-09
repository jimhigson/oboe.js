jsonPathSyntax(function (pathNodeDesc, doubleDotDesc, dotDesc, bangDesc, emptyDesc) {

   function givenDescriptor(descriptor) {
      return new NodeDescriptionAsserter(descriptor);
   }

   function NodeDescriptionAsserter(descriptor) {
      this._descriptor = descriptor;
   }

   NodeDescriptionAsserter.prototype.whenDescribing = function (pathFragment) {
      this._found = this._descriptor(pathFragment);
      return this;
   };

   NodeDescriptionAsserter.prototype.toContainMatches = function (expected) {

      if (expected && !this._found) {
         if (!expected.capturing && !expected.name && !expected.fieldList) {
            return this; // wasn't expecting to find anything
         }

         throw new Error('wanted to find ' + JSON.stringify(expected) + ' but did not find any matches');
      }

      expect(!!this._found[1]).toBe(!!expected.capturing);
      expect(this._found[2]).toBe(expected.name || '');
      expect(this._found[3] || '').toBe(expected.fieldList || '');

      return this;
   };

   function RegexMatchAsserter(pattern) {
      this._regex = pattern;
   }

   RegexMatchAsserter.prototype.shouldNotMatch = function (candidate) {

      this._candidate = candidate;

      assertFalse(

          'pattern ' + this._regex + ' should not have matched "' + candidate + '" but found' +
              JSON.stringify(this._regex.exec(candidate))
          , this._matched(candidate)
      );

      return this;
   };

   RegexMatchAsserter.prototype.finding = function (expected) {

      var result = this._regex.exec(this._candidate);

      assertEquals(expected, result[1]);

      return this;
   };

   RegexMatchAsserter.prototype._matched = function (candidate) {

      var result = this._regex.exec(candidate);
      return !!(result && (result[0] === candidate));
   };

   RegexMatchAsserter.prototype.capturing = function (arrayOfExpected) {

      return this;
   };


   describe('json path token parser', function () {

      beforeEach(function () {
         this.addMatchers({
            toContainMatches:function (expectedResults) {

               var foundResults = this.actual;

               if (expectedResults && !foundResults) {
                  if (!expectedResults.capturing && !expectedResults.name && !expectedResults.fieldList) {
                     return true; // wasn't expecting to find anything
                  }

                  this.message = function () {
                     return 'did not find anything'
                  };
                  return false;
               }

               if ((!!foundResults[1]    ) != (!!expectedResults.capturing)) {
                  return false
               }
               if ((foundResults[2]      ) != (expectedResults.name || '')) {
                  return false
               }
               if ((foundResults[3] || '') != (expectedResults.fieldList || '')) {
                  return false
               }

               return true;
            }
         ,  toNotMatch: function(){
         
               var foundResults = this.actual;
               
               return !foundResults;         
            }   
         });
      });

      describe('field list', function () {

         it('parses zero-length list', function () {
            expect(pathNodeDesc('{}')).toContainMatches({fieldList:''})
         });

         it('parses single field', function () {
            expect(pathNodeDesc('{a}')).toContainMatches({fieldList:'a'      })
         })
         
         it('parses two fields', function () {
            expect(pathNodeDesc('{r2 d2}')).toContainMatches({fieldList:'r2 d2'  })
         })
         
         it('parses numeric fields', function () {
            expect(pathNodeDesc('{1 2}')).toContainMatches({fieldList:'1 2'    })
         })
         
         it('ignores whitespace', function () {
            expect(pathNodeDesc('{a  b}')).toContainMatches({fieldList:'a  b'   })
         })
         
         it('ignores more whitespace', function () {
            expect(pathNodeDesc('{a   b}')).toContainMatches({fieldList:'a   b'  })
         })
         
         it('parses 3 fields', function () {
            expect(pathNodeDesc('{a  b  c}')).toContainMatches({fieldList:'a  b  c'})
         })
         
         it('needs a closing brace', function () {
            expect(pathNodeDesc('{a')).toNotMatch()
         })
      })

      describe('object notation', function () {

         it('parses', function () {
            expect(pathNodeDesc('aaa')).toContainMatches({name:'aaa'})
         })
         it('parses', function () {
            expect(pathNodeDesc('$aaa')).toContainMatches({name:'aaa', capturing:true})
         })
         it('parses', function () {
            expect(pathNodeDesc('aaa{a b c}')).toContainMatches({name:'aaa', fieldList:'a b c'})
         })
         it('parses', function () {
            expect(pathNodeDesc('$aaa{a b c}')).toContainMatches({name:'aaa', capturing:true, fieldList:'a b c'})
         })
         it('parses', function () {
            expect(pathNodeDesc('.a')).toContainMatches({})
         })
         it('parses', function () {
            expect(pathNodeDesc('a.b')).toContainMatches({name:'a'})
         })
         it('parses', function () {
            expect(pathNodeDesc('$$a')).toContainMatches({})
         })
         it('parses', function () {
            expect(pathNodeDesc('.a{')).toContainMatches({})
         })
      })

      describe('named array notation', function () {

         givenDescriptor(pathNodeDesc)
             .whenDescribing('["foo"]').toContainMatches({name:'foo'})
             .whenDescribing('$["foo"]').toContainMatches({name:'foo', capturing:true})
             .whenDescribing('["foo"]{a b c}').toContainMatches({name:'foo', fieldList:'a b c'})
             .whenDescribing('$["foo"]{a b c}').toContainMatches({name:'foo', capturing:true, fieldList:'a b c'})

             .whenDescribing('[]').toContainMatches({})
             .whenDescribing('[foo]').toContainMatches({})
             .whenDescribing('[""]').toContainMatches({})
             .whenDescribing('["foo"]["bar"]').toContainMatches({name:'foo'})
             .whenDescribing('[".foo"]').toContainMatches({})
      })

      describe('numbered array notation', function () {

         givenDescriptor(pathNodeDesc)
             .whenDescribing('[2]').toContainMatches({name:'2'})
             .whenDescribing('[123]').toContainMatches({name:'123'})
             .whenDescribing('$[2]').toContainMatches({name:'2', capturing:true})
             .whenDescribing('[2]{a b c}').toContainMatches({name:'2', fieldList:'a b c'})
             .whenDescribing('$[2]{a b c}').toContainMatches({name:'2', capturing:true, fieldList:'a b c'})

             .whenDescribing('[]').toContainMatches({})
             .whenDescribing('[""]').toContainMatches({})
      })

      describe('can parse node description with name and field list', function () {

         givenDescriptor(pathNodeDesc)
             .whenDescribing('foo{a b}')
             .toContainMatches({  capturing:false,
                name:'foo',
                fieldList:'a b'
             });

      })

      describe('can parse node description with name only', function () {

         givenDescriptor(pathNodeDesc)
             .whenDescribing('foo')
             .toContainMatches({  capturing:false,
                name:'foo',
                fieldList:null
             });

      })

      describe('can parse capturing node description with name and field list', function () {

         givenDescriptor(pathNodeDesc)
             .whenDescribing('$foo{a b}')
             .toContainMatches({  capturing:true,
                name:'foo',
                fieldList:'a b'
             });

      })

      describe('can parse node description with name only in array notation', function () {
         givenDescriptor(pathNodeDesc)
             .whenDescribing('["foo"]')
             .toContainMatches({  capturing:false,
                name:'foo',
                fieldList:null
             });

      })

      describe('can parse node description in pure duck type notation', function () {
         givenDescriptor(pathNodeDesc)
             .whenDescribing('{a b c}')
             .toContainMatches({  capturing:false,
                name:'',
                fieldList:'a b c'
             });

      })


   });

});