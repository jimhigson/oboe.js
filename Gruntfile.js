module.exports = function (grunt) {

   var STREAM_SOURCE_PORT = 4567;

   // TODO: move files list to own file

/*   var TEST_LIBS = [
      'node_modules/karma-jstd-adapter/jstd-adapter.js'   
   ,  'test/libs/sinon.js'
   ,  'test/libs/sinon-ie.js'
   ,  'test/libs/*.js'   
   ]; */

   // NB: source files are order sensitive
   var OBOE_SOURCE_FILES = [
      'src/functional.js'                
   ,  'src/util.js'                    
   ,  'src/lists.js'                    
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
   ];
   
/*   var UNIT_TEST_CASES = [
      'test/cases/*.js'
   ];*/
   
  
   function allOf( /* file lists */ ) {
      var args = Array.prototype.slice.apply(arguments);
      
      return args.reduce(function(soFar, listFromArgments){
         return soFar.concat(listFromArgments);
      }, []);
   }

   grunt.initConfig({

      pkg:grunt.file.readJSON("package.json")
      
   ,  concat: {
         oboe:{         
            src: OBOE_SOURCE_FILES,
            dest: 'build/oboe.concat.js'
         }
      }
      
   ,  wrap: {
         browserPackage: {
            src: 'build/oboe.concat.js',
            dest: '.',
            wrapper: [
               '// this file is the concatenation of several js files. See https://github.com/jimhigson/oboe.js/tree/master/src ' +
                   'for the unconcatenated source\n' +
               // having a local undefined, window, Object etc allows slightly better minification:                    
               '(function  (window, Object, Array, Error, undefined ) {' 
            ,           '})(window, Object, Array, Error);'
            ]
         }
      }      
            
   ,  uglify: {
         build:{
            files:{
               'build/oboe.min.js': 'build/oboe.concat.js'
            }
         }
      }
      
   ,  karma: {
         options:{            
            singleRun: 'true',
            proxies: {
               '/stream'      : 'http://localhost:' + STREAM_SOURCE_PORT + '/stream',
               '/static/json' : 'http://localhost:' + STREAM_SOURCE_PORT + '/static/json'   
            }         
         }
         
      ,  
         'precaptured-dev': {
            // for doing a single test run with already captured browsers during development.
            // this is good for running tests in browsers karma can't easily start such as
            // IE running inside a Windows VM on a unix dev environment                
            browsers: [],     
            configFile: 'test/unit.conf.js',
            singleRun: 'true'            
         }
      ,
         'single-dev': {
            browsers: ['Chrome', 'Firefox', 'Safari'],
            configFile: 'test/unit.conf.js'
         }
      ,
         'single-concat': {
            browsers: ['Chrome', 'Firefox', 'Safari'],
            configFile: 'test/concat.conf.js'      
         }  
      ,  
         'single-minified': {
            browsers: ['Chrome', 'Firefox', 'Safari'],
            configFile: 'test/min.conf.js'
         }
         
      ,  
         'persist': {
            // for setting up a persistent karma server.
            // To start the server, the task is:
            //    karma:persist 
            // To run these, the task is: 
            //    karma:persist:run
            configFile: 'test/unit.conf.js',           
            browsers: [], 
            singleRun:false,
            background:true
         }   
      }
      
   ,  copy: {
         dist: {
            files: [
               {src: ['build/oboe.min.js'],    dest: 'dist/oboe.min.js'}
            ,  {src: ['build/oboe.concat.js'], dest: 'dist/oboe.js'    }
            ]
         }
      }      
      
   ,  exec:{
         // these might not go too well on Windows :-) - get Cygwin.
         reportMinifiedSize:{
            command: "echo Minified size is `wc -c < dist/oboe.min.js` bytes" 
         },
         reportMinifiedAndGzippedSize:{
            command: "echo Size after gzip is `gzip --stdout dist/oboe.min.js | wc -c` bytes"
         }
      }
      
   ,  watch:{
         karma:{
            files:['src/**/*.js', 'test/specs/*.spec.js'],
            tasks:['karma:persist:run']
         }
      }           
      
   });

   grunt.loadNpmTasks('grunt-contrib-concat');
   grunt.loadNpmTasks('grunt-wrap');
   grunt.loadNpmTasks('grunt-contrib-uglify');   
   grunt.loadNpmTasks('grunt-karma');
   grunt.loadNpmTasks('grunt-contrib-copy');      
   grunt.loadNpmTasks('grunt-contrib-watch');      
   grunt.loadNpmTasks('grunt-clear');      
   grunt.loadNpmTasks('grunt-exec');

   grunt.registerTask('start-stream-source', function () {
      require('./test/streamsource.js').startServer(grunt, STREAM_SOURCE_PORT);  
   });
   
   grunt.registerTask('test-start-server',   [
      'karma:persist'
   ]);
   
   grunt.registerTask('test-run',   [
      'karma:persist:run'
   ]);
   
   grunt.registerTask('test-auto-run',   [
      'karma:persist',
      'watch:karma'
   ]);      

   grunt.registerTask('dist-sizes',   [
      'exec:reportMinifiedSize',
      'exec:reportMinifiedAndGzippedSize'
   ]);
   
   // dev-test
   //
   // For one-off test runs while developing. Capture browsers first. Allows
   // to capture IE running in VM which would be tricky to set up starting
   // automatically though Karma   
   grunt.registerTask('dev-test',     [
      'clear',
      'start-stream-source',         
      'karma:precaptured-dev'
   ]);
   
   grunt.registerTask('default',      [
      'clear',   
      'start-stream-source',
      'karma:single-dev', 
      'concat:oboe', 
      'wrap:browserPackage', 
      'uglify',
      'copy:dist',
      'karma:single-concat',                                         
      'karma:single-minified',
      'dist-sizes'                                          
   ]);

};