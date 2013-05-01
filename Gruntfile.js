module.exports = function (grunt) {

   grunt.initConfig({

      pkg:grunt.file.readJSON("package.json")
      
   ,  concat: {
         oboe:{         
            src: [
               'src/main/libs/clarinet.js'
            ,  'src/main/util.js'               
            ,  'src/main/streamingXhr.js'
            ,  'src/main/jsonPath.js'
            ,  'src/main/oboe.js'
            ],
            dest: 'oboe.concat.js'
         }
      }
      
   ,  wrap: {
         export: {
            src: 'oboe.concat.js',
            dest: '.',
            wrapper: [
               '(function () {'
            ,  'window.oboe = oboe; })();'
            ]
         }
      }      
            
   ,  uglify: {
         build:{
            files:{
               'oboe.min.js': 'oboe.concat.js'
            }
         }
      }
      
   ,  jstestdriver: {

         options:{
            verbose:true
         }
      ,  files:{src:['src/test/jsTestDriver-dev.conf']}  
      }      

   });

   grunt.loadNpmTasks('grunt-contrib-concat');
   grunt.loadNpmTasks('grunt-wrap');
   grunt.loadNpmTasks('grunt-contrib-uglify');   
   grunt.loadNpmTasks('grunt-jstestdriver');   

   grunt.registerTask('devtest', ['jstestdriver']);
   grunt.registerTask('build', ['concat:oboe']);
   grunt.registerTask('minify', ['uglify']);   
   grunt.registerTask('default', ['concat:oboe', 'wrap:export', 'uglify']);

};