


describe("whole oboe library with only the network stubbed out", function(){

   var streamingStub; 

   beforeEach(function() {
      streamingStub = sinon.stub(window, 'streamingXhr');      
   })
   
   afterEach(function() {
      streamingStub.restore();   
   })
   
   it('MethodsAreChainable',  function() {
      // very basic test that nothing forgot to return 'this':

      expect(function(){      
         function noop(){}
         
         oboe.doGet('http://example.com/oboez')
            .onPath('*', noop).onNode('*', noop).onError(noop).onPath('*', noop)
            .onPath({'*':noop}).onNode({'*': noop}).onPath({'*':noop});
            
      }).not.toThrow();
   })
   
   it('HandlesEmptyObjectDetectedWithBang',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('!')
         .whenGivenInput('{}')
         .thenTheInstance(
            matched({}).atRootOfJson(),
            foundOneMatch
         );

   })
   
   it('HandlesEmptyObjectDetectedWithBangWhenExplicitlySelected',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('$!')
         .whenGivenInput('{}')
         .thenTheInstance(
            matched({}).atRootOfJson(),
            foundOneMatch
         );

   })   
   
   it('GivesWindowAsContextWhenNothingGivenExplicitly',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('!')
         .whenGivenInput('{}')
         .thenTheInstance( calledbackWithContext(window) );
   })
   
   it('CallsOnGivenContext',  function() {
      var myObject = { doSomething: function(){} };

      givenAnOboeInstance()
         .andWeAreListeningForNodes('!', myObject.doSomething, myObject)
         .whenGivenInput('{}')
         .thenTheInstance( calledbackWithContext(myObject) );
   })   

   it('FindOnlyFiresWhenHasWholeObject',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('!')
         .whenGivenInput('{')
          .thenTheInstance(
            foundNoMatches
          )
         .whenGivenInput('}')
         .thenTheInstance(
            matched({}).atRootOfJson(),
            foundOneMatch
         );

   })

   it('ListeningForPathFiresWhenRootObjectStarts',  function() {

      // clarinet doesn't notify of matches to objects (onopenobject) until the
      // first key is found, that is why we don't just give '{' here as the partial
      // input.

      givenAnOboeInstance()
         .andWeAreListeningForPaths('!')
         .whenGivenInput('{"foo":')
          .thenTheInstance(
            foundNMatches(1),
            matched({}).atRootOfJson()
          );
   })
   
   it('ListeningForPathFiresWhenRootArrayStarts',  function() {

      // clarinet doesn't notify of matches to objects (onopenobject) until the
      // first key is found, that is why we don't just give '{' here as the partial
      // input.

      givenAnOboeInstance()
         .andWeAreListeningForPaths('!')
         .whenGivenInput('[1') // the minimum string required for clarinet 
                               // to fire onopenarray. Won't fire with '['.
          .thenTheInstance(
            foundNMatches(1),
            matched([]).atRootOfJson()
          );
   })
   
     
   it('HandlesEmptyObjectDetectedWithSingleStar',  function() {
      // *
      givenAnOboeInstance()
         .andWeAreListeningForNodes('*')
         .whenGivenInput('{}')
         .thenTheInstance(
            matched({}).atRootOfJson(),
            foundOneMatch
         );
   })
   
   it('DoesntDetectSpuriousPathOffEmptyObject',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForPaths('!.foo.*')
         .whenGivenInput( {foo:{}} )
         .thenTheInstance(
            foundNoMatches
         );
   })   

   it('HandlesEmptyObjectDetectedWithDoubleDot',  function() {
      // *
      givenAnOboeInstance()
         .andWeAreListeningForNodes('*')
         .whenGivenInput('{}')
         .thenTheInstance(
            matched({}).atRootOfJson(),
            foundOneMatch
         );
   })

   it('NotifiesOfStringsWhenListenedTo',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('!.string')
         .whenGivenInput('{"string":"s"}')
         .thenTheInstance(
            matched("s"),
            foundOneMatch
         );
   })
   
   it('NotifiesOfPathForOfPropertyNameWithIncompleteJson',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForPaths('!.string')
         .whenGivenInput('{"string":')
         .thenTheInstance(
            foundOneMatch
         );
   })

   it('NotifiesOfSecondPropertyNameWithIncompleteJson',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForPaths('!.pencils')
         .whenGivenInput('{"pens":4, "pencils":')
         .thenTheInstance(
            // undefined because the parser hasn't been given the value yet.
            // can't be null because that is an allowed value
            matched(undefined).atPath(['pencils']),
            foundOneMatch
         );
   })
   
   it('IsAbleToNotifyOfNull',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('!.pencils')
         .whenGivenInput('{"pens":4, "pencils":null}')
         .thenTheInstance(
            // undefined because the parser hasn't been given the value yet.
            // can't be null because that is an allowed value
            matched(null).atPath(['pencils']),
            foundOneMatch
         );
   })   

   it('NotifiesOfMultipleChildrenOfRoot',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('!.*')
         .whenGivenInput('{"a":"A","b":"B","c":"C"}')
         .thenTheInstance(
             matched('A').atPath(['a'])
         ,   matched('B').atPath(['b'])
         ,   matched('C').atPath(['c'])
         ,   foundNMatches(3)
         );
   })
   
   it('NotifiesOfMultipleChildrenOfRootWhenSelectingTheRoot',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('$!.*')
         .whenGivenInput({"a":"A", "b":"B", "c":"C"})
         .thenTheInstance(
            // rather than getting the fully formed objects, we should now see the root object
            // being grown step by step:
             matched({"a":"A"})
         ,   matched({"a":"A", "b":"B"})
         ,   matched({"a":"A", "b":"B", "c":"C"})
         ,   foundNMatches(3)
         );
   })   
   
   it('DoesNotNotifySpuriouslyOfFoundPath',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForPaths('!.a')
         .whenGivenInput([{a:'a'}])
         .thenTheInstance(foundNoMatches);
   })
   
   it('DoesNotNotifySpuriouslyOfFoundObject',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('!.a')
         .whenGivenInput([{a:'a'}])
         .thenTheInstance(foundNoMatches);
   })      

   it('NotifiesOfMultiplePropertiesOfAnObjectWithoutWaitingForEntireObject',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('!.*')
         .whenGivenInput('{"a":')
         .thenTheInstance(
             foundNoMatches
          )
         .whenGivenInput('"A",')
         .thenTheInstance(
             matched('A').atPath(['a'])
         ,   foundOneMatch
         )
         .whenGivenInput('"b":"B"}')
         .thenTheInstance(
             matched('B').atPath(['b'])
         ,   foundNMatches(2)
         );
   })
   
   it('CanGetRootJsonAsJsonObjectIsBuiltUp',  function() {

      givenAnOboeInstance()
         .whenGivenInput('{"a":')
         .thenTheInstance(
            hasRootJson({a:undefined})
          )
         .whenGivenInput('"A",')
         .thenTheInstance(
             hasRootJson({a:'A'})
         )
         .whenGivenInput('"b":')
         .thenTheInstance(
            hasRootJson({a:'A', b:undefined})
         )
         .whenGivenInput('"B"}')
         .thenTheInstance(
            hasRootJson({a:'A', b:'B'})         
         )
         .whenInputFinishes()
         .thenTheInstance(         
            gaveFinalCallbackWithRootJson({a:'A', b:'B'})
         );
   })   
   it('CanGetRootJsonAsJsonArrayIsBuiltUp',  function() {

      // let's feed it the array [11,22] in drips of one or two chars at a time:

      givenAnOboeInstance()
         .whenGivenInput('[')
         .thenTheInstance(
            // I would like this to be [] but clarinet doesn't fire array found until it has seen
            // the first element
            hasRootJson(undefined)
         )
         .whenGivenInput('1')
         .thenTheInstance(
             // since we haven't seen a comma yet, the 1 could be the start of a multi-digit number
             // so nothing can be added to the root json
             hasRootJson([])
         )
         .whenGivenInput('1,')
         .thenTheInstance(
            hasRootJson([11])
         )
         .whenGivenInput('2')
         .thenTheInstance(
            hasRootJson([11])
         )
         .whenGivenInput('2]')
         .thenTheInstance(
            hasRootJson([11,22])         
         )
         .whenInputFinishes()
         .thenTheInstance(         
            gaveFinalCallbackWithRootJson([11,22])
         );
   })      

   it('NotifiesOfNamedChildOfRoot',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('!.b')
         .whenGivenInput('{"a":"A","b":"B","c":"C"}')
         .thenTheInstance(
             matched('B').atPath(['b'])
         ,   foundOneMatch
         );
   })
   it('NotifiesOfArrayElements',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('!.testArray.*')
         .whenGivenInput('{"testArray":["a","b","c"]}')
         .thenTheInstance(
             matched('a').atPath(['testArray',0])
         ,   matched('b').atPath(['testArray',1])
         ,   matched('c').atPath(['testArray',2])
         ,   foundNMatches(3)
         );
   })
   it('NotifiesOfPathMatchWhenArrayStarts',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForPaths('!.testArray')
         .whenGivenInput('{"testArray":["a"')
         .thenTheInstance(
             foundNMatches(1)
         ,   matched(undefined) // when path is matched, it is not known yet
                                // that it contains an array. Null should not
                                // be used here because that is an allowed
                                // value in json
         );
   })
   it('NotifiesOfPathMatchWhenSecondArrayStarts',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForPaths('!.array2')
         .whenGivenInput('{"array1":["a","b"], "array2":["a"')
         .thenTheInstance(
            foundNMatches(1)
         ,  matched(undefined) // when path is matched, it is not known yet
                               // that it contains an array. Null should not
                               // be used here because that is an allowed
                               // value in json
         );
   })   
   it('NotifiesOfPathsInsideArrays',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForPaths('![*]')
         .whenGivenInput( [{}, 'b', 2, []] )
         .thenTheInstance(
            foundNMatches(4)
         );
   })      
   it('CorrectlyGivesIndexWhenFindingObjectsInArray',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForPaths('![2]')
         .whenGivenInput( [{}, {}, 'this_one'] )
         .thenTheInstance(
            foundNMatches(1)
         );
   })      
   it('CorrectlyGivesIndexWhenFindingArraysInsideArray',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForPaths('![2]')
         .whenGivenInput( [[], [], 'this_one'] )
         .thenTheInstance(
            foundNMatches(1)
         );
   })   
   it('CorrectlyGivesIndexWhenFindingArraysInsideArraysEtc',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForPaths('![2][2]')
         .whenGivenInput( [   
                              [], 
                              [], 
                              [  
                                 [], 
                                 [], 
                                 ['this_array']
                              ]
                          ] )
         .thenTheInstance(
            foundNMatches(1)
         );
   })   
   
   it('CorrectlyGivesIndexWhenFindingStringsInsideArray',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForPaths('![2]')
         .whenGivenInput( ['', '', 'this_one'] )
         .thenTheInstance(
            foundNMatches(1)
         );
   })   
   it('CorrectlyGivesIndexWhenFindingNumbersInsideArray',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForPaths('![2]')
         .whenGivenInput( [1, 1, 'this_one'] )
         .thenTheInstance(
            foundNMatches(1)
         );
   })
      
   it('CorrectlyGivesIndexWhenFindingNullsInsideArray',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForPaths('![2]')
         .whenGivenInput( [null, null, 'this_one'] )
         .thenTheInstance(
            foundNMatches(1)
         );
   })      
   
   it('NotifiesOfPathsInsideObjects',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForPaths('![*]')
         .whenGivenInput( {a:{}, b:'b', c:2, d:[]} )
         .thenTheInstance(
            foundNMatches(4)
         );
   })      

   it('NotifiesOfArrayElementsSelectedByIndex',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('!.testArray[2]')
         .whenGivenInput('{"testArray":["a","b","this_one"]}')
         .thenTheInstance(
             matched('this_one').atPath(['testArray',2])
         ,   foundOneMatch
         );
   })
   
   it('NotifiesNestedArrayElementsSelectedByIndex',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('!.testArray[2][2]')
         .whenGivenInput( {"testArray":
                              ["a","b",
                                 ["x","y","this_one"]
                              ]
                          }
                        )
         .thenTheInstance(
             matched('this_one')
               .atPath(['testArray',2,2])
               .withParent( ["x","y","this_one"] )
               .withGrandparent( ["a","b", ["x","y","this_one"]] )
         ,   foundOneMatch
         );
   })   
   it('CanNotifyNestedArrayElementsSelectedByIndexByPassingTheRootArray',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('!.$testArray[2][2]')
         .whenGivenInput( {"testArray":
                              ["a","b",
                                 ["x","y","this_one"]
                              ]
                          }
                        )
         .thenTheInstance(
             matched(   ["a","b",
                           ["x","y","this_one"]
                        ])
         ,   foundOneMatch
         );
   })        

   it('NotifiesOfDeeplyNestedObjectsWithStar',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('*')
         .whenGivenInput({"a":{"b":{"c":{"d":"e"}}}})
         .thenTheInstance(
             matched('e')
               .atPath(['a', 'b', 'c', 'd'])
               .withParent({d:'e'})
         ,   matched({d:"e"})
               .atPath(['a', 'b', 'c'])
         ,   matched({c:{d:"e"}})
               .atPath(['a', 'b'])
         ,   matched({b:{c:{d:"e"}}})
               .atPath(['a'])
         ,   matched({a:{b:{c:{d:"e"}}}})
               .atRootOfJson()
         ,   foundNMatches(5)
         );
   })   
   it('NotifiesOfDeeplyNestedObjectsWithDoubleDot',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('..')
         .whenGivenInput({"a":{"b":{"c":{"d":"e"}}}})
         .thenTheInstance(
             matched('e')
               .atPath(['a', 'b', 'c', 'd'])
               .withParent({d:'e'})
         ,   matched({d:"e"})
               .atPath(['a', 'b', 'c'])
         ,   matched({c:{d:"e"}})
               .atPath(['a', 'b'])
         ,   matched({b:{c:{d:"e"}}})
               .atPath(['a'])
         ,   matched({a:{b:{c:{d:"e"}}}})
               .atRootOfJson()
         ,   foundNMatches(5)
         );
   })   
   it('NotifiesOfDeeplyNestedObjectsWithDoubleDotStar',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('..*')
         .whenGivenInput({"a":{"b":{"c":{"d":"e"}}}})
         .thenTheInstance(
             matched('e')
               .atPath(['a', 'b', 'c', 'd'])
               .withParent({d:'e'})
         ,   matched({d:"e"})
               .atPath(['a', 'b', 'c'])
         ,   matched({c:{d:"e"}})
               .atPath(['a', 'b'])
         ,   matched({b:{c:{d:"e"}}})
               .atPath(['a'])
         ,   matched({a:{b:{c:{d:"e"}}}})
               .atRootOfJson()
         ,   foundNMatches(5)
         );
   })   
   it('CanDetectAllButRoot',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('*..*')
         .whenGivenInput({"a":{"b":{"c":{"d":"e"}}}})
         .thenTheInstance(
             matched('e')
               .atPath(['a', 'b', 'c', 'd'])
               .withParent({d:'e'})
         ,   matched({d:"e"})
               .atPath(['a', 'b', 'c'])
         ,   matched({c:{d:"e"}})
               .atPath(['a', 'b'])
         ,   matched({b:{c:{d:"e"}}})
               .atPath(['a'])
               
         ,   foundNMatches(4)
         );
   })   
   it('CanDetectSimilarAncestors',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('foo..foo')
         
         .whenGivenInput({"foo":{"foo":{"foo":{"foo":"foo"}}}})
         .thenTheInstance(
             matched("foo")
         ,   matched({"foo":"foo"})
         ,   matched({"foo":{"foo":"foo"}})
         ,   matched({"foo":{"foo":{"foo":"foo"}}})   
         ,   foundNMatches(4)
         );
   })   

   it('CanDetectInsideTheSecondObjectElementOfAnArray',  function() {

      // this fails if we don't set the curKey to the length of the array
      // when we detect an object and and the parent of the object that ended
      // was an array

      givenAnOboeInstance()
         .andWeAreListeningForNodes('!..find')
         .whenGivenInput(
            {
               array:[
                  {a:'A'}
               ,  {find:'should_find_this'}
               ]
            }
         )
         .thenTheInstance(
             matched('should_find_this')
               .atPath(['array',1,'find'])
         );
   })
   it('DetectionIgnoresIfOnlyStartOfPatternMatches',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('!..a')
         .whenGivenInput({
               ab:'should_not_find_this'
            ,  a0:'nor this'
            ,  a:'but_should_find_this'
            }
         )
         .thenTheInstance(
            matched('but_should_find_this')
         ,  foundOneMatch
         );
   })
   it('DetectionIgnoresIfOnlyEndOfPatternMatches',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('!..a')
         .whenGivenInput({
               aa:'should_not_find_this'
            ,  ba:'nor this'
            ,  a:'but_should_find_this'
            }
         )
         .thenTheInstance(
            matched('but_should_find_this')
         ,  foundOneMatch
         );
   })
   it('DetectionIgnoresPartialPathMatchesInArrayIndices',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('!..[1]')
         .whenGivenInput({
               array : [0,1,2,3,4,5,6,7,8,9,10,11,12]
            }
         )
         .thenTheInstance(
            matched(1)
               .withParent([0,1])
         ,  foundOneMatch
         );
   })   
   it('CanGiveAnArrayBackWhenJustPartiallyDone',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('$![5]')
         .whenGivenInput([0,1,2,3,4,5,6,7,8,9,10,11,12])
         .thenTheInstance(
            matched([0,1,2,3,4,5])
         ,  foundOneMatch
         );
   })  
   
   it('GivesCorrectParentAndGrandparentForEveryItemOfAnArray',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('!.array.*')
         .whenGivenInput({
               array : ['a','b','c']
            }
         )
         .thenTheInstance(
            matched('a')
               .withParent(['a'])
               .withGrandparent({array:['a']})
         ,  matched('b')
               .withParent(['a', 'b'])
               .withGrandparent({array:['a','b']})               
         ,  matched('c')
               .withParent(['a', 'b', 'c'])
               .withGrandparent({array:['a','b','c']})               
         );
   })   
   it('GivesCorrectParentForEveryObjectItemOfAnArrayOfObjects',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('!.array.*')
         .whenGivenInput({
               array : [{'a':1},{'b':2},{'c':3}]
            }
         )
         .thenTheInstance(
            matched({'a':1})
               .withParent([{'a':1}])
         ,  matched({'b':2})
               .withParent([{'a':1},{'b':2}])               
         ,  matched({'c':3})
               .withParent([{'a':1},{'b':2},{'c':3}])               
         );
   })   
   it('GivesCorrectParentForObjectInAMixedArray',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('!.array.*')
         .whenGivenInput({
               array : [{'a':1},'b',{'c':3}, {}, ['d'], 'e']
            }
         )
         .thenTheInstance(
            matched({'a':1})
               .withParent([{'a':1}])         
         );
   })   
   it('GivesCorrectParentForStringInAMixedArray',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('!.array.*')
         .whenGivenInput({
               array : [{'a':1},'b',{'c':3}, {}, ['d'], 'e']
            }
         )
         .thenTheInstance(
         
            matched('b')
               .withParent([{'a':1},'b'])
               
         );
   })   
   it('GivesCorrectParentForSecondObjectInAMixedArray',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('!.array.*')
         .whenGivenInput({
               array : [{'a':1},'b',{'c':3}, {}, ['d'], 'e']
            }
         )
         .thenTheInstance(
               
            matched({'c':3})
               .withParent([{'a':1},'b',{'c':3}])

         );
   })
      
   xit('GivesCorrectParentForEmptyObjectInAMixedArray',  function() {
   
      // TODO: reenable
   
      givenAnOboeInstance()
         .andWeAreListeningForNodes('!.array.*')
         .whenGivenInput({
               array : [{'a':1},'b',{'c':3}, {}, ['d'], 'e']
            }
         )
         .thenTheInstance(
         
            matched({})
               .withParent([{'a':1},'b',{'c':3}, {}])
                                             
         );
   
   })   
   it('GivesCorrectParentForSingletonStringArrayInAMixedArray',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('!.array.*')
         .whenGivenInput({
               array : [{'a':1},'b',{'c':3}, {}, ['d'], 'e']
            }
         )
         .thenTheInstance(  
                                     
            matched(['d'])            
               .withParent([{'a':1},'b',{'c':3}, {}, ['d']])
               
         );
   })   
   it('GivesCorrectParentForSingletonStringArrayInSingletonArray',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('!.array.*')
         .whenGivenInput({
               array : [['d']]
            }
         )
         .thenTheInstance(  
                                     
            matched(['d'])            
               .withParent([['d']])
               
         );
   })

   it('GivesCorrectParentForLastStringInAMixedArray',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('!.array.*')
         .whenGivenInput({
               array : [{'a':1},'b',{'c':3}, {}, ['d'], 'e']
            }
         )
         .thenTheInstance(
         
            matched('e')
               .withParent([{'a':1},'b',{'c':3}, {}, ['d'], 'e'])
               
         );
   })

   it('GivesCorrectParentForOpeningObjectInAMixedArrayAtRootOfJson',  function() {
      // same test as above but without the object wrapper around the array:
      
      givenAnOboeInstance()
         .andWeAreListeningForNodes('!.*')
         .whenGivenInput([{'a':1},'b',{'c':3}, {}, ['d'], 'e'])
         .thenTheInstance(
         
            matched({'a':1})
               .withParent([{'a':1}])
               
         );
   })

   it('GivesCorrectParentForStringInAMixedArrayAtRootOfJson',  function() {
      // same test as above but without the object wrapper around the array:
      
      givenAnOboeInstance()
         .andWeAreListeningForNodes('!.*')
         .whenGivenInput([{'a':1},'b',{'c':3}, {}, ['d'], 'e'])
         .thenTheInstance(

            matched('b')
               .withParent([{'a':1},'b'])               

         );
   })

   it('GivesCorrectParentForSecondObjectInAMixedArrayAtRootOfJson',  function() {
      // same test as above but without the object wrapper around the array:
      
      givenAnOboeInstance()
         .andWeAreListeningForNodes('!.*')
         .whenGivenInput([{'a':1},'b',{'c':3}, {}, ['d'], 'e'])
         .thenTheInstance(
               
            matched({'c':3})
               .withParent([{'a':1},'b',{'c':3}])

         );
   })

   xit('GivesCorrectParentForEmptyObjectInAMixedArrayAtRootOfJson',  function() {
      //TODO: enable
   
      // same test as above but without the object wrapper around the array:
    
      givenAnOboeInstance()
         .andWeAreListeningForNodes('!.*')
         .whenGivenInput([{'a':1},'b',{'c':3}, {}, ['d'], 'e'])
         .thenTheInstance(

            matched({})
               .withParent([{'a':1},'b',{'c':3}, {}])                              

         );

   })

   it('GivesCorrectParentForSingletonStringArrayInAMixedArrayAtRootOfJson',  function() {
      // same test as above but without the object wrapper around the array:
      
      givenAnOboeInstance()
         .andWeAreListeningForNodes('!.*')
         .whenGivenInput([{'a':1},'b',{'c':3}, {}, ['d'], 'e'])
         .thenTheInstance(
                              
            matched(['d'])
               .withParent([{'a':1},'b',{'c':3}, {}, ['d']])

         );
   })   
   it('GivesCorrectParentForSingletonStringArrayInASingletonArrayAtRootOfJson',  function() {
      // non-mixed array, easier version:
      
      givenAnOboeInstance()
         .andWeAreListeningForNodes('!.*')
         .whenGivenInput([['d']])
         .thenTheInstance(
                              
            matched(['d'])
               .withParent([['d']])

         );
   })

   it('GivesCorrectParentForFinalStringInAMixedArrayAtRootOfJson',  function() {
      // same test as above but without the object wrapper around the array:
      
      givenAnOboeInstance()
         .andWeAreListeningForNodes('!.*')
         .whenGivenInput([{'a':1},'b',{'c':3}, {}, ['d'], 'e'])
         .thenTheInstance(

            matched('e')
               .withParent([{'a':1},'b',{'c':3}, {}, ['d'], 'e'])
         );
   })

   it('CanDetectAtMultipleDepthsUsingDoubleDot',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('!..find')
         .whenGivenInput({

            array:[
               {find:'first_find'}
            ,  {padding:{find:'second_find'}, find:'third_find'}
            ]
         ,  find: {
               find:'fourth_find'
            }

         })
         .thenTheInstance(
             matched('first_find').atPath(['array',0,'find'])
         ,   matched('second_find').atPath(['array',1,'padding','find'])
         ,   matched('third_find').atPath(['array',1,'find'])
         ,   matched('fourth_find').atPath(['find','find'])
         ,   matched({find:'fourth_find'}).atPath(['find'])

         ,   foundNMatches(5)
         );
   })   
   it('PassesAncestorsOfFoundObjectCorrectly',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('!..find')
         .whenGivenInput({

            array:[
               {find:'first_find'}
            ,  {padding:{find:'second_find'}, find:'third_find'}
            ]
         ,  find: {
               find:'fourth_find'
            }

         })
         .thenTheInstance(
             matched('first_find')
               .withParent( {find:'first_find'} )
               .withGrandparent( [{find:'first_find'}] )
               
         ,   matched('second_find')
               .withParent({find:'second_find'})
               .withGrandparent({padding:{find:'second_find'}})
               
         ,   matched('third_find')
              .withParent({padding:{find:'second_find'}, find:'third_find'})
              .withGrandparent([
                    {find:'first_find'}
                 ,  {padding:{find:'second_find'}, find:'third_find'}
                 ])                          
         );
   })

   it('CanDetectAtMultipleDepthsUsingImpliedAncestorOfRootRelationship',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('find')
         .whenGivenInput({

            array:[
               {find:'first_find'}
            ,  {padding:{find:'second_find'}, find:'third_find'}
            ]
         ,  find: {
               find:'fourth_find'
            }

         })
         .thenTheInstance(
             matched('first_find').atPath(['array',0,'find'])
         ,   matched('second_find').atPath(['array',1,'padding','find'])
         ,   matched('third_find').atPath(['array',1,'find'])
         ,   matched('fourth_find').atPath(['find','find'])
         ,   matched({find:'fourth_find'}).atPath(['find'])

         ,   foundNMatches(5)
         );
   })

   it('MatchesNestedAdjacentSelector',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('!..[0].colour')
         .whenGivenInput({

            foods: [
               {  name:'aubergine', 
                  colour:'purple' // match this
               },
               {name:'apple', colour:'red'},
               {name:'nuts', colour:'brown'}
            ],
            non_foods: [
               {  name:'brick', 
                  colour:'red'    // and this
               },
               {name:'poison', colour:'pink'},
               {name:'broken_glass', colour:'green'}
            ]
         })
         .thenTheInstance
               (   matched('purple')
               ,   matched('red')
               ,   foundNMatches(2)
               );
   })      
   it('MatchesNestedSelectorSeparatedByASingleStarSelector',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('!..foods.*.name')
         .whenGivenInput({

            foods: [
               {name:'aubergine', colour:'purple'},
               {name:'apple', colour:'red'},
               {name:'nuts', colour:'brown'}
            ],
            non_foods: [
               {name:'brick', colour:'red'},
               {name:'poison', colour:'pink'},
               {name:'broken_glass', colour:'green'}
            ]
         })
         .thenTheInstance
               (   matched('aubergine')
               ,   matched('apple')
               ,   matched('nuts')
               ,   foundNMatches(3)
               );
   })   
   it('GetsAllSimpleObjectsFromAnArray',  function() {

      // this test is similar to the following one, except it does not use ! in the pattern
      givenAnOboeInstance()
         .andWeAreListeningForNodes('foods.*')
         .whenGivenInput({
            foods: [
               {name:'aubergine'},
               {name:'apple'},
               {name:'nuts'}
            ]
         })
         .thenTheInstance
               (   foundNMatches(3)
               ,   matched({name:'aubergine'})
               ,   matched({name:'apple'})
               ,   matched({name:'nuts'})   
               );
   })

   it('GetsSameObjectRepeatedlyUsingCss4Syntax',  function() {

      givenAnOboeInstance()
         .andWeAreListeningForNodes('$foods.*')
         .whenGivenInput({        
            foods: [
               {name:'aubergine'},
               {name:'apple'},
               {name:'nuts'}
            ]
         })
         // essentially, the parser should have been called three times with the same object, but each time
         // an additional item should have been added
         .thenTheInstance
               (   foundNMatches(3)
               ,   matched([{name:'aubergine'}])
               ,   matched([{name:'aubergine'},{name:'apple'}])
               ,   matched([{name:'aubergine'},{name:'apple'},{name:'nuts'}])   
               );
   })

   it('MatchesNestedSelectorSeparatedByDoubleDot',  function() {

      givenAnOboeInstance()
         // we just want the French names of foods:
         .andWeAreListeningForNodes('!..foods..fr')
         .whenGivenInput({

            foods: [
               {name:{en:'aubergine', fr:'aubergine'}, colour:'purple'},
               {name:{en:'apple', fr:'pomme'}, colour:'red'},
               {name:{en:'nuts', fr:'noix'}, colour:'brown'}
            ],
            non_foods: [
               {name:{en:'brick'}, colour:'red'},
               {name:{en:'poison'}, colour:'pink'},
               {name:{en:'broken_glass'}, colour:'green'}
            ]
         })
         .thenTheInstance
               (   matched('aubergine')
               ,   matched('pomme')
               ,   matched('noix')
               ,   foundNMatches(3)
               );
   })   
   it('CanExtractByDuckTypes',  function() {

      givenAnOboeInstance()
         // we want the bi-lingual objects
         .andWeAreListeningForNodes('{en fr}')
         .whenGivenInput({

            foods: [
               {name:{en:'aubergine',  fr:'aubergine' }, colour:'purple'},
               {name:{en:'apple',      fr:'pomme'     }, colour:'red'   },
               {name:{en:'nuts',       fr:'noix'      }, colour:'brown' }
            ],
            non_foods: [
               {name:{en:'brick'       }, colour:'red'   },
               {name:{en:'poison'      }, colour:'pink'  },
               {name:{en:'broken_glass'}, colour:'green' }
            ]
         })
         .thenTheInstance
               (   matched({en:'aubergine',  fr:'aubergine' })
               ,   matched({en:'apple',      fr:'pomme'     })
               ,   matched({en:'nuts',       fr:'noix'      })
               ,   foundNMatches(3)
               );
   })   
   it('CanExtractByPartialDuckTypes',  function() {

      givenAnOboeInstance()
         // we want the bi-lingual English and German words, but we still want the ones that have
         // French as well
         .andWeAreListeningForNodes('{en de}')
         .whenGivenInput({

            foods: [
               {name:{en:'aubergine',  fr:'aubergine',   de: 'aubergine' }, colour:'purple'},
               {name:{en:'apple',      fr:'pomme',       de: 'apfel'     }, colour:'red'   },
               {name:{en:'nuts',                         de: 'eier'      }, colour:'brown' }
            ],
            non_foods: [
               {name:{en:'brick'       }, colour:'red'  },
               {name:{en:'poison'      }, colour:'pink' },
               {name:{en:'broken_glass'}, colour:'green'}
            ]
         })
         .thenTheInstance
               (   matched({en:'aubergine',  fr:'aubergine',   de:'aubergine' })
               ,   matched({en:'apple',      fr:'pomme',       de: 'apfel'    })
               ,   matched({en:'nuts',                         de: 'eier'     })
               ,   foundNMatches(3)
               );
   })

   it('ErrorsOnJsonWithUnquotedKeys',  function() {
  
      givenAnOboeInstance()
        .andWeAreExpectingSomeErrors()
        .whenGivenInput('{invalid:"json"}') // key not quoted, invalid json
        .thenTheInstance
           (   calledCallbackOnce
           ,   wasPassedAnErrorObject
           );
   })   
   it('ErrorsOnMalformedJson',  function() {
  
      givenAnOboeInstance()
        .andWeAreExpectingSomeErrors()
        .whenGivenInput('{{') // invalid!
        .thenTheInstance
           (   calledCallbackOnce
           ,   wasPassedAnErrorObject
           );
   })   
   it('CallsErrorListenerIfCallbackErrors',  function() {
  
      givenAnOboeInstance()
        .andWeHaveAFaultyCallbackListeningFor('!') // just want the root object
        .andWeAreExpectingSomeErrors()
        .whenGivenInput('{}') // valid json, should provide callback
        .thenTheInstance
           (   calledCallbackOnce
           ,   wasPassedAnErrorObject
           );
   })

});

