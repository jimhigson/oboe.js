module.exports = function(config) {
   config.set({

      frameworks:['jasmine'],
   
      // base path, that will be used to resolve files and exclude
      basePath : '..',
      
      // list of files / patterns to load in the browser
      files : [           
         'src/libs/polyfills.js'        
      ,  'src/functional.js'
      ,  'src/util.js'
      ,  'src/lists.js' 
      ,  'test/libs/sinon.js'
      ,  'test/libs/sinon-ie.js'
      ,  'test/libs/*.js'
      ,  'src/libs/clarinet.js'
      ,  'src/streamingXhr.js'
      ,  'src/jsonPathSyntax.js'
      ,  'src/incrementalContentBuilder.js'
      ,  'src/jsonPath.js'
      ,  'src/pubsub.js' 
      ,  'src/instanceApi.js' 
      ,  'src/controller.js'
      ,  'src/browserApi.js'
        
      ,  'test/specs/*.spec.js'
      ],
      
      
      // list of files to exclude
      exclude : [],
      
      browsers: [],
      
      // test results reporter to use
      // possible values: 'dots', 'progress', 'junit'
      reporters : ['progress'],
      
      
      // enable / disable colors in the output (reporters and logs)
      colors : true,
      
      
      // level of logging
      // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
      logLevel : config.LOG_INFO,
      
      
      // enable / disable watching file and executing tests whenever any file changes
      autoWatch : false,
      
      // If browser does not capture in given timeout [ms], kill it
      captureTimeout : 60000,
      
      // Continuous Integration mode
      // if true, it capture browsers, run tests and exit
      singleRun : true
  });
};
