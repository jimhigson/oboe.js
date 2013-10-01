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