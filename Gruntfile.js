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
            dest: 'dist/oboe.concat.js'
         }
      }
      
   ,  wrap: {
         export: {
            src: 'dist/oboe.concat.js',
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
               'dist/oboe.min.js': 'dist/oboe.concat.js'
            }
         }
      }
      
   ,  jstestdriver: {

         options:{
            verbose:true
         }
      ,  files:{src:['test/jsTestDriver-dev.conf']}  
      }      

   });

   grunt.loadNpmTasks('grunt-contrib-concat');
   grunt.loadNpmTasks('grunt-wrap');
   grunt.loadNpmTasks('grunt-contrib-uglify');   
   grunt.loadNpmTasks('grunt-karma');   

   grunt.registerTask('devtest', ['jstestdriver']);
   grunt.registerTask('build', ['concat:oboe']);
   grunt.registerTask('minify', ['uglify']);   
   grunt.registerTask('default', ['concat:oboe', 'wrap:export', 'uglify']);

};