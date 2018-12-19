import { keyOf, nodeOf } from './ascent'
import { NODE_SWAP, NODE_DROP, ABORTING } from './events'
import { head, tail } from './lists'
/**
 * A bridge used to assign stateless functions to listen to clarinet.
 *
 * As well as the parameter from clarinet, each callback will also be passed
 * the result of the last callback.
 *
 * This may also be used to clear all listeners by assigning zero handlers:
 *
 *    ascentManager( clarinet, {} )
 */
function ascentManager (oboeBus, handlers) {
  'use strict'

  var listenerId = {}
  var ascent

  function stateAfter (handler) {
    return function (param) {
      ascent = handler(ascent, param)
    }
  }

  for (var eventName in handlers) {
    oboeBus(eventName).on(stateAfter(handlers[eventName]), listenerId)
  }

  oboeBus(NODE_SWAP).on(function (newNode) {
    var oldHead = head(ascent)
    var key = keyOf(oldHead)
    var ancestors = tail(ascent)
    var parentNode

    if (ancestors) {
      parentNode = nodeOf(head(ancestors))
      parentNode[key] = newNode
    }
  })

  oboeBus(NODE_DROP).on(function () {
    var oldHead = head(ascent)
    var key = keyOf(oldHead)
    var ancestors = tail(ascent)
    var parentNode

    if (ancestors) {
      parentNode = nodeOf(head(ancestors))

      delete parentNode[key]
    }
  })

  oboeBus(ABORTING).on(function () {
    for (var eventName in handlers) {
      oboeBus(eventName).un(listenerId)
    }
  })
}

export { ascentManager }
