module.exports = function(grunt) {
	var pkg = grunt.file.readJSON("package.json");
	grunt.initConfig({
		browserSync: {
			server : {
				bsFiles: {
					src : ['**/*.html'  ,'build/css/**/*.css', 'build/js/**/*.js']
				},
				options: {
					server: {
						baseDir: "./"
					},
					watchTask: true
				}
			},
			proxy : {
				bsFiles: {
					src : ['**/*.html'  ,'build/css/**/*.css', 'build/js/**/*.js']
				},
				options: {
					proxy : "localhost:5630",
					watchTask: true
				}
			}
		},
		less : {
			development : {
				options: {
					paths: ["src/css"],
					ieCompat : true
				},
				files: [{
					expand : true,
					cwd : "src/css/",
					src : "**/*.less",
					dest : "build/css",
					ext : '.css',
					filter : "isFile"
				}]
			},
			production : {
				options : {
					paths: ["src/css"],
					ieCompat : true,
					compress : true
				},
				files: [{
					expand : true,
					cwd : "src/css/",
					src : "**/*.less",
					dest : "build/css",
					ext : '.css',
					filter : "isFile"
				}]
			}
		},
		copy : {
			target : {
				expand: true,
				cwd: 'src/js/',
				src: ['**/*.js'],
				dest: 'build/js',
				ext :".js"
			}
		},
		sync: {
			main: {
				files: [{
					cwd: 'src/js/',
					src: [
						'**/*.js' /* but exclude txt files */
					],
					dest: 'build/js',
					ext : ".js"
				}],
				pretend: false, // Don't do any IO. Before you run the task with `updateAndDelete` PLEASE MAKE SURE it doesn't remove too much.
				verbose: true // Display log messages when copying files
			}
		},
		uglify : {
			target : {
				options : {
					sourceMap : true
				},
				files : [{
					expand : true,
					cwd : "src/js/",
					src : "**/*.js",
					dest :  "build/js",
					ext : ".js",
					filter : "isFile"
				}]
			}
		},
		jshint : {
			files : {
				src : ['src/js/**/*.js']
			},
			options : {
				jshintrc : true
			}
		},
		watch: {
			scripts: {
				files: ['src/js/**/*.js'],
				tasks : ['jshint','sync']
			},
			stylesheets : {
				files : ['src/css/**/*.less'],
				tasks : ['less:development']
			}
		}
	});

	var tasks = pkg.devDependencies;

	for(var task in tasks){
		if(tasks.hasOwnProperty(task) && /grunt-*/.test(task)){
			grunt.loadNpmTasks(task);
		}
	}

	grunt.registerTask("default", "build and watch", function(){
		grunt.task.run('build');
		grunt.task.run(['browserSync', 'watch']);
	});
	grunt.registerTask('build', ['less:development', 'jshint', 'copy']);
	grunt.registerTask("publish", ['less:production', 'jshint', 'uglify'])
};