
function workerEnv(){

   // The worker thread won't be able to see which domain the parent was on
   // so we add it in hardcoded into its code, see?

   var location = window.location,
       // the path '/base' is where Karma serves the js under test
       base = location.protocol + location.host + '/base',
       loader = stringifyFunctionForWorker(function(root){

          console.log('child thread: importing scripts from domain ' + root + ' ...');

          importScripts(
             root + '/src/functional.js'
          ,  root + '/src/util.js'
          ,  root + '/src/lists.js'
          ,  root + '/src/libs/clarinet.js'
          ,  root + '/src/ascentManager.js'
          ,  root + '/src/parseResponseHeaders.browser.js'
          ,  root + '/src/streamingHttp.browser.js'
          ,  root + '/src/jsonPathSyntax.js'
          ,  root + '/src/ascent.js'
          ,  root + '/src/incrementalContentBuilder.js'
          ,  root + '/src/jsonPath.js'
          ,  root + '/src/singleEventPubSub.js'
          ,  root + '/src/pubSub.js'
          ,  root + '/src/events.js'
          ,  root + '/src/patternAdapter.js'
          ,  root + '/src/instanceApi.js'
          ,  root + '/src/wire.js'
          ,  root + '/src/defaults.js'
          ,  root + '/src/publicApi.js'
          ,  root + '/src/interDimensionalPortal.js'
          );

          console.log('...importing scripts done');
       },
       base);

   return [loader];

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
}
