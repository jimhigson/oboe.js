Conclusion
==========

Benchmarking vs non-progressive REST
------------------------------------

I feel it is important to experimentally answer the question, *is this actually any faster?*.
To do this I have created a benchmarking suite that runs under Node
because I feel this gives a more repeatable environment than the browser. 
One of the major advantages of progressive REST is an improved user experience
because of earlier, more progressive interface rendering and a perceptual improvement
in speed. I am not focusing on this area for benchmarking because it would be
much more difficult to measure, involving human participants. While I can't
provide numbers on the perceptual improvements, I have created sites using
Oboe and the difference is obvious.  

Consider:

-   Resources (mem) consumed
-   Is earlier really faster?

Interesting article from Clarinet: All this says is that Clarinet is
already known to be slower than JSON.parse

Doing things faster vs doing things earlier. "Hurry up and wait"
approach to optimisation. Already know Clarinet is slower than browser's
inbuilt parsing mechanism although not by a significant amount [^1]

### Suitability for databases

Databases offer data one row at a time, not as a big lump.

Comparative Programmer Ergonomics
---------------------------------

### vs non-progressive REST

### vs Clarinet

In terms of syntax: compare to SAX (clarinet) for getting the same job
done. Draw examples from github project README. Or from reimplementing
Clarinet's examples.

Consider:

-   Difficulty to program
-   Ease of reading the program / clarity of code
-   Ease of use vs SAX

Status as a micro-lib
---------------------

![A pie chart showing the sizes of the various parts of the
codebase](images/placeholder.png)

Comment on the size of the libraray

Most of the size comes from Clarinet.js inclusion. Comment on making a
smaller version. c'net is \~30% pre-minification, \~60% post.

Performance of code styles under various engines
------------------------------------------------

Complex JSONPath tested against JSON with approx 2,000 nodes, finding
100 matches. Real http, full stack Oboe.

  Platform                                      Time
  ----------------------------------------- --------
  Firefox 24.0.0 (Mac OS X 10.7)               547ms
  Chrome 30.0.1599 (Mac OS X 10.7.5)           237ms
  Chrome Mobile iOS 30.0.1599 (iOS 7.0.2)      431ms
  Safari 6.0.5 (Mac OS X 10.7.5)               231ms
  IE 8.0.0 (Windows XP)                       3048ms

For example with only mono-morphic callsites and without a functional
style. Once either of those programming techniques is taken up
performance drops rapidly
[http://rfrn.org/\~shu/2013/03/20/two-reasons-functional-style-is-slow-in-spidermonkey.html]
9571 ms vs 504 ms. When used in a functional style, not 'near-native' in
the sense that not close to the performance gained by compiling a well
designed functional language to natively executable code. Depends on
style coded in, comparison to native somewhat takes C as the description
of the operation of an idealised CPU rather than an abstract machine
capable of executing on an actual CPU.

potential future work
---------------------

implementation keeps 'unreachable' listeners difficult
decidability/proof type problem to get completely right but could cover
most of the easy cases

Parse time for large files spread out over a long time. Reaction to
parsed content spread out over a long time, for example de-marshalling
to domain objects. For UX may be preferable to have many small delays
rather than one large one.

Doesn't support all of jsonpath. Not a strict subset of the language.

### Mutability

Rest client as a library is passing mutable objects to the caller. too
inefficient to re-create a new map/array every time an item is not as
efficient in immutability as list head-tail type storage

An immutability wrapper might be possible with defineProperty. Can't
casually overwrite via assignment but still possible to do
defineProperty again.

Would benefit from a stateless language where everything is stateless at
all times to avoid having to program defensively.

### XML

Same pattern could be extended to XML. Or any tree-based format. Text is
easier but no reason why not binary applications.

### JSONPath

Invalid jsonpaths made from otherwise valid clauses (for example two
roots) perhaps could fail early, at compile time. Instead, get a
jsonPath that couldn't match anything. Invalid syntax is picked up.
Could be confusing for user. Better to fail.

### Invalid JSONPath expressions

Does not save memory over DOM parsing since the same DOM tree is built.
May slightly increase memory usage by utilising memory earlier that
would otherwise be dept dormant until the whole transmission is received
but worst case more often a concern than mean.

Implementation in a purely functional language with lazy evaluation:
could it mean that only the necessary parts are computed? Could I have
implemented the same in javascript?

Would be nice to:

-   discard patterns that can't match any further parts of the tree
-   discard branches of the tree that can't match any patterns
-   just over the parsing of branches of the tree that provably can't
    match any of the patterns

### Not particularly useful reading from local files.

[^1]: http://writings.nunojob.com/2011/12/clarinet-sax-based-evented-streaming-json-parser-in-javascript-for-the-browser-and-nodejs.html
