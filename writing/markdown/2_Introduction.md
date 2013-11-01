Introduction
============

This purpose of this dissertation is to encourage the REST paradigm to
be viewed through a novel lens which in application may be used to
deliver tangible benefits to many common REST use cases. Although I
express my thesis through programming, the contribution I hope to make
is felt more strongly as a modification in how we *think* about http
than as the delivery of new software.

In the interest of developer ergonomics, REST clients have tended to
style the calling of remote resources similar to the call style of the
host programming language. Depending on the language, one of two schemas
are followed: a synchronous, blocking style in which a some invocation
halts execution for the duration of the request before evaluating to the
fetched resource; or asynchronous, non-blocking in which some logic is
specified to be applied to a response once it is available. Languages
encourage our thinking to follow the terms that they easily
support[@whorf56]. Languages which promote concurrency though threading
generally consider blocking in a single thread to be acceptable and will
prefer the synchronous mode whereas languages with first class functions
are naturally conversant in callbacks and will prefer asynchronous I/O.
We should remember in programming that languages limit the patterns that
we readily see [@rubylang] and that better mappings may be possible.
This observation extends to graphical notations such as UML whose
constructs strongly reflect the programming languages of the day. For
any multi-packet message sent via a network some parts will arrive
before others, at least approximately in-order, but viewed from inside a
language whose statements invariably yield single, discrete values it is
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
parallel as soon as they are referenced. in the case of progressive
JPEGs or SVGs[^1] the images may themselves be presented incrementally.
This incremental display is achieved through highly optimised software
created for a single task, that of displaying web pages. The new
contribution of this dissertation is to provide a generic analogue,
applicable to any problem domain.

How REST aggregation could be faster
------------------------------------

![**Sequence diagram showing the aggregation of low-level REST resources
by an intermediary.** A client fetches an author's publication list and
then their first three articles. This sequence represents the most
commonly used technique in which the client does not react to the
response until it is complete. In this example the second wave of
requests cannot be made until the original response is complete, at
which time they are issued in quick succession.
\label{rest_timeline_1}](images/rest_timeline_1.png)

![**Revised aggregation sequence for a client capable of progressively
interpreting the resources.** Because arrows in UML sequence diagrams
draw returned values as a one-off happening rather than a continuous
process, I have introduced a lighter arrow notation representing
fragments of an incremental response. Each request for an individual
publication is made as soon as its URL can be extracted from the
publications list and once all required data has been read from the
original response it is aborted rather than continuing to download
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
simultaneous connections per peer so avoiding bursts is further to our
advantage. [Appendix i](#appendix_http_limits) lists some actual limits.

Nodes in an n-tier architecture defy categorisation as 'client' or
'server' in a way which is appropriate from all frames of reference. A
node might be labeled as the 'server' from the layer below and 'client'
from the layer above. Although the "client software" labels in the
figures \ref{rest_timeline_1} and \ref{rest_timeline_2} hint at
something running directly on a user's own device, the same benefits
apply if this layer is running remotely. If this layer were generating a
web page on the server-side to be displayed by the client's browser, the
same perceptual speed improvements apply because of http chunked
encoding [@perceptionHttpChunkedSpeed]. If this layer were a remote
aggregation service, starting to write out the aggregated response early
provides much the same benefits for a client able to interpret it
progressively and, even if it is not, the overall delivery remains
faster.

Stepping outside the big-small tradeoff
---------------------------------------

Where a domain model is requestable via REST and contains data in a
series with continuous ranges I have often noticed a tradeoff in client
design with regards to how much should be requested with each call.
Because at any time it shows only a small window into a much larger
model, the social networking site Twitter might be a good example. The
Twitter interface designers adopted a popular interface pattern,
Infinite Scrolling [@infinitescroll]. Starting from an initial page
showing some finite number of tweets, once the user scrolls and reaches
the end of the list the next batch is automatically requested. When
loaded, this new batch is converted to HTML and added to the bottom of
the page. Applied repeatedly the illusion of an infinitely long page is
maintained, albeit punctuated with pauses whenever new content is
loaded. For the programmers working on this presentation layer there is
a tradeoff between sporadically requesting many tweets, yielding long,
infrequent delays and frequently requesting a few, giving an interface
which stutters momentarily but often.

I propose that progressive loading could render this tradeoff
unnecessary by simultaneously delivering the best of both strategies. In
the Twitter example this could be achieved by making large requests but
instead of deferring all rendering until the request completes, add the
individual tweets to the page as they are incrementally parsed out of
the ongoing response. With a streaming transport, the time taken to
receive the first tweet should not vary depending on the total number
that are also being sent so there is no relationship between the size of
the request made and the time required to first update the interface.

Staying fast on a fallible network
----------------------------------

REST operates over networks whose reliability varies widely. On
unreliable networks connections are abruptly dropped and in my opinion
existing http clients handle unexpected terminations suboptimally.
Consider the everyday situation of a person using a smartphone browser
to check their email. Mobile data coverage is often weak outside of
major cities [@opensignal] so while travelling the signal will be lost
and reestablished many times. The web developer's standard toolkit is
structured in a way that encourages early terminated connections to be
considered as wholly unsuccessful rather than as partially successful.
For example, the popular AJAX library jQuery automatically parses JSON
or XML responses before passing back to the application but given an
early disconnection there is no attempt to hand over the partial
response. To the programmer who knows where to look the partial
responses are extractable as raw text but handling them involves writing
a special case and is difficult because standard parsers are not
amenable to incomplete markup. Because of this difficulty I can only
find examples of partial messages being dropped without inspection. For
the user checking her email, even if 90% of her inbox had been retrieved
before her phone signal was lost, the web application will behave as if
it received none and show her nothing. Later, when the network is
available again the inbox will be downloaded from scratch, including the
90% which has already been successfully delivered. I see much potential
for improvement here.

I propose moving away from this polarised view of
successful/unsuccessful requests to one in which identifiable parts of a
message are recognised as interesting in themselves, regardless of what
follows, and these parts are handed back to the application as streaming
occurs. This follows naturally from a conceptualisation of the http
response as a progressive stream of many small parts; as each part
arrives it should be possible to use it without knowing if the next will
be delivered successfully. Should an early disconnection occur, the
content delivered up to that point will have already been handled so no
special case is required to salvage it. In most cases the only recovery
necessary will be to make a new request for just the part that was
missed. This approach is not incompatible with a problem domain where
the usefulness of an earlier part is dependent on the correct delivery
of the whole providing optimistic locking is used. In this case earlier
parts may be used immediately but their effect rolled back should a
notification of failure be received.

Agile methodologies, frequent deployments, and compatibility today with versions tomorrow
-----------------------------------------------------------------------------------------

In most respects a SOA architecture fits well with the fast release
cycle encouraged by Agile methodologies. Because in SOA we may consider
that all data is local rather than global and that the components are
loosely coupled and autonomous, frequent releases of any particular
sub-system shouldn't pose a problem to the correct operation of the
whole. In allowing a design to emerge organically it should be possible
for the structure of resource formats to be realised slowly and
iteratively while a greater understanding of the problem is gained.
Unfortunately in practice the ability to change often is hampered by
tools which encourage programming against rigidly specified formats.
When a data consumer is allowed to be tightly coupled to a data format
it will resist changes to the programs which produce data in that
format. Working in enterprise I have often seen the release of dozens of
components cancelled because of a single unit that failed to meet
acceptance criteria. By insisting on exact data formats, subsystems
become tightly coupled and the perfect environment is created for
contagion whereby the updating of any single unit may only be done as
part of the updating of the whole.

An effective response to this problem would be to integrate into a REST
client programs the ability to use a response whilst being only loosely coupled
to the overall *shape* of the message.

Deliverables
------------

To avoid feature creep I am paring down the software deliverables to the
smallest work which can be said to realise my thesis, the guiding
principle being that it is preferable to produce a little well than more
badly. Amongst commentators on start-up companies this is known as a
*zoom-in pivot* [@lean p172] and the work it produces should be the
*Minimum Viable Product* or MVP [@lean p106-110]. With a focus on
quality I could not deliver a full stack so I am obliged to implement
only solutions which interoperate with existing deployments. This is
advantageous; to somebody looking to improve their system small
enhancements are more inviting than wholesale change.

To reify the vision above a streaming client is the MVP. Although an
explicitly streaming server would improve the situation further, because
all network transmissions may be viewed though a streaming lens it is
not required to start taking advantage of progressive REST. In the
interest of creating something new, whilst http servers capable of
streaming are quite common even if they are not always programmed as
such, I have been unable to find any example of a streaming-receptive
REST client.

Criteria for success
--------------------

In evaluating this project we may say it has been a success if
non-trivial improvements in speed can be made without a corresponding
increase in the difficulty of programming the client. This improvement
may be in terms of the absolute total time required to complete a
representative task or in a user's perception of the application
responsiveness while performing the task. Because applications in the
target domain are much more I/O-bound than CPU-bound, optimisation in
terms of the execution time of algorithms will be de-emphasised unless
especially egregious. Additionally, I shall be considering how the
semantics of a message are expanded as a system's design emerges and
commenting on the value of loose coupling between data formats and the
programs which act on them in avoiding disruption given unanticipated
format changes.

[^1]: for quite an obviously visible example of progressive SVG loading,
    try loading this SVG using a recent version of Google Chrome:
    <http://upload.wikimedia.org/wikipedia/commons/0/04/Marriage_(Same-Sex_Couples)_Bill,_Second_Reading.svg>
    For the perfectionist SVG artist, not just the final image should be
    considered but also the XML source order, for example in this case
    it would be helpful if the outline of the UK appeared first and the
    exploded sections last.
