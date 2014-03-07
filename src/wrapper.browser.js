// This file is the concatenation of many js files.
// See http://github.com/jimhigson/oboe.js for the raw source

// having a local undefined, window, Object etc allows slightly better minification:                    
(function  (window, Object, Array, Error, JSON, undefined ) {

   // ---contents--- //

   if ( typeof define === "function" && define.amd ) {
      define( "oboe", [], function () { return oboe; } );
   } else {
      window.oboe = oboe;
   }
})(window, Object, Array, Error, JSON);
