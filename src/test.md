
Neither a DOM-style nor a SAX-style parse but somewhere between the two.

==Example of usage==




Advantages over using clarinet directly:

High level semantics
Will only give fully parsed objects to the caller

Disadvantages:

Keeps the whole hydrated json in memory so less suitable for extremely large json responses

# Still to do
* Ajax
* An option to throw away most of the json once seen if we don't
  need a root element

# usage

## basics

``` js
var clarinet = require("clarinet")
  , parser = clarinet.parser()
  ;

parser.onerror = function (e) {
  // an error happened. e is the error.
};
parser.onvalue = function (v) {
  // got some value.  v is the value. can be string, double, bool, or null.
};
parser.onopenobject = function (key) {
  // opened an object. key is the first key.
};
parser.onkey = function (key) {
  // got a key in an object.
};
parser.oncloseobject = function () {
  // closed an object.
};
parser.onopenarray = function () {
  // opened an array.
};
parser.onclosearray = function () {
  // closed an array.
};
parser.onend = function () {
  // parser stream is done, and ready to have more stuff written to it.
};

parser.write('{"foo": "bar"}').close();
```

## Running the tests

```
no tests specified, will run all
Will run progressive json tests( all ) against unminified code
setting runnermode QUIET
............................................................
Total 60 tests (Passed: 60; Fails: 0; Errors: 0) (160.00 ms)
  Chrome 26.0.1410.28 Mac OS: Run 20 tests (Passed: 20; Fails: 0; Errors 0) (160.00 ms)
  Firefox 17.0 Mac OS: Run 20 tests (Passed: 20; Fails: 0; Errors 0) (68.00 ms)
  Safari 536.26.17 Mac OS: Run 20 tests (Passed: 20; Fails: 0; Errors 0) (35.00 ms)

Will run progressive json tests( all ) against minified code
setting runnermode QUIET
............................................................
Total 60 tests (Passed: 60; Fails: 0; Errors: 0) (180.00 ms)
  Chrome 26.0.1410.28 Mac OS: Run 20 tests (Passed: 20; Fails: 0; Errors 0) (180.00 ms)
  Firefox 17.0 Mac OS: Run 20 tests (Passed: 20; Fails: 0; Errors 0) (86.00 ms)
  Safari 536.26.17 Mac OS: Run 20 tests (Passed: 20; Fails: 0; Errors 0) (37.00 ms)
```