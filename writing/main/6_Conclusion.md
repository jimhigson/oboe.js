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
suite that runs under Node.js. I chose Node because it is quite a very
minimalist platform which should give a more repeatable test results
than browsers which could be performing any number of simultaneous
background tasks. Node also has the advantage that small changes when
measuring the memory taken by the a running process are not overwhelmed
by a memory hungry browser environment. These tests may be seen in the
`benchmark` folder of the project on p.\ref{src_benchmarkServer}.

One of the suggested advantages of incremental parsing is an improved
user experience because of more progressive interface rendering and a
perceptual improvement in speed. I am not focusing on user perception in
this evaluation because it would be much more difficult to measure, but
I will be measuring the time taken to provide the first output which
correlates with how quickly interface redrawing can start. Third parties
have reported creating webapps using Oboe and their increase in
responsiveness is large enough to be obvious.

The benchmark mimics a relational database-backed REST service.
Relational databases hand data via a result cursor one tuple at a time,
the service simulates this by writing out forty tuples as JSON objects,
one every ten milliseconds. Each other object in the returned JSON
contains a URL to a further resource which will also be fetched and
aggregated. To simulate network slowness, Apple's *Network Line
Conditioner* was used with the presets *3G, Average Case* and *Cable
modem* to represent poor and good internet connections respectively
[^1]. The test involves two node processes, one acting as a REST client
and one as a REST server. Memory was measured using Node's built in
memory reporting tool, `process.memoryusage()` and the largest figure
reported on each run is used.

  Strategy     Network     First output   Total time   Max. Memory
  ------------ --------- -------------- ------------ -------------
  Oboe.js      Good                40ms        804ms         6.2Mb
  Oboe.js      Poor                60ms      1,526ms         6.2Mb
  JSON.parse   Good               984ms      1,064ms         9,0Mb
  JSON.parse   Poor              2550ms      2,609ms         8.9Mb
  Clarinet     Good                34ms        781ms         5.5Mb
  Clarinet     Poor                52ms      1,510ms         5.5Mb

In comparison with JSON.parse, Oboe shows a dramatic improvement
regarding the time taken for the first output of about 96% and a smaller
but significant improvement of about 40% in the total time required to
complete the aggregation. Oboe's aggregation on a good network is about
15% slower than Clarinet; since Oboe is built on Clarinet I did not
expect it to be faster but I had hoped for the gap to be smaller. This
is probably because Oboe is a more involved process computationally than
a raw SAX parser. Clarinet is known to be slower than JSON.parse for a
non-progressive parse of input which is already held in memory[^2] so on
some extremely fast networks or loading from local files, there will
come a point where the low computational overhead of JSON.parse makes it
the fastest solution.

For this database aggregation example the extra computation time needed
by Oboe's more sophisticated algorithms is relatively insignificant in
comparison to the benefits of better i/o management. Reacting earlier
using slower handlers has been shown to be faster overall than reacting
later with quicker ones. I believe that this vindicates a focus on
efficient management of i/o over faster algorithms. I believe that much
current programming takes a "Hurry up and wait" approach by
concentrating overly on micro-optimisations to algorithms over choosing
the best time to do something.

There is an unexpected improvement vs JSON.parse in terms of memory
usage. It is not clear why this would be but it may be attributable to
the get-json library used to simplify these tests having a large
dependency tree. As expected, Clarinet shows the largest improvements in
terms of memory usage because it never stores a complete version of the
parsed JSON. As resource size increases I would expect Clarinet's memory
usage to remain roughly constant while the other two rise linearly. Node
is popular on RaspberryPi type devices with constrained RAM; where code
clarity is less important than a small memory footprint Clarinet might
be preferable to Oboe.

Comparative developer ergonomics
--------------------------------

A smaller code size is not in itself a guarantee of a easier programming
but, so long as the code isn't forced to be more terse, I find it is a
good indicator. The code sizes reported below report how much
programming was required for each strategy to implement the database
simulation above. For each library under test the programming was
written using its most natural expression.

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

The code using JSON.parse is very closely coupled with the JSON format
that it is handling. We can see this in the fragments `records.data`,
`record.url`, and `record.name` which will only work if they find their
desired subtree at exactly the anticipated location. The code might be
said to contain a description of the format that it is for rather than a
description of what is required from the format. The Oboe version
describes the format only so far as is needed to identify the desired
parts; the remainder of the JSON could change and the code would
continue to work. I believe this demonstrates a greater tolerance to
changing formats that would be useful when programming against evolving
services.

The Clarinet version of the code is too long to include here but may be
seen [in the appendix](#header_benchmarkClient), on page
\pageref{src_benchmarkClient}. By using SAX directly the code is more
verbose and its purpose is obfuscated. I don't think a person looking at
this source would understand what is being parsed without thinking about
it for a long time. Functions handling SAX events must handle several
different cases which means they tend to have parameter names such as
'key' or 'value' which represent the token type. By contrast, Oboe and
JSON.parse both allow names such as 'record' or 'url' which are chosen
according to the semantics of the value which is passed in.

Performance under various Javascript engines
--------------------------------------------

The 15% overhead of Oboe vs Clarinet suggests Oboe might be
computationally expensive. With very fast networks the extra computation
might outweigh a more efficient i/o strategy.

The file `oboe.performance.spec.js`[^4] contains a benchmark that
concentrates on using Oboe for pattern matching. This test registers a
complex pattern which intentionally uses all of the JSONPath language
features and then fetches a JSON file containing approximately 800 nodes
and 100 matches. Although real http is used, it over an unthrottled
connection to localhost so the impact of the network should be
negligible. The results below are averaged from ten runs. The tests were
executed on a relatively low-powered Macbook Air laptop running OS X
10.7.5, except for Chrome Mobile which was tested on an iPhone 5 with
iOS 7.0.2. Tests requiring Microsoft Windows were performed inside a
VirtualBox virtual machine. Curl is used to provide a baseline, it is a
simple download tool and is used to write the downloaded JSON to stdout
without any parsing.

  Platform                        Total Time   Throughput (nodes/ms)
  ----------------------------- ------------ -----------------------
  Curl (control)                        42ms         *unparsed, n/a*
  Chrome 31.0.1650.34                   84ms                    9.57
  Node.js v0.10.1                      172ms                    4.67
  Chrome 30.0.1599                     202ms                    3.98
  Safari 6.0.5                         231ms                    3.48
  IE 10.0.0 (Windows 8)                349ms                    2.30
  Chrome Mobile iOS 30.0.1599          431ms                    1.86
  Firefox 24.0.0                       547ms                    1.47
  IE 8.0.0 (Windows XP)              3,048ms                    0.26

We can see that Firefox is slower than other modern browsers despite
being normally quite fast. This is probably explicable because its
SpiderMonkey just-in-time Javascript compiler is poor at optimising
functional Javascript [@functionalSpiderMonkey]. The JSON nodes are not
of a common type so many of the library's internal callsites are not
monomorphic which Firefox also optimises poorly
[@functionalSpiderMonkey]. When the test was later repeated with a
simpler pattern Firefox showed by far the largest improvement,
indicating that the functional JSONPath matching accounts for Firefox's
lower than expected performance.

During the project a new version of Chrome was released that performed
more than twice as quickly as the last one due to an updated version of
the v8 Javascript engine. Node also uses v8 and should catch up very
soon. This reflects Javascript engine writers targeting functional
performance now that functional Javascript is becoming a more popular
style.

Of these results I only find the performance under old versions of
Internet Explorer poor enough that it could be concerning. Since this
platform cannot progressively interpret an XHR response an improvement
over traditional XHR was not possible, but I would have liked to have
not degraded performance by much. Adding three seconds to a REST call
will unacceptably impair a webapp's user experience so it might be
reasonable to conclude that for complex use cases Oboe is currently
unsuited to legacy platforms. If we strongly desired to improve
performance on older platforms one solution might be to create a
simpler, non-progressive implementation of the Oboe API for selective
delivery to older platforms. However, I would argue that time spent
writing a basic version for legacy platforms would be better spend
waiting for them to die.

For an imperative language coded in a functional style the compiler may
not optimise as effectively as if a functional language were used. This
is especially the case for a highly dynamic language in which
everything, even the basic built-in types, are mutable. Presenting a
helpful API also means passing application callbacks eagerly evaluated
parameters such as the the path and ancestor arrays which are of
secondary importance compared to the node and I anticipate will be
predominantly ignored. Under a functional language these could be lazily
evaluated without requiring any extra effort by the application
programmer. I think Javascript was a good choice of language, giving a
very large number of client- and server-side applications that may
potentially adopt the library. However, server-side Oboe would be very
amicable to implementation using a purer functional language and it
would be interesting to see how much faster it would be.

Status as a micro-library
-------------------------

The file `oboe-browser.min.js` is the minified, built version of Oboe
ready to be sent to web browsers and can be found in the project's
`dist` directory. The size fluctuates as commits are made but after gzip
it comes to about 4800 bytes; close to but comfortably under the 5120
limit. At roughly the size as a small image the download footprint of
Oboe should not discourage adoption.

potential future work
---------------------

Although the project already delivers improvements to the programming
model for REST clients, the most obvious expansion would be to create a
matching server-side component that makes it intuitive to write JSON in
a streaming way. So far writing out streaming JSON has required the
resource be written out using programmer-assembled strings but this
would be error prone and scale badly as messages become more complex.

There is nothing about Oboe which precludes working with other
tree-shaped format. If there is demand, An XML/XPATH version seems like
an obvious expansion. This could be implemented by allowing resource
formats to be added using plugins which would could be used by
programmers to create a progressive interpretation of any resource type.
A plug-in would require a SAX-like parser for the format a compiler for
some kind of pattern matching language.

Oboe stores all JSON node that are parsed for the duration of its
lifetime so despite its similarity to a SAX parser, it consumes as much
memory as a DOM parser. These are not discarded so that all possible
JSONPath expressions may be tested. However, in most cases memory could
be freed if the parsed content were stored only so far as is required to
test against the patterns which have actually been registered. For
typical use cases I expect this would allow large subtrees to be
unlinked inside Oboe, particularly once they have matched a pattern and
have already been handed over to the application callbacks. 
Likewise,
the current implementation takes a rather brute force approach when
examining nodes for pattern matches by checking every registered JSONPath
expression against every node parsed from the JSON. For
many expressions we should be able to say that there will be no matches
inside a particular JSON subtree, either because we have already matched 
or because the the subtree's ancestors will invariably fail.
A more sophisticated
implementation might subdue provably unsatisfiable handlers until the
SAX parser leaves that subtree.

[^1]: http://mattgemmell.com/2011/07/25/network-link-conditioner-in-lion/

[^2]: http://writings.nunojob.com/2011/12/clarinet-sax-based-evented-streaming-json-parser-in-javascript-for-the-browser-and-nodejs.html

[^3]: https://npmjs.org/package/get-json

[^4]: See
    [tests/spec/oboe.performance.spec.js](https://github.com/jimhigson/oboe.js/blob/master/test/specs/oboe.performance.spec.js)

