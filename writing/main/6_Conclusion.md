Conclusion
==========

Benchmarking vs non-progressive REST
------------------------------------

I feel it is important to experimentally answer the question, *is this
actually any faster?*. To do this I have created a small benchmarking
suite that runs under Node.js. I chose Node because it at its code is a
very basic platform which I feel it gives a more repeatable environment
than modern browsers which at during the tests could be performing any
number of background tasks. These tests may be seen in the `benchmark`
folder of the project. Node also has the advantage in measuring the
memory of a running process is not swamped by the memory taken up by the
browser itself.

One of the proposed advantages of progressive REST is an improved user
experience because of earlier, more progressive interface rendering and
a perceptual improvement in speed. I am not focusing on this area for
benchmarking because it would be much more difficult to measure,
involving human participants. While I can't provide numbers on the
perceptual improvements, I have created sites using Oboe and the
improvement in responsiveness over slower networks is large enough to be
obvious.

The benchmark mimics a relational database-backed REST service.
Relational databases serve data to a cursor one tuple at a time. The
simulated service writes out twenty tuples as JSON objects, one every
two milliseconds. To simulate network slowness, Apple's *Network Line
Conditioner* was used. I chose the named presets "3G, Average Case" and
"Cable modem" to represent poor and good networks respectively [^1].
Each test involves two node processes, one acting as the client and one
as the server, with data transfer between them via normal http.

Memory was measured using Node's built in memory reporting tool at
various points and the maximum figure returned on each run was taken:
[^2]

### Aggregating services

Each object in the returned JSON contains a URL to a further resource.
Each further resource is fetched and parsed. The aggregation is complete
when we have them all.

  Strategy         Network conditions   Total time   Max. Memory
  ---------------- -------------------- ------------ -------------
  Oboe.js          Poor                 ?            ?
  Oboe.js          Good                 ?            ?
  JSON.parse       Poor                 ?            ?
  JSON.parse       Good                 ?            ?
  Clarinet (SAX)   Poor                 ?            ?
  Clarinet (SAX)   Good                 ?            ?

### Simple download

This is a much simpler test which involved downloading just one
resource. To reduce the size of the data only good network conditions
are tested.

  Strategy         Network conditions   Total time   Max. Memory
  ---------------- -------------------- ------------ -------------
  Oboe.js          Good                 ?            ?
  JSON.parse       Good                 ?            ?
  Clarinet (SAX)   Good                 ?            ?

### Commentary on the results

Although Clarinet is known to be slower than JSON.parse, in practice
this didn't show in the results.

Does not save memory over DOM parsing since the same DOM tree is built.
May slightly increase memory usage by utilising memory earlier that
would otherwise be dept dormant until the whole transmission is received
but worst case more often a concern than mean.

Doing things faster vs doing things earlier. "Hurry up and wait"
approach to optimisation. Already know Clarinet is slower than browser's
inbuilt parsing mechanism although not by a significant amount [^3]

Parse time for large files spread out over a long time. Reaction to
parsed content spread out over a long time, for example de-marshalling
to domain objects. For UX may be preferable to have many small delays
rather than one large one.

Comparative Programmer Ergonomics
---------------------------------

  Strategy         Lines of Code Required
  ---------------- ------------------------
  Oboe.js          not many
  JSON.parse       bit more
  Clarinet (SAX)   lots

### vs non-progressive REST

Consider difficulty in upgrades.

### vs Clarinet

In terms of syntax: compare to SAX (clarinet) for getting the same job
done. Draw examples from github project README. Or from reimplementing
Clarinet's examples.

Consider:

-   Difficulty to program
-   Ease of reading the program / clarity of code
-   Ease of use vs SAX

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

Status as a micro-library
-------------------------

Built versions of Oboe as delivered reside in the project's `dist`
folder. The file `oboe-browser.min.js` is the minified version which
should be sent to browsers gzipped. After gzip is applied this file
comes to 4966 bytes; close to but comfortably under the 5120 limit. At
roughly the size as a very small image, the size of Oboe should not
discourage adoption.

potential future work
---------------------

There is nothing about Oboe which precludes working with other
tree-shaped format. If there is demand, An XML/XPATH version seems like
an obvious expansion.

Fullness
========

Doesn't support all of jsonpath. Not a strict subset of the language.

### Potential to improve efficiency

Oboe stores all items that are parsed from the JSON it receives,
resulting in a memory use which is as high as a DOM parser. These are
kept in order to be able to provide a match to any possible JSONPath
expression. However, in most cases memory would be saved if the parsed
content were only stored so far as is needed to provide matches against
the JSONPath expressions which have actually been registered. Likewise,
the current implementation of testing for matches is rather brute force
in nature: it tests every registered JSONPath expression against every
node and path that are found in the JSON. For many expressions we are
able to know there is no possibility of matching a JSON tree, either
because we have already matched or because the the current node's
ancestors already mandate failure. A more sophisticated programme might
disregard provably unsatisfiable handlers for the duration of a subtree.
Either of these changes would involve some rather difficult programming
and because matching is fast enough I think brute force is the best
approach for the time being.

During JSONPath matching much of the computation is repeated. For
example, matching the expression `b.*` against many children of a common
parent will perform the exact same test of checking if the parent's name
is 'b' for each child node. Because the JSONPath matching is stateless
and side-effect free there is a potential to cut out repeated
computation by using a functional cache.

Weak hash-maps will be available in near future. Good for this.

### Mutability

Rest client as a library is passing mutable objects to the caller. too
inefficient to re-create a new map/array every time an item is not as
efficient in immutability as list head-tail type storage

An immutability wrapper might be possible with defineProperty. Can't
casually overwrite via assignment but still possible to do
defineProperty again.

Would benefit from a stateless language where everything is stateless at
all times to avoid having to program defensively.

### JSONPath

Invalid jsonpaths made from otherwise valid clauses (for example two
roots) perhaps could fail early, at compile time. Instead, get a
jsonPath that couldn't match anything. Invalid syntax is picked up.
Could be confusing for user. Better to fail.

### Invalid JSONPath expressions

Implementation in a purely functional language with lazy evaluation:
could it mean that only the necessary parts are computed? Could I have
implemented the same in javascript?

Would be nice to:

-   discard patterns that can't match any further parts of the tree
-   discard branches of the tree that can't match any patterns
-   just over the parsing of branches of the tree that provably can't
    match any of the patterns

### Not particularly useful reading from local files.

[^1]: http://mattgemmell.com/2011/07/25/network-link-conditioner-in-lion/

[^2]: http://nodejs.org/api/process.html\#process\_process\_memoryusage

[^3]: http://writings.nunojob.com/2011/12/clarinet-sax-based-evented-streaming-json-parser-in-javascript-for-the-browser-and-nodejs.html
