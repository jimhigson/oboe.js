/**   For testing asynchronous json downloading, here we have a tiny http server.
 *
 *    For every request (regardless f path) it responds with the json [0,1,2,3,4,5,6,7,8,9]
 *    but writing out each number one at a time.
 *
 *    You can start this server up and visit it in a browser to see the numbers stream in.
 */

require('colors');

var PORT = 4567;


function echoBackBody(req, res) {

   console.log('will just echo the same back'.green);

   req.on('readable', function () {
      var reqBody = req.read().toString();
      console.log('echoing back', reqBody.blue);
      res.write(reqBody);
   });

   req.on('end', function () {
      console.log('done echoing back'.green);
      res.end(req.body);
   });
}


function replyWithTenSlowNumbers(_req, res) {
   sendJsonHeaders(res);

   var NUMBER_INTERVAL = 250;
   var MAX_NUMBER = 9;
   
   console.log('slow number server: will write numbers 0 ..', String(MAX_NUMBER).blue, 'out as a json array at a rate of one per', String(NUMBER_INTERVAL).blue, 'ms');

   res.write('[\n');

   var curNumber = 0;

   var inervalId = setInterval(function () {

      res.write(String(curNumber));

      if (curNumber == MAX_NUMBER) {

         res.end(']');
         clearInterval(inervalId);
         console.log('slow number server: finished writing out'.green);
      } else {
         res.write(',\n');
      }

      curNumber++;

   }, NUMBER_INTERVAL);
}

function replyWithStaticJson(req, res) {
   sendJsonHeaders(res);
   
   var filename = req.url.replace('/static', '..');
   
   console.log('will respond with contents of file', filename.blue);
   
   require('fs').readFile(filename, 'utf8', function (err,data) {
      if (err) {
         console.log('could not read static file'.red, filename.blue);
         return;
      }
      
      res.end(data);
      
      console.log('read file'.green, filename.blue, 'ok'.green);
   });   
}

function sendJsonHeaders(res) {
   var JSON_MIME_TYPE = "application/octet-stream";
   res.setHeader("Content-Type", JSON_MIME_TYPE);
   res.writeHead(200);
}

function answerRequest(req, res) {
   console.log(   '\n----------\ngot',
                  req.method.blue, 
                  'request for url', req.url.yellow,
                   req.body? 'with body' + req.body : '');   

   var urlMappings = {
      '/stream/echoback': echoBackBody
   ,  '/static/json': replyWithStaticJson
   ,  '/stream/tenSlowNumbers': replyWithTenSlowNumbers   
   };
   
   var responder;
   
   for( var i in urlMappings ) {
      if( req.url.indexOf(i) == 0 ) {      
         responder = urlMappings[i];
         console.log( 'url starts with '.green, i.blue, 'so will reply using'.green, responder.name.blue);
         break;
      }
   }
   
   if( !responder ) {
      console.log("no mapping for".red, req.url.blue);
      return;
   }
    
   responder(req, res);

}

require('http').createServer().on('request', answerRequest).listen(PORT);

console.log('slow number server started on port'.green, String(PORT).blue);