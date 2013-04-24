
var PORT = 3000;
var http = require('http');

http.createServer(function (req, res) {

   queryString = require('querystring').parse(req.url);s

   res.write();
   
   res.end();   
 
}).listen(PORT, function() { 
   console.log('Server running on port ' + PORT);
});