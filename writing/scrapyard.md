delivery methodology
--------------------

Because Kanban focusses on always having a potentially releasable
product, it mitigates problems which could otherwise lead to
non-delivery and allows the direction to be changed while the project is
in progress. For each unit of work (under Kanban, a card), an entire
vertical slice of planning, design, implementation and reflection must
be complete before going onto the next card. Alongside each software
feature, every written chapter will be expanded and refactored in much
the same way as the code. Just as for well designed software, the order
of implementation should not be apparent to a user, my plan is that the
written work should not feel disjointed for having been written
non-sequentially. I plan to manage the Kanban process using paper only,
with cards on a physical board.

node libraries
--------------

Node comes with very little built in (not even http) but relies on
libraries written in the language itself to do everything. Could
implement own http on top of sockets if wanted rather than using the
provided one.

components
----------

I have found that the problem decomposes nicely into loosely-coupled
components, each quite unconcerned with its neighbours. The component
boundaries have been drawn to give a maximum separation of concerns
whilst also allowing a high degree of certainly with regards to
correctness.

test
----

Conversely, automated testing allows us to write incomprehensible code
by making us into more powerful programmers, it is possible building up
layers of complexity one very small part at a time that we couldn't
write in a simple stage. Clarity \> cleverness but cleverness has its
place as well (introducing new concepts)

old proxy in front of jstd
--------------------------

Testing via node to give something to test against - slowserver. Proxy.
JSTD not up to task. Shows how useful node is as a 'network glue'. The
same as C was once described as a 'thin glue'
[http://www.catb.org/esr/writings/taoup/html/ch04s03.html]. Transparent
proxy is about 20 lines. Transparent enough to fool JSTD into thinking
it is connecting directly to its server.

testing real behaviours rather than implementation
--------------------------------------------------

A good test should be able to go unchanged as the source under test is
refactored. Indeed, the test will be how we know that the code under
test still works as intended. Experince tells me that testing that A
listens to B (ie that the controller wires the jsonbuilder up to
clarinet) produces the kind of test that 'follows the code arround' as it is edited
meaning that because it is testing implementation details rather than
behaviours, whenever the implementation is updated the tests have to be
updated too.

tdd and oo
----------

TDD fits well into an object pattern because the software is well
composed into separate parts. The objects are almost tangible in their
distinction as separate encapsulated entities.


![Diagram showing why list is more memory efficient - multiple handles
into same structure with different starts, contrast with same as an
array](images/placeholder)