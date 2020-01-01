const path = require('path')

module.exports = function (config) {
  config.set({

    frameworks: ['es6-shim', 'jasmine'],

    // base path, that will be used to resolve files and exclude
    basePath: '..',

    // list of files / patterns to load in the browser
    files: [
      'test/test_index.js'
    ],

    preprocessors: {
      // add webpack as preprocessor
      'test/test_index.js': ['webpack']
    },

    webpack: {
      // karma watches the test entry points
      // (you don't need to specify the entry option)
      // webpack watches dependencies
      mode: 'development',

      // webpack configuration
      output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
        library: 'oboe'
      },

      resolve: {
        alias: {
          './defaults': path.resolve(__dirname, './mocks/defaults.js'),
          './wire': path.resolve(__dirname, './mocks/wire.js')
        }
      }
    },

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true
  })
}
