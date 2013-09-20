Application and Reflection 1: what is it?
=========================================

High-level solution
-----------------

Doing things faster vs doing things earlier. "Hurry up and wait"
approach to optimisation.

A feature set which is minimal but contain no obvious omissions.

Under the heading [Anatomy of a SOA client] I deconstructed the way in
which programming logic is often used to identify the parts of a model
which are currently interesting and started to look at some declarative
ways in which these parts can be obtained.

Turn this model inside out. Instead of the programmer finding the parts
they want as a part of the general logic of the program, declaratively
define the interesting parts and have these parts delivered to the
language logic. Once we make the shift to thinking in this way, it is no
longer necessary to have the whole resource locally before the
interesting sub-parts are delivered.

Why not SAX: As a principle, the programmer should only have to handle
the cases which are interesting to them, not wade manually through a
haystack in search of a needle, which means the library should provide
an expressive way of associating the nodes of interest with their
targeted callbacks.

In which a callback call is received not just when the whole resource is
downloaded but for every interesting part which is seen while the
transfer is ongoing. The definition of 'interesting' will be generic and
accommodating enough so as to apply to any data domain and allow any
granularity of interest, from large object to individual datums. With
just a few lines of programming

Older browsers: getting the whole message at once is no worse than it is
now.

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

Micro-lib
---------

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

Stability over upgrades
-----------------------

why jsonpath-like syntax allows upgrading message semantics without
causing problems [SOA] how to guarantee non-breakages? could publish
'supported queries' that are guaranteed to work

Suitability for databases (really just an inline asside)
--------------------------------------------------------

Databases offer data one row at a time, not as a big lump.

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