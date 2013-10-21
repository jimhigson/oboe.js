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
type and position such as 'all books in the discount set'. In creating a
new JSONPath implementation I have chosen to follow the existing
language somewhat loosely, thereby specialising the matching and
avoiding unnecessary code. It is difficult to anticipate what the
real-world matching requirements will be but if I deliver now the 20% of
possible features that I'm reasonably sure will be used 80% of the time,
for the time being any functionality which is not covered may be
implemented inside the callbacks themselves and later added to the
selection library. For example, somebody wishing to filter on the price
of books use branching to further select inside their callback;

Detecting types in JSON
-----------------------

JSON markup describes only a few basic types. On a certain level this is
also true for XML -- most nodes are either of type Element or Text.
However, the XML metamodel provides tagnames, essentially a built-in
type system for subclassifying the elements. JSON has no similar notion
of types beyond the basic constructs: array, object, string, number. To
understand data written in JSON's largely typeless model it is often
useful if we think in terms of a more complex type system.\
This imposition of type is the responsibility of the observer rather
than of the observed. The reader of a document is free to choose the
taxonomy they will use to interpret it and this decision will vary
depending on the purpose of the reader. The specificity of taxonomy
required differs by the level of involvement in a field. Whereas 'watch'
may be a reasonable type for most data consumers, to a horologist it is
likely to be unsatisfactory without further sub-types. To serve
different purposes the JSONPath variant provided for node selection will
have no inbuilt concept of type, the aim is to support programmers in
creating their own.

*integrate with above or discard, maybe move to compatibility with
future versions* Relationship between type of a node and its purpose in
the document (or, perhaps, the purpose the reader wishes to put it to).
Purpose is often obvious from a combination of URL and type so can
disregard the place in the document. This structure may be carefully
designed but ultimately a looser interpretation of the structure can be
safer.

~~~~ {.xml}
<!--  XML leaves no doubt as to the labels we give to the types
      of the nodes. This is a 'person' -->
<person  name='...' gender="male"
         age="45" height="175cm" profession="architect">
</person>
~~~~

~~~~ {.javascript}
/*    JSON meanwhile provides no such concrete concept. This node's
      type might be 'thing', 'animal', 'human', 'man', 'architect',
      'artist' or any other of many overlapping impositions depending 
      on what purpose the document it is read for */
{  "name":"...", "gender":"male", "age":"45" 
   "height":"175cm" "profession":"architect">
}         
~~~~

In the absence of node typing beyond the categorisation as objects,
arrays and various primitive types, the key immediately mapping to the
object is often taken as a lose concept of the type of the object. Quite
fortunately, rather than because of a well considered object design,
this tends to play well with automatically marshaling of domain objects
expressed in a Java-style OO language because there is a strong tendency
for field names -- and by extension, 'get' methods -- to be named after
the *type* of the field, the name of the type also serving as a rough
summary of the relationship between two objects. See figure
\ref{marshallTypeFig} below.

In the below example, we impose the the type 'address' because of the
parent node's field name. Other than this, these are standard arrays of
strings:

~~~~ {.javascript}
{
   name: '...'
,  residence: {
      address: [
         '...', '...', '...'
      ]
   }
,  employer: {
      name: '...'
   ,  address :[
         '...', '...', '...'      
      ]
   }   
}
~~~~

Although, being loosely typed, in Javascript there is no protection
against using arrays to contain disparate object, by sensible convention
the items will usually be of some common type. Likewise in JSON,
although type is a loose concept, on some level the elements of an array
will generally be of the same type. This allows a sister convention seen
in the below example, whereby each of a list of items are typed
according to the key in the grandparent node which maps to the array.

~~~~ {.javascript}
{
   residences: {
      addresses: [
         ['Townhouse', 'Underground street', 'Far away town']      
      ,  ['Beach Hut', 'Secret Island', 'Bahamas']
      ]
   }
}
~~~~

The pluralisation of 'address' to 'addresses' above may be a problem to
a reader wishing to detect address nodes. I considered introducing an
'or' syntax for this situation, resembling `address|addresses.*` but
instead decided this problem, while related to type, is simpler to solve
outside of the JSONPath language. A programmer may simply use two
JSONPaths mapping to the same callback function.

In the below example typing is trickier still.

~~~~ {.javascript}
{
   name: '...'
,  residence: {
      number:'...', street:'...', town:'...' 
   }
,  employer:{
      name: '...'
   ,  premises:[
         { number:'...', street:'...', town:'...' }
      ,  { number:'...', street:'...', town:'...' }
      ,  { number:'...', street:'...', town:'...' }
      ]
   ,  registeredOffice:{
         number:'...', street:'...', town:'...'
      }
   }
}  
~~~~

The properties holding addresses are named by the relationship between
the parent and child nodes rather than the type of the child. There are
two ways we may be able to select objects out as addresses. Firstly,
because of an ontology which subtypes 'residence', 'premises', and
'office' as places with addresses. More simply, we may import the idea
of duck typing from Python programing.

> In other words, don't check whether it IS-a duck: check whether it
> QUACKS-like-a duck, WALKS-like-a duck, etc, etc, depending on exactly
> what subset of duck-like behaviour you need to play your
> language-games with.

Discussion of typing in Python language, 2000.
https://groups.google.com/forum/?hl=en\#!msg/comp.lang.python/CCs2oJdyuzc/NYjla5HKMOIJ

A 'duck-definition' of address might be any object which has a number,
street and town. That is to say, type is individualistically
communicated by the object itself rather than by examining the
relationships described by its containing ancestors. JSONPath comes with
no such expressivity but I find this idea so simple and useful that I
have decided to create one. The JSONPath language is designed to
resemble programmatic Javascript access but Javascript has no syntax for
a list of value-free properties. The closest available is the object
literal format; my duck-type syntax is a simplification with values and
commas omitted. In the case of the addresses a duck-type expression
would be written as `{number street town}`. Generally, when identifying
items of a type from a document it makes sense if the type expression is
contravariant so that sub-types are also selected. If we consider that
we create a sub-duck-type when we add to a list of required fields and
super-duck-types when we remove them, we have a non-tree shaped type
space with root type `{}` which matches any object. Therefore, the
fields specified need not be an exhaustive list of the object's
properties.

The various means of discerning type which are constructable need not be
used exclusively. For example, `aaa{bbb ccc}` is a valid construction
combining duck typing and the relationship with the parent object.

JSONPath improving stability over upgrades
------------------------------------------

*need to look at this an check doesn't duplicate rest of diss*.

-   Use of `..` over `.`
-   Keep this short. Might not need diagram if time presses.

![extended json rest service that still works - maybe do a table instead
\label{enhancingrest}](images/placeholder)

Programming to identify a certain interesting part of a resource today
should with a high probability still work when applied to future
releases.

Requires some discipline on behalf of the service provider: Upgrade by
adding of semantics only most of the time rather than changing existing
semantics.

Adding of semantics should could include adding new fields to objects
(which could themselves contain large sub-trees) or a "push-down"
refactor in which what was a root node is pushed down a level by being
suspended from a new parent.

why JSONPath-like syntax allows upgrading message semantics without
causing problems [SOA] how to guarantee non-breakages? could publish
'supported queries' that are guaranteed to work

Importing CSS4's explicit capturing to Oboe's JSONPath
------------------------------------------------------

Sometimes when downloading a collection of items it is less useful to be
given each element individually than being kept up to date as the
collection is expanded. Certain Javascript libraries such as d3.js and
Angular interface more naturally with arrays of items than individual
entities. To allow integration with these libraries, on receiving an
array of items it is useful to be repeatedly passed the same containing
array whenever a new element is concatenated onto it.

Expressing a 'contained in' relationship comes naturally to JSONPath,
but no provision is made for a 'containing' relationship. Cascading
Style Sheets, or CSS, the web's styling language has long shared this
restriction but a recent proposal, currently at Editor's Draft stage
[@css4] provides an elegant means to cover this gap. Rather than add an
explicit 'containing' relationship, the css4 proposal observes that css
selectors have previously only allowed selection of the right-most of
the terms given, allowing only the deepest element mentioned to be
selected. This restriction is removed by allowing terms may be prefixed
with `$` in order to make them capturing: in the absence of an
explicitly capturing term the right-most continues to capture. Whereas
`form.important input.mandatory` selects for styling mandatory inputs
inside important forms, `$form.important input.mandatory` selects
important forms with mandatory fields.

Importing the CSS4 dollar into Oboe's JSONPath should make it much
easier to integrate with libraries which treat arrays as their basic
unit of operation and uses a syntax which the majority of web developers
are likely to be familiar with over the next few years.

Parsing the JSON Response
-------------------------

While SAX parsers provide an unfriendly interface to application
developers, as a starting point for higher-level parsers they work very
well (in fact, most XML DOM parsers are made in this way). The
pre-existing project Clarinet is well tested, liberally licenced and
compact, meeting the goals of this project perfectly. In fact, the name
of this project, Oboe.js, was chosen in tribute to the value delivered
by Clarinet.

API design
----------

*API allows body to be given as Object and converts into JSON because it
is anticipated that REST services which emmit JSON will also accept it*

In designing the API developer ergonomics are the top priority. This is
especially pertinent given that the library does nothing that can't be
done with existing tools such as JSON SAX parsers but that those tools
are not used because they require too much effort to form a part of most
developers' everyday toolkit.

*Expose single global.*

To pursue good ergonomics, I will study successful libraries and, where
appropriate, copy their APIs. We may assume that the existing libraries
have already over time come to refined solutions to similar problems.
Working in a style similar to existing libraries also makes the library
easier to learn. Lastly, if we create a library which functions
similarly enough to existing tools it should be easy to modify an
existing project to adopt it. In the most common use cases, it should be
possible to create a library with a close functional equivalence that
can be used as a direct drop-in replacement. Used in this way, no
progressive loading would be done but it opens the door for the project
taking up the library to be refactored towards a progressive model over
time. By imitating existing APIs we allow adoption as a series of small,
easily manageable steps rather than a single leap. This is especially
helpful for teams wishing to adopt this project working under Scrum
because all tasks must be self-contained and fit within a fairly short
timeframe.

jQuery's basic call style for making an AJAX GET request follows:

~~~~ {.javascript}
jQuery.ajax("resources/shortMessage.txt")
   .done(function( text ) {
      console.log( 'Got the text: ' + text ); 
   }).
   .fail(function(data) {
      console.log( 'the request failed' );      
   });
~~~~

While for simple web applications usage is much as above,\
In real world usage on more complex apps jQuery.ajax is often injected
into the scope of the code which wants to use it. Easier stubbing so
that tests don't have to make actual AJAX calls.

While certainly callback-based, the jQuery is somewhat implicit in being
event-based. There are no event names separate from the methods which
add the listeners and there are no event objects, preferring to pass the
content directly. The names used to add the events (done, fail) are also
generic, used for all asynchronous requests. The methods are chainable
which allows several listeners to be added in one statement.

By method overloading, if the request requires more information than the
parameter to `jQuery.ajax` may be an object. This pattern of accepting
function parameters as an object is a common in Javascript for functions
that take a large number of optional arguments because it makes
understanding the purpose of each argument easier to understand from the
callsite than if the meaning depended on the position in a linear
arguments list and the gaps filled in with nulls.

~~~~ {.javascript}
jQuery.ajax({ url:"resources/shortMessage.txt",
              accepts: "text/plain",
              headers: { 'X-MY-COOKIE': '123ABC' }
           });
~~~~

Taking on this style,

~~~~ {.javascript}
oboe('resources/someJson.json')
   .node( 'person.name', function(name, path, ancestors) {
      console.log("got a name " + name);   
   })
   .done( function( wholeJson ) {
      console.log('got everything');
   })
   .fail( function() {
      console.log('actually, the download failed. Forget the' + 
                  ' people I just told you about');
   });
~~~~

Because I foresee several patterns being added for most types of JSON
documents, a shortcut format is also available for adding multiple
patterns in a single call by using the patterns as the keys and the
callbacks as the values in a key/value mapping:

~~~~ {.javascript}
oboe('resources/someJson.json')
   .node({  
      'person.name': function(personName, path, ancestors) {
         console.log("let me tell you about " + name);
      },
      'person.address.town': function(townName, path, ancestors) {
         console.log("they live in " + townName);
      }
   });
~~~~

Note the path and ancestors parameters in the examples above. Most of
the time giving the callback the matching content is enough to be able
to act but it is easy to imagine cases where a wider context matters.
Consider this JSON:

~~~~ {.javascript}
{ 
   "event": "mens 100m",
   "date": "5 Aug 2012",
   "medalWinners": {
      "gold":     {"name": 'Bolt',    "time": "9.63s"},
      "silver":   {"name": 'Blake',   "time": "9.75s"},
      "bronze":   {"name": 'Gatlin',  "time": "9.79s"}
   }
}  
~~~~

Here we can extract the runners by the patterns such as `{name time}` or
`medalWinners.*` but clearly the location of the node in the document is
interesting as well as the context. The `path` parameter provides this
information by way of an array of strings plotting the descent from the
JSON root to the match, for example `['medalWinners', 'gold']`.
Similarly, the `ancestors` array is a list of the ancestors starting at
the immediate parent of the found node and ending with the JSON root
node. For all but the root node (which has no ancestors anyway) the
nodes in this list will be only partially parsed. Being untyped,
Javascript does not enforce the arity of the callback. Because much of
the time only the content itself is needed, the API design orders the
callback parameters to take advantage of the loose typing so that a
unary function taking only the content may be given.

For the widest context currently available, the whole document as it has
been parsed so far may be accessed using the `.root` method. Since
`.root` relates to the oboe instance itself rather than the callback
per-say, it can be accessed from any code with a reference to the oboe
object.

`http://nodejs.org/docs/latest/api/events.html#events_emitter_on_event_listener`

In node.js the code style is more obviously event-based. Listeners are
added via a `.on` method with a string event name given as the first
argument. Adopting this style, my API design for oboe.js also allows
events to be added as:

~~~~ {.javascript}
oboe('resources/someJson.json')
   .on( 'node', 'medalWinners.*', function(person, path, ancestors) {
      console.log( person.name + ' won the ' + lastOf(path) + ' medal' );
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
oboe('events.json')
   .path( 'medalWinners', function() {
      // We don't know the winners yet but we know we have some so let's
      // start drawing the table already:    
      interface.showMedalTable();
   })
   .node( 'medalWinners.*', function(person, path) {    
      interface.addPersonToMedalTable(person, lastOf(path));
   })
   .fail( function(){
      // That didn't work. Revert!
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
