function lastOf(array) {
   return array[len(array)-1];
}

/**
 * Returns true if the given candidate is of type T
 * 
 * @param {Function} T
 * @param {*} maybeSomething
 */
function isOfType(T, maybeSomething){
   return maybeSomething && maybeSomething.constructor === T;
}

var isArray = partialComplete(isOfType, Array);
var isString = partialComplete(isOfType, String);

function pluck(key, object){
   return object[key];
}

var len = partialComplete(pluck, 'length');

function toArray(arrayLikeThing, startIndex) {
   return Array.prototype.slice.call(arrayLikeThing, startIndex);
}

/** I don't like saying foo !=== undefined very much because of the double-negative. I find
 *  defined(foo) easier to read.
 *  
 * @param {*} value anything
 */ 
function defined( value ) {
   return value !== undefined;
}

function always(){return true}

/**
 * Returns true if object o has a key named like every property in the properties array.
 * Will give false if any are missing, or if o is not an object.
 * 
 * @param {Object} o
 * @param {String[]} properties
 */
function hasAllProperties(o, properties) {

   return      (o instanceof Object) 
            &&
               properties.every(function (field) {         
                  return (field in o);         
               });
}