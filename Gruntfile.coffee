module.exports = (grunt) ->

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks)

  grunt.initConfig
    watch:
      testTemplates:
        files: ['test/**/*.hbs']
        tasks: ['emberTemplates:test']

    emberTemplates:
      options:
        templateCompilerPath: 'bower_components/ember-template-compiler/index.js'
        handlebarsPath: 'bower_components/handlebars/handlebars.js'
      test:
        options:
          templateBasePath: 'test/support/'
        files:
          'test/support/templates.js': 'test/support/**/*.hbs'

  grunt.registerTask 'build', ['emberTemplates']
  grunt.registerTask 'default', ['build', 'watch']

