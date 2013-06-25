(function(){

   /** If no implementation of a method called (methodName) exists fill it in with the
    *  implementation given as (filler).
    */ 
   function fillIn(class, methodName, filler) {
      var proto = class.prototype;
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
   
   // Array.forEach has to be a polyfill, clarinet expects it
   // Ignoring all but function argument since not needed, eg can't take a context       
   fillIn(Array, 'forEach', function( func ){
         
      for( var i = 0 ; i < len(this) ; i++ ) {      
         func( this[i] );    
      }      
      
   });         
   
   
   // Array.filter has to be a polyfill, clarinet expects it.
   // Ignoring all but function argument since not needed, eg can't take a context
   fillIn(Array, 'filter', function( func ){         
      var out = [];
   
      // let's use the .forEach we just declared above to implement .filter
      this.forEach(function(item){      
         if( func( item ) ) {
            out.push(item);
         }                  
      });
      
      return out;
   });
      
   // allow binding context only, not arguments as well
   fillIn(Function.prototype, 'bind', function( context /*, arg1, arg2 ... */ ){
      var f = this;
   
      return function( /* yet more arguments */ ) {                        
         return f.apply(context, arguments);
      }
   });   

})();