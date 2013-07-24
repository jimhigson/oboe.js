Conclusion
==========

**1 to 5 pages**

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

Consider: \* Difficulty to program \* Ease of reading the program /
clarity of code \* Resources consumed \* Performance (time) taken --
about the same. Can react equally quickly to io in progress, both
largely io bound.

Community reaction
------------------

Built into Dojo Followers on Github Being posted in forums (hopefully
also listed on blogs) No homepage as of yet other than the Github page
