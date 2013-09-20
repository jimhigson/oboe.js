Conclusion
==========

<!---
**1 to 5 pages**
--->

Doing things faster vs doing things earlier. "Hurry up and wait" approach to optimisation.

weaknesses
----------

implementation keeps 'unreachable' listeners difficult
decidability/proof type problem to get completely right but could cover
most of the easy cases

Parse time for large files spread out over a long time. Reaction to
parsed content spread out over a long time, for example de-marshalling
to domain objects. For UX may be preferable to have many small delays
rather than one large one.

Doesn't support all of jsonpath. Not a strict subset of the language.

Rest client as a library is passing mutable objects to the caller. too
inefficient to re-create a new map/array every time an item is not as
efficient in immutability as list head-tail type storage

An imutability wrapper might be possible with defineProperty. Can't
casually overwrite via assignment but still possible to do
defineProperty again.

Would benefit from a stateless language where everything is stateless at
all times to avoid having to program defensively.

Aborting http request may not stop processing on the server. Why this is
perhaps desirable - transactions, leaving resources in a half-complete
state.

Suitability for databases (really just an inline asside)
--------------------------------------------------------

Databases offer data one row at a time, not as a big lump.

Development methodology
-----------------------

Did it help?

Switched several times. Could have started with winning side? Tension
between choosing latest and greatest (promising much) or old established
solution alraedy experienced with but with known problems. Judging if
problems will become too much of a hinderence and underestimating the
flaws. JSTD was yesterday's latest and greatest but Karma genuinely is
great. In end, right solution was found despite not being found in most
direct way.

Packaging was a lot of work but has delivered the most concise possible
library.

Size
----

![A pie chart showing the sizes of the various parts of the
codebase](images/placeholder.png)

Comment on the size of the libraray

Handling invalid input
----------------------

Invalid jsonpaths made from otherwise valid clauses (for example two
roots) perhaps could fail early, at compile time. Instead, get a
jsonPath that couldn't match anything. Invalid syntax is picked up.

Same pattern could be extended to XML. Or any tree-based format. Text is
easier but no reason why not binary applications.

Not particularly useful reading from local files.

Does not save memory over DOM parsing since the same DOM tree is built.
May slightly increase memory usage by utilising memory earlier that
would otherwise be dept dormant until the whole transmission is received
but worst case more often a concern than mean.

Implementation in a purely functional language with lazy evaluation:
could it mean that only the necessary parts are computed? Could I have
implemented the same in javascript?

Would be nice to: \* discard patterns that can't match any further parts
of the tree \* discard branches of the tree that can't match any
patterns \* just over the parsing of branches of the tree that provably
can't match any of the patterns

Comparative usages
------------------

Interesting article from Clarinet:
http://writings.nunojob.com/2011/12/clarinet-sax-based-evented-streaming-json-parser-in-javascript-for-the-browser-and-nodejs.html

In terms of syntax: compare to SAX (clarinet) for getting the same job
done. Draw examples from github project README. Or from reimplementing
Clarinet's examples.

Consider:

-   Difficulty to program
-   Ease of reading the program / clarity of code
-   Resources consumed
-   Performance (time) taken
-   about the same. Can react equally quickly to io in progress, both
    largely io bound.
-   Is earlier really faster?

Community reaction
------------------

Built into Dojo Followers on Github Being posted in forums (hopefully
also listed on blogs) No homepage as of yet other than the Github page
