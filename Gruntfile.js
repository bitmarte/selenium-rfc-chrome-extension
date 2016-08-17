module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			dist: ['dist'],
			tmp: ['tmp']
		},
		plato: {
			dist: {
				files: {
					'report/output/plato': ['js/**/*.js']
				  }
			}
		},
		fixmyjs: {
			options: {
				config: '.jshintrc'
			},
			fix: {
				files: [
					{
						expand: true,
						src: ['js/**/*.js'],
						dest: 'tmp/',
						ext: '.js'
					}
				]
			}
		},
		removelogging: {
			dist: {
				src: "tmp/js/**/*.js"
			}
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			dist: {
				files: {
					'dist/js/background-min.js': ['tmp/js/background.js'],
					'dist/js/content-min.js': ['tmp/js/content.js'],
					'dist/js/ctx-menu-min.js': ['tmp/js/ctx-menu.js']
				}
			}
		},
		copy: {
			main: {
				files: [
					{
						expand: false,
						src: ['images/**'],
						dest: 'dist/',
						filter: 'isFile'
					},
					{
						expand: false,
						src: ['_locales/**'],
						dest: 'dist/',
						filter: 'isFile'
					},
					{
						expand: false,
						src: ['manifest.json'],
						dest: 'dist/manifest.json',
						filter: 'isFile'
					}
				]
			}
		},
		watch: {
			scripts: {
				files: [
					'js/**',
					'_locales/**',
					'manifest.json'
				],
				tasks: [
					'clean:dist',
					'fixmyjs',
					'uglify',
					'copy',
					'clean:tmp'],
				options: {
					spawn: false
				}
			}
		}
	});
	
	// Load plugins
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-plato');
	grunt.loadNpmTasks('grunt-fixmyjs');
	grunt.loadNpmTasks("grunt-remove-logging");
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');
	
	grunt.registerTask(
		'default',[
			'clean:dist',
			'fixmyjs',
			'uglify',
			'copy',
			'clean:tmp',
			'watch'
		]
	);

	grunt.registerTask(
		'dist',[
			'clean:dist',
			'fixmyjs',
			'removelogging',
			'uglify',
			'copy',
			'clean:tmp'
		]
	);
};