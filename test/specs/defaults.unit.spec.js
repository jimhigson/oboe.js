import { applyDefaults } from '../../src/defaults'
import { calledLikeMatcher } from '../libs/calledLikeMatcher'
import * as sinon from 'sinon'

describe('default settings', function () {
  var noBody = null
  var noHeaders = {}

  it('uses no-body, no-headers, GET, withoutCredentials as the default', function () {
    var stub = jasmine.createSpy()

    applyDefaults(stub, 'http://example.com/oboez')

    expect(stub).toHaveBeenCalledLike(
      'GET',
      'http://example.com/oboez',
      noBody,
      noHeaders,
      false
    )
  })

  it('can make URL uncacheable', function () {
    var time = sinon.useFakeTimers(123)

    var stub = jasmine.createSpy()

    applyDefaults(stub, 'http://example.com/oboez', undefined, undefined, undefined, undefined, false)

    expect(stub).toHaveBeenCalledLike(
      'GET',
      'http://example.com/oboez?_=123',
      noBody,
      noHeaders,
      false
    )

    time.restore()
  })

  it('can disable caching if url already has a query param', function () {
    var time = sinon.useFakeTimers(456)

    var stub = jasmine.createSpy()

    applyDefaults(stub, 'http://example.com/oboez?foo=bar', undefined, undefined, undefined, undefined, false)

    expect(stub).toHaveBeenCalledLike(
      'GET',
      'http://example.com/oboez?foo=bar&_=456',
      noBody,
      noHeaders,
      false
    )

    time.restore()
  })

  it('can explicitly be not uncacheable', function () {
    var time = sinon.useFakeTimers(123)

    var stub = jasmine.createSpy()

    applyDefaults(stub, 'http://example.com/oboez', undefined, undefined, undefined, undefined, true)

    expect(stub).toHaveBeenCalledLike(
      'GET',
      'http://example.com/oboez',
      noBody,
      noHeaders,
      false
    )

    time.restore()
  })

  it('allows method to be specified', function () {
    var stub = jasmine.createSpy()

    applyDefaults(stub, 'http://example.com/oboez', 'POST', undefined, undefined, undefined, true)

    expect(stub).toHaveBeenCalledLike(
      'POST',
      'http://example.com/oboez',
      noBody,
      noHeaders,
      false
    )
  })

  it('allows withCredentials to be given', function () {
    var stub = jasmine.createSpy()

    applyDefaults(stub, 'http://example.com/oboez', undefined, undefined, undefined, true)

    expect(stub).toHaveBeenCalledLike(
      'GET',
      'http://example.com/oboez',
      noBody,
      noHeaders,
      true
    )
  })

  it('stringifies JSON bodies and sets content-type if not already given', function () {
    var stub = jasmine.createSpy()

    applyDefaults(stub, 'http://example.com/oboez', 'POST', { 'foo': 'bar' }, undefined, undefined, true)

    expect(stub).toHaveBeenCalledLike(
      'POST',
      'http://example.com/oboez',
      '{"foo":"bar"}',
      { 'Content-Type': 'application/json', 'Content-Length': 13 },
      false
    )
  })

  it('stringifies JSON bodies and leaves content-type as-is if already given', function () {
    var stub = jasmine.createSpy()

    applyDefaults(stub, 'http://example.com/oboez', 'POST', { 'foo': 'bar' }, { 'Content-Type': 'application/awesome' }, undefined, true)

    expect(stub).toHaveBeenCalledLike(
      'POST',
      'http://example.com/oboez',
      '{"foo":"bar"}',
      { 'Content-Type': 'application/awesome', 'Content-Length': 13 },
      false
    )
  })

  it('passed through string bodies and does not set content-type', function () {
    var stub = jasmine.createSpy()

    applyDefaults(stub, 'http://example.com/oboez', 'POST', 'body content', undefined, undefined, true)

    expect(stub).toHaveBeenCalledLike(
      'POST',
      'http://example.com/oboez',
      'body content',
      { 'Content-Length': 12 },
      false
    )
  })

  describe('when formData is provided', function () {
    it('should passed through formData bodies and does not set content-type', function () {
      var stub = jasmine.createSpy()

      var formData = new FormData()

      applyDefaults(stub, 'http://example.com/oboez', 'POST', formData, undefined, undefined, true)

      expect(stub).toHaveBeenCalledLike(
        'POST',
        'http://example.com/oboez',
        formData,
        noHeaders,
        false
      )
    })
  })

  beforeEach(function () {
    jasmine.addMatchers(calledLikeMatcher)
  })
})
