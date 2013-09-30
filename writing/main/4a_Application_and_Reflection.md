Application and Reflection:
===========================

Using a combination of the techniques investigated in the previous
chapter, I propose that a simple design is possible which makes REST
clients more efficient whilst being no more difficult to program.
Although simple, this model fits poorly with established vocabulary,
requiring a transport that sits *somewhere between 'stream' and
'download'* and a parsing strategy which *takes elements from SAX and
DOM* but follows neither model.

Implementation in Javascript gives me the widest deployment options,
covering client-side browser programming, server programming, use in
command line tools, or any other usage. This context dictates a design
which is non-blocking, asynchronous and callback based. While influenced
by the language, the model of REST client proposed here is not limited
to Javascript or web usage and I intent to comment briefly also on the
applicability to other platforms. Likewise, I have also chosen to focus
on JSON although I will also be commenting on the parallel applicability
of these ideas to XML.

From DOM we may observe that as a programmer, using a resource is
simpler when a parsed entity is passed whole to a single callback,
rather than the SAX model which requires the programmer to infer the
entity from a lengthy series of callbacks. From observing SAX parsers or
progressive HTML rendering, we can say that http is more efficient if we
no not wait until we have everything before we start using the parts
that we do have. DOM parsers pass a fully parsed node to registered
callbacks, whole and ready to use, invariably at the root of the parsed
document. From the vantage of the library's user, my thesis duplicates
this convenience but removes one restriction; that the node which is
passed must be the root. Because the mark-up formats we are dealing with
are hierarchical and serialised depth-first it is possible to fully
parse any sub-tree without fully knowing the parent node. From these
observations we may program a new kind of REST client which is as
performant as SAX but as easy to program as DOM.

To follow this progressive-but-complete model, identifying the
interesting parts of a document involves turning the traditional model
for drilling down inside-out. Traditionally the programmer's callback
receives the document then inside that callback drills down to locate
the parts that they are interested in. Instead I propose taking the
drilling-down logic out from inside the callback and instead wrap the
callback in it. This means that the callback receives selected parts of
the response which the library has already drilled down to on behalf of
the programmer.

Whilst JSONPath's existing implementation is only implemented for
searching over already gathered objects, this kind of searching is just
one application for the query language. I find that this is a very
suitable declarative language to use to specify the parts of a response
that a developer would like to drill-down to given the context of a
document whose parse is in progress. JSONPath is especially applicable
because it specifies only 'contained-in/contains' type relationships. On
encountering any node in a serialised JSON stream, because of the
depth-first serialisation order I will always have previously seen its
ancestors. Hence, having written a suitably flexible JSONPath expression
compiler such that it does not require a complete document, I will have
enough information to evaluate any expression against any node at the
time when it is first identified in the document. Because XML is also
written depth-first, the same logic would apply to an XPath/XML variant
of this project.

The definition of 'interesting' will be generic and accommodating enough
so as to apply to any data domain and allow any granularity of interest,
from large object to individual datums. With just a few lines of
programming

JSONPath expressions
--------------------

Given its use to identify interesting parts of a document, not all of
the published JSONPath spec is useful. Parts of a document will be
considered interesting because of their type, position, or both. This
contrasts with filter-type queries such as 'books costing less than X'.
Examining REST responses it is likely we will not be explicitly
searching through a full model but rather selecting from a resource
subset that the programmer requested, assembled on their behalf using
their parameters so we can expect the developer to be interested in most
of the content. In creating a new JSONPath implementation, I have chosen
to follow the published spec only loosely, thereby avoiding writing
unnecessary code. This is especially the case, as in the books example
above whereby a user of the library could easily add the filter in the
callback itself. Following the principle of writing less, better I feel
it is better to deliver only the features I am reasonably certain will
be well used but keep open the ability to add more later should it be
required.

JSON markup describes only a few basic types. On a certain level this is
also true for XML -- most nodes are of either type Elements or Text.
However, the XML metamodel provides tagnames, essentially a built-in
Element sub-typing mechanism. Floating above this distinction, a reader
abstracting over the details of the markup may forget that a node is an
Element instance and describe it as an instance of its tagname, without
considering that the tagname is a sub-type of Element. JSON comes with
no such built-in type description language. On top of JSON's largely
typeless model we often place a concept of type. Drawing parallels with
the physical world, this imposition of type is the responsibility of the
observer, rather than of the observed. A document reader has a free
choice of the taxonomy they will use to impose type on the parts of the
document, and this decision will vary depending on the purpose of the
reader. The specificity required of a taxonomy differs by the level of
involvement in a field, whereas 'watch' may be a reasonable type to most
data consumers, to a horologist it is unlikely to be satisfactory
without further sub-types. In the scope of this dissertation, since
selecting on type is desirable, my JSONPath variant must be able to
distinguish types at various levels of specificity; whilst my selection
language will have no inbuilt concept of type, the aim is to support
programmers in creating their own.

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

In the below example, we assign the node the type 'address' because of
the parent node's field name. Other than this, these are standard arrays
of strings:

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
against

By sensible convention, even in a serialisation format which allows
lists of disparate types, lists contain only items of equivalent type.
This gives way to a sister convention seen in the below example, when
serialising with multiple addresses in an array, it is the grandparent's
node field name which indicates the type, the parent being the array
containing the multiple addressees:

~~~~ {.javascript}
{
   residences: {
      addresses: [
         ['Townhouse', 'Street', 'Some town']      
      ,  ['Beach Hut', 'Secret Island', 'Bahamas']
      ]
   }
}
~~~~

In this third example, the field names linking to addresses refer to the
relationship between the parent and child nodes rather than the type of
the child. The address type is more easily recognised by its list of
fields rather than its position in the document:

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

A second approach is to use duck typing in which the relationship of the
object to its ancestors is not examined but the properties of the object
are used instead to communicate an enhanced concept of type. For
example, we might say that any object with an isbn and a title is a
book.

Duck typing is of course a much looser concept than an XML document's
tag names and collisions are possible where objects co-incidentally
share property names. In practice however, I find the looseness a
strength more often than a weakness. Under a tag-based marshaling from
an OO language, sub-types are assigned a new tag name and as a consumer
of the document, the 'isa' relationship between a 'class' tagname and
it's 'sub-tagname' may be difficult to track. It is likely that if I'm
unaware of this, I'm not interested in the extended capabilities of the
subclass and would rather just continue to receive the base superclass
capabilities as before. Under duck typing this is easy - because the
data consumer lists the

A final concept of type in json comes in the form of taking the first
property of an object as being the tagname. Unsatisfactory, objects have
an order while serialised as json but once deserialised typically have
no further order. Clarinet.js seems to follow this pattern, notifying of
new objects only once the first property's key is known so that it may
be used to infer type. Can't be used with a general-purpose JSON writer
tool, nor any JSON writer tool that reads from common objects.

Relationship between type of a node and its purpose in the document.
Purpose is often obvious from a combination of URL and type so can
disregard the place in the document. This structure may be carefully
designed but ultimately a looser interpretation of the structure can be
safer.

To extend JSONPath to support a concise expression of duck typing, I
chose a syntax which is similar to fields in jsonFormat:

~~~~ {.javascript}

{
   "name": "..."
,  "address": "..."
,  "email": "..."
}
~~~~

`{name address email}` The above JSONPath expression would match this
object in json expression and like all json path expressions the pattern
is quite similar to the object that it matches. The object below matches
because it contains all the fields listed in between the curly braces in
the above json path expresson.

CSS4-style capturing. Reshuffle 'root' syntax to accommodate ! and \$.

![UML class diagram showing a person class in relationship with an
address class. In implementation as Java the 'hasAddress' relationship
would typically be reified as a getAddress method. This co-incidence of
object type and the name of the field referring to the type lends itself
well to the tendency for the immediate key before an object to be taken
as the type when Java models are marshaled into json
\label{marshallTypeFig}](images/marshall)

Stability over upgrades
-----------------------

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

Parsing the JSON
----------------

While SAX parsers provide an unfriendly interface to application
developers, as a starting point for higher-level parsers they work very
well (in fact, most XML DOM parsers are made in this way). The
pre-existing project Clarinet is well tested, liberally licenced and
compact, meeting the goals of this project perfectly. In fact, the name
of this project, Oboe.js, was chosen in tribute to the value delivered
by Clarinet.

API design
----------

In designing the API developer ergonomics are the top priority. This is
especially pertinent given that the library does nothing that can't be
done with existing tools such as JSON SAX parsers but that those tools
are not used because they require too much effort to form a part of most
developers' everyday toolkit.

Expose single global.

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
   .error( function() {
      console.log('actually, the download failed. Forget the' + 
                  ' people I just told you about');
   });
~~~~

Because I forsee several patterns being added for most types of JSON
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

Micro-library
-------------

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

Responding to failures
----------------------

*is this section really needed?*

As discussed above in API design, errors due to the transport will cause
a callback to be returned to the calling application.

Not automatic, just inform user. Most of the time will want to perform
some kind of rollback from optimistic locking.

I did consider the option of automatially resuming failed requests. Http
1.1 provides a mechanism for Byte Serving via the Accepts-Ranges header
[http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html\#sec14.5] which
can be used to request any contiguous part of a response rather than the
whole. However, having examined this option I came to the conclusion
that this approach would be brittle because it assumes two requests to
the same URL will give exactly the same response.

A better option

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
