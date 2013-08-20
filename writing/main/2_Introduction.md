Introduction
============

**introduction should be 2-5 pages (1,000 to 2,500 wrds)**

Intro should say:

-   What is the problem?
-   How do I plan to solve it?
-   What are the success criteria?
-   How will know if been successful?
-   What is the motivation for solving it?

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
underlying technology itself.

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

Inefficiencies in out typical use of http
-----------------------------------------

![A common use of a REST service is the aggregation of data from
lower-level services. A client fetches a listing of an author's
publications and then the first three articles. The left sequence
represents the most commonly used pattern in which the client does not
react to the response until it is complete. In the right sequence the
client considers the response to return progressively as many small
parts. Because UML sequence diagrams do not provide a concept of a
returned value other than as a one-off event, the notation of lighter
arrows illustrating an ongoing response is introduced. Each publication
is fetched as soon as the fragment of response linking to it is
available and once the data required has been read from the original
response it is aborted rather than continuing with the download of
unnecessary data. \label{enhancingrest}](images/rest_timeline.png)

The figure above \ref{enhancingrest} illustrates how a progressive REST
client, without adjustments being required to the server may be used to
display some data requested by a user sooner. While the complete data
should be available to the user significantly earlier, we see a much
greater improvement in how early the first piece of data is able to be
displayed. This is advantageous: firstly, even if the overall timings
were not improved, progressive display improves the perception of
performance [CITEME]; secondly, a user wanting to scan from top to
bottom may start reading the first article while waiting for the later
ones to arrive. Alternatively, seeing the first article alone may allow
the user to notice earlier that they have requested the wrong author and
allow them to backtrack earlier.

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

As seen the \ref{enhancingrest} example, may be aborted once the data
needed has been identified. Terminating the message early is though of
as a useful and routine technique, not simply as a way of dealing with
error cases.

The cadence of the right sequence has better pacing of requests with 4
being made at roughly equal intervals rather than a single request and
then a rapid burst of 3.

Big-small problem
-----------------

Or, granularity problem

Perception. Eg, infinite scrolling webpages. Visualisations.

Two improvements: just hang up; and, start using earlier.

Network fallibility
-------------------

The inefficiencies listed above are present when all network links
operate perfectly.

When connections fail, apps are left with non of the content. Happens a
lot on mobile networks.

Http 1.1 provides a mechanism for Byte Serving via the Accepts-Ranges
header [http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html\#sec14.5]
which can be used to request any contiguous part of a response rather
than the whole. Common in download managers but not REST clients. This
ability can be used to

[!Extra diagram: resume after aborted connection] (images/placeholder)

Agile methodologies, fast deployments and future versioning
-----------------------------------------------------------

A more subtle problem

SOA has been adapted widely but versioning remains a common challenge in
industry. Anecdote: test environment finds an issue. One system can't be
released. Contagion.

How to cope with software that changes every week.

Because of the contagion problem, need to be able to create
loosely-coupled systems.

Inside systems also, even with automatic refactoring tools, only
automate and therefoer lessen but do not remove the problem that
coupling causes changes in one place of a codebase to cause knock-on
changes in remote other parts of the code. A method of programming which
was truly compatible with extreme programming would involve designing
for constant change without disparate parts having to be modified as
structural refactoring occurs.

I propose that in a changing system, readability of code's changelog is
as important as readability of the code itself. Extraneous changes
dilute the changelog, making it less easily defined by code changes
which are intrinsically linked to the actual change in the logic being
expressed by the program.

It is often stated that understandability is the number once most
important concern in a codebase (CITE) - if the code is suitably dynamic
it is important that changes are axiomic and clarity of the changelog is
equally important.

Criteria for success
--------------------

Doing something earlier **is** doing it faster.

In evaluating this project, we may say it has been a success if
non-trivial improvements in speed can be made without a corresponding
increase in the difficulty of programming the client. This improvement
may be in terms of a measure of the absolute time required to complete a
representative task or in a user's perception of the speed in completing
the task. Whilst the difficulty in creating the client resists
quantification, this will be examined in terms of the length of the
expression required in programming some common tasks.

Because applications in the target domain are much more io-bound than
CPU-bound, optimisation in terms of the running time of a program on the
CPU will be de-emphasised in favour of establishing a more optimal use
of io.
