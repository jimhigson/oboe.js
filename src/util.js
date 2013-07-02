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

function len(array){
   return array.length;
}

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