(function(){
/*
   BDD-style test cases for the oboe progressive parser.
   
   Since the path matching is already separately tested
   and not stubbed, this isn't really a unit test here.

   Uses sinon.js for stubs

   Runs using JS Test Driver directly, or using the runtests.sh
   shell script.

 */

var streamingStub;

TestCase("oboeTest", {

   setUp: function() {
      streamingStub = sinon.stub(window, 'streamingXhr');      
   },
   
   tearDown: function() {
      streamingStub.restore();   
   },
   
   testMethodsAreChainable: function() {
      // very basic test that nothing forgot to return 'this':
      
      function noop(){}
      
      oboe.doGet('http://example.com/oboez')
         .onPath('*', noop).onNode('*', noop).onError(noop).onPath('*', noop)
         .onPath({'*':noop}).onNode({'*': noop}).onPath({'*':noop});
   },
   
   testHandlesEmptyObjectDetectedWithBang: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!')
         .whenGivenInput('{}')
         .thenTheInstance(
            matched({}).atRootOfJson(),
            foundOneMatch
         );

   }
   
,  testHandlesEmptyObjectDetectedWithBangWhenExplicitlySelected: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('$!')
         .whenGivenInput('{}')
         .thenTheInstance(
            matched({}).atRootOfJson(),
            foundOneMatch
         );

   }   
   
,  testGivesWindowAsContextWhenNothingGivenExplicitly: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!')
         .whenGivenInput('{}')
         .thenTheInstance( calledbackWithContext(window) );
   }
   
,  testCallsOnGivenContext: function() {
      var myObject = { doSomething: function(){} };

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!', myObject.doSomething, myObject)
         .whenGivenInput('{}')
         .thenTheInstance( calledbackWithContext(myObject) );
   }   

,  testFindOnlyFiresWhenHasWholeObject: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!')
         .whenGivenInput('{')
          .thenTheInstance(
            foundNoMatches
          )
         .whenGivenInput('}')
         .thenTheInstance(
            matched({}).atRootOfJson(),
            foundOneMatch
         );

   }

,  testListeningForPathFiresWhenRootObjectStarts: function() {

      // clarinet doesn't notify of matches to objects (onopenobject) until the
      // first key is found, that is why we don't just give '{' here as the partial
      // input.

      givenAnOboeInstance()
         .andWeAreListeningForMatchesToPattern('!')
         .whenGivenInput('{"foo":')
          .thenTheInstance(
            foundNMatches(1),
            matched({}).atRootOfJson()
          );
   }
   
,  testListeningForPathFiresWhenRootArrayStarts: function() {

      // clarinet doesn't notify of matches to objects (onopenobject) until the
      // first key is found, that is why we don't just give '{' here as the partial
      // input.

      givenAnOboeInstance()
         .andWeAreListeningForMatchesToPattern('!')
         .whenGivenInput('[1') // the minimum string required for clarinet 
                               // to fire onopenarray. Won't fire with '['.
          .thenTheInstance(
            foundNMatches(1),
            matched([]).atRootOfJson()
          );
   }
   
     
,  testHandlesEmptyObjectDetectedWithSingleStar: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('*')
         .whenGivenInput('{}')
         .thenTheInstance(
            matched({}).atRootOfJson(),
            foundOneMatch
         );
   }
   
,  testDoesntDetectSpuriousPathOffEmptyObject: function() {

      givenAnOboeInstance()
         .andWeAreListeningForMatchesToPattern('!.foo.*')
         .whenGivenInput( {foo:{}} )
         .thenTheInstance(
            foundNoMatches
         );
   }   

,  testHandlesEmptyObjectDetectedWithDoubleDot: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('*')
         .whenGivenInput('{}')
         .thenTheInstance(
            matched({}).atRootOfJson(),
            foundOneMatch
         );
   }

,  testNotifiesOfStringsWhenListenedTo: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!.string')
         .whenGivenInput('{"string":"s"}')
         .thenTheInstance(
            matched("s"),
            foundOneMatch
         );
   }
   
/*,  testAllowsMultiplePathsToBeListenedToInOneCall: function() {

      givenAParser()
         .andWeAreListeningForThingsFoundAtPattern(
          {
               'a':function(){}
          ,    'b':function(){}
          })
         .whenGivenInput({a:'A', b:'B'})
         .thenTheInstance(
            matched("s"),
            foundOneMatch
         );
   } */   

,  testNotifiesOfPathForOfPropertyNameWithIncompleteJson: function() {

      givenAnOboeInstance()
         .andWeAreListeningForMatchesToPattern('!.string')
         .whenGivenInput('{"string":')
         .thenTheInstance(
            foundOneMatch
         );
   }

,  testNotifiesOfSecondPropertyNameWithIncompleteJson: function() {

      givenAnOboeInstance()
         .andWeAreListeningForMatchesToPattern('!.pencils')
         .whenGivenInput('{"pens":4, "pencils":')
         .thenTheInstance(
            // undefined because the parser hasn't been given the value yet.
            // can't be null because that is an allowed value
            matched(undefined).atPath(['pencils']),
            foundOneMatch
         );
   }
   
,  testIsAbleToNotifyOfNull: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!.pencils')
         .whenGivenInput('{"pens":4, "pencils":null}')
         .thenTheInstance(
            // undefined because the parser hasn't been given the value yet.
            // can't be null because that is an allowed value
            matched(null).atPath(['pencils']),
            foundOneMatch
         );
   }   

,  testNotifiesOfMultipleChildrenOfRoot: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!.*')
         .whenGivenInput('{"a":"A","b":"B","c":"C"}')
         .thenTheInstance(
             matched('A').atPath(['a'])
         ,   matched('B').atPath(['b'])
         ,   matched('C').atPath(['c'])
         ,   foundNMatches(3)
         );
   }
   
,  testNotifiesOfMultipleChildrenOfRootWhenSelectingTheRoot: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('$!.*')
         .whenGivenInput({"a":"A", "b":"B", "c":"C"})
         .thenTheInstance(
            // rather than getting the fully formed objects, we should now see the root object
            // being grown step by step:
             matched({"a":"A"})
         ,   matched({"a":"A", "b":"B"})
         ,   matched({"a":"A", "b":"B", "c":"C"})
         ,   foundNMatches(3)
         );
   }   
   
,  testDoesNotNotifySpuriouslyOfFoundPath: function() {

      givenAnOboeInstance()
         .andWeAreListeningForMatchesToPattern('!.a')
         .whenGivenInput([{a:'a'}])
         .thenTheInstance(foundNoMatches);
   }
   
,  testDoesNotNotifySpuriouslyOfFoundObject: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!.a')
         .whenGivenInput([{a:'a'}])
         .thenTheInstance(foundNoMatches);
   }      

,  testNotifiesOfMultiplePropertiesOfAnObjectWithoutWaitingForEntireObject: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!.*')
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
   }
   
,  testCanGetRootJsonAsJsonObjectIsBuiltUp: function() {

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
         );
   }
   
,  testCanGetRootJsonAsJsonArrayIsBuiltUp: function() {

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
         );
   }      

,  testNotifiesOfNamedChildOfRoot: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!.b')
         .whenGivenInput('{"a":"A","b":"B","c":"C"}')
         .thenTheInstance(
             matched('B').atPath(['b'])
         ,   foundOneMatch
         );
   }

,  testNotifiesOfArrayElements: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!.testArray.*')
         .whenGivenInput('{"testArray":["a","b","c"]}')
         .thenTheInstance(
             matched('a').atPath(['testArray',0])
         ,   matched('b').atPath(['testArray',1])
         ,   matched('c').atPath(['testArray',2])
         ,   foundNMatches(3)
         );
   }

,  testNotifiesOfPathMatchWhenArrayStarts: function() {

      givenAnOboeInstance()
         .andWeAreListeningForMatchesToPattern('!.testArray')
         .whenGivenInput('{"testArray":["a"')
         .thenTheInstance(
             foundNMatches(1)
         ,   matched(undefined) // when path is matched, it is not known yet
                                // that it contains an array. Null should not
                                // be used here because that is an allowed
                                // value in json
         );
   }

,  testNotifiesOfPathMatchWhenSecondArrayStarts: function() {

      givenAnOboeInstance()
         .andWeAreListeningForMatchesToPattern('!.array2')
         .whenGivenInput('{"array1":["a","b"], "array2":["a"')
         .thenTheInstance(
            foundNMatches(1)
         ,  matched(undefined) // when path is matched, it is not known yet
                               // that it contains an array. Null should not
                               // be used here because that is an allowed
                               // value in json
         );
   }
   
,  testNotifiesOfPathsInsideArrays: function() {

      givenAnOboeInstance()
         .andWeAreListeningForMatchesToPattern('![*]')
         .whenGivenInput( [{}, 'b', 2, []] )
         .thenTheInstance(
            foundNMatches(4)
         );
   }
      
,  testCorrectlyGivesIndexWhenFindingObjectsInArray: function() {

      givenAnOboeInstance()
         .andWeAreListeningForMatchesToPattern('![2]')
         .whenGivenInput( [{}, {}, 'this_one'] )
         .thenTheInstance(
            foundNMatches(1)
         );
   }
      
,  testCorrectlyGivesIndexWhenFindingArraysInsideArray: function() {

      givenAnOboeInstance()
         .andWeAreListeningForMatchesToPattern('![2]')
         .whenGivenInput( [[], [], 'this_one'] )
         .thenTheInstance(
            foundNMatches(1)
         );
   }
   
,  testCorrectlyGivesIndexWhenFindingArraysInsideArraysEtc: function() {

      givenAnOboeInstance()
         .andWeAreListeningForMatchesToPattern('![2][2]')
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
   }   
   
,  testCorrectlyGivesIndexWhenFindingStringsInsideArray: function() {

      givenAnOboeInstance()
         .andWeAreListeningForMatchesToPattern('![2]')
         .whenGivenInput( ['', '', 'this_one'] )
         .thenTheInstance(
            foundNMatches(1)
         );
   }
   
,  testCorrectlyGivesIndexWhenFindingNumbersInsideArray: function() {

      givenAnOboeInstance()
         .andWeAreListeningForMatchesToPattern('![2]')
         .whenGivenInput( [1, 1, 'this_one'] )
         .thenTheInstance(
            foundNMatches(1)
         );
   }
   
,  testCorrectlyGivesIndexWhenFindingNullsInsideArray: function() {

      givenAnOboeInstance()
         .andWeAreListeningForMatchesToPattern('![2]')
         .whenGivenInput( [null, null, 'this_one'] )
         .thenTheInstance(
            foundNMatches(1)
         );
   }      
   
,  testNotifiesOfPathsInsideObjects: function() {

      givenAnOboeInstance()
         .andWeAreListeningForMatchesToPattern('![*]')
         .whenGivenInput( {a:{}, b:'b', c:2, d:[]} )
         .thenTheInstance(
            foundNMatches(4)
         );
   }      

,  testNotifiesOfArrayElementsSelectedByIndex: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!.testArray[2]')
         .whenGivenInput('{"testArray":["a","b","this_one"]}')
         .thenTheInstance(
             matched('this_one').atPath(['testArray',2])
         ,   foundOneMatch
         );
   }

,  testNotifiesNestedArrayElementsSelectedByIndex: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!.testArray[2][2]')
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
   }
   
,  testCanNotifyNestedArrayElementsSelectedByIndexByPassingTheRootArray: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!.$testArray[2][2]')
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
   }        

,  testNotifiesOfDeeplyNestedObjects: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('..')
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
   }

,  testCanDetectInsideTheSecondObjectElementOfAnArray: function() {

      // this fails if we don't set the curKey to the length of the array
      // when we detect an object and and the parent of the object that ended
      // was an array

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!..find')
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
   }

,  testDetectionIgnoresIfOnlyStartOfPatternMatches: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!..a')
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
   }

,  testDetectionIgnoresIfOnlyEndOfPatternMatches: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!..a')
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
   }

,  testDetectionIgnoresPartialPathMatchesInArrayIndices: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!..[1]')
         .whenGivenInput({
               array : [0,1,2,3,4,5,6,7,8,9,10,11,12]
            }
         )
         .thenTheInstance(
            matched(1)
               .withParent([0,1])
         ,  foundOneMatch
         );
   }
   
,  testCanGiveAnArrayBackWhenJustPartiallyDone: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('$![5]')
         .whenGivenInput([0,1,2,3,4,5,6,7,8,9,10,11,12])
         .thenTheInstance(
            matched([0,1,2,3,4,5])
         ,  foundOneMatch
         );
   }   
   
,  testGivesCorrectParentAndGrandparentForEveryItemOfAnArray: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!.array.*')
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
   }
   
,  testGivesCorrectParentForEveryObjectItemOfAnArrayOfObjects: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!.array.*')
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
   }
   
,  testGivesCorrectParentForObjectInAMixedArray: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!.array.*')
         .whenGivenInput({
               array : [{'a':1},'b',{'c':3}, {}, ['d'], 'e']
            }
         )
         .thenTheInstance(
            matched({'a':1})
               .withParent([{'a':1}])         
         );
   }
   
,  testGivesCorrectParentForStringInAMixedArray: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!.array.*')
         .whenGivenInput({
               array : [{'a':1},'b',{'c':3}, {}, ['d'], 'e']
            }
         )
         .thenTheInstance(
         
            matched('b')
               .withParent([{'a':1},'b'])
               
         );
   }
   
,  testGivesCorrectParentForSecondObjectInAMixedArray: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!.array.*')
         .whenGivenInput({
               array : [{'a':1},'b',{'c':3}, {}, ['d'], 'e']
            }
         )
         .thenTheInstance(
               
            matched({'c':3})
               .withParent([{'a':1},'b',{'c':3}])

         );
   }
   
,  testGivesCorrectParentForEmptyObjectInAMixedArray: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!.array.*')
         .whenGivenInput({
               array : [{'a':1},'b',{'c':3}, {}, ['d'], 'e']
            }
         )
         .thenTheInstance(
         
            matched({})
               .withParent([{'a':1},'b',{'c':3}, {}])
                                             
         );
   }
   
,  testGivesCorrectParentForSingletonStringArrayInAMixedArray: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!.array.*')
         .whenGivenInput({
               array : [{'a':1},'b',{'c':3}, {}, ['d'], 'e']
            }
         )
         .thenTheInstance(  
                                     
            matched(['d'])            
               .withParent([{'a':1},'b',{'c':3}, {}, ['d']])
               
         );
   }
   
,  testGivesCorrectParentForSingletonStringArrayInSingletonArray: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!.array.*')
         .whenGivenInput({
               array : [['d']]
            }
         )
         .thenTheInstance(  
                                     
            matched(['d'])            
               .withParent([['d']])
               
         );
   }   
      
,  testGivesCorrectParentForLastStringInAMixedArray: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!.array.*')
         .whenGivenInput({
               array : [{'a':1},'b',{'c':3}, {}, ['d'], 'e']
            }
         )
         .thenTheInstance(
         
            matched('e')
               .withParent([{'a':1},'b',{'c':3}, {}, ['d'], 'e'])
               
         );
   }   
   
     
,  testGivesCorrectParentForOpeningObjectInAMixedArrayAtRootOfJson: function() {
      // same test as above but without the object wrapper around the array:
      
      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!.*')
         .whenGivenInput([{'a':1},'b',{'c':3}, {}, ['d'], 'e'])
         .thenTheInstance(
         
            matched({'a':1})
               .withParent([{'a':1}])
               
         );
   }   
,  testGivesCorrectParentForStringInAMixedArrayAtRootOfJson: function() {
      // same test as above but without the object wrapper around the array:
      
      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!.*')
         .whenGivenInput([{'a':1},'b',{'c':3}, {}, ['d'], 'e'])
         .thenTheInstance(

            matched('b')
               .withParent([{'a':1},'b'])               

         );
   }   
,  testGivesCorrectParentForSecondObjectInAMixedArrayAtRootOfJson: function() {
      // same test as above but without the object wrapper around the array:
      
      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!.*')
         .whenGivenInput([{'a':1},'b',{'c':3}, {}, ['d'], 'e'])
         .thenTheInstance(
               
            matched({'c':3})
               .withParent([{'a':1},'b',{'c':3}])

         );
   }   
,  testGivesCorrectParentForEmptyObjectInAMixedArrayAtRootOfJson: function() {
      // same test as above but without the object wrapper around the array:
      
      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!.*')
         .whenGivenInput([{'a':1},'b',{'c':3}, {}, ['d'], 'e'])
         .thenTheInstance(

            matched({})
               .withParent([{'a':1},'b',{'c':3}, {}])                              

         );
   }   
,  testGivesCorrectParentForSingletonStringArrayInAMixedArrayAtRootOfJson: function() {
      // same test as above but without the object wrapper around the array:
      
      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!.*')
         .whenGivenInput([{'a':1},'b',{'c':3}, {}, ['d'], 'e'])
         .thenTheInstance(
                              
            matched(['d'])
               .withParent([{'a':1},'b',{'c':3}, {}, ['d']])

         );
   }
   
,  testGivesCorrectParentForSingletonStringArrayInASingletonArrayAtRootOfJson: function() {
      // non-mixed array, easier version:
      
      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!.*')
         .whenGivenInput([['d']])
         .thenTheInstance(
                              
            matched(['d'])
               .withParent([['d']])

         );
   }                        
   
,  testGivesCorrectParentForFinalStringInAMixedArrayAtRootOfJson: function() {
      // same test as above but without the object wrapper around the array:
      
      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!.*')
         .whenGivenInput([{'a':1},'b',{'c':3}, {}, ['d'], 'e'])
         .thenTheInstance(

            matched('e')
               .withParent([{'a':1},'b',{'c':3}, {}, ['d'], 'e'])
         );
   }    

,  testCanDetectAtMultipleDepthsUsingDoubleDot: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!..find')
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
   }
   
,  testPassesAncestorsOfFoundObjectCorrectly: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!..find')
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
   }   
   
,  testCanDetectAtMultipleDepthsUsingImpliedAncestorOfRootRelationship: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('find')
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
   }   

,  testMatchesNestedAdjacentSelector: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!..[0].colour')
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
               (   matched('purple')
               ,   matched('red')
               ,   foundNMatches(2)
               );
   }
      
,  testMatchesNestedSelectorSeparatedByASingleStarSelector: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('!..foods.*.name')
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
   }
   
,  testGetsAllSimpleObjectsFromAnArray: function() {

      // this test is similar to the following one, except it does not use ! in the pattern
      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('foods.*')
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
   }   
   
,  testGetsSameObjectRepeatedlyUsingCss4Syntax: function() {

      givenAnOboeInstance()
         .andWeAreListeningForThingsFoundAtPattern('$foods.*')
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
   }   

,  testMatchesNestedSelectorSeparatedByDoubleDot: function() {

      givenAnOboeInstance()
         // we just want the French names of foods:
         .andWeAreListeningForThingsFoundAtPattern('!..foods..fr')
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
   }
   
,  testCanExtractByDuckTypes: function() {

      givenAnOboeInstance()
         // we want the bi-lingual objects
         .andWeAreListeningForThingsFoundAtPattern('{en fr}')
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
   }
   
,  testCanExtractByPartialDuckTypes: function() {

      givenAnOboeInstance()
         // we want the bi-lingual English and German words, but we still want the ones that have
         // French as well
         .andWeAreListeningForThingsFoundAtPattern('{en de}')
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
   }      

   
,  testErrorsOnJsonWithUnquotedKeys: function() {
  
      givenAnOboeInstance()
        .andWeAreExpectingSomeErrors()
        .whenGivenInput('{invalid:"json"}') // key not quoted, invalid json
        .thenTheInstance
           (   calledCallbackOnce
           ,   wasPassedAnErrorObject
           );
   }
   
,  testErrorsOnMalformedJson: function() {
  
      givenAnOboeInstance()
        .andWeAreExpectingSomeErrors()
        .whenGivenInput('{{') // invalid!
        .thenTheInstance
           (   calledCallbackOnce
           ,   wasPassedAnErrorObject
           );
   }
   
,  testCallsErrorListenerIfCallbackErrors: function() {
  
      givenAnOboeInstance()
        .andWeHaveAFaultyCallbackListeningFor('!') // just want the root object
        .andWeAreExpectingSomeErrors()
        .whenGivenInput('{}') // valid json, should provide callback
        .thenTheInstance
           (   calledCallbackOnce
           ,   wasPassedAnErrorObject
           );
   }      
   
      
});


})();
