Introduction
============

**introduction should be 2-5 pages (1,000 to 2,500 wrds)**

Intro should say:

-   What is the problem?
-   How do I plan to solve it?
-   What are the success criteria?
-   How will know if been successful?
-   What is the motivation for solving it?

As a software engineer working on REST systems I have noticed several
areas where, if http were to be viewed through a new lens, it should be
possible to evolve the performance of the common paradigms. Because
incremental changes are easier to action, I have been careful to ensure
that this perspective may be with only a few carefully chosen changes
and without any loss of interoperability to existing systems, avoiding
the temptation of wholesale shift to a new technology stack. Although I
will express my dissertation partially through programming, the shift
required for this evolutionary change is felt more strongly as a shift
in how we *think* about http than it is a change in the underlying
technology itself.

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

![Use of a REST service. A client fetches a listing of an author's
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
client, without adjustments being required to the server may bring
improvements in the

Although the label "client software" hints at software running directly
on a user's own device,\
software in an n-tier architecture can rarely be categorised into client
and server in a way which is appropriate to all frames of reference.
Rather, it is common for nodes to be thought of as a client to to the
layer below and as a server to the layer above. The advantage
demonstrated holds if the layer labeled "client software" were actually
an aggregator providing a higher-level service than the one that it
aggregates. Rather than progressively displaying the publications to the
user, an aggregator would be able to realise a similar benefit by
progressively responding to the http request which it received.

As seen the \ref{enhancingrest} example, may be aborted once the data
needed has been identified. Terminating the message early is though of
as a useful and routine technique, not simply as a way of dealing with
error cases.

The cadence of the right sequence has better pacing of requests with 4
being made at roughly equal intervals rather than a single request and
then a rapid burst of 3.

Despite the enthusiasm for which SOA and REST in particular has been
adapted, I believe this model isn't being used to its fullest potential.
Consider a fairly simple task of retrieving all the images used on a web
page.

These are not obscure esoteric requirements, rather they represent the
mainstay execution of almost any SOA application.

Grab all the images mentioned in a web page Images may be on another
subdomain

-   DNS lookup only after got whole page Dynamically generated pages can
    often load slowly, even when there is plenty of bandwidth But images
    could load quickly.

Diagram of timeline to get images from a webpage.

Big-small problem
-----------------

Or, granularity problem

Perception. Eg, infinite scrolling webpages. Visualisations.

Two improvements: just hang up; and, start using earlier.

Perception of speed
-------------------

Doing something earlier **is** doing it faster.

User perception of speed can be increased by completing a task in small
parts rather than waiting for a whole to appear fully formed.

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
