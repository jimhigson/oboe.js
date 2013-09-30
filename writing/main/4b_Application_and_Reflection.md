Implementation
==============

Decomposition into components
-----------------------------

![**Inter-related components that make up Oboe.js** showing flow from
http transport to registered callbacks. UML facet/receptacle notation is
used to show the flow of events but a centralised event bus which
transmits the events is omitted for clarity](images/overallDesign.png)

Split up concerns etc

Controller

The problem decomposes nicely into loosely-coupled components, each
quite detailed but unconcerned with the others. Once these parts are
made, bringing them together under a simple controller is just a matter
of joining the dots.

Code is good when each line feels like a statement of fact rather than a
way of going about making an intention true.

Content builder: like a decorator/wrapper but event based, not based on
object wrapping.

Inversion of Control and communication between parts
----------------------------------------------------

Aim of creating a micro-library rules out building in a general-purpose
IoC library.

However, can still follow the general principles.

Why the Observer pattern (cite: des patterns) lends itself well to MVC
and inversion of control.

What the central controller does; acts as a plumber connecting the
various parts up. Since oboe is predominantly event/stream based, once
wired up little intervention is needed from the controller. Ie, A knows
how to listen for ??? events but is unintested who fired them.

Local event bus Why? Makes testing easy (just put appropriate event on
the bus rather than trying to fake calls from linked stubs). Decouples,
avoids parts having to locate or be passed other parts. Wouldn't scale
indefinately, does provide something of a mingled-purpose space. Why not
more direct event passing without a separate event bus (ie, everything
as an emitter and reciever of events?)

Grunt
-----

Automated testing
-----------------

Do it on every save!

![Relationship between various files and test libraries *other half of
sketch from notebook*](images/placeholder.png)

How automated testing improves what can be written, not just making what
is written more reliable.

TDD drives development by influencing the design - good design is taken
as that which is amenable to testing rather than which describes the
problem domain accurately or solves a problem with minimum resources.
Amenable to testing often means split into many co-operating parts so
that each part may be tested via a simple test.

Bt encourageing splitting into co-operating objects, TDD to a certain
degree is anti-encapsulation. The public object that was extracted as a
new concern from a larger object now needs public methods whereas before
nothing was exposed.

![The testing pyramid is a common concept, relying on the assumption
that verification of small parts provides a solid base from which to
compose system-level behaviours. A Lot of testing is done on the
low-level components of the system, whereas for the high-level tests
only smoke tests are provided.
\label{testingPyramidFig}](images/pyramid)

Jstd can serve example files but need to write out slowly which it has
no concept of. Customistation is via configuration rather than by
plug-in, but even if it were, the threading model is not suitable to
create this kind of timed output.

Tests include an extremely large file twentyThousandRecords.js to test
under stress

Why jstd's built in proxy isn't sufficient. An example of a typical Java
webserver, features thread-based mutlithreading in which threads wait
for a while response to be received.

Tests deal with the problem of "irreducible complexity" - when a program
is made out of parts whose correct behaviour cannot be observed without
all of the program. Allows smaller units to be verified before verifying
the whole.

Conversely, automated testing allows us to write incomprehensible code
by making us into more powerful programmers, it is possible building up
layers of complexity one very small part at a time that we couldn't
write in a simple stage. Clarity \> cleverness but cleverness has its
place as well (intriducing new concepts)

Testing via node to give something to test against - slowserver. Proxy.
JSTD not up to task. Shows how useful node is as a 'network glue'. The
same as C was once described as a 'thin glue'
[http://www.catb.org/esr/writings/taoup/html/ch04s03.html]. Transparent
proxy is about 20 lines. Transparent enough to fool JSTD into thinking
it is connecting directly to its server.

Node comes with very little built in (not even http) but relies on
libraries written in the language itself to do everything. Could
implement own http on top of sockets if wanted rather than using the
provided one.

The test pyramid concept \ref{testingPyramidFig} fits in well with the
hiding that is provided. Under the testing pyramid only very high level
behaviours are tested as ??? tests. While this is a lucky co-incidence,
it is also an unavoidable restriction. Once compiled into a single
source file, the individual components are hidden, callable only from
withing their closure. Hence, it would not be possible to test the
composed parts individually post-concatenation into a single javascript
file, not even via a workarround for data hiding such as found in Java's
reflection. Whereas in Java the protection is a means of protecting
otherwise addressable resources, once a function is trapped inside a
javascript closure without external exposure it is not just protected
but, appearing in no namespaces, inherently unreferenceable.

TDD fits well into an object pattern because the software is well
composed into separate parts. The objects are almost tangible in their
distinction as separate encapsulated entities. However, the
multi-paradigm style of my implementation draws much fainter borders
over the implementation's landscape.

Approach has been to the test the intricate code, then for wiring don't
have tests to check that things are plumbed together correctly, rather
rely on this being obvious enough to be detected via a smoke test.

A good test should be able to go unchanged as the source under test is
refactored. Indeed, the test will be how we know that the code under
test still works as intended. Experince tells me that testing that A
listens to B (ie that the controller wires the jsonbuilder up to
clarinet) produces the kind of test that 'follows the code arround'
meaning that because it is testing implementation details rather than
behaviours, whenever the implementation is updated the tests have to be
updated too.

By testing individual tokens are correct and the use of those tokens as
a wider expression, am testing the same thing twice. Arguably, redundant
effort. But may simply be easier to write in that way - software is
written by a human in a certain order and if we take a bottom-up
approach to some of that design, each layer is easier to create if we
first know the layers that it sits on are sound. Writing complex regular
expressions is still programming and it is more difficult to test them
completely when wrapped in rather a lot more logic than directly. For
example, a regex which matches "{a,b}" or "{a}" but not "{a,}" is not
trivial.

Can test less exhaustively on higher levels if lower ones are well
tested, testing where it is easier to do whilst giving good guarantees.

Genuine data hiding gets in the way sometimes. Eg, token regexes are
built from the combination of smaller regualar expressions for clarity
(long regular expressions are concise but hard to read), and then
wrapped in functions (why? - explain to generify interface) before being
exposed. Because the components are hidden in a scope, they are not
addressable by the tests and therefore cannot be directly tested.
Reluctantly

One dilemma in implementing the testing is how far to test the more
generic sections of the codebase as generic components. A purist
approach to TDD would say

Styles of Programming
---------------------

"Mixed paradigm" design. But not classical: don't need inheritance.

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
minimal interface. \* Why minimal interfaces are better for minification

Need to build an abstraction layer over xhr/xhr2/node. Can only work for
packets in-order, for out-of-order packets something else happens.

JS code style
-------------

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

Performance implications of functional javascript (subsume into above?)
-----------------------------------------------------------------------

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
'new' to create an instance of exactly one type. 'new' is inconsistent invocation with rest of language.

Dart has 'factory' constructors which are called like constructors but
act like factory functions:
(http://www.dartlang.org/docs/dart-up-and-running/contents/ch02.html\#ch02-constructor-factory)

Design and implementation of the JSONPath parser
------------------------------------------------

Show evolution of it. Like most compilers, first try was just a bunch of
regexes that generated a regex to match the pattern. While compact, was
unmaintainable. Moved onto functional, stateless Javascript. Lots of
refactoring possible because very comprehensively tested.

Split into tokens and statement builder.

NB: This consideration of type in json could be in the Background
section.

Clause functions, each passes onto the next function if it passes.
Functions to consume. Can apply more than one test to
a single node. Tests generated by clause functions may be against either
the immediate path to that node (name clauses) or the node itself
(duck-type clauses). For example, the jsonPath
`!.$person..{height tShirtSize}` may be expressed functionally in
Javascript as such:

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

Incrementally building up the content
-------------------------------------

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
    of that item\
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

Packaging the library as a single distributable file
----------------------------------------------------

![packaging of many javascript files into multiple single-file packages.
The packages are individually targeted at different execution contexts,
either browsers or node *get from notebook, split sketch diagram in
half*](images/placeholder.png)

-   One file for browser and node is common.
-   say how this is done
-   why not doing this (adds bloat, inhibits micro-lib)
-   extra challenges
-   http adaptor is different
-   packaging is different
-   two distributable files, for node minification is not important so
    don't do to help debugging.

Composition of several source files into a distributable binary-like
text file

Why distributed javascript is more like a binary than a source file.
Licencing implications? Would be (maybe) under GPL. Not so under BSD.

Inherent hiding by wrapping in a scope.

Names of functions and variable names which are provably not possible to
reference are lost for the sake of reduction of size of the source.

Packaging for node or browser. No need to minify for node but
concatenation still done for ease of inclusion in projects

~~~~ {.javascript}
typical pattern for packaging to work in either a node.js server or a web browser
~~~~

Packaging for use in frameworks.

-   Many frameworks already come with a wrapper arround the browser's
    inbuilt ajax capabilities
-   they don't add to the capabilities but present a nicer interface

-   I'm not doing it but others are \*\* browser-packaged version should
    be use agnostic and therefore amenable to packaging in this way

Why uglify

-   Covers whole language, not just a well-advised subset.
-   Closure compiler works over a subset of javascript rather than the
    whole language.

Why not require. Bits on what rq is can go into B&R section. *Some of
this can move into 3\_Background.md*

-   What it is
-   Why so popular
-   Why a loader is necessary - js doesn't come with an import statement
-   How it can be done in the language itself without an import
    statement
-   Meant more for AMD than for single-load code
-   Situations AMD is good for - large site, most visitors don't need
    all the code loaded
-   Depends on run-time component to be loaded even after code has been
    optimised
-   Small compatible versions exist that just do loading (almond)\
-   Why ultimately not suitable for a library like this - would require
    user to use Require before adopting it.

Browserify is closer.

-   Why it is better for some projects
-   Very nearly meets my needs
-   But http-compatability
    (https://github.com/substack/http-browserify), while complete
    enough, isn't compact enough to not push project over micro-library
    size

Testing post-packaging for small set of smoke tests. Can't test
everything, only through public API.

Uglify. Why not Google Closure Compiler.

Resume (not)
------------

Could implement a resume function for if transmission stops halfway

~~~~ {.javascript}
   .onError( error ) {
      this.resume();
   }
~~~~
