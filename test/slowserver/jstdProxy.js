require('colors');

var JSTD_PORT = 4224,
    STREAM_PORT = 4567;
    PROXY_PORT = 2442;

var proxyOptions = {
        router: {
          'localhost/stream': '127.0.0.1:' + STREAM_PORT,
          'localhost/':       '127.0.0.1:' + JSTD_PORT
        }
};

console.log("jstd will be started on port".yellow, String(JSTD_PORT).blue,
             "but connect browsers via the proxy on port".yellow, String(PROXY_PORT).blue,
             "eg by going to".yellow, ("http://localhost:" + PROXY_PORT).blue, 'and clicking capture'.yellow,
             "\nThe proxy is necessary for asynchronous http testing which will fail otherwise".red );
             
console.log('creating proxy server on port'.yellow, String(PROXY_PORT).blue);
console.log('routing table for proxy is'.yellow, JSON.stringify(proxyOptions.router).blue);

require('http-proxy').createServer(proxyOptions).listen(PROXY_PORT);

console.log('proxy started'.green, 'now capture some browsers!');