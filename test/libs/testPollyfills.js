/**
 * Even more a waste of my time than polyfills.js, here we have polyfills for functions
 * used only in testing. I didn't want to inflate the size of the delivered code any
 * further than necessary so they are only loaded to run the tests.
 */

if( !Array.prototype.map ) {

   Array.prototype.map = function( func ){
      var out = [];
   
      for( var i = 0 ; i < this.length ; i++ ) {
      
         out.push(func(this[i]));                                                                              
      }
      
      return out;
   };         
}