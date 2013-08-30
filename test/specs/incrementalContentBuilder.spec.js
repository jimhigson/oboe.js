describe("incremental content builder", function(){

   it('fires path found when root object opens', function() {
      
      expect( 
      
         aContentBuilder()
            .receivingParserEvent('onopenobject')
      
      ).toHaveFired(
      
         TYPE_PATH
      ,  anAscentContaining(  
            {key:ROOT_PATH, node:{}}
         )
         
      )      
   })
   
   it('fires path found after key is found in root object', function() {
      // above test, plus some extra events from clarinet
   
      expect(
      
         aContentBuilder()
            .receivingParserEvent('onopenobject')      
            .receivingParserEvent('onkey', 'flavour')      
      
      ).toHaveFired(
          TYPE_PATH
       ,  anAscentContaining(  
             {key:ROOT_PATH, node:{flavour:undefined}}
          ,  {key:'flavour', node:undefined}
          )      
      )
      
   })
   
   it('fires path found if key is found at same time as root object', function() {
      // above test, plus some extra events from clarinet

      expect(
      
         aContentBuilder()      
            .receivingParserEvent('onopenobject', 'flavour')      
      ).toHaveFired(
          TYPE_PATH
       ,  anAscentContaining(  
             {key:ROOT_PATH, node:{flavour:undefined}}
          ,  {key:'flavour', node:undefined}
          )      
      )
      
   })   
   
   it('fires node found after value is found for that key', function() {
   
      expect(
      
         aContentBuilder()
            .receivingParserEvent('onopenobject')      
            .receivingParserEvent('onkey'    ,  'flavour')
            .receivingParserEvent('onvalue'  ,  'strawberry')               
      
      ).toHaveFired(
         TYPE_NODE
      ,  anAscentContaining(  
            {key:ROOT_PATH, node:{flavour:'strawberry'}}
         ,  {key:'flavour', node:'strawberry'}
         )      
      )   
         
   })
   
   it('fires node found after root object closes', function() {
   
      expect(
      
         aContentBuilder()
            .receivingParserEvent('onopenobject')      
            .receivingParserEvent('onkey', 'flavour')
            .receivingParserEvent('onvalue', 'strawberry')
            .receivingParserEvent('oncloseobject')               
      
      ).toHaveFired(
         TYPE_NODE
      ,  anAscentContaining(  
            {key:ROOT_PATH, node:{flavour:'strawberry'}}
         )      
      )   
                     
   })
   
   it('ignores object closing after Oboe is aborted', function() {
   
      expect(
      
         aContentBuilder()
            .receivingParserEvent('onopenobject')      
            .receivingParserEvent('onkey', 'flavour')
            .receivingParserEvent('onvalue', 'strawberry')
            .receiveEventFromBus(ABORTING)
            .receivingParserEvent('oncloseobject')               
      
      ).not.toHaveFired(
         TYPE_NODE
      ,  anAscentContaining(  
            {key:ROOT_PATH, node:{flavour:'strawberry'}}
         )      
      )   
                     
   })   
   
   
   it('provides numeric paths for first array element', function() {

      expect(
      
         aContentBuilder()
            .receivingParserEvent('onopenobject')
            .receivingParserEvent('onkey', 'alphabet')
            .receivingParserEvent('onopenarray')
            .receivingParserEvent('onvalue', 'a')               
      
      ).toHaveFired(
         TYPE_PATH
         , anAscentContaining(
               {key:ROOT_PATH,  node:{'alphabet':['a']}    }
            ,  {key:'alphabet', node:['a']                 }
            ,  {key:0,          node:'a'                   }
         )            
      );

   })
   
   it('provides numeric paths for second array element', function() {

      expect(
      
         aContentBuilder()
            .receivingParserEvent('onopenobject')
            .receivingParserEvent('onkey', 'alphabet')
            .receivingParserEvent('onopenarray')
            .receivingParserEvent('onvalue', 'a')
            .receivingParserEvent('onvalue', 'b')               
      
      ).toHaveFired(
         TYPE_PATH
         ,  anAscentContaining(
            {key:ROOT_PATH,  node:{'alphabet':['a','b']}   }
            , {key:'alphabet', node:['a','b']                }
            , {key:1,          node:'b'                      }
         )      
      )

   })   
   
   it('provides nodes for first array element', function() {

      expect(
      
         aContentBuilder()
            .receivingParserEvent('onopenobject')      
            .receivingParserEvent('onkey'    ,  'alphabet')
            .receivingParserEvent('onopenarray')
            .receivingParserEvent('onvalue'    ,  'a')               
      
      ).toHaveFired(
         TYPE_NODE
      ,  anAscentContaining(  
            {key:ROOT_PATH,      node:{'alphabet':['a']} }
         ,  {key:'alphabet',     node:['a']              }
         ,  {key:0,              node:'a'                }
         )      
      )
      
   })        
   
   function aContentBuilder() {
   
      return new IncrementalContentBuilderAsserter();      
   }
   
   function IncrementalContentBuilderAsserter(){
     
      var eventBus = pubSub();
      
      sinon.spy(eventBus, 'notify');
      sinon.spy(eventBus, 'on');
      
      this._clarinetStub = {};
      this._eventBus = eventBus;
      this._subject = incrementalContentBuilder(this._clarinetStub, eventBus.notify, eventBus.on);
   }
   
   IncrementalContentBuilderAsserter.prototype.receivingParserEvent = function(fnName /* args */){
   
      var args = Array.prototype.slice.call(arguments, 1);
   
      var handlerFn = this._clarinetStub[fnName]; 
   
      // to match clarinet behaviour: do nothing if onFoo is falsey
      handlerFn && handlerFn.apply( undefined, args );
      
      return this;
   };
   
   IncrementalContentBuilderAsserter.prototype.receiveEventFromBus = function(/* args */){
     
      this._eventBus.notify.apply(undefined, arguments);
      return this;
   };   
   
   beforeEach(function(){
            
      this.addMatchers({
         toHaveFired: function( eventName, expectedAscent ){
   
            var asserter = this.actual;
            var notify = asserter._eventBus.notify;
            
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
         
                    
            this.message = function(){
               if( !notify.called ) {
                  return 'no events have been fired at all';
               }

               function reportCall(eventName, ascentList) {
               
                  var argArray = listAsArray(ascentList);
                  
                  var toJson = JSON.stringify.bind(JSON);
                  
                  return 'type:' + eventName + ', ascent:[' + argArray.map(toJson).join(',    \t') + ']';
               }
               
               function reportArgs(args){
                  return reportCall(args[0], args[1]);
               }                           
            
               return   'expected a call with : \t' + reportCall(eventName, expectedAscent) +
                        '\n' +  
                        'latest call had :      \t' + reportArgs(notify.lastCall.args) +
                        '\n' +
                        'all calls were :' +
                        '\n                     \t' +
                        notify.args.map( reportArgs ).join('\n                     \t')
            };



            return notify.calledWithMatch( eventName, ascentMatch );
         }
                              
      });   
   });
      
   function anAscentContaining ( /* descriptors */ ) {
      
      var ascentArray = Array.prototype.slice.call(arguments),
          ascentList = emptyList;
         
      ascentArray.forEach( function(ascentNode){
         ascentList = cons(ascentNode, ascentList);
      });
      
      return ascentList;
   }

});