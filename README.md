
`Progressive.js` is a progressive json parser built on top of [clarinet](https://github.com/dscape/clarinet).
It provides an intuitive interface to use the a http response while the request is still
ongoing. The whole library gzips down to  `3.5k`.

## Purpse

Your web application probably spends more time waiting for io than anything else. However,
during much of the time it spends waiting there is already enough data loaded to start updating
the page.

In a browser progressive allows you to start updating your page earlier, creating a
more responsive user experience. Using $.ajax() etc is very simple but your ajax
call will wait for the whole response to return before your javascript gets given objects.

The aim of Progressive is to let you start using the response as early as possible with only
a slight increase in complexity for the programmer.

The resulting parser makese results ready as quickly as if they had been pased using a SAX
parser like Clarinet but the syntax is much simpler to use.

The downside compared to using clarinet directly is that because the whole json object
is stored in memory, progressive uses more memory.
However, the memory used is no more than if the json had been parsed with
JSON.parse() so for most real-world applications this is acceptable.

# Example

## listening to json over ajax

``` js
// we have things.json, to be fetched over ajax:
{
   foods: [
      {name:'aubergine', colour:'purple'},
      {name:'apple', colour:'red'},
      {name:'nuts', colour:'brown'}
   ],
   non_foods: [
      {name:'brick', colour:'red'},
      {name:'poison', colour:'pink'},
      {name:'broken_glass', colour:'green'}
   ]
}

progressive.fetch('/myapp/things.json')
   .onMatch('//foods/*', function( foodThing ){
      // this callback will be called everytime a new object is found in the foods array.
      // in this example we just use jQuery to set up some simple DOM:
      $('#foods')
         .append('<div>')
            .text('it is safe to eat', foodThing.name)
            .style('color', foodThing.colour)
   })
   .onMatch('//non_foods/*', function( dangerousThing ){
      // this callback will be called everytime a new object is found in the non-foods array
      $('#danger')
         .append('<div>')
            .text('you should avoid', dangerousThing.name)
            .style('color', dangerousThing.colour)
   });


// if we just want to make a list of names of things and don't care if we
// should eat them or not:

progressive.fetch('/myapp/things.json')
   .onMatch('**/name', function( name ){
      $('#thing').append('<li>').text(name)
   });
```

In the above example, progressive

# Pattern matching

Progressive's pattern matching recognises these special tokens:

* `//` root json object
* `/`  path separator
* `*`  any named node in the path
* `**` any number of intermediate nodes (non-greedy)

## Some Example patterns:

```
'//foods/colour'           // the colours of the foods
'**/person'                // all people in the json
'**/person/friends/*/name' // detecting links in social network
`**/person/**/email`       // email anywhere as descendent of a person object
`//`                       // the root object (once the whole document is ready, like JSON.parse())
`*`                        // every object, string, number etc in the json!
```


## Use as a stream in node.js


`Clarinet` supports use as a node stream. This hasn't been implemented in
progressive but it should be quite easy to do so.

## Running the tests

Progressive is built using [grunt](http://gruntjs.com/) and
[require.js](http://requirejs.org/) and tested using
[jstestdriver](https://code.google.com/p/js-test-driver/). JSTD might
be chaged to jasmine later to make the tests easier to run from grunt
(there is a jstd plugin for Grunt but it doesn't work with Grunt v4).

The `runtests.sh` script combines several steps into one:

* Runs the unminified code against the tests
* build the code using grunt
* Run the minified code against the tests

If everything works you will see output like below:

```
no tests specified, will run all
Will run progressive json tests( all ) against unminified code
setting runnermode QUIET
............................................................
Total 60 tests (Passed: 60; Fails: 0; Errors: 0) (103.00 ms)
  Firefox 17.0 Mac OS: Run 20 tests (Passed: 20; Fails: 0; Errors 0) (103.00 ms)
  Safari 536.26.17 Mac OS: Run 20 tests (Passed: 20; Fails: 0; Errors 0) (31.00 ms)
  Chrome 27.0.1435.0 Mac OS: Run 20 tests (Passed: 20; Fails: 0; Errors 0) (38.00 ms)

Running "requirejs:compile" (requirejs) task
>> Tracing dependencies for: progressive
>> Uglifying file: /Users/jimhigson/Sites/progressivejson/progressive.min.js
>> /Users/jimhigson/Sites/progressivejson/progressive.min.js
>> ----------------
>> /Users/jimhigson/Sites/progressivejson/src/main/libs/clarinet.js
>> /Users/jimhigson/Sites/progressivejson/src/main/streamingXhr.js
>> /Users/jimhigson/Sites/progressivejson/src/main/progressive.js

Done, without errors.
Will run progressive json tests( all ) against minified code
setting runnermode QUIET
............................................................
Total 60 tests (Passed: 60; Fails: 0; Errors: 0) (80.00 ms)
  Firefox 17.0 Mac OS: Run 20 tests (Passed: 20; Fails: 0; Errors 0) (80.00 ms)
  Safari 536.26.17 Mac OS: Run 20 tests (Passed: 20; Fails: 0; Errors 0) (33.00 ms)
  Chrome 27.0.1435.0 Mac OS: Run 20 tests (Passed: 20; Fails: 0; Errors 0) (38.00 ms)

Process finished with exit code 0
```