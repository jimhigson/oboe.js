Introduction
============

Despite the enthusiasm for which SOA and REST in particular has been
adapted, as a software engineer working on REST systems I have noticed a
reoccurring trend where, if http were to be viewed through a new lens,
by adjusting the REST paradigm to include a more progressive view of the
data, it would be possible to avoid many of the common performance
pitfalls. With my focus at any particular time being limited to the
scope of creating individual services rather than advancing the
underlying technology, the glimpses of a more effective way have
remained as such for some time. Commercial pressures did not provide the
best opportunity to follow up on these ideas. This dissertation is not
focused on using REST to provide any particular service. Rather, it aims
to apply small incremental changes to the REST paradigm as a whole which
should bring tangible benefits to almost any such system.

I have been careful to focus on as small a set of incremental
improvements as is possible to bring the improvements that I would like
to see. Incremental changes are easier to action, I have been careful to
ensure that this perspective may be with only a few carefully chosen
changes and without any loss of interoperability to existing systems,
avoiding the temptation of wholesale shift to a new technology stack.
Although I will express my dissertation partially through programming,
the shift required for this evolutionary change is felt more strongly as
a shift in how we *think* about http than it is a change in the
underlying technology itself. Once we realise that any multi-packet
message sent via a network is arrives as a stream so far as some part
inevitably arrives before another, it follows that a streaming client is
the minimum set of software needed to realise this vision. A streaming
client can connect to a non-streaming server but the opposite is not as
useful. Furthermore, servers which send http messages incrementally,
while not the most common model, are not rare, whereas clients which
interpret a message incrementally are limited to very specific use
cases.

Whilst the primary area of concern for this dissertation is to improve
the throughput and reactivity of systems created using REST, the
approach chosen may also be considered against a secondary problem often
experienced in REST systems: that of tight coupling between systems and
the difficulty this brings in adding new semantics to existing message
formats. I find that in many cases these problems exist solely as
inflexible REST client software which is unprepared to accept slight or
moderate variations on previously agreed formats. Whilst loose coupling
isn't the primary concern of this dissertation, I have found it to be a
significant problem area and any benefit my new approach can bring to
this problem should be counted towards the success of the project.

Inefficiencies of our typical use of http
-----------------------------------------

![**Sequence diagram showing aggregation of lower-level resources exposed
via REST.** A client fetches a listing of an author's publications and
then the first three articles. The sequence represents the most
commonly used technique in which the client does not react to the response
until it is complete. In this example the second wave of requests cannot
be made until after the original response is complete, at which time they
are issued in quick succession. 
\label{rest_timeline_1}](images/rest_timeline_1.png)

![**Revised sequence of aggregation performed by a client capable of
progressively interpreting the fetched resource.** The 
client considers the response to return progressively as
many small parts. Because UML sequence diagrams do not provide a concept
of a returned value other than as a one-off event, the notation of
lighter arrows illustrating fragments an ongoing response is introduced. Each
request for an individual publication is made at the earliest possible time.
As soon as the required data has been read from the original
resource it is aborted rather than continue with the download of
unnecessary data. This results in a moderate reduction in wait time to see all 3
articles but a dramatic reduction in waiting before reading the first 
content \label{rest_timeline_2}](images/rest_timeline_2.png)

The figure above \ref{rest_timeline_1} illustrates how a progressive
REST client, without adjustments being required to the server may be
used to display some data requested by a user sooner. While the complete
data should be available to the user significantly earlier, we see a
much greater improvement in how early the first piece of data is able to
be displayed. This is advantageous: firstly, even if the total time to
show the data were not improved, progressive display improves the
perception of performance [CITEME]; secondly, a user wanting to scan
from top to bottom may start reading the first article while waiting for
the later ones to arrive. Alternatively, seeing the first article alone
may allow the user to notice earlier that they have requested the wrong
author and allow them to backtrack earlier.

Although the label "client software" hints at software running directly
on a user's own device, nodes in an n-tier architecture can rarely be
placed into client and server categories in a way which is appropriate
from all frames of reference. Rather, it is common for nodes to be
thought of as a client from the layer below and as a server from the
layer above. The advantage demonstrated holds if the aggregation
existing in this layer were actually running on a server to provide a
higher-level REST service than the one that it aggregates. An
progressive aggregator would perform the same function and see the same
benefits but simply be pushed one layer back in the stack. The
progressive view of http would allow progressive response to its http
request, allowing the data to be viewed similarly progressively.

The coining of the term REST required no fundamentally new methods,
rather it represented a shift in how we think about http away from the
transfer of hypertext documents to that of arbitrary data [cite paper].
Likewise, no genuinely new techniques in computer science are required
to realise this thesis. As a minimum, the implementation requires an
http library which exposes the response whilst it is in progress and a
parser which is capable of making sense of a response before it is able
to see all of it. In addition to relying on already existing techniques
in implementation, I cannot claim my thesis to be an entirely novel
concept. Few ideas are genuinely new and it is often useful to mine
neighbouring fields for solved problems. To see a specific instance of
this concept already widely being used we need only to view a web page
containing inline images in any of the standard web browsers;
essentially, an aggregation of text and image resources into a single
presentation. The html is parsed incrementally as it is downloaded and
the images are requested as soon as individual <img> tags are
encountered. However, this is achieved by means of a handwritten parser
which is specific to a single markup format and an implementation which
applies only to a single problem domain, that of displaying web pages.
The new contribution of this dissertation hinges on providing a generic,
reusable solution which may be applied to any problem domain.

The cadence of the right sequence has better pacing of requests with 4
being made at roughly equal intervals rather than a single request and
then a rapid burst of 3.

Stepping outside the big-small tradeoff
---------------------------------------

Where the domain model contains a series of data, of which ranges are
made available via REST, I have often seen a trade-off with regards to
how much data is requested at once. Deciding this question is usually a
compromise between competing concerns in which it is not possible to
find a solution which simultaneously addresses all concerns
satisfactorily. A good example might be a page on Twitter showing a list
of tweets. The interface designers here chose to adopt a fairly popular
pattern, the Infinitely Scrolling Page [CITE]. Starting from an initial
page showing a finite number of tweets, upon scrolling to the bottom the
next batch is automatically requested. The new batch is delivered in a
json format and, once loaded, presented as html and added to the bottom
of the page, allowing the user to continue scrolling.

The wait at the bottom of the page while new content is loaded
introduces a pause in scrolling so, whilst preferable to prior patterns
incorporating explicit paging, this workflow can feel quite clunky.\
To frame this problem we might imagine the extreme choices. Firstly,
requesting only one tweet per http request. Because we are requesting
the smallest possible content, each request would individually complete
very quickly and as such the waits would be short. However the page
would stutter, pausing quickly but frequently. At the opposite extreme,
we might request some huge number of tweets,\
taking a long time to load but then scrolling smoothly for a long time.

I propose that my thesis may be applied used to break out of this
compromise and take the best of both approaches, combining quickest
possible latency which would only otherwise be achievable via
single-tweet requests but also pausing no more frequently than with very
large requests. Once we have established a progressive mindset regarding
http this may be achieved quite simply by issuing large requests but
instead of waiting for the request to complete before rendering,
updating the view incrementally as the individual tweets are
progressively parsed out of the json response.

It should be noted that this is a different problem from the granularity
problem. Expand.

Network fallibility
-------------------

We have been extremely successful in building the TCP abstraction layer
over many different networks with vastly different purposes, However
this means that the reliability of networks that a REST client must work
with varies greatly. At one extreme we have server-room sized networks
delivering data over a span of few meters with a success rate for any
particular http request-response that is so high as for failure to be
negligible. Occupying the opposite extreme we have mobile networks in
marginal signal where it is common for downloads to be abruptly
terminated due to loss of connectivity.

Consider an everyday situation where a user is using a phone to check
their email over a mobile network whilst travelling on a train. The user
prefers the simplicity of webmail so the communications are sent via
REST rather than a mail specific protocol such as POP3. In this scenario
the signal can be expected to be lost and reestablished many times.
Whilst not strictly forbidding it, none of the web developer's standard
toolkit of AJAX libraries encourage a use of the partially downloaded
response if the http request fails. For example, the popular AJAX
library[CITE], jQuery, very helpfully parses complete JSON or XML
responses before handing back to the application. But because incomplete
messages are not valid markup, on connection failure jQuery does not
attempt to parse the response. Because partial responses are only
available to the programmer as raw text, to handle them would involve a
special case and a different methodology. Because of this difficulty I
can find no example other than such messages being dropped without
inspection. In practice this means that for the user checking her email,
even if 90% of her inbox had been downloaded she will be shown nothing.
When the network is available again the application will have to
download from scratch, including the 90% which it already fetched. In
this regard REST falls short of the mail-specific protocols which would
display messages one at a time as they are fetched. I see much potential
for improvement here.

Whilst of course a REST client library cannot understand the semantics
of specific messages fully enough to decide if a partially downloaded
message is useful. I propose that it would be an improvement to provide
callbacks in such a way that the calling application may make use of
partially successful messages via much the same programming as for
complete messages. This fits in very well with my vision of a http
response as a progressive stream of many small parts. As each part
arrives it should be possible to parse and pass onto the application
without knowing if the whole will be delivered successfully.

This style of REST client encourages an attitude of optimistic locking
in the application which uses it. Upon each partial delievery of the
message there may be made an implicit assumption that the whole message
will be successful and as such each part can be acted on straight away.
On discovering a delivery failure the application should be notified in
case it should wish to rollback some of those actions. The degree of
rollback could vary greatly between application domains, in the example
above of a webmail client it may be that no rollback at all is
performed.

Agile methodologies, fast deployments, and compatibility now with future versions
---------------------------------------------------------------------------------

In many respects, a SOA architecture is a good fit for the fast release
cycle encouraged by Agile methodologies. Because in SOA we may consider
that all data is local rather than global and that the components of the
system are loosely coupled, frequent releases of any particular
sub-system shouldn't pose a problem to the correct operation of the
whole. Under truly Agile practice, the formats of resources exposed via
REST will emerge iteratively, mirroring the iterative design of the
software which reifies the message.

Unfortunately in practice the tools used for REST fail to encourage
programming in a loosely coupled way. Working in enterprise I have often
seen the release of dozens of components cancelled because a single unit
failed to meet acceptance criteria, even where the failing unit
contained only minor changes. Because of a tight coupling which depends
on exact versions, a dense dependency graph between inter-dependent
units creates the perfect environment for contagion to occur whereby the
impact from a single failing unit spreads until it infects all of the
system.

As I see it, an effective way to solve this problem would be to
integrate into a REST client library the ability to use a response
whilst being only loosely coupled to the *shape* of the overall message.
This should be without any additional effort by the programmer as
compared using message but depending on a rigidly specified overall
structure. Rather than having this means of interpreting a message as an
optional extra, because I believe it to be beneficial that all messages
are handled this way, it should be the default means of operation for
this library.

Criteria for success
--------------------

In evaluating this project, we may say it has been a success if
non-trivial improvements in speed can be made without a corresponding
increase in the difficulty of programming the client. This improvement
may be in terms of a measure of the absolute time required to complete a
representative task or in a user's perception of the speed in completing
the task. Because applications in the target domain are much more
io-bound than CPU-bound, optimisation in terms of the running time of a
program on the CPU will be de-emphasised unless especially egregious.
Because the improvements I am seeking are due to a more efficient use of
io rather than a more optimal algorithmic expression, no distinction is
made between doing something earlier and doing it faster. Indeed, for
the sake of this dissertation, earlier *is* faster.

Because REST is often communicated over unreliable connections, my
client should also allow the use of partially delivered messages without
requiring programming which treats this as a special case.

Finally, I shall be looking at common ways in which the semantics of a
message may be added to as a system is developed and examining the
degree to which it is easier to program in a way which handles these
unanticipated changes under my client as compared to the current common
practice.
