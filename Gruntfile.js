var readline = require('readline');
String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
/*global module:false*/
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    gapps: "./node_modules/.bin/gapps",

    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: 'nofunc',
        newcap: true,
        noarg: true,
        sub: true,
        undef: false,  // !!
        unused: false, // !!
        boss: true,
        eqnull: true,
        predef: ['require', 'console', 'process'], // !!
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
      gapps_clone: { 
        cmd: function() {
          var opt = grunt.config.data.pkg.config;
          if (!grunt.file.exists(opt.script_id)) {
            grunt.fail.fatal(opt.script_id,  + ' not found', 404);
          }
          var cmd = grunt.config('gapps');
          return  cmd + ' clone ' + grunt.file.read(opt.script_id);
        }
      },
      gapps_push: { cmd: '<%= gapps %> push' },
      pylint: { cmd: 'flake8 gascapi.py' },
      phplint: { cmd: 'php -l gascapi.php' },
      some_thing: {
        cwd: './ pathname/',
        cmd: function(arg) {
          return 'command string...' + arg;
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-exec');

  grunt.registerTask('clone', ['exec:gapps_clone']);
  grunt.registerTask('push', ['exec:gapps_push']);
  grunt.registerTask('lint', ['jshint', 'exec:phplint', 'exec:pylint']);

  grunt.registerTask('config_script', function(script) {
    if (!script) {
      grunt.fail.fatal('Script ID argument is required - must be non-empty string');
    }
    var opt = grunt.config.data.pkg.config;
    grunt.file.write(opt.script_id, script);
  });

  grunt.registerTask('config_secret', function(secret) {
    if (!secret) {
      grunt.fail.fatal('Auth secret argument is required - must be non-empty string');
    }
    if (!grunt.file.exists(secret)) {
      grunt.fail.fatal('Auth secret file argument must exist');
    }
    var opt = grunt.config.data.pkg.config;
    grunt.file.copy(secret, opt.auth_secret);
  });

  grunt.registerTask('ensure_directories', function() {
      var createDir = function (name) {
        if (!grunt.file.exists(name)) { grunt.file.mkdir(name); }
      }
      createDir('config');
      createDir('.credentials');
  });

  grunt.registerTask('custom_task_name', function() {

  });
};
