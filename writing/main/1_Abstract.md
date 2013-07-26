Abstract
========

A javascript REST client library targeting both Node.js and web
browsers, incorporating http streaming, pattern matching, and progressive JSON parsing with
the aim of improving performance, fault tolerance, and encouraging a
greater degree of loose coupling between systems. Loose coupling is
particularly considered in light of the application of Agile
methodologies to SOA, providing a framework in which it is acceptable to
partially restructure the JSON format in which a resource is expressed
whilst maintaining compatibility with dependant systems.

A critique is made of current practice, under which resources are
entirely retrieved before items of interest are extracted
programmatically. An alternative model is presented allowing the
specification of items of interest using a declarative syntax similar to
jsonPath. The identified items are provided incrementally while the
resource is still downloading.

In addition to a consideration of performance in absolute terms, the
usability implications of incremental
                          processing of retrieved resources are also evaluated with regards
to differences in perceived performance.
