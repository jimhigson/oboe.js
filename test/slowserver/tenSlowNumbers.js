/**   For testing asynchronous json downloading, here we have a tiny http server.
 * 
 *    For every request (regardless f path) it responds with the json [0,1,2,3,4,5,6,7,8,9]
 *    but writing out each number one at a time.
 *    
 *    You can start this server up and visit it in a browser to see the numbers stream in.
 */

require('colors');

var PORT = 4567;
var numberInterval = 250;
var maxNumber = 9;

function writeTenNumbersAsJson(req, res) {
   console.log('got', req.method.blue , 'request with body', req.body);

   if( req.method == 'POST' ) {
   
      // if we get a POST, this service just acts as an echo:
      console.log('will just echo the same back'.green);      

      req.on('readable', function() {
         var reqBody = req.read().toString();
         console.log('echoing back', reqBody.blue);
         res.write(reqBody);      
      });
   
      req.on('end', function() {
         console.log('done echoing back'.green);      
         res.end(req.body);      
      });
   
   } else {

      // otherwise, write ten numbers out slowly:
      console.log('slow number server: will write numbers 0 ..', String(maxNumber).blue, 'out as a json array at a rate of one per', String(numberInterval).blue, 'ms');
   
      var JSON_MIME_TYPE = "application/octet-stream";
      res.setHeader("Content-Type", JSON_MIME_TYPE);
      res.writeHead(200);
   
      res.write('[\n');
   
      var curNumber = 0;
      
      var inervalId = setInterval(function () {
      
         res.write(String(curNumber));
      
         if( curNumber == maxNumber ) {
               
            res.end(']');
            clearInterval(inervalId);
            console.log('slow number server: finished writing out'.green);        
         } else {      
            res.write(',\n');         
         }
         
         curNumber++;
      
      }, numberInterval);      
   }

}

require('http').createServer().on('request', writeTenNumbersAsJson).listen(PORT);

console.log('slow number server started on port'.green, String(PORT).blue);