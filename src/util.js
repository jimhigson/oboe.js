
/**
 * Returns true if the given candidate is of type T
 * 
 * @param {Function} T
 * @param {*} maybeSomething
 */
function isOfType(T, maybeSomething){
   return maybeSomething && maybeSomething.constructor === T;
}
function pluck(key, object){
   return object[key];
}

var attr = partialComplete(partialComplete, pluck),
    len = attr('length'),    
    isString = partialComplete(isOfType, String);

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
 * @param {String[]} fieldList
 */
function hasAllProperties(fieldList, o) {

   return      (o instanceof Object) 
            &&
               all(function (field) {         
                  return (field in o);         
               }, fieldList);
}