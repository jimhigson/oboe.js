Introduction
============

This purpose of this dissertation is to encourage the REST paradigm to
be viewed through a novel lens which in application this may be used to
deliver tangible benefits to many common REST use cases. Although I
express my thesis through programming, the contribution I hope to make
is felt more strongly as a modification in how we *think* about http
than as the delivery of new software.

In the interest of developer ergonomics, REST clients have tended to
style the calling of remote resources similar to the call style of the
host programming language. Depending on the language, one of two schemas
are followed: a synchronous style in which a some invocation halts
execution for the duration of the request before evaluating to the
fetched resource; or asynchronous in which the logic is specified to be
applied to a response once it is available. Languages encourage our
thinking to follow the terms that they easily support[@whorf56]. While
there is some overlap, languages which promote concurrency though
threading consider blocking in a single thread to be acceptable and will
generally prefer the former mode whereas languages with first class
functions are naturally conversant in callbacks and will prefer the
latter. We should remember in programming that languages limit the
patterns that we readily see [@rubylang] and that better mappings may be
possible. This observation extends to graphical notations such as UML
whose constructs strongly reflect the programming languages of the day.
For any multi-packet message sent via a network some parts will arrive
before others, at least approximately in-order, but viewed from inside a
language whose statements invariably yield single, discrete values it
comfortable to conceptualise the REST response as a discrete event. UML
sequence diagrams contain the syntax for instantaneously delivered
return values, with no corresponding notation for a resource whose data
is progressively revealed.

In most practical cases where we wish to be fast in performing a task
there is no reasonable distinction between acting *earlier* and being
*quicker*. To create efficient software we should be using data at the
first possible opportunity: examining content *while it streams* rather
than holding it unexamined until it is wholly available.

While the coining of the term REST represented a shift in how we think
about http, away from the transfer of hypertext documents to that of
arbitrary data [@rest pp. 407–416], it introduced no fundamentally new
methods. Similarly building on previous ideas, no new computing
techniques need be invented to realise my thesis. As a minimum it
requires an http client which reveals the response whilst it is in
progress and a parser which can begin to interpret that response before
it sees all of it. Nor is it novel to use these preexisting parts in
composition. Every current web browser already implements such a schema;
load any complex webpage -- essentially an aggregation of hypertext and
other resources -- the HTML will be parsed and displayed incrementally
while it is downloading and resources such as images are requested in
parallel as soon as they are referenced. The images may themselves be
presented incrementally in the case of progressive JPEGs or SVGs[^1].
This incremental display is achieved through highly optimised software
created for a single task, that of displaying web pages. The new
contribution of this dissertation is to provide a generic analog
applicable to any problem domain.

How REST aggregation could be faster
------------------------------------

![**Sequence diagram showing the aggregation of low-level REST
resources.** A client fetches an author's publication list and then
their first three articles. This sequence represents the most commonly
used technique in which the client does not react to the response until
it is complete. In this example the second wave of requests cannot be
made until the original response is complete, at which time they are
issued in quick succession.
\label{rest_timeline_1}](images/rest_timeline_1.png)

![**Revised aggregation sequence for a client capable of progressively
interpreting the resources.** Because arrows in UML sequence diagrams
draw returned values as a one-off happening rather than a continuous
process, I have introduced a lighter arrow notation representing
fragments of an incremental response. Each request for an individual
publication is made as soon as the its URL can be extracted from the
publications list and once all required data has been read from the
original response it is aborted rather than continue to download
unnecessary data. \label{rest_timeline_2}](images/rest_timeline_2.png)

Figures \ref{rest_timeline_1} and \ref{rest_timeline_2} comparatively
illustrate how a progressive client may, without adjustments to the
server, be used to produce an aggregated resource sooner. This results
in a moderate improvement in the time taken to show the complete
aggregation but a dramatic improvement in the time to show the first
content. The ability to present the first content as early as possible
is a desirable trait for system usability because it allows the user to
start reading earlier and a progressively rendered display in itself
increases the human perception of speed [@perceptionFaxSpeed]. Note also
how the cadence of requests is more steady in Figure
\ref{rest_timeline_2} with four connections opened at roughly equal
intervals rather than a single request followed by a rapid burst of
three. Both clients and servers routinely limit the number of
simultaneous connections per peer so avoiding bursts of requests is
further to our advantage. [Appendix i](#appendix_http_limits) lists some
actual limits.

Nodes in an n-tier architecture defy categorisation as 'client' or
'server' in a way which is appropriate from all frames of reference. A
node might be labeled as the 'server' from the layer below and 'client'
from the layer above. Although the "client software" labels in the
figures above hint at something running directly on a user's own device,
the same benefits apply if this layer is running remotely. If this layer
were generating a web page on the server-side to be displayed by the
client's browser, the perceptual speed improvements apply because of
http chunked encoding [@perceptionHttpChunkedSpeed]. If this layer were
a remote aggregation service, starting to write out the aggregated
response early provides much the same benefits so long as the client is
also able to interpret it progressively and, even if it were not, the
overall delivery remains faster.

Stepping outside the big-small tradeoff
---------------------------------------

Where a domain model contains data in a series with continuous ranges
requestable via REST, I have often noticed a tradeoff in the client's
design with regards to how much should be requested in each call.
Because at any time it shows only a small window into a much larger
model, the social networking site Twitter might be a good example. The
Twitter interface designers adopted a popular interface pattern,
Infinite Scrolling [@infinitescroll]. Starting from an initial page
showing some finite number of tweets, once the user scrolls and reaches
the end of the list the next batch is automatically requested. When
loaded, this new batch is converted to HTML and added to the bottom of
the page. Applied repeatedly the illusion of an infinitely long page in
maintained, albeit punctuated with pauses whenever new content is
loaded. For the programmers working on this presentation layer there is
a tradeoff between sporadically requesting many tweets, yielding long,
infrequent delays and frequently requesting a little, giving an
interface which stutters momentarily but often.

I propose that progressive loading could render this tradeoff
unnecessary by simultaneously delivering the best of both strategies. In
the Twitter example this could be achieved by making large requests but
instead of deferring all rendering until the request completes, add the
individual tweets to the page as they are incrementally parsed out of
the ongoing response. With a streaming transport, the time taken to
receive the first tweet should not vary depending on the total number
that are also being sent so there is no relationship between the size of
the request made and the time taken to first update the interface.

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
operators claim [@BBC3g] so while travelling the signal can be expected
to be lost and reestablished many times. Whilst not strictly forbidding
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
smallest work which can we said to realise my thesis. Amongst
commentators on start-up companies this is known as a *zoom-in pivot*
and the work it produces should be the *Minimum Viable Product* or MVP
[@lean p. 106-110], the guiding principle being that it is preferable to
produce a little well than more badly. By focusing tightly I cannot not
deliver a full stack so I am forced to implement only solutions which
interoperate with existing deployments. This is advantageous; to
somebody looking to improve their system small additions are easier to
action than wholesale change.

To reify the vision above, a streaming client is the MVP. Because all
network transmissions may be viewed though a streaming lens an
explicitly streaming server is not required. Additionally, whilst http
servers capable of streaming are quite common even if they are not
always programmed as such, I have been unable to find any example of a
streaming-capable REST client.

Criteria for success
--------------------

In evaluating this project, we may say it has been a success if
non-trivial improvements in speed can be made without a corresponding
increase in the difficulty of programming the client. This improvement
may be in terms of the absolute total time required to complete a
representative task or in a user's perception of the speed in completing
the task. Because applications in the target domain are much more
io-bound than CPU-bound, optimisation in terms of the execution time of
a algorithms will be de-emphasised unless especially egregious. The
measuring of speed will include a consideration of performance
degradation due to connections which are terminated early.

Additionally, I shall be looking at common ways in which the semantics
of a message are expanded as a system's design emerges and commenting on
the value of loose coupling in avoiding disruption given unanticipated
format changes.

[^1]: for quite an obviously visible example of progressive SVG loading,
    try loading this SVG using a recent version of Google Chrome:
    <http://upload.wikimedia.org/wikipedia/commons/0/04/Marriage_(Same-Sex_Couples)_Bill,_Second_Reading.svg>
    For the perfectionist SVG artist, not just the final image should be
    considered but also the XML source order, for example in this case
    it would be helpful if the outline of the UK appeared first and the
    exploded sections last.
