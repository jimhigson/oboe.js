module.exports = function (grunt) {

   grunt.initConfig({

      pkg:grunt.file.readJSON("package.json")
   ,  requirejs:{
         compile:{
            options:{
               baseUrl:"src/main/", out:"progressive.min.js", name:"progressive"
            }
         }
      }

   /* bah, grunt-markdown doesn't support v0.4!
   ,  markdown: {
         all:{
            files:['*.md']
         ,  dest : 'html'
         }
      } */
   });

   grunt.loadNpmTasks('grunt-contrib-requirejs');
   //grunt.loadNpmTasks('grunt-markdown');

   grunt.registerTask('build', ['requirejs']);
   grunt.registerTask('default', ['requirejs']);

 //grunt.registerTask('htlmreadme', ['markdown:readme']);
};