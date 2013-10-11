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

Is the library fast enough?

The file `test/specs/oboe.performance.spec.js` contains a simple
benchmark. This test registeres a very complex JSONPath expression which
intentionally uses all of the language and fetches a JSON file
containing 100 objects, each with 8 String properties against .
Correspondingly the expression is evaluated just over 800 times and 100
matches are found. Although real http is used, it is kept within the
localhost. The results below are averaged from ten runs. The tests were
performed by a mid-range Macbook Air except for Chrome Mobile which was
tested on an iPhone 5. Internet Explorer tests were performed inside a
virtual machine.

  Platform                                  Total Time   Throughput (nodes per ms)
  ----------------------------------------- -----------  ---------------------------
  Node.js v0.10.1                           172ms        4.67
  Chrome 30.0.1599 (Mac OS X 10.7.5)        202ms        3.98
  Safari 6.0.5 (Mac OS X 10.7.5)            231ms        3.48
  IE 10.0.0 (Windows 8)                     349ms        2.30
  Chrome Mobile iOS 30.0.1599 (iOS 7.0.2)   431ms        1.86
  Firefox 24.0.0 (Mac OS X 10.7)            547ms        1.47
  IE 8.0.0 (Windows XP)                     3,048ms      0.26

We can see that Firefox is much slower than other modern
browsers. This is probably explicable by the SpiderMonkey just-in-time
compiler used by Firefix being poor at optimising functional Javascript 
[@functionalSpiderMonkey]. Because the JSON nodes are not of a common type
the callsites are also not mono-morphic which Firefox also optimises badly 
[@functionalSpiderMonkey]. When the test was repeated using a simpler JSONPath
expression Firefox performed only slightly worse than the other browsers
indicating that the functional pattern matching is the bottleneck.

Of these results I find only the very low performance on old versions of Internet
Explorer concerning, almost certainly slowing down the user experience more than 
it speeds it up. It might be reasonable to conclude that for complex use cases 
Oboe is currently not unsuited to legacy platforms.

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

Oboe stores all items that are parsed from the JSON it receives,
resulting in a memory use which is as high as a DOM parser. These are
kept in order to be able to provide a match to any possible JSONPath
expression. However, in most cases memory would be saved if the parsed
content were only stored so far as is needed to provide matches against
the JSONPath expressions which have actually been registered. For
typical use cases I expect this would allow the non-storage of large
branches. Likewise, the current implementation takes a rather brute
force approach when examining node for pattern matches: check every
registered JSONPath expression against every node and path that are
found in the JSON. For many expressions we are able to know there is no
possibility of matching a JSON tree, either because we have already
matched or because the the current node's ancestors already mandate
failure. A more sophisticated programme might disregard provably
unsatisfiable handlers for the duration of a subtree. Either of these
changes would involve some rather difficult programming and because
matching is fast enough I think brute force is the best approach for the
time being.

During JSONPath matching much of the computation is repeated. For
example, matching the expression `b.*` against many children of a common
parent will repeat the same test, checking if the parent's name is 'b',
for each child node. Because the JSONPath matching is stateless,
recursive and side-effect free there is a potential to cut out repeated
computation by using a functional cache. This would reduce the overall
amount of computation needed for JSONPath expressions with common
substrings to their left side or nodes with a common ancestry. Current
Javascript implementations make it difficult to manage a functional
cache, or caches in general, from inside the language itself because
there is no way to occupy only the unused memory. Weak references are
currently only experimentally supported[^4] but should they become
common they would be ideal to allow the runtime to manage memory used as
a non-essential cache.

The nodes which Oboe hands to callbacks are mutable meaning that
potentially the correct workings of the library could be broken if the
containing application carelessly alters them. Newer implementations of
Javascript allows a whole object to be made immutable, or just certain
properties via an immutability decorator and the `defineProperty`
method. This would probably be an improvement.

[^1]: http://mattgemmell.com/2011/07/25/network-link-conditioner-in-lion/

[^2]: http://nodejs.org/api/process.html\#process\_process\_memoryusage

[^3]: http://writings.nunojob.com/2011/12/clarinet-sax-based-evented-streaming-json-parser-in-javascript-for-the-browser-and-nodejs.html

[^4]: At time of writing, Firefox is the only engine supporting
    WeakHashMap by default. In Chome it is implemented but not available
    to Javascript unless explicitly enabled by a browser flag.
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/WeakMap
    retrieved 11th October 2013
