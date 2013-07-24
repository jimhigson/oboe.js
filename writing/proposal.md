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

Prior to this AJAX age, progressive html rendering allowed a transmitted
page to be viewed incrementally as it arrives over the network. By not
facilitating the use of a REST response before the entire message has
been received, I observe that today's AJAX clients have taken a
backwards step in terms of the fluid perception of performance. Given
that the underlying http transport is the same, I propose that it should
be equally possible to program a progressive presentation of content
delivered as data as it is for content delivered as presentational
markup.

Prior art and new contributions
===============================

My thesis is centred on the creation of a novel style of REST client
library which allows use of interesting parts of the resource before the
entire resource has been downloaded and even if the download is never
entirely completed.

Progressive parsers exist already as a SAX-style but are much less than
the DOM-style alternative. SAX parsers are little more than tokenizers,
providing a very low level interface which notifies of tokens as they
are received. This presents a difficult API, requiring the programmer to
record state regarding nodes that they have seen and implement their own
pattern-matching. Whereas for DOM-style parsing there exists a wealth of
tools to transform structured text into domain model objects based on
declarative configuration, for SAX-style parsing this is usually done in
the programming language itself. This logic tends to be difficult to
read and programmed once per usage rather than assembled from easily
reusable parts. For this reason, SAX parsing is much less common than
DOM parding when connecting to REST services. I observe that this trend
towards DOM style parsing which requires the whole resource to be
downloaded before inspection can commence hampers the performance of the
REST paradigm and propose the creation of a third way combining the
developer ergonomics of DOM with the responsiveness of SAX.

In which a callback call is received not just when the whole resource is
downloaded but for every interesting part which is seen while the
transfer is ongoing. The definition of 'interesting' will be generic and
accommodating enough so as to apply to any data domain and allow any
granularity of interest, from large object to individual datums. With
just a few lines of programming

Http libraries feeding into the parser. In browser, generally single
callback when whole message received.

Client-side web scripting via Javascript is a field which at inception
contributed no more than small, frequently gimmicky, dynamic features
added to otherwise static webpages. Today the scope and power of client
side scripting has increased to the extent that the entire interface for
large, complex applications is often programmed in this way. These
applications are not limited to running under traditional web browsers
but also include mobile apps and desktop software.

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

I am registered on the Software Engineering Program until December. I
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
