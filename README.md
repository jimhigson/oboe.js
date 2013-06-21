**Oboe.js** takes a fresh appraoch to AJAX for web applications by wrapping a progressive interface
arround https's standard request-response model. It glues a transport that sits 
**somewhere between streaming and downloading** onto to a **JSON parser that sits somewhere between SAX and
DOM**. It is small enough to be a [micro-library](http://microjs.com/#), doesn't have any external dependencies and 
doesn't care which other libraries you need it to speak to.

Oboe makes it really easy to start using json from a response before the ajax request completes; 
or even if it never completes.

# API

Oboe exposes only one globally available object, ```window.oboe```. You can start a new AJAX call and recieve a new Oboe 
instance by calling one of these methods:

```js
   oboe.doGet(    String url, [Function doneCallback(wholeResponse)])
   oboe.doPut(    String url, String body, [Function doneCallback(wholeResponse)])
   oboe.doPost(   String url, String body, [Function doneCallback(wholeResponse)])
   oboe.doDelete( String url, [Function doneCallback(wholeResponse)])
   
// methods also accept an options object:
   oboe.doPost({
      url: String
      body: Object|String
      complete: Function
   })   
```   

```doneCallback``` is passed the entire json when the response is complete.
Usually it is better to read the json one bit at a time than waiting for it to completely download so this parameter 
is optional.

The returned instance exposes three chainable methods:

```js
   .onFind(String pattern, Function callback(thingFound, String[] path))
```

```.onFind()``` lets our Oboe object know that we are interested in knowing when it finds JSON matching ```pattern```.
The patterns are for the most part standard [JSONPath](https://code.google.com/p/json-path/). 
When the pattern is matched the callback is fired with the matching object and a path describing where it was found.
   
```js
   .onPath(String pattern, Function callback(thingFound, String[] path))
```

```onPath()``` is the same as ```.onFind()``` except the callback is fired when the *path* matches, not when we have the
thing. For the same pattern this will always fire before ```.onFind()``` and might be used to get things ready for that call.

```js
   .onError(callback(Error e))
```

supply a callback for when something goes wrong 

## Pattern matching

Oboe's pattern matching is a variation on [JSONPath](https://code.google.com/p/json-path/). It supports these tokens:

`!` root json object   
`.`  path separator   
`foo` an element at name foo  
`*`  any element at any name  
`[2]`  the second element (of an array)  
`['foo']`  equivalent to .foo  
`[*]`  equivalent to .*  
`..` any number of intermediate nodes (non-greedy)

The pattern engine also supports 
[CSS-4 style node selection](http://www.w3.org/TR/2011/WD-selectors4-20110929/#subject)
using the dollar (```$```) symbol. See the [css4 example below](#css4-style-patterns) or take a look at 
[more example patterns](#more-example-patterns).  

# Why I made this

Early in 2013 I was working on complementing some Flash financial charts with a more modern 
html5/[d3](http://d3js.org) based web application.
The Flash app started by making http requests for a very large set of initial data. It took
a long time to load but once it was started the client-side model was so completely primed that it wouldn't need to 
request again unless the user scrolled **waaaay** into the past.

People hate waiting on the web so *naturally* I want my html5 app to be **light and nimble** and 
**load in the merest blink of an eye**. 
Instead of starting with one huge request I set about making lots of smaller ones just-in-time
as the user moves throughout the data.
This gave a big improvement in load times but also some new challenges.
 
Firstly, with so many small requests there is an increased http overhead. Worse, not having a model full of data 
early means the user is likely to need more quite soon. Over the mobile internet, *'quite soon'* might mean 
*'when you no longer have a good connection'*.

I made Oboe to break out of this big-small compromise. We requested relatively large data but 
started rendering as soon as the first datum arrived. We have enough for a screenfull when the request is 
about 10% complete. 10% into the download and the app is already fully interactive while the other 90%
steams silently in the background.

Sure, I could have implemented this using some kind of streaming framework ([socket.io](http://socket.io/), perhaps?) 
but then we'd have to rewrite the server-side and the legacy charts would have no idea how to connect to the new server.
It is nice to just have one, simple service for everything.

# Status

Just hitting v1.1.0 after some API changes. Patches and suggestions most welcome.
The project is designed in for easy testability and has [over 100 unit tests](/test/cases).

BSD licenced.
    
# More use cases

Oboe.js isn't specific to my application domain, or even to solving the big-small download compromise. Here are some
more use cases that I can think of: 

**Sarah** is sitting on a train using her mobile phone to check her email. The phone has almost finished downloading her 
inbox when her train goes under a tunnel. Luckily, her webmail developers used **Oboe.js** so instead of the request failing 
she can still read most of her emails. When the connection comes back again later the webapp is smart enough to just 
re-request the part that failed. 

**Arnold** is using a programmable stock screener.
The query is many-dimensional so screening all possible companies sometimes takes a long time. To speed things up, **Oboe.js**,
means each result can be streamed and displayed as soon as it is found. Later, he revisits the same query page. 
Since Oboe isn't true streaming it plays nice with the browser cache so now he see the same results instantly from cache.

**Janet** is working on a single-page modular webapp. When the page changes she wants to ajax in a single, aggregated json 
for all of her modules.
Unfortunately, one of the services being aggregated is slower than the others and under traditional
ajax she is forced to wait for the slowest module to load before she can show any of them. 
**Oboe.js** is better, the fast modules load quickly and the slow modules load later. 
Her users are happy because they can navigate page-to-page more fluidly and not all of them cared about the slow module anyway.

**John** is developing internally on a fast network so he doesn't really care about progressive loading. Oboe.js provides 
a neat way to route different parts of a json response to different parts of his application. One less bit to write.


# Examples

## Using objects from the JSON stream

Say we have a resource called things.json that we need to fetch over AJAX:
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

In our webapp we want to download the foods and show them in a webpage. We aren't showing the non-foods here so
we won't wait for them to be loaded: 

``` js
oboe.doGet('/myapp/things.json')
   .onFind('foods.*', function( foodObject ){
      // this callback will be called everytime a new object is found in the 
      // foods array. We probably should put this in a js model ala MVC but for
      // simplicity let's just use jQuery to show it in the DOM:
      var newFoodElement = $('<div>')
                              .text('it is safe to eat ' + foodObject.name)
                              .css('color', foodObject.colour)
                                    
      $('#foods').append(newFoodElement);
   });
```

## Listening for strings

Want to detect strings instead of objects? Oboe doesn't care about the types in the json so the syntax is just the same:

``` js
oboe.doGet('/myapp/things.json')
   .onFind('name', function( name ){
      jQuery('ul#names').append( $('<li>').text(name) );
   });
```

## Reacting before we have the whole object

As well as ```.onFind```, you can use ```.onPath``` to be notified when the path is first found, even though we don't yet 
know what will be found there. We might want to eagerly create elements before we have all the content to get them on the 
page as soon as possible.

``` js
var currentPersonElement;
oboe.doGet('//people.json')
   .onPath('people.*', function(){
      // we don't have the person's details yet but we know we found someone in the json stream. We can
      // eagerly put their div to the page and then fill it with whatever other data we find:
      currentPersonElement = jQuery('<div class="person">');
      jQuery('#people').append(personDiv);
   })
   .onPath('people.*.name', function( name ){
      // we just found out that person's name, lets add it to their div:
      currentPersonElement.append('<span class="name"> + name + </span>');
   })
   .onPath('people.*.email', function( email ){
      // we just found out this person has email, lets add it to their div:
      currentPersonElement.append('<span class="email"> + email + </span>');
   })
```

## Giving some visual feedback as a page is updating

If we're doing progressive rendering to go to a new page in a single-page web app, we probably want to put some kind of
indication on the page as the parts load.

Let's provide some visual feedback that one area of the page is loading and remove it when we have that json,
no matter what else we get at the same time 

I'll assume you already implemented a spinner
``` js
MyApp.showSpinner('#foods');

oboe.doGet('/myapp/things.json')
   .onFind('!.foods.*', function( foodThing ){
      jQuery('#foods').append('<div>').text('it is safe to eat ' + foodThing.name);
   })
   .onFind('!.foods', function(){
      // Will be called when the whole foods array has loaded. We've already wrote the DOM for each item in this array
      // above so we don't need to use the items anymore, just hide the spinner:
      MyApp.hideSpinner('#foods');
      // even though we just hid the spinner, the json might not have completely loaded. That's fine because we
      // don't need the non-foods to remove the spinner from the #foods part of the page. The food bit already has
      // the data that we need
   });
```

## The path passback

The callback is also given the path to the node that it found in the json. It is sometimes preferable to
register a wide-matching pattern and use the path parameter to decide what to do instead of

``` js
// json from the server side. Each top-level object is for a different module on the page.
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

// code to use this json:
oboe.doGet('http://mysocialsite.example.com/homepage.json')
   // note: bang means the root object so this pattern matches any children of the root
   .onFind('!.*', function( moduleJson, path ){
   
      // This callback will be called with every direct child of the root object but not
      // the sub-objects therein. Because we're coming off the root, the path argument
      // is a single-element array with the module name like ['messages'] or ['photos']
      var moduleName = path[0];
      
      My.App.getModuleCalled(moduleName).showNewData(moduleJson);
   });

```

## Css4 style patterns

Sometimes when downloading an array of items it isn't very useful to be given each element individually. 
It is easier to integrate with libraries like [Angular](http://angularjs.org/) if you're given an array 
repeatedly whenever a new element is concatenated onto it.
 
Oboe supports css4-style selectors and gives them much the same meaning as in the 
[proposed css level 4 selector spec](http://www.w3.org/TR/2011/WD-selectors4-20110929/#subject).

If a term is prefixed with a dollor, instead of the element that matched, an element further up the json tree will be
given instead to the callback. 

``` js

// the json from the server side looks like this:
{people: [
   {name:'Baz', age:34, email: 'baz@example.com'}
   {name:'Boz', age:24}
   {name:'Bax', age:98, email: 'bax@example.com'}}
]}

// we are using Angular and have a controller:
function PeopleListCtrl($scope) {

   oboe.doGet('/myapp/things.json')
      .onFind('$people[*]', function( peopleLoadedSoFar ){
         
         // This callback will be called with a 1-length array, a 2-length array, a 3-length array
         // etc until the whole thing is loaded (actually, the same array with extra people objects
         // pushed onto it) You can put this array on the scope object if you're using Angular and it will
         // nicely re-render your list of people.
         
         $scope.people = peopleLoadedSoFar;
      });
}      
```

Like css4 stylesheets, this can also be used to express a 'containing' operator.

``` js
oboe.doGet('/myapp/things.json')
   .onFind('people.$*.email', function( personWithAnEmailAddress ){
      
      // here we'll be called back with baz and bax but not Boz.
      
   });
```  

## Error handling

You use the error handler to roll back if there is an error in the json. Once there is an error, Oboe won't
give any further callbacks no matter what is in the rest of the json.
 
``` js
var currentPersonElement;
oboe.doGet('people.json')
   .onPath('people.*', function(){
      // we don't have the person's details yet but we know we found someone in the json stream, we can
      // use this to eagerly add them to the page:
      personDiv = jQuery('<div class="person">');
      jQuery('#people').append(personDiv);
   })
   .onPath('people.*.name', function( name ){
      // we just found out that person's name, lets add it to their div:
      currentPersonElement.append('<span class="name"> + name + </span>');
   })
   .onError(function( email ){
      // oops, that didn't go so well. instead of leaving this dude half on the page, remove them altogether
      currentPersonElement.remove();
   })
```
    
## More example patterns:
  
`!.foods.colour` the colours of the foods  
`person.emails[1]` the first element in the email array for each person  
`person.emails[*]` any element in the email array for each person  
`person.$emails[*]` any element in the email array for each person, but the callback will be
   passed the array so far rather than the array elements as they are found.  
`person` all people in the json, nested at any depth  
`person.friends.*.name` detecting friend names in a social network  
`person..email` email addresses anywhere as descendent of a person object  
`$person..email` any person in the json stream with an email address  
`*` every object, string, number etc found in the json stream  
`!` the root object (fired when the whole json is available, like JSON.parse())  

## Getting the most from oboe

Asynchronous parsing is better if the data is written out progressively from the server side
(think [node](http://nodejs.org/) or [Netty](http://netty.io/)) because we're sending
and parsing everything at the earliest possible opportunity. If you can, send small bits of the
json as soon as it is ready instead of waiting before everything is ready to start sending.

# Browser support

Browsers with Full support are:

* Recent Chrome
* Recent Firefoxes
* Internet Explorer 10
* Recent Safaris

Browsers with partial support:

* Internet explorer 8 and 9
 
Unfortunately, IE before version 10 
[doesn't provide any convenient way to read an http request while it is in progress](http://blogs.msdn.com/b/ieinternals/archive/2010/04/06/comet-streaming-in-internet-explorer-with-xmlhttprequest-and-xdomainrequest.aspx).
While streaming is possible to work into older Internet Explorers, it requires the server-side to write
out script tags which goes against Oboe's ethos of very simple streaming from standard REST services.

The good news is that in older versions of IE Oboe gracefully degrades,
it'll just fall back to waiting for the whole response to return, then fire all the events together.
You don't get streaming but it isn't any worse than if you'd have designed your code to non-streaming AJAX.


## Running the tests

If you want to do hack on Oboe you can build by just running Grunt but sooner or later you'll have to run the tests.

To build and run the tests you'll need:

* The [JsTestDriver](https://code.google.com/p/js-test-driver/) jar installed somewhere 
* [Grunt](http://gruntjs.com/) installed globally on your system
* Node
* Some kind of unix-like environment. On Windows, [cygwin](http://www.cygwin.com/) should do.

An (test/slowserver/tenSlowNumbers.js)[example streaming http server] to test against can be found in the [test dir](/test). Unfortunately,
JSTestDriver's proxying doesn't support streaming HTTP. To get arround this there is 
(test/slowserver/jstdProxy.js)[a small proxy] written in node that sits in front of JSTD.

To start the proxy, streaming server and jstd itself, run:

``` bash
cd test
./jstestdriver-serverstart
```

You should see output like this:
```
jstd will be started on port 4224 but connect browsers via the proxy on port 2442 eg by going to http://localhost:2442 and clicking capture 
The proxy is necessary for asynchronous http testing which will fail otherwise
creating proxy server on port 2442
routing table for proxy is {"localhost/stream":"127.0.0.1:4567","localhost/":"127.0.0.1:4224"}
slow number server started on port 4567
proxy started now capture some browsers!
setting runnermode QUIET
```

Then capture some browsers by going to http://localhost:2442 and clicking capture. If you aren't running
Windows and want some IEs to test try 
[here](http://osxdaily.com/2011/09/04/internet-explorer-for-mac-ie7-ie8-ie-9-free/).  
  
Finally, to run the tests, from a second terminal run:

``` bash
./build
```

If all goes well, you should get something like:

```
jimhigson ~/Sites/progressivejson ./build
no tests specified, will run all
building at Thu  6 Jun 2013 16:27:19 BST
Will run oboe json tests( all ) against dev
setting runnermode QUIET
Firefox: Reset
Firefox: Reset
Microsoft Internet Explorer: Reset
Microsoft Internet Explorer: Reset
Chrome: Reset
Chrome: Reset
......................................................................
......................................................................
......................................................................
......................................................................
........................................................
Total 336 tests (Passed: 335; Fails: 1; Errors: 0) (27284.00 ms)
  Microsoft Internet Explorer 10.0 Windows: Run 112 tests (Passed: 112; Fails: 0; Errors 0) (27284.00 ms)
  Chrome 28.0.1500.37 Mac OS: Run 112 tests (Passed: 112; Fails: 0; Errors 0) (6437.00 ms)
  Firefox 21.0 Mac OS: Run 112 tests (Passed: 112; Fails: 0; Errors 0) (6130.00 ms)
Running "concat:oboe" (concat) task
File "dist/oboe.concat.js" created.

Running "wrap:export" (wrap) task
Wrapped files created in ".".

Running "uglify:build" (uglify) task
File "dist/oboe.min.js" created.

Done, without errors.
Will run oboe json tests( all ) against concat
setting runnermode QUIET
Firefox: Reset
Firefox: Reset
Chrome: Reset
Chrome: Reset
......................................................................
......................................................................
......................Microsoft Internet Explorer: Reset
Microsoft Internet Explorer: Reset
................................................
.................................
Total 243 tests (Passed: 243; Fails: 0; Errors: 0) (1007.00 ms)
  Microsoft Internet Explorer 10.0 Windows: Run 81 tests (Passed: 81; Fails: 0; Errors 0) (1007.00 ms)
  Chrome 28.0.1500.37 Mac OS: Run 81 tests (Passed: 81; Fails: 0; Errors 0) (683.00 ms)
  Firefox 21.0 Mac OS: Run 81 tests (Passed: 81; Fails: 0; Errors 0) (357.00 ms)
Will run oboe json tests( all ) against minified
setting runnermode QUIET
Firefox: Reset
Firefox: Reset
Chrome: Reset
Chrome: Reset
Microsoft Internet Explorer: Reset
Microsoft Internet Explorer: Reset
......................................................................
......................................................................
......................................................................
.................................
Total 243 tests (Passed: 243; Fails: 0; Errors: 0) (1079.00 ms)
  Microsoft Internet Explorer 10.0 Windows: Run 81 tests (Passed: 81; Fails: 0; Errors 0) (1079.00 ms)
  Chrome 28.0.1500.37 Mac OS: Run 81 tests (Passed: 81; Fails: 0; Errors 0) (696.00 ms)
  Firefox 21.0 Mac OS: Run 81 tests (Passed: 81; Fails: 0; Errors 0) (402.00 ms)
```

## Use as a stream in node.js

**Clarinet** supports use as a node stream. This hasn't been implemented in
Oboe but it should be quite easy to do.

