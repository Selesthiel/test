(function(){
    "use strict";
    module.exports = function(grunt){
        // Project configuration.
        grunt.initConfig({
            pkg: grunt.file.readJSON('package.json'),
            srcFiles: ["server/**/*.js", "tools/**/*.js"],
            "jsbeautifier": {
                "default": {
                    src: ["<%= srcFiles %>"]
                },
                "git-pre-commit": {
                    src: ["<%= srcFiles %>"],
                    options: {
                        mode: "VERIFY_ONLY"
                    }
                }
            },
            jshint: {
                files: ['Gruntfile.js', "<%= srcFiles %>"],
                options: {
                    // options here to override JSHint defaults
                    globals: {
                        jQuery: true,
                        console: true,
                        module: true,
                        document: true
                    }
                }
            },
            concat: {
                options: {
                    separator: ';'
                },
                dist: {
                    src: ["<%= srcFiles %>"],
                    dest: 'dist/<%= pkg.name %>.js'
                }
            },
            uglify: {
                options: {
                    banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
                },
                build: {
                    src: ["<%= srcFiles %>"],
                    dest: 'dist/<%= pkg.name %>.min.js'
                },
                dist: {
                    files: {
                        'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
                    }
                }
            },
            gitcommit: {
                commit: {
                    options: {
                        verbose: true
                    },
                    files: {
                        src: ["<%= srcFiles %>"]
                    }
                }
            },
            githooks: {
                all: {
                    'pre-commit': 'jsbeautifier jshint',

                    // Will bind the bower:install task
                    // with a specific template
                    'post-merge': {
                        taskNames: 'bower:install',
                        template: 'path/to/another/template'
                    }
                }
            },
            shell: {                                // Task
                listFolders: {                      // Target
                    options: {                      // Options
                        stderr: false
                    },
                    command: 'ls'
                },
                hello: {
                    command: function(){
                        return 'echo hello';
                    }
                },
                commit: {
                    command: "git commit -a -m '<%= commitMessage %>'"
                }
            }

        });

        // Load the grunt plugins
        grunt.loadNpmTasks('grunt-contrib-uglify');
        grunt.loadNpmTasks('grunt-contrib-concat');
        grunt.loadNpmTasks('grunt-contrib-jshint');
        grunt.loadNpmTasks('grunt-jsbeautifier');
        grunt.loadNpmTasks('grunt-githooks');
        grunt.loadNpmTasks('grunt-git');
        grunt.loadNpmTasks('grunt-shell');

        // Default task(s).
        //grunt.registerTask('default', ['jsbeautifier', 'jshint', 'concat', 'uglify']);
        grunt.registerTask('default', ['jsbeautifier', 'jshint']);

        grunt.registerTask('commit', 'Run git commit', function(commitMessage){
            if (commitMessage === undefined || commitMessage === ""){
                grunt.log.error('You forgot the commit message, moron.');
                grunt.log.writeln("[Usage] > grunt " + this.name + ":'This is your damn commit message here.'");
                return false;
            }
            grunt.config.set("commitMessage", commitMessage);
            grunt.task.run(['shell:commit']);
        });

        grunt.registerTask('foo', 'foo task', function(a, b){
            console.log(a);
        });

        grunt.registerTask('defaulta', 'D:API Server grunt options', function(a, b){
            var customTasks = [],
                prop,
                task;
            grunt.log.writeln(grunt.config('pkg.name') + ' Grunt Commands');
            grunt.log.writeln("Usage format> grunt task:arg1:arg2:arg*");

            for (prop in grunt.task._tasks){
                if (grunt.task._tasks.hasOwnProperty(prop) &&
                    grunt.task._tasks[prop].meta.info === "Gruntfile"){
                    task = grunt.task._tasks[prop];
                    grunt.log.writeln(stringify(task.nameArgs));
                }
            }
        });

        var stringify = function(obj){
            return JSON.stringify(obj, null, 4);
        };
    };
})();