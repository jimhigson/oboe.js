**Oboe.js** is an asynchronous, progressive json parser built on top of
[clarinet](https://github.com/dscape/clarinet).
It provides an intuitive interface to read a json http response while the request is still
ongoing. The whole library gzips down to about **3.5k**.

# Purpose

The aim of Oboe is to let you start using your data as early as possible with as simple
an interface as is possible.

Your web application probably makes the user wait longer for io than anything else. However,
during much of the waiting there will already be enough data loaded to start showing
things on the page. This is especially true on mobile networks where requests can sporadically stall
or if you are writing the response out asynchronously.
But even on a fast networks and synchronous web servers there are perceptual speed improvements
for non-trivial json responses.

Think of it as the json equivalent of old-style oboe html rendering.

# Status

Oboe is still in development. Nevertheless, it is already
[fairly well tested](src/test/cases/oboeTest.js).
The codebase is small and hackable and it works. Try it, let me know how it goes.

Old browsers might not be so well supported but it should be easy enough to branch and build support in if you need it.

Oboe used to be called **Progressive.js** until I noticed that a project 
[already existed with that name](https://github.com/jamesallardice/Progressive.js). D'oh! 

# Examples

## listening for json objects

Let's say we have this file, things.json, to be fetched over ajax (In reality your json is probably bigger than this :-)
``` js
{
   foods: [
      {'name':'aubergine',    'colour':'purple'},
      {'name':'apple',        'colour':'red'},
      {'name':'nuts',         'colour':'brown'}
   ],
   non_foods: [
      {'name':'brick',        'colour':'red'},
      {'name':'poison',       'colour':'pink'},
      {'name':'broken_glass', 'colour':'green'}
   ]
}
```

In our webapp we want to load the json and write the foods out
but we don't want to wait for the non_foods to load before we show them
since we're going to ignore them anyway:

``` js
oboe.fetch('/myapp/things.json')
   .onFind('//foods/*', function( foodThing ){
      // this callback will be called everytime a new object is found in the foods array.
      // in this example we just use jQuery to set up some simple DOM:
      $('#foods')
         .append('<div>')
            .text('it is safe to eat ' + foodThing.name)
            .style('color', foodThing.colour)
   });
```

## listening for strings in the json stream

Want to listen to strings instead of objects? The syntax is just the same:

``` js
oboe.fetch('/myapp/things.json')
   .onFind('**/name', function( name ){
      $('#things').append('<li>').text(name);
   });
```

## providing some feedback as a page is updating

Let's provide some visual feedback that one area of the page is loading and remove it when we have just that json,
no matter what else we get at the same time 

I'll assume you already implemented a spinner
``` js
My.App.showSpinner('#foods');

oboe.fetch('/myapp/things.json')
   .onFind('//foods/*', function( foodThing ){
      $('#foods').append('<div>').text('it is safe to eat ' + foodThing.name);
   })
   .onFind('//foods', function(){
      // Will be called when the whole foods array has loaded. We've already wrote the DOM for each item in this array
      // above so we don't need to use the items anymore, just hide the spinner:
      My.App.hideSpinner('#foods');
      // even though we just hid the spinner, the json might not have completely loaded. That's fine because we
      // don't need the non-foods to remove the spinner from the #foods part of the page. The food bit already has
      // the data that we need
   });
```

## Listening for paths when they are first found without waiting for the objects

As well as ```.onFind```, you can use ```.onPath``` to be notified when the path is first matched but we don't yet know what will
be there. We might want to eagerly create elements before we have all the content to get them on the page as soon as \
possible.
``` js
var currentPersonDiv;
oboe.fetch('//people.json')
   .onPath('//people/*', function(){
      // we don't have the person's details yet but we know we found someone in the json stream, we can
      // use this to eagerly add them to the page:
      personDiv = $('<div class="person">');
      $('#people').append(personDiv);
   })
   .onPath('//people/name', function( name ){
      // we just found out that person's name, lets add it to their div:
      currentPersonDiv.append('<span class="name"> + name + </span>');
   })
   .onPath('//people/email', function( email ){
      // we just found out that person's name, lets add it to their div:
      currentPersonDiv.append('<span class="email"> + email + </span>');
   })
```

## Error handling

You use the error handler to roll back if there is an error in the json. Once there is an error, Oboe won't
give any further callbacks no matter what is in the rest of the json.
 
``` js
var currentPersonDiv;
oboe.fetch('//people.json')
   .onPath('//people/*', function(){
      // we don't have the person's details yet but we know we found someone in the json stream, we can
      // use this to eagerly add them to the page:
      personDiv = $('<div class="person">');
      $('#people').append(personDiv);
   })
   .onPath('//people/name', function( name ){
      // we just found out that person's name, lets add it to their div:
      currentPersonDiv.append('<span class="name"> + name + </span>');
   })
   .onError('//people/email', function( email ){
      // oops, that didn't go so well. instead of leaving this dude half on the page, remove them altogether
      currentPersonDiv.remove();
   })
```


## Using the path passback

The callback is also given the path the match was found at. It is sometimes preferable to
register a wide-matching pattern and use the path parameter to decide what to do instead of
registering a seperate callback for every possible json path that we might have an interest in.

Say we're making some kind of social site that puts the json for a page into one response and
the top level objects in the json response can arrive in any order:

``` js
{  'notifications':{
      'newNotifications': 5,
      'totalNotifications': 4
   },
   'messages': [
      {'from':'Joe', 'subject':'blah blah', 'url':'messages/1'},
      {'from':'Baz', 'subject':'blah blah blah', 'url':'messages/2'}
   ],
   'photos': {
      'new': [
         {'title': 'party', 'url':'/photos/5', 'peopleTagged':['Joe','Baz']}
      ]
   }
   // ... other modules ...
}

oboe.fetch('http://mysocialsite.example.com/homepage.json')
   .onFind('//*', function( moduleJson, path ){
      // This callback will be called with every direct child of the root object but not
      // the sub-objects therein. Because we're coming off the root, the path argument
      // is a single-element array with the module name like ['messages'] or ['photos']
      My.App.getModuleCalled(path[0]).dataLoaded(moduleJson);
   });

```

# Pattern matching

Oboe's pattern matching recognises these special tokens:

`//` root json object  
`/`  path separator  
`*`  any named node in the path  
`**` any number of intermediate nodes (non-greedy)  

## Some Example patterns:

```
//foods/colour           // the colours of the foods
**/person/emails/1       // the first element in the email array for each person
**/person                // all people in the json
**/person/friends/*/name // detecting links in social network
**/person/**/email       // email anywhere as descendent of a person object
//                       // the root object (once the whole document is ready, like JSON.parse())
*                        // every object, string, number etc in the json!
```

Internally the patterns are converted into regular expressions

## Use as a stream in node.js

**Clarinet** supports use as a node stream. This hasn't been implemented in
Oboe but it should be quite easy to do.

## Getting the most from oboe

Asynchronous parsing is better if the data is written out progressively from the server side
(think [node](http://nodejs.org/) or [Netty](http://netty.io/)) because we're *sending
and parsing* everything at the earliest possible oppotunity. If you can, send small bits of the
json as soon as it is ready instead of waiting before everything is ready to start sending.

# Running the tests

Oboe is built using [grunt](http://gruntjs.com/) and
[require.js](http://requirejs.org/) and tested using
[jstestdriver](https://code.google.com/p/js-test-driver/). 
The [jstd plugin for grunt](https://github.com/rickyclegg/grunt-jstestdriver) was just updated
to support grunt 0.4 so the shell script part can probably be removed now.

The **runtests.sh** script combines several steps into one:

* Runs the unminified code against the tests
* build the code using grunt
* Run the minified code against the tests

If everything works you will see output like below:

```
no tests specified, will run all
Will run oboe json tests( all ) against unminified code
setting runnermode QUIET
............................................................
Total 60 tests (Passed: 60; Fails: 0; Errors: 0) (103.00 ms)
  Firefox 17.0 Mac OS: Run 20 tests (Passed: 20; Fails: 0; Errors 0) (103.00 ms)
  Safari 536.26.17 Mac OS: Run 20 tests (Passed: 20; Fails: 0; Errors 0) (31.00 ms)
  Chrome 27.0.1435.0 Mac OS: Run 20 tests (Passed: 20; Fails: 0; Errors 0) (38.00 ms)

Running "requirejs:compile" (requirejs) task
>> Tracing dependencies for: oboe
>> Uglifying file: /Users/jimhigson/Sites/progressivejson/oboe.min.js
>> /Users/jimhigson/Sites/progressivejson/oboe.min.js
>> ----------------
>> /Users/jimhigson/Sites/progressivejson/src/main/libs/clarinet.js
>> /Users/jimhigson/Sites/progressivejson/src/main/streamingXhr.js
>> /Users/jimhigson/Sites/progressivejson/src/main/oboe.js

Done, without errors.
Will run oboe json tests( all ) against minified code
setting runnermode QUIET
............................................................
Total 75 tests (Passed: 75; Fails: 0; Errors: 0) (80.00 ms)
  Firefox 17.0 Mac OS: Run 25 tests (Passed: 25; Fails: 0; Errors 0) (80.00 ms)
  Safari 536.26.17 Mac OS: Run 25 tests (Passed: 25; Fails: 0; Errors 0) (33.00 ms)
  Chrome 27.0.1435.0 Mac OS: Run 25 tests (Passed: 25; Fails: 0; Errors 0) (38.00 ms)

Process finished with exit code 0
```

# TODO
* For Node, this should work with standard node streams
* Support for http request params when fetching via ajax
* More error handling
* Better support for Internet Explorer (I'm sure I have a Windows CD somewhere...)
