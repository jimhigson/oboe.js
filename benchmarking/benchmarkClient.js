
require('color');

var DB_URL = 'localhost:4444/db';  

function oboeReqInner(record) {

   var oboe = require('../dist/oboe-node.js');

   var url = record.url;
                       
   console.log('will make inner request to', url);
              
   // we have a record. Now get the item linked to:
   
   try {
   
      oboe(url).node('name', function(name){
      
         console.log(name);
         //this.abort();                           
      }).fail(function(e){
      
         console.log('error making request', url, e);            
      });
      
   } catch(e){
      console.log('!--- unpected error', e);
   }
      
}

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
      .node('{id url}', oboeReqInner)
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

