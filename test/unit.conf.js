// Karma configuration
// Generated on Fri Aug 02 2013 11:55:39 GMT+0100 (BST)

// base path, that will be used to resolve files and exclude
basePath = '..';

// list of files / patterns to load in the browser
files = [
   'node_modules/karma-jstd-adapter/jstd-adapter.js'
,  'test/libs/failureAdaptor.js'
  
,  'src/functional.js'
,  'src/util.js'
,  'src/lists.js' 
,  'test/libs/sinon.js'
,  'test/libs/sinon-ie.js'
,  'test/libs/*.js'
,  'src/libs/polyfills.js'
,  'src/libs/clarinet.js'
,  'src/streamingXhr.js'
,  'src/jsonPathSyntax.js'
,  'src/incrementalContentBuilder.js'
,  'src/jsonPath.js'
,  'src/pubsub.js' 
,  'src/instanceApi.js' 
,  'src/controller.js'
,  'src/browserApi.js'
  
,  'test/cases/*.js'
];


// list of files to exclude
exclude = [];


// test results reporter to use
// possible values: 'dots', 'progress', 'junit'
reporters = ['progress'];


// enable / disable colors in the output (reporters and logs)
colors = true;


// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_INFO;


// enable / disable watching file and executing tests whenever any file changes
autoWatch = true;


// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari (only Mac)
// - PhantomJS
// - IE (only Windows)
browsers = ['Chrome'];


// If browser does not capture in given timeout [ms], kill it
captureTimeout = 60000;


// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = true;

proxies = {
   '/stream'      : 'http://localhost:4567/stream',
   '/static/json' : 'http://localhost:4567/static/json'   
};
