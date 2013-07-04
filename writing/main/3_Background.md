

Background
==========

**background should be 2-10 pages**

SOA
---

REST/WebServices (WSDL etc)

What is a rest client in this context (a client library)

Marshalling/ de-marshalling. Benefits and the problems that it causes.
Allows one model to be written out to XML or JSON

Big/small message problem and granularity. With small: http overhead. With big: not all may be needed.

Javascript as mis-understood language (CITE: Crockford) - list features available.

Anatomy of a SOA client
------------------------

First stage after getting a resource is usually to programmatically extract the interesting part from it.
This is usually done via calls in the programming language itself, for example by de-marshaling the stream
to domain objects and then calling a series of getters to narrow down to the interesting parts.

This part has become such a natural component of a workflow that it is barely noticed that it is happening.
In an OO language, the extraction of small parts of a model which, in the scope of the current concern are of 
interest is so universal that it could be considered the sole reason that getters exist.

However subtly incorporated it has become in the thinking of the programmer, we should note that this is a 
construct and only one possible way of thinking regarding identifying the areas of current interest in a 
wider model.

```java
// an example programmatic approach to a domain model interrogation under Java

List<Person> people = myModel.getPeople();
String firstPersonsSurname = people.get(0).getSurname();

```

One weakness of this imperative, programatic inspection model is that, once much code is written to 
interogate models in this way,
the interface of the model becomes increasingly expensive to change as the code making the inspections
becomes more tightly coupled with the thing that it is inspecting. Taking the above example, if the
model were later refactored such that the concepts of firstName and surName were pulled from the Person
class into an extracted Name class, because the inspection relies on a sequence of calls made directly 
into domain objects, the code making the query would also have to change. 

I believe that this coupling defies Agile methods of programming. Many Java IDEs provide tools that would
offer to automate the above extraction into a Name class, creating the new class and altering the existing
calls. While reducing the pain, if we accept the concept as I stated in the [Introduction] that the code
should not be seen as a static thing in which understanding is 

More declarative syntaxes exist which are flexible enough that
the declarative expressions may still apply as the underlying model is refactored. Whilst not applicable
to use in general purpose programming, XPATH is an example of this. As an analogue of the Java situation above,
Given the following XML:

```xml
<people>
   <person>
      <surname>Bond</surname>
   </person>
</people>
```

The XPath //person[0]//surname//text() (JIM/ME - CHECK THIS!) would continue to identify the correct part of the
resource without being updated after the xml analogue of the above Java Name refactor:

```xml
<people>
   <person>
      <name>
         <surname>Bond</surname>
      </name>
   </person>
</people>
```

A few models exist which do not follow this pattern such as XPATH. However, these are useful
in only a small domain.

Xpath is able to express identifiers which often survive refactoring because XML represents a tree, hence we
can consider relationships between entities to be that of contains/contained in (also siblings?). 
In application of XML, in the languages that we build on top of XML, it is very natural to consider all
elements to belong to their ancestors. Examples are myriad, for example consider a word count in a book
written in DOCBook format - it should be calculable without knowing if the book is split into chapters 
or not since this is
a concept internal to the oranisation of the book itserlf nd not soemthing that a querier is likely
to find interesting - if this must be considered the structure acts as barrier to information 
rather than enabling the information's delivery. Therefore, in many cases the exact location of a piece of information
is not as important as a more general location of x being in some way under y.

This may not always hold. A slightly contrived example might be if we were representing a model of partial
knowledge:

```xml
<people>
   <person>
      <name>
         <isNot><surname>Bond</surname></isNot>
      </name>
   </person>
</people>
```  
  
CSS. Meant for presentation of HTML, but where HTML markup is semantic it is a selector of the *meaning
of elements* for the sake of applying a meaningful presentation more so than a selector of arbitrary
colours and positions on a screen.
  
Unlike XML, in the model created by most general programming languages, there is no requirement for the
data to be tree shaped. Graph is ok. This make this slighlty harder but nontheless attempts have been made.

Linq. (CITEME) 
 

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


