

Background
==========

**background should be 2-10 pages**

SOA

REST/WebServices (WSDL etc)

What is a rest client in this context (a client library)

Marshalling/ de-marshalling. Benefits and the problems that it causes.
Allows one model to be written out to XML or JSON

Big/small message problem and granularity. With small: http overhead. With big: not all may be needed.


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



XmlHttpRequest
--------------

*XmlHttpRequest* (XHR)

Xhr2 and the .onprogress callback


