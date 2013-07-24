% Dissertation Proposal
% Jim Higson
% 2013

Application of my dissertation
==============================

For a system engineered in a SOA style many of the resources a program
accesses are resident on a remote machine. Although programmers often
focus attention on the execution time of their algorithms, because
transmission over a network can be as much as 10^6^ times slower than
local access, the interval in which a program waits for input usually
contributes more to the degradation of performance than any local
concern. As such the the sage use of io should rank above most other
optimisation considerations when considering the efficiency of many
modern programs.

For all but single-packet messages, data sent over a network is readable
whilst transmission is still in progress. Hence, it is possible to view
almost any transmission through the lens of a stream even if the sender
of the data did not intend for it to be thought of it in this way and by
doing so it is possible to start using the data from the resource
earlier. In not utilising the progressive nature of resource
availability I propose that today's common REST client libraries are
failing to make best use of network bandwidth.

REST today is not solely the domain of server-to-server communication.
It is also commonly employed under various AJAX patterns to make
server-side resources available to client-side software executing
locally inside a user's web browser. Data transmission often takes place
over the mobile internet but AJAX clients commonly used in web browsers
do not deal well with the fallible nature their networks. If a
connection is lost whilst a message is in transit then the data
downloaded to that point is discarded. Whilst it would of course be
preferable to receive the entire resource requested, for many common use
cases the incomplete data is nonetheless of considerable value. By
discarding remote data at a time when the network is unreliable we are
wasting a valuable resource at the time when it is the most scarce. As a
practical example, for an application downloading an email inbox, if the
connection is lost during transmission the program should be able to
display *some* of the emails in preference to *none*.

Over the last decade or so a significant shift in web application
architecture has been to push the presentation layer onto the client
side. Rather than deliver pages to a browser, data is sent instead so
that it is the responsibility of an application running inside the
browser to populate the page. Prior to this AJAX age progressive html
rendering allowed a transmitted page to be viewed incrementally as it
arrived over the network providing a fluid perception of performance. By
not facilitating the use of a REST response before the entire message
has been received, I observe that more recent web architecture has in
this regard taken a regressive step. Given that the underlying http
transport is the same, I propose that it should be equally possible to
progressively consider content delivered as data as it is for content
delivered as markup.

Prior art and new contributions
===============================

My thesis is centred on the creation of a novel style of REST client
library which allows programmer specified items of interest from a
resource to be used while the resource streams in and even if the
download is only partially successful.

Sax provides progressive parsing to the XML world. SAX parsers however
are little more than tokenisers, providing a low level interface which
notifies the programmer of tokens as they are received. This presents
poor developer ergonomics, often requiring that the programmer implement
the recording of state with regard to the nodes that they have seen. For
DOM-style parsing the programmer rarely directly concerns themselves
with XML, taking advantage of the wealth of generic tools which automate
the translation of markup into domain model objects as per a declarative
configuration. Conversely, for SAX the equivalent logic is usually
implemented imperatively; it to be difficult to read and programmed once
per usage rather than programmed as the combination of reusable parts.
For this reason, SAX is much less common and only generally used for
fringe cases in which messages are extremely large or memory extremely
limited.

I observe that this popularity of parsing models which require the whole
message to be downloaded before any inspection can start hampers the
performance of REST systems and propose the creation of a new, third way
which combines the pleasant developer ergonomics of DOM with the
progressive nature of SAX.

Delivery methodology
====================

My thesis will be developed 'in the open' by committing all code and
writing to a public Github repository. This should allow members of the
developer community to contribute comments and suggestions as the work
progresses. I plan to use Kanban to deliver my dissertation, including
the written parts. Because Kanban focusses on always having a
potentially releasable product, it mitigates problems which could
otherwise lead to non-delivery and allows the direction to be changed as
necessary. For each unit of work (under Kanban, a card), an entire
vertical slice of planning, design, implementation and reflection must
be complete before going onto the next card. Alongside each software
feature, every written chapter will be expanded and refactored in much
the same way as the code. Just as for well designed software, the order
of implementation should not be apparent to a user, my plan is that the
written work should not feel disjointed for having been written
non-sequentially. I plan to manage the Kanban process using paper only,
with cards on a physical board.

Will code using TDD and design code to be easily testable via TDD. This
includes stateless and separation of programming into many collaborating
parts. Constant refactoring, emergent design.

Timescales
==========

I am registered on the Software Engineering Program until December 2013. I
plan to complete and deliver the dissertation towards the end of Summer
2013.

Summary of deliverables
=======================

In the interest in quality over bloat, I propose to focus tightly on
creating a small, high-quality piece of code with a narrow feature set
but no obvious omissions. Hence, only client, not server, tools already
exist to send asynchronously. Easier to improve REST with a client than
a server because async clients still bring benefits with existing
servers but

I propose to deliver a progressive rest client as a javascript
micro-library which runs on either the server or client side and sits on
top of existing http libraries. My ambitions for wider usage motivate a
focus programmer ergonomics, packaging so as to allow drop-in
replacement of today's commonly used tools but also liberal BSD-style
licencing so as to encourage inclusion in free and non-free software
projects. Because web programming is size-conscious I will deliver a
micro library meaning that the size on the wire when sent to a web
browser will not exceed 5kib.

Finally, I will evaluate the effectiveness of my solution in terms of
the compactness of code, ease of programming, fault tolerance and
performance in comparison with existing tools. Performance will be
judged both in terms of user perception of speed and in terms of actual
time required to complete a realistic task such as the aggregation of
data from several sources.
