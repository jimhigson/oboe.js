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
applicability to other platforms.

From DOM we may observe that as a programmer, using a resource is
simpler when a parsed entity is passed\
whole to a single callback, rather than the SAX model which requires the
programmer to infer the entity from a lengthy series of callbacks. From
observing SAX parsers or progressive HTML rendering, we can say that
http is more efficient if we no not wait until we have everything before
we start using the parts that we do have. DOM parsers pass a fully
parsed node to registered callbacks, whole and ready to use, invariably
at the root of the parsed document. From the vantage of the library's
user, my thesis duplicates this convenience but removes one restriction;
that the node which is passed must be the root. Because the mark-up
formats we are dealing with are hierarchical and serialised depth-first
it is possible to fully parse any sub-tree without fully knowing the
parent node. From these observations we may program a new kind of REST
client which is as performant as SAX but as easy to program as DOM.

Doing things faster vs doing things earlier. "Hurry up and wait"
approach to optimisation.

Like other ajax libs still callback-based but turn model for drilling
down inside out. Instead of the programmer finding the parts they want
as a part of the general logic of the program, declaratively define the
interesting parts and have these parts delivered to the language logic.
Once we make the shift to thinking in this way, it is no longer
necessary to have the whole resource locally before the interesting
sub-parts are delivered.

Under the heading I deconstructed the way in which programming logic is
often used to identify the parts of a model which are currently
interesting and started to look at some declarative ways in which these
parts can be obtained.

Why better than SAX: As a principle, the programmer should only have to
handle the cases which are interesting to them, not wade manually
through a haystack in search of a needle, which means the library should
provide an expressive way of associating the nodes of interest with
their targeted callbacks.

In which a callback call is received not just when the whole resource is
downloaded but for every interesting part which is seen while the
transfer is ongoing. The definition of 'interesting' will be generic and
accommodating enough so as to apply to any data domain and allow any
granularity of interest, from large object to individual datums. With
just a few lines of programming

![Over several hops of aggregation, the benefits of finding the
interesting parts early](images/timeline)

Interestingly, the mixed paradigm design hasn't changed the top-level
design very much from how it'd be as a pure OO project (IoC, decorators,
event filters, pub/sub etc).

Programming to identify a certain interesting part of a resource today
should with a high probability still work when applied to future
releases.

Requires a small amount of discipline on behalf of the service provider:
Upgrade by adding of semantics only most of the time rather than
changing existing semantics.

Adding of semantics should could include adding new fields to objects
(which could themselves contain large sub-trees) or a "push-down"
refactor in which what was a root node is pushed down a level by being
suspended from a new parent. See \ref{enhancingrest}

![extended json rest service that still works - maybe do a table instead
\label{enhancingrest}](images/placeholder)

Stability over upgrades
-----------------------

why jsonpath-like syntax allows upgrading message semantics without
causing problems [SOA] how to guarantee non-breakages? could publish
'supported queries' that are guaranteed to work

JsonPATH variation
------------------

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

API design
----------

Micro-library
-------------

What a Micro-library is. What motivates the trend? This library has a
fairly small set of functionality, it isn't a general purpose
do-everything library like jQuery so its size will be looked at more
critically if it is too large. Micro library is the current gold
standard for compactness. Still, have a lot to do in not very much code.

Where to target
---------------

targeting node and the browser

Node+browser To use Node.js and

Need to build an abstraction layer over xhr/xhr2/node. Can only work for
packets in-order, for out-of-order packets something else happens.

Use best of the capabilities of each.

Incorporating existing libraries
--------------------------------

can justify why js as:

Most widely deployable.

Node: asynchronous model built into language already, no 'concurrent'
library needed. Closures convenient for picking up again where left off.

Node programs often so asynchronous and callback based they become
unclear in structure. Promises approach to avoid pyramid-shaped code and
callback spaghetti.

~~~~ {.javascript}
// example of pyramid code
~~~~

In comparison to typical Tomcat-style threading model. Threaded model is
powerful for genuine parallel computation but Wasteful of resources
where the tasks are more io-bound than cpu-bound. Resources consumed by
threads while doing nothing but waiting.

Compare to Erlang. Waiter model. Node restaurant much more efficient use
of expensive resources.

functional, pure functional possible [FPR] but not as nicely as in a
pure functional language, ie function caches although can be
implemented, not universal on all functions.

easy to distribute softare (npm etc)

Handling failures
-----------------

(not) Resume on failure

Http 1.1 provides a mechanism for Byte Serving via the Accepts-Ranges
header [http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html\#sec14.5]
which can be used to request any contiguous part of a response rather
than the whole. Common in download managers but not REST clients. This
ability can be used to. Why not this one. Resume on a higher semantic
level.

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
