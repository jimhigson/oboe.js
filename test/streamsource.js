/**   For testing asynchronous json downloading, here we have a tiny http server.
 *
 *    For every request (regardless f path) it responds with the json [0,1,2,3,4,5,6,7,8,9]
 *    but writing out each number one at a time.
 *
 *    You can start this server up and visit it in a browser to see the numbers stream in.
 */

require('color');

function startServer( grunt, port ) {

   function echoBackBody(req, res) {
   
      grunt.verbose.ok('will just echo the same back');
   
      req.on('readable', function () {
         var reqBody = req.read().toString();
         grunt.verbose.ok('echoing back ' + reqBody.blue);
         res.write(reqBody);
      });
   
      req.on('end', function () {
         grunt.verbose.ok('done echoing back');
         res.end(req.body);
      });
   }
   
   function replyWithTenSlowNumbers(_req, res) {
      sendJsonHeaders(res);
   
      var NUMBER_INTERVAL = 250;
      var MAX_NUMBER = 9;
      
      grunt.verbose.ok(
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
            grunt.verbose.writeln('slow number server: finished writing out');
         } else {
            res.write(',\n');
         }
   
         curNumber++;
   
      }, NUMBER_INTERVAL);
   }
   
   function replyWithStaticJson(req, res) {
      sendJsonHeaders(res);
      
      var filename = req.url.replace('/static', 'test');
      
      grunt.verbose.ok('will respond with contents of file ' + filename.blue);
      
      require('fs').readFile(filename, 'utf8', function (err,data) {
         if (err) {
            grunt.log.error('could not read static file ' + filename.red);
            return;
         }
         
         res.end(data);
         
         grunt.verbose.ok('read file ' + filename.blue);
      });   
   }
   
   function sendJsonHeaders(res) {
      var JSON_MIME_TYPE = "application/octet-stream";
      res.setHeader("Content-Type", JSON_MIME_TYPE);
      res.writeHead(200);
   }
   
   function answerRequest(req, res) {
   
      grunt.verbose.ok(
         'got ' + req.method.blue + ' request for url ' + req.url.blue + 
            (req.body? ' with body ' + req.body : '')
      );   
   
      var urlMappings = {
         '/stream/echoback': echoBackBody
      ,  '/static/json': replyWithStaticJson
      ,  '/stream/tenSlowNumbers': replyWithTenSlowNumbers   
      };
      
      var responder;
      
      for( var i in urlMappings ) {
         if( req.url.indexOf(i) == 0 ) {      
            responder = urlMappings[i];
            grunt.verbose.ok( 'url starts with ' + i.blue + ' so will reply using ' + responder.name.blue);
            break;
         }
      }
      
      if( !responder ) {
         grunt.log.error("no mapping for url " + req.url.red);
         return;
      }
       
      responder(req, res);
   }

   require('http')
      .createServer(answerRequest)
      .listen(port);
      
   grunt.log.writeln('streaming server started on port'.green, String(port).blue);
}

module.exports.startServer = startServer;

