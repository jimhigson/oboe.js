describe('patternAdapter', function() {

   var bus, matches, jsonPathCompiler;

   beforeEach(function(){
   
      bus = pubSub()
   
      matches = {};
   
      spyOn( bus, 'emit' ).andCallThrough();
      spyOn( bus, 'on' ).andCallThrough();
      spyOn( bus, 'un' ).andCallThrough();
     
      jsonPathCompiler = jasmine.createSpy('jsonPathCompiler').andCallFake( 
         function (pattern){
   
            function compiled ( ascent ){         
               if( matches[pattern] === ascent ) {
                  return head(ascent);
               } else {
                  return false;
               }
            }
            
            return compiled;
         }
      );        
   
      patternAdapter(bus, jsonPathCompiler);      
   })   
   
   function anAscentMatching(pattern) {
      var ascent = list(namedNode('node', {}));

      matches[pattern] = ascent;  

      return ascent;
   }   

   it('compiles the correct pattern when patterns are listened to', function(){
   
      bus.on('node:test_pattern', noop);
            
      expect( jsonPathCompiler ).toHaveBeenCalledWith('test_pattern');
   })

   it('listens for node events when node:pattern is added', function(){
         
      bus.on('node:test_pattern', noop);
      
      expect(bus.on)
         .toHaveBeenCalledWith(
            NODE_FOUND
         ,  jasmine.any(Function)
         ,  'node:test_pattern'
         )
   })
   
   it('stops listening for node events when node:pattern is removed again', function(){
         
      bus.on('node:test_pattern', noop);
      bus.un('node:test_pattern', noop);
      
      expect(bus.un)
         .toHaveBeenCalledWith(
            NODE_FOUND
         ,  'node:test_pattern'
         )
   })      

   it('fires node:pattern events when match is found', function(){
      
      var ascent = anAscentMatching('test_pattern');
   
      bus.on('node:test_pattern', noop);

      bus.emit(NODE_FOUND, ascent);
      
      expect( bus.emit )
         .toHaveBeenCalledWith( 
            'node:test_pattern'
         ,  nodeOf( head( ascent ) )
         ,  ascent 
         );
   })   

});