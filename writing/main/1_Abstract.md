Abstract
========

A project which incorporates techniques including progressive parsing
and http streaming to the programming of REST clients, with the aim of a
significant improvement in performance, fault tolerance and encouraging
a greater degree of loose coupling between systems. Particularly, loose
coupling is considered in light of the application of Agile
methodologies to SOA, under which resources can be expected to change as
programs are constantly refactored. A study is made of a real-world
situation in which SOA is used extensively to create many small systems
but problems arise from a tight coupling to versions encouraged by the
programmer's chosen tool set.

Performance is considered dually: in terms of an increasing the
perceived responsiveness to programs presenting an interactive
interface, and also the absolute completion time for a task undertaken
by a system which connects to rest resources for data.

A critique is made of imperative methods under which items of interest
are programmatically extracted from a resource once retrieved. Following
from this critique, a declarative alternative is presented under which
the identification of items of interest is possible prior to a resource
having been retrieved in its entirety. The declarative syntax is
integrated into a javascript framework which ties this method of
identification into a wider scheme of object detection within streaming
resources.
