module.exports = function (grunt) {

   grunt.initConfig({

      pkg:grunt.file.readJSON("package.json")
   ,  requirejs:{
         compile:{
            options:{
               optimize:'none',
               baseUrl:"src/main/", 
               out:"oboe.js", 
               name:"oboe"
            }
         }
      }
      
   ,  uglify: {
         build:{
            files:{
               'oboe.min.js': 'oboe.js'
            }
         }
      }

   });

   grunt.loadNpmTasks('grunt-contrib-requirejs');
   grunt.loadNpmTasks('grunt-contrib-uglify');   

   grunt.registerTask('build', ['requirejs']);
   grunt.registerTask('minify', ['uglify']);   
   grunt.registerTask('default', ['requirejs', 'uglify']);

};