module.exports = function(grunt) {

    const startTS = Date.now();

    grunt.initConfig({

        /**
         * This will load in our package.json file so we can have access
         * to the project name and appVersion number.
         */
        pkg: grunt.file.readJSON('package.json'),

        /**
         * A code block that will be added to our minified code files.
         * Gets the name and appVersion and other info from the above loaded 'package.json' file.
         * @example <%= banner.join("\\n") %>
         */
        banner: [
            '/*',
            '* Project: <%= pkg.name %>',
            '* Description: <%= pkg.description %>',
            '* Development By: <%= pkg.author %>',
            '* Copyright(c): <%= grunt.template.today("yyyy") %>',
            '* Version: <%= pkg.version %> (<%= grunt.template.today("dd-mm-yyyy hh:mm") %>)',
            '*/'
        ],

        /**
         * Prepends the banner above to the minified files.
         */
        usebanner: {
            options: {
                position: 'top',
                banner: '<%= banner.join("\\n") %>',
                linebreak: true
            },
            files: {
                src: [
                    'lib/main.min.js'
                ]
            }
        },

        /**
         * Browserify is used to support the latest version of javascript.
         * We also concat it while we're at it.
         * We only use Browserify for the mobile sites.
         */
        browserify: {
            options: {
                transform: [['babelify', {presets: ['es2015']}]]
            },
            lib: {
                src: 'src/**/*.js',
                dest: 'lib/main.js'
            }
        },

        /**
         * Do some javascript post processing, like minifying and removing comments.
         */
        uglify: {
            options: {
                position: 'top',
                linebreak: true,
                sourceMap: false,
                sourceMapIncludeSources: false,
                output: {
                    beautify: true,
                    comments: false
                },
                compress: {
                    sequences: false,
                    global_defs: {
                        DEBUG: false
                    }
                },
                warnings: false,
                mangle: true
            },
            lib: {
                src: 'lib/main.js',
                dest: 'lib/main.min.js'
            }
        },

        /**
         * Setup a simple watcher.
         */
        watch: {
            options: {
                spawn: false,
                debounceDelay: 250
            },
            scripts: {
                files: ['src/**/*.js'],
                tasks: ['browserify', 'uglify', 'duration']
            },
            html: {
                files: ['index.html']
            },
            grunt: {
                files: ['gruntfile.js']
            }
        },

        /**
         * Start browser sync, which setups a local node server based on the server root location.
         * This task helps with cross browser testing and general workflow.
         */
        browserSync: {
            bsFiles: {
                src: [
                    'lib/',
                    'index.html'
                ]
            },
            options: {
                server: './',
                watchTask: true,
                port: 3000
            }
        }
    });

    // General tasks.
    grunt.loadNpmTasks('grunt-browser-sync');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-banner');

    // Register tasks.
    grunt.registerTask('duration', 'Displays the duration of the grunt task up until this point.', function() {
        const date = new Date(Date.now() - startTS);
        let hh = date.getUTCHours();
        let mm = date.getUTCMinutes();
        let ss = date.getSeconds();
        if (hh < 10) {
            hh = "0" + hh;
        }
        if (mm < 10) {
            mm = "0" + mm;
        }
        if (ss < 10) {
            ss = "0" + ss;
        }
        console.log('Duration: ' + hh + ':' + mm + ':' + ss);
    });

    grunt.registerTask('sourcemaps', 'Build with sourcemaps', function() {
        grunt.config.set('uglify.options.sourceMap', true);
        grunt.config.set('uglify.options.sourceMapIncludeSources', true);
    });
    grunt.registerTask('default', 'Start BrowserSync and watch for any changes so we can do live updates while developing.', function() {
        const tasksArray = ['browserify', 'uglify', 'duration', 'sourcemaps', 'browserSync', 'watch'];
        grunt.task.run(tasksArray);
    });
    grunt.registerTask('build', 'Build and optimize the js.', function() {
        const tasksArray = ['browserify', 'uglify', 'usebanner', 'duration'];
        grunt.task.run(tasksArray);
    });
};
