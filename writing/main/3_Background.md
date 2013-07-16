

Background
==========

**background should be 2-10 pages**

Some high-level stuff about webapps and where processing is done
-----------------------------------------

Ie, front-end client-side, front-end server-side.

[!A webapp running with a front end generated partially on server and partially on client side](images/placeholder)

Separated from services by http calls regardless.

Contrast: mainframes, thin clients, X11, Wayland, PCs. NextCubes (CITE: get from old dis)

Next is closest pre-runner to current web architecture.

Twitter: Moving from client to server for performance. Reduce load times to 1 5th of what they were
previously [https://blog.twitter.com/2012/improving-performance-twittercom]

Give static page (fairly basic but functional), then load js in the background.

However, with Node don't have to reengineer to move from client to server. 


SOA
---

REST/WebServices (WSDL etc)

What is a rest client in this context (a client library)

Marshalling/ de-marshalling. Benefits and the problems that it causes.
Allows one model to be written out to XML or JSON

Big/small message problem and granularity. With small: http overhead. With big: not all may be needed.

Javascript as mis-understood language (CITE: Crockford) - list features available.

(correctly, ECMAScript) Misleadingly named after Java as a marketing ploy when Java was a new technology
(CITE) - in true more similar to Scheme or Lisp but with Java or C inspired syntax.  


Anatomy of a SOA client
------------------------

First stage after getting a resource is usually to programmatically extract the interesting part from it.
This is usually done via calls in the programming language itself, for example by de-marshaling the stream
to domain objects and then calling a series of getters to narrow down to the interesting parts.

This part has become such a natural component of a workflow that it is barely noticed that it is happening.
In an OO language, the extraction of small parts of a model which, in the scope of the current concern are of 
interest is so universal that it could be considered the sole reason that getters exist.

However subtly incorporated it has become in the thinking of the programmer, we should note that this is a 
construct and only one possible way of thinking regarding identifying the areas of current interest in a 
wider model.

```java
// an example programmatic approach to a domain model interrogation under Java

List<Person> people = myModel.getPeople();
String firstPersonsSurname = people.get(0).getSurname();

```

One weakness of this imperative, programatic inspection model is that, once much code is written to 
interogate models in this way,
the interface of the model becomes increasingly expensive to change as the code making the inspections
becomes more tightly coupled with the thing that it is inspecting. Taking the above example, if the
model were later refactored such that the concepts of firstName and surName were pulled from the Person
class into an extracted Name class, because the inspection relies on a sequence of calls made directly 
into domain objects, the code making the query would also have to change. 

I believe that this coupling defies Agile methods of programming. Many Java IDEs provide tools that would
offer to automate the above extraction into a Name class, creating the new class and altering the existing
calls. While reducing the pain, if we accept the concept as I stated in the [Introduction] that the code
should not be seen as a static thing in which understanding is 

More declarative syntaxes exist which are flexible enough that
the declarative expressions may still apply as the underlying model is refactored. Whilst not applicable
to use in general purpose programming, XPATH is an example of this. As an analogue of the Java situation above,
Given the following XML:

```xml
<people>
   <person>
      <surname>Bond</surname>
   </person>
</people>
```

The XPath //person[0]//surname//text() (JIM/ME - CHECK THIS!) would continue to identify the correct part of the
resource without being updated after the xml analogue of the above Java Name refactor:

```xml
<people>
   <person>
      <name>
         <surname>Bond</surname>
      </name>
   </person>
</people>
```

A few models exist which do not follow this pattern such as XPATH. However, these are useful
in only a small domain.

Xpath is able to express identifiers which often survive refactoring because XML represents a tree, hence we
can consider relationships between entities to be that of contains/contained in (also siblings?). 
In application of XML, in the languages that we build on top of XML, it is very natural to consider all
elements to belong to their ancestors. Examples are myriad, for example consider a word count in a book
written in DOCBook format - it should be calculable without knowing if the book is split into chapters 
or not since this is
a concept internal to the oranisation of the book itserlf nd not soemthing that a querier is likely
to find interesting - if this must be considered the structure acts as barrier to information 
rather than enabling the information's delivery. Therefore, in many cases the exact location of a piece of information
is not as important as a more general location of x being in some way under y.

This may not always hold. A slightly contrived example might be if we were representing a model of partial
knowledge:

```xml
<people>
   <person>
      <name>
         <isNot><surname>Bond</surname></isNot>
      </name>
   </person>
</people>
```  
  
CSS. Meant for presentation of HTML, but where HTML markup is semantic it is a selector of the *meaning
of elements* for the sake of applying a meaningful presentation more so than a selector of arbitrary
colours and positions on a screen.
  
Unlike XML, in the model created by most general programming languages, there is no requirement for the
data to be tree shaped. Graph is ok. This make this slighlty harder but nontheless attempts have been made.

Linq. (CITEME) 
 

Parsing: SAX and Dom
--------------------

Why sax is difficult

DOM parser can be built on a SAX parser


State of http as a streaming technology
---------

Dichotamy between streaming and downloading in the browser for downloading data. But not for html (progressive rendering)
or images (progressive PNGs and progressive JPEGs) 

Lack of support in browser
Long poll - for infrequent push messages. Must be read 
Writing script tags

All require server to have a special mode. Encoding is specific to get arround restrictions.

JsonPath in general tries to resemble the javascript use of the json language nodes it is detecting.

```javascript

// an in-memory person with a multi-line address:
let person = {
   name: "...",
   address: [
      "line1",
      "line2",
      "line3"
   ]
};


// in javascript we can get line two of the address as such:
let addresss = person.address[2]

// the equivalent jsonpath expression is identical:
let jsonPath = "person.address[2]"

```

What 'this' (context) is in javascript. Why not calling it scope.

The web browser as REST client
-----------------------------

Browser incompatability mostly in presentation layer rather than in scripting languages.

Language grammars rarely disagree, incompatability due to scripting is almost always due to the APIs
presented to the scripting language rather than the language itself. 
   
Progressive UI
-------------   
   
Infinitely scrolling webpages. Need a way to 'pull' information, not just push if reacting to scrolling.
Use oboe with websockets? Eg, ebay home page, Facebook. Adv of infinate scroll is page loads quickly and
most people won't scroll very far so most of the time have everything needed right away.

State of rest: Json and XML
------------

Json is very simple, only a few CFGs required to describe the language (json.org) - this project is listed there!

Javascript
----------

Javascript: not the greatest for 'final' elegant presentation of programming. Does allow 'messy' first drafts
which can be refactored into beautiful code. Ie, can write stateful and refactor in small steps towards being
stateless. An awareness of beautiful languages lets us know the right direction to go in. An ugly language lets
us find something easy to write that works to get us started.
Allows a very sketchy program to be written, little more than a programming scratchpad.

Without strict typing, hard to know if program is correct without running it. In theory (decidability) and in 
practice (often find errors through running and finding errors thrown). Echo FPR: once compiling, good typing
tends to give a reasonable sureness that the code is correct.

Explain var/function difference, ie construct pluck and explain why var keyOf = partial(pluck)
is declared with a var and not a function, why some prefer to do always via
. operator can't be made into a function with (.) or similar and so has to be wrapped in a function is a
less direct manner.
Unfortunately, can make it difficult for a reader to know the types involved. For example, on seeing:
```var matchesJsonPath = jsonPathCompiler( pattern )``` there is no way (other than examining the source or
doucmentation of the function being called) to know that this is a higher order function and will 
return another function to be assigned as matchesJsonPath. 

C-style brackets around all function arguments hampers a natural expression of functional style code.
For example, this requires a lot of arguments and without checking of function airity, it is easy to
misplace a comma or closing bracket. 

``` 
function map(fn, list){
   if( !list ) {
      return emptyList;
   } else {
      return cons(fn(head(list)), map(fn,tail(list)));
   }
}
```



Node
----

> Streams in node are one of the rare occasions when doing something the fast way is actually easier. 
> SO USE THEM. not since bash has streaming been introduced into a high level language as nicely as 
> it is in node."
[high level node style guide](https://gist.github.com/2401787)

> node Stream API, which is the core I/O abstraction in Node.js (which is a tool for I/O) is 
> essentially an abstract in/out interface that can handle any protocol/stream that also happens to 
> be written in JavaScript.
[http://maxogden.com/a-proposal-for-streaming-xhr.html]

Bash streams a powerful abstraction easily programmed for linear streaming. Node more powerful, allows
a powerful streaming abstraction which is no more complex to program than a javascript webapp front end.
Essentially a low-level interface to streaming such as unix sockets or tcp connections. 

Streams in node are the observer pattern. Readable streams emit 'readable' events when they have some data
to be read and 'end' events when they are finished. Apart from error handling, so far as reading is concerned,
that is the extent of the API.

Although the streams themselves are stateful, because they are based on callbacks it is entirely possible to 
use them from a component of a javascript program which is wholly stateless.



Using Node's http module provides a stream but handles setting headers, putting the method otu etc.

What Node is
V8. Fast. Near-native. JIT.
Why Node perhaps is mis-placed in its current usage as a purely web platform "the aim is absolutely fast io".
This happened because web specialist programmers took it up first
 
Why Node is significant
* Recognises that most tasks are io-bound rather than CPU bound. Threaded models good for CPU-bound in the main.

How Node is different

Criticisms of Node. Esp from Erlang etc devs. 

Node's standard stream mechanisms




Browser
-------

*XmlHttpRequest* (XHR)

Xhr2 and the .onprogress callback.
polling responseText while in progress
* why doesn't work in IE (built on an activeX object that provides buffering)

Older style of javascript callback. Assign a listener to onprogress, not call an add listener method
means can only have one listener.

> While the request entity body is being transmitted and the upload complete flag is unset, queue a task 
> to fire a progress event named progress on the XMLHttpRequestUpload object about every 50ms or for every 
> byte transmitted, whichever is least frequent.
[w3c, XHR Working Draft](http://www.w3.org/TR/XMLHttpRequest/)

Websockets
More like node
Can connect to any protocol (as always, easier to program if text based but can do binary)
Can use to do http but not sufficient advantage over using 
 


