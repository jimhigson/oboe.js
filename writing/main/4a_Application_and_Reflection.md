Application and Reflection 1: what is it?
=========================================

High-level solution
-------------------

Using a combination of the techniques investigated in the previous
chapter, I propose that a simple design is possible which makes REST
clients more efficient whilst being no more difficult to program.
Although simple, this model fits poorly with established vocabulary,
requiring a transport that sits **somewhere between 'stream' and
'download'** and a parsing strategy which takes elements from **SAX and
DOM** but follows neither model.

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

JsonPATH variation
------------------

In searching through a model stocked with data is common to ask for
database-style queries such as 'books costing more than X'. However, not
searching, selecting from a resource that the programmer has requested,
probably assembled on their behalf by their parameters where we can
expect the developer to be interested in most of the content. Modify
JSONPath for this actual situation. Avoid implementing, at least at
first, the language features which are less likely to be used and are
easily tested for inside the callback. At same time, add features which
are more likely to be useful for this context.

We impose types on top of JSON/XML markup. Only few basic types defined
in the markup languages themselves. Essence of marshaling.

Whereas XML has a pretty good concept of the type of an element (beyond
simply being an element node) in the tagName, JSON's objects are all
simply objects. In JSON the type of a node is usually inferred in one of
two ways: either, the fieldName in the parent object which references a
node; or, from the fields that the object has.

In the below example, we assign the node the type 'address' because of
the parent node's field name. Other than this, these are standard arrays
of strings:

~~~~ {.javascript}
{
   name: '',
   residence: {
      address: [
         '', '', ''
      ]
   },
   employer: {
      name: '',
      address :[
         '', '', ''      
      ]
   }   
}
~~~~

As a slight variant, when dealing with multiple addresses in an array,
it is the grandparent's node field name which indicates the type, the
parent being the array containing the multiple addressees:

~~~~ {.javascript}
{
   residences: {
      addresses: [
         ['Beach Hut', 'Secret Island', 'Bahamas']
      ,  ['', '', '']
      ,  ['', '', '']
      ,  ['', '', '']
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
   name: '',
   residence: {
      number:'', street:'', town:'' 
   },   
   employer:{
      name: ''
      premises:[
         { number:'', street:'', town:'' },
         { number:'', street:'', town:'' },
         { number:'', street:'', town:'' }
      ],
      registeredOffice:{
         number:'', street:'', town:''
      }
   }
}  
~~~~

Duck typing is of course a much looser concept than an XML document's
tag names and collisions are possible where objects co-incidentally
share property names. In practice however, I find the looseness a
strength more often than a weakness. Under a tag-based marshalling from
an OO language, sub-types are assigned a new tag name and as a consumer
of the document, the 'isa' relationship between a 'class' tagname and
it's 'sub-tabname' may be difficult to track. It is likely that if I'm
unaware of this, I'm not interested in the extended capabilities of the
subclass and would rather just continue to recieve the base superclass
capabilities as before. Under duck typing this is easy - becase the data
consumer lists the

Relationship between type of a node and its purpose in the document.
Purpose is often obvious from a combination of URL and type so can
disregard the place in the document. This structure may be carefully
designed but ultimately a looser interpretation of the structure can be
safer.

![extended json rest service that still works - maybe do a table instead
\label{enhancingrest}](images/placeholder)

Stability over upgrades
-----------------------

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

why jsonpath-like syntax allows upgrading message semantics without
causing problems [SOA] how to guarantee non-breakages? could publish
'supported queries' that are guaranteed to work

Incorporating existing libraries
--------------------------------





API design
----------


Micro-library
-------------

5120 bytes.

What a Micro-library is. What motivates the trend? This library has a
fairly small set of functionality, it isn't a general purpose
do-everything library like jQuery so its size will be looked at more
critically if it is too large. Micro library is the current gold
standard for compactness. Still, have a lot to do in not very much code.

This project feels on the edge of what is possible to elegantly do in 5k, so 
while the limit is somewhat arbitrary, it is an interesting challenge. 

Handling failures
-----------------



Http 1.1 provides a mechanism for Byte Serving via the Accepts-Ranges
header [http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html\#sec14.5]
which can be used to request any contiguous part of a response rather
than the whole. Common in download managers but not REST clients. This
ability can be used to. Why not this one. Resume on a higher semantic
level.

(not) Resume on failure at byte level but might be worked in on a future version.
Probably unsafe since can't guarantee the 2nd time requesting a URL will give the
same response byte-for-byte.

Required support for older browsers
-----------------------------------

Aims not possible to realise but don't want to make devs using lib have
to special-case.

Still works as well as non-progressive json Could be used for content
that is inherently streaming (wouldn't make sense without streaming)

The decline of bad browsers. Incompatibility less of a concern than it
was.

http://www.jimmycuadra.com/posts/ecmascript-5-array-methods Unlike the
new methods discussed in the first two parts, the methods here are all
reproducible using JavaScript itself. Native implementations are simply
faster and more convenient. Having a uniform API for these operations
also promotes their usage, making code clearer when shared between
developers.

Even when only used once, preferable to polyfill as a generic solution
rather than offer a one-time implementation because it better splits the
intention of the logic being presented from the mechanisms that that
logic sits on and, by providing abstraction, elucidates the code.

Older browsers: getting the whole message at once is no worse than it is
now.
