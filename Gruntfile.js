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
            shell: {
                commit: {
                    command: function(commitMessage){
                        return "git commit -a -m '" + commitMessage + "'";
                    }
                },
                currentBranch: {
                    command: "git branch",
                    options: {
                        stdout: true,
                        callback:
                            function(err, stdout, stderr, cb) {
                                if (err){
                                    grunt.log.error(this.data.command);
                                    grunt.fail.warn(stderr);
                                }
                                var regex = /\*\s(\S+)/g;
                                var match = regex.exec(stdout);
                                grunt.config.set("startBranch", match[1]);
                                grunt.config.set("currentBranch", match[1]);
                                grunt.log.writeln("start branch: " + match[1]);
                                cb();
                            }
                    }
                },
                checkout: {
                    command: function(branch){
                        return "git checkout " + branch;
                    },
                options: {
                        stdout: true,
                        stderr: false,
                        callback:
                            function(err, stdout, stderr, callback) {
                                if (err){
                                    grunt.log.error(this.data.command);
                                    grunt.fail.warn(stderr);
                                }
                                callback();
                            }
                    }
                },
                merge: {
                    command: function(branch){
                        return "git merge " + branch;
                    },
                    options: {
                        stdout: true,
                        stderr: false,
                        callback:
                            function(err, stdout, stderr, callback) {
                                if (err){
                                    grunt.log.error(this.data.command);
                                    grunt.fail.warn(stderr);
                                }
                                callback();
                            }
                    }
                },
                pull: {
                    command: function(branch){
                        grunt.log.writeln("git pull origin " + branch);
                        return "git pull origin " + branch;
                    },
                    options: {
                        stdout: true,
                        stderr: false,
                        callback:
                            function(err, stdout, stderr, callback) {
                                if (err){
                                    grunt.log.error(this.data.command);
                                    grunt.fail.warn(stderr);
                                }
                                callback();
                            }
                    }
                },
                push: {
                    command: function(branch){
                        return "git push origin " + branch;
                    },
                    options: {
                        stdout: true,
                        stderr: false,
                        callback:
                            function(err, stdout, stderr, callback) {
                                if (err){
                                    grunt.log.error(this.data.command);
                                    grunt.fail.warn(stderr);
                                }
                                callback();
                            }
                    }
                }
            }

        });

        // Load the grunt plugins
        grunt.loadNpmTasks('grunt-contrib-uglify');
        grunt.loadNpmTasks('grunt-contrib-concat');
        grunt.loadNpmTasks('grunt-contrib-jshint');
        grunt.loadNpmTasks('grunt-jsbeautifier');
        grunt.loadNpmTasks('grunt-githooks');
        grunt.loadNpmTasks('grunt-shell');

        // Custom tasks
        grunt.registerTask('default', ['jsbeautifier', 'jshint']);

        grunt.registerTask('commit', '', function(commitMessage){
            if (commitMessage === undefined || commitMessage === ""){
                grunt.log.error('You forgot the commit message, moron.');
                grunt.log.writeln("[Usage] > grunt " + this.name + ":'This is your damn commit message here.'");
                return false;
            }
            grunt.task.run(['jsbeautifier', 'jshint', 'shell:commit:' + commitMessage]);
        });


        grunt.registerTask('build', 'Deploy to target branch', function(targetBranch){
            if (targetBranch === undefined || targetBranch === ""){
                grunt.log.writeln("[Usage] > grunt " + this.name + ":branchName");
                grunt.fail.warn('You forgot the target branch, moron.');
                return false;
            }
            grunt.config.set('targetBranch', targetBranch);
            grunt.task.run(['shell:currentBranch']);
            grunt.task.run(['deploy']);
        });

        grunt.registerTask('deploy', 'Deploy to target branch', function(){
            // Pull any changes to the starting branch from origin
            grunt.task.run(['shell:pull:' + grunt.config.get('startBranch')]);

            // Switch to the target branch
            grunt.task.run(['shell:checkout:' + grunt.config.get('targetBranch')]);

            // Pull the target branch from origin
            grunt.task.run(['shell:pull:' + grunt.config.get('targetBranch')]);

            // Merge our changes into the target branch
            grunt.task.run(['shell:merge:' + grunt.config.get('startBranch')]);

            // Push the changes to the target branch to origin
            grunt.task.run(['shell:push:' + grunt.config.get('targetBranch')]);

            // Switch to the starting branch
            grunt.task.run(['shell:checkout:' + grunt.config.get('startBranch')]);

            // Merge our changes back into the starting branch
            grunt.task.run(['shell:merge:' + grunt.config.get('targetBranch')]);

            // Push the changes to the target branch to origin
            grunt.task.run(['shell:push:' + grunt.config.get('startBranch')]);

        });

        var stringify = function(obj){
            return JSON.stringify(obj, null, 4);
        };
    };
})();


