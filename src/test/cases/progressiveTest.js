

TestCase("progressiveTest", {


   testHandlesEmptyObjectDetectedWithDoubleSlash: function() {

      givenAParser()
         .andWeAreListeningTo('//')
         .whenGivenInput('{}')
         .thenTheParser(
            matched({}).atRootOfJson,
            foundOneMatch
         );

   },

   testOnlyFiresWhenHasWholeObject: function() {

      givenAParser()
         .andWeAreListeningTo('//')
         .whenGivenInput('{')
          .thenTheParser(
            foundNothing
          )
         .whenGivenInput('}')
         .thenTheParser(
            matched({}).atRootOfJson,
            foundOneMatch
         );

   }

,  testHandlesEmptyObjectDetectedWithSingleStar: function() {

      givenAParser()
         .andWeAreListeningTo('*')
         .whenGivenInput('{}')
         .thenTheParser(
            matched({}).atRootOfJson,
            foundOneMatch
         );
   }

,  testHandlesEmptyObjectDetectedWithDoubleStar: function() {

      givenAParser()
         .andWeAreListeningTo('**')
         .whenGivenInput('{}')
         .thenTheParser(
            matched({}).atRootOfJson,
            foundOneMatch
         );
   }

,  testNotifiesOfStringsWhenListenedTo: function() {

      givenAParser()
         .andWeAreListeningTo('//string')
         .whenGivenInput('{"string":"s"}')
         .thenTheParser(
            matched("s"),
            foundOneMatch
         );
   }

,  testNotifiesOfMultipleChildrenOfRoot: function() {

      givenAParser()
         .andWeAreListeningTo('//*')
         .whenGivenInput('{"a":"A","b":"B","c":"C"}')
         .thenTheParser(
             matched('A').atPath(['a'])
         ,   matched('B').atPath(['b'])
         ,   matched('C').atPath(['c'])
         ,   foundNMatches(3)
         );
   }

,  testNotifiesOfMultiplePropertiesOfAnObjectWithoutWaitingForEntireObject: function() {

      givenAParser()
         .andWeAreListeningTo('//*')
         .whenGivenInput('{"a":')
         .thenTheParser(
             foundNothing
          )
         .whenGivenInput('"A",')
         .thenTheParser(
             matched('A').atPath(['a'])
         ,   foundOneMatch
         )
         .whenGivenInput('"b":"B"}')
         .thenTheParser(
             matched('B').atPath(['b'])
         ,   foundNMatches(2)
         );
   }

,  testNotifiesOfNamesChildOfRoot: function() {

      givenAParser()
         .andWeAreListeningTo('//b')
         .whenGivenInput('{"a":"A","b":"B","c":"C"}')
         .thenTheParser(
             matched('B').atPath(['b'])
         ,   foundOneMatch
         );
   }

,  testNotifiesOfArrayElements: function() {

      givenAParser()
         .andWeAreListeningTo('//array/*')
         .whenGivenInput('{"array":["a","b","c"]}')
         .thenTheParser(
             matched('a').atPath(['array',0])
         ,   matched('b').atPath(['array',1])
         ,   matched('c').atPath(['array',2])
         ,   foundNMatches(3)
         );
   }

,  testNotifiesOfArrayElementsSelectedByIndex: function() {

      givenAParser()
         .andWeAreListeningTo('//array/2')
         .whenGivenInput('{"array":["a","b","this_one"]}')
         .thenTheParser(
             matched('this_one').atPath(['array',2])
         ,   foundOneMatch
         );
   }

,  testNotifiesNestedArrayElementsSelectedByIndex: function() {

      givenAParser()
         .andWeAreListeningTo('//array/2/2')
         .whenGivenInput('{"array":["a","b",["x","y","this_one"]]}')
         .thenTheParser(
             matched('this_one').atPath(['array',2,2])
         ,   foundOneMatch
         );
   }

,  testNotifiesOfDeeplyNestedObjects: function() {

      givenAParser()
         .andWeAreListeningTo('*')
         .whenGivenInput('{"a":{"b":{"c":{"d":"e"}}}}')
         .thenTheParser(
             matched('e').atPath(['a', 'b', 'c', 'd'])
         ,   matched({d:"e"}).atPath(['a', 'b', 'c'])
         ,   matched({c:{d:"e"}}).atPath(['a', 'b'])
         ,   matched({b:{c:{d:"e"}}}).atPath(['a'])
         ,   matched({a:{b:{c:{d:"e"}}}}).atRootOfJson
         ,   foundNMatches(5)
         );
   }

,  testCanDetectInsideTheSecondObjectElementOfAnArray: function() {

      // this fails if we don't set the curKey to the length of the array
      // when we detect an object and and the parent of the object that ended
      // was an array

      givenAParser()
         .andWeAreListeningTo('**/find')
         .whenGivenInput(
            {
               array:[
                  {a:'A'}
               ,  {find:'should_find_this'}
               ]
            }
         )
         .thenTheParser(
             matched('should_find_this')
               .atPath(['array',1,'find'])
         );
   }

,  testDetectionIgnoresIfOnlyStartOfPatternMatches: function() {

      givenAParser()
         .andWeAreListeningTo('**/a')
         .whenGivenInput({
               ab:'should_not_find_this'
            ,  a0:'nor this'
            ,  a:'but_should_find_this'
            }
         )
         .thenTheParser(
            matched('but_should_find_this')
         ,  foundOneMatch
         );
   }

,  testDetectionIgnoresIfOnlyEndOfPatternMatches: function() {

      givenAParser()
         .andWeAreListeningTo('**/a')
         .whenGivenInput({
               aa:'should_not_find_this'
            ,  ba:'nor this'
            ,  a:'but_should_find_this'
            }
         )
         .thenTheParser(
            matched('but_should_find_this')
         ,  foundOneMatch
         );
   }

,  testDetectionIgnoresPartialPathMatchesInArrayIndices: function() {

      givenAParser()
         .andWeAreListeningTo('**/1')
         .whenGivenInput({
               array : [0,1,2,3,4,5,6,7,8,9,10,11,12]
            }
         )
         .thenTheParser(
            matched(1)
         ,  foundOneMatch
         );
   }


,  testCanDetectAtMultipleDepthsUsingDoubleStar: function() {

      givenAParser()
         .andWeAreListeningTo('**/find')
         .whenGivenInput({

            array:[
               {find:'first_find'}
            ,  {padding:{find:'second_find'}, find:'third_find'}
            ]
         ,  find: {
               find:'fourth_find'
            }

         })
         .thenTheParser(
             matched('first_find').atPath(['array',0,'find'])
         ,   matched('second_find').atPath(['array',1,'padding','find'])
         ,   matched('third_find').atPath(['array',1,'find'])
         ,   matched('fourth_find').atPath(['find','find'])
         ,   matched({find:'fourth_find'}).atPath(['find'])

         ,   foundNMatches(5)
         );
   }

,  testMatchesNestedAdjacentSelector: function() {

      givenAParser()
         .andWeAreListeningTo('**/0/colour')
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
         .thenTheParser
               (   matched('purple')
               ,   matched('red')
               ,   foundNMatches(2)
               );
   }

,  testMatchesNestedSelectorSeparatedByASingleStar: function() {

      givenAParser()
         .andWeAreListeningTo('**/foods/*/name')
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
         .thenTheParser
               (   matched('aubergine')
               ,   matched('apple')
               ,   matched('nuts')
               ,   foundNMatches(3)
               );
   }

,  testMatchesNestedSelectorSeparatedByDoubleStar: function() {

      givenAParser()
         .andWeAreListeningTo('**/foods/**/fr')
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
         .thenTheParser
               (   matched('aubergine')
               ,   matched('pomme')
               ,   matched('noix')
               ,   foundNMatches(3)
               );
   }


// TODO: Handle invalid JSON

});


var foundOneMatch = foundNMatches(1);
var foundNothing = foundNMatches(0);

function givenAParser() {

   function Asserter() {

      var parser = progressive.parser(),
          callbackStub = sinon.stub();

      this.andWeAreListeningTo = function(pattern) {
         parser.onMatch(pattern, callbackStub);
         return this;
      };

      this.whenGivenInput = function(json) {
         if( typeof json != 'string' ) {
            json = JSON.stringify(json);
         }

         parser.read(json);
         return this;
      };

      this.thenTheParser = function( /* ... functions ... */ ){
         for (var i = 0; i < arguments.length; i++) {
            var fn = arguments[i];
            fn(callbackStub);
         }

         return this;
      }
   }
   return new Asserter();
}

function foundNMatches(n){
   return function(callback) {
      if( n != callback.callCount ) {
         fail('expected to have been called ' + n + ' times but has been called ' +
            callback.callCount + ' times. \n' +
                'I have these calls:' + JSON.stringify(callback.args)  )
      }
   }
}

function matched(obj) {
   function testRightObject( callback ) {
      if(!callback.calledWith(obj)) {

         fail( "was not called with the object " +  JSON.stringify(obj) + "\n" +
             "objects that I got are:" +
             JSON.stringify(callback.args.map(function(callArgs){return callArgs[0]}) ) + "\n" +
             "all calls were with:" +
             JSON.stringify(callback.args));

      }
   }

   testRightObject.atPath = function(path) {

      if( typeof path == 'string' ) {
         path = path.split(',');
      }

      return function(callback) {

         testRightObject(callback);

         if(!callback.calledWithMatch(obj, path)) {
            fail( "was not called with the path " +  JSON.stringify(path) + "\n" +
                "paths that I have are:\n" +
                callback.args.map(function(callArgs){
                  return "\t" + JSON.stringify(callArgs[1]) + "\n";
                }) + "\n" +
                "all calls were with:" +
                JSON.stringify(callback.args));
         }
      }
   };

   testRightObject.atRootOfJson = testRightObject.atPath([]);

   return testRightObject;
}


//test( {'s0':'s','t1':{'t2a':{t3a:'bar'}, t2b:{t3b:{}}}, 's1':'baz', 'a1':[1,[2,{inArray:'inArray'}],4]}  );