Conclusion
==========

Differences in the programs written using Oboe.js
-------------------------------------------------

I find it quite interesting that a program written using Oboe.js in the
most natural way will be subtly different from one written using
JSON.parse, even if the programmer is trying to express the same thing.
Consider the two examples below which use Node.js to read from a local
file and write to the console.

~~~~ {.javascript}
oboe( fs.createReadStream( '/home/me/secretPlans.json' ) )
   .on('node', {
      'schemes.*': function(scheme){
         console.log('Aha! ' + scheme);
      },
      'plottings.*': function(deviousPlot){
         console.log('Hmmm! ' + deviousPlot);
      }   
   })
   .on('done', function(){
      console.log("*twiddles mustache*");
   })
   .on('fail', function(){
      console.log("Drat! Foiled again!");   
   });
~~~~

~~~~ {.javascript}
fs.readFile('/home/me/secretPlans.json', function( err, plansJson ){     
   if( err ) {
      console.log("Drat! Foiled again!");
      return;
   }
   var plans = JSON.parse(err, plansJson);
   
   plans.schemes.forEach(function( scheme ){
      console.log('Aha! ' + scheme);   
   });   
   plans.plottings.forEach(function(deviousPlot){
      console.log('Hmmm! ' + deviousPlot);
   });
      
   console.log("*twiddles mustache*");   
});
~~~~

The first observation is that the explicit looping in the second example
requires roughly the same amount of code as the pattern registration
that serves as an analogue in the first. The first example has a more
declarative style whereas the second is more imperative. If two levels
of selection were required, such as `schemes.*.premise`, other than a
longer JSONPath pattern the first example would not grow in complexity
whereas the second would require an additional loop inside the existing
loop. We can say that the complexity of programming using Oboe stays
roughly constant whereas in a more traditional style it grows linearly
with the number of levels which must be traversed.

While the intended behaviours are very similar, the unintended
accidental side-behaviours differ between the two examples. In the first
the order of the output for schemes and plans will match the order in
the JSON, whereas for the second scheming is always done before
plotting. In the second example the order could be easily changed by
reversing the statements whereas in the first to change the order would
require a change in the order of the JSON. Whether the programmer has
been liberated to ignore order or restricted to be unable to easily
change it probably depends on the situation. The error behaviours are
also different. The first example will print until it has an error. The
second will print if there are no errors.

In the second example it is most natural to check for errors before
output whereas in the first it feels most natural to register an error
listener as the last of the chained calls. I prefer the source order in
the first because the the normal case is listed before the abnormal one
emphasises their roles as main and secondary behaviours.

Finally, the timings of the printing will be different. The first code
prints the first output in constant time regardless of the size of the
file and then outputs many lines individually as the JSON is read. The
second will print all output at once after a time proportional to the
size of the input.

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
ten milliseconds. To simulate network slowness, Apple's *Network Line
Conditioner* was used. I chose the named presets "3G, Average Case" and
"Cable modem" to represent poor and good networks respectively [^1].
Each test involves two node processes, one acting as the client and one
as the server, with data transfer between them via normal http.

Memory was measured using Node's built in memory reporting tool,
`process.memoryusage()` and the maximum figure returned on each run was
taken

Each object in the returned JSON contains a URL to a further resource.
Each further resource is fetched and parsed. The aggregation is complete
when we have them all.

  Strategy     Network     First output   Total time   Max. Memory
  ------------ --------- -------------- ------------ -------------
  Oboe.js      Good                40ms        804ms         6.2Mb
  Oboe.js      Poor                60ms      1,526ms         6.2Mb
  JSON.parse   Good               984ms      1,064ms         9,0Mb
  JSON.parse   Poor              2550ms      2,609ms         8.9Mb
  Clarinet     Good                34ms        781ms         5.5Mb
  Clarinet     Poor                52ms      1,510ms         5.5Mb

Vs Json.parse shows a dramatic improvement over first output of about
96% and a smaller but significant improvement of about 40% in time
required to complete the task. Oboe's performance in terms of time is
about 15% slower than Clarinet; since Oboe is built on Clarinet it could
not be faster but I had hoped for these results to be closer.

As expected, in this simulation of real-world usage, the extra
computation\
compared to JSON.parse which is needed by Oboe's more involved
algorithms or Clarinet's less efficient parsing [^2] have been dwarfed
by better i/o management. Reacting earlier using slower handlers has
been shown to be faster overall than reacting later with quicker ones. I
believe that this vindicates a focus on efficient management of i/o over
faster algorithms. I believe that much programming takes a "Hurry up and
wait" approach by concentrating overly on optimal computation rather
than optimal i/o management.

There is an unexpected improvement vs JSON.parse in terms of memory
usage. It is not clear why this would be but it may be attributable to
the json fetching library used to simplify the JSON.parse tests having a
large dependency tree. As expected, Clarinet shows the largest
improvements in terms of memory usage. For very large JSON I would
expect Clarinet's memory usage to remain roughly constant whilst the two
approaches rise linearly with the size of the resource.

Comparative Programmer Ergonomics
---------------------------------

For each of the benchmarks above the code was laid out in the most
natural way for the strategy under test.

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

Non-progressive parsing was slightly longer, requiring in addition a
loop, an if statement, and programmatically selecting specific parts of
the results. The code below is shortened by using the get-json[^3]
package which removes the need to explicitly parse:

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

The JSON.parse version is very closely coupled with the format that it
is handling. We can see this in the fragments `records.data`,
`record.url`, `record.name` which expects to find sub-trees at very
specific locations in the JSON. The code might be said to contain a
description of the format that it is for. Conversely, the Oboe version
describes the format only so far as is needed to identify the parts that
it is interested in; the remainder of the format could change and the
code would continue to work. As well as being simpler to program against
than the previous simplest mode, I believe this demonstrates a greater
tolerance to changing formats.

The Clarinet version of the code may be seen in appendex (??). This
version is greater in verbosity and obfuscation. I don't think a person
could look at this source and understand what is being parsed without
thinking about it for a long time. Parameter names such as 'key' or
'value' must be chosen by the position of the token in the markup, prior
to understanding the semantics it represents. By contrast, Oboe and
JSON.parse both allow names to be given by the meaning of the token.

Performance of code styles under various engines
------------------------------------------------

The 15% overhead of Oboe vs Clarinet suggests Oboe might be
computationally expensive. With very fast networks the extra computation
might outweigh a more efficient i/o strategy.

The file `test/specs/oboe.performance.spec.js` contains a simple
benchmark. This test registeres a very complex JSONPath expression which
intentionally uses all of the language and fetches a JSON file
containing 100 objects, each with 8 String properties against .
Correspondingly the expression is evaluated just over 800 times and 100
matches are found. Although real http is used, it is kept within the
localhost. The results below are averaged from ten runs. The tests
executed on a Macbook Air running OS X 10.7.5, except for Chrome Mobile which was tested on
an iPhone 5 with iOS 7.0.2. Tests requiring Microsoft Windows were performed inside a
VirtualBox virtual machine.

Curl is a simple download to stdout from the shell and is included as a
control run to provide a baseline.

  Platform                                  Total Time   Throughput (nodes/ms)
  ----------------------------------------- ------------ -----------------------
  Curl (control)                            42ms         *n/a*
  Chrome 31.0.1650.34                       84ms         9.57
  Node.js v0.10.1                           172ms        4.67
  Chrome 30.0.1599                          202ms        3.98
  Safari 6.0.5                              231ms        3.48
  IE 10.0.0 (Windows 8)                     349ms        2.30
  Chrome Mobile iOS 30.0.1599               431ms        1.86
  Firefox 24.0.0                            547ms        1.47
  IE 8.0.0 (Windows XP)                     3,048ms      0.26

We can see that Firefox is much slower than other modern browsers
despite its SpiderMonkey Javascript engine being otherwise quite fast.
This is probably explicable in part by SpiderMonkey's just-in-time
compiler being poor at optimising functional Javascript
[@functionalSpiderMonkey]. Because the JSON nodes are not of a common
type the related callsites are not monomorphic which Firefox also
optimises poorly [@functionalSpiderMonkey]. When the test was repeated
using a simpler JSONPath expression Firefox showed by far the largest
improvement indicating that on this platform the functional pattern
matching is the bottleneck.

During the project a new version of Chrome more than doubled the node
throughput dur to including later version of the v8 Javascript engine.
Node also uses v8 and should be updated to this version soon.

Of these results I find only the very low performance on old versions of
Internet Explorer concerning, almost certainly degrading user experience
more than it is improved. It might be reasonable to conclude that for
complex use cases Oboe is currently not unsuited to legacy platforms.
Since this platform cannot progressively interpret an XHR response, if
performance on legacy platforms becomes a serious concern one option
might be to create a non-progressive library with the same API which
could be selectively delivered to those platforms in place of the main
version.

Nonetheless, in its current form Oboe may slow down the total time when
working over the very fastest connections.

For an imperative language coded in a functional style the compiler may
not optimise as effectively as if a functional language was used. This
is especially the case under a highly dynamic language in which
everything, even the built-in constructs are mutable. I think Javascript
was a good choice of language given it is already well adopted and
allows the targeting of server and client side with only minimal effort,
giving a very large number of applications with the potential to adopt
Oboe. However, there are obvious inefficiencies such as the the descent
and ancestor arrays which are always created to be handed to application
callbacks but that I anticipate will be predominantly ignored. The
design of Oboe is very amicable to implementation under a functional
language and it would be interesting to see the results.

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

Although the project delivers improvements already, the most obvious
expansion to fully realise the potential would be a matching server-side
component that writes JSON in a streaming way. So far this has required
that the JSON be written out as strings but this scales badly as
messages become more complex.

There is nothing about Oboe which precludes working with other
tree-shaped format. If there is demand, An XML/XPATH version seems like
an obvious expansion. Plug-ins for formats.

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
proposed in ECMAScript 6 but currently only experimentally
supported[^4]. For future development they would be ideal.

The nodes which Oboe hands to callbacks are mutable meaning that
potentially the correct workings of the library could be broken if the
containing application carelessly alters them. Newer implementations of
Javascript allows a whole object to be made immutable, or just certain
properties via an immutability decorator and the `defineProperty`
method. This would probably be an improvement.

[^1]: http://mattgemmell.com/2011/07/25/network-link-conditioner-in-lion/

[^2]: http://writings.nunojob.com/2011/12/clarinet-sax-based-evented-streaming-json-parser-in-javascript-for-the-browser-and-nodejs.html

[^3]: https://npmjs.org/package/get-json

[^4]: At time of writing, Firefox is the only engine supporting
    WeakHashMap by default. In Chome it is implemented but not available
    to Javascript unless explicitly enabled by a browser flag.
    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/WeakMap
    retrieved 11th October 2013
