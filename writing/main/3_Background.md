Background
==========

![**Labelling nodes in an n-tier architecture**. Regardless of where a
node is located, REST may be used as the means of communication. By
focusing on REST clients, nodes in the middleware and presentation layer
fall in our scope. Although network topology is often split about client
and server side, for our purposes categorisation as tiers is a more
meaningful distinction. According to this split the client-side
presentation layer and server-side presentation layer serve the same
purpose, generating mark-up based on aggregated data created in the
middle tier \label{architecture}](images/architecture.png)

The web as an application platform
----------------------------------

Application design has historically charted an undulating path pulled by
competing approaches of thick and thin clients. Having evolved from a
document viewing system to an application platform for all but the most
specialised tasks, the web perpetuates this narrative by resisting
categorisation as either mode.

While the trend is generally for more client scripting and for some
sites Javascript is now requisite, there are also counter-trends. In
2012 twitter reduced load times to one fifth of their previous design by
moving much of their rendering back to the server-side, commenting that
"The future is coming and it looks just like the past" [@newTwitter].
Under this architecture short, fast-loading pages are generated on the
server-side but Javascript is also provides progressively enhancement.
Although it does not generate the page anew, the Javascript must know
how to create most of the interface elements so one weakness of this
architecture is that much of the presentation layer logic must be
expressed twice.

Despite client devices taking on responsibilities which would previously
have been performed on a server, there is a limit to how much of the
stack may safely be offloaded in this direction. The client-side
ultimately falls under the control of the user so no important business
decisions should be taken here. A banking site should not allow loan
approval to take place in the browser because for the knowledgeable user
any decision would be possible. Separated from data stores by the public
internet, the client is also a poor place to perform data aggregation or
examine large data sets. For non-trivial applications these restrictions
encourage a middle tier to execute business logic and produce aggregate
data.

While REST may not be the only communications technology employed by an
application architecture, for this project we should examine where the
REST clients fit into the picture. REST is used to pull data from
middleware for the sake of presentation regardless of where the
presentation resides. Likewise, rather than connect to databases
directly, for portability middlewares often communicate with a thin REST
layer which wraps data stores. This suggests three uses:

-   From web browser to middleware
-   From server-side presentation layer to middleware
-   From middleware to one or more nodes in a data tier

Fortunately, each of these contexts require a similar performance
profile. The node is essentially acting as a router dealing with small
messages containing only the information they requested rather than
dealing with a whole model. As a part of an interactive system low
latency is important whereas throughput can be increased relatively
cheaply by adding more hardware. As demand for the system increases the
total work required grows but the complexity of any one of these tasks
does remains constant. Although serving any particular request might be
done in series, the workload as a whole at these tiers consists of many
independent tasks and as such is embarrassingly parallelisable.

Node.js
-------

Node.js is a general purpose tool for executing Javascript outside of a
browser. I has the aim of low-latency i/o and is used predominantly for
server applications and command line tools. It is difficult to judge to
what degree Javascript is a distraction from Node's principled design
and to what degree the language defines the platform.

In most imperative languages the thread is the basic unit of
concurrency. whereas Node presents the programmer with a single-threaded
abstraction. Threads are an effective means to share parallel
computation over multiple cores but are less well suited to scheduling
concurrent tasks which are mostly i/o dependent. Programming threads
safely with shared access to mutable objects requires great care and
experience, otherwise the programmer is liable to create race
conditions. Considering for example a Java http aggregator; because we
wish to fetch in parallel each http request is assigned to a thread.
These 'requester' tasks are computationally simple: make a request, wait
for a complete response, and then participate in a Barrier to wait for
the others. Each thread consumes considerable resources but during its
multi-second lifespan requires only a fraction of a millisecond on the
CPU. It is unlikely any two requests return at exactly the same moment
so usually the threads will process in series rather than parallel
anyway. Even if they do, the actual CPU time required in making an http
request is so short that any concurrent processing is a pyrrhic victory.
Following Node's lead, traditionally thread-based environments are
beginning to embrace asynchronous, single-threaded servers. The Netty
project can be though of as roughly the Java equivalent of Node.

![*Single-threaded vs multi-threaded scheduling for a http
aggregator*](images/placeholder.png)

Node builds on a model of event-based, asynchronous i/o that was
established by Javascript execution in web browsers. Although Javascript
in a browser may be performing multiple tasks simultaneously, for
example requesting several resources from the server side, it does so
from within a single-threaded virtual machine. Node similarly
facilitates concurrency by managing an event loop of queued tasks and
providing exclusively non-blocking i/o. Unlike Erlang, Node does not
swap tasks out preemptively, it always waits for tasks to complete
before moving onto the next. This means that each task must complete
quickly to avoid holding up others. *Prima facie* this might seem like
an onerous requirement to put on the programmer but in practice with
only non-blocking i/o each task naturally exits quickly without any
special effort. Accidental non-terminating loops or heavy
number-crunching aside, with no reason for a task to wait it is
difficult to write a node program where the tasks do not complete
quickly.

Each task in node is simply a Javascript function. Node is able to swap
its single Javascript thread between these tasks efficiently while
providing the programmer with an intuitive interface because of
closures. Utilising closures, the responsibility of maintaining state
between issuing an asynchronous call and receiving the callback is
removed from the programmer by folding it invisibly into the language.
This implicit data store requires no syntax and feels so natural and
inevitable that it is often not obvious that the responsibility exists
at all.

Consider the example below. The code schedules three tasks, each of
which are very short and exit quickly allowing Node to finely interlace
them between other concurrent concerns. The `on` method is used to
attach functions as listeners to streams. However sophisticated and
performant this style of programming, to the developer it is hardly more
difficult an expression than if a blocking io model were followed. It is
certainly easier to get right than synchronising mutable objects for
sharing between threads.

~~~~ {.javascript}
function printResourceToConsole(url) {

   http.get(url)
      .on('response', function(response){
      
         // This function will be called when the response starts.
         // It logs to the console, adds a listener and quickly exits.
         
         // Because it is captured by a closure we are able to reference 
         // the url parameter after the scope that declared it has finished.            
         console.log("The response has started for " + path);
      
         response.on('data', function(chunk) {      
            // This function is called each time some data is received from the 
            // http request. In this example we write the response to the console
            // and quickly exit.
            console.log('Got some response ' + chunk);
                   
         }).on('end', function(){
            console.log('The response is complete');
         })
         
      }).on("error", function(e){
         
         console.log("There was an error: " + e.message);
      });      
   console.log("The request has been made");
}   
~~~~

> "Node Stream API, which is the core I/O abstraction in Node.js (which
> is a tool for I/O) is essentially an abstract in/out interface that
> can handle any protocol/stream that also happens to be written in
> JavaScript." [@nodeStream]

In Node i/o is performed through a unified streaming interface
regardless of the source. The streams follow a publisher-subscriber
pattern fitting comfortably with the wider event-driven model. Although
the abstraction provided by streams is quite a thin layer on top of the
host system's socket, it forms a powerful and intuitive interface. For
many tasks it is preferable to program in a 'plumbing' style by joining
one stream's output to another's input. In the example below a resource
from the internet is written to the local filesystem.

~~~~ {.javascript}
http.get(url)
   .on('response', function(response){
      response.pipe(fs.createWriteStream(pathToFile));
   });
~~~~

Json and XML data transfer formats
----------------------------------

Both XML and JSON are text based, tree shaped data formats with human
and machine readability. One of the design goals of XML was to simplify
SGML to the point that a graduate student could implement a full parser
in a week [@javatools p287]. Continuing this arc of simpler data
formats, JSON "The fat-free alternative to XML[@jsonorg]" isolates
Javascript's syntax for literal values into a stand-alone serialisation
language. For the graduate tackling JSON parsing the task is simpler
still, being expressible as fifteen context free grammars.

Whereas XML's design can be traced to document formats, JSON's lineage
is in a programming language. From these roots isn't surprising that
JSON maps more directly to the metamodel that most programmers think in.
XML parsers produce Elements, Text, Attributes, ProcessingInstruction
which require extra translation before they are convenient to use inside
a programming language. Because JSON already closely resembles how a
programmer would construct a runtime model of their data, fewer steps
are required before using the deserialised form in a given programming
language. The JSON nodes: *strings*, *numbers*, *objects* and *arrays*
will in many cases map directly onto their language types and, for
loosely typed languages at least, the parser output bears enough
similarity to domain model objects that it may be used directly without
any further transformation.

~~~~ {.javascript}
{
   people: [
      {name: 'John', town:'Oxford'},
      {name: 'Jack', town:'Bristol'}
      {town:'Cambridge', name: 'Walter'}
   ]
}
~~~~

Both JSON and XML are used to serialise to and from orderless constructs
but but while serialised to text, an ordered list of characters, the
nodes are inevitably encountered according to some serialisation order.
There is no rule forbidding serialisation to JSON or XML attributes in
an order-significant way but in general the order is considered to not
be significant in the serialised format's model. In the example above,
the people objects would probably have been written out to represent
either a class with two public properties or a hash map. On receiving
this data the text would be demarshalled into similar structures and
that the data found an ordered expression during transport would be
quickly forgotten. However, when viewing a document through a streaming
and interpreting documents while still incomplete this detail cannot be
ignored as a concern relating only to the accidents of transfer. If
nodes were interpreted based on their first field in the example above
Walter would find a different handling than the other two. Because the
serialisation will contain items which are written to follow an
indeterminate order it will be important to ensure that, despite the
streaming, the REST client does not encourage programming in a way that
depends on the order that these fields are received.

Browser XML Http Request (XHR)
------------------------------

Making http requests from Javascript, commonly termed AJAX, was so
significant in establishing the modern web architecture that it is
sometimes used synonymously with Javascript-rich web applications.
Although AJAX is an acronym for **A**synchronous **J**avascript
(**a**nd) **X**ML, this reflects the early millennial enthusiasm for XML
as the one true data format and in practice any textual format may be
transferred. Today JSON is generally preferred, especially for delivery
to client-side web applications. During the 'browser war' years web
browsers competed by adding non-standard features; Internet Explorer
made AJAX possible in 2000 by exposing Microsoft's Active X *Xml Http
Request* (XHR) class to the Javascript sandbox. This was widely copied
and near equivalents were added to all major browsers. In 2006 the
interface was eventually formalised by the W3C [@xhrWorkingDraft]. XHR's
slow progresss to standardisation reflected a period of general
stagnation for web standards. HTML4 reached Recommendation status in
2001 but having subsequently found several evolutionary dead ends such
as XHTML, there would be no major updates until HTML5 started to gather
pace some ten years later.

Despite a reputation for being poorly standardised, as a language
Javascript enjoys consistent implementation. More accurately we would
say that browser APIs exposed to Javascript lack compatibility. Given
this backdrop of vendor extensions and lagging standardisation,
abstraction layers predictably rose in popularity. Various abstractions
competed primarily on developer ergonomics with the popular jQuery and
Prototype.js libraries promoting themselves as *"do more, write less"*
and *"elegant APIs around the clumsy interfaces of Ajax"*. Written
against the unadorned browser, Javascript applications read as a maze of
platform-detection and special cases. Once applications were built using
Javascript abstractions over the underlying browser differences, they
could be written purposefully and were able to express more complex
ideas without becoming incomprehensible.

JSON is today the main format output by REST end points when requesting
via AJAX. Javascript programmers occupy a privileged position whereby
their serialisation format maps exactly onto the inbuilt types of their
programming language. As such there is never any confusion regarding
which object structure to de-serialise to. Should this advantage seem
insubstantial, contrast with the plethora of confusing and incompatible
representations of JSON that are output by the various Java parsers:
JSON's Object better resembles Java's Map interface than Java Objects,
creating linguistic difficulties, and the confusion between JSON null,
Java null, and Jackson's NullNode[^1] is a common cause of errors.
Emboldened by certainty regarding deserialisation, AJAX libraries
directly integrated JSON parsers, providing a call style for working
with remote resources so streamlined as to require hardly any additional
effort.

~~~~ {.javascript}
jQuery.ajax('http://example.com/people.json', function( people ) {

   // The parsing of the people json into a javascript object
   // feels so natural that it is easy to forget from looking 
   // at the code that parsing happens at all. 
   
   alert('the first person is called ' + people[0].name);
});
~~~~

XHRs and streaming
------------------

Browser abstraction layers brought an improvement in expressivity to web
application programming but were ultimately limited to supporting the
lowest common denominator of the available browser abilities. At the
time that the call style above was developed the most popular browser
gave no means of access to partial responses. Inevitably, it draws a
conceptualisation of the response as a one-time event with no
accommodation offered for progressively delivered data.

The followup standard, XHR2 is now at Working Draft stage. Given
ambitions to build a streaming REST client, of greatest interest is the
progress event:

> While the download is progressing, queue a task to fire a progress
> event named progress about every 50ms or for every byte received,
> whichever is least frequent. [@xhr2progress]

Presently this event is supported by all but legacy browsers.

The historic lack of streaming allowed by XHR stands incongruously with
the browser as a platform which has long used streaming to precipitate
almost every other remote resource. Progressive image formats, html,
svg, video and Javascript itself (script interpretation starts before
the script is fully loaded) are all examples of this.

Browser streaming frameworks
----------------------------

The web's remit is increasingly widening to encompass scenarios which
would have previously been the domain of native applications. In order
to use live data many current webapps employ frameworks which push soft
real-time events to the client side. In comparison to the XHR2 progress
event, this form of streaming has a different but overlapping purpose.
Whereas XHR2 enables downloads to be viewed as short-lived streams but
does not otherwise disrupt the sequence of http's request-response
model, streaming frameworks facilitate an entirely different sequence,
that of perpetual data. Consider a webmail interface; initially the
user's inbox is downloaded via REST and a streaming download might be
used to speed its display. Regardless of if the response is interpreted
progressively, this inbox download is a standard REST call and shares
little in common with the push events which follow to provide instant
notification as new messages arrive.

**Push tables** sidestep the browser's absent data streaming abilities
by leaning on a resource that it can stream: progressive html. From the
client a page containing a table is hidden in an off-screen iframe. This
table is served from a a page that never completes, fed by a connection
that never closes. When the server wishes to push a message to the
client it writes a new row in this table which is then noticed by
Javascript monitoring the iframe on the client. More recently,
**Websockets** is a new standard that builds a standardised streaming
transport on top of http's chunked mode. Websockets requires browser
implementation and cannot be retrofitted to older browsers through
Javascript. Websockets are a promising technology but for the time being
patchy support means it cannot be used without a suitable fallback.

These frameworks do not interoperate at all with REST. Because the
resources they serve never complete they may not be read by a standard
REST client. Unlike REST they also are not amenable to standard http
mechanics such as caching. A server which writes to an esoteric format
requiring a specific, known, specialised client also feels quite
anti-REST, especially when we consider that the format design reflects
the nature of the transport more so than the resource. This form of
streaming is not, however, entirely alien to a SOA mindset. The data
formats, while not designed primarily for human readability are
nontheless text based and a person may take a peek inside the system's
plumbing simply by observing the traffic at a particular URL. In the
case of push-tables, an actual table of the event's properties may be
viewed from a browser as the messages are streamed.

Parsing: SAX and Dom
--------------------

From the XML world two standard parser types exist, SAX and DOM, with
DOM by far the more popular. Although the terms originate in XML, both
styles of parsers are also available for JSON. DOM performs a parse as a
single evaluation and returns a single object model representing the
whole of the document. Conversely, SAX parsers are probably better
considered as tokenisers, providing a very low-level event driven
interface following the Observer pattern that notifies the programmer of
each token separately as it is found. From DOM's level of abstraction
the markup syntax is a distant concern whereas for SAX each element's
opening and closing tag is noted so the developer may not put the data's
serialisation aside. SAX has the advantages that it may read a document
progressively and has lower memory requirements because it does not
store the parsed tree. Correspondingly, it it popular for embedded
systems on limited hardware which need to handle documents larger than
the available RAM.

Suppose we have some json representing people and want to extract the
name of the first person. Given a DOM parser this may be written quite
succinctly:

~~~~ {.javascript}
function nameOfFirstPerson( myJsonString ) {

   // All recent browsers provide JSON.parse as standard. 

   var document = JSON.parse( myJsonString );
   return document.people[0].name; // that was easy!
}
~~~~

To contrast, the equivalent below uses SAX, expressed in the most
natural way for the technology. [^2]

~~~~ {.javascript}
function nameOfFirstPerson( myJsonString, callbackFunction ){


   var clarinet = clarinet.parser(),
   
       // With a SAX parser it is the developer's responsibility 
       // to track where in the document the cursor currently is,
       // Several variables are used to maintain this state.        
       inPeopleArray = false,   
       inPersonObject = false,
       inNameAttribute = false,
       found = false;
   
   clarinet.onopenarray = function(){
      // For brevity we'll cheat by assuming there is only one
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

The developer pays a high price for progressive parsing, the SAX version
is considerably longer and more difficult to read. SAX's low-level
semantics require a lengthy expression and push the responsibility of
maintaining state regarding the current position in the document and the
nodes that have previously been seen onto the programmer. This
maintenance of state tends to programmed once per usage rather than
assembled as the composition of reusable parts. I find the order of the
code under SAX quite unintuitive; event handlers cover multiple
unrelated cases and each concern spans multiple handlers. This lends to
a style of programming in which separate concerns do not find separate
expression in the code. It is also notable that, unlike DOM, as the
depth of the document being interpreted increases, the length of the
programming required to interpret it also increases, mandating more
state be stored and an increased number of cases be covered per event
handler.

While SAX addresses many of the problems raised in this dissertation,
I find the unfriendly developer ergonomics pose too high a barrier to
its adoption for all but fringe uses.

Common patterns for connecting to REST services
-----------------------------------------------

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

Extraneous changes dilute the changelog, making it less easily defined
by code changes which are intrinsically linked to the actual change in
the logic being expressed by the program, and therefore to the thinking
behind the change and the reason for the change.

The JsonPath and XPath selector languages
-----------------------------------------

Both the above difficulty in identifying the interesting parts of a
message whilst using a streaming parser and the problem with tight
coupling of programmatic drilling down to REST formats leads me to
search for areas where this problem has already been solved.

In the domain of markup languages there are associated query languages
such as XPATH whose coupling is loose enough that their expressions may
continue to function after the exact shape of a message is refactored.
While observing this is nothing more radical than using the query
languages in more-or-less they were intended, their employment is not
the most natural coming from a programming context in which the
application developer's responsibilities usually start where the
demarshaler's end. Consider the following XML:

~~~~ {.xml}
<people>
   <person>
      <givenName>...</givenName>   
      <familyName>Bond</familyName>
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
         <givenName>...</givenName>
         <familyName>Bond</familyName>
      </name>
   </person>
</people>
~~~~

Luckily in JSON there exists already an attempt at an equivalent named
Jsonpath. JsonPath closely resembles the javascript code which would
select the same nodes. Not a real spec.

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

The typical use pattern of XPath or JSONPath is to search for nodes once
the whole serialisation has been parsed into a DOM-style model. JSONPath
implementation only allows for search-type usage:
https://code.google.com/p/jsonpath/To examine a whole document for the
list of nodes that match a jsonpath expression the whole of the tree is
required. But to evaluate if a single node matches an expression, only
the *path of the descent from the root to that node* is required -- the
same state as a programmer usually maintains whilst employing a SAX
parser. This is possible because JSONPath does not have a way to express
the relationship with sibling nodes, only ancestors and decedents.

One limitation of the JSONPath language is that it is not possible to
construct an 'containing' expression. CSS4 allows this in a way that is
likely to become familiar to web developers over the next five years or
so.

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

[^2]: For an example closer to the real world see
    https://github.com/dscape/clarinet/blob/master/samples/twitter.js
