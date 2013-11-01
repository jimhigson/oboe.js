Appendix i: Limits to number of simultaneous connections under various http clients {#appendix_http_limits}
===================================================================================

  -------------------------------------
  http Client     connection limit per
                  server
  --------------- ---------------------
  Firefox         6

  Internet        4
  Explorer        

  Chrome /        32 sockets per proxy,
  Chromium        6 sockets per
                  destination host, 256
                  sockets per process
  -------------------------------------

https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest

http://msdn.microsoft.com/de-de/magazine/ee330731.aspx\#http11\_max\_con

http://dev.chromium.org/developers/design-documents/network-stack\#TOC-Connection-Management
