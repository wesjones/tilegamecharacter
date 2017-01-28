module.exports = function (grunt) {

    // grunt.loadTasks('tasks');
    grunt.loadNpmTasks('hbjs');

    // Load grunt tasks automatically
    // require('load-grunt-tasks')(grunt);

    //loads the various task configuration files
    var configs = {
        compile: {
            game: {
                wrap: 'rpgc', // this is your global namespace
                name: "rpgc",
                filename: 'rpg-character',
                build: 'build',
                scripts: {
                    embedRequire: true,
                    ignorePatterns: false,
                    // inspect: ['src/**/**.js'],
                    src: ['src/**/*.js'], // search through all JS file in src src directory
                    // includes: ['src/gameBoard.js'],
                    import: ['character'], // what files should we import and compile
                    ignore: [],
                    report: 'verbose',
                    log: 'logs/rpg-character.log'
                }
            }
        },
        less: {
            game: {
                options: {
                    strictImports: true
                },
                files: {
                    'build/rpg-character.css': 'src/styles.less'
                }
            }
        }
    };
    grunt.initConfig(configs);
    grunt.loadNpmTasks('grunt-contrib-less');

    grunt.registerTask('default', ['compile', 'less']);

};