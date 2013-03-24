
;(function (paths) {

   paths.compile = function( jsonPath ){
        
      var regexPattern = jsonPath
                  .replace(/\w+/g, '$&(\\b|$)')
                  .replace(/\*\*/g, '__any__')
                  .replace(/\*/g, '(//|[^\\/]+?)')
                  .replace(/\/\//, '^\\/\\/')
                  .replace(/__any__/g, '.*?');
                  
      regexPattern += '$';                  
                  
      return new RegExp(regexPattern);      
   };    
   
})(typeof exports === "undefined" ? paths = {} : exports);