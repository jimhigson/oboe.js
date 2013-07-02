function lastOf(array) {
   return array[len(array)-1];
}

function isArray(a) {
   return a && a.constructor === Array;
}

function len(array){
   return array.length;
}

function toArray(arrayLikeThing, startIndex) {
   return Array.prototype.slice.call(arrayLikeThing, startIndex);
}

function isString(thing) {
   return typeof thing == 'string';
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