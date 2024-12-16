/*
This file in the main entry point for defining grunt tasks and using grunt plugins.
Click here to learn more. https://go.microsoft.com/fwlink/?LinkID=513275&clcid=0x409
*/
module.exports = function (grunt) {
    grunt.initConfig({
        // Task configuration.
        uglify: {
            options: {
                sourceMap: false
            },
            dynamic_mappings: {
                files: [
                    //{
                    //    expand: true,
                    //    cwd: 'js/src/',
                    //    src: ['**/*.js'],
                    //    dest: 'js/build/',
                    //    ext: '.min.js',
                    //    extDot: 'first'
                    //},
                    //{
                    //    src: 'js/faceitConsApp.js',
                    //    dest: 'js/faceitConsApp.min.js'
                    //},
                    //{
                    //    src: 'js/consmain.js',
                    //    dest: 'js/consmain.min.js'
                    //}
                    {
                        src: 'js/src/controllers/session/sessionController.js',
                        dest: 'js/build/controllers/session/sessionController.min.js'
                    }
                ]
            }
        }
        
    });
    
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask('default', ['uglify']);
};