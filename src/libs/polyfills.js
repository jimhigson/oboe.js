(function(){

   /** If no implementation of a method called (methodName) exists fill it in with the
    *  implementation given as (filler).
    */ 
   function fillIn(type, methodName, filler) {
      var proto = type.prototype;
      proto[methodName] = proto[methodName] || filler;
   }

   /**
    * Here we have a minimal set of polyfills needed to let the code run in older browsers such
    * as IE8.
    * 
    * If you already have polyfills in your webapp or you don't need to support bad browsers, feel free 
    * to make a custom build without this. However, it is as small as it can be to get the job done.
    * 
    */
   
   fillIn(Array, 'every', function(func) {
      for( var i = 0 ; i < len(this) ; i++ ) {      
         if( !func( this[i] ) ) {
            return false;
         }    
      }   
      return true;   
   });   
   
   // Array.forEach has to be a polyfill, clarinet expects it
   // Ignoring all but function argument since not needed, eg can't take a context       
   fillIn(Array, 'forEach', function( func ){
        
      this.every(function(item){
         func(item); return true;
      });        
      
   });         
         
   // A similarly minimalist implementation of .reduce. Array.reduce in Javascript is
   // similar to fold in other languages.
   fillIn(Array, 'reduce', function( func, curValue ){         
   
      // let's use the .forEach we just declared above to implement .filter
      this.forEach(function(item){               
         curValue = func(curValue, item);
      });
      
      return curValue;
   });
   
   // Array.filter has to be a polyfill, clarinet expects it.
   // Ignoring all but function argument since not needed, eg can't take a context
   fillIn(Array, 'filter', function( filterCondition ){         
   
      // let's use the .reduce we declared above to implement .filter:
      return this.reduce(function(matchesSoFar, item){      
         if( filterCondition( item ) ) {
            matchesSoFar.push(item);
         }
         return matchesSoFar;                  
      }, []);
      
   });
   
           
   // allow binding. Minimal version which includes binding of context only, not arguments as well
   fillIn(Function, 'bind', function( context /*, arg1, arg2 ... */ ){
      var f = this;
   
      return function( /* yet more arguments */ ) {                        
         return f.apply(context, arguments);
      }
   });   

})();