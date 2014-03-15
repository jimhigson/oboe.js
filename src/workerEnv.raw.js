

function workerEnv(){

   function importAll(base){

      console.log('child thread: importing scripts from domain ' + base + ' ...');

      importScripts(
         base + '/test/libs/sinon.js'
      ,  base + '/src/functional.js'
      ,  base + '/src/util.js'
      ,  base + '/src/lists.js'
      ,  base + '/src/libs/clarinet.js'
      ,  base + '/src/ascentManager.js'
      ,  base + '/src/parseResponseHeaders.browser.js'
      ,  base + '/src/streamingHttp.browser.js'
      ,  base + '/src/jsonPathSyntax.js'
      ,  base + '/src/ascent.js'
      ,  base + '/src/incrementalContentBuilder.js'
      ,  base + '/src/jsonPath.js'
      ,  base + '/src/singleEventPubSub.js'
      ,  base + '/src/pubSub.js'
      ,  base + '/src/events.js'
      ,  base + '/src/patternAdapter.js'
      ,  base + '/src/instanceApi.js'
      ,  base + '/src/wire.js'
      ,  base + '/src/defaults.js'
      ,  base + '/src/publicApi.js'
      ,  base + '/src/interDimensionalPortal.js'
      );

      console.log('...importing scripts done');
   }

   
   /**
    * Take a function like this:
    *
    *    function(a, b, c){
    *       doFoo(a, c);
    *       doBar(b, c);
    *    }
    *
    * return a string containing an immediately-executing version of that
    * function like this:
    *
    *    (function( a, b, c){
    *       doFoo(a, c);
    *       doBar(b, c);
    *    })( p1, p2, p3 )
    *
    */
   function stringifyFunctionForWorker(f, base){

      return '(' + String(f) + '("' + base + '"));';
   }

   // The worker thread won't be able to see which domain the parent was on
   // so we add it in hardcoded into its code, see?

   var location = window.location,
   // the path '/base' is where Karma serves the js under test
      base = location.protocol + location.host + '/base',
      loader = stringifyFunctionForWorker(importAll, base);

   return [loader];
}
