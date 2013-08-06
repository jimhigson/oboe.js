module.exports = function (grunt) {

   // TODO: move files list to own file

   var TEST_LIBS = [
      'node_modules/karma-jstd-adapter/jstd-adapter.js'   
   ,  'test/libs/sinon.js'
   ,  'test/libs/sinon-ie.js'
   ,  'test/libs/*.js'   
   ];

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
   
   var UNIT_TEST_CASES = [
      'test/cases/*.js'
   ];
   
  
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
         export: {
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
            browsers: ['Chrome', 'Firefox', 'Safari'],
            singleRun: 'true'         
         },
   
         'single-dev': {
            configFile: 'test/unit.conf.js'
         }
         
      ,  'single-concat': {
            configFile: 'test/concat.conf.js'      
         }
         
      ,  'single-minified': {
            configFile: 'test/min.conf.js'
         }                  

      }
      
   ,  copy: {
         dist: {
            files: [
               {src: ['build/oboe.min.js'], dest: 'dist/oboe.min.js'}
            ,  {src: ['build/oboe.concat.js'], dest: 'dist/oboe.js'}
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
      
   });

   grunt.loadNpmTasks('grunt-contrib-concat');
   grunt.loadNpmTasks('grunt-wrap');
   grunt.loadNpmTasks('grunt-contrib-uglify');   
   grunt.loadNpmTasks('grunt-karma');
   grunt.loadNpmTasks('grunt-contrib-copy');      
   grunt.loadNpmTasks('grunt-clear');      
   grunt.loadNpmTasks('grunt-exec');

   grunt.registerTask('start-stream-source', function () {
   
      require('./test/streamsource.js').startServer(grunt);
   
   });

   //grunt.registerTask('checksize',    ['micro:oboe_min']);

   grunt.registerTask('dist-sizes',   [
                                          'exec:reportMinifiedSize',
                                          'exec:reportMinifiedAndGzippedSize'
                                      ]);

   grunt.registerTask('dev-test',     [
                                          'clear',
                                          'start-stream-source',         
                                          'karma:single-dev'
                                      ]);
   grunt.registerTask('default',      [
                                          'clear',   
                                          'start-stream-source',
                                          'karma:single-dev', 
                                          'concat:oboe', 
                                          'wrap:export', 
                                          'uglify',
                                          'copy:dist',
                                          'karma:single-concat',                                         
                                          'karma:single-minified',
                                          'dist-sizes'                                          
                                      //  micro isn't working: 
                                      //  'micro:oboe_min'
                                      ]);

};