(function(){

TestCase('incrementalParsedContentTest', {


   testFiresPathFoundAfterRootObjectOpens: function() {
      
      givenAnIncrementalContentBuilder()
         .whenClarinetFires('onopenobject')
            .thenShouldHaveFired(
                  TYPE_PATH
               ,  anAscentContaining(  
                           {key:ROOT_PATH, node:{}}
                        )
            );
   },
   
   testFiresPathFoundAfterKeyIsFoundInRootObject: function() {
      // above test, plus some extra events from clarinet
   
      givenAnIncrementalContentBuilder()
         .whenClarinetFires('onopenobject')      
         .whenClarinetFires('onkey', 'flavour')
            .thenShouldHaveFired(
                  TYPE_PATH
               ,  anAscentContaining(  
                           {key:ROOT_PATH, node:{flavour:undefined}}
                        ,  {key:'flavour', node:undefined}
                        )
            );   
   },
   
   testFiresPathFoundIfKeyIsFoundAtSameTimeAsRootObject: function() {
      // above test, plus some extra events from clarinet
   
      givenAnIncrementalContentBuilder()
         .whenClarinetFires('onopenobject', 'flavour')      
            .thenShouldHaveFired(
                  TYPE_PATH
               ,  anAscentContaining(  
                           {key:ROOT_PATH, node:{flavour:undefined}}
                        ,  {key:'flavour', node:undefined}
                        )
            );   
   },   
   
   testFiresNodeFoundAfterValueIsFoundForThatKey: function() {
   
      givenAnIncrementalContentBuilder()
         .whenClarinetFires('onopenobject')      
         .whenClarinetFires('onkey'    ,  'flavour')
         .whenClarinetFires('onvalue'  ,  'strawberry')
            .thenShouldHaveFired(
                  TYPE_NODE
               ,  anAscentContaining(  
                           {key:ROOT_PATH, node:{flavour:'strawberry'}}
                        ,  {key:'flavour', node:'strawberry'}
                        )
            );   
   
   },
   
   testFiresNodeFoundAfterRootObjectCloses: function() {
   
      givenAnIncrementalContentBuilder()
         .whenClarinetFires('onopenobject')      
         .whenClarinetFires('onkey', 'flavour')
         .whenClarinetFires('onvalue', 'strawberry')
         .whenClarinetFires('oncloseobject')
            .thenShouldHaveFired(
                  TYPE_NODE
               ,  anAscentContaining(  
                          {key:ROOT_PATH, node:{flavour:'strawberry'}}
                        )
            );                  
   },
   
   
   testProvidesNumericPathsForFirstArrayElement: function() {

      givenAnIncrementalContentBuilder()
          .whenClarinetFires('onopenobject')
          .whenClarinetFires('onkey', 'alphabet')
          .whenClarinetFires('onopenarray')
          .whenClarinetFires('onvalue', 'a')
          .thenShouldHaveFired(
             TYPE_PATH
             , anAscentContaining(
                   {key:ROOT_PATH,  node:{'alphabet':['a']}    }
                 , {key:'alphabet', node:['a']                 }
                 , {key:0,          node:'a'                   }
             )
      );

   },
   
   testProvidesNumericPathsForSecondArrayElement: function() {

      givenAnIncrementalContentBuilder()
          .whenClarinetFires('onopenobject')
          .whenClarinetFires('onkey', 'alphabet')
          .whenClarinetFires('onopenarray')
          .whenClarinetFires('onvalue', 'a')
          .whenClarinetFires('onvalue', 'b')
          .thenShouldHaveFired(
             TYPE_PATH
             , anAscentContaining(
                   {key:ROOT_PATH,  node:{'alphabet':['a','b']}   }
                 , {key:'alphabet', node:['a','b']                }
                 , {key:1,          node:'b'                      }
             )
      );

   },   
   
   testProvidesNodesForFirstArrayElement: function() {
   
      givenAnIncrementalContentBuilder()
         .whenClarinetFires('onopenobject')      
         .whenClarinetFires('onkey'    ,  'alphabet')
         .whenClarinetFires('onopenarray')
         .whenClarinetFires('onvalue'    ,  'a')                  
            .thenShouldHaveFired(
                  TYPE_NODE
               ,  anAscentContaining(  
                     {key:ROOT_PATH,      node:{'alphabet':['a']} }
                  ,  {key:'alphabet',     node:['a']              }
                  ,  {key:0,              node:'a'                }
                  )
            );   
   
   }        
   
});

function givenAnIncrementalContentBuilder() {
   return new IncrementalContentBuilderAsserter( {}, sinon.stub() );
}

function IncrementalContentBuilderAsserter( clarinetStub, notifyStub ){
   
   this._clarinetStub = clarinetStub;
   this._notifyStub = notifyStub;
   this._subject = incrementalContentBuilder(clarinetStub, notifyStub);
}

IncrementalContentBuilderAsserter.prototype.whenClarinetFires = function(fnName /* args */){

   var args = Array.prototype.slice.call(arguments, 1);

   this._clarinetStub[fnName].apply( undefined, args );
   return this;
};

IncrementalContentBuilderAsserter.prototype.thenShouldHaveFired = function( eventName, expectedAscent ) {

   var ascentMatch = sinon.match(function ( foundAscent ) {
      
      function matches( expect, found ) {
         if( !expect && !found ) {
            return true;
         }
         
         if( !expect || !found ) {
            // Both not empty, but one is. Inequal length.
            return false;
         }
         
         if( head(expect).key != head(found).key ) {
            // keys inequal
            return false;
         }
         
         if( JSON.stringify( head(expect).node ) != JSON.stringify( head(found).node ) ) {
            // nodes inequal         
            return false;
         }
         
         return matches(tail(expect), tail(found));
      }
      
      return matches(expectedAscent, foundAscent);
      
   }, 'ascent match');


   function reportArgs(eventName, list) {
   
      var argArray = listAsArray(list);
      
      var toJson = JSON.stringify.bind(JSON);
      
      return eventName + ', [' + argArray.map(toJson).join(',    \t') + ']';
   }

   if( !this._notifyStub.called ) {
      fail('notify has not been called');
   }

   if( !this._notifyStub.calledWithMatch( eventName, ascentMatch ) ) {
   
      var args = this._notifyStub.lastCall.args;
   
      fail(     'latest call had :' + 
                           reportArgs(args[0], args[1])
            + '\nexpected a call with :  ' + 
                           reportArgs(eventName, expectedAscent) 
      );
   }
   return this;   
};

function anAscentContaining ( /* descriptors */ ) {
   
   var ascentList = emptyList;
   
   toArray(arguments).forEach( function(ascentNode){
      ascentList = cons(ascentNode, ascentList);
   });
   
   return ascentList;
}

})();