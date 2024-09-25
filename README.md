Archive note (2024)
===================

This project is now archived. As of 2024, no code changes have been made in 5 years, and I (Jim) have not had the time to port it to new technology, or maintain it in a way that it deserves.

For existing projects using this code, it should continue to work, but I would recommend looking for other solutions.

I (Jim) still think there is a clear gap in the market for a streaming-first JSON parser that doesn't wait for responses to finish before it starts using them. For anyone who is interested
in making that project, reach out and I'd be happy to discuss. Today, with modern javascript and typescript (ie async iterators), a much nicer modern API could be made than the one I created in 2013.

Many thanks to [JuanCaicedo](https://github.com/JuanCaicedo) and [Aigeec](https://github.com/Aigeec) in particular for continuing to contribute fixes and modernise this project through to ~2020.

The [Oboe.js website](http://oboejs.com) has been ported to a static site Github Pages, and the plan is to keep it online with a deprecation notice.

The original README follows below.

----

Oboe.js is an [open source](LICENCE) Javascript library
for loading JSON using streaming, combining the convenience of DOM with
the speed and fluidity of SAX.

It can parse any JSON as a stream, is small enough to be a [micro-library](http://microjs.com/#),
doesn't have dependencies, and doesn't care which other libraries you need it to speak to.

We can load trees [larger than the available memory](http://oboejs.com/examples#loading-json-trees-larger-than-the-available-ram).
Or we can [instantiate classical OOP models from JSON](http://oboejs.com/examples#demarshalling-json-to-an-oop-model),
or [completely transform your JSON](http://oboejs.com/examples#transforming-json-while-it-is-streaming) while it is being read. 

Oboe makes it really easy to start using json from a response before the ajax request completes. 
Or even if it never completes.

Where next?
-----------

- [The website](http://oboejs.com)
- Visualise [faster web applications through streaming](http://oboejs.com/why) 
- Visit the [project homepage](http://oboejs.com)
- Browse [code examples](http://oboejs.com/examples) 
- Learn the Oboe.js [API](http://oboejs.com/api)
- [Download](http://oboejs.com/download) the library
- [Discuss](http://oboejs.com/discuss) Oboe.js
