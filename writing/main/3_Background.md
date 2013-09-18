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
    
 * Don't go into solutions! (that belongs in R&A)   
 * Can analyse a bit but any new reflections should be put in R&A
   
--->


The above problem has many analogues and because REST uses standard web
semantics applies to much more than just automated web surfing. Indeed,
as the machine readability of the data increases, access early can be
all the more beneficial since decisions to terminate the connection may
be made. Example: academic's list of publications, then downloading all
the new ones.

State of the web
----------------

Ie, front-end client-side, front-end server-side.

![A webapp running with a front end generated partially on server and
partially on client side](images/placeholder.png)

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

Big/small message problem and granularity. With small: http overhead.
With big: not all may be needed.

Javascript as mis-understood language (CITE: Crockford) - list features
available.

(correctly, ECMAScript) Misleadingly named after Java as a marketing
ploy when Java was a new technology (CITE) - in true more similar to
Scheme or Lisp but with Java or C inspired syntax.

Where the delays are in a web application
-----------------------------------------

Like most application types, web applications usually suffer greater
delays waiting for io than because javascript execution times present a
bottleneck. Because Javascript is used for user interfaces, frame-rates
are important. Single threaded so js holds up rendering. Important to
return control to the browser quickly. However, once execution of each
js frame of execution is no more than the monitor refresh rate, further
optimisation brings zero benefit. Hence, writing extremely optimised
Javascript, especially focusing on micro-optimisations that hurt code
readability is a bit silly.

> The user does something, then the app responds visually with immediacy
> at 30 frames per second or more, and completes a task in a few hundred
> milliseconds. As long as an app meets this user goal, it doesn’t
> matter how big an abstraction layer it has to go through to get to
> silicon. [@fivemyths]

Web browsers hosting REST clients
---------------------------------

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
Despite a reputation Javascript being poorly standardised, as a language
it is very consistently implemented. More accurately we should say that
the libraries provided by the environment lack compatibility. Given an
abstraction layer to gloss over considerable differences cross-browser
webapp developers found little difficulty in targeting multiple
platforms. The various abstraction competed on developer ergonomics with
the popular jQuery and Prototype.js promoting themselves respectively as
*"do more, write less"* and *"elegant APIs around the clumsy interfaces
of Ajax"*. JSON being a subset of Javascript, web developers barely
noticed their privileged position whereby the serialisation of their
data format mapped exactly onto the basic types of their programming
language. As such there was never any confusion as to which exact object
structure to de-serialise to. If this seems like a small advantage,
contrast with the plethora of confusing and incompatible representations
of JSON output presented by the various Java JSON parsers; JSON's Object
better resembles Java's Map than Object and the confusion between JSON
null, Java null, and Jackson's NullNode[^1] is a common cause of errors.
Endowed with certainty regarding deserialisation, JSON parsers could be
safely integrated directly into AJAX libraries. This provided a call
style while working with remote resources so streamlined as to require
hardly any additional effort.

~~~~ {.javascript}
jQuery.ajax('http://example.com/people.json', function( people ) {

   // The parsing of the people json into a javascript object
   // feels so natural that it is easy to forget while looking 
   // at the code that it happens at all. 
   
   alert('the first person is called ' + people[0].name);
});
~~~~

Whilst simple, the above call style is built on the assumption that a
response is a one-time event and no accommodation is made for a
continuously delivered response. Meanwhile, the XHR2 standardisation
process had started and was busy observing and specifying proprietary
extensions to the original XHR1. Given an interest in streaming, the
most interesting of these is the progress event:

> While the download is progressing, queue a task to fire a progress
> event named progress about every 50ms or for every byte received,
> whichever is least frequent. [@xhr2progress]

Prior to this addition there had been no mechanism, at least so far as
the published specs to an XHR instance in a streaming fashion. However,
while all major browsers currently support progress events in their most
recently versions, the installed userbase of supporting browsers is
unlikely to grow fast enough that this technique may be relied upon
without a fallback for several years.

In fact, this is exactly how web browsers are implemented. However, this
progressive use of http is hardwired into the browser engines rather
than exposing an API suitable for general use and as such is treated as
something of a special case specific to web browsers and has not so far
seen a more general application. I wish to argue that a general
application of this technique is viable and offers a worthwhile
improvement over current common methods.

While until recently browsers have provided no mechanism to stream into
AJAX, almost every other instance of downloading has taken advantage of
streaming and progressive interpretation. This includes image formats,
as the progressive PNG and JPEG; markup as progressive display of html
and svg; video; and Javascript itself -- script interpretation starts
before the script is wholly fetched. Each of these progressive
considerations is implemented as a specific-purpose mechanism internal
to the browser which is not exported to Javascript and as such is not
possible to repurpose.

Browser streaming frameworks
----------------------------

As the web's remit spread to include more applications which would
previously have been native apps, to be truly 'live' many applications
found the need to be able to receive real-time push events. Dozens of
streaming transports have been developed sidestepping the browser's
apparent limitations.

The earliest and most basic attempt was to poll by making many requests,
I won't consider this approach other than to say it came with all the
usually associated downsides. Despite the inadequacy of this approach,
from here the improved technique of *long polling* was invented. A
client makes a request to the server side. Once the connection is open
the server waits, writing nothing until a push is required. To push the
server writes the message and closes the http connection; since the http
response is now complete the content may be handled by the Javascript
client which then immediately makes a new request, reiterating the cycle
of wait and response. This approach works well where messages are
infrequently pushed but where the frequency is high the limitation of
one http transmission per connections requires imposes a high overhead.

Observing that while browsers lack progressive ajax, progressive html
rendering is available, *push tables* achieve progressive data transfer
by serialising streaming data to a HTML format. Most commonly messages
are written to a table, one row per message. On the client side this
table is hidden in an off-screen frame and the Javascript streaming
client watches the table and reacts whenever a new row is found. In many
ways an improvement over long-polling, this approach nevertheless
suffers from an unnatural data format. Whilst html is a textual format
so provides a degree of human-readability, html was not designed with
the goal of an elegent or compact transfer of asynchronous data.
Contrasted with a SOA ideal of *'plumbing on the outside'*, peeking
inside the system is difficult whilst bloated and confusing formats are
tasked with conveying meaning.

Both long polling and push tables are better throught of as a means to
circumvent restrictions than indigene technology. A purose-built stack,
*Websockets* is poised to take over, building a standardised duplex
transport and API on top of http's chunked mode. While the newest
browsers support websockets, most of the wild use base does not. Nor do
older browsers provide a fine-grained enough interface into http in
order to allow a Javascript implementation. In practice, real-world
streaming libraries such as socket.io [CITE] are capable of several
streaming techniques and can select the best for a given context. To the
programmer debugging an application the assortment of transports only
enhances the black-box mentality with regards to the underlying
transports.

<!---
*some or all of the below could move to A&R, it is wondering into
analysis* --->

Whilst there is some overlap, each of the approaches above addresses a
problem only tangentially related to this project's aims. Firstly,
requiring a server that can write to an esoteric format feels quite
anti-REST, especially given that the server is sending in a format which
requires a specific, known, specialised client rather than a generic
tool. In REST I have always valued how prominently the plumbing of a
system is visible, so that to sample a resource all that is required is
to type a URL and be presented with it in a human-comprehensible format.

Secondly, as adaptations to the context in which they were created,
these frameworks realise a view of network usage in which downloading
and streaming are dichotomously split, whereas I aim to realise a schema
without dichotomy in which *streaming is adapted as the most effective
means of downloading*. In existing common practice a wholly distinct
mechanism is provided vs for data which is ongoing vs data which is
finite. For example, the display of real-time stock data might start by
AJAXing in historical and then separately use a websocket to maintain
up-to-the-second updates. This requires the server to support two
distinct modes. However, I see no reason why a single transport could
not be used for both. Such a server might start answering a request by
write historic events from a database, then switch to writing out live
data in the same format in response to messages from a MOM. By closing
the dichotomy we would have the advantage that a single implementation
is able to handle all cases.

It shouldn't be a surprise that a dichotomous implementation of
streaming, where a streaming transport is used only for live events is
incompatible with http caching. If an event is streamed when it is new,
but then when it is old made available for download, http caching
between the two requests is impossible. However, where a single mode is
used for both live and historic events the transport is wholly
compatible with http caching.

If we take streaming as a technique to achieve efficient downloading,
not only for the transfer of forever-ongoing data, none of these
approaches are particularly satisfactory.

Common patterns when connecting to REST services
------------------------------------------------

Marshaling provides two-way mapping between a domain model and a
serialisation as JSON or XML, either completely automatically or based
on a declarative specification. To handle a fetched rest response it is
common to automatically demarshal it so that the application may make
use of the response from inside its own model, no differently from
objects assembled in any other way. From the perspective of the
programmer it is as if the domain objects themselves had been fetched.
Another common design pattern, intended to give a degree of isolation
between concerns, is to demarshal automatically only so far as Data
Transfer Objects (DTOs), instances of classes which implement no logic
other than storage, and from there programmatically instantiate the
domain model objects. Going one step further, for JSON resources sent to
loosely-typed languages with a native representation of objects as
generic key-value pairs such as Javascript or Clojure, the marshaling
step is often skipped: the output from the parser so closely resembles
the language's built-in types that it is simplest to use it directly.
Depending on the programming style adopted we might say that the JSON
parser's output *is* the DTO and create domain model objects based on
it, or that no further instantiation is necessary.

![*Degrees of automatic marshaling*. From marshaling directly to domain
objects, DTOs, using parser output as a DTO, or using objects directly.
Distinguish work done by library vs application programmer's
domain](images/placeholder.png)

Ultimately the degree of marshaling that is used changes only the level
of abstraction of the resource that the REST client library hands over
to the application developer. Regardless of the exact form of the
response model, the developer will usually programmatically extract one
or more parts from it via calls in the programming language itself. For
example, on receiving a resource de-marshaled to domain objects, a Java
developer will inspect it by calling a series of getters in order to
narrow down to the interesting parts. This is not to say that the whole
of the message might not in some way be interesting, only that by using
it certain parts will need to be identified as distinct areas of
concern.

~~~~ {.java}
// An example programmatic approach to a domain model interrogation 
// under Java; upon receiving a list of people, each person's name
// is added to a database. The methods used to drill down to the
// pertinent components of the response are all getters: getPeople, 
// getGivenName, and getSurname. 
void handleResponse( RestResponse response ) {

   for( Person p : response.getPeople() ) {
      addNameToDb( p.getGivenName(), p.getSurname() );
   }   
}
~~~~

~~~~ {.javascript}
// Although in this Javascript example the objects passed to the handler 
// remain in the form given by the JSON parser, containing no domain-specific
// getters, the programming represents a different expression of the same 
// basic process.
function handleResponse( response ){

   response.people.forEach( function( person ){
      addNameToDb( p.givenName, p.surname );
   });
}
~~~~

Because it is applied directly to the metamodel of the language[\^ It
could be argued that getters aren't a part of the metamodel of Java
itself, but they form such a common pattern that it is a part ], this
extraction has become such a natural component of a workflow that it
maye be used while thinking of it as wholly unremarkable. In the
examples above we are interacting with the model in the way that the
language makes the most easy to conceptualise. However se should
consider that, however subtly embedded, the technique is an invented
construct and only one of the possible formulations which might have
been drawn.

One weakness of this inspection model is that, once much code is written
to interrogate models in this way, the interface of the model becomes
increasingly expensive to change as the code making the inspections
becomes more tightly coupled with the thing that it is inspecting.
Taking the above example, if the model were later refactored such that
the concepts of firstName and surName were pulled from the Person class
into an extracted Name class, because the inspection relies on a
sequence of calls made directly into domain objects, the code making the
query would also have to change. Whilst following the object oriented
principle of encapsulation of data, such that the caller does not have
to concern themselves with the data structures hidden behind the getter,
there is no such abstraction for when the structure itself changes.
Given an Agile environment where the shape of data is refactored
regularly, this would be a problem when programming against any kind of
resource; for example, if change of objects formats propagates knock-on
changes where ever the object is used it is very difficult to commit
small diffs to the VCS which make incremental changes to a tightly
focused area of the system. A method of programming which truly embraced
extreme programming would allow constant change without disparate,
barely related parts having to be modified in parallel when structural
refactoring occurs. The coupling is all the more acute where the format
of the item being inspected is defined by an independently maintained
service.

*contagion problem*

Extraneous changes
dilute the changelog, making it less easily defined by code changes
which are intrinsically linked to the actual change in the logic being
expressed by the program, and therefore to the thinking behind the change
and the reason for the change.

In the domain of markup languages, declarative selector co-languages
such as XPATH exist whose coupling is loose enough that their
expressions may continue to function after the exact shape of a message
is refactored. While this is nothing more radical than using the
selection languages as they were intended, their employment is not the
most natural coming from a programming context in which the application
developer's responsibilities usually start where the demarshaler's end.
Consider the following XML:

~~~~ {.xml}
<people>
   <person>
      <surname>Bond</surname>
   </person>
</people>
~~~~

The XPath //person[0]//surname//text() would continue to identify the
correct part of the resource without being updated after the xml
analogue of the above Java Name refactor:

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

Json and XML
------------

Although AJAX started as a means to transfer XML, today JSON "The
fat-free alternative to XML[@jsonorg]" is the more popular serialisation
format. The goals of XML were to simplify SGML to the point that a
graduate student would be able to implement a parser in a week [@javaxml
p ???]. For the student tackling JSON a few hours with a parser
generator should surfice, being expressable in 15 CFGs. Indeed, because
JSON is a strict subset of Javascript, in many cases the Javascript
programmer requires no parser at all. Unimpeeded by SGML's roots as a
document format, JSON provides a much more direct analogue to the
metamodel of a canonical modern programming language with entities such
as *string*, *number*, *object* and *array*. By closely mirroring a
programmer's metamodel, visualising a mapping between a domain model and
it's serialised objects becomes trivial.

~~~~ {.javascript}
{
   people: [
      {name: 'John', town:'Oxford'},
      {name: 'Jack', town:'Bristol'}
   ]
}
~~~~

This close resemblance to the model of the programming in some cases
causes fast-changing formats.

Like XML attributes, as a serialised text format, JSON objects have an
order but are almost always parsed to and from orderless maps meaning
that the order of the keys/value pairings as seen in the stream usually
follows no defined order. No rule in the format would forbid
representing of an ordered map in an ordered way but most tools on
receiving such a message would ignore the ordering.

(MINE SOA assignment). Also the diagram.

Parsing: SAX and Dom
--------------------

In the XML world two standard parser models exist, SAX and DOM, with DOM
far the more popular. DOM performs a parse as a single evaluation, on
the request of the programmer, returning an object model representing
the whole of the document. At this level of abstraction the details of
the markup are only distant concern. Conversely, SAX parsers are
probably better considered as tokenisers, providing a very low-level
event driven interface in line with the Observer pattern to notify the
programmer of syntax as it is seen. Each element's opening and closing
tag is noted

This presents poor developer ergonomics by requiring that the programmer
implement the recording of state with regard to the nodes that they have
seen. For programmers using SAX, a conversion to their domain objects is
usually implemented imperatively. This programming tends to be difficult
to read and programmed once per usage rather than assembled as the
combination of reusable parts. For this reason SAX is usually reserved
for fringe cases where messages are very large or memory unusually
scarce.

DOM isn't just a parser, it is also a cross-language defined interface
for manipulating the XML in real time, for example to change the
contents of a web page in order to provide some interactivity. In JSON
world, DOM-style parser not referring to the DOM spec, or what browser
makers would mean. Rather, borrowing from the XML world to mean a parser
which requires the whole file to be loaded.

Suppose we want to extract the name of the first person. Given a DOM
parser this is very easy:

~~~~ {.javascript}
function nameOfFirstPerson( myJsonString ) {

   // Extracting an interesting part from JSON-serialised data is
   // relatively easy given a DOM-style parser. Unfortunately this
   // forbids any kind of progressive consideration of the data.
   // All recent browsers provide a JSON parser as standard. 

   var document = JSON.parse( myJsonString );
   return document.people[0].name; // that was easy!
}
~~~~

Contrast with the programming below which uses the clarinet JSON SAX
parser. To prove that I'm not exaggerating the case, see published
usages at [Clarinet demos].

\pagebreak

~~~~ {.javascript}
function nameOfFirstPerson( myJsonString, callbackFunction ){

   // The equivalent logic, expressed in the most natural way
   // fora s JSON SAX parser is longer and much more 
   // difficult to read. The developer pays a high price for 
   // progressive parsing. 

   var clarinet = clarinet.parser(),
   
       // with a SAX parser it is the developer's responsibility 
       // to track where in the document the cursor currently is,
       // requiring several variables to maintain.        
       inPeopleArray = false,   
       inPersonObject = false,
       inNameAttribute = false,
       found = false;
   
   clarinet.onopenarray = function(){
      // for brevity we'll cheat by assuming there is only one
      // array in the document. In practice this would be overly
      // brittle.
      
      inPeopleArray = true; 
   };
   
   clarinet.onclosearray = function(){
      inPeopleArray = false;
   };   
   
   clarinet.onopenobject = function(){
      inPersonObject = inPeopleArray; 
   };
   
   clarinet.oncloseobject = function(){
      inPersonObject = false;
   };   
      
   clarinet.onkey = function(key){
      inNameAttribute = ( inPeopleObject && key == 'name');
   };

   clarinet.onvalue = function(value){
      if( !found && inNameAttribute ) {
         // finally!
         callbackFunction( value );
         found = true;
      }
   };      
   
   clarinet.write(myJsonString);   
}
~~~~

As we can see above, SAX's low-level semantics require a lengthy
expression and for the programmer to maintain state regarding the
position in the document -- usually recording the ancestors seen on the
descent from the root to the current node -- in order to identify the
interesting parts. This order of the code is also quite unintuitive;
generally event handlers will cover multiple unrelated concerns and each
concern will span multiple event handlers. This lends to programming in
which separate concerns are not separately expressed in the code.

JsonPath and XPath
------------------

The above difficulty in identifying the interesting parts of a message
leads me to investigate where this problem has already been solved. For
XML, the XPath language allows the programmer to declaratively specify
the nodes that they are interested in. Luckily in JSON there exists
already an attempt at an equivalent named Jsonpath. JsonPath closely
resembles the javascript code which would select the same nodes.

~~~~ {.javascript}

// an in-memory person with a multi-line address:
let person = {
   name: {givenName:'', familyName:''},
   address: [
      "line1",
      "line2",
      "line3"
   ]
}

// in javascript we can get line two of the address as such:
let address = person.address[2]

// the equivalent jsonpath expression is identical:
let jsonPath = "person.address[2]"

// although jsonpath also allows ancestor relationships which are not
// expressible quite so neatly as basic Javascript:
let jsonPath2 = "person..given"
~~~~

The typical use pattern of XPath or JSONPath is to search for nodes once
the whole serialisation has been parsed into a DOM-style model. To
examine a whole document for the list of nodes that match a jsonpath
expression the whole of the tree is required. But to evaluate if a
single node matches an expression, only the *path of the descent from
the root to that node* is required -- the same state as a programmer
usually maintains whilst employing a SAX parser.

Investigate: is this true? Does JSONPath have a following/preceding
grammar? If so, only a subset and rearrange.

One limitation of the JSONPath language is that it is not possible to
construct an 'containing' expression. CSS4 allows this in a way that is
likely to become familiar to web developers over the next five years or
so.

Javascript
----------

Client-side web scripting via Javascript is a field which at inception
contributed no more than small, frequently gimmicky, dynamic features
added to otherwise static webpages. Today the scope and power of client
side scripting has increased to the extent that the entire interface for
large, complex applications is often programmed in this way. These
applications are not limited to running under traditional web browsers
but also include mobile apps and desktop software.

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

What a Micro-library is. What motivates the trend? This library has a
fairly small set of functionality, it isn't a general purpose
do-everything library like jQuery so its size will be looked at more
critically if it is too large. Micro library is the current gold
standard for compactness. Still, have a lot to do in not very much code.

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

[^1]: See
    <http://jackson.codehaus.org/1.0.1/javadoc/org/codehaus/jackson/node/NullNode.html>
