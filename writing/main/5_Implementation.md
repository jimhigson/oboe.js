Implementation
==============

Components of the project
-------------------------

![**Major components that make up Oboe.js illustrating program flow from
http transport to registered callbacks.** UML facet/receptacle notation
is used to show the flow of events with event names in capitals. For
clarity events are depicted as transitioning directly between publisher
and subscriber rather than through an intermediary.
\label{overallDesign}](images/overallDesign.png)

Oboe's architecture follows a fairly linear pipeline with flow visiting
various tasks between receiving http progress events and notifying
application callbacks. The internal componentisation is designed
primarily so that automated testing can provide a high degree of
confidence regarding the correct working of the library. A local event
bus facilitates communication between components inside the Oboe
instance and most components interact solely through this bus by
receiving events, processing them and publishing further events in
response. This use of an event bus is a variation on the Observer
pattern which removes the need for each unit to obtain a reference to
the previous one so that it may observe it, giving a highly decoupled
shape to the library. Once everything is wired into the bus no central
control is required and the larger behaviours emerge as the consequence
of interaction between finer ones.

Automated testing
-----------------

![**The test pyramid**. Much testing is done on the low-level components
of the system, less on the component level, and less still on a
whole-system level. \label{testpyramid}](images/testPyramid.png)

80% of the code written for this project is test specifications.
Because the correct behaviour of a composition requires the correct behaviour of
its components units, the majority of the specifications are *unit tests*. The
general style of a unit test is to plug the item under test into a mock
event bus and check that when it receives input events,
the expected output events are consequently published.
 
The *Component tests* step back from examining individual components
to a position where their emergent behaviour in composition can be examined. Because
the composition is quite simple there are much fewer component tests than unit
tests. By examining the behaviour of the library through the public API the 
component tests do not take account of how the composition is drawn.
The exception is that the is faked which requires the streamingXhr component
to be switched for a stub.

At the apex of the test pyramid are a small number of *integration tests*.
These verify Oboe as a black box without any knowledge of, or access to
the internals, using only the APIs which are exposed to application
programmers. The http traffic cannot be stubbed so before these tests can
be ran a test REST service is spun up. 
These tests are the most expensive to write but a small number are necessary
in order to verify that Oboe works correctly end-to-end. 

The desire to be amenable to testing influences the boundaries on which
the application splits into components. Confidently black box testing a
stateful unit as is difficult; because of side-effects it may later
react differently to the same calls. For this reason where state is
required it is stored in very simple state-storing units with intricate
program logic removed. The logic may then be separately expressed as
functions which map from one state to the next. Although comprehensive
coverage is of course impossible and tests are inevitably incomplete,
for whatever results the functions give while under test, uninfluenced
by state I can be sure that they will continue to give in any future
situation. The separate unit holding the state is trivial to test,
having exactly one responsibility: to store the result of a function
call and later pass that result to the next function. This approach
clearly breaks with object oriented style encapsulation by not hiding
data behind the logic which acts on them but I feel the departure is
worthwhile for the greater certainty it allows over the correct
functioning of the program.

Dual-implementation of same interface for streamingHttp might be
considered polymorphism, but a function not a class and both are never
loaded at run time.

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
ten will have already been downloaded. *ref apx for streamsource*

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

Packaging as a single, distributable file
-----------------------------------------

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

Javascript files are interpreted in series by the browser so load-time
dependencies must precede dependants. Unsurprisingly, separate files
once concatenated following the same order as delivered to the browser
will load more quickly but are functionally equivalent, at least barring
syntax errors. Several tools exist to automate this stage of the build
process, incorporating a topological sort of the dependency digraph in
order to find a working concatenation order.

Early in this project I chose *Require.js* although I later moved on
because it was too heavyweight. Javascript as a language doesn't have an
import statement. Require contributes the importing ability to
Javascript from inside the language sandbox as the `require` function, a
standard asynchronous call. Calls to `require` AJAX in and execute the
imported source, returning any exported symbols by a callback. For
non-trivial applications this mode is intended mostly for debugging;
because a network hop is involved the protocol is chatty and slowed by
highly latent calls between modules. For efficient delivery Require also
has the `optimise` command which concatenates into a single file by
using static analysis to deduce a workable source order. Because
`require` may appear anywhere in the source, this in the general case is
of course undecidable so Require falls back to lazy loading. In practice
undecidability isn't a problem because imports are generally not subject
to branching. In larger webapps lazy loading speeding up the initial
page load and is actually an advantage. The technique of *Asynchronous
Module Definition* (AMD) intentionally imports rarely-loaded modules in
response to events. By resisting the static analysis the units will not
be downloaded until they are needed.

AMD is mostly of interest to web applications with a central hub but
also some rarely used parts. Oboe does not fit this profile: everybody
who uses it will use all of the library. Regardless, I hoped to use
`optimise` to generate my combined Javascript file. Even after
optimisation, Require's design necessitates that calls to `require` stay
in the code and that the require.js run-time component is available to
handle these calls. For a micro-library a ???k overhead was too large to
accommodate. Overall, Require seems more suited to developing
stand-alone applications than programming libraries.

Having abandoned Require, I decided to pick up the simplest tool which
could possibly work. With only 15 source files and a fairly sparse
dependency graph finding a working order on paper wasn't a daunting
task. Combined with a Grunt analogue to the unix `cat` command I quickly
had a working build process. I adjusted each Javascript file to, when
loaded directly, place its API in the global namespace, then
post-concatenation wrapped the combined in a single function, converting
the APIs inside the function from global to the scope of that function,
thereby hiding the implementation for code outside of Oboe.

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

The implementation of Oboe is mixed paradigm. Events flow throughout the
whole library but in terms of code style the components are a mix of
procedural, functional and object-oriented programming. Object
orientation is used only to wrap the library in an Object-oriented
public API and as a tuple-like store for multiple values. Constructors
are not used, nor is there any inheritance or notable polymorphism.
Closures, not objects, are used as the primary means of data storage and
hiding. Many of the entities painted in figure \ref{overallDesign} map
onto no single, addressable language construct and exist only as a set
of event handlers trapped inside the same closure, taking advantage of
the fact that their reachability from some event emitter prevents
required parameters from being garbage collected. From outside the
closure hidden values are not only private as would be seen in an OO
model, they are inherently unaddressable. Although only sparingly OO,
the high-level design's componentisation hasn't departed from how it
might be implemented in an OO metamodel and Object Oriented design
patterns remain influential despite being only loosely followed.

Because of the pressures on code size I decided not to use a general
purpose functional library and instead create my own with only the parts
that I need; see functional.js. Functional programming in Javascript is
known to be slower than other styles, particularly under Firefox because
it lacks Lambda Lifting and other similar optimisations
[@functionalSpiderMonkey]. Considering to what degree performance
concerns should dissuade us from a functional style, we may consider the
library's execution context. Because of the single-threaded model any
application's Javascript execution is in between frames serving
concurrent concerns so to minimise the impact on latency for the other
tasks it is important that no task occupies the CPU for very long. On
the browser about 16ms is a fair maximum, allowing painting to occur at
60 frames per second. In Node there is no hard limit but any CPU-hogging
task degrades the responsiveness of other responses. Context switching
imposes a very low overhead and responsive sharing generally proffers
many small frames over a few larger ones. In any case, server-side tasks
especially are more often i/o bound than CPU bound. Oboe's progressive
design naturally splits tasks which would otherwise be performed in a
single frame over many. For example, parsing and marshaling. Although
the overall computation may be higher, the total performance of the
system should be improved.

Javascript is of course an imperative language but over many iterations
Oboe has tended towards a declarative style. In
incrementalContentBuilder.js programming was initially stateful and
procedural, reading like the instructions to perform a task. Over many
refactors the flavour of the code has changed, the reading now tending
towards a description of desired behaviour.

Incrementally building up the content
-------------------------------------

As shown in figure \ref{overallDesign}, there is an incremental content
builder and ascent tracer which handle the output from the Clarinet JSON
SAX parser. Taken together, these might be considered a variant of the
Adaptor pattern, providing to the controller a simpler interface than is
presented by Clarinet. However, this is not the model implementation of
the pattern; the adapted interface is even-driven rather than
call-driven: we receive six kinds of event and in response emmit from a
narrower vocabulary of two.

To evaluate JSONPath expressions the controller requires a path to the
current JSON node, the node itself, and any ancestor nodes. This is
delivered by the incremental content builder as the payload of the
NODE\_FOUND and PATH\_FOUND events. For each Clarinet event the builder
provides a corresponding function which, working from the current path,
returns the next path after the event has been applied. For example, the
`objectopen` and `arrayopen` events move the current node deeper in the
document and are handled by adding new items to the path, whereas for
`closeobject` and `closearray` we remove one. Over the course of parsing
a complete JSON file the path will in this way be manipulated to visit
every node, allowing each to be tested against the registered JSONPath
expressions. Internally, the builder's event handlers are declared as
the combination of a smaller number of basic reusable handler parts.
Oboe is largely unconcerned regarding a JSON node's type so given that
several of the Clarinet events differ only by the type of the nodes they
announce, Oboe is able to generify their handling by composing from a
common pool of handler-parts. Picking up `openobject` and `openarray`
events, both fall through to the same 'nodeFound', differing only in a
parameter. Similarly, consider the `value` event which is fired when
Clarinet encounters a String or Number. Because primitive nodes are
always leaves the builder regards this as a node which instantaneously
starts and ends, handled programmatically as the functional composition
of the `nodeFound` and `curNodeFinished`. The reuse of smaller
instructions to build up larger ones is perhaps slightly reminiscent of
CISC CPU design in which micro-instructions are combined to implement
the chip's advertised interface.

Although the builder functions are stateless, ultimately the state
regarding the current path needs to be stored between clarinet calls.
This is handled by the ascent tracker. This tiny component merely serves
as a holder for this data, starting from an empty path it passes the
path to each builder function and stores the result to be given to the
next one.

![List representation of an ascent from leaf to root of a JSON tree.
Note the special ROOT token which represents the path mapping to the
root node (of course nothing maps to the root) - this is an object,
taking advantage of object identity to ensure that the token is unequal
to anything but itself. This list form is built up by the incremental
content builder and is the format that compiled JSONPath expressions
test against for matches \label{ascent}](images/ascent.png)

The path of the current node is maintained as a singly linked list, with
each list element holding the field name and the node and the node
itself, see figure \ref{ascent}. The list is arranged with the JSON root
at the far end and the current node at the head. As we traverse the JSON
the current node is appended and removed many times whereas the root is
immutable. This ordering was chosen because it is computationally very
efficient since all updates to the list are at the head. Each link in
the list is immutable, enforced by newer Javascript engines as frozen
objects [^3].

Linked lists were chosen in preference to the more conventional approach
of using native Javascript Arrays for several reasons. Firstly, I find
this area of the program more easy to test and debug given immutable
data structures. Handling native Arrays without mutating would be very
expensive because on each new path the array would have to be copied
rather than edited in-place. Unpicking a stack trace is easier if I know
that every value revealed is the value that has always occupied that
space because I don't have to think four-dimensionally projecting my
mind forwards and back in time to different values that were there when
the variable was used. The lack of side effects means I can try explore
new commands in the debugger's CLI without worrying about breaking the
execution of the program. Most Javascript virtual machines are also
quite poor at array growing and shrinking so for collections whose size
changes often are outperformed by linked lists. Finally, this is a very
convenient format for the JSONPath engine to perform matching on as will
be discussed in the next section. The Javascript file lists.js
implements the list functions: `cons`, `head`, `tail`, `map`, `foldR`,
`all`.

Because it is more common to quote paths as descents rather than ascent,
on the boundary to the outside world Oboe reverses the order and,
because Javascript programmers will not be familiar with this structure,
converts to arrays.

Oboe JSONPath Implementation
----------------------------

Not surprisingly given its importance, the JSONPath implementation is
one of the most refactored and considered parts of the Oboe codebase.
Like many small languages, on the first commit it was little more than a
series of regular expressions[^4] but has slowly evolved into a
featureful and efficient implementation[^5]. The extent of the rewriting
was possible because the correct behaviour is well defined by test
specifications[^6].

The JSONPath compiler exposes a single higher-order function to the rest
of Oboe. This function takes a JSONPath as a String and, proving it is a
valid expression, returns a function which tests for matches to the
JSONPath. Both the compiler and the functions that it generates benefit
from being stateless. The type of the compiler, expressed as Haskell
syntax would be:

~~~~ {.haskell}
String -> Ascent -> JsonPathMatchResult
~~~~

The match result is either a failure to match, or a hit, with the node
that matched. In the case of path matching, the node may currently be
unknown. If the pattern has a clause prefixed with `$`, the node
matching that clause is captured and returned as the result. Otherwise,
the last clause is implicitly capturing.

The usage profile for JSONPath expressions in Oboe is to be compiled
once and then evaluated many times, once for each node encountered while
parsing the JSON. Because matching is performed perhaps hundreds of
times per file the most pressing performance consideration is for
matching to execute quickly, the time required to compile is relatively
unimportant. Oboe's JSONPath design contrasts with JSONPath's reference
implementation which, because it provides a first order function,
freshly reinterprets the JSONPath string each time it is invoked.

The compilation is performed by recursively by examining the left-most
side of the string for a JSONPath clause. For each kind of clause there
is a function which matches ascents against that clause, for example by
checking the name field. By partial completion this function is
specialised to match against one particular name. Once a clause function
is generated, compilation recurs by passing to itself the remaining
unparsed portion of the JSONPath string. This continues until it is
called with a zero-length JSONPath. On each recursive call the clause
function is wrapped in the result from the next recursive call,
resulting ultimately in a linked series of clause functions. When
evaluated against an ascent, each clause functions examines the head of
the ascent and passes the ascent onto the next function if it passes. A
special clause functions, `skip1` is used for the `.` syntax and places
no condition on the head of the ascent but passes on to the next clause
only the tail, thus moving evaluation of the ascent one node up the
parsed JSON tree. Similarly, there is a `skipMany` which maps onto the
`..` syntax and recursively consumes nodes until it can find a match in
the next clause.

JsonPath implementation allows the compilation of complex expressions
into an executable form, but each part implementing the executable form
is locally simple. By using recursion, assembling the simple functions
into a more function expressing a more complex rule also follows as
being locally simple but gaining a usefully sophisticated behaviour
through composition of simple parts. Each recursive call of the parser
identifies one token for non-empty input and then recursively digests
the rest.

As an example, the pattern `!.$person..{height tShirtSize}` once
compiled would roughly resemble the Javascript functional representation
below:

~~~~ {.javascript}
statementExpr(             // wrapper, added when JSONPath is zero-length 
   duckTypeClause(         // token 6, {height tShirtSize}
      skipMany(            // token 5, '..'  
         capture(          // token 4, css4-style '$' notation
            nameClause(    // token 3, 'person'
               skip1(      // token 2, '.'  
                  rootExpr // token 1, '!' at start of JSONPath expression
               ) 
            'person' )
         )
   ), ['height', 'tShirtSize'])
)      
~~~~

Since I am only using a side-effect free subset of Javascript for this
segment of Oboe it would be safe to use a functional cache. As well as
saving time by avoiding repeated execution, this could potentially also
save memory because where two JSONPath strings contain a common start
they could share the inner parts of their functional expression.
Although Javascript doesn't come with functional caching, it can be
added using the language itself [^7]. I suspect, however, that hashing
the parameters might be slower than performing the matching. Although
the parameters are all immutable and could in theory be hashed by object
identity, in practice there is no way to access an object id from inside
the language so any hash of a node parsed out of JSON would have to walk
the entire subtree rooted from that node.

The JSONPath tokenisation is split out into its own file and separately
tested. The tokenisation implementation is based on regular expressions,
they are the simplest form able to express the clause patterns. The
regular expressions are hidden to the outside the tokenizer and only
functions are exposed to the main body of the compiler. The regular
expressions all start with `^` so that they only match at the head of
the string. A more elegant alternative is the 'y' [^8] flag but as of
now this lacks wide browser support.

By verifying the tokens through their own unit tests it is simpler to
thoroughly specify the tokenisation, producing simpler failure messages
than if it were done through the full JSONPath engine. We might consider
the unit test layer of the pyramid (figure \ref{testpyramid}) is further
split into two sub-layers. Arguably, the upper of these sub-layer is not
a unit test because it is verifying two units together. There is some
redundancy with the tokens being tested both individually and as full
expressions. I maintain that this is the best approach regardless
because stubbing out the tokenizer functions would be a considerable
effort and would not improve the rigor of the JSONPath specification.

![Some kind of diagram showing jsonPath expressions and functions
partially completed to link back to the previous function. Include the
statementExpr pointing to the last clause](images/placeholder)

[^1]: https://github.com/substack/http-browserify

[^2]: https://github.com/jimhigson/oboe.js/blob/master/src/streamingXhr.js
    This version is shorter mostly because it is not a generic solution

[^3]: See
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/Object/freeze.
    Although older engines don't provide any ability to create immutable
    objects at run-time, we can be fairly certain that the code does not
    mutate these objects or the tests would fail when run in
    environments which are able to enforce this.

[^4]: JSONPath compiler from the first commit can be found at line 159
    here:
    https://github.com/jimhigson/oboe.js/blob/a17db7accc3a371853a2a0fd755153b10994c91e/src/main/progressive.js\#L159

[^5]: for contrast, the current source can be found at
    https://github.com/jimhigson/oboe.js/blob/master/src/jsonPath.js

[^6]: The current tests are viewable at
    https://github.com/jimhigson/oboe.js/blob/master/test/specs/jsonPath.unit.spec.js
    and
    https://github.com/jimhigson/oboe.js/blob/master/test/specs/jsonPathTokens.unit.spec.js

[^7]: Probably the best known example being `memoize` from
    Underscore.js: http://underscorejs.org/\#memoize

[^8]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular\_Expressions
