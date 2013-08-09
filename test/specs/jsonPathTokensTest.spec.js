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
            }, toNotMatch:function () {

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

         it('parses a name', function () {
            expect(pathNodeDesc('aaa')).toContainMatches({name:'aaa'})
         })
         it('parses a name and recognises the capturing flag', function () {
            expect(pathNodeDesc('$aaa')).toContainMatches({name:'aaa', capturing:true})
         })
         it('parses a name and field list', function () {
            expect(pathNodeDesc('aaa{a b c}')).toContainMatches({name:'aaa', fieldList:'a b c'})
         })
         it('parses a name with field list and capturing flag', function () {
            expect(pathNodeDesc('$aaa{a b c}')).toContainMatches({name:'aaa', capturing:true, fieldList:'a b c'})
         })
         it('wont parse unless the name is at the start', function () {
            expect(pathNodeDesc('.a')).toNotMatch()
         })
         it('parses only the first name', function () {
            expect(pathNodeDesc('a.b')).toContainMatches({name:'a'})
         })
         it('ignores invalid', function () {
            expect(pathNodeDesc('$$a')).toNotMatch()
         })
         it('needs field list to close', function () {
            expect(pathNodeDesc('.a{')).toNotMatch()
         })
      })

      describe('named array notation', function () {

         it('parses quoted', function () {
            expect(pathNodeDesc('["foo"]')).toContainMatches({name:'foo'})
         })
         it('parses quoted and capturing', function () {
            expect(pathNodeDesc('$["foo"]')).toContainMatches({name:'foo', capturing:true})
         })
         it('parses quoted with field list', function () {
            expect(pathNodeDesc('["foo"]{a b c}')).toContainMatches({name:'foo', fieldList:'a b c'})
         })
         it('parses quoted with field list and capturing', function () {
            expect(pathNodeDesc('$["foo"]{a b c}')).toContainMatches({name:'foo', capturing:true, fieldList:'a b c'})
         })
         it('ignores without a path name', function () {
            expect(pathNodeDesc('[]')).toNotMatch()
         })
         it('parses unquoted', function () {
            expect(pathNodeDesc('[foo]')).toNotMatch()
         })
         it('ignores unnamed because of an empty string', function () {
            expect(pathNodeDesc('[""]')).toNotMatch()
         })
         it('parses first token only', function () {
            expect(pathNodeDesc('["foo"]["bar"]')).toContainMatches({name:'foo'})
         })
         it('ignores invalid chars in name', function () {
            expect(pathNodeDesc('[".foo"]')).toNotMatch()
         })
      })

      describe('numbered array notation', function () {

         it('parses single digit', function () {
            expect(pathNodeDesc('[2]')).toContainMatches({name:'2'})
         })
         it('parses multiple digits', function () {
            expect(pathNodeDesc('[123]')).toContainMatches({name:'123'})
         })
         it('parses with capture flag', function () {
            expect(pathNodeDesc('$[2]')).toContainMatches({name:'2', capturing:true})
         })
         it('parses with field list', function () {
            expect(pathNodeDesc('[2]{a b c}')).toContainMatches({name:'2', fieldList:'a b c'})
         })
         it('parses with field list and capture', function () {
            expect(pathNodeDesc('$[2]{a b c}')).toContainMatches({name:'2', capturing:true, fieldList:'a b c'})
         })
         it('ignores without a name', function () {
            expect(pathNodeDesc('[]')).toNotMatch()
         })
         it('ignores empty string as a name', function () {
            expect(pathNodeDesc('[""]')).toNotMatch()
         })
      })

      it('can parse node description with name and field list', function () {

         givenDescriptor(pathNodeDesc)
             .whenDescribing('foo{a b}')
             .toContainMatches({  capturing:false,
                name:'foo',
                fieldList:'a b'
             });

      })

      it('can parse node description with name only', function () {

         givenDescriptor(pathNodeDesc)
             .whenDescribing('foo')
             .toContainMatches({  capturing:false,
                name:'foo',
                fieldList:null
             });

      })

      it('can parse capturing node description with name and field list', function () {

         givenDescriptor(pathNodeDesc)
             .whenDescribing('$foo{a b}')
             .toContainMatches({  capturing:true,
                name:'foo',
                fieldList:'a b'
             });

      })

      it('can parse node description with name only in array notation', function () {
         givenDescriptor(pathNodeDesc)
             .whenDescribing('["foo"]')
             .toContainMatches({  capturing:false,
                name:'foo',
                fieldList:null
             });

      })

      it('can parse node description in pure duck type notation', function () {
         givenDescriptor(pathNodeDesc)
             .whenDescribing('{a b c}')
             .toContainMatches({  capturing:false,
                name:'',
                fieldList:'a b c'
             });

      })


   });

});