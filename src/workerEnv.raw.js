
function workerEnv(){

   return [
      stringifyFunctionForWorker(function(root){
   
         console.log('child thread: importing scripts from domain ' + root);
   
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
      })
   ];

   /**
    * Take a function like this:
    *
    *    function(){
    *       doFoo();
    *       doBar();
    *    }
    *
    * return a string like this:
    *
    *       doFoo();
    *       doBar();
    *
    * @param {Function} f
    * @returns {String}
    */
   function stringifyFunctionForWorker(f){

      // The worker thread won't be able to see which domain the parent was on
      // so we add it in hardcoded into its code, see?

      // Note that /base is how Karma makes js under test available.

      var location = window.location,
         base = location.protocol + location.host + '/base';

      return '(' + String(f) + '("' + base + '"));';
   }
}
