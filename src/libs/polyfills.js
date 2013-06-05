/**
 * Here we have a fairly minimal set of polyfills needed to give old and rubbish browsers a fighting
 * chance of running the code. IE8, I'm looking at you.
 * 
 * If you already have polyfills in your webapp or you don't need to support bad browsers, feel free 
 * to make a custom build without this.
 */

if( !Array.prototype.forEach ) {

   /* Array.forEach has to be a polyfill, clarinet expects it
    *  Ignoring all but function argument since not needed, eg can't take a context  */     
   Array.prototype.forEach = function( func ){
   
      for( var i = 0 ; i < this.length ; i++ ) {      
         func( this[i] );    
      }      
   };         
}

if( !Array.prototype.filter ) {

   /* Array.filter has to be a polyfill, clarinet expects it.
    *  Ignoring all but function argument since not needed, eg can't take a context  */ 
   Array.prototype.filter = function( func ){
         
      var out = [];
   
      // let's use the .forEach we just declared above to implement .filter
      this.forEach(function(item){      
         if( func( item ) ) {
            out.push(item);
         }                  
      });
      
      return out;
   };
}

if( !Function.prototype.bind ) {
 
   Function.prototype.bind = function( context /*, arg1, arg2 ... */ ){
      var f = this,
          boundArgs = toArray(arguments, 1);
   
      return function( /* yet more arguments */ ) {
         var callArgs = boundArgs.concat(toArray(arguments));            
            
         return f.apply(context, callArgs);
      }
   };
}