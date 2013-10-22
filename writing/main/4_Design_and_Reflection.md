Design and Reflection:
======================

Using a combination of techniques from the previous chapter I propose
that it is possible to combine the desirable properties from SAX and DOM
parsers into a REST client library which allows streaming but is also
convenient to program.

By observing the flow of data streams through a SAX parser we can say
that the REST workflow is more efficient if we do not wait until we have
everything before we start using the parts that we do have. However, the
SAX model presents poor developer ergonomics because it is not usually
convenient to think on the level of abstraction that it presents: that
of markup tokens. Using SAX, a programmer may only operate on a
convenient abstraction after inferring it from a lengthy series of
callbacks. In terms of ease of use, DOM is generally preferred because
it provides the resource whole and in a convenient form. My design aims
to duplicate this convenience and combine it with progressive
interpretation by removing one restriction: that the node which is given
is always the document root. From a hierarchical markup such as XML or
JSON, when read in order, the sub-trees are fully known before we fully
know their parent tree. We may select pertinent parts of a document and
deliver them as fully-formed entities as soon as they are known, without
waiting for the remainder of the document to arrive.

By my design, identifying the interesting parts of a document before it
is complete involves turning the established model for drilling-down
inside-out. Under asynchronous I/O the programmer's callback
traditionally receives the whole resource and then, inside the callback,
locates the sub-parts that are required for a particular task. Inverting
this process, I propose extracting the locating logic currently found
inside the callback and using it to decide when the callback should be
used. The callback will receive complete fragments from the response
once they have been selected according to this logic.

I will be implementing using the Javascript language because it has good
support for non-blocking I/O and covers both contexts where this project
will be most useful: in-browser programming and server programming.
Focusing on the MVP, I will only be implementing the parsing of one
mark-up language. Although this technique could be applied to any
text-based, tree-shaped markup, I find that JSON best meets my goals
because it is widely supported, easy to parse, and because it defines a
single n-way tree, is amenable to selectors which span multiple format
versions.

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

Not all of the JSONPath language is well suited when we consider we are
selecting specifically inside a REST resource. Given this context it is
likely that we will not be examining a full model but rather a subset
that we requested and was assembled on our behalf according to the
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
anticipate that the selections will frequently involve types so it is
useful to analyse the nature of type imposition with regards to JSON.

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
by the level of involvement in a field. Whereas 'watch' may be a
reasonable type for most data consumers, to a horologist it is likely to
be unsatisfactory without further sub-types. To serve disparate
purposes, the JSONPath variant provided for node selection will have no
inbuilt concept of type, the aim being to support programmers in
creating their own.

~~~~ {.xml}
<!--  XML leaves no doubt as to the labels we give to an Element's type.
      Although we might further interpret, this is a 'person' -->
<person  name='...' gender="male"
         age="45" height="175cm" profession="architect">
</person>
~~~~

~~~~ {.javascript}
/*    JSON meanwhile provides no built-in type concept. 
      This node's type might be 'thing', 'animal', 'human', 'male', 'man', 
      'architect', 'artist' or any other of many overlapping impositions 
      depending on our reason for examining this data */
{  "name":"...", "gender":"male", "age":"45" 
   "height":"172cm" "profession":"architect">
}         
~~~~

In the absence of node typing beyond categorisation as objects, arrays
and various primitives, the key immediately mapping to an object is
often taken as a loose marker of its type. In the below example we may
impose the the type 'address' prior to examining the contents because of
the field name in the parent node.

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

This means of imposing type is simply expressed in JSONPath. The
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
      ,  ["Chequers Court", "Ellesborough, "Buckinghamshire"]      
      ,  ["Beach Hut", "Secret Island", "Bahamas"]
      ]
   }
}
~~~~

In the above JSON, `addresses.*` would correctly identify the addresses.
The pluralisation of field names such as 'address' becoming 'addresses'
is common when marshaling from OO languages because the JSON keys are
based on getters whose name typically reflects their cardinality;
`public Address getAddress()` or `public List<Address> getAddresses()`.
This may pose a problem in some cases and it would be interesting in
future to investigate a system such as Ruby on Rails that natively
understands English pluralisation. I considered introducing unions as an
easy way to cover this situation, allowing expressions resembling
`address|addresses.*` but decided that it is simpler if this problem is
solves outside of the JSONPath language if the programmer registers two
selection specifications against the same handler function.

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

A 'duck-definition' for the above JSON would be any object which has
number, street, and town properties. We take an individualistic approach
by deriving type from the node in itself rather than the situation in
which it occurs. Because I find this selection technique simple and
powerful I decided to add it to my JSONPath variant. As discussed in
section \ref{jsonpathxpath}, JSONPath's syntax is designed to resemble
the equivalent Javascript accessors, but Javascript has no syntax for a
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
relationship, the draft observes that previously CSS has always selected
the element conforming to the right-most of the selector terms, allowing
only the deepest mentioned element to be styled. This restriction is
lifted by allowing terms to be prefixed with `$` in order to make them
explicitly capturing; a selector without an explicit capturing term
continues to work as before. The CSS selector
`form.important input.mandatory` selects mandatory inputs inside
important forms but `$form.important input.mandatory` selects important
forms with mandatory fields.

The new css4 capturing technique will be adapted for Oboe JSONPath. By
duplicating a syntax which the majority of web developers should become
familiar with over the next few years I hope that Oboe's learning curve
can be made a little more gradual. Taking on this feature, the selector
`person.$address.town` would identify an address node with a town child,
or `$people.{name, dob}` would provide the people array repeatedly
whenever a new person is added to it. Javascript frameworks such as
d3.js and Angular are designed to work with whole models as they change.
Consequently, the interface they present converses more fluently with
collections than individual entities. If we are downloading data to use
with these libraries it is more convenient if we use explicit capturing
so that we are notified whenever the collection is expanded and can pass
it on.

Parsing the JSON Response
-------------------------

While SAX parsers provide an unappealing interface to application
developers, as a starting point to handle low-level parsing in
higher-level libraries they work very well (most XML DOM parsers are
built in this way). The pre-existing Clarinet project is well tested,
liberally licenced, and compact, meeting our needs perfectly.
The name of this project, Oboe.js, was chosen in tribute to the value 
delivered by Clarinet.

API design
----------

Everything that Oboe is designed to do can already be achieved by combining
a SAX parser with imperatively coded node selection. This has
not been adopted widely because it requires verbose, difficult
programming in a style which is unfamiliar to most programmers. With
this in mind it is a high priority to design a public API for Oboe which
is concise, simple, and resembles other commonly used tools. If Oboe's API
is made similar to common tools, a lesser modification should be
required to switch existing projects to streaming http.

For some common
use cases it should be possible to create an API with a close enough
equivalence to popular tools that it can be used as a direct drop-in
replacement. Although when used in this way no progressive loading would
be enacted, when refactoring towards a goal the first step is often to
create a new expression of the same thing [@cleancode p. 212]. By giving
basic support for non-progressive downloading, the door is open for apps
to incrementally refactor towards a progressive expression. Allowing
adoption as a series of small, easily manageable steps rather than a
single leap is especially helpful for teams working under Scrum because
all work must fit within a fairly short timeframe.

jQuery is by far the most popular library for AJAX today. The basic call style 
for making an AJAX GET request is as follows:

~~~~ {.javascript}
jQuery.ajax("resources/shortMessage.txt")
   .done(function( text ) {
      console.log( "Got the text: " + text ); 
   }).
   .fail(function() {
      console.log( "the request failed" );      
   });
~~~~

While callback-based and internally event driven, the public API exposed
by jQuery does not wrap asynchronously retrieved content in event
objects. Event type is expressed by the name of the method which adds
the listener. These names, `done` and `fail`, follow generic phrasing
and are common to everything that jQuery provides asynchronously. The
methods are chainable so that several listeners may be added from one
statement.

By method overloading, the parameter to `jQuery.ajax` may be an object
which allows more information to be given:

~~~~ {.javascript}
jQuery.ajax({ "url":"resources/shortMessage.txt",
              "accepts": "text/plain",
              "headers": { "X-MY-COOKIE": "123ABC" }
           });
~~~~

This pattern of listing function parameters as an object literal is
common in Javascript for functions which take a large number of
arguments, particularly if some are optional. This avoids having to pad
unprovided optional arguments in the middle of the list with null values
and, because the purpose of the values is apparent from the callee, also
an anti-pattern where a callsite can only be understood after counting
the position of the arguments.

Taking on this style and extending to cover events for progressive
parsing, we get the public API for Oboe:

~~~~ {.javascript}
oboe("resources/people.json")
   .node( "person.name", function(name, path, ancestors) {
      console.log("There is somebody called " + name);   
   })
   .done( function( wholeJson ) {
      console.log("That is everyone!");
   })
   .fail( function() {
      console.log("Actually, the download failed. Please forget " + 
                  "the people I just told you about");
   });
~~~~

In jQuery only one `done` handler is usually added to a request because
there is only one thing to receive. Under oboe there will usually be
several separately selected areas of interest inside a JSON document so
I anticipate that adding multiple handlers will be more common. A
shortcut call style is provided for adding several selector/handler
pairs at a time:

~~~~ {.javascript}
oboe("resources/people.json")
   .node({  
      "person.name": function(personName, path, ancestors) {
         console.log("Let me tell you about " + name + "...");
      },
      "person.address.town": function(townName, path, ancestors) {
         console.log("they live in " + townName);
      }
   });
~~~~

Note the `path` and `ancestors` parameters in the examples above. These
provide additional information regarding the location and the context in
which the identified node was found. Consider the following JSON:

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

Here we can extract the runners using the pattern `{name time}` or
`medalWinners.*` but the nodes alone are insufficient because their
location communicates information which is as important as their
content. The `path` parameter provides the location as an array of
strings plotting a descent from the JSON root to the found node. For
example, `['medalWinners', 'gold']`. Similarly, the `ancestors` array is
a list of the ancestors starting at the immediate parent of the found
node and ending with the JSON root node. For all but the root node,
which in any case has no ancestors, the nodes in this list will have
been only partially parsed. Being untyped, Javascript does not enforce
that ternary callbacks are given. Unlike the example above, given that
we have provided a JSONPath selector for the locations we would like to
receive data from, for most JSON formats the content alone will be
sufficient. The API design orders the callback parameters so that in
most common case a unary function may be given.

`http://nodejs.org/docs/latest/api/events.html#events_emitter_on_event_listener`

In node.js the code style is more obviously event-based. Listeners are
added via a `.on` method with a string event name given as the first
argument. Adopting this style, my API design for oboe.js also allows
events to be added as:

~~~~ {.javascript}
oboe("resources/someJson.json")
   .on( "node", "medalWinners.*", function(person, path, ancestors) {
      console.log( person.name + " won the " + lastOf(path) + " medal" );
   });
~~~~

While allowing both styles uncountably creates an API which is larger
than it needs to be, creating a library which is targeted at both the
client and server side, I hope this will help adoption by either camp.
The Two styles are similar enough that a person familiar with one should
be able to pick up the other without difficulty. In implementation a
duplicative API should require only a minimal degree of extra coding
because these parts may be expressed in common and their scope reduced
using partial completion. Because `'!'` is the JSONPath for the root of
the document, for some callback c, `.done(c)` is a synonym for
`.node('!', c)` and therefore below a thin interface layer may share an
implementation. Likewise, `.node` is easily expressible as a partial
completion of `.on` with `'node'`.

*API allows body to be given as Object and converts into JSON because it
is anticipated that REST services which emmit JSON will also accept it*

Earlier callbacks when paths are matched
----------------------------------------

Following with the project's aim of giving callbacks as early as
possible, sometimes useful work can be done when a node is known to
exist but before we have the contents of the node. This means that each
node found in a JSON document has the potential to trigger notifications
at two points: when it is first discovered and when it is complete. The
API facilitates this by providing a `path` callback following much the
same pattern as the `node` callback.

~~~~ {.javascript}
oboe("events.json")
   .path( "medalWinners", function() {
      // We don"t know the winners yet but we know we have some so let"s
      // start drawing the table already:    
      interface.showMedalTable();
   })
   .node( "medalWinners.*", function(person, path) {    
      interface.addPersonToMedalTable(person, lastOf(path));
   })
   .fail( function(){
      // That didn"t work. Revert!
      interface.hideMedalTable();
   });
~~~~

In implementation providing path notifications is a simple matter of
allowing the evaluation of the json path expressions when items are
pushed to the stack of current nodes in addition to when they are
popped.

Oboe.js as a Micro-Library
--------------------------

Http traffic, especially sending entropy-sparse text formats is often
gzipped at point of sending in order to deliver it more quickly, so in
measuring a download footprint it usually makes more sense to compare
post-gzipping. A Javascript library qualifies as being *micro* if it is
delivered in 5k or less, 5120 bytes. Micro-libraries also tend to follow
the ethos that it is better for a developer to gather together several
tiny libraries than one that uses a one-size-fits-all approach, perhaps
echoing the unix command line tradition of small programs which each do
do exactly one thing. Javascript Micro-libraries are listed at [^1],
which includes this project. Oboe.js feels on the edge of what is
possible to elegantly do as a micro-library so while the limit is
somewhat arbitrary, for the sake of adoption smaller is better and
keeping below this limit whilst writing readable code is an interesting
challenge. As well as being a small library, in the spirit of a
micro-library a project should impose as few restrictions as possible on
its use and be designed to be completely agnostic as to which other
libraries or programming styles that it is used with.

Choice of streaming data transport
----------------------------------

Considering longpoll, push-tables and websockets...

I find that it is not necessary to take this dichotomous view of
streaming.

Whilst there is some overlap, each of the approaches above addresses a
problem only tangentially related to this project's aims. Firstly,

In REST I have always valued how prominently the plumbing of a system is
visible, so that to sample a resource all that is required is to type a
URL and be presented with it in a human-comprehensible format.

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

Handling transport failures
---------------------------

Oboe should allow requests to fail while the response is being received
without necessarily losing the part that was successfully received.

Researching error handing, I considered the option of automatically
resuming failed requests without intervention from the containing
application. Http 1.1 provides a mechanism for Byte Serving via the
`Accepts-Ranges` header
[http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html\#sec14.5] which
is used to request any contiguous fragment of a resource -- in our case,
the part that we missed when the download failed. Having examined this
option I came to the conclusion that it would encourage brittle systems
because it assumes two requests to the same URL will give byte-wise
equal responses.

A deeper problem is that Oboe cannot know the correct behaviour when a
request fails so this is better left to the containing applications.
Generally on request failure, two behaviours may be anticipated. If the
actions performed in response to data received up to time of failure
remain valid in the absence of a full transmission, their effects may be
kept and a URL may be constructed to request just the lost part.
Alternatively, under optimistic locking, the application developer may
choose to perform rollback. In either case, responding to errors beyond
informing the calling application is outside of Oboe's scope.

IO errors in a non-blocking system cannot be handled via exception
throwing because the call which will later cause an error will no longer
be on the stack at the time that the error occurs. Error-events will be
used instead.

Fallback support on less-capable platforms
------------------------------------------

*something about market share and link to figures in an appendix?*

Because of differences in the capabilities in browsers, providing a
streaming REST client is not possible on all browsers. If this were
possible, it would not have been necessary to invent push pages or long
polling. Specifically, none but the most recent versions of Internet
Explorer provide any way to access an AJAX response before it is
complete. I have taken the design decision that it is ok to degrade on
these platforms so long as the programmer developing with Oboe.js does
not have to make special cases for these platforms. Likewise, nor should
the REST service need be aware of the client, disallowing detecting
client capabilities and switching transport strategy. Requiring
branching on either side places extra responsibilities on the programmer
which they would not otherwise be required to consider whilst viewing
REST through a non-streaming lens.

Given that streaming is not possible on older platforms, I must
considering the best experience that is possible. We may imagine a
situation in which the whole download completes followed by all
listeners being notified from a single Javascript frame of execution.
While not progressive in any way, this situation is essentially standard
REST plus JSONPath routing and no less performant than if more
traditional libraries were used. I find this satisfactory: for the
majority of users the experience is improved and for the others it is
made no worse, resulting in a net overall benefit.

In the Javascript language itself interoperability is very rarely an
issue. Javascript's model of prototypical inheritance allows changes to
be made to the browser's libraries on the fly; as soon as a prototype is
changed all instances of the type reflect the change even if they has
already been created (source). Because the base types that come with the
browser are essentially global, changing them for the use of a single
codebase is generally deprecated because of the possibility of
collisions. However, this technique is often used to retrofit new
standards onto older platforms. For example, the Functional-style Array
iteration methods remove the need to write C-style for loops and are
defined in the ECMAScript 5 specification
http://www.jimmycuadra.com/posts/ecmascript-5-array-methods - all of
these methods are implementable in pure Javascript. There exist several
mature pure Javascript projects for browsers which lack native support,
licenced to allow inclusion in this project (CITE ONE). While I am
constrained in the ability to accept streaming AJAX in older browsers,
there is no such restriction on my ability to express my thesis in a
more modern, functional style of Javascript.

Node is highly capable, with no shortcomings that will make Oboe.js
difficult to implement. It does, however use its own stream API rather
than emulate the browser API so will require platform-specific
programming inside the library. This abstraction will be hidden from the
library user so will not require any special programming on their part.

[^1]: http://microjs.com/
