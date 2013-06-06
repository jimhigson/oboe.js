require('colors');

var http = require('http'),
    httpProxy = require('http-proxy');

var proxy = new httpProxy.RoutingProxy();

var JSTD_PORT = 4224,
    STREAM_PORT = 4567;
PROXY_PORT = 2442;

console.log("jstd will be started on port".yellow, String(JSTD_PORT).blue,
    "but connect browsers via the proxy on port".yellow, String(PROXY_PORT).blue,
    "eg by going to".yellow, ("http://localhost:" + PROXY_PORT).blue, 'and clicking capture'.yellow,
    "\nThe proxy is necessary for asynchronous http testing which will fail otherwise".red);

console.log('creating proxy server on port'.yellow, String(PROXY_PORT).blue);

//console.log('routing table for proxy is'.yellow, JSON.stringify(proxyOptions.router).blue);

//
// Create a regular http server and proxy its handler
//
http.createServer(
    function (req, res) {
    
       var url = req.url,
           stream = (url.indexOf('/stream') === 0),
           destinationPort = stream ? STREAM_PORT : JSTD_PORT;

       console.log('proxy got request for'.yellow, url.blue, 
                    'will redirect to'.green, 'localhost:'.yellow, 
                     String(destinationPort)[stream? 'cyan' : 'magenta'].inverse );

       proxy.proxyRequest(req, res, {
          host:'localhost',
          port:destinationPort
       });

    }).listen(PROXY_PORT);


console.log('proxy started'.green, 'now capture some browsers!');