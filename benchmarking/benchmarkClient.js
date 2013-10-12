
require('color');

var DB_URL = 'localhost:4444/db';  

function aggregateWithOboe() {

   var oboe = require('../dist/oboe-node.js');

/*   oboe('localhost:4444/item/2')
      .node('name', function(name){
         console.log(name)
      })
      .fail(function(e){
         console.log('there was an error', e);
      });

   return;*/

   console.log('making request to ', DB_URL);
   
   oboe(DB_URL)
      .node('{id url}', function(record){
                     
         /*console.log('will make ongoing request to', record.url);
                    
         // we have a record. Now get the item linked to:
         
         oboe(record.url).node('name', function(name){
         
            console.log(name);
            this.abort();                           
         }).error(function(e){
         
            console.log('error making request', record.url, e);            
         });*/
         
      })
      .fail(function(){
         console.log('error in db request', e);
      });
                 
   console.log('made request');      
}

function aggregateWithJsonParse() {
}

function aggregateWithClarinet() {
   var clarinet = require('clarinet');
}

var strategies = {
   oboe:       aggregateWithOboe,
   jsonParse:  aggregateWithJsonParse,
   clarinet:   aggregateWithClarinet
}

var strategyName = process.argv[2];

// use any of the above three strategies depending on a command line argument:
console.log('benchmarking strategy', strategyName);

strategies[strategyName]();

