describe("incremental content builder", function(){

   function IncrementalContentBuilderAsserter(){
     
      var eventBus = pubSub();
      
      sinon.spy(eventBus, 'fire');
      sinon.spy(eventBus, 'on');
      
      this._clarinetStub = {};
      this._eventBus = eventBus;
      incrementalContentBuilder(eventBus.fire, eventBus.on, this._clarinetStub);
   }
   
   IncrementalContentBuilderAsserter.prototype.receivingParserEvent = function(fnName /* args */){
   
      var args = Array.prototype.slice.call(arguments, 1);
   
      var handlerFn = this._clarinetStub[fnName]; 
   
      // to match clarinet behaviour: do nothing if onFoo is falsey
      handlerFn && handlerFn.apply( undefined, args );
      
      return this;
   };
   
   IncrementalContentBuilderAsserter.prototype.receiveEventFromBus = function(/* args */){
     
      this._eventBus.fire.apply(undefined, arguments);
      return this;
   };
   

   describe('when root object opens', function() {
      
      var builder = aContentBuilder().receivingParserEvent('onopenobject'); 
      
      it('fires correct event', function(){
         expect( builder)
            .toHaveFired(         
               TYPE_PATH
            ,  anAscentContaining(  
                  {key:ROOT_PATH, node:{}}
               )
               
            )
      });

      it('reports correct root', function () {

         expect(builder).toHaveFiredRootThatIsNow({})

      });
   })
   
   describe('after key is found in root object', function(){
      // above test, plus some extra events from clarinet
      var builder = aContentBuilder()
          .receivingParserEvent('onopenobject')
          .receivingParserEvent('onkey', 'flavour');
          
      it('fires correct event', function(){

         expect( builder )
            .toHaveFired(
                TYPE_PATH
             ,  anAscentContaining(  
                   {key:ROOT_PATH, node:{flavour:undefined}}
                ,  {key:'flavour', node:undefined}
                )      
            )
      })
      
      it('reports correct root', function(){
      
         expect(builder).toHaveFiredRootThatIsNow({flavour:undefined});
      });
      
   })
   
   describe('if key is found at same time as root object', function() {
      // above test, plus some extra events from clarinet

      var builder = aContentBuilder()
          .receivingParserEvent('onopenobject', 'flavour');
          
      it('fires correct event', function(){
          
         expect(builder).toHaveFired(
             TYPE_PATH
          ,  anAscentContaining(  
                {key:ROOT_PATH, node:{flavour:undefined}}
             ,  {key:'flavour', node:undefined}
             )      
         )
      });
      
      it('reports correct root', function(){
      
         expect(builder).toHaveFiredRootThatIsNow({flavour:undefined});
      });      
      
   })   
   
   describe('after value is found for that key', function() {

      var builder = aContentBuilder()
                 .receivingParserEvent('onopenobject')
                 .receivingParserEvent('onkey'    ,  'flavour')
                 .receivingParserEvent('onvalue'  ,  'strawberry');
                 
      it('fires correct event', function(){                 
         expect(builder).toHaveFired(
            TYPE_NODE
         ,  anAscentContaining(  
               {key:ROOT_PATH, node:{flavour:'strawberry'}}
            ,  {key:'flavour', node:'strawberry'}
            )      
         )
      });
      
      it('reports correct root', function(){
       
         expect(builder).toHaveFiredRootThatIsNow({flavour:'strawberry'});
      });   
         
   })
   
   describe('fires node found after root object closes', function() {

      var builder = aContentBuilder()
                 .receivingParserEvent('onopenobject')
                 .receivingParserEvent('onkey', 'flavour')
                 .receivingParserEvent('onvalue', 'strawberry')
                 .receivingParserEvent('oncloseobject');
                 
      it('fires correct event', function(){                 
         expect(builder).toHaveFired(
            TYPE_NODE
         ,  anAscentContaining(  
               {key:ROOT_PATH, node:{flavour:'strawberry'}}
            )      
         )
      })
      
      it('reports correct root', function(){
      
         expect(builder).toHaveFiredRootThatIsNow({flavour:'strawberry'});      
      });   
                     
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
   
   
   describe('first array element', function() {

      var builder = aContentBuilder()
          .receivingParserEvent('onopenobject')
          .receivingParserEvent('onkey', 'alphabet')
          .receivingParserEvent('onopenarray')
          .receivingParserEvent('onvalue', 'a');
          
      it('fires path event with numeric paths', function(){
      
         expect(builder).toHaveFired(
            TYPE_PATH
            , anAscentContaining(
                  {key:ROOT_PATH,  node:{'alphabet':['a']}    }
               ,  {key:'alphabet', node:['a']                 }
               ,  {key:0,          node:'a'                   }
            )            
         );
      })
      
      it('fired node event', function(){
         expect(builder).toHaveFired(
            TYPE_NODE
         ,  anAscentContaining(  
               {key:ROOT_PATH,      node:{'alphabet':['a']} }
            ,  {key:'alphabet',     node:['a']              }
            ,  {key:0,              node:'a'                }
            )      
         )      
      })
      
      it('reports correct root', function(){
      
         expect(builder).toHaveFiredRootThatIsNow({'alphabet':['a']});
      });

   })
   
   describe('second array element', function() {

      var builder = aContentBuilder()
          .receivingParserEvent('onopenobject')
          .receivingParserEvent('onkey', 'alphabet')
          .receivingParserEvent('onopenarray')
          .receivingParserEvent('onvalue', 'a')
          .receivingParserEvent('onvalue', 'b');
          
      it('fires events with numeric paths', function(){    
          
         expect(builder).toHaveFired(
            TYPE_PATH
            ,  anAscentContaining(
               {key:ROOT_PATH,  node:{'alphabet':['a','b']}   }
               , {key:'alphabet', node:['a','b']                }
               , {key:1,          node:'b'                      }
            )      
         )
      })
      
      it('fired node event', function(){
         expect(builder).toHaveFired(
            TYPE_NODE
         ,  anAscentContaining(  
               {key:ROOT_PATH,      node:{'alphabet':['a', 'b']} }
            ,  {key:'alphabet',     node:['a','b']               }
            ,  {key:1,              node:'b'                     }
            )      
         )      
      })      
      
      it('reports correct root', function(){
      
         expect(builder).toHaveFiredRootThatIsNow({'alphabet':['a','b']});
      });

   })
   
   describe('array at root', function() {

      var builder = aContentBuilder()
          .receivingParserEvent('onopenarray')
          .receivingParserEvent('onvalue', 'a')
          .receivingParserEvent('onvalue', 'b');
          
      it('fires events with numeric paths', function(){    
          
         expect(builder).toHaveFired(
            TYPE_PATH
            ,  anAscentContaining(
                 {key:ROOT_PATH,  node:['a','b']                }
               , {key:1,          node:'b'                      }
            )      
         )
      })
      
      it('fired node event', function(){
         expect(builder).toHaveFired(
            TYPE_NODE
         ,  anAscentContaining(  
               {key:ROOT_PATH,    node:['a','b']                }
            ,  {key:1,            node:'b'                      }
            )      
         )      
      })      
      
      it('reports correct root', function(){
      
         expect(builder).toHaveFiredRootThatIsNow(['a','b']);
      });

   })      
           
   
   function aContentBuilder() {
   
      return new IncrementalContentBuilderAsserter();      
   }
   
      
   beforeEach(function(){
            
      this.addMatchers({
         toHaveFiredRootThatIsNow: function( expectedRootObj ) {
            var asserter = this.actual;
            var fire = asserter._eventBus.fire;

            return fire.calledWith(ROOT_FOUND, expectedRootObj);
         },
      
         toHaveFired: function( eventName, expectedAscent ){
   
            var asserter = this.actual;
            var fire = asserter._eventBus.fire;
            
            var ascentMatch = sinon.match(function ( foundAscent ) {
                     
               function matches( expect, found ) {
                  if( !expect && !found ) {
                     return true;
                  }
                  
                  if( !expect || !found ) {
                     // Both not empty, but one is. Unequal length ascents.
                     return false;
                  }
                  
                  if( head(expect).key != head(found).key ) {
                     // keys unequal
                     return false;
                  }
                  
                  if( JSON.stringify( head(expect).node ) != JSON.stringify( head(found).node ) ) {
                     // nodes unequal         
                     return false;
                  }
                  
                  return matches(tail(expect), tail(found));
               }
               
               return matches(expectedAscent, foundAscent);
               
            }, 'ascent match');
         
                    
            this.message = function(){
               if( !fire.called ) {
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
                        'latest call had :      \t' + reportArgs(fire.lastCall.args) +
                        '\n' +
                        'all calls were :' +
                        '\n                     \t' +
                        fire.args.map( reportArgs ).join('\n                     \t')
            };



            return fire.calledWithMatch( eventName, ascentMatch );
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