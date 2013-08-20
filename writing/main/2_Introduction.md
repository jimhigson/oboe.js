Introduction
============

**introduction should be 2-5 pages (1,000 to 2,500 wrds)**

Intro should say:

-   What is the problem?
-   How do I plan to solve it?
-   What are the success criteria?
-   How will know if been successful?
-   What is the motivation for solving it?

Increasing the perception of speed:

As a software engineer working on REST systems I have noticed several
areas where, if http were to be viewed through a new lens, it should be
possible to evolve the performance of the common paradigms. Because
incremental changes are easier to action, I have been careful to ensure
that this perspective may be with only a few carefully chosen changes
and without any loss of interoperability to existing systems, avoiding
the temptation of wholesale shift to a new technology stack.

http usage pattern could be improved and wish to offer an alternative
usage paradigm built on the same technologies. While this solution is
presented as software, the change is as much a shift in how we think
about http as it is a change in the underlying technology itself. The
problems I wish to address can be split into two broad areas:
performance in terms of speed (and the perception thereof) and tight
coupling of semantics between client and server.

Why not writing for the server side? Why just the client?

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

Inefficiencies in typical rest usage
------------------------------------

![Use of a REST service. In this example the client fetches a list of an
author's publications and then retrieves the first three articles. The
left sequence represents the most commonly used pattern in which the
client does no inspection of the response until it is complete. The
shaded arrows in the right sequence illustrate the concept of receiving
a response as a sequence of small fragments whereas the darker arrows on
the left represent the concept of the response as a one-off event
\label{enhancingrest}](images/rest_timeline.png)

Figure shows way of thinking about service, not differences in service
itself. The process is much the same regardless of the aims of the
client: it could be a user interface wanting to display the publications
or an aggregator wishing to provide a higher-level REST service than the
one it aggregates.

As seen the \ref{enhancingrest} example, may be aborted once the data
needed has been identified.

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
