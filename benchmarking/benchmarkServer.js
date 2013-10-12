/**   
 */

"use strict";

var PORT = 4444;

function sendJsonHeaders(res) {
   var JSON_MIME_TYPE = "application/octet-stream";
   res.setHeader("Content-Type", JSON_MIME_TYPE);
   res.writeHead(200);
}

function serveItemList(_req, res) {

   var NUMBER_INTERVAL = 10;
   var NUMBER_OF_RECORDS = 20;

   console.log('slow number server: send simulated database data');

   res.write('{"data": [');

   var i = 0;

   var inervalId = setInterval(function () {

      res.write(JSON.stringify({
         "id": i,
         "url": "localhost:4444/item/" + i         
      }));
      
      if (i == NUMBER_OF_RECORDS) {

         res.end(']}');
         
         clearInterval(inervalId);
         
         console.log('db server: finished writing to stream');
      } else {
         res.write(',');
      }
           
      
      i++;  

   }, NUMBER_INTERVAL);
}

function serveItem(req, res){

   var id = req.params.id;
   
   console.log('will output fake record with id', id);     

   // the items served are all the same except for the id field.
   // this is realistic looking but randomly generated object fro
   // <project>/test/json/oneHundredrecords.json   
   res.end(JSON.stringify({
      "id" : id,
      "url": "localhost:4444/item/" + id,      
      "guid": "046447ee-da78-478c-b518-b612111942a5",
      "picture": "http://placehold.it/32x32",
      "age": 37,
      "name": "Humanoid robot number " + id,
      "company": "Robotomic",
      "phone": "806-587-2379",
      "email": "payton@robotomic.com"
   }));
   
   console.log('output fake record');
}

function routing() {
   var Router = require('node-simple-router'),
       router = Router();

   router.get( '/db',         serveItemList);
   router.get( '/item/:id',   serveItem);
   
   return router;
}
      
var server = require('http').createServer(routing()).listen(PORT);

console.log('Benchmark server started on port', String(PORT));
