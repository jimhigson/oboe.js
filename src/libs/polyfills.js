/**
 * Here we have a fairly minimal set of polyfills needed to give old and rubbish browsers a fighting
 * chance of running the code. IE8, I'm looking at you.
 * 
 * If you already have polyfills in your webapp or you don't need to support bad browsers, feel free 
 * to make a custom build without this.
 */

if( !Array.prototype.filter ) {

   /* Array.filter this has to be done as a polyfill, clarinet expects it */ 
   Array.prototype.filter = function( func ){
      var out = [];
   
      for( var i = 0 ; i < this.length ; i++ ) {
      
         if( func( this[i] ) ) {
            out.push(this[i]);                                                            
         }                  
      }
      
      return out;
   };
   
}

if( !Function.prototype.bind ) {
 
   Function.prototype.bind = function( context /*, arg1, arg2 ... */ ){
      var f = this,
          boundArgs = Array.prototype.slice.call(arguments, 1);
   
      return function( /* yet more arguments */ ) {
         var callArgs = boundArgs.concat(Array.prototype.slice.call(arguments));            
            
         return f.apply(context, callArgs);
      }
   };
}