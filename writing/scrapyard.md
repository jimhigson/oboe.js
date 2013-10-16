delivery methodology
--------------------

Because Kanban focusses on always having a potentially releasable
product, it mitigates problems which could otherwise lead to
non-delivery and allows the direction to be changed while the project is
in progress. For each unit of work (under Kanban, a card), an entire
vertical slice of planning, design, implementation and reflection must
be complete before going onto the next card. Alongside each software
feature, every written chapter will be expanded and refactored in much
the same way as the code. Just as for well designed software, the order
of implementation should not be apparent to a user, my plan is that the
written work should not feel disjointed for having been written
non-sequentially. I plan to manage the Kanban process using paper only,
with cards on a physical board.

node libraries
--------------

Node comes with very little built in (not even http) but relies on
libraries written in the language itself to do everything. Could
implement own http on top of sockets if wanted rather than using the
provided one.

components
----------

I have found that the problem decomposes nicely into loosely-coupled
components, each quite unconcerned with its neighbours. The component
boundaries have been drawn to give a maximum separation of concerns
whilst also allowing a high degree of certainly with regards to
correctness.

test
----

Conversely, automated testing allows us to write incomprehensible code
by making us into more powerful programmers, it is possible building up
layers of complexity one very small part at a time that we couldn't
write in a simple stage. Clarity \> cleverness but cleverness has its
place as well (introducing new concepts)

old proxy in front of jstd
--------------------------

Testing via node to give something to test against - slowserver. Proxy.
JSTD not up to task. Shows how useful node is as a 'network glue'. The
same as C was once described as a 'thin glue'
[http://www.catb.org/esr/writings/taoup/html/ch04s03.html]. Transparent
proxy is about 20 lines. Transparent enough to fool JSTD into thinking
it is connecting directly to its server.

testing real behaviours rather than implementation
--------------------------------------------------

A good test should be able to go unchanged as the source under test is
refactored. Indeed, the test will be how we know that the code under
test still works as intended. Experince tells me that testing that A
listens to B (ie that the controller wires the jsonbuilder up to
clarinet) produces the kind of test that 'follows the code arround' as
it is edited meaning that because it is testing implementation details
rather than behaviours, whenever the implementation is updated the tests
have to be updated too.

tdd and oo
----------

TDD fits well into an object pattern because the software is well
composed into separate parts. The objects are almost tangible in their
distinction as separate encapsulated entities.

![Diagram showing why list is more memory efficient - multiple handles
into same structure with different starts, contrast with same as an
array](images/placeholder)

code style
----------

Different ways to do currying below:

Partial completion is implemented using the language itself, not
provided by the language.

Why would we choose 1 over the other? First simpler from caller side,
second more flexible. Intuitive to call as a single call and can call
self more easily.

In same cases, first form makes it easier to communicate that the
completion comes in two parts, for example:

~~~~ {.javascript}
 namedNodeExpr(previousExpr, capturing, name, pathStack, nodeStack, stackIndex )
~~~~

In first case, can avoid this:
`consume1( partialComplete(consumeMany, previousExpr, undefined, undefined), undefined, undefined, pathStack, nodeStack, stackIndex);`
because function factory can have optional arguments so don't have to
give all of them

Function factory easier to debug. 'Step in' works. With
partialCompletion have an awkward proxy function that breaks the
programmer's train of thought as stepping through the code.

Why it is important to consider the frame of mind of the coder (CITEME:
Hackers and Painters) and not just the elegance of the possible language
expressions.

If implementing own functional caching, functional cache allows two
levels of caching. Problematic though, for example no way to clear out
the cache if memory becomes scarce.

Functional programming tends to lend better to minification than
OO-style because of untyped record objects (can have any keys).

Lack of consistency in coding (don't write too much, leave to the
conclusion)

Final consideration of coding: packaging up each unit to export a
minimal interface.

-   Why minimal interfaces are better for minification

Need to build an abstraction layer over xhr/xhr2/node. Can only work for
packets in-order, for out-of-order packets something else happens.

functional, pure functional possible [FPR] but not as nicely as in a
pure functional language, ie function caches although can be
implemented, not universal on all functions.

Although the streams themselves are stateful, because they are based on
callbacks it is entirely possible to use them from a component of a
javascript program which is wholly stateless.

"Mixed paradigm" design. But not classical: don't need inheritance.

JSONPath
--------

There is a construction part (first 3 args) and a usage part (last
three). Comsume many can only be constructed to ues consume 1 in second
style because may refer to its own paritally completed version.

ICB evolution
-------------

On first attempt at ICB, had two stacks, both arrays, plus reference to
current node, current key and root node. After refactorings, just one
list was enough. Why single-argument functions are helpful (composition
etc)

Clarinet
--------

There are some peculiarities of Clarinet, these are kept as local as
possible. Such as the field name given with the open object and
internally normalises this by handling as if it were two events.

Because Clarinet is a SAX parser, the calls that I receive from it are
entirely context free; it is my responsibility to build this context.

Luckily, it should be easy to see that building up this context is a
simple matter of maintaining a stack describing the descent from the
root node to the current node.

evolution
---------

The code presented is the result of the development many prior versions,
it has never been rewritten in the sense of starting again. Nonetheless,
every part has been complely renewed several times. I am reviewing only
the final version. Git promotes regular commits, there have been more
than 1000.

Making stateless
----------------

A refactoring was used to separate logic and state:

-   Take stateful code
-   Refactor until there is just one stateful item
-   This means that that item is reassigned rather than mutated
-   Make stateless by making all functions take and return an instance
    of that item
-   Replace all assignment of the single stateful var with a return
    statement
-   Create a simple, separate stateful controller that just updates the
    state to that returned from the calls

Very testable code because stateless - once correct for params under
test, will always be correct. Nowhere for bad data to hide in the
program.

lists are fail-fast
-------------------

By going to List-style, enforced that functions fail when not able to
give an answer. Js default is to return the special 'undefined' value.
Why this ensured more robustness but also sometimes took more code to
write, ie couldn't just do if( tail(foo)) if foo could be empty but most
of the time that would be correct

Callback and mutability Problem
-------------------------------

Stateful controller very easy to test - only 1 function.

Javascript provides no way to decalre an object with 'cohorts' who are
allowed to change it whereas others cannot - vars may be hidden via use
of scope and closures (CITE: crockford) but attributes are either
mutable or immutable.

Why this is a problem.

-   bugs likely to be attributied to oboe because they'll be in a future
    *frame of execution*. But user error.

Potential solutions:

-   full functional-style immutability. Don't change the objects, just
    have a function that returns a new one with one extra property.
    Problem - language not optimised for this. A lot of copying. Still
    doesn't stop callback receiver from changing the state of hte object
    given. (CITE: optimisations other languages use)
-   immutable wrappers.
-   defensive cloning
-   defining getter properties

Preferring functions over constructors (subsume into above section?)
--------------------------------------------------------------------

What constructors are in js. Any function, but usually an uppercase
initial char indicates that it is intended to be used as a constructor.

Inheritence is constructed using the language itself. While this is more
flexible and allows each project to define a bespoke version of
inherience to suit their particular needs or preferences, it also
hampers portability more than an 'extends' keyword would.

> So far, the JavaScript community has not agreed on a common
> inheritance library (which would help tooling and code portability)
> and it is doubtful that that will ever happen. That means, we’re stuck
> with constructors under ECMAScript 5.
> http://www.2ality.com/2013/07/defending-constructors.html

Functions can be like Factories, gives me the flexability to chagne how
something is created but by exposing a constructor are stuck with using
'new' to create an instance of exactly one type. 'new' is inconsistent
invocation with rest of language.

Dart has 'factory' constructors which are called like constructors but
act like factory functions:
(http://www.dartlang.org/docs/dart-up-and-running/contents/ch02.html\#ch02-constructor-factory)

compiling JSONPath
------------------

The style of implementation of the generator of functions corresponding
to json path expressions is reminiscent of a traditional parser
generator, although rather than generating source, functions are
dynamically composed. Reflecting on this, parser gens only went to
source to break out of the ability to compose the expressive power of
the language itself from inside the language itself. With a functional
approach, assembly from very small pieces gives a similar level of
expressivity as writing the logic out as source code.

JS language
-----------

Javascript: not the greatest for 'final' elegant presentation of
programming. Does allow 'messy' first drafts which can be refactored
into beautiful code. An awareness of beautiful languages lets us know
the right direction to go in. An ugly language lets us find something
easy to write that works to get us started. Allows a very sketchy
program to be written, little more than a programming scratchpad.

Without strict typing, hard to know if program is correct without
running it. In theory (decidability) and in practice (often find errors
through running and finding errors thrown). Echo FPR: once compiling,
good typing tends to give a reasonable sureness that the code is
correct.

Aphorisms
---------

Programming is finished when each line reads as a necessary statement,
not pleading to make the obvious so.

Compilers, functional
---------------------

The performance degradation, even with a self-hosted forEach, is due to
the JIT’s inability to efficiently inline both the closures passed to
forEach

Development methodology
-----------------------

Did it help?

Switched several times. Could have started with winning side? Tension
between choosing latest and greatest (promising much) or old established
solution alraedy experienced with but with known problems. Judging if
problems will become too much of a hinderence and underestimating the
flaws. JSTD was yesterday's latest and greatest but Karma genuinely is
great. In end, right solution was found despite not being found in most
direct way.

Packaging was a lot of work but has delivered the most concise possible
library.

Community reaction
------------------

Built into Dojo Followers on Github Being posted in forums (hopefully
also listed on blogs) No homepage as of yet other than the Github page

Http blargh
-----------

Aborting http request may not stop processing on the server. Why this is
perhaps desirable - transactions, leaving resources in a half-complete
state.

From top of 3. background -- some good stuff here perhaps
---------------------------------------------------------

Although born on the network, at inception the web wasn't particularly
graphical and didn't tread in the steps of networked graphical
technologies such as X11 in which every presentation decision was made
on a remote server [\^1] -- instead of sending fine-grained graphical
instructions, a much more compact document mark-up format was used. At
the same time, the markup-format was unlike like Gopher by being not
totally semantic meaning that presentation layer concerns were kept
partially resident on the server. At this time, whereas CGI was being
used to serve documents with changeable content, it was not until 1996
with *ViaWeb* (later to become Yahoo Stores) that a user could be given
pages comparable in function to the GUI interface of a desktop
application. [@otherRoad - get page number, in old dis]. The interface
of these early web applications comprised of pages dynamically generated
on the server side, but handled statically on the client side so far as
the browser was not able to be scripted to manipulate the page in any
way.

The modern, client-scripted web bears a striking resemblance to NeWS.
Rather than send many individual drawings, the server could send
parametrised instructions to show the client *how* some item of
presentation is drawn. Having received the program, the only
communications required are the parameters. This mixed-model provides no
lesser degree of server-side control but by using client-side rendering
a much faster experience was possible than would otherwise be possible
over low-speed networks [@news].

Web developers agree that program
architecture should separate presentation from operational logic but
there is no firm consensus on where each concern should be exercised.

Javascript has proven very effective as the language to meet
Node's design goals but this suitability is not based on Javascript's
association with web browsers, although it is certainly beneficial: for
the first time it is possible to program presentation logic once which
is capable of running on either client or server. Being already familiar
with Javascript, web programmers were the first to take up Node.js first
but the project mission statement makes no reference to the web; Node's
architecture is well suited to any application domain where low-latency
responses to i/o is more of a concern than heavyweight computation. Web
applications fit well into this niche but they are far from the only
domain that does so.

Being single-threaded, Node realises concurrency by setting up i/o
libraries in such a way that programming is strongly encouraged to be
decomposed into many quickly completed tasks.

Node streams
------------

> Streams in node are one of the rare occasions when doing something the
> fast way is actually easier. SO USE THEM. not since bash has streaming
> been introduced into a high level language as nicely as it is in
> node." [high level node style guide](https://gist.github.com/2401787)

Bash streams a powerful abstraction easily programmed for linear
streaming. Node more powerful, allows a powerful streaming abstraction
which is no more complex to program than a javascript webapp front end.
Essentially a lower-level (and therefore more powerful) interface to
streaming such as unix sockets or tcp connections.