Introduction
============

This dissertation does not focus on implementing software for any
particular problem domain. Rather, its purpose is to encourage the REST
paradigm to be viewed through a novel lens. In application this may be
used to deliver tangible benefits to many common REST use cases.
Although I express my thesis through programming, the contribution I
hope to deliver is felt more strongly as a shift in how we *think* about
http than it is a change in the underlying technology.

In the interest of developer ergonomics, REST clients have tended to
style the calling of remote resources similar to the call style of the
host programming language. Depending on the language, one of two schemas
are followed: a synchronous style in which the http call is an
expression which evaluates to the resource that was fetched; or
asynchronous or monadic in which some logic is specified which may be
applied to the response once it is complete. This tendency to cast REST
calls using terms from the language feels quite natural; we may call a
remote service without having to make any adjustment for the fact that
it is remote. However, we should remember that this construct is not the
only possible mapping. Importing some moderate Whorfianism [@whorf56] [@sapir58] from
linguistics, we might venture to say that the programming languages we
use encourage us to think in the terms that they easily support. For any
multi-packet message sent via a network some parts will arrive before
others, at least approximately in-order, but whilst coding a C-inspired
language whose return statements yield single, discrete values it
comfortable to conceptualise the REST response as a discrete event.
Perhaps better suited to representing a progressively returned value
would have been the relatively unsupported Generator routine [@encycCompSci].

In most practical cases where software is being used to perform a task
there is no reasonable distinction between being earlier and being
quicker. Therefore, if our interest is to create fast software we should
be using data at the first possible opportunity. Examining data *while*
it streams rather than hold unexamined until the message ends.

The coining of the term REST represented a shift in how we think about
http, away from the transfer of hypertext documents to that of arbitrary
data [@rest pp. 407–416]. It introduced no fundamentally new methods. Likewise, no
genuinely new computer science techniques need be invented to realise my
thesis. As a minimum, the implementation requires an http client which
exposes the response whilst it is in progress and a parser which can
start making sense of a response before it sees all of it. I also could
not claim this thesis to be an entirely novel composition of such parts.
Few ideas are genuinely new and it is often wiser to mine for solved
problems then to solve again afresh. The intense competition of Web
browsers to be as fast as possible has already found this solution. Load
any graphics rich with images -- essentially an aggregation of hypertext
and images -- the HTML is parsed incrementally while it is downloading
and the images are requested as soon as individual \<img\> tags are
encountered. The browser's implementation involves a highly optimised
parser created for a single task, that of displaying web pages. The new
contribution of this dissertation is to provide a generic analog
applicable to any problem domain.

REST aggregation could be faster
--------------------------------

![**Sequence diagram showing aggregation of lower-level resources
exposed via REST.** A client fetches a listing of an author's
publications and then the first three articles. The sequence represents
the most commonly used technique in which the client does not react to
the response until it is complete. In this example the second wave of
requests cannot be made until after the original response is complete,
at which time they are issued in quick succession.
\label{rest_timeline_1}](images/rest_timeline_1.png)

![**Revised sequence of aggregation performed by a client capable of
progressively interpreting the fetched resource.** The client considers
the response to return progressively as many small parts. Because UML
sequence diagrams do not provide a concept of a returned value other
than as a one-off event, the notation of lighter arrows illustrating
fragments an ongoing response is introduced. Each request for an
individual publication is made at the earliest possible time. As soon as
the required data has been read from the original resource it is aborted
rather than continue with the download of unnecessary data. This results
in a moderate reduction in wait time to see all 3 articles but a
dramatic reduction in waiting before reading the first content. The
cadence of the right sequence has better pacing of requests with 4 being
made at roughly equal intervals rather than a single request and then a
rapid burst of 3. \label{rest_timeline_2}](images/rest_timeline_2.png)

Figure \ref{rest_timeline_1} and Figure \ref{rest_timeline_2} illustrate
how a progressive REST client, without adjustments being required to the
server may be used to display some data requested by a user sooner.
While the complete data should be available to the user significantly
earlier, we see a much greater improvement in how early the first piece
of data is able to be displayed. This is advantageous: firstly, even if
the total time to show the data were not improved, progressive display
improves the perception of performance [CITEME]; secondly, a user
wanting to scan from top to bottom may start reading the first article
while waiting for the later ones to arrive. Alternatively, seeing the
first article alone may allow the user to notice earlier that they have
requested the wrong author and allow them to backtrack earlier.

Although the label "client software" in the figures above hints at
software running directly on a user's own device, nodes in an n-tier
architecture can rarely be placed into client and server categories in a
way which is appropriate from all frames of reference. Rather, it is
common for nodes to be thought of as a client from the layer below and
as a server from the layer above. The advantage demonstrated holds if
the aggregation existing in this layer were actually running on a server
to provide a higher-level REST service than the one that it aggregates.
An progressive aggregator would perform the same function and see the
same benefits but simply be pushed one layer back in the stack. The
progressive view of http would allow progressive response to its http
request, allowing the data to be viewed similarly progressively.

Stepping outside the big-small tradeoff
---------------------------------------

Where a domain model contains a series of data, of which ranges are made
available via REST, I have often seen a trade-off with regards to how
much of the series each call should request. Answering this question is
usually a compromise between competing concerns in which it is not
simultaneously possible to addresses all concerns satisfactorily. A good
example might be a Twitter's pages listing a series of tweets where the
interface designers adopted a currently trending pattern [@infinitescroll], Infinite
Scrolling. Starting from an initial page showing some finite number of
tweets, upon scrolling to the bottom the next batch is automatically
requested. The new batch is fetched in a json format and, once loaded,
presented as html and added to the bottom of the page. Applied
repeatedly this allows the user to scroll indefinitely, albeit
punctuated by slightly jolting pauses while new content is loaded. To
frame the big-small tradeoff we might consider the extreme choices.
Firstly, requesting just one tweet per http request. By requesting the
smallest possible content individual calls would complete very quickly
and the pauses would be short. Taking the extreme small end the page
stutters, pausing momentarily but frequently. Taking the opposite
extreme, by requesting some huge number of tweets we see long periods of
smooth scrolling partitioned by long waits.

I propose that my thesis may be applied used to stand down from this
compromise by delivering pauses which are both infrequent and short. In
the Twitter example, once we have thinking about http progressively this
may be achieved quite simply by issuing large requests but instead of
deferring all rendering until the request completes, render individual
tweets incrementally as they are progressively parsed out of the ongoing
response.

Staying fast on a fallible network
----------------------------------

The reliability of networks that REST operates over varies widely.
Considering the worst case we see mobile networks in marginal signal
over which it is common for ongoing downloads to be abruptly
disconnected. Existing http clients handle this kind of unexpected
termination poorly. Consider the everyday situation of somebody using a
smartphone browser to check their email. The use of Webmail necessitates
that the communication in made via REST rather than a mail specific
protocol such as IMAP. Mobile data coverage is less than network
operators claim [@BBC3g] so while travelling the signal can be expected to
be lost and reestablished many times. Whilst not strictly forbidding
their inspection, the web developer's standard AJAX toolkit are
structured in such a way as to encourage the developer to consider
partially successful messages as wholly unsuccessful. For example, the
popular AJAX library jQuery automatically parses complete JSON or XML
responses before handing back to the application. But on failure there
is no attempt to parse or deliver the partial response. To programmers
who know where to look the partial responses are retrievable as raw text
but handling them is a special case, bringing-your-own-parser affair.
Because of this difficulty I can only find examples of partial messages
being dropped without inspection. In practice this means that for the
user checking her email, even if 90% of her inbox had been retrieved she
will be shown nothing. When the network is available again the
application will have to download from scratch, including the 90% which
it already fetched. I see much potential for improvement here.

Not every message, incomplete, is useful. Whilst of course a generic
REST client cannot understand the semantics of specific messages fully
enough to decide if a partially downloaded message is useful, I propose
it would be an improvement if the content from incomplete responses
could be handled using much the same programming as for complete
responses. This follows naturally from a conceptualisation of the http
response as a progressive stream of many small parts; as each part
arrives it should be possible to use it without knowing if the next will
be delivered successfully. This style of programming encourages thinking
in terms of optimistic locking. Upon each partial delivery there is an
implicit assumption that it may be acted on straight away and the next
will also be successful. In cases where this assumption fails the
application should be notified so that some rollback may be performed.

Agile methodologies, frequent deployments, and compatibility today with versions tomorrow
-----------------------------------------------------------------------------------------

In most respects SOA architecture fits well with the fast release cycle
that Agile methodologies encourage. Because in SOA we may consider that
all data is local rather than global and that the components are loosely
coupled and autonomous, frequent releases of any particular sub-system
shouldn't pose a problem to the correct operation of the whole.
Following emergent design it should be possible for the format of
resources to be realised slowly and iteratively as a greater
understanding of the problem is achieved. Unfortunately in practice the
ability to change is hampered by tools which encourage programming
against rigidly specified formats. Working in enterprise I have often
seen the release of dozens of components cancelled because of a single
unit that failed to meet acceptance criteria. By allowing a tight
coupling that depends on exact versions of formats, the perfect
environment is created for contagion whereby the updating of any single
unit may only be done as part of the updating of the whole.

An effective response to this problem would be to integrate into a REST
client library the ability to use a response whilst being only loosely
coupled to the *shape* of the overall message.

Deliverables
------------

To avoid feature creep I am paring down the software deliverables to the
smallest work which can we said to realise my thesis. Amongst commentators
on start-up companies this is known as a *zoom-in pivot* and the work
it produces should be the *Minimum Viable Product* or MVP [@lean p. ??], the
guiding principle being that it is preferable to produce a little well than
more badly. By focusing tightly I cannot not deliver a full stack so I
am forced to implement only solutions which interoperate with
existing deployments. This is advantageous; to somebody looking to improve their
system small additions are easier to action than wholesale change.

To reify the vision above, a streaming client is the MVP. Because all 
network transmissions may be viewed though a
streaming lens an explicitly streaming server is not required.
Additionally, whilst http servers capable of streaming are quite common
even if they are not always programmed as such, I have been unable to
find any example of a streaming-capable REST client.

Criteria for success
--------------------

In evaluating this project, we may say it has been a success if
non-trivial improvements in speed can be made without a corresponding
increase in the difficulty of programming the client. This improvement
may be in terms of the absolute total time required to complete a
representative task or in a user's perception of the speed in completing
the task. Because applications in the target domain are much more
io-bound than CPU-bound, optimisation in terms of the execution time of a
algorithms will be de-emphasised unless especially egregious. The measuring
of speed will include a consideration of performance degradation
due to connections which are terminated early.

Additionally, I shall be looking at common ways in which the semantics of a
message are expanded as a system's design emerges and commenting on the 
value of loose coupling in avoiding disruption given unanticipated format changes.  


