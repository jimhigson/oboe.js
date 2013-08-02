module.exports = function (grunt) {

   grunt.initConfig({

      pkg:grunt.file.readJSON("package.json")
      
   ,  concat: {
         oboe:{         
            src: [
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
            ,  'src/browser-api.js'
            ],
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
         single: {
            configFile: 'test/unit.conf.js',
            singleRun: 'true',
            browsers: ['Chrome', 'Firefox']
         }
         
      }
      
      ,copy: {
         dist: {
            files: [
               {src: ['build/oboe.min.js'], dest: 'dist/oboe.min.js'}
            ,  {src: ['build/oboe.concat.js'], dest: 'dist/oboe.js'}
            ]
         }
      }      
      
    
      
   });

   grunt.loadNpmTasks('grunt-contrib-concat');
   grunt.loadNpmTasks('grunt-wrap');
   grunt.loadNpmTasks('grunt-contrib-uglify');   
   grunt.loadNpmTasks('grunt-karma');
   grunt.loadNpmTasks('grunt-contrib-copy');      

   grunt.registerTask('test',         ['karma:single']);
   grunt.registerTask('checksize',    ['micro:oboe_min']);
   grunt.registerTask('default',      [   'karma:single', 
                                          'concat:oboe', 
                                          'wrap:export', 
                                          'uglify',
                                          'copy:dist'
                                      //  micro isn't working: 
                                      //  'micro:oboe_min'
                                      ]);

};