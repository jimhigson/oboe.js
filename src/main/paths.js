
var paths = (function (paths) {

   paths.compile = function( jsonPath ){
        
      // first, some rather inefficient tokenisation. In practice, it doesn't matter, this
      // should be fast enough. The aim is to be readable and debuggable above fast compilation
      // because patterns are executed many times more than they are compiled.
      // Still, it is a candidate to be replaced with a functional equivalent later.
                    
      var simplified = jsonPath                                 
            // standardise by removing [2] style path nodes - change into .2:
            .replace(/\[(\d+)\]/g,      '.$1')
          
            // standardise by removing ["foo"] style path nodes - change into .foo:
            .replace(/\["(\w+)"\]/g,    '.$1')
            
            // standardise by removing [*] - change into .*:
            .replace(/\[\*\]/g,    '.*');                           
              
      var tokens = simplified                         
            .replace(/(\w+)/g,          '<name $1>')
            .replace(/\.\./g,           '<ancestor>')            
            .replace(/^\$\.?/,          '<root>')
            .replace(/\*/g,             '<anyname>')            
            .replace(/\./g,             '<child>')            
            
      ,   regexPattern = tokens
            .replace('<root>',          '^%root%')
            .replace(/<child>/g,        '\\.')             
            .replace(/<name (\w+)>/g,   '\\b$1')
            .replace(/<ancestor>/g,     '.*?')
            .replace(/<anyname>/g,      '(\\w+?|%root%)')            
               + '$'
                                                   
      ,   regex = new RegExp(regexPattern);                  
                  
      return {
         test: function(path) {
         
            var stringPath = '%root%' + path.join('.');         
           
            return !!regex.test(stringPath);            
         }
      };      
   };    
   
   return paths;
   
})( typeof exports === "undefined" ? {} : exports );
