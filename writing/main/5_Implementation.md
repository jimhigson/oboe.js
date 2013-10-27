Implementation
==============

Components of the project
-------------------------

![**Major components of Oboe.js illustrating program flow from http
transport to application callbacks.** UML facet/receptacle notation is
used to show the flow of events and event names are given in capitals.
For clarity events are depicted as transferring directly between
publisher and subscriber but this is actually performed through an
intermediary. \label{overallDesign}](images/overallDesign.png)

Oboe's architecture describes a fairly linear pipeline visiting a small
number of tasks between receiving http content and notifying application
callbacks. The internal componentisation is designed primarily so that
automated testing can provide a high degree of confidence regarding the
correct working of the library. A local event bus facilitates
communication inside the Oboe instance and most components interact
solely by using this bus; receiving events, processing them, and
publishing further events in response. The use of an event bus is a
variation on the Observer pattern which removes the need for each unit
to locate specific other units before it may listen to their events,
giving a highly decoupled shape to the library in which each part knows
the events it requires but not who publishes them. Once everything is
wired into the bus no central control is required and the larger
behaviours emerge as the consequence of interaction between finer ones.

Design for automated testing
----------------------------

![**The test pyramid**. Much testing is done on the low-level components
of the system, less on their composed behaviours, and less still on a
whole-system level. \label{testpyramid}](images/testPyramid.png)

80% of the code written for this project is test specification. Because
the correct behaviour of a composition requires the correct behaviour of
its components, the majority are *unit tests*. The general style of a
unit test is to plug the item under test into a mock event bus and check
that when it receives input events the expected output events are
consequently published.

The *Component tests* step back from examining individual components to
a position where their behaviour as a composition may be examined.
Because the compositions are quite simple there are fewer component
tests than unit tests. The component tests do not take account of *how*
the composition is drawn and predominantly examine the behaviour of the
library through its public API. One exception is that the streamingXHR
component is switched for a stub so that http traffic can be simulated.

At the apex of the test pyramid are a small number of *integration
tests*. These verify Oboe as a black box without any knowledge of, or
access to, the internals, using the same API as is exposed to
application programmers. These tests are the most expensive to write but
a small number are necessary in order to verify that Oboe works
correctly end-to-end. Without access to the internals http traffic
cannot be faked so before these tests can be performed a corresponding
REST service is started. This test service is written using Node and
returns known content progressively according to predefined timings,
somewhat emulating a slow internet connection. The integration tests
particularly verify behaviours where platform differences could cause
inconsistencies. For example, the test url `/tenSlowNumbers` writes out
the first ten natural numbers as a JSON array at a rate of two per
second. The test registers a JSONPath selector that matches the numbers
against a callback that aborts the http request on seeing the fifth. The
correct behaviour is to get no sixth callback, even when running on a
platform lacking support for XHR2 and all ten will have already been
downloaded.

Confidently black-box testing a stateful unit is difficult. Because of
side-effects and hidden state we do not know if the same call will later
give a different behaviour. Building up the parse result from SAX events
is a fairly complex process which cannot be implemented efficiently as
stateless Javascript. To promote testability the state is delegated to a
simple state-storing unit. The intricate logic may then be expressed as
a separately tested set of side-effect free functions which transition
between one state and the next. Although proof of correctness is
impossible, for whichever results the functions give while under test,
uninfluenced by state I can be confident that they will always yield the
same response given the same future events. The separate unit
maintaining the state has exactly one responsibility, to hold the parse
result between function calls, and is trivial to test. This approach
slightly breaks with the object oriented principle of encapsulation by
hiding state behind the logic which acts on it but I feel that the
departure is justified by the more testable codebase.

To enhance testability Oboe has also embraced dependency injection.
Components do not instantiate their dependencies but rather rely on them
being passed in by an inversion of control container during the wiring
phase. For example, the network component which hides browser
differences does not know how to create the underlying XHR that it
adapts. Undoubtedly, by not instantiating its own transport this
component presents a less friendly interface: it's data source is no
longer a hidden implementation detail but exposed as a part of the it's
API at the responsibility of the caller. I feel this is mitigated by the
interface being purely internal. Dependency injection in this case
allows the tests to be written more simply because it is easy to
substitute the real XHR for a stub. Unit tests should test exactly one
unit, were the streaming http object to create its own transport, the
XHR would also be under test, plus whichever external service it
connects to. Because Javascript allows redefinition of built in types
the stubbing could have potentially also be done by overwriting the XHR
constructor to return a mock. However this is to be avoided as it opens
up the possibility of changes to the environment leaking between test
cases.

Running the tests
-----------------

![**Relationship between various files and test libraries** *other half
of sketch from notebook*](images/placeholder.png)

The Grunt task runner is used to automate routine tasks such as
executing the tests and building, configured so that the unit and
component tests run automatically whenever a change is made to a source
file or specification. As well as executing correctly, the project is
required not to surpass a certain size so this also checked on every
save. Because Oboe is a small, tightly focused project the majority of
the programming time is spent refactoring already working code. Running
tests on save provides quick feedback so that mistakes are found before
my mind has moved on to the next context. Agile practitioners emphasise
the importance of tests that execute quickly [@cleancode p.314:T9] --
Oboe's 220 unit and component tests run in less than a second so
discovering programming mistakes is almost instant. If the "content of
any medium is always another medium” [@media p.8], we might say that the
content of programming is the process that is realised by its execution.
A person working in a physical medium sees the thing they are making but
the programmer does usually not see their program's execution
simultaneously as they create. Conway notes that an artisan works by
transform-in-place "start with the working material in place and you
step by step transform it into its final form," but software is created
through intermediate proxies. He attempts to close this gap by merging
programming with the results of programming [@humanize pp.8-9]. I feel
that if we bring together the medium and the message by viewing the
result of code while we write it, we can build as a series of small,
iterative, correct steps and programming can be more explorative and
expressive. Running the tests subtly, automatically hundreds of times
per day builds isn't merely convenient, this build process makes me a
better programmer.

Integration tests are not run on save. They intentionally simulate a
slow network so they take some time to run and I'd already have started
the next micro-task by the time they complete. Oboe is version
controlled using git and hosted on github. The integration tests are
used as the final check before a branch in git is merged into the
master.

Packaging to a single distributable file
----------------------------------------

As an interpreted language Javascript may be run without any prior
compilation. Directly running the files that are open in the editor is
convenient while programming but, unless a project is written as a
single file, in practice some build phase is required to create an
easily distributable form. Dependency managers have not yet become
standard for client-side web development so dependant libraries are
usually manually downloaded. For a developer wishing to include my
library in their own project a single file is much more convenient than
the multi-file raw source. If they are not using a similar build process
on their site, a single file is also faster to transfer to their users,
mostly because the http overhead is of constant size per resource.

Javascript files are interpreted in series by the browser so load-time
dependencies must precede dependants. If several valid Javascript files
are concatenated in the same order as delivered to the browser, the
joined version is functionally equivalent to the individual files. This
is a common technique so that code can be written and debugged as many
files but distributed as one. Several tools exist to automate this stage
of the build process that topologically sort the dependency graph before
concatenation in order to find a suitable script order.

Early in the project I chose *Require.js* for this task. Javascript as a
language doesn't have an import statement. Require contributes the
importing ability to Javascript from inside the language itself by
providing an asynchronous `require` function. Calls to `require` AJAX in
and execute the imported source, passing any exported items to the given
callback. For non-trivial applications loading each dependency
individually over AJAX is intended only for debugging because making so
many requests is slow. For efficient delivery Require also has the
`optimise` command which concatenates an application into a single file
by using static analysis to deduce a workable source order. Because the
`require` function may be called from anywhere, this is undecidable in
the general case so Require falls back to lazy loading. In practice this
isn't a problem because imports are generally not subject to branching.
For larger webapps lazy loading is a feature because it speeds up the
initial page load. The technique of *Asynchronous Module Definition*
(AMD) intentionally imports rarely-loaded modules in response to events;
by resisting static analysis the dependant Javascript will not be
downloaded until it is needed. AMD is mostly of interest to applications
with a central hub but also some rarely used parts. For example, most
visits to online banking will not need to create standing orders so it
is better if this part is loaded on-demand rather than increase the
initial page load time.

I hoped to use Require's `optimise` to automate the creation of a
combined Javascript file for Oboe. Oboe would not benefit from AMD
because everybody who uses it will use all of the library but using
Require to find a working source order would save having to manually
implement one. Unfortunately this was not feasible. Even after
optimisation, Require's design necessitates that calls to the `require`
function are left in the code and that the Require run-time component is
available to handle them. At more than 5k gzipped this would have more
than doubled Oboe's download footprint.

After removing Require I decided to pick up the simplest tool which
could possibly work. With about 15 source files and a fairly sparse
dependency graph finding a working order on paper wasn't a daunting
task. Combined with a Grunt analogue to the unix `cat` command I quickly
had a working build process and a distributable library requiring no
run-time dependency management to be loaded.

For future consideration there is Browserify. This library reverses the
'browser first' Javascript mindset by viewing Node as the primary target
for Javascript development and adapting the browser environment to
match. Browserify converts applications written for Node into a single
file packaged for delivery to a web browser. Significantly, other than
Adaptors wrapping the browser APIs and presenting their features as if
they were the Node equivalents, Browserify leaves no trace of itself in
the final Javascript. Additionally, the http adaptor[^1] is capable of
using XHRs as a streaming source when used with supporting browsers.

After combining into a single file Javascript source can be made
significantly smaller by *minification* techniques such as reducing
scoped symbols to a single character or deleting the comments. For Oboe
the popular minifier library *Uglify* was chosen. Uglify performs only
surface optimisations, concentrating mostly on producing compact syntax
by manipulating the code's abstract syntax tree. I also considered
Google's *Closure Compiler* which resembles a traditional optimiser by
leveraging a deeper understanding of the code semantics. Unfortunately,
proving equivalence in highly dynamic languages is often impossible and
Closure Compiler is only safe given a well-advised subset of Javascript.
It delivers no reasonable guarantee of equivalence if code is not
written as the Closure team expected. Integration tests would catch any
such failures but for the time being I decided that even given the
micro-library limits, a slightly larger file is a worthwhile tradeoff
for a safer build process

Styles of Programming
---------------------

Oboe does not follow any single programming paradigm and is made of
components written in a mix of procedural, functional and
object-oriented programming styles. Classical object orientation is used
only so far as the library exposes an Object-oriented public API.
Although Javascript supports them, classes and constructors are not
used, nor is there any inheritance or notable polymorphism. Closures
form the primary means of data storage and hiding. Most entities do not
give a Javascript object on instantiation, they are constructed as a set
of event handlers with access to shared values from a common closure. As
inner-functions of the same containing function, the handlers share
access to variables from the containing scope and their reachability is
maintained because they are referenced by the event bus. From outside
the closure the values are not only private as would be seen in an OO
model, they are inherently unaddressable.

Although not following an established object orientated metamodel, the
high-level design hasn't departed very far from what could be made
following that style and OO design patterns have influenced the design nonetheless.
If we wish to think in terms of the OO paradigm we
might say that values trapped inside the closure are private class
attributes and that handlers it registers on the event bus are the
class' public methods. In this regard, the high-level internal design of
Oboe could be discussed using terms from a more standard object oriented
metamodel.

Javascript is of course an imperative language but over many iterations
Oboe has evolved towards a declarative programming style. For example,
incrementalContentBuilder.js
[incrementalContentBuilder.js](#incrementalContentBuilder.js) (Appendix
p.\pageref{incrementalContentBuilder.js}). was initially stateful and
procedural, reading as instructions to perform a task. Over many
refactors the flavour of the code has changed, now reading more like a
description of desired behaviour.

Event where it creates a larger deliverable library I have generally
preferred writing as short functions which can be joined together into
longer ones. Short functions reduce the size of the minimum testable
unit and allow very simple unit tests. Because of the pressures on code
size I decided not to use a general purpose functional library and
created my own with only the parts that are needed. See
[functional.js](#functional.js) (Appendix p.\pageref{functional.js}).
Functional programming in Javascript is known to be slower than other
styles, particularly in Firefox which lacks optimisation such as Lambda
Lifting [@functionalSpiderMonkey] but I do not think this should be a
major problem. Because of Javascript's single-threaded model, in the
browser any script execution takes place during execution frames,
interlaced with frames serving concurrent concerns. To minimise the
impact on other tasks such as rendering it is important that no task
occupies the CPU for very long. About 16ms is a fair target for the
maximum duration of a script execution frame since most monitors refresh
at 60Hz. In Node no limit can be implied from a display but any
CPU-hogging task degrades the responsiveness of other concerns.
Switching tasks is cheap so sharing the CPU well generally prefers many
small execution frames over a few larger ones. Whether running in a
browser or server, the bottleneck is more often I/O than processing
speed and so long as no task holds the CPU for an unusually long
execution frame it can be considered fast enough. Oboe's progressive
model favours sharing because it naturally splits tasks over many
execution frames which by a non-progressive mode would be performed as a
single task. Although the overall CPU time will be higher, Oboe should
share better with other concerns and because of better I/O management
the total system performance should be improved.

Incrementally building up the content
-------------------------------------

As shown in figure \ref{overallDesign} on page \pageref{overallDesign}
there is an incremental content builder and ascent tracer which handle
SAX events from the Clarinet JSON parser. By presenting to the
controller a simpler interface than is provided by Clarinet, taken
together these might be considered as an Adaptor pattern but adapted to
be even-driven rather than call-driven: we receive six types of event
and in response emit from a narrower vocabulary of two. The events
received are low level, reporting the sequence of tokens in the markup;
those emitted are much higher level, reporting a sequence of JSON nodes
and paths as they are discovered. Testing a JSONPath expression for a
match against any particular node requires the node itself, the path to
the node, and the ancestor nodes. For every newly found item in the JSON
this information is delivered as the payload of the `NODE\_FOUND` and
`PATH\_FOUND` events so that the controller can test for matches against
registered patterns.

![List representation of an ascent from leaf to root of a JSON tree.
Note the special ROOT token which represents the special location of the
root node, which has no path. ROOT is an object, taking advantage of
object identity to ensure that the location is unequal to all others.
This list form is built up by the incremental content builder and is the
format that compiled JSONPath expressions test for matches.
\label{ascent}](images/ascent.png)

The path of the current node is maintained as a singly linked list in
which each item holds the node and the field name that linked to the
node from its parent. See figure \ref{ascent}. Each link in the list is
immutable, enforced by newer Javascript engines using frozen objects
[^2]. The list is arranged as an ascent with the current node at the
near end and the root at the far end. Although paths are more typically
written as a descent, ordering as an ascent is more efficient because as
we traverse the JSON the current node is appended and removed many times
whereas the root is rarely replaced. As nodes open and close all updates
to the list are at the head, giving constant time access and mutation.
For familiarity, when paths are passed to application callbacks they are
reversed and converted to arrays.

For each Clarinet event the builder provides a corresponding handler
which, working from the current ascent, returns the next ascent after
the event has been applied. For example, the `objectopen` and
`arrayopen` event types are handled by adding a new item to the start of
the ascent, whereas for `closeobject` and `closearray` one is removed.
Over the course of parsing a complete JSON file the ascent will in this
way be manipulated to visit every node, allowing each to be tested
against the registered JSONPath expressions. Internally, the builder's
event handlers are declared as the combination of a smaller number of
basic reusable parts. The builder is largely unconcerned regarding a
JSON node's type whereas several of Clarinet's event types differ only
by the type of the node that they announce. Picking up `openobject` and
`openarray` events, both pass through to the same 'nodeFound', differing
only in the type of node which is first created. Similarly, Clarinet has
a `value` event type which is fired when a string or number is found in
the markup. Because primitive nodes are always leaves the builder treats
them as a node which instantaneously starts and ends, handled
programmatically as the composition of the `nodeFound` and
`nodeFinished` functions. The design of a small bank of smaller
instructions that are combined to build up larger ones is perhaps
reminiscent of the use of micro-instructions in CPU design.

Although the builder functions are stateless and side-effect free, while
visiting each JSON node the current ascent needs to be stored. This is
handled by the ascent tracker. This tiny component serves as a holder
for this data. Starting with the ascent initialised as an empty list, on
receiving a SAX event it passes the ascent to the handler and stores the
result so that when the next SAX event is received the updated ascent
can be given to the next handler.

Linked lists were chosen for the ascents in preference to the more
conventional approach of using native Javascript Arrays for several
reasons. Firstly, I find this area of the program more easy to test and
debug given immutable data structures. Employing native Arrays without
mutating would be very expensive because on each new path the array
would have to be copied rather than edited in-place. While debugging,
unpicking a stack trace is easier if I know that every value revealed is
the value that has always occupied that space because I don't have to
imagine the different values that were in the same space earlier or will
be there later. The lack of side effects means I can try new commands in
the debugger's CLI without worrying about breaking the execution of the
program. Most Javascript virtual machines are also quite poor at array
growing and shrinking so for collections whose size changes, arrays are
often are outperformed by linked lists. Finally, lists are a very
convenient format for the JSONPath engine to perform matching on as will
be discussed in the next section. The Javascript file
[lists.js](#lists.js) (Appendix p.\pageref{lists.js}) implements various
list functions: `cons`, `head`, `tail`, `map`, `foldR`, `all`, 'without'
as well as converting lists to and from arrays.

Oboe JSONPath Implementation
----------------------------

On the first commit the JSONPath implementation was little more than a
series of regular expressions[^3] but has slowly evolved into a
featureful and efficient implementation[^4]. The extent of the rewriting
was possible because the correct behaviour is well defined by test
specifications[^5].

The JSONPath compiler exposes a single higher-order function. This
function takes the JSONPath as a String and, proving it is a valid
expression, returns a function which tests for matches to the pattern.
Both the compiler and the functions that it generates benefit from being
stateless. The type of the compiler is difficult to express in
Javascript but expressed in Haskell syntax would be:

~~~~ {.haskell}
String -> Ascent -> JsonPathMatchResult
~~~~

The match result is either a miss or a hit. If a hit, the return value
will be the node captured by the match. If the pattern has an explicitly
capturing clause, the node corresponding to that clause is captured.
Otherwise, it is the node at the head of the ascent.

Implementation as a function was chosen even though it might have been
simpler to create a first-order version as seen in the published
JSONPath implementation:

~~~~ {.haskell}
(String, Ascent) -> JsonPathMatchResult
~~~~

If a first-order function were used the pattern string would have to be
freshly reinterpreted on each evaluation, repeating computation
unnecessarily. Because a pattern is registered once but then evaluated
perhaps hundreds of times per JSON file the most pressing performance
consideration is for matching to execute quickly. The time taken to
compile is relatively unimportant.

The compilation is performed by recursively by examining the left-most
side of the string for a JSONPath clause. For each clause type there is
a function which tests ascents for that clause, for example by checking
the field name; by partial completion the field name function would be
specialised to match against one particular name. Having generated a
function to match against the left-most clause, compilation recurs by
passing to itself the remaining unparsed right side of the string. This
continues until there is nothing left to parse. On each recursive call
the clause function generated wraps the result from the last recursive
call, resulting ultimately in a concentric series of clause functions.
The order of this series of functions mirrors the path ordering as an
ascent, so that the outermost function matches against deepest node, at
the near end of the ascent, and the innermost against the shallowest, at
the far end. When evaluated against an ascent, each clause function
examines the head of the list and, if it matches, passes the list onto
the next function. A special clause function, `skip1` is used for the
`.` (parent) syntax and places no condition on the head of the list,
unconditionally passing the tail on to the next clause, thus moving
matching on to the parent node. Similarly, there is a function
`skipMany` which maps onto the `..` (ancestor) syntax and recursively
consumes the minimum number of ascent items necessary for the next
clause to match, or fails if this cannot be done. In this way, we peel
off layers from the ascent as we move through the functions list until
we either exhaust the functions, indicating a match, or cannot continue,
indicating a fail.

This JSONPath implementation allows the compilation of complex
expressions into an executable form by combining many very simple
functions. As an example, the pattern `!.$person..{height tShirtSize}`
once compiled would resemble the Javascript functional representation
below:

~~~~ {.javascript}
statementExpr(             // outermost wrapper, added when JSONPath 
                           // is zero-length 
   duckTypeClause(         // token 5, {height tShirtSize}
      skipMany(            // token 4, '..', ancestor relationship 
         capture(          // token 3, '$' from '$person'
            nameClause(    // token 3, 'person' from '$person'
               skip1(      // token 2, '.', parent relationship
                  rootExpr // token 1, '!', matches only the root
               ) 
            'person' )
         )
   ), ['height', 'tShirtSize'])
)      
~~~~

Since I am using a side-effect free subset of Javascript for pattern
matching it would be safe to use a functional cache. As well as saving
time by avoiding repeated execution this could potentially also save
memory because where two JSONPath strings contain a common left side
they could share the inner parts of their functional expression. Given
the patterns `!.animals.mammals.human` and `!.animals.mammals.cats`, the
JSONPath engine will currently create two identical evaluators for
`!.animals.mammals.`. Although Javascript doesn't come with functional
caching, it can be added using the language itself, probably the best
known example being `memoize` from Underscore.js. I suspect, however,
that hashing the cache parameters might be slower than performing the
matching. Although the parameters are all immutable and could in theory
be hashed by object identity, in practice there is no way to access an
object id from inside the language so any hash of a node parsed out of
JSON would have to walk the entire subtree rooted from that node.

The tokenisation of patterns is split out into its own file and
separately tested. Because they are the simplest form able to express
the clause patterns the tokenisation is based on regular expressions.
The regular expressions each start with `^` so that they only match at
the head of the string. A more elegant alternative is the 'y' flag but
as of now this lacks wide browser support[^6].

By verifying the tokens through their own unit tests it is simpler to
thoroughly specify the tokenisation because it can be tested directly
without going though another layer. For pattern matching we might
consider the unit test layer of the test pyramid (figure
\ref{testpyramid} p.\pageref{testpyramid}) to be further split into two
sub-layers. Arguably, the upper of these sub-layer is not a unit test
because it is verifying more than one unit and there is some redundancy
since the tokens are tested both individually and as full expressions. I
maintain that a purist approach would not help because stubbing out the
tokenizer functions would be a considerable effort and would not improve
the rigor of the JSONPath specification.

[^1]: https://github.com/substack/http-browserify

[^2]: See
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/Object/freeze.
    Although older engines don't provide any ability to create immutable
    objects at run-time, we can be fairly certain that the code does not
    mutate these objects or the tests would fail when run in
    environments which are able to enforce this.

[^3]: JSONPath compiler from the first commit can be found at line 159
    here:
    https://github.com/jimhigson/oboe.js/blob/a17db7accc3a371853a2a0fd755153b10994c91e/src/main/progressive.js\#L159

[^4]: for contrast, the current source can be found at
    https://github.com/jimhigson/oboe.js/blob/master/src/jsonPath.js

[^5]: The current tests are viewable at
    https://github.com/jimhigson/oboe.js/blob/master/test/specs/jsonPath.unit.spec.js
    and
    https://github.com/jimhigson/oboe.js/blob/master/test/specs/jsonPathTokens.unit.spec.js

[^6]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular\_Expressions
