Introduction
============

**introduction should be 2-5 pages (1,000 to 2,500 wrds)**

Intro should:

-   What is the problem?
-   How do I plan to solve it?
-   What are the success criteria?
-   How will know if been successful?
-   What is the motivation for solving it?

Increasing the perception of speed:

-   Source that doing things early makes page feel faster.
-   Also actually faster as well as being

For the dissertation I have identified several areas where the typical
http usage pattern could be improved and wish to offer an alternative
usage paradigm built on the same technologies. While this solution is
presented as software, the change is as much a shift in how we think
about http as it is a change in the underlying technology itself.

The success criteria will be

perceived as such since useful things can often be done before whole
content is loaded.

Inefficiencies in typical rest usage
------------------------------------

![Example use of a REST service; a client learns about an author's
publications and then retrieves information on the first three. The
process is much the same regardless of the aims of the client: it could
be a user interface wanting to display the publications or an aggregator
wishing to provide a higher-level REST service than the one it
aggregates. The left sequence represents the most commonly used pattern
in which the client does no inspection of the response until it is
complete. The shaded arrows in the right sequence illustrate the concept
of receiving a response as a sequence of small fragments whereas the
darker arrows on the left represent the concept of the response as a
one-off event \label{enhancingrest}](images/rest_timeline.png)

Figure shows way of thinking about service, not differences in service
itself

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

In fact, this is exactly how web browsers are implemented. However, this
progressive use of http is hardwired into the browser engines rather
than exposing an API suitable for general use and as such is treated as
something of a special case specific to web browsers and has not so far
seen a more general application. I wish to argue that a general
application of this technique is viable and offers a worthwhile
improvement over current common methods.

The above problem has many analogues and because REST uses standard web
semantics applies to much more than just automated web surfing. Indeed,
as the machine readability of the data increases, access early can be
all the more beneficial since decisions to terminate the connection may
be made. Example: academic's list of publications, then downloading all
the new ones.

Big-small problem
-----------------

Or, granularity problem

Perception. Eg, infinite scrolling webpages.

Perception of speed
-------------------

Earlier **is** faster.

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

A subtler problem

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
