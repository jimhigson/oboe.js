Implementation
==============

Componentisation of the project
-------------------------------

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
communication inside an Oboe instance and most components interact
solely by using this bus; receiving events, processing them, and
publishing further events in response. The use of an event bus is a
variation on the Observer pattern which removes the need for each unit
to locate specific other units before it may listen to their output,
giving a highly decoupled shape to the library in which each part knows
the events it requires but not who publishes them. Once everything is
wired into the bus no central control is required and the larger
behaviours emerge as a consequence of the interactions between finer
ones.

Design for automated testing
----------------------------

![**The test pyramid**. Many tests specify the low-level components,
fewer on their composed behaviours, and fewer still on a whole-system
level. \label{testpyramid}](images/testPyramid.png)

80% of the code written for this project is test specification. Because
the correct behaviour of a composition requires the correct behaviour of
its components, the majority are *unit tests*. The general style of a
unit test is to plug the item under test into a mock event bus and check
that when it receives certain input events the expected output events
are consequently published.

The *Component tests* step back from examining individual components to
a position where their behaviour as a composition may be examined.
Because the compositions are quite simple there are fewer component
tests than unit tests. The component tests do not take account of how
the composition is drawn and predominantly examine the behaviour of the
library through its public API. One exception is that the streamingXHR
component is switched for a stub so that http traffic can be simulated.

At the apex of the test pyramid are a small number of *integration
tests*. These verify Oboe as a black box without any knowledge of, or
access to, the internals, using the same API as is exposed to
application programmers. These tests are the most expensive to write but
a small number are necessary in order to verify that Oboe works
correctly end-to-end. Without access to the internals http traffic
cannot be faked so before these tests are performed a corresponding REST
service is started. This test service is written using Node and returns
known content progressively according to predefined timings, somewhat
emulating a slow internet connection. The integration tests particularly
verify behaviours where platform differences could cause
inconsistencies. For example, the test url `/tenSlowNumbers` writes out
the first ten natural numbers as a JSON array at a rate of two per
second. The test registers a JSONPath selector that matches the numbers
against a callback that aborts the http request on seeing the fifth. The
correct behaviour is to get no sixth callback, even when running on a
platform lacking support for XHR2 where all ten will have already been
downloaded.

Confidently black-box testing a stateful unit is difficult. Because of
side-effects and hidden state we can not be certain that the same call
won't later give a different behaviour. Building up the parse result
from SAX events is a fairly complex process which cannot be implemented
efficiently as wholly side-effect free Javascript. To promote
testability the state is delegated to a simple state-storing unit. The
intricate logic may then be expressed as a separately tested set of
side-effect free functions which transition between one state and the
next. Although proof of correctness is impossible, for whichever results
the functions give while under test, uninfluenced by state I can be
confident that they will always yield the same response given the same
future events. The separate unit maintaining the state has exactly one
responsibility, to hold the incremental parse output between function
calls, and is trivial to test. This approach slightly breaks with the
object oriented principle of encapsulation by hiding state behind the
logic which acts on it but I feel that the departure is justified by the
more testable codebase.

To enhance testability Oboe has also embraced dependency injection.
Components do not instantiate their dependencies but rather rely on them
being passed in by an inversion of control container during the wiring
phase. For example, the network component which hides browser
differences does not know how to create the underlying XHR that it
adapts. Undoubtedly, by not instantiating its own transport this
component presents a less friendly interface: it's data source is no
longer a hidden implementation detail but exposed as a part of it's
API as the responsibility of the caller. I feel this disadvantage is
mitigated by the interface being purely internal. Dependency injection
in this case allows the tests to be written more simply because it is
easy to substitute the real XHR for a stub. Unit tests should test
exactly one unit; were the streaming http object to create its own
transport, the XHR would also be under test, plus whichever external
service it connects to. Because Javascript allows redefinition of built
in types the stubbing could have potentially also been done by
overwriting the XHR constructor to return a mock. However this is to be
avoided as it opens up the possibility of changes to the environment
leaking between test cases.

Running the tests
-----------------

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
per day isn't merely convenient, this build process makes me a better
programmer.

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
convenient while programming but unless a project is written as a single
file in practice some build phase is required to create an easily
distributable form. Dependency managers have not yet become standard for
client-side web development so dependant libraries are usually manually
downloaded. For a developer wishing to include my library in their own
project a single file is much more convenient than the multi-file raw
source. If they are not using a similar build process on their site, a
single file is also faster to transfer to their users, mostly because
the http overhead is of constant size per resource.

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
many requests is slow. For efficient delivery Require provides the
`optimise` command which concatenates an application into a single file
by using static analysis to deduce a workable source order. Because the
`require` function may be called from anywhere, this is undecidable in
the general case so when a safe concatenation order cannot be found
Require falls back to lazy loading. In practice this isn't a problem
because imports are generally not subject to branching. For larger
webapps lazy loading is actually a feature because it speeds up the
initial page load. The technique of *Asynchronous Module Definition*,
AMD intentionally imports rarely-loaded modules in response to events;
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
task. After finding a free Grunt plugin analogous to the unix `cat`
command I quickly had a working build process and a distributable
library requiring no run-time dependency management to be loaded.

For future consideration there is Browserify. This library reverses the
'browser first' Javascript mindset by viewing Node as the primary target
for Javascript development and adapting the browser environment to
match. Browserify converts applications written for Node into a single
file packaged for delivery to a web browser. Significantly, other than
adaptors wrapping browser APIs in the call style of the Node
equivalents, Browserify leaves no trace of itself in the final
Javascript. Additionally, the http adaptor[^1] is capable of using XHRs
as a streaming source when run on supporting browsers.

Javascript source can be made significantly smaller by *minification*
techniques such as reducing scoped symbols to a single character or
deleting the comments. For Oboe the popular minifier library *Uglify*
was chosen. Uglify performs only surface optimisations, concentrating
mostly on producing compact syntax by manipulating the code's abstract
syntax tree. I also considered Google's *Closure Compiler* which
resembles a traditional optimiser by leveraging a deeper understanding
of the code semantics. Unfortunately, proving equivalence in highly
dynamic languages is often impossible and Closure Compiler is only safe
given a well-advised subset of Javascript. It delivers no reasonable
guarantee of equivalence if code is not written as the Closure team
expected. Integration tests would catch any such failures but for the
time being I decided that even given the micro-library limits, a
slightly larger file is a worthwhile tradeoff for a safer build process.

Styles of programming
---------------------

Oboe does not follow any single paradigm and is written as a mix of
procedural, functional and object-oriented programming styles. Classical
object orientation is used only so far as the library exposes an OO
public API. Although Javascript supports them, classes and constructors
are not used, nor is there any inheritance or notable polymorphism.
Closures form the primary means of data storage and hiding. Most
entities do not give a Javascript object on instantiation, they are
constructed as a set of event handlers with access to shared values from
a common closure. As inner-functions of the same containing function,
the handlers share access to variables from the containing scope. From
outside the closure the values are not only protected as private as
would be seen in an OO model, they are inherently unaddressable.

Although not following an established object orientated metamodel, the
high-level componentisation hasn't departed very far from what I would
make were I following that style and OO design patterns have influenced
their layout considerably. If we wished to think in terms of the OO
paradigm we might say that values trapped inside closures are private
attributes and that the handlers registered on the event bus are public
methods. In this regard the high-level internal design of Oboe can be
discussed using the terms from a more standard object oriented
metamodel.

Even where it creates a larger deliverable library I have generally
preferred writing as short functions which are combined to form longer
ones. Writing shorter functions reduces the size of the minimum testable
unit which, because each test specifies a very small unit of
functionality, encourages the writing of very simple unit tests. Because
the tests are simple there is less room for unanticipated cases to hide.
Due to pressures on code size I decided not to use a general purpose
functional library and created my own with only the parts that are
needed. See [functional.js](#header_functional) (Appendix
p.\pageref{src_functional}). Functional programming in Javascript is
known to be slower than other styles, particularly in Firefox which
lacks optimisations such as Lambda Lifting [@functionalSpiderMonkey]. I
do not think this should be a major problem. Because of its
single-threaded execution model, in the browser any Javascript is run
during script execution frames, interlaced with frames for other
concurrent concerns. To minimise the impact on other concerns such as
rendering it is important that no task occupies the CPU for very long.
Since most monitors refresh at 60Hz, about 16ms is a fair target for the
maximum duration of a browser script frame. In Node no limit can be
implied from a display but any CPU-hogging task degrades the
responsiveness of any concurrent work. Switching tasks is cheap so
sharing the CPU well generally prefers many small execution frames over
a few larger ones. Whether running in a browser or server, the
bottleneck is more often I/O than processing speed; providing no task
contiguously holds the CPU for an unusually long time an application can
usually be considered fast enough. Oboe's progressive model favours
sharing because it naturally splits the work over many execution frames
which by a non-progressive mode would be performed during a single
frame. Although the overall CPU time will be higher, Oboe should share
the processor more cooperatively and because of better I/O management
the overall system responsiveness should be improved.

Incrementally building the parsed content
-----------------------------------------

As shown in figure \ref{overallDesign} on page \pageref{overallDesign},
there is an *incremental content builder* and *ascent tracer* which
handle SAX events from the Clarinet JSON parser. By presenting to the
controller a simpler interface than is provided by Clarinet, taken
together these might be considered as an Adaptor pattern, albeit
modified to be event-driven rather than call-driven: we receive six event
types and in response emit from a vocabulary of two, `NODE_FOUND` and
`PATH_FOUND`. The events received from Clarinet are low level, reporting
the sequence of tokens in the markup; those emitted are at a much higher
level of abstraction, reporting the JSON nodes and paths as they are
discovered. Testing a JSONPath expression for a match against any
particular node requires the node itself, the path to the node, and the
ancestor nodes. For each newly found item in the JSON this information
is delivered as the payload of the two event types emitted by the
content builder. When the callback adaptors receive these events they
have the information required to test registered patterns for matches
and notify application callbacks if required.

![**List representation of an ascent rising from leaf to root through a
JSON tree.** Note the special ROOT value which represents the location
of the pathless root node. The ROOT value is an object, taking advantage
of object uniqueness to ensure that its location is unequal to all
others. \label{ascent}](images/ascent.png)

The path to the current node is maintained as a singly linked list in
which each item holds the node and the field name that links to the node
from its parent. The list and the items it contains are immutable,
enforced in newer Javascript engines by using frozen objects [^2]. The
list is arranged as an ascent with the current node at the near end and
the root at the far end. Although paths are typically written as a
*descent*, ordering as an *ascent* is more efficient because every SAX
event can be processed in constant time by adding to or removing from
the head of the list. For familiarity, where paths are passed to
application callbacks they are first reversed and converted to arrays.

For each Clarinet event the builder provides a corresponding handler
which, working from the current ascent, returns the next ascent after
the event has been applied. For example, the `openobject` and
`openarray` event types are handled by adding a new item at the head of
the ascent but for `closeobject` and `closearray` one is removed. Over
the course of parsing a JSON resource the ascent will in this way be
manipulated to visit every node, allowing each to be tested against the
registered JSONPath expressions. Internally, the builder's handlers for
SAX events are declared as the combination of a smaller number of basic
reusable parts. Several of Clarinet's event types differ only by the
type of the node that they announce but the builder is largely
unconcerned regarding a JSON node's type. On picking up `openobject` and
`openarray` events, both pass through to the same `nodeFound` function,
differing only in the type of the node which is first created.
Similarly, Clarinet emits a `value` event when a string or number is
found in the markup. Because primitive nodes are always leaves the
builder treats them as a node which instantaneously starts and ends,
handled programmatically as the composition of the `nodeFound` and
`nodeFinished` functions.

Although the builder functions are stateless and side-effect free, while
visiting each JSON node the current ascent needs to be stored. This is
handled by the ascent tracker which serves as a holder for this data.
Starting with the ascent initialised as the empty list, on receiving a
SAX event it passes the ascent to the handler and stores the result so
that when the next SAX event is received the updated ascent can be given
to the next handler.

Linked lists were chosen for the ascents in preference to the more
conventional approach of using native Javascript arrays for several
reasons. Firstly, I find the program more easy to test and debug given
immutable data structures. Employing native Arrays without mutating
would be very expensive because on each new path the whole array would
have to be copied. Secondly, while debugging, unpicking a stack trace is
easier if I know that every value revealed is the value that has always
occupied that space and I don't have to project along the time axis by
imagining which values were in the same space earlier or might be there
later. Thirdly, the lack of side effects means that I can try new
commands in the debugger's CLI without worrying about breaking the
execution of the program. Most Javascript virtual machines are also
quite poor at array growing and shrinking so for collections whose size
changes often, arrays are relatively inperformant. Finally, lists are a
very convenient format for the JSONPath engine to match against as will
be discussed in the next section. The Javascript file
[lists.js](#header_lists) (Appendix p.\pageref{src_lists}) implements
various list functions: `cons`, `head`, `tail`, `map`, `foldR`, `all`,
`without` as well as providing conversions to and from arrays.

Oboe JSONPath implementation
----------------------------

With the initial commit the JSONPath implementation was little more than
a series of regular expressions[^3] but has slowly evolved into a
featureful and efficient implementation. The extent of the rewriting was
possible because the correct behaviour is well defined by test
specifications[^4]. The JSONPath compiler exposes a single higher-order
function. This function takes the JSONPath as a string and, proving it
is a valid expression, returns a function which tests for matches to the
pattern. The type is difficult to express in Javascript but expressed
as Haskell would be:

~~~~ {.haskell}
String -> Ascent -> JsonPathMatchResult
~~~~

The match result is either a hit or a miss. If a hit, the return value
is the node captured by the match. Should the pattern have an explicitly
capturing clause the node corresponding to that clause is captured,
otherwise it is the node at the head of the ascent. Implementation as a
higher-order function was chosen even though it might have been simpler
to create a first-order version as seen in the original JSONPath
implementation:

~~~~ {.haskell}
(String, Ascent) -> JsonPathMatchResult
~~~~

This version was rejected because the pattern string would be freshly
reinterpreted on each evaluation, repeating computation unnecessarily.
Because a pattern is registered once but then evaluated perhaps hundreds
of times per JSON file the most pressing performance consideration is
for matching to execute quickly. The extra time needed to compile a
pattern when new application callbacks are registered is relatively
insignificant because it is performed much less often.

The compilation is performed by recursively examining the left-most
side of the string for a JSONPath clause. For each clause type there is
a function which tests ascents for that clause, for example by checking
the field name; by partial completion the field name function would be
specialised to match against one particular name. Having generated a
function to match against the left-most clause, compilation continues
recursively by passing itself the remaining unparsed right-side of the
string, which repeats until the terminal case where there is nothing
left to parse. On each recursive call the clause function generated
wraps the result from the last recursive call, resulting ultimately in a
concentric series of clause functions. The order of these functions
mirrors the ordering of paths as an ascent, so that the outermost
function matches against the node at the near end of the ascent, and the
innermost against the far end. When evaluated against an ascent, each
clause function examines the head of the list and, if it matches, passes
the list onto the next function. A special clause function, `skip1` is
used for the `.` (parent) syntax and places no condition on the head of
the list, unconditionally passing the tail on to the next clause, thus
moving matching on to the parent node. Similarly, there is a function
`skipMany` which maps onto the `..` (ancestor) syntax and recursively
consumes the minimum number of ascent items necessary for the next
clause to match or fails if this cannot be done. In this way, we peel
off layers from the ascent as we move through the function list until we
either exhaust the functions, indicating a match, or cannot continue,
indicating a fail.

This JSONPath implementation allows the compilation of complex
expressions into an executable form by combining many very simple
functions. As an example, the pattern `!.$person..{height tShirtSize}`
once compiled would resemble the Javascript functional representation
below:

~~~~ {.javascript}
statementExpr(             // outermost wrapper, added when JSONPath 
                           //    is zero-length 
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
they could share the inner part of their functional expression. Given
the patterns `!.animals.mammals.human` and `!.animals.mammals.cats`, the
JSONPath engine will currently create two identical evaluators for
`!.animals.mammals`. Likewise, while evaluating a pattern that requires
matches at multiple depths in the JSON hierarchy against several sibling
elements, the same JSONPath evaluator term could be tested against the
parent element many times, always with the same result. Although
Javascript doesn't come with functional caching, it can be added using
the language itself, probably the best known example being `memoize`
from Underscore.js. I suspect, however, that hashing the cache
parameters might be slower than performing the matching. Although the
parameters are all immutable and could in theory be hashed by object
identity, in practice there is no way to access an object ID from inside
the language so any hash function for a node parsed out of JSON would
have to walk the entire subtree rooted from that node. Current
Javascript implementations also make it difficult to manage caches in
general from inside the language because there is no way to occupy only
spare memory. Weak references are proposed in ECMAScript 6 but currently
only experimentally supported[^5]. If the hashing problem were solved
the WeakHashMap would be ideal for adding functional caching in future.

Functions describing the tokenisation of the JSONPath language are given
their own source file and tested independently of the compilation.
Regular expressions are used because they are the simplest form able to
express the clause patterns. Each regular expression starts with `^` so
that they only match at the head of the string, the 'y' flag would be a
more elegant alternative but as of now this lacks wider browser
support[^6]. By verifying the tokenisation functions through their own
tests it is simpler to create thorough specification because the tests
may focus on the tokenisation more clearly without having to observe its
results though another layer. For JSONPath matching we might consider
the unit test layer of the test pyramid (figure \ref{testpyramid}
p.\pageref{testpyramid}) to be split into two further sub-layers.
Arguably, the upper of these sub-layers is not a unit test because it is
verifying more than one unit, the tokeniser and the compiler, and there
is some redundancy since the tokenisation is tested both independently
and through a proxy. However, a more purist approach would not be any
more useful because stubbing out the tokeniser functions before testing
the compiler would be a considerable effort and I do not believe it
would improve the rigor of the JSONPath specification.

Differences in the working of programs that can be easily written using Oboe.js
-------------------------------------------------------------------------------

Because of assumptions implicit in either technique, a program written
using Oboe.js will perform subtly different actions from one written
using more conventional libraries, even if the programmer means to
express the same thing. Consider the two examples below in which Node.js
is used to read a local JSON file and write to the console.

~~~~ {.javascript}
oboe( fs.createReadStream( "/home/me/secretPlans.json" ) )
   .on("node", {
      "schemes.*": function(scheme){
         console.log("Aha! " + scheme);
      },
      "plottings.*": function(deviousPlot){
         console.log("Hmmm! " + deviousPlot);
      }   
   })
   .on("done", function(){
      console.log("*twiddles mustache*");
   })
   .on("fail", function(){
      console.log("Drat! Foiled again!");   
   });
~~~~

~~~~ {.javascript}
fs.readFile("/home/me/secretPlans.json", function( err, plansJson ){     
   if( err ) {
      console.log("Drat! Foiled again!");
      return;
   }
   var plans = JSON.parse(err, plansJson);
   
   plans.schemes.forEach(function( scheme ){
      console.log("Aha! " + scheme);   
   });   
   plans.plottings.forEach(function(deviousPlot){
      console.log("Hmmm! " + deviousPlot);
   });
      
   console.log("*twiddles mustache*");   
});
~~~~

While the behaviours intended by the programmer are similar, the
accidents differ between the two. It is likely that most programmers
would not be aware of these differences as they write. In the first
example the order of the output for schemes and plans will match their
order in the JSON, whereas for the second scheming is always done before
plotting. The error behaviours are also different -- the first prints
until it has an error, the second prints if there are no errors. In the
second example it is *almost mandatory* to check for errors before
starting the output whereas in the first it feels most natural to
register the error listener at the end of the chained calls. I prefer
the source order in the first because the the normal case is listed
before the abnormal one and it seems odd to me to describe a system's
abnormal cases first.

Considering the code style that is encouraged, the first example takes a
more declarative form by specifying the items of interest using patterns
whereas the second is more imperative by explicitly looping through the
items. If several levels of selection were required, such as
`schemes.*.steps.*`, other than a longer JSONPath pattern the first
example would not grow in complexity whereas the second would require
nested looping. The cyclic complexity of programming using Oboe would
stay roughly constant whereas using programmatic drill-down it increases
linearly with the number of levels that must be traversed.

[^1]: https://github.com/substack/http-browserify

[^2]: See
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/Object/freeze.
    Although older engines don't provide any ability to create immutable
    objects, we can be fairly certain that the code does not mutate
    these objects or the tests would fail with attempts to modify in
    environments which are able to enforce it.

[^3]: JSONPath compiler from the first commit can be found at line 159
    here:
    https://github.com/jimhigson/oboe.js/blob/a17db7accc3a371853a2a0fd755153b10994c91e/src/main/progressive.js\#L159
    for contrast, the current source can be found [in the
    appendix](#jsonPath.js) on page \pageref{src_jsonPath} or at
    https://github.com/jimhigson/oboe.js/blob/master/src/jsonPath.js

[^4]: The current tests are viewable at
    https://github.com/jimhigson/oboe.js/blob/master/test/specs/jsonPath.unit.spec.js
    and
    https://github.com/jimhigson/oboe.js/blob/master/test/specs/jsonPathTokens.unit.spec.js

[^5]: At time of writing, Firefox is the only engine supporting
    WeakHashMap by default. In Chome it is implemented but not available
    to Javascript unless explicitly enabled by a browser flag.
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/WeakMap
    retrieved 11th October 2013

[^6]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular\_Expressions
