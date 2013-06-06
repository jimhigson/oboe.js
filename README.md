**Oboe.js** is an asynchronous, progressive json parser for web applications built on top of
[clarinet](https://github.com/dscape/clarinet) and streaming AJAX. 
It is pure transport layer without any external dependencies;
it doesn't care if you are using jQuery, Angular, d3.js or raw Javascript and integrates neatly 
with any of those appraoches.

# Why I made it

Early in 2013 I was working on an applicatin for html5 financial charting, replacing some legacy charts implemented in 
Flash. The old charts made huuuuge requests to the server side to get their initial data. It was a trade-of. They took
an overly long time to load but once loaded the client was so full of data that the app rarely needed to get more.

Naturally, I wanted my html5 version light and nimble so I set about making lots of smaller requests.
This went ok but with so many small requests there is an increased http overhead and not having so much data early on means
the user is more likely to need more quite soon, so they see a spinner. It was a compromise either way.

I made Oboe to break out of the big-small compromise. We got the app requesting relatively large data but 
starting rendering when only a screenfull is loaded. 'A screenfull' roughly equates to the response being about 10% 
downloaded. The chart was already fully interactive as the remaining 90% flowed into the client in the background.

Sure, I could have implemented this using some kind of streaming framework like socket.io but then we'd have 
to rewrite the server-side and the legacy charts wouldn't know how to connect to the new server. It is nice to just have
one service for everything. Streaming servers are also more complex to write than standard request-response ones and, 
anyway, we didn't really need fully featured streaming, just progressive version of request-response.

Oboe works over standard AJAX, no server-side changes were needed to get the streaming magic going. I made it into
a generic library and put it here on Github.
    
# More use cases

As well as my use case above, here are some more I can think of:

**Sarah** is sitting on a train using her mobile phone to check her email. The phone has almost finished downloading her 
inbox when her train leaves reception. Luckily, her webmail developers used **Oboe.js** so instead of the request failing 
she can still read most of her emails.

**Jack** has a RESTFUL JSON data service and wants to implement some streaming to his webpage. ***Oboe.js*** isn't a full blown 
streaming solution but for short-lived streams (streams that don't continue indefinately) it does the same thing.
Oboe streaming has the advantage that the http traffic is still valid REST so he can provide just one endpoint and the rest of his 
technology stack can use the service as a normal download without understanding how to stream.
Debugging is easier than with a full-blown streaming framework too, just like any other REST service he can check out the 
data by visiting the URL in his browser and checking out what he gets.

**Arnold** is using a programmable stock screener.
The query is many-dimensional so screening all possible companies sometimes takes a long time. To speed things up, **Oboe.js**,
means each result can be streamed and displayed as soon as it is found. Later, he revisits the same query page. Unlike other methods 
of streaming, Oboe's ajax-based stream is compatible with his browser cache so now he sees the same results straight away.

**Janet** is working on a single-page modular webapp. When the page changes she wants to ajax in a single, aggregated json 
for all of her modules.
Unfortunately, one of the services being aggregated is slower than the others and under traditional
ajax she is forced to wait for the slowest module to load before she can update any of the page. 
After switching to **Oboe.js**, the fast modules load quickly and the slow modules load later. 
Her users are happy because they can navigate page-to-page more fluidly and not all of them cared about the slow module anyway.

**Michael** is writing a scrollable timeline data visualisation using [d3](http://d3js.org/). His json contains data for 
200 events but until the user scrolls only the most recent 20 are visible. He doesn't want to wait for all 200 to load 
before showing the starting 20. With **Oboe.js** the data takes 90% less time to display and his users are happy to not 
be waiting.

**John** is developing internally on a fast network so he doesn't really care about progressive parsing. Oboe.js provides 
a neat way to route different parts of a json response to different parts of his application. One less thing to write.

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
but since we're ignoring the non-foods we'll show the foods as soon as we have them: 

``` js
oboe.fetch('/myapp/things.json')
   .onFind('foods.*', function( foodThing ){
      // this callback will be called everytime a new object is found in the 
      // foods array. Use jQuery to set up some simple DOM:
      jQuery('#foods')
         .append('<div>')
            .text('it is safe to eat ' + foodThing.name)
            .style('color', foodThing.colour)
   });
```

## listening for strings in the json stream

Want to find the strings instead of objects? Oboe doesn't care about the types in the json so the syntax is just the same:

``` js
oboe.fetch('/myapp/things.json')
   .onFind('name', function( name ){
      jQuery('#things').append('<li>').text(name);
   });
```

## Using Css4 style matching to combine with engines like [Angular](http://angularjs.org/) or [Soma](http://soundstep.github.io/soma-template/)

Sometimes when downloading an array of items it isn't very useful to be given each element individually. 
It is easier to integrate with libraries like Angular if you're passed an array of data 
over again whenever a new element is appended to it.
 
For this reason Oboe supports css4-style selectors and gives them much the same meaning as in the 
[proposed css level 4 selector spec](http://www.w3.org/TR/2011/WD-selectors4-20110929/#subject).

If a term is prefixed with a dollor, instead of the element that matched, an element further up the json tree can be
passed instead to the callback. 

``` js

// the json from the server side looks like this:
{people: [
   {name:'Baz', age:34, email: 'baz@example.com'}
   {name:'Boz', age:24}
   {name:'Bax', age:98, email: 'bax@example.com'}}
]}

// we are using Angular and have a controller:
function PeopleListCtrl($scope) {

   oboe.fetch('/myapp/things.json')
      .onFind('$people[*]', function( peopleLoadedSoFar ){
         
         // This callback will be called with a 1-length array, a 2-length array, a 3-length array
         // etc until the whole thing is loaded (actually, the same array with extra people objects
         // pushed onto it) You can put this array on the scope object if you're using Angular and it will
         // nicely re-render your list of people.
         
         $scope.people = peopleLoadedSoFar;
      });
}      
```

Like css4, this can also be used to form a 'containing' operator.

``` js
oboe.fetch('/myapp/things.json')
   .onFind('people.$*.email', function( personWithAnEmailAddress ){
      
      // here we'll be called back with baz and bax but not Boz.
      
   });
```
  
## Listening for paths when they are first found without waiting for the objects to be parsed

As well as ```.onFind```, you can use ```.onPath``` to be notified when the path is first found, even though we don't yet 
know what will be found there. We might want to eagerly create elements before we have all the content to get them on the 
page as soon as possible.

``` js
var currentPersonDiv;
oboe.fetch('//people.json')
   .onPath('people.*', function(){
      // we don't have the person's details yet but we know we found someone in the json stream, we can
      // use this to eagerly add their div to the page:
      personDiv = jQuery('<div class="person">');
      jQuery('#people').append(personDiv);
   })
   .onPath('people.*.name', function( name ){
      // we just found out that person's name, lets add it to their div:
      currentPersonDiv.append('<span class="name"> + name + </span>');
   })
   .onPath('people.*.email', function( email ){
      // we just found out that person's email, lets add it to their div:
      currentPersonDiv.append('<span class="email"> + email + </span>');
   })
```

## providing some visual feedback as a page is updating

If we're doing progressive rendering to go to a new page in a single-page web app, we probably want to put some kind of
indication on the page as the parts load.

Let's provide some visual feedback that one area of the page is loading and remove it when we have that json,
no matter what else we get at the same time 

I'll assume you already implemented a spinner
``` js
My.App.showSpinner('#foods');

oboe.fetch('/myapp/things.json')
   .onFind('!.foods.*', function( foodThing ){
      jQuery('#foods').append('<div>').text('it is safe to eat ' + foodThing.name);
   })
   .onFind('!.foods', function(){
      // Will be called when the whole foods array has loaded. We've already wrote the DOM for each item in this array
      // above so we don't need to use the items anymore, just hide the spinner:
      My.App.hideSpinner('#foods');
      // even though we just hid the spinner, the json might not have completely loaded. That's fine because we
      // don't need the non-foods to remove the spinner from the #foods part of the page. The food bit already has
      // the data that we need
   });
```

## Using the path passback

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
oboe.fetch('http://mysocialsite.example.com/homepage.json')
   // note: the bang operator refers to the root object.
   .onFind('!.*', function( moduleJson, path ){
   
      // This callback will be called with every direct child of the root object but not
      // the sub-objects therein. Because we're coming off the root, the path argument
      // is a single-element array with the module name like ['messages'] or ['photos']
      var moduleName = path[0];
      
      My.App.getModuleCalled(moduleName).showNewData(moduleJson);
   });

```

## Error handling

You use the error handler to roll back if there is an error in the json. Once there is an error, Oboe won't
give any further callbacks no matter what is in the rest of the json.
 
``` js
var currentPersonDiv;
oboe.fetch('people.json')
   .onPath('people.*', function(){
      // we don't have the person's details yet but we know we found someone in the json stream, we can
      // use this to eagerly add them to the page:
      personDiv = jQuery('<div class="person">');
      jQuery('#people').append(personDiv);
   })
   .onPath('people.*.name', function( name ){
      // we just found out that person's name, lets add it to their div:
      currentPersonDiv.append('<span class="name"> + name + </span>');
   })
   .onError(function( email ){
      // oops, that didn't go so well. instead of leaving this dude half on the page, remove them altogether
      currentPersonDiv.remove();
   })
```

# Pattern matching

Oboe's pattern matching is a variation on [JSONPath](https://code.google.com/p/json-path/). It supports these tokens:

`!` root json object   
`.`  path separator   
`foo` an element at name foo  
`*`  any element at any name  
`[2]`  the second element (of an array)  
`[*]`  equivalent to .*  
`..` any number of intermediate nodes (non-greedy)

**Oboe**'s pattern matching engine also supports 
[CSS-4 style node selection](http://www.w3.org/TR/2011/WD-selectors4-20110929/#subject)
using the dollar (```$```) symbol.    

## Some example patterns:

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
out script tags which goes against Oboe's ethos of very simple streaming over standard REST semantics.

In these older versions of IE Oboe gracefully degrades,
it'll just fall back to waiting for the whole response to return, then fire all the events together.
You don't have to change your code for the older browsers and it'll work like standard Ajax.


## Running the tests

If you want to do hack on Oboe you can build by just running Grunt but sooner or later you'll have to run the tests.

To build and run the tests you'll need:

* The [JsTestDriver](https://code.google.com/p/js-test-driver/) jar installed somewhere 
* [Grunt](http://gruntjs.com/) installed globally on your system
* Node
* Some kind of unix-like environment. On OSX or Linux you've got this already. On Windows, [cygwin](http://www.cygwin.com/) should do.

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
(http://osxdaily.com/2011/09/04/internet-explorer-for-mac-ie7-ie8-ie-9-free/)[here].  
  
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

# TODO
* For Node, this should work with standard node streams
* Oboe should also use standard js promises
* Support for http request params when fetching via ajax
* More error handling
