
var PORT = 3000;

var express = require('express');

var app = express();

app.listen(PORT);
app.get('/slow/:file/:speed', function (req, res) {

   var fileName = req.params.file;
   
   switch( fileName ) {
      case 'modularPageExampleData':
         break;
      default:
         res.send(500, 'no such file');
         return;
   }
   
   var filePath = '../website/data/' + fileName + '.js';
      
   var speed = parseInt( req.params.speed );      

   //res.send('I will try to read ' + filePath + ' and output it at something like ' + speed);

   require('fs').readFile(filePath, 'utf8', function (err, data) {
      if (err) throw err;
      
      //res.send(data);
      //res.write('a');
      res.send('b');
   });

   /*var body = 'Hello World';
   res.setHeader('Content-Type', 'text/plain');
   res.setHeader('Content-Length', body.length);

   res.end(body); */
});