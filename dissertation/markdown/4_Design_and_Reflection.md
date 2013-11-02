Design and Reflection:
======================

The REST workflow is more efficient if we do not wait until we have
everything before we start using the parts that we do have. The main
tool to achieve this is the SAX parser whose model presents poor
developer ergonomics because it is not usually convenient to think on
the markup's level of abstraction. Using SAX, a programmer may only
operate on a convenient abstraction after inferring it from a lengthy
series of callbacks. In terms of ease of use, DOM is generally preferred
because it provides the resource whole and in a convenient form. My
design aims to duplicate this convenience and combine it with
progressive interpretation by removing one restriction: that the node
which is given is always the document root. From a hierarchical markup
such as XML or JSON, when read in order, sub-trees are fully known
before we fully know their parent tree. We may select pertinent parts of
a document and deliver them as fully-formed entities as soon as they are
known, without waiting for the remainder of the document to arrive. In
this way I propose that it is possible to combine most of the desirable
properties from SAX and DOM parsers into a new method.

By my design, identifying the interesting parts of a document before it
is complete involves turning the established model for drilling-down
inside-out. Under asynchronous I/O the programmer's callback
traditionally receives the whole resource and then, inside the callback,
locates the sub-parts that are required for a particular task. Inverting
this process, I propose extracting the locating logic currently found
inside the callback, expressing as a selector language, and using it to
declare the cases in which the callback should be notified. The callback
will receive complete fragments from the response once they have been
selected according to this declaration.

I will be implementing using the Javascript language because it has good
support for non-blocking I/O and covers both contexts where this project
will be most useful: in-browser programming and server programming.
Focusing on the MVP, I will only be implementing the parsing of one
mark-up language. Although this technique could be applied to any
text-based, tree-shaped markup, I find that JSON best meets my goals
because it is widely supported, easy to parse, and defines a single
n-way tree, amenable to selectors which span multiple format versions.

JSONPath is especially applicable to node selection as a document is
read because it specifies only constraints on paths and 'contains'
relationships. Because of the top-down serialisation order, on
encountering any node in a serialised JSON stream, I will have already
seen enough of the prior document to know its full path. JSONPath would
not be so amenable if it expressed sibling relationships because there
is no similar guarantee of having seen other nodes on the same level
when any particular node is encountered. A new implementation of the
language is required because the existing JSONPath library is
implemented only as a means to search through already gathered objects
and is too narrow in applicability to be useful in our context.

If we consider we are selecting specifically inside a REST resource not
all of the JSONPath language is well suited. Given this context it is
likely that we will not be examining a full model but rather a subset
that we requested and was assembled on our behalf according to
parameters that we supplied. We can expect to be interested in all of
the content so search-style selections such as 'books costing less than
X' are less useful than queries which identify nodes because of their
type and position such as 'all books in the discount set', or, because
we know we are examining `/books/discount`, simply 'all books'. In
creating a new JSONPath implementation I have chosen to follow the
existing language somewhat loosely, thereby specialising the matching
and avoiding unnecessary code. It is difficult to anticipate what the
real-world matching requirements will be but if I deliver now the 20% of
possible features that I'm reasonably sure will be used for 80% of
tasks, for the time being any functionality which is not covered may be
implemented inside the callbacks themselves and later added to the
selection language. For example, somebody wishing to filter on the price
of books might use branching to further select inside their callback. I
anticipate that the selections will frequently be on high-level types so
it is useful to analyse the nature of type imposition with regards to
JSON.

Detecting types in JSON
-----------------------

JSON markup describes only a few basic types. On a certain level this is
also true for XML -- most nodes are either of type Element or Text.
However, the XML metamodel provides tagnames; essentially, a built-in
type system for subclassifying the elements. JSON has no similar notion
of types beyond the basic constructs: array, object, string, number. To
understand data written in JSON's largely typeless model it is often
useful if we think in terms of a more complex type system. This
imposition of type is the responsibility of the observer rather than of
the observed. The reader of a document is free to choose the taxonomy
they will use to interpret it and this decision will vary depending on
the purposes of the reader. The required specificity of taxonomy differs
by the level of involvement in a field; whereas 'watch' may be a
reasonable type for most data consumers, to a horologist it is likely to
be unsatisfactory without further sub-types. To serve disparate
purposes, the JSONPath variant provided for node selection will have no
inbuilt concept of type, the aim being to support programmers in
creating their own.

~~~~ {.xml}
<!--  
  XML leaves no doubt as to the labels we give to an Element's type 
  type. Although we might further interpret, this is a 'person'
-->
<person  name='...' gender="male"
         age="45" height="175cm" profession="architect">
</person>
~~~~

~~~~ {.javascript}
/* JSON meanwhile provides no built-in type concept. 
   This node's type might be 'thing', 'animal', 'human', 'male',
   'man', 'architect', 'artist' or any other of many overlapping
   impositions depending on our reason for examining this data
*/
{  "name":"...", "gender":"male", "age":"45" 
   "height":"172cm" "profession":"architect">
}         
~~~~

In the absence of node typing beyond categorisation as objects, arrays
and various primitives, the key immediately mapping to an object is
often taken as a loose marker of its type. In the below example we may
impose the the type 'address' on two nodes prior to examining their
contents because of the field name which maps to them from the parent
node.

~~~~ {.javascript}
{
   "name": ""
,  "residence": {
      "address": [
         "47", "Cloud street", "Dreamytown"
      ]
   }
,  "employer": {
      "name": "Mega ultra-corp"
   ,  "address":[
         "Floor 2", "The Offices", "Alvediston", "Wiltshire"      
      ]
   }   
}
~~~~

This means of imposing type is simply expressed as JSONPath. The
selector `address` would match all nodes whose parent maps to them via
an address key.

As a loosely typed language, Javascript gives no protection against
lists which store disparate types but by sensible convention this is
avoided. Likewise, in JSON, although type is a loose concept, the items
in a collection will generally be of the same type. From here follows a
sister convention illustrated in the example below, whereby each item
from an array is typed according to the key in the grandparent node
which maps to the array.

~~~~ {.javascript}
{
   "residences": {
      "addresses": [
         ["10", "Downing street", "London"]
      ,  ["Chequers Court", "Ellesborough", "Buckinghamshire"]      
      ,  ["Beach Hut", "Secret Island", "Bahamas"]
      ]
   }
}
~~~~

In the above JSON, `addresses.*` would correctly identify three address
nodes. The pluralisation of field names such as 'address' becoming
'addresses' is common when marshaling from OO languages because the JSON
keys are based on getters whose name typically reflects their
cardinality; `public Address getAddress()` or
`public List<Address> getAddresses()`. This may pose a problem in some
cases and it would be interesting in future to investigate a system such
as Ruby on Rails that natively understands English pluralisation. I
considered introducing unions as an easy way to cover this situation,
allowing expressions resembling `address|addresses.*` but decided that
until I am sure of its usefulness it is simpler if this problem is
solved outside of the JSONPath language by simply asking the programmer
to register two selection specifications against the same handler
function.

In the below example types may not be easily inferred from ancestor
keys.

~~~~ {.javascript}
{
   "name": "..."
,  "residence": {
      "number":"...", "street":"...", "town":"..." 
   }
,  "employer":{
      "name": "..."
   ,  "premises":[
         { "number":"...", "street":"...", "town":"..." }
      ,  { "number":"...", "street":"...", "town":"..." }
      ,  { "number":"...", "street":"...", "town":"..." }
      ]
   ,  "registeredOffice":{
         "number":"...", "street":"...", "town":"..."
      }
   }
}  
~~~~

Here, the keys which map onto addresses are named by the relationship
between the parent and child nodes rather than by the type of the child.
The type classification problem could be solved using an ontology with
'address' subtypes 'residence', 'premises', and 'office' but this
solution feels quite heavyweight for a simple selection language. I
chose instead to import the idea of *duck typing* from Python
programing, as named in a 2000 usenet discussion:

> In other words, don't check whether it IS-a duck: check whether it
> QUACKS-like-a duck, WALKS-like-a duck, etc, etc, depending on exactly
> what subset of duck-like behaviour you need [@pythonduck]

An address 'duck-definition' for the above JSON would say that any
object which has number, street, and town properties is an address.
Applied to JSON, duck typing takes an individualistic approach by
deriving type from the node in itself rather than the situaiton in which
it is found. Because I find this selection technique simple and powerful
I decided to add it to my JSONPath variant. As discussed in section
\ref{jsonpathxpath}, JSONPath's syntax is designed to resemble the
equivalent Javascript accessors but Javascript has no syntax for a
value-free list of object keys. The closest available notation is for
object literals so I created a duck-type syntax derived from this by
omitting the values, quotation marks, and commas. The address type
described above would be written as `{number street town}`. Field order
is insignificant so `{a b}` and `{b a}` are equivalent.

It is difficult to generalise but when selecting items from a document I
believe it will often be useful if nodes which are covariant with the
given type are also matched. We may consider that there is a root duck
type `{}` which matches any node, that we create a sub-duck-type if we
add to the list of required fields, and a super-duck-type if we remove
from it. Because in OOP extended classes may add new fields, this idea
of the attribute list expanding for a sub-type applies neatly to JSON
REST resources marshaled from an OO representation. In implementation,
to conform to a duck-type a node must have all of the required fields
but could also have any others.

Importing CSS4's explicit capturing to Oboe's JSONPath
------------------------------------------------------

JSONPath naturally expresses a 'contained in' relationship using the dot
notation but no provision is made for the inverse 'containing'
relationship. *Cascading Style Sheets*, CSS, the web's styling language,
has historically shared this restriction but a proposal for extended
selectors which is currently at Editor's Draft stage [@css4] introduces
an elegant solution. Rather than add an explicit 'containing'
relationship, the draft observes that CSS has previously always selected
the element conforming to the right-most of the selector terms, allowing
only the deepest mentioned element to be styled. This restriction is
lifted by allowing terms to be prefixed with `$` in order to make them
explicitly capturing; a selector without an explicit capturing term
continues to work as before. The CSS selector
`form.important input.mandatory` selects mandatory inputs inside
important forms but `$form.important input.mandatory` selects important
forms with mandatory fields.

The new CSS4 capturing technique will be adapted for Oboe's JSONPath. By
duplicating a syntax which the majority of web developers should become
familiar with over the next few years I hope that Oboe's learning curve
can be made a little more gradual. Taking on this feature, the selector
`person.$address.town` would identify an address node with a town child,
or `$people.{name, dob}` can be used to locate the same people array
repeatedly whenever a new person is added to it. Javascript frameworks
such as d3.js and Angular are designed to work with whole models as they
change. Consequently, the interface they present converses more fluently
with collections than individual entities. If we are downloading data to
use with these libraries it is more convenient if we use explicit
capturing so that we are notified whenever the collection is expanded
and can pass it on.

Parsing the JSON response
-------------------------

While SAX parsers provide an unappealing interface to application
developers, as a starting point to handle low-level parsing in
higher-level libraries they work very well (most XML DOM parsers are
built in this way). The pre-existing Clarinet project is well tested,
liberally licenced, and compact, meeting our needs perfectly. The name
of this project, Oboe.js, was chosen in tribute to the value delivered
by Clarinet.

API design
----------

Everything that Oboe is designed to do can already be achieved by
combining a SAX parser with imperatively coded node selection. This has
not been adopted widely because it requires verbose, difficult
programming in a style which is unfamiliar to most programmers. With
this in mind it is a high priority to design a public API for Oboe which
is concise, simple, and resembles other commonly used tools. If Oboe's
API is made similar to common tools, a lesser modification should be
required to switch existing projects to streaming http.

For some common use cases it should be possible to create an API which
is a close enough equivalent to popular tools that it can be used as a
direct drop-in replacement. Although used in this way no progressive
loading would be enacted, when refactoring towards a goal the first step
is often to create a new expression of the same logic [@cleancode p.
212]. By giving basic support for non-progressive downloading the door
is open for apps to incrementally refactor towards a progressive
expression. Allowing adoption as a series of small, easily manageable
steps rather than a single leap is especially helpful for teams working
under Scrum because all work must fit within a fairly short timeframe.

jQuery is by far the most popular library for AJAX today. The basic call
style for making an AJAX GET request is as follows:

~~~~ {.javascript}
jQuery.ajax("resources/shortMessage.txt")
   .done(function( text ) {
      console.log( "Got the text: ", text ); 
   }).
   .fail(function() {
      console.log( "the request failed" );      
   });
~~~~

While jQuery is callback-based and internally event driven, the public
API it exposes does not wrap asynchronously retrieved content in event
objects and event types are expressed by the name of the method used to
add the listener. These names, `done` and `fail`, follow generic
phrasing and are common to all asynchronous functionality that jQuery
provides. Promoting brevity, the methods are chainable so that several
listeners may be added from one statement. Although Javascript supports
exception throwing, for asynchronous failures a fail event is used
instead. Exceptions are not applicable to non-blocking I/O because at
the time of the failure the call which provoked the exception will
already have been popped from the call stack.

`jQuery.ajax` is overloaded so that the parameter may be an object,
allowing more detailed information to be given:

~~~~ {.javascript}
jQuery.ajax({ "url":"resources/shortMessage.txt",
              "accepts": "text/plain",
              "headers": { "X-MY-COOKIE": "123ABC" }
           });
~~~~

This pattern of passing arguments as object literals is common in
Javascript for functions which take a large number of arguments,
particularly if some are optional. This avoids having to pad unprovided
optional arguments in the middle of the list with null values and,
because the use of the values is named from the callee, also avoids an
anti-pattern where a callsite can only be understood after counting the
position of the arguments.

Taking on this style while extending it to cover events for progressive
parsing, we arrive at the following Oboe public API:

~~~~ {.javascript}
oboe("resources/people.json")
   .node( "person.name", function(name, path, ancestors) {
      console.log("There is somebody called ", name);   
   })
   .done( function( wholeJson ) {
      console.log("That is everyone!");
   })
   .fail( function() {
      console.log("Actually, the download failed. Please forget ", 
                  "the people I just told you about");
   });
~~~~

In jQuery only one `done` handler is usually added to a request; the
whole content is always given so there is only one thing to receive.
Under Oboe there will usually be several separately selected areas of
interest inside a JSON document so I anticipate that typically multiple
node handlers will be added. Consequently, a shortcut style is provided
for adding several selector-handler pairs at a time:

~~~~ {.javascript}
oboe("resources/people.json")
   .node({  
      "person.name": function(personName, path, ancestors) {
         console.log("Let me tell you about ", name, "...");
      },
      "person.address.town": function(townName, path, ancestors) {
         console.log("they live in ", townName);
      }
   });
~~~~

Note the `path` and `ancestors` parameters in the examples above. These
provide additional information regarding the context in which the
identified node was found. Consider the following JSON:

~~~~ {.javascript}
{ 
   "event": "Mens' 100m sprint",
   "date": "5 Aug 2012",
   "medalWinners": {
      "gold":     {"name": "Bolt",    "time": "9.63s"},
      "silver":   {"name": "Blake",   "time": "9.75s"},
      "bronze":   {"name": "Gatlin",  "time": "9.79s"}
   }
}  
~~~~

In this JSON we may extract the runners using the pattern `{name time}`
or `medalWinners.*` but nodes alone are insufficient because their
location communicates information which is as important as their
content. The `path` parameter provides the location as an array of
strings plotting a descent from the JSON root to the found node. For
example, Bolt has path `['medalWinners', 'gold']`. Similarly, the
`ancestors` array is a list of the ancestors starting with the JSON root
node and ending at the immediate parent of the found node. For all but
the root node, which in any case has no ancestors, the nodes given by
the ancestor list will have been only partially parsed.

~~~~ {.javascript}
oboe("resources/someJson.json")
   .node( "medalWinners.*", function(person, path) {
      let metal = lastOf(path);
      console.log( person.name, " won the ", metal, 
        " medal with a time of ", person.time );
   });
~~~~

Being loosely typed, Javascript would not enforce that ternary callbacks
are used as selection handlers. Given that before a callback is made the
application programmers must have provided a JSONPath selector for the
locations in the document they are interested in, for most JSON formats
the content alone will be sufficient. The API design orders the callback
parameters so that in most common cases a unary or binary function can
be given.

Under Node.js the code style is more obviously event-based. Listeners
are normally added using an `.on` method where the event name is a
string given as the first argument. Adopting this style, my API design
for oboe.js also allows events to be added as:

~~~~ {.javascript}
oboe("resources/someJson.json")
   .on( "node", "medalWinners.*", function(person) {
   
      console.log( "Well done ", person.name );
   });
~~~~

While allowing both styles creates an API which is larger than it needs
to be, creating a library which is targeted at both the client and
server side is a balance between a consistent call syntax spanning
environments and consistency with the environment. I hope that the dual
interface will help adoption by either camp. The two styles are similar
enough that a person familiar with one should be able to work with the
other without difficulty. Implementating the duplicative parts of the
API should require only a minimal degree of extra coding because they
may be expressed in common using partial completion. Because `'!'` is
the JSONPath for the root of the document, for some callback `c`,
`.done(c)` is a equal to `.node('!', c)`. Likewise, `.node` is easily
expressible as a partial completion of `.on` with `'node'`.

When making PUT, POST or PATCH requests the API allows the body to be
given as an object and serialises it as JSON because it is anticipated
that REST services which emit JSON will also accept it.

~~~~ {.javascript}
oboe.doPost("http://example.com/people", {
   "body": {
      "name":"Arnold", "location":"Sealands"
   }
});
~~~~

Earlier callbacks when paths are found prior to nodes
-----------------------------------------------------

Following the project's aim of giving callbacks as early as possible,
sometimes useful work can be done when a node is known to exist but
before we have the contents of the node. A design follows in which each
node found in the JSON document can potentially trigger notifications at
two stages: when it is first addressed and when it is complete. The API
facilitates this by providing a `path` event following much the same
style as `node`.

~~~~ {.javascript}
oboe("events.json")
   .path( "medalWinners", function() {
      // We don"t know the winners yet but we know we have some 
      // so let's start drawing the table:    
      gui.showMedalTable();
   })
   .node( "medalWinners.*", function(person, path) {    
      let metal = lastOf(path);
      gui.addPersonToMedalTable(person, metal);
   })
   .fail( function(){
      // That didn"t work. Revert!
      gui.hideMedalTable();
   });
~~~~

Implementing path notifications requires little extra code, only that
JSONPath expressions can be evaluated when items are found in addition
to when they are completed.

Choice of streaming data transport
----------------------------------

As discussed in section \ref{browserstreamingframeworks}, current
techniques to provide streaming over http encourage a dichotomous split
of traffic as either stream or download. I find that this split is not
necessary and that streaming may be used as the most effective means of
downloading. Streaming services implemented using push pages or
websockets are not REST. Under these frameworks a stream has a URL
address but the data in the stream is not addressable. This is similar
to STREST, the *Service Trampled REST* anti-pattern [@strest], in which
http URLs are viewed as locating endpoints for services rather than the
actual resources. Being unaddressable, the data in the stream is also
uncacheable: an event which is streamed live cannot later, when it is
historic, be retrieved from a cache which was populated by the stream.
These frameworks use http as the underlying transport but I find they do
not follow http's principled design. Due to these concerns, in the
browser I will only be supporting downloading using XHR.

Although I am designing Oboe as a client for ordinary REST resources and
not focusing on the library a means to receive live events, it is
interesting to speculate if Oboe could be used as a REST-compatible
bridge to unify live and static data. Consider a REST service which
gives results per-constituency for UK general elections. When
requesting historic results the data is delivered in JSON format much as
usual. Requesting the results for the current year on the night of the
election, an incomplete JSON with the constituencies known so far would
be immediately sent, followed by the remainder dispatched individually
as the results are called. When all results are known the JSON would
finally close leaving a complete resource. A few days later, somebody
wishing to fetch the results would use the *same url for the historic
data as was used on the night for the live data*. This is possible
because the URL refers only to the data that is required, not to whether
it is current or historic. Because it eventually formed a complete http
response, the data that was streamed is not incompatible with http
caching and a cache which saw the data when it was live could store it
as usual and later serve it as historic. More sophisticated intermediate
caches sitting on the network between client and service would recognise
when a new request has the same url as an already ongoing request, serve
the response received so far, and then continue by giving both inbound
requests the content as it arrives from the already established outbound
request. Hence, the resource would be cacheable even while the election
results are streaming and a service would only have to provide one
stream to serve the same live data to multiple users fronted by the same
cache. An application developer programming with Oboe would not have to
handle live and historic data as separate cases because the node and
path events they receive are the same. Without branching, the code which
displays results as they are announced would automatically be able to
show historic data.

Taking this idea one step further, Oboe might be used for infinite data
which intentionally never completes. In principle this is not
incompatible with http caching although more research would have to be
done into how well current caches handle requests which do not finish. A
REST service which provides infinite resources would have to confirm
that it is delivering to a streaming client, perhaps with a request
header. Otherwise, if a non-streaming REST client were to use the
service it would try to get 'all' of the data and never complete its
task.

Supporting only XHR as a transport unfortunately means that on older
browsers which do not fire progress events (see section
\ref{xhrsandstreaming}) a progressive conceptualisation of the data
transfer is not possible. I will not be using streaming workarounds such
as push tables because this would create a client which is unable to
connect to the majority of REST services. Degrading gracefully, the best
compatible behaviour is to wait until the document completes and then
interpret the whole content as if it were streamed. Because nothing is
done until the request is complete the callbacks will be fired later
than on a more capable platform but will have the same content and be in
the same order. By reverting to non-progressive AJAX on legacy
platforms, an application author will not have to write special cases
and the performance should be no worse than with traditional AJAX
libraries such as jQuery. On legacy browsers Oboe could not be used to
receive live data -- in the election night example no constituencies
could be shown until they had all been called.

Node's standard http library provides a view of the response as a
standard ReadableStream so there will be no problems programming to a
progressive interpretation of http. In Node all streams provide a common
API regardless of their origin so there is no reason not to allow
arbitrary streams to be read. Although Oboe is intended primarily as a
REST client, under Node it will be capable of reading data from any
source. Oboe might be used to read from a local file, an ftp server, a
cryptography source, or the process's standard input.

Handling transport failures
---------------------------

Oboe cannot know the correct behaviour when a connection is lost so this
decision is left to the containing application. Generally on request
failure one of two behaviours are expected: if the actions performed in
response to data so far remain valid in the absence of a full
transmission their effects will be kept and a new request made for just
the missed part; alternatively, if all the data is required for the
actions to be valid, the application should take an optimistic locking
approach and perform rollback.

Oboe.js as a micro-library
--------------------------

HTTP traffic is often compressed using gzip so that it transfers more
quickly, particularly for entropy-sparse text formats such as
Javascript. When measuring a library's download footprint it usually
makes more sense to compare post-compression. For the sake of adoption
smaller is better because site creators are sensitive to the download
size of their sites. Javascript micro-libraries are listed at
[microjs.com](http://microjs.com), which includes this project. A
library qualifies as being *micro* if it is delivered in 5kb or less,
5120 bytes but micro-libraries also tend to follow the ethos that it is
better for an application developer to gather together several tiny
libraries than find one with a one-size-fits-all approach, perhaps
echoing the unix command line tradition for small programs which each do
exactly one thing. As well as being a small library, in the spirit of
a micro-library a project should impose as few restrictions as possible
on its use and be be agnostic as to which other libraries or programming
styles it will be combined with. Oboe feels on the edge of what is
possible to elegantly do as a micro-library so while the limit is
somewhat arbitrary, keeping below this limit whilst writing readable
code should provide an interesting extra challenge.
