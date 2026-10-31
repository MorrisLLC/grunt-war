/*
 * grunt-war
 * https://github.com/MorrisLLC/grunt-war
 *
 * Copyright (c) 2013 rmorris
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Configuration to be run (and then tested).
    war: {
      default_options: {
        options: {
          war_dist_folder: 'tmp',
          war_name: 'default_options'
        },
        files: [
          {expand: true, cwd: 'test/fixtures', src: ['testing', '123'], dest: ''}
        ]
      },
      custom_options: {
        options: {
          war_dist_folder: 'tmp/nested/',
          war_name: 'custom_options.war',
          war_compression: 'NONE',
          war_extras: [
            {filename: 'credits.txt', data: 'Thanks!\n'},
            {filename: 'WEB-INF/display-name.txt', data: function (opts) {
              return opts.webxml_display_name;
            }},
            {filename: 'empty-folder'}
          ],
          webxml_welcome: 'home.html',
          webxml_display_name: 'Custom WAR',
          webxml_webapp_version: '2.5',
          webxml_mime_mapping: [{extension: 'woff', mime_type: 'application/font-woff'}],
          webxml_webapp_extras: [
            '<login-config />\n',
            function (opts) {
              return '<!-- ' + opts.war_name + ' -->\n';
            }
          ]
        },
        files: [
          {expand: true, cwd: 'test/fixtures', src: ['testing', '123'], dest: 'static/'}
        ]
      },
      provided_webxml: {
        options: {
          war_dist_folder: 'tmp',
          war_name: 'provided_webxml',
          webxml_display_name: 'Should not be used'
        },
        files: [
          {expand: true, cwd: 'test/fixtures/provided', src: ['**'], dest: ''}
        ]
      },
      webxml_function: {
        options: {
          war_dist_folder: 'tmp',
          war_name: 'webxml_function',
          webxml: function (opts) {
            return '<web-app><!-- ' + opts.war_name + ' --></web-app>\n';
          }
        },
        files: [
          {expand: true, cwd: 'test/fixtures', src: ['testing'], dest: ''}
        ]
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'war', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
