Implementation
==============

Components of the project
-------------------------

![**Major components that make up Oboe.js** showing flow from http
transport to registered callbacks. Every component is not shown here.
Particularly, components whose responsibility it is to initialise the
oboe instance but have no role once it is running are omitted. UML
facet/receptacle notation is used to show the flow of events with event
names in capitals.](images/overallDesign.png)

Oboe's architecture has been designed to so that I may have as much
confidence as possible regarding the correct working of the library
through automated testing. Designing a system to be amenable to testing
in this case meant splitting into many co-operating parts each with an
easily specified remit.

Although there is limited encapsulation to follow an OO-style
arrangement, data is hidden. Outside of Oboe, only a restricted public
API is exposed. Not only are the internals inaccessible, they are
unaddressable. With no references attached to any external data
structures, most data exists only as captured within closures.

Internally, communication between components is facilitated by an event
bus which is local to to Oboe instance, with most components interacting
solely by picking up events, processing them and publishing further
events in response. Essentially, Oboe's architecture resembles a fairly
linear pipeline visiting a series of units, starting with http data and
sometimes ending with callbacks being notified. This use of an event bus
is a variation on the Observer pattern which removes the need for each
unit to obtain a reference to the previous one so that it may observe
it, giving a highly decoupled shape to the library. Once everything is
wired into the bus very little central control is required and the
larger behaviours emerge as the consequence of this interaction between
finer ones. One downside is perhaps that a central event bus does not
lend itself to a UML class diagram, giving a diagram shape with an event
bus as a central hub and everything else hanging off it as spokes.

Automated testing
-----------------

Automated testing improves what can be written, not just making what is
written more reliable. Tests deal with the problem of "irreducible
complexity" - when a program is made out of parts whose correct
behaviour cannot be observed without all of the program. Allows smaller
units to be verified before verifying the whole.

![The testing pyramid is a common concept, relying on the assumption
that verification of small parts provides a solid base from which to
compose system-level behaviours. A Lot of testing is done on the
low-level components of the system, less on the component level and less
still on a whole-system level where only smoke tests are
provided.](images/pyramid)

The testing itself is a non-trivial undertaking with 80% of code written
for this project being test specifications. Based on the idea that a
correct system must be built from individually correct units, the
majority of the specifications are unit tests, putting each unit under
the microscope and describing the correct behaviour as completely as
possible. Component tests zoom out from examining individual components
to focus on their correct composition, falsifying only the http traffic.
To avoid testing implementation details the component tests do not look
at the means of coupling between the code units but rather check for the
behaviours which should emerge as a consequence of their composition. At
the apex of the test pyramid are a small number of integration tests.
These tests check all of Oboe, automatically spinning up a REST service
so that the correctness of the whole library may be examined against an
actual server.

The desirable to be amenable to testing influences the boundaries on
which the application is split into separately implemented components.
Black-box unit testing of a stateful unit is difficult; because of
side-effects it may later react differently to the same calls. For this
reason where state is required it is stored in very simple state-storing
units with intricate program logic removed. The logic may then be
separately expressed as functions which map from one state to the next.
Although comprehensive coverage is of course impossible and tests are
inevitably incomplete, for whatever results the functions give while
under test, uninfluenced by state I can be sure that they will continue
to give in any future situation. The separate unit holding the state is
trivial to test, having exactly one responsibility: to store the result
of a function call and later pass that result to the next function. This
approach clearly breaks with object oriented style encapsulation by not
hiding data behind the logic which acts on them but I feel the departure
is worthwhile for the greater certainty it allows over the correct
functioning of the program.

Largely for the sake of testing Oboe has also embraced dependency
injection. This means that components do not create the further
components that they require but rather rely on them being provided by
an external wiring. The file `wire.js` performs the actual injection.
One such example is the streamingHttp component which hides various
incompatible http implementations by publishing their downloaded content
progressively via the event bus. This unit does not know how to create
the underlying browser XHR which it hides. Undoubtedly, by not
instantiating its own dependencies a it presents a less friendly
interface, although this is mitigated somewhat by the interface being
purely internal, the objects it depends on are no longer a hidden
implementation detail but exposed as a part of the component's API. The
advantage of dependency injection here is that unit testing is much
simpler. Unit tests should test exactly one behaviour of one unit. Were
the streaming http object to create its own transport, that part would
also be under test, plus whichever external service that it connects to.
Because Javascript allows redefinition of built in types, this could be
avoided by overwriting the XHR constructor to return a mock but
modifying the built in types for tests opens up the possibilities of
changes leaking between cases. Dependency injection allows a much
simpler test style because it is trivial to inject a stub in place of
the XHR.

Asserter test design pattern and BDD style. Tests otherwise repetitive.

Integration tests run against a node service which returns known content
according to known timings, somewhat emulating downloading via a slow
internet connection. For example, the url `/tenSlowNumbers` writes out a
JSON array of the first ten natural numbers at a rate of one per second,
while `/echoBackHeaders` writes back the http headers that it received
as a JSON object. The test specifications which use these services
interact with Oboe through the public API alone as an application author
would and try some tricky cases. For example, requesting ten numbers but
registering a listener against the fifth and aborting the request on
seeing it. The correct behaviour is to get no callback for the sixth,
even when running on platforms where the http is buffered so that all
ten will have already been downloaded.

Running the tests
-----------------

![**Relationship between various files and test libraries** *other half
of sketch from notebook*](images/placeholder.png)

The Grunt task runner was used to automate routine tasks such as
executing the tests and building. Unit and component tests run
automatically whenever a source file changes. As well as being correct
execution, the project is required to not surpass a certain size so the
built size is also checked. As a small, tightly focused project the
majority of programming is refactoring already working code. Running
tests on save provides quick feedback so that mistakes are found as soon
as they are made. Agile practitioners emphasise the importance of tests
that execute quickly [@cleancode P314, T9], the 220 unit and component
tests run in less than a second so discovering mistakes is near instant.
If the "content of any medium is always another medium” [@media p8], we
might say that the content of programming is the program that is
realised by its execution. A person working in arts and crafts sees the
thing as they work but a programmer will usually not see the execution
simultaneously as they program. Conway observed that an artisan works by
transform-in-place "start with the working material in place and you
step by step transform it into its final form" whereas software is
created through intermediate proxies, and attempts to close this gap by
merging programming with the results of programming [@humanize side8-9].
When we bring together the medium and the message the cost of small
experimentation is very low and I feel that programming becomes more
explorative and expressive.

The integration tests are not run on save because they intentionally
simulate slow transfers and take some time to run. The integration tests
are used as a final check against built code before a branch in git can
be merged into the master. Once the code has been packaged for
distribution the internals are no longer visible the integration tests
which are coded against the public API are the only runnable tests.
While these tests don't individually test every component, they are
designed to exercise the whole codebase so that a mistake in any
component will be visible through them. Grunt executes the build,
including starting up the test REST services that give the integration
tests something to fetch.

Packaging as a single distributable file
----------------------------------------

![**Packaging of many javascript files into multiple single-file
packages.** The packages are individually targeted at different
execution contexts, either browsers or node *get from notebook, split
sketch diagram in half*](images/placeholder.png)

As an interpreted language, Javascript may of course be ran directly
without any prior compilation. While running the same code as I see in
the editor is convenient while programming, it is much less so for
distribution. Although the languages imposes no compulsory build phase,
in practice one is necessary. Dependency managers have not yet become
standard for client-side web development (although Bower is looking
good) so most files are manually downloaded. For a developer wishing to
include my library in their own project a single file is much more
convenient. Should they not have a build process of their own, a single
file is also much faster to transfer to their users, mostly because of
the cost of establishing connections and the http overhead.

Javascript files are interpreted in series by the browser so
dependencies must come before dependants, tricks for circular
dependencies notwithstanding. Unsurprisingly, files concatenated in the
same order as they would be delivered to the browser will be
functionally equivalent to the same files delivered separately. Several
tools are available to automate this stage of the build process,
including the topological sort of the dependency digraph that finds a
working concatenation order.

Early in this project I chose Require.js although it was later abandoned
because I found it to be too heavyweight. Javascript as a language
doesn't have an import statement so Require implements importing in
Javascript itself as a normally executable function. When running raw
source, this function AJAXes in the imported source but Require also has
an 'optimise mode' which uses static analysis to deduce a workable
source order and concatenates into a single file. This of course is
impossible in the general case and if, for example, the import is
subject to branching require falls back to lazy loading, fetching only
when needed. In practice undecidability isn't an issue because importing
is typically unconditional and may even be an advantage in larger
projects. To speed up initial loading of larger web applications,
*Asynchronous Module Definition* (AMD) imports rarely-loaded
functionality in response to events, resisting static analysis and so
downloading the code only as it is needed.

I hoped to use Require's `optimise` to generate my distributable
Javascript library. However, require's structure necessitates that calls
to the importing functions stay in the code and that the require.js
run-time component is available to facilitate these calls. For a small
project I found this constant-size overhead too large in relation to the
rest of the project. Require also prefers to be used as the sole means
of loading scripts meaning that Oboe would not fit naturally into web
applications not already using require. Overall, Require seems more
suited to developing whole applications than programming libraries.

Having abandoned require rather than look for another sophisticated
means to perform concatenation I decided to pick up the simplest tool
which could possibly work, a Grunt module which works like the unix
`cat` command. With only 15 source Javascript files manually finding a
working order by drawing a graph on paper isn't a daunting task. As new
files are added it is simple to find a place to insert them into the
list. I adjusted each Javascript file to, when loaded directly, place
its API in the global namespace, then post-concatenation wrapped the
combined in a single function, converting the APIs inside the function
from global to the scope of that function, thereby hiding the
implementation for code outside of Oboe.

For future consideration there is Browserify. This library reverses the
'browser first' image of Javascript by converting applications targeted
at Node into a single file efficiently packaged for delivery to a web
browser, conceptually making Node the primary environment for Javascript
and adapting browser execution to match. Significantly, require leaves
no trace of itself in the concatenated Javascript other than Adaptors
presenting browser APIs as the Node equivalents. Browserify's http
adaptor[^1] is complete but more verbose compared to Oboe's version[^2].

As well as combining into a single file, Javascript source can made
significantly smaller by removing comments and reducing inaccessible
tokens to a single character. For Oboe the popular library *Uglify* is
used for minification. Uglify performs only surface optimisations,
operating on the AST level but concentrating mostly on compact syntax. I
also considered Google's Closure compiler. Closure resembles a
traditional compiler optimiser by leveraging a deeper understanding to
search for smaller representations, unfortunately at the cost of safety.
Decidability in highly dynamic languages is often impossible and Closure
operates on a well-advised subset of Javascript, delivering no
reasonable guarantee of equivalence when code is not written as the
Closure authors expected. Integration tests should catch any such
failures but for the time being I have a limited appetite for a workflow
which forces me to be suspicious of the project's build process.

Styles of Programming
---------------------

Programming is finished when each line reads as a statement of fact
rather than the means of making the statement so.

"Mixed paradigm" design. But not classical: don't need inheritance.

How doing data hiding in JS without copying an OO concept of data
hiding.

Interestingly, the mixed paradigm design hasn't changed the top-level
design very much from how it'd be as a pure OO project (IoC, decorators,
event filters, pub/sub etc).

The code presented is the result of the development many prior versions,
it has never been rewritten in the sense of starting again. Nonetheless,
every part has been complely renewed several times. I am reviewing only
the final version. Git promotes regular commits, there have been more
than 500.

some of it is pure functional (jsonPath, controller) ie, only
semantically different from a Haskell programme others, syntactically
functional but stateful to fit in with expected APIs etc

JsonPath implementation allows the compilation of complex expressions
into an executable form, but each part implementing the executable form
is locally simple. By using recursion, assembling the simple functions
into a more function expressing a more complex rule also follows as
being locally simple but gaining a usefully sophisticated behaviour
through composition of simple parts. Each recursive call of the parser
identifies one token for non-empty input and then recursively digests
the rest.

The style of implementation of the generator of functions corresponding
to json path expressions is reminiscent of a traditional parser
generator, although rather than generating source, functions are
dynamically composed. Reflecting on this, parser gens only went to
source to break out of the ability to compose the expressive power of
the language itself from inside the language itself. With a functional
approach, assembly from very small pieces gives a similar level of
expressivity as writing the logic out as source code.

Why could implement Function\#partial via prototype. Why not going to.
Is a shame. However, are using prototype for minimal set of polyfills.
Not general purpose.

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

There is a construction part (first 3 args) and a usage part (last
three). Comsume many can only be constructed to ues consume 1 in second
style because may refer to its own paritally completed version.

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

Criticisms of Node. Esp from Erlang etc devs. Pyramid code and promises.
Node programs often so asynchronous and callback based they become
unclear in structure. Promises approach to avoid pyramid-shaped code and
callback spaghetti.

~~~~ {.javascript}
// example of pyramid code
~~~~

functional, pure functional possible [FPR] but not as nicely as in a
pure functional language, ie function caches although can be
implemented, not universal on all functions.

Although the streams themselves are stateful, because they are based on
callbacks it is entirely possible to use them from a component of a
javascript program which is wholly stateless.

### Performance implications of functional javascript

V8 and other modern JS engines are often said to be 'near-native' speed,
meaning it runs at close to the speed of a similarly coded C program.
However, this relies on the programmer also coding in the style of a C
programmer, for example with only mono-morphic callsites and without a
functional style. Once either of those programming techniques is taken
up performance drops rapidly
[http://rfrn.org/\~shu/2013/03/20/two-reasons-functional-style-is-slow-in-spidermonkey.html]
9571 ms vs 504 ms. When used in a functional style, not 'near-native' in
the sense that not close to the performance gained by compiling a well
designed functional language to natively executable code. Depends on
style coded in, comparison to native somewhat takes C as the description
of the operation of an idealised CPU rather than an abstract machine
capable of executing on an actual CPU.

(perhaps move to background, or hint at it, eg "although there are still
some performance implications involved in a functional style, javascript
may be used in a non-pure functional style") - with link to here

The performance degradation, even with a self-hosted forEach, is due to
the JIT’s inability to efficiently inline both the closures passed to
forEach

Lambda Lifting, currently not implemented in SpiderMonkey or V8:
http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.48.4346

The transformations to enable the above criteria are tedious and are
surely the purview of the compiler. All that’s needed are brave compiler
hackers

JS is much faster with "monomorphic call sites"

However, js execution time is not much of a problem,

### Preferring functions over constructors (subsume into above section?)

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

JSONPath Implementation
-----------------------

Show evolution of it. Like most compilers, first try was just a bunch of
regexes that generated a regex to match the pattern. While compact, was
unmaintainable. Moved onto functional, stateless Javascript. Lots of
refactoring possible because very comprehensively tested.

Split into tokens and statement builder.

NB: This consideration of type in json could be in the Background
section.

Clause functions, each passes onto the next function if it passes.
Functions to consume. Can apply more than one test to a single node.
Tests generated by clause functions may be against either the immediate
path to that node (name clauses) or the node itself (duck-type clauses).
For example, the jsonPath `!.$person..{height tShirtSize}` may be
expressed functionally in Javascript as such:

~~~~ {.javascript}
var jsonPathEvaluator =
   statementExpr( 
      duckTypeClause(
         skipMany(                                // for '..'  
            capture(                              // for css4-style '$' notation
               nameClause(
                  skip1(                          // '.' after '!'  
                     rootExpr                     // '!' at start of JSONPath expression
                  ) 
               'person' )
            )
      ), ['height', 'tShirtSize'])
   );      
~~~~

The above is actually a slight simplification because calls to
partialComplete are implied. Once this evaluator function has been
created, testing against a candidate ascent is simply function
invocation:

~~~~ {.javascript}
var result = jsonPathEvaluator(ascent);
~~~~

Why done as a function returning a function (many calls per pattern -
one for each node found to check for matches).

Match from right-to-left, or, deepest-to-root. Why this way? That's how
the patterns work (mostly)

Why an existing jsonPath implmentation couldn't be used: need to add new
features and need to be able to check against a path expressed as a
stack of nodes.

More important to efficiently detect or efficiently compile the
patterns?

As discussed in section ???, Sax is difficult to program and not widely
used.

Essentially two ways to identify an interesting node - by location
(covered by existing jsonpath)

Why duck typing is desirable in absense of genuine types in the json
standard (ala tag names in XML). or by a loose concept of type which is
not well supported by existing jsonpath spec.

Compare duck typing to the tag name in

Explain why Haskel/lisp style lists are used rather than arrays

-   In parser clauses, lots of 'do this then go to the next function
    with the rest'.
-   Normal arrays extremely inefficient to make a copy with one item
    popped off the start
-   Link to FastList on github
-   For sake of micro-library, implemented tiny list code with very bare
    needed
-   Alternative (first impl) was to pass an index around
-   But clause fns don't really care about indexes, they care about top
    of the list.
-   Slight advantage to index: allows going past the start for the root
    path (which doesn't have any index) instead, have to use a special
    value to keep node and path list of the same length
-   Special token for root, takes advantage of object identity to make
    certain that cannot clash with something from the json. Better than
    '**root**' or similar which could clash. String in js not considered
    distinct, any two strings with identical character sequences are
    indistinguishable.

Anti-list: nothing is quite so small when making a mircro-library as
using the types built into the language, coming as they are for zero
bytes.

![Diagram showing why list is more memory efficient - multiple handles
into same structure with different starts, contrast with same as an
array](images/placeholder)

-   For recognisably with existing code, use lists internally but
    transform into array on the boundary between Oboe.js and the outside
    world (at same time, strip off special 'root path' token)

In parser, can't use 'y' flag to the regualr expression engine which
would allow much more elegant matching. Only alternative is cumersome:
to slice the string and match all tokens with regexes starting with '\^'
in order to track the current location.
[https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular\_Expressions]

Syntax tokens tested separately. Broad, broad base to this pyramid - two
levels of unit testing. By testing individual tokens are correct and the
use of those tokens as a wider expression, am testing the same thing
twice. Arguably, redundant effort. But may simply be easier to write in
that way - software is written by a human in a certain order and if we
take a bottom-up approach to some of that design, each layer is easier
to create if we first know the layers that it sits on are sound. Writing
complex regular expressions is still programming and it is more
difficult to test them completely when wrapped in rather a lot more
logic than directly. For example, a regex which matches "{a,b}" or "{a}"
but not "{a,}" is not trivial.

Incrementally building up the content
-------------------------------------

Content builder: variant of Adaptor pattern that is event based, not
based on object wrapping and propagating calls. Pushed to, not pulled
from. Hides a few Clarinet perculiarities such as the field name given
with the open object and internally normalises this by handling as if it
were two events.

Like SAX, calls from clarinet are entirely 'context free'. Ie, am told
that there is a new object but without the preceding calls the root
object is indistinguishable from a deeply nested object. Luckily, it
should be easy to see that building up this context is a simple matter
of maintaining a stack describing the descent from the root node to the
current node.

jsonPath parser gets the output from the incrementalParsedContent,
minimally routed there by the controller.

![Show a call into a compiled jsonPath to explain coming from
incrementalParsedContent with two lists, ie the paths and the objects
and how they relate to each other. Can use links to show that object
list contains objects that contain others on the list. Aubergine etc
example might be a good one](images/placeholder)

Explain match starting from end of candidate path

![Some kind of diagram showing jsonPath expressions and functions
partially completed to link back to the previous function. Include the
statementExpr pointing to the last clause](images/placeholder)

On first attempt at ICB, had two stacks, both arrays, plus reference to
current node, current key and root node. After refactorings, just one
list was enough. Why single-argument functions are helpful (composition
etc)

Stateless makes using a debugger easier - can look back in stack trace
and because of no reassignment, can see the whole, unchanged state of
the parent call. What the params are now are what they always have been,
no chance of reassignment (some code style guides recommend not to
reassign parameters but imperative languages generally do not forbid it)
No Side effects: can type expressions into debugger to see evaluation
without risk of changing program execution.

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

How do notifications fit into this?

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

[^1]: https://github.com/substack/http-browserify

[^2]: https://github.com/jimhigson/oboe.js/blob/master/src/streamingHttp.js
    I can't claim superior programming ability, this version is shorter
    because it is not a generic solution
