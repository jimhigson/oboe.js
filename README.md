**Oboe.js** is an asynchronous, progressive json parser for ajax built on top of
[clarinet](https://github.com/dscape/clarinet).
It provides an intuitive interface to read the ajax responsewhile the request is still
ongoing and gzips down to about **3.8k**.

# Purpose

The aim of Oboe is to let you start using your data as early as possible with as simple
an interface as is possible. It works with jQuery, Angular, d3 or any other library you might
happen to be using.

Your web application probably makes the user wait longer for io than anything else. However,
during much of the waiting there will already be enough data loaded in the browser to show
things on the page. This is especially true on mobile networks where requests can sporadically stall
or cut out halfway.

Think of it as progressive html rendering for the ajax age.

# Use cases

**Sarah** is sitting on a train using her mobile phone to check her email. The phone has almost finished downloading her 
inbox when her train leaves reception. Luckily, her webmail developers used **Oboe.js** so instead of the request failing 
she can still read most of her emails.

**Arnold** is using a programmable stock screener.
The query is many-dimensional so screening all possible companies sometimes takes a long time. To speed things up, **Oboe.js**,
means each result can be streamed and displayed as soon as it is found. Later, he revisits the same query page. Unlike other methods 
of streaming, Oboe's ajax-based stream is compatible with his browser cache so now he sees the same results straight away.

**Janet** is working on a single-page modular webapp. When the page changes she wants to ajax in a single, agregated json 
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

# Status

Oboe is still in development. Nevertheless, it is already
[quite](src/test/cases/oboeTest.js) [well](src/test/cases/jsonPathTest.js)
tested and has proven stable enough for production applications. The 
codebase is small and hackable and it works. Try it, let me know how
it goes.

Old browsers might not be so well supported but it should be easy enough to branch and 
build support in if you need it.

Oboe used to be called **Progressive.js** until I noticed that a project 
[already exists with that name](https://github.com/jamesallardice/Progressive.js). D'oh! 

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
   .onFind('foods.*', function( foodThing ){
      // this callback will be called everytime a new object is found in the 
      // foods array. In this example we just use jQuery to set up some simple DOM:
      jQuery('#foods')
         .append('<div>')
            .text('it is safe to eat ' + foodThing.name)
            .style('color', foodThing.colour)
   });
```

## listening for strings in the json stream

Want to listen to strings instead of objects? The syntax is just the same:

``` js
oboe.fetch('/myapp/things.json')
   .onFind('name', function( name ){
      jQuery('#things').append('<li>').text(name);
   });
```

## Using Css4 style matching to combine with engines like scope from [Angular](http://angularjs.org/) or [Soma](http://soundstep.github.io/soma-template/)

Sometimes you are downloading an array of items but it isn't very useful to be given each individual item
from the array individually. It is easier to integrate with these frameworks if you're given the array. 
Oboe supports css4-style selectors and gives them much the same meaning as in the proposed css4 selector
spec. The dollar can be used to get ancestor objects to the object that is matched.

``` js
oboe.fetch('/myapp/things.json')
   .onFind('$people[*]', function( peopleLoadedSoFar ){
      
      // This callback will be called with a 1-length array, a 2-length array, a 3-length array
      // etc until the whole thing is loaded (actually, the same array with extra people objects
      // pushed onto it) You can put this on the scope object if you're using Angular etc and it will
      // nicely re-render your list of people.
      
   });
```
  

## providing some feedback as a page is updating

Let's provide some visual feedback that one area of the page is loading and remove it when we have just that json,
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

## Listening for paths when they are first found without waiting for the objects

As well as ```.onFind```, you can use ```.onPath``` to be notified when the path is first matched but we don't yet know what will
be there. We might want to eagerly create elements before we have all the content to get them on the page as soon as \
possible.
``` js
var currentPersonDiv;
oboe.fetch('//people.json')
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
   .onPath('people.*.email', function( email ){
      // we just found out that person's name, lets add it to their div:
      currentPersonDiv.append('<span class="email"> + email + </span>');
   })
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
   .onFind('!.*', function( moduleJson, path ){
      // This callback will be called with every direct child of the root object but not
      // the sub-objects therein. Because we're coming off the root, the path argument
      // is a single-element array with the module name like ['messages'] or ['photos']
      My.App.getModuleCalled(path[0]).dataLoaded(moduleJson);
   });

```

# Pattern matching

Oboe's pattern matching is a subset of [JSONPath](https://code.google.com/p/json-path/)
and closely resembles the normal syntax for descending into sub-objects parsed
from Json.

`!` root json object   
`.`  path separator   
`foo` an element at name foo  
`*`  any element at any name  
`[2]`  the second element (of an array)  
`[*]`  equivalent to .*  
`..` any number of intermediate nodes (non-greedy)

## CSS-4 style selectors

**Oboe**'s pattern matching engine also supports 
[CSS-4 style node selection](http://www.w3.org/TR/2011/WD-selectors4-20110929/#subject)
using the dollar ```$``` symbol, with much the same meaning as in css4. 

Like css, by default, a selector like ```foo.bar``` applies to the last node in the chain
(in this case bar). Using ```$```, the selector ```$foo.bar``` matches the same elements, but
replaces the element at foo rather than bar. This is useful especially when selecting array
elements ```!.$someArray[*]``` because often it is useful to be repeatedly given the same
array as it is added to rather than the individual elements.   

## Some example patterns:

`!.foods.colour` the colours of the foods  
`person.emails[1]` the first element in the email array for each person  
`person.emails[*]` any element in the email array for each person  
`person.$emails[*]` any element in the email array for each person, but the callback will be
   passed the array so far rather than the array elements as they are found.  
`person` all people in the json  
`person.friends.*.name` detecting friend names in a social network  
`person..email` email addresses anywhere as descendent of a person object  
`$person..email` any person in the json stream with an email address  
`*` every object, string, number etc found in the json stream  
`!` the root object (fired when the whole json is available, like JSON.parse())  

## Getting the most from oboe

Asynchronous parsing is better if the data is written out progressively from the server side
(think [node](http://nodejs.org/) or [Netty](http://netty.io/)) because we're *sending
and parsing* everything at the earliest possible oppotunity. If you can, send small bits of the
json as soon as it is ready instead of waiting before everything is ready to start sending.

## Use as a stream in node.js

**Clarinet** supports use as a node stream. This hasn't been implemented in
Oboe but it should be quite easy to do.

# TODO
* For Node, this should work with standard node streams
* Support for http request params when fetching via ajax
* More error handling
* Better support for Internet Explorer (I'm sure I have a Windows CD somewhere...)
