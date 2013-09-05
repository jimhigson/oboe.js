Background
==========

<!---
background should be 2-10 pages

That's 1,000 to 5,000 words. (500 per page)

Or, 666 to 3,333 (333 per page)

 * introduces the reader to the problem domain or application area
 * ...the context in which the project takes place
 * principles and techniques that will be applied or discussed
    * prior art
    * what out there is being popularly used?
   
--->

In fact, this is exactly how web browsers are implemented. However, this
progressive use of http is hardwired into the browser engines rather
than exposing an API suitable for general use and as such is treated as
something of a special case specific to web browsers and has not so far
seen a more general application. I wish to argue that a general
application of this technique is viable and offers a worthwhile
improvement over current common methods.

The above problem has many analogues and because REST uses standard web
semantics applies to much more than just automated web surfing. Indeed,
as the machine readability of the data increases, access early can be
all the more beneficial since decisions to terminate the connection may
be made. Example: academic's list of publications, then downloading all
the new ones.

State of the web
----------------

Ie, front-end client-side, front-end server-side.

[!A webapp running with a front end generated partially on server and
partially on client side](images/placeholder)

Separated from services by http calls regardless.

Contrast: mainframes, thin clients, X11, Wayland, PCs. NextCubes (CITE:
get from old dis). When timbl appeared at the olympics at a nextcube
having invented the web, the next os was more of a forerunner for the
web than just the platform it was implemented on.

Next is closest pre-runner to current web architecture.

Twitter: Moving from client to server for performance. Reduce load times
to 1 5th of what they were previously
[https://blog.twitter.com/2012/improving-performance-twittercom]

Give static page (fairly basic but functional), then load js in the
background.

However, with Node don't have to reengineer to move from client to
server.

Big/small message problem and granularity. With small: http overhead.
With big: not all may be needed.

Javascript as mis-understood language (CITE: Crockford) - list features
available.

(correctly, ECMAScript) Misleadingly named after Java as a marketing
ploy when Java was a new technology (CITE) - in true more similar to
Scheme or Lisp but with Java or C inspired syntax.

Where the delays are in a web application
-----------------------------------------

Even complex apps are not finding a bottleneck in javascript execution
times.

-   DOM manipulation
-   rendering
-   most significant: waiting for stuff. Going from js taking 10ms per
    frame to 1ms per frame will have zero difference because it is
    already meeting the frame rate. Might help slower devices if
    performance was marginal before

> The user does something, then the app responds visually with immediacy
> at 30 frames per second or more, and completes a task in a few hundred
> milliseconds. As long as an app meets this user goal, it doesn’t
> matter how big an abstraction layer it has to go through to get to
> silicon.

http://www.sencha.com/blog/5-myths-about-mobile-web-performance/?utm\_source=feedburner&utm\_medium=feed&utm\_campaign=Feed%3A+extblog+%28Ext+JS+Blog%29\#date:16:00

Browsers and REST; http and streaming
-------------------------------------

Http is essentially a thinly-wrapped text response around some usually
text-based (but sometimes binary) data. It may give the length of the
content as a header, but is not obliged to. It supports an explicitly
chunked mode, but even the non-chunked mode may be considered as a
stream. For example, a program generating web pages on the server side
might choose to use chunking so that the browser is better able to
choose when to re-render during the progressive display of a page
[@perceptionHttpChunkedSpeed] but this is optional and without these
hints progressive rendering will still take place.

The requesting of http from Javascript, commonly termed AJAX, was so
significant a technique in establishing the modern web application
architecture that it is often taken as being a synonym for
Javascript-heavy web pages. Although an acronym for Asynchronous
Javascript and XML, for data services designed with delivery to
client-side web applications in mind JSON is almost exclusively
preferred to XML and the term is used without regard for the data format
of the response (the unpronounceable *AJAJ* never took off). During the
'browser war' years adding non-standard features was a common form of
competition between authors; following this pattern Internet Explorer
originally made AJAX possible by exposing Microsoft's Active X *Xml Http
Request*, or XHR, object to Javascript programmers. This was widely
copied as functional equivalents were added to all major browsers and
the technique was eventually formalised by the W3C[@xhrWorkingDraft].
What followed was a period of stagnation for web browsers. HTML4 reached
W3C Recommendation status in 2001 but having subsequently found several
evolutionary dead ends such as XHTML, the developer community would see
no major updates until HTML5 started to gather pace some ten years
later. In this context the web continued to rapidly mature as an
application platform and AJAX programming inevitably overtook the
original XHR specification, browser vendors again adding their own
proprietary extensions to compensate.

Given this backdrop of non-standard extensions and lagging
standardisation, abstraction layers predictably rose in popularity.
These layers competed on developer ergonomics with the popular jQuery
and Prototype.js promoting themselves respectively as *"do more, write
less"* and *"elegant APIs around the clumsy interfaces of Ajax"*. JSON
being a subset of Javascript, web developers barely noticed their
privileged position whereby the serialisation of their data format
mapped exactly onto the basic types of their programming language. As
such there was never any confusion as to which exact object structure to
de-serialise to. If this seems like a small advantage, contrast with the
plethora of confusing and incompatible representations of JSON output
presented by the various Java JSON parsers; JSON's Object better
resembles Java's Map than Object and the confusion between JSON null,
Java null, and Jackson's NullNode[^1] is a common cause of errors.
Endowed with certainty regarding deserialisation, JSON parsers could be
safely integrated directly into AJAX libraries. This provided a call
style while working with remote resources so streamlined that it
requires hardly any additional effort.

~~~~ {.javascript}
jQuery.ajax('http://example.com/people.json', function( people ) {

   alert('the first person is called ' + people[0].name);

});
~~~~

HTML5 is better thought of as an umbrella term for the renewal of the
specification of many related technologies rather than referring
primarily to the HTML markup format.

the HTML5 effort to bring official web standards up to date with. Taking
the 'tarmaced goat path' approach.\
XHR2 spec was eventually

Given the emergence of the web as a popular means of application
development and given that the web has only http available as a
transport, a range of techniques have been developed for streaming
transports to client-side logic by building on top of http. These
approaches dichotomously split http usage into downloading and
streaming, so that a wholly

Dichotamy between streaming and downloading in the browser for
downloading data. But not for html (progressive rendering) or images
(progressive PNGs and progressive JPEGs).

Also progressive SVGs. [^2]

Lack of support in browser Long poll - for infrequent push messages.
Must be read Writing script tags

All require server to have a special mode. Encoding is specific to get
around restrictions.

Http 1.1 provides a mechanism for Byte Serving via the Accepts-Ranges
header [http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html\#sec14.5]
which can be used to request any contiguous part of a response rather
than the whole. Common in download managers but not REST clients. This
ability can be used to

Why not this one. Resume on a higher semantic level.

SOA
---

REST/WebServices (WSDL etc)

What is a rest client in this context (a client library)

Marshalling/ de-marshalling. Benefits and the problems that it causes.
Allows one model to be written out to XML or JSON

Have we marshal/de-marshall our problem domain into REST
--------------------------------------------------------

First stage after getting a resource is usually to programmatically
extract the interesting part from it. This is usually done via calls in
the programming language itself, for example by de-marshaling the stream
to domain objects and then calling a series of getters to narrow down to
the interesting parts.

This part has become such a natural component of a workflow that it is
barely noticed that it is happening. In an OO language, the extraction
of small parts of a model which, in the scope of the current concern are
of interest is so universal that it could be considered the sole reason
that getters exist.

However subtly incorporated it has become in the thinking of the
programmer, we should note that this is a construct and only one
possible way of thinking regarding identifying the areas of current
interest in a wider model.

~~~~ {.java}
// an example programmatic approach to a domain model interrogation under Java

List<Person> people = myModel.getPeople();
String firstPersonsSurname = people.get(0).getSurname();
~~~~

One weakness of this imperative, programatic inspection model is that,
once much code is written to interogate models in this way, the
interface of the model becomes increasingly expensive to change as the
code making the inspections becomes more tightly coupled with the thing
that it is inspecting. Taking the above example, if the model were later
refactored such that the concepts of firstName and surName were pulled
from the Person class into an extracted Name class, because the
inspection relies on a sequence of calls made directly into domain
objects, the code making the query would also have to change.

I believe that this coupling defies Agile methods of programming. Many
Java IDEs provide tools that would offer to automate the above
extraction into a Name class, creating the new class and altering the
existing calls. While reducing the pain, if we accept the concept as I
stated in the [Introduction] that the code should not be seen as a
static thing in which understanding is

More declarative syntaxes exist which are flexible enough that the
declarative expressions may still apply as the underlying model is
refactored. Whilst not applicable to use in general purpose programming,
XPATH is an example of this. As an analogue of the Java situation above,
Given the following XML:

~~~~ {.xml}
<people>
   <person>
      <surname>Bond</surname>
   </person>
</people>
~~~~

The XPath //person[0]//surname//text() (JIM/ME - CHECK THIS!) would
continue to identify the correct part of the resource without being
updated after the xml analogue of the above Java Name refactor:

~~~~ {.xml}
<people>
   <person>
      <name>
         <surname>Bond</surname>
      </name>
   </person>
</people>
~~~~

A few models exist which do not follow this pattern such as XPATH.
However, these are useful in only a small domain.

Xpath is able to express identifiers which often survive refactoring
because XML represents a tree, hence we can consider relationships
between entities to be that of contains/contained in (also siblings?).
In application of XML, in the languages that we build on top of XML, it
is very natural to consider all elements to belong to their ancestors.
Examples are myriad, for example consider a word count in a book written
in DOCBook format - it should be calculable without knowing if the book
is split into chapters or not since this is a concept internal to the
organisation of the book itself nd not something that a querier is
likely to find interesting - if this must be considered the structure
acts as barrier to information rather than enabling the information's
delivery. Therefore, in many cases the exact location of a piece of
information is not as important as a more general location of x being in
some way under y.

This may not always hold. A slightly contrived example might be if we
were representing a model of partial knowledge:

~~~~ {.xml}
<people>
   <person>
      <name>
         <isNot><surname>Bond</surname></isNot>
      </name>
   </person>
</people>
~~~~

CSS. Meant for presentation of HTML, but where HTML markup is semantic
it is a selector of the *meaning of elements* for the sake of applying a
meaningful presentation more so than a selector of arbitrary colours and
positions on a screen.

Unlike XML, in the model created by most general programming languages,
there is no requirement for the data to be tree shaped. Graph is ok.
This make this slighlty harder but nontheless attempts have been made.

Linq. (CITEME)

Loose coupling and Updating versioning
--------------------------------------

Because of the contagion problem, need to be able to create
loosely-coupled systems.

Inside systems also, even with automatic refactoring tools, only
automate and therefoer lessen but do not remove the problem that
coupling causes changes in one place of a codebase to cause knock-on
changes in remote other parts of the code. A method of programming which
was truly compatible with extreme programming would involve designing
for constant change without disparate parts having to be modified as
structural refactoring occurs.

I propose that in a changing system, readability of code's changelog is
as important as readability of the code itself. Extraneous changes
dilute the changelog, making it less easily defined by code changes
which are intrinsically linked to the actual change in the logic being
expressed by the program.

It is often stated that understandability is the number once most
important concern in a codebase (CITE) - if the code is suitably dynamic
it is important that changes are axiomic and clarity of the changelog is
equally important.

State of parsing: SAX and Dom
-----------------------------

Why sax is difficult and nobody uses it

DOM parser can be built on a SAX parser. Often are. CITE: Java and XML
book.

The failure of sax: requires programmer to do a lot of work to identify
interesting things. Eg, to find tag address inside tag person with a
given name, have to recognise three things while reieving a callback for
every single element and attribute in the document. As a principle, the
programmer should only have to handle the cases which are interesting to
them, not wade manually through a haystack in search of a needle, which
means the library should provide an expressive way of associating the
nodes of interest with their targetted callbacks.

Programmer has to track the descent down to an interesting node in some
kind of list themselves.

Json and XML
------------

Json is very simple, only a few CFGs required to describe the language
(json.org) - this project is listed there!

jsonpath and xpath
------------------

JsonPath in general tries to resemble the javascript use of the json
language nodes it is detecting.

~~~~ {.javascript}

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
~~~~

The web browser as REST client
------------------------------

Browser incompatability mostly in presentation layer rather than in
scripting languages.

Language grammars rarely disagree, incompatability due to scripting is
almost always due to the APIs presented to the scripting language rather
than the language itself.

Progressive UI/ Streaming UI
----------------------------

Infinitely scrolling webpages. Need a way to 'pull' information, not
just push if reacting to scrolling. Use oboe with websockets? Eg, ebay
home page, Facebook. Adv of infinate scroll is page loads quickly and
most people won't scroll very far so most of the time have everything
needed right away.

Javascript
----------

Client-side web scripting via Javascript is a field which at inception
contributed no more than small, frequently gimmicky, dynamic features
added to otherwise static webpages. Today the scope and power of client
side scripting has increased to the extent that the entire interface for
large, complex applications is often programmed in this way. These
applications are not limited to running under traditional web browsers
but also include mobile apps and desktop software.

What 'this' (context) is in javascript. Why not calling it scope.

Javascript: not the greatest for 'final' elegant presentation of
programming. Does allow 'messy' first drafts which can be refactored
into beautiful code. Ie, can write stateful and refactor in small steps
towards being stateless. An awareness of beautiful languages lets us
know the right direction to go in. An ugly language lets us find
something easy to write that works to get us started. Allows a very
sketchy program to be written, little more than a programming
scratchpad.

Without strict typing, hard to know if program is correct without
running it. In theory (decidability) and in practice (often find errors
through running and finding errors thrown). Echo FPR: once compiling,
good typing tends to give a reasonable sureness that the code is
correct.

Explain var/function difference, ie construct pluck and explain why var
keyOf = partial(pluck) is declared with a var and not a function, why
some prefer to do always via . operator can't be made into a function
with (.) or similar and so has to be wrapped in a function is a less
direct manner. Unfortunately, can make it difficult for a reader to know
the types involved. For example, on seeing:
`var matchesJsonPath = jsonPathCompiler( pattern )` there is no way
(other than examining the source or doucmentation of the function being
called) to know that this is a higher order function and will return
another function to be assigned as matchesJsonPath.

C-style brackets around all function arguments hampers a natural
expression of functional style code. For example, this requires a lot of
arguments and without checking of function airity, it is easy to
misplace a comma or closing bracket.

    function map(fn, list){
       if( !list ) {
          return emptyList;
       } else {
          return cons(fn(head(list)), map(fn,tail(list)));
       }
    }

What a Micro-library is. What motivates the trend? This library has a
fairly small set of functionality, it isn't a general purpose
do-everything library like jQuery so its size will be looked at more
critically if it is too large. Micro library is the current gold
standard for compactness. Still, have a lot to do in not very much code.

Browser
-------

*XmlHttpRequest* (XHR)

Xhr2 and the .onprogress callback. polling responseText while in
progress \* why doesn't work in IE (built on an activeX object that
provides buffering)

Older style of javascript callback. Assign a listener to onprogress, not
call an add listener method means can only have one listener.

> While the request entity body is being transmitted and the upload
> complete flag is unset, queue a task to fire a progress event named
> progress on the XMLHttpRequestUpload object about every 50ms or for
> every byte transmitted, whichever is least frequent. [w3c, XHR Working
> Draft](http://www.w3.org/TR/XMLHttpRequest/)

Websockets More like node Can connect to any protocol (as always, easier
to program if text based but can do binary) Can use to do http but not
sufficient advantage over using

Node
----

> Streams in node are one of the rare occasions when doing something the
> fast way is actually easier. SO USE THEM. not since bash has streaming
> been introduced into a high level language as nicely as it is in
> node." [high level node style guide](https://gist.github.com/2401787)

> node Stream API, which is the core I/O abstraction in Node.js (which
> is a tool for I/O) is essentially an abstract in/out interface that
> can handle any protocol/stream that also happens to be written in
> JavaScript. [http://maxogden.com/a-proposal-for-streaming-xhr.html]

Bash streams a powerful abstraction easily programmed for linear
streaming. Node more powerful, allows a powerful streaming abstraction
which is no more complex to program than a javascript webapp front end.
Essentially a low-level interface to streaming such as unix sockets or
tcp connections.

Streams in node are the observer pattern. Readable streams emit
'readable' events when they have some data to be read and 'end' events
when they are finished. Apart from error handling, so far as reading is
concerned, that is the extent of the API.

Although the streams themselves are stateful, because they are based on
callbacks it is entirely possible to use them from a component of a
javascript program which is wholly stateless.

Using Node's http module provides a stream but handles setting headers,
putting the method otu etc.

What Node is V8. Fast. Near-native. JIT.

V8 is often said to be 'near-native' speed, meaning it runs at close to
the speed of a similarly coded C program. However, this relies on the
programmer also coding in the style of a C programmer, for example with
only mono-morphic callsites and without a functional style. Once either
of those programming techniques is taken up performance drops rapidly
[http://rfrn.org/\~shu/2013/03/20/two-reasons-functional-style-is-slow-in-spidermonkey.html].
When used in a functional style, not 'near-native' in the sense that not
close to the performance gained by compiling a well designed functional
language to natively executable code. Depends on style coded in,
comparison to native somewhat takes C as the description of the
operation of an idealised CPU rather than an abstract machine capable of
executing on an actual CPU.

*Anecdote: SVG engine: one function for xy vs x and xy. Very large speed
increase. Add figures etc.*

Why Node perhaps is mis-placed in its current usage as a purely web
platform "the aim is absolutely fast io". This happened because web
specialist programmers took it up first

Why Node is significant \* Recognises that most tasks are io-bound
rather than CPU bound. Threaded models good for CPU-bound in the main.

How Node is different

Criticisms of Node. Esp from Erlang etc devs.

Node's standard stream mechanisms

Testing
-------

![Relationship between the main players in the JS testing landscape.
JSTD, Karma, Jasmine, NodeUnit, jasmine-node,
Browsers](images/placeholder.png)

By the commonjs spec, test directory should be called 'test'
(http://wiki.commonjs.org/wiki/Packages/1.0\#Package\_Directory\_Layout)
doesn't matter for my project since not using commonjs, but might as
well stick to the convention.

How TDD helps How can fit into methodology

-   JSTD
-   NodeUnit
-   Karma
-   Jasmine

Initially started with jstestdriver but found it difficult. Karma
started because engineers working on the Angular project in Google were
"struggling a lot with jstd": http://www.youtube.com/watch?v=MVw8N3hTfCI
- jstd is a google project Even Jstd's authors seems to be disowning it
slightly. Describe what was once its main mode of operation as now being
for stress testing of jstd itself only. Problems: browsers become
unresponsive. Generally unreliable, has to be restarted frequently.

JSTD, as a Java program, is difficult to start via Grunt. Also an issue
that Grunt post-dates Karma by enough that JSTD doesn't have the
attention of the Grunt community.

Methodology
-----------

The program design will be initially an exercise in creating the easiest
expression that can possibly work and via constant work towards the
emergence of elegance.

Why this method? See W'yg.

[^1]: http://jackson.codehaus.org/1.0.1/javadoc/org/codehaus/jackson/node/NullNode.html

[^2]: for quite an obviously visible example of progressive SVG loading,
    try loading this SVG using a recent version of Google Chrome:
    <http://upload.wikimedia.org/wikipedia/commons/0/04/Marriage_%28Same-Sex_Couples%29_Bill%2C_Second_Reading.svg>
