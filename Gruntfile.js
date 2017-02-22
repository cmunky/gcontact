//var readline = require('readline');
String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
String.prototype.startsWith = function(searchString, position){
    position = position || 0;
    return this.substr(position, searchString.length) === searchString;
};
String.prototype.format = function() {
  var args = arguments;
  return this.replace(/{(\d+)}/g, function(match, number) { 
    return typeof args[number] != 'undefined'
      ? args[number]
      : match
    ;
  });
};

var path = require("path");
/*global module:false*/
module.exports = function(grunt) {

  function resolvePath(opt, dir) {
    var base = opt.config_dir,
      result = path.join(base, dir);
    if (dir.startsWith(base) ||
        dir.startsWith('.') ||
        dir.startsWith('/')) {
        filename = dir
    }
    return result
  }

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    gapps: path.relative("", "node_modules/.bin/gapps"),

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
          var opt = grunt.config.data.pkg.config,
          filename = resolvePath(opt, opt.script_id);
          if (!grunt.file.exists(filename)) {
            grunt.fail.fatal(filename + ' not found', 404);
          }
          var cmd = '{0} clone {1}'.format(grunt.config('gapps'), grunt.file.read(filename));
          return cmd;
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
    },
    copy: {
      config: {
        files: [{expand: true, src: ['<%= pkg.config.config_dir %>/*'], dest: 'dist/php', filter: 'isFile'},]
      },
      php: {
        files: [
          {src: ['./gascapi.php', 'package.json'], dest: 'dist/php/', filter: 'isFile'},
          {expand: true, src: ['<%= pkg.config.config_dir %>/*'], dest: 'dist/php/', filter: 'isFile'},
          {expand: true, src: ['./google-api-php-client/src/**'], dest: 'dist/php/'},
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-exec');

  grunt.registerTask('clone', 'gapps clone: Copies remote source to local folder', ['exec:gapps_clone']);
  grunt.registerTask('push', 'gapps push : Copies local source to remote Google Drive', ['exec:gapps_push']);
  grunt.registerTask('lint', 'Lint source files', ['jshint', 'exec:phplint', 'exec:pylint']);

  grunt.registerTask('config_script', 'Creates local script.id config file', function(script) {
    if (!script) {
      grunt.fail.fatal('Script ID argument is required - must be non-empty string');
    }
    var opt = grunt.config.data.pkg.config,
    filename = resolvePath(opt, opt.script_id);
    grunt.file.write(filename, script);
  });

  grunt.registerTask('config_secret', 'Copies local authentication secret file', function(secret) {
    if (!secret) {
      grunt.fail.fatal('Authentication secret : argument required - must be non-empty string');
    }
    if (!grunt.file.exists(secret)) {
      grunt.fail.fatal('Authentication secret : file must exist');
    }
    var opt = grunt.config.data.pkg.config,
    filename = resolvePath(opt, opt.auth_secret);
    grunt.file.copy(secret, filename);
  });

  grunt.registerTask('ensure_directories', 'Creates configuration directories', function() {
      var createDir = function (name) {
        if (!grunt.file.exists(name)) { grunt.file.mkdir(name); }
      };
      createDir('.gcontact'); // ??
      createDir('.credentials');
  });

  grunt.registerTask('custom_task_name', function() {

  });
};
