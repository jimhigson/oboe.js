
;(function (paths) {

   paths.compile = function( jsonPath ){
        
      // first, some rather inefficient tokenisation. In practice, it doesn't matter, this
      // should be fast enough. The aim is to be readable and debuggable above fast compilation
      // because patterns are executed many times more than they are compiled.
      // Still, it is a candidate to be replaced with a functional equivalent later.
              
      //.replace(/((\w+)|\[(\d+)\])/g,          '<name $2$3>')
      
      var simplified = jsonPath                                 
            // standardise by removing [2] style path nodes - change into .2:
            .replace(/\[(\d+)\]/g,      '.$1')
          
            // standardise by removing ["foo"] style path nodes - change into .foo:
            .replace(/\["(\w+)"\]/g,    '.$1');               
              
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

      console.log('______________');
      console.log('jsonPath', jsonPath);                  
      console.log('tokens', tokens);                  
      console.log('regexPattern', regexPattern);                  
                  
      return {
         test: function(path) {
         
            var stringPath = '%root%' + path.join('.');         

            console.log('_____');         
            console.log( path );
            console.log('stringPath', stringPath);
            console.log('result', regex.test(stringPath) );  
         
            return !!regex.test(stringPath);            
         }
      };      
   };    
   
})(typeof exports === "undefined" ? paths = {} : exports);

var jsonPath = '';
var regexPattern = jsonPath
            .replace(/\w+/g, '$&(\\b|$)')
            .replace(/\*\*/g, '__any__')
            .replace(/\*/g, '(//|[^\\/]+?)')
            .replace(/\/\//, '^\\/\\/')
            .replace(/__any__/g, '.*?');
            
regexPattern += '$';                  