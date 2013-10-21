/**   For testing asynchronous json downloading, here we have a tiny http server.
 *
 *    For every request (regardless f path) it responds with the json [0,1,2,3,4,5,6,7,8,9]
 *    but writing out each number one at a time.
 *
 *    You can start this server up and visit it in a browser to see the numbers stream in.
 */

require('color');

function startServer( port, grunt ) {

   "use strict";

   var JSON_MIME_TYPE = "application/octet-stream";   
   var verboseLog = grunt? grunt.verbose.ok : console.log,
       errorLog = grunt? grunt.log.error : console.error;

   function echoBackBody(req, res) {
   
      // no need to wait for readable or end events on req because
      // node-simple-router has already waited in the middleware
      verboseLog('will just echo the same back\n');   
      res.end(JSON.stringify(req.body));
   }
   
   function echoBackHeaders(req, res) {
      res.end(JSON.stringify(req.headers));
   }
   
   function replyWithTenSlowNumbers(_req, res) {
      sendJsonHeaders(res);
   
      var NUMBER_INTERVAL = 250;
      var MAX_NUMBER = 9;

      verboseLog( 
         'slow number server: will write numbers 0 ..' + 
         String(MAX_NUMBER).blue + 
         ' out as a json array at a rate of one per', 
         String(NUMBER_INTERVAL).blue + 'ms'
      );
   
      res.write('[\n');
   
      var curNumber = 0;
   
      var inervalId = setInterval(function () {
   
         res.write(String(curNumber));
   
         if (curNumber == MAX_NUMBER) {
   
            res.end(']');
            clearInterval(inervalId);
            verboseLog('slow number server: finished writing out');
         } else {
            res.write(',\n');
            curNumber++;
         }  
   
      }, NUMBER_INTERVAL);
   }
   
   function replyWithStaticJson(req, res) {
      sendJsonHeaders(res);
      
      if( !req.url ) {
         throw new Error('no url given');
      }
      
      var filename = 'test/json/' + req.params.name + '.json';
      
      verboseLog('will respond with contents of file ' + filename);
      
      require('fs').readFile(filename, 'utf8', function (err,data) {
         if (err) {
            errorLog('could not read static file ' + filename + 
             ' ' + err);
            return;
         }
         
         res.end(data);
         
         verboseLog('read file ' + filename.blue);
      });   
   }
   
   function sendJsonHeaders(res) {

      res.setHeader("Content-Type", JSON_MIME_TYPE);
      res.writeHead(200);
   }
   
   function twoHundredItems(_req, res) {
   
      var TIME_BETWEEN_RECORDS = 40;
      // 80 records but only every other one has a URL:
      var NUMBER_OF_RECORDS = 200;
      
      res.write('{"data": [');
   
      var i = 0;
   
      var inervalId = setInterval(function () {
   
            res.write(JSON.stringify({
               "id": i,
               "url": "http://localhost:4444/item/" + i,
               // let's get some entropy in here for gzip:
               "number1": Math.random(),  
               "number2": Math.random(),  
               "number3": Math.random(),  
               "number4": Math.random()  
            }));
         
         if (i == NUMBER_OF_RECORDS) {
   
            res.end(']}');
            
            clearInterval(inervalId);
            
            console.log('db server: finished writing to stream');
         } else {
            res.write(',');
         }
         
         i++;  
   
      }, TIME_BETWEEN_RECORDS);
   }   
   
   function replyWithTenSlowNumbersGzipped(req, serverResponse){
   
      // request out non-gzipped stream and re-serve gzipped
      require('http').get({  
                        host: 'localhost',
                        path: '/twoHundredItems',
                        port: port })
      .on('response', function(clientResponse){
      
         var zlib = require('zlib');
                        
         //res.writeHead(200, { 'content-encoding': 'gzip' });
         
         serverResponse.setHeader("content-type", JSON_MIME_TYPE);
         serverResponse.setHeader("content-encoding", 'gzip');
         serverResponse.writeHead(200);      
         
         clientResponse.pipe(zlib.createGzip({
            flush: zlib.Z_SYNC_FLUSH
         })).pipe(serverResponse);
         
       });
   }   
   
   function routing() {
      var Router = require('node-simple-router'),
          router = Router();

      router.get(    '/echoBackBody',              function(req, res){ res.end("POST here, don't GET")});
      router.post(   '/echoBackBody',              echoBackBody);
      router.put(    '/echoBackBody',              echoBackBody);
      router.patch(  '/echoBackBody',              echoBackBody);
      router.get(    '/echoBackHeaders',           echoBackHeaders);
      router.get(    '/static/json/:name.json',    replyWithStaticJson);
      router.get(    '/tenSlowNumbers',            replyWithTenSlowNumbers);
      router.get(    '/twoHundredItems',           twoHundredItems);
      router.get(    '/gzippedTwoHundredItems',    replyWithTenSlowNumbersGzipped);

      return router;
   }
         
   var server = require('http').createServer(routing()).listen(port);
   
   verboseLog('streaming source server started on port'.green, String(port).blue);

   return server;        
}


function exportApi(){

   var server;

   module.exports.start = function(port, grunt){
      server = startServer(port, grunt);          
   };   
   module.exports.stop = function(){
      server.close();
   };
}

exportApi();
