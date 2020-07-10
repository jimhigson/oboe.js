import { all } from './lists'
import { attr, partialComplete } from './functional'

/**
 * This file defines some loosely associated syntactic sugar for
 * Javascript programming
 */

/**
 * Returns true if the given candidate is of type T
 */
function isOfType (T, maybeSomething) {
  return maybeSomething && maybeSomething.constructor === T
}

var len = attr('length')
var isString = partialComplete(isOfType, String)

/**
 * I don't like saying this:
 *
 *    foo !=== undefined
 *
 * because of the double-negative. I find this:
 *
 *    defined(foo)
 *
 * easier to read.
 */
function defined (value) {
  return value !== undefined
}

/**
 * Returns true if object o has a key named like every property in
 * the properties array. Will give false if any are missing, or if o
 * is not an object.
 */
function hasAllProperties (fieldList, o) {
  return isObject(o) &&
    all(function (field) {
      return (field in o)
    }, fieldList)
}

/**
 * Determines whether param `o` is an object or not.
 * Streams _sometimes_ in Node for a currently
 * unknown reason don't be an instance of Object.
 * Meaning that `o instanceof Object === false`.
 *
 * @see https://github.com/jimhigson/oboe.js/pull/214
 */
function isObject(o) {
    return o !== null && typeof o === 'object'
}


export {
  isOfType,
  len,
  isString,
  defined,
  hasAllProperties
}
