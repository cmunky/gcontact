String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // Task configuration.
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        globals: {
          jQuery: true
        }
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      src: {
        src: ['gascapi.js', 'src/*.js']
      },
      test: {
        src: ['test/**/*.js']
      }
    },
    nodeunit: {
      files: ['test/**/*_test.js']
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'nodeunit']
      }
    },
    exec: {
      script: "./config/script.id",
      gapps: "./node_modules/.bin/gapps",
      gapps_clone: { 
        cmd: function() {
          var script = grunt.config('exec.script'),
          cmd = grunt.config('exec.gapps');
          if (!grunt.file.exists(script)) {
            grunt.fail.fatal(script + ' not found', 404);
          }
          var scriptId = grunt.file.read(script);
          return  cmd + ' clone ' + scriptId;
        }
      },
      gapps_push: { 
        cmd: '<%= exec.gapps %> push'
      },
      some_thing: {
        cwd: './config/', 
        cmd: function(arg) {
          return 'command string...' + arg;
        }
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-exec');

  // Default task.
  // grunt.registerTask('default', ['jshint', 'nodeunit']);
  grunt.registerTask('default', ['exec:gapps_clone']);

  grunt.registerTask('custom_task_name', function() {

  });

  grunt.registerTask('readme', function() {
      var file = 'README.md',
      path = grunt.config('lib_path');
      grunt.file.write(path.concat(file), grunt.config('readme'));
  });

  grunt.registerTask('config_script', function(script) {
     
     grunt.file.write('./config/script.id', script);

  });

  grunt.registerTask('config_secret', function(secret) {
    
     grunt.file.copy(secret, './config/auth_secret');

  });

  grunt.registerTask('ensure_directories', function() {
      if (!grunt.file.exists('config')) {
        grunt.file.mkdir('config');
      }
      if (!grunt.file.exists('.credentials')) {
        grunt.file.mkdir('.credentials');
      }
  });

};
