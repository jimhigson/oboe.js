

Background
==========

**background should be 2-10 pages**

SOA

REST/WebServices (WSDL etc)

What is a rest client in this context (a client library)

Marshalling/ de-marshalling. Benefits and the problems that it causes.
Allows one model to be written out to XML or JSON

Big/small message problem and granularity. With small: http overhead. With big: not all may be needed.

Javascript as mis-understood language (CITE: Crockford) - list features available.

Parsing: SAX and Dom
--------------------

Why sax is difficult

DOM parser can be built on a SAX parser


State of http as a streaming technology
---------

Dichotamy between streaming and downloading in the browser for downloading data. But not for html (progressive rendering)
or images (progressive PNGs and progressive JPEGs) 

Lack of support in browser
Long poll - for infrequent push messages. Must be read 
Writing script tags

All require server to have a special mode. Encoding is specific to get arround restrictions.

JsonPath in general tries to resemble the javascript use of the json language nodes it is detecting.

```javascript

// an in-memory person with a multi-line address:
let person = {
   name: "...",
   address: [
      "line1",
      "line2",
      "line3"
   ]
};


// in javascript we can get line two of the address as such:
let addresss = person.address[2]

// the equivalent jsonpath expression is identical:
let jsonPath = "person.address[2]"

```

What 'this' (context) is in javascript. Why not calling it scope.

The web browser as REST client
-----------------------------

Browser incompatability mostly in presentation layer rather than in scripting languages.

Language grammars rarely disagree, incompatability due to scripting is almost always due to the APIs
presented to the scripting language rather than the language itself. 
   

State of rest: Json and XML
------------

Json is very simple, only a few CFGs required to describe the language (json.org) - this project is listed there!



Node
----

What Node is
V8. Fast. Near-native. JIT.
Why Node perhaps is mis-placed in its current usage as a purely web platform "the aim is absolutely fast io".
This happened because web specialist programmers took it up first
 
Why Node is significant
* Recognises that most tasks are io-bound rather than CPU bound. Threaded models good for CPU-bound in the main.

How Node is different

Criticisms of Node. Esp from Erlang etc devs. 

Node's standard stream mechanisms


XmlHttpRequest
--------------

*XmlHttpRequest* (XHR)

Xhr2 and the .onprogress callback


