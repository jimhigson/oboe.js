Appendix i: Limits to number of simultaneous connections under various http clients
===================================================================================  

  -----------------------------------------------------------------------
  http Client     connection limit per               source
                  server               
  --------------- -------------------- ----------------------------------
  Firefox         6                    https://developer.mozilla.org/en-U
                                                       S
                                         / d ocs/Web/API/XMLHttpRequest

  Internet        4                    http://msdn.microsoft.com/de-de/ma
  Explorer                                             g
                                                      a z
                                       ine/ee330731.aspx\#http11\_max\_co
                                                       n

  Chrome /        32 sockets per proxy http://dev.chromium.org/developers
  Chromium        6 sockets per                        /
                  destination host 256         design-documents
                  sockets per process        /network-stack\#TOC- C
                                              onnection-Management
  -----------------------------------------------------------------------

