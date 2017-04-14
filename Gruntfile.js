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

  function resolvePath(dir) {
    var base = grunt.config.data.pkg.config.config_path || '.gcontact',
      result = path.join(base, dir);
    if (dir.startsWith(base) ||
        dir.startsWith('.') ||
        dir.startsWith('/')) {
        result = dir
    }
    return result
  }

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    gapps: path.relative("", "node_modules/.bin/gapps"),
    prompt: {
      get_config_path: {
        options: {
          questions: [
            {
              config: 'config_path', 
              type: 'input',
              message: 'Enter the path to save the local configuration files: ', 
              default: '.gcontact'
              // default: function() { return grunt.config.data.pkg.config["config_path"];
            }
          ]
        }
      },
      get_script: {
        options: {
          questions: [
            {
              config: 'script_id', 
              type: 'input', 
              message: 'Enter the scriptId from the remote server: ',
              default: function() { return grunt.config.data.pkg.config["script"]; }
            }
          ]
        }
      },
      get_dist_path: {
        options: {
          questions: [
            {
              config: 'dist_path', 
              type: 'input', 
              message: 'Enter the path for the application binding distribution: ',
              default: 'dist/php/'
            }
          ]
        }
      },
      get_secret: {
        options: {
          questions: [
            {
              config: 'auth_secret',
              type: 'input', 
              message: 'Enter the path to the authentication secret from the remote server: ',
              default: function() { return grunt.config.data.pkg.config["secret"]; }
            }
          ]
        }
      },
    },

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
      gapps_clone_auto: { 
        cmd: function() {
          return '{0} clone {1}'.format(grunt.config('gapps'), grunt.config.data.pkg.config.script);
        }
      },
      gapps_clone: { 
        cmd: function() {
          var script = grunt.option('script');
          if (!script) {
            grunt.fail.fatal('--script argument required - must be non-empty string');
          }
          return '{0} clone {1}'.format(grunt.config('gapps'), script);
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
        files: [{expand: true, src: ['<%= pkg.config.config_path %>/*'], dest: '<%= dist_path %>' , filter: 'isFile'},]
      },
      php: {
        files: [
          {src: ['./gascapi.php'], dest: '<%= dist_path %>', filter: 'isFile'},
          {src: ['./gascapi.conf'], dest: '<%= dist_path %>', filter: 'isFile'},
          {expand: true, src: ['./google-api-php-client/src/**'], dest: '<%= dist_path %>'},
        ]
      },
      python: {
        files: [
          {src: ['./gascapi.py'], dest: '<%= dist_path %>', filter: 'isFile'}
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-prompt');
  grunt.loadNpmTasks('grunt-exec');

  grunt.registerTask('clone', 'gapps clone: Copies remote source to local folder', ['exec:gapps_clone']);
  grunt.registerTask('push', 'gapps push : Copies local source to remote Google Drive', ['exec:gapps_push']);
  grunt.registerTask('lint', 'Lint source files', ['jshint', 'exec:phplint', 'exec:pylint']);

  grunt.registerTask('copy_cfg', '', ['prompt:get_dist_path', 'copy_secret_auto', 'copy:config']);
  grunt.registerTask('copy_php', '', ['copy_cfg', 'copy:php']);
  grunt.registerTask('copy_python', '', ['copy_cfg', 'copy:python']);

  grunt.registerTask('configure', 'Configure development environment',
    ['prompt:get_config_path', 'prompt:get_secret', 'prompt:get_script', 'update_pkg_json']);

  grunt.registerTask('dootherstuff', '', function (arg) {
      var createDir = function (name) {
        if (!grunt.file.exists(name)) { grunt.file.mkdir(name); }
      };

  });

  grunt.registerTask('chkconfig', 'Check the package.json for scriptId and authentication secret', function () {
    var opt = grunt.config.data.pkg.config;
    if (!opt["secret"] || !opt["script"] || !opt["config_path"]) {
      grunt.task.run('configure');
    }
  });

  grunt.registerTask('update_pkg_json', 'Update package.json file with scriptId and authentication secret', function () {
    var package_json  =  grunt.file.readJSON('package.json');
    package_json['config']['config_path'] = grunt.config('config_path');
    package_json['config']['script'] = grunt.config('script_id');
    package_json['config']['secret'] = grunt.config('auth_secret');
    grunt.file.write('package.json', JSON.stringify(package_json, null, 2));
  });

  grunt.registerTask('mkconfig', 'Creates configuration file for application bindings', function (configFile) {
    if (!configFile) {
      grunt.fail.fatal('Configuration file : argument required - must be non-empty string');
    }
    var pkg = grunt.config.data.pkg, opt = pkg.config;
    opt["name"] = '{0} ({1}-v{2})'.format(pkg.description, pkg.name, pkg.version);
    opt["secret"] = path.basename(opt["secret"]);
    grunt.file.write(configFile, JSON.stringify(opt, null, 2));
  });

  grunt.registerTask('copy_secret_auto', 'Copies local authentication secret file from configuration', function() {
    var secret = grunt.config.data.pkg.config.secret,
    target = resolvePath(path.basename(secret));
    grunt.file.copy(secret, target);
  });

  grunt.registerTask('copy_secret', 'Copies local authentication secret file from argument', function(secret) {
    if (!secret) {
      grunt.fail.fatal('Authentication secret : argument required - must be non-empty string');
    }
    if (!grunt.file.exists(secret)) {
      grunt.fail.fatal('Authentication secret : file must exist');
    }
    var target = resolvePath(path.basename(secret));
    grunt.file.copy(secret, target);
  });

};
