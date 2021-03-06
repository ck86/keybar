module.exports = function(grunt) {
	var appConfig = grunt.file.readJSON('package.json');

	// Load grunt tasks automatically
	// see: https://github.com/sindresorhus/load-grunt-tasks
	require('load-grunt-tasks')(grunt);

	// Time how long tasks take. Can help when optimizing build times
	// see: https://npmjs.org/package/time-grunt
	require('time-grunt')(grunt);

	var pathsConfig = function (appName) {
		this.app = appName || appConfig.name;

		return {
			app: this.app,
			foundation: this.app + '/../../bower_components/foundation/scss',
			templates: this.app + '/templates',
			css: this.app + '/static/css',
			sass: this.app + '/static/scss',
			fonts: this.app + '/static/fonts',
			images: this.app + '/static/img',
			js: this.app + '/static/js',
			manageScript: this.app + '/../../manage.py',
			serverScript: this.app + '/server.py',
		};
	};

	grunt.initConfig({
		pkg: appConfig,
		paths: pathsConfig('src/keybar'),

		sass: {
			options: {
				sourceMap: true,
				includePaths: ['<%= paths.foundation %>'],
			},
			dist: {
				options: {
					outputStyle: 'expanded'
				},

				files: [{
					expand: true,
					cwd: '<%= paths.sass %>',
					src: ['app.scss'],
					dest: '<%= paths.css %>',
					ext: '.css'
				}]
			}
		},
		watch: {
			options: {
				livereload: {
					key: grunt.file.read('src/keybar/tests/resources/certificates/KEYBAR-intermediate-SERVER.key'),
					cert: grunt.file.read('src/keybar/tests/resources/certificates/KEYBAR-intermediate-SERVER.cert')
				},
			},
			src: {
				files: ['<%= paths.js %>**/*', '<%= paths.sass %>**/*'],
				tasks: ['default'],
			},
		},
		lintspaces: {
			all: {
				src: [
					'<%= paths.js %>',
					'<%= paths.sass %>'
				],
				options: {
					editorconfig: '.editorconfig'
				}
			},
			javascript: {
				src: ['<%= paths.js %>/src/*.js'],
				options: {
					editorconfig: '.editorconfig'
				}
			},
			external: {
				src: [
					'<%= paths.app %>/**/*',
					'!<%= paths.app %>/static/*.ico',
					'!<%= paths.images %>/*',
					'!<%= paths.fonts %>/*',
					'!<%= paths.js %>/src/libs/*',
					'!<%= paths.css %>/**',
					'!<%= paths.app %>/**/djangojs.js',
					'!<%= paths.app %>/**/django.pot',
					'!<%= paths.app %>/**/django.po',
					'!<%= paths.app %>/resources/**',
					'!<%= paths.app %>/tests/resources/**',
					'!<%= paths.app %>/**/*.py'
				],
				options: {
					editorconfig: '.editorconfig'
				}
			}
		},
		jshint: {
			all: ['Gruntfile.js', '<%= paths.js %>/*.js']
		},
		jscs: {
			all: {
				options: {
					'standard': 'Jquery'
				},
				files: {
					src: ['tasks']
				}
			}
		},
		clean: {
			build: {
				src: [
					'<%= paths.js %>/build/**/*',
					'<%= paths.css %>/**/*'
				]
			}
		},

		// see: https://npmjs.org/package/grunt-bg-shell
		bgShell: {
			_defaults: {
				bg: true
			},
			runTornado: {
				cmd: 'python <%= paths.serverScript %>'
			},
			runCelery: {
				cmd: 'celery worker -A keybar.tasks -l INFO -E'
			}
		}
	});

	grunt.registerTask(
		'default',
		'Run all tasks in a row.',
		['build']
	);

	grunt.registerTask(
		'validate',
		'Validate all files.',
		['jshint', 'jscs', 'lintspaces']
	);

	grunt.registerTask(
		'test',
		'Run JS tests.',
		[]
	);

	grunt.registerTask(
		'build',
		'Build all JS files for a deploy.',
		['validate', 'clean:build', 'sass']
	);

	grunt.registerTask('serve', [
		'bgShell:runTornado',
		'bgShell:runCelery',
		'watch'
	]);
};
