// how long to wait at start to give browser a chance to optimise scripts   
var initialWait = 500;
var progressAtOnce = 1024; // fire progress with this many bytes      
var numberOfRuns = 40;
var numberOfRecords = 100;            
var testName = numberOfRuns + ' big downloads';
var profile = true;        

function go(oboe){

   function generateTestJson(){
   
      var container = {
          "id": 1,
          "jsonrpc": "2.0",
          "total": 20000,
          "result": [] 
      };
   
      for (var i = 0; i < numberOfRecords; i++) {
         container.result.push({
            "id": i,
            "guid": "046447ee-da78-478c-b518-b612111942a5",
            "picture": "http://placehold.it/32x32",
            "age": i,
            "name": "Payton Murphy",
            "company": "Robotomic",
            "phone": "806-587-2379",
            "email": "payton@robotomic.com"               
         });
      }
      return JSON.stringify(container);
   }
   
   runTest( generateTestJson() );         
                           
   function runTest(content) {
           
      console.log('will start testing in', initialWait, '...');
            
      window.setTimeout( function() {
      
         profile && console.profile(testName);
         console.time(testName);
            
         perform(numberOfRuns);
      }, initialWait );         
   
      function perform(times){
       
         var idTotal = 0,
             ageTotal = 0,
             nodeCount = 0,
             instance;
                               
         instance = oboe()
            .node('!.$result..{age name company}', function(obj){
             
               nodeCount++;
               idTotal += obj.id;                   
            })
            .path('age', function(age){
   
               nodeCount++;                                 
               ageTotal += age;       
            })               
            .done(function(){
               if( nodeCount != 200 ) {
                  throw "wrong number of matches";
               }
                
               if( times == 0 ) {
                  profile && console.profileEnd(testName);            
                  console.timeEnd(testName);
               } else {
                  perform(times-1);
               }            
            }).fail(function(e){
               console.log('there was a failure' + JSON.stringify(e));
            });
                        
         // pass in a drip at a time            
         for(     var dripStart = 0, dripEnd = progressAtOnce; 
                  dripStart < content.length; 
                  dripStart += progressAtOnce, dripEnd += progressAtOnce ) {
                                       
            instance.emit( 'content', content.substring(dripStart, dripEnd));
         }               
      }
   }
}

if( typeof exports !== 'undefined' ) {
   module.exports = go;
}