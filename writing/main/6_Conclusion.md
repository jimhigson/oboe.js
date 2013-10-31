Conclusion
==========

Benchmarking vs non-progressive REST
------------------------------------

I feel it is important to experimentally answer the question, *is this
way actually any faster?* To measure performance I have created a small
benchmarking suite that runs under Node.js. One of the advantages
suggested for incremental parsing was a perceptual improvement in speed.
I am not focusing on user perception for this evaluation because it
would be difficult to measure, requiring subjective judgement and human
participants. I will be measuring the time taken to provide the first
output which correlates with how quickly interface redrawing can start
and should give a good indication as to perceptual speed. I chose Node
to host the tests because it is a minimalist platform which should give
more repeatable results than browsers which could be performing any
number of simultaneous background tasks. Node also has the advantage
that small changes in memory use are not overwhelmed by a memory hungry
environment.

The benchmark involves two node processes, one acting as a REST client
and the other as a REST server and mimics a REST service backed by a
relational database. Relational database client libraries pass data from
a result cursor one tuple at a time to be used by the application, the
service simulates this by writing out forty tuples as JSON objects, one
every ten milliseconds. Half the tuples contain a URL to a further
resource which will also be fetched so that an aggregation can be
created. To simulate real network conditions, Apple's *Network Line
Conditioner* was used with the presets *3G, Average Case* and *Cable
modem* to represent poor and good internet connections respectively.
Three client version were implemented using JSON.parse DOM-style
parsing, Clarinet SAX-style parsing and Oboe. Memory was measured on the
client using Node's built in memory reporting tool,
`process.memoryusage()` and the largest figure reported during each run
is taken. The test server and client can be found in the project's
`benchmark` directory, or in the appendix on pages
\ref{src_benchmarkServer} and \ref{src_benchmarkClient}.

  Client Strategy   Network     First output   Total time   Max. Memory
  ----------------- --------- -------------- ------------ -------------
  Oboe.js           Good                40ms        804ms         6.2Mb
  Oboe.js           Poor                60ms      1,526ms         6.2Mb
  JSON.parse        Good               984ms      1,064ms         9,0Mb
  JSON.parse        Poor              2550ms      2,609ms         8.9Mb
  Clarinet          Good                34ms        781ms         5.5Mb
  Clarinet          Poor                52ms      1,510ms         5.5Mb

In comparison with JSON.parse, Oboe shows a dramatic improvement of
about 96% regarding the time taken for the first output to be produced
and a smaller but significant improvement of about 40% in the total time
required to create the aggregation. Oboe's aggregation on a good network
is about 15% slower than Clarinet; since Oboe is built on Clarinet I did
not expect it to be faster but I had hoped for the gap to be smaller.
This is probably because Oboe encodes a more involved workflow than a
raw SAX parser.

Clarinet is known to be slower than JSON.parse for input which is
already held in memory[@clarinetspeed] but when reading from a network
this offset by the ability to parse progressively. Compared to
JSON.parse, the extra computation time needed by Oboe and Clarinet is
shown to be relatively insignificant in comparison to the advantage of
better I/O management. Reacting earlier using slower handlers is shown
to be faster overall than reacting later with quicker ones. I believe
that this vindicates the project focus on efficient management of I/O
over faster algorithms; much current programming takes a "Hurry up and
wait" approach by concentrating on algorithm micro-optimisation over
performing tasks at the earliest possible time.

Oboe shows an unexpected improvement in terms of memory usage compared
to JSON.parse. It is not clear why this would be but it may be
attributable to the large dependency tree brought in by the get-json
library used in the JSON.parse client version. As expected, Clarinet has
the smallest memory usage because it never stores a complete version of
the parsed JSON. As REST resource size increases I would expect
Clarinet's memory usage to remain roughly constant while the other two
rise linearly. Node is popular on RaspberryPi type devices with
constrained RAM; Clarinet might be preferable to Oboe where code clarity
is less important than a small memory footprint.

Comparative developer ergonomics
--------------------------------

Writing less code is not in itself a guarantee of a better developer
ergonomics but I find it is a good indicator so long as the code isn't
forced to be overly terse. The code sizes below report the quantity of
code required to implement the benchmark REST client under each
strategy. Each version is written as the most natural expression for the
library used.

  Strategy       Code Required (lines)   Code required (chars)
  ------------ ----------------------- -----------------------
  Oboe.js                            3                      64
  JSON.parse                         5                     102
  Clarinet                          30                   lots!

Oboe was the shortest:

~~~~ {.javascript}
oboe(DB_URL).node('{id url}.url', function(url){
   oboe(url).node('name', function(name){
      console.log(name);               
   });      
});
~~~~

Non-progressive parsing with JSON.parse was slightly longer, requiring a
loop and an if statement, both necessary to drill down into the results.
The code below is shortened by using the get-json[^1] package which
combines parsing implicitly into the download:

~~~~ {.javascript}
getJson(DB_URL, function(err, records) {
   records.data.forEach( function( record ){
      if( record.url ) {
         getJson(record.url, function(err, record) {
            console.log(record.name);
         });
      }
   });
});
~~~~

This version is tightly coupled with the JSON format that it reads. We
can see this in the fragments `records.data`, `record.url`, and
`record.name` which will only work if they find the desired subtree at
exactly the anticipated location. The code might be said to contain a
description of the format that it is for rather than a description of
what is required from the format. The Oboe version describes the format
only so far as is needed to identify the desired parts; the remainder of
the JSON could change and the code would continue to work. I believe
this demonstrates a greater tolerance to changing formats and that this
would be useful when programming against evolving services.

The Clarinet version of the code is too long to include here but may be
seen [in the appendix](#header_benchmarkClient), on page
\pageref{src_benchmarkClient}. By using SAX directly the code is more
verbose and its purpose is obfuscated. I don't think a person looking at
this source could deduce what is being done without thinking about it
for some time. The functions receiving SAX events must handle several
different cases and so tend to have generic parameter names such as
'key' or 'value' which represent the token type. By contrast, Oboe and
JSON.parse both allow names such as 'record' or 'url' which are chosen
according to the semantics of the value. I find this naming easier to
interpret because it allows me to think in terms of the domain model
rather than considering serialisation artifacts.

Performance under various Javascript engines
--------------------------------------------

The file `oboe.performance.spec.js`[^2] contains a benchmark which
concentrates on measuring the performance of Oboe's pattern matching.
This test registers a complex pattern which intentionally uses all
features from the JSONPath language and then fetches a JSON file
containing approximately 800 nodes, 100 of which will match. Although
actual http is used, it is over an unthrottled connection to localhost
so network delay should be negligible. The tests were executed on a
relatively low-powered Macbook Air laptop running OS X 10.7.5, except
for Chrome Mobile which was tested on an iPhone 5 with iOS 7.0.2. Test
cases requiring Microsoft Windows were performed inside a VirtualBox
virtual machine. Curl is a simple download tool that writes the resource
to stdout without any parsing and is included as a baseline.

  Platform                        Total Time   Throughput (nodes/ms)
  ----------------------------- ------------ -----------------------
  Curl                                  42ms         *unparsed, n/a*
  Chrome 31.0.1650.34                   84ms                    9.57
  Node.js v0.10.1                      172ms                    4.67
  Chrome 30.0.1599                     202ms                    3.98
  Safari 6.0.5                         231ms                    3.48
  IE 10.0.0 (Windows 8)                349ms                    2.30
  Chrome Mobile iOS 30.0.1599          431ms                    1.86
  Firefox 24.0.0                       547ms                    1.47
  IE 8.0.0 (Windows XP)              3,048ms                    0.26

We can see that Firefox is slower than other modern browsers despite
normally being quite fast. This is probably explicable by SpiderMonkey,
the Mozilla just-in-time Javascript compiler being poor at optimising
functional Javascript [@functionalSpiderMonkey]. The JSON nodes are not
of a common type so many of the library's internal callsites are not
monomorphic which is also optimised poorly [@functionalSpiderMonkey].
When the test was later repeated with a simpler pattern Firefox showed
by far the largest improvement, indicating that the functional JSONPath
matching accounts for Firefox's lower than expected performance.

During the project version 31 of Chrome was released that performed more
than twice as quickly as version 30 due to an updated version of the v8
Javascript engine. Node also uses v8 and should catch up when it is next
updated. This reflects Javascript engine writers targeting functional
optimisation now that functional Javascript is becoming a more popular
style.

Of these results I find only the performance under old versions of
Internet Explorer poor enough to be concerning. Since this platform
cannot progressively interpret an XHR response an improvement over
traditional XHR was not possible, but I would have liked performance to
have not degraded by so much. Adding three seconds to a REST call will
unacceptably impair a webapp's user experience so it might be reasonable
to conclude that for complex use cases Oboe is currently unsuited to
legacy platforms. If we desired to improve performance on older
platforms one solution might be to create a simpler, non-progressive
implementation of the Oboe API for selective delivery to older browsers.
However, I would argue that the time spent writing a basic legacy
version would be better employed waiting for these moribund platforms to
die.

For an imperative language coded in a functional style the compiler may
not optimise as effectively as if a functional language were used. This
is especially the case for a highly dynamic language in which
everything, even the basic built-in types, are mutable. Presenting a
convenient API to application developers means passing eagerly evaluated
parameters to application callbacks even when the parameters are of
secondary importance, such as the path and ancestor arrays that are
created for every matching node, and will be predominantly ignored.
Under a functional language these could be lazily evaluated without
requiring any special effort by the application programmer. I think
Javascript was a good choice of language, giving a very large number of
client- and server-side applications that may potentially adopt the
library. However, server-side Oboe would be very amicable to
implementation using a purer functional language and it would be
interesting to see how much faster it could be.

Status as a micro-library
-------------------------

The file `oboe-browser.min.js` is the minified, built version of Oboe
ready to be sent to web browsers and can be found in the project's
`dist` directory. The size fluctuates as commits are made but after gzip
it comes to about 4800 bytes; close to but comfortably under the 5120
limit. At roughly the size as a small image the download footprint of
Oboe should not discourage adoption.

Potential future work
---------------------

Although all network traffic can be viewed as a stream, the most obvious
future expansion would be to create a matching server-side component
that provides an intuitive interface for writing JSON streams. So far,
sending streaming JSON has required that the resource be written out
using programmer-assembled strings but this approach is error prone and
would scale badly as messages become more complex. A stream-writer
server side library would allow Oboe to be used as a REST-compatible
streaming solution for situations which currently employ push tables or
Websockets. This would provide a form of REST streaming that operates
according to the principled design of http rather than by sidestepping
it.

Although JSON is particularly well suited, there is nothing about Oboe
that precludes working with other tree-shaped formats. If there is
demand, an XML/XPATH version seems like an obvious expansion. This could
be implemented by allowing resource formats to be added using plugins
which would allow programmers to create a progressive interpretation of
any resource type. As a minimum, a plug-in would require a SAX-like
parser and a compiler for some kind of node selection language.

Oboe stores all JSON nodes that are parsed for the duration of its
lifetime so despite being similar to a SAX parser in terms of being
progressive, it consumes as much memory as a DOM parser. The nodes
remain held so that all possible JSONPath expressions may later be
tested. However, in most cases memory could be freed if the parsed
content were stored only so far as is required to test against the
patterns which have actually been registered. For typical use cases I
expect this would allow large subtrees to be pruned, particularly once
they have matched a pattern and have already been handed back to
application callbacks. Likewise, the current implementation takes a
rather brute force approach when examining nodes for pattern matches by
checking every registered JSONPath expression against every node parsed
from the JSON. For many expressions we should be able to say that there
will be no matches inside a particular JSON subtree, either because we
have already matched or because the the subtree's ancestors invariably
imply failure. A more sophisticated implementation might subdue provably
unsatisfiable handlers until the SAX parser leaves an unmatchable
subtree.

Summing up
----------

The community reaction to Oboe has been overwhelmingly positive with
several projects already adopting it and reporting performance gains
which are large enough to be obvious. I feel that, while some attention
should be given to optimisation under Firefox, this project meets all of
its intended aims, presenting a REST client library which in the best
case allows the network to be used much more efficiently and in the
worse case is as good as the previous best solution. At the same time
the produced library is in many cases easier to use than the previous
simplest solution.

[^1]: https://npmjs.org/package/get-json

[^2]: In git repository, [test/specs/oboe.performance.spec.js](https://github.com/jimhigson/oboe.js/blob/master/test/specs/oboe.performance.spec.js)
