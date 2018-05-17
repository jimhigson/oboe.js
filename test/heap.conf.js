module.exports = function (config) {
  config.set({
    browsers: ['ChromeHeadlessMemory'],

    frameworks: ['jasmine'],

    // base path, that will be used to resolve files and exclude
    basePath: '..',

    // list of files / patterns to load in the browser
    files: [
      'test/libs/es5-shim.js',
      'test/libs/es5-sham.js',
      'test/libs/platform.js',
      'test/libs/testUrl.js',
      'dist/oboe-browser.min.js',

      'test/specs/oboe.heap.integration.spec.js'
    ],

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true,

    customLaunchers: {
      ChromeHeadlessMemory: {
        base: 'ChromeHeadless',
        flags: ['-enable-precise-memory-info']
      }
    },

    browserDisconnectTimeout: 30000,
    browserNoActivityTimeout: 30000
  })
}
