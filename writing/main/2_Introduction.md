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

perceived as such since useful things can often be done before whole
content is loaded.


Multiple request rest aggregation
---------------------------------

![Potential differences in overall time taken to download a list of
publications and then download any ones newer than a certain date.
Assuming the publications are ordered newest first, the first connection
may be terminated as soon as an older publication is
found.](images/rest_timeline.png)

Despite the enthusiasm for which SOA and REST in particular has been
adapted, I believe this model isn't being used to its fullest potential.
Consider a fairly simple task of retrieving all the images used on a web
page.

These are not obscure estoteric requirements, rather they prepresent the
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

Eg, infinite scrolling webpages.

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

SOA has been adapted widely but versioning remains a common challenge in
industry.

Anecdote: test environment finds an issue. One system can't be released.
Contagion.

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
