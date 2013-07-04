

Conclusion
==========

**1 to 5 pages**

Invalid jsonpaths made from otherwise valid clauses (for example two roots) perhaps could fail early, 
at compile time. Instead, get a jsonPath that couldn't match anything. Invalid syntax is picked up.

Same pattern could be extended to XML. Or any tree-based format. Text is easier but no reason why not
binary applications.

Not particularly useful reading from local files.

Does not save memory over DOM parsing since the same DOM tree is built. May slightly increase memory
usage by utilising memory earlier that would otherwise be dept dormant until the whole transmission
is received but worst case more often a concern than mean.

Implementation in a purely functional language with lazy evaluation: could it mean that only the
necessary parts are computed? Could I have implemented the same in javascript?

Would be nice to:
 * discard patterns that can't match any further parts of the tree
 * discard branches of the tree that can't match any patterns
 * just over the parsing of branches of the tree that provably can't match any of the patterns