

function defunctionise(f){

   return String(f)
      .replace(/^function\s*\(\s*\)\s*{/, '')
      .replace(/\s*}\s*$/, '');
}


var WORKER_ENV = [
   defunctionise(function(){

      // Note that /base is how Karma makes js under test available.
      // The unminified source is only ever loaded for testing via Karma.
      
      // TODO: this will break when not running locally
      
      console.log('child thread: importing scripts...');

      importScripts( 
         'http://localhost:9876/base/src/functional.js'
      ,  'http://localhost:9876/base/src/util.js'
      ,  'http://localhost:9876/base/src/lists.js' 
      ,  'http://localhost:9876/base/src/libs/clarinet.js'
      ,  'http://localhost:9876/base/src/ascentManager.js'
      ,  'http://localhost:9876/base/src/parseResponseHeaders.browser.js'
      ,  'http://localhost:9876/base/src/streamingHttp.browser.js'
      ,  'http://localhost:9876/base/src/jsonPathSyntax.js'
      ,  'http://localhost:9876/base/src/ascent.js'
      ,  'http://localhost:9876/base/src/incrementalContentBuilder.js'
      ,  'http://localhost:9876/base/src/jsonPath.js'
      ,  'http://localhost:9876/base/src/singleEventPubSub.js'
      ,  'http://localhost:9876/base/src/pubSub.js'
      ,  'http://localhost:9876/base/src/events.js'
      ,  'http://localhost:9876/base/src/patternAdapter.js'
      ,  'http://localhost:9876/base/src/instanceApi.js'
      ,  'http://localhost:9876/base/src/wire.js'
      ,  'http://localhost:9876/base/src/defaults.js'
      ,  'http://localhost:9876/base/src/publicApi.js'
      ,  'http://localhost:9876/base/src/interDimensionalPortal.js'
      );

      console.log('...importing scripts done');
   })
];
