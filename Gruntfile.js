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

  function configValue(name, def) {
    return grunt.file.exists('.gapps_remote') ? 
      grunt.file.readJSON('.gapps_remote')[name] : def;

  }
  function resolvePath(dir) {
    var base = grunt.config('config_path') || '.gcontact',
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
              default: configValue('config_path', '.gcontact')
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
              default: configValue('script')
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
              default: configValue('secret')
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
      gapps_clone_config: { 
        cmd: function() {
          return '{0} clone {1}'.format(grunt.config('gapps'), grunt.config('script'));
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
        files: [{expand: true, src: ['<%= config_path %>/*'], dest: '<%= dist_path %>' , filter: 'isFile'},]
      },
      secret: {
        files: [
          {src: ['<%= secret %>'], dest: '<%= config_secret %>', filter: 'isFile'}
        ]
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
          {src: ['./gascapi.py'], dest: '<%= dist_path %>', filter: 'isFile'},
          {src: ['./gascapi.conf'], dest: '<%= dist_path %>', filter: 'isFile'},
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

  grunt.registerTask('clone', 'gapps clone: Copies remote source to local folder', ['init', 'exec:gapps_clone_config']);
  grunt.registerTask('push', 'gapps push : Copies local source to remote Google Drive', ['exec:gapps_push']);
  grunt.registerTask('lint', 'Lint source files', ['jshint', 'exec:phplint', 'exec:pylint']);

  grunt.registerTask('dist_config', 'Initialize and copy config files to distribution', 
      ['init', 'prompt:get_dist_path', 'copy:secret', 'copy:config']);

  grunt.registerTask('configure', 'Configure development environment',
      ['prompt:get_config_path', 'prompt:get_secret', 'prompt:get_script', 'update_remote', 'init']);

  grunt.registerTask('some_thing', '', function (arg) {
      var createDir = function (name) {
        if (!grunt.file.exists(name)) { grunt.file.mkdir(name); }
      };
  });

  grunt.registerTask('dist', 'Copy application files to distribution directory', function (arg) {
    switch(arg){
      case 'cfg' : 
        grunt.task.run('dist_config');
        break;
      case 'php' : 
        grunt.task.run('dist_config', 'copy:php');
        break;
      case 'python' : 
        grunt.task.run('dist_config', 'copy:pythom');
        break;
      case 'js' : grunt.fail.fatal('not implemented'); break;
      default: grunt.fail.fatal('dist requires argement - one of [cfg, php, python, js]');
    }
  });

  grunt.registerTask('init', 'Initialize configuration options', function () {
    var pkg_path = grunt.config.data.pkg.config["config_path"];
    if (!grunt.file.exists('.gapps_remote')) {
      grunt.task.run('configure');
    } else {
      gapps_remote = grunt.file.readJSON('.gapps_remote');
      grunt.config('config_path', pkg_path || gapps_remote["config_path"] || '.gcontact');
      grunt.config('script', gapps_remote["script"]);
      grunt.config('secret', gapps_remote["secret"]);
      grunt.config('config_secret', resolvePath(path.basename(grunt.config('secret'))));
    }
  });

  grunt.registerTask('update_remote', 'Update .gapps_remote configuration with scriptId and authentication secret', function () {
    var gapps_remote = {
      config_path: grunt.config('config_path'),
      script: grunt.config('script_id'),
      secret: grunt.config('auth_secret')
    };
    grunt.file.write('.gapps_remote', JSON.stringify(gapps_remote, null, 2));
    // Writing the secret to the package.json to enable simpler command line : `npm run auth_auto` 
    // The alternative command line looks like: `npm run auth -- <path/to/client/secret.json> -b`
    var pkg = grunt.file.readJSON('package.json');
    pkg['config']['secret'] = grunt.config('auth_secret');
    grunt.file.write('package.json', JSON.stringify(pkg, null, 2));
  });

  grunt.registerTask('mkconfig', 'Creates configuration file for application bindings', function (configFile) {
    if (!configFile) {
      grunt.fail.fatal('Configuration file : argument required - must be non-empty string');
    }
    var pkg = grunt.config.data.pkg, 
    cfg = grunt.file.readJSON('.gapps_remote');
    cfg["scopes"] = pkg.config.scopes;
    cfg["name"] = '{0} ({1}-v{2})'.format(pkg.description, pkg.name, pkg.version);
    cfg["secret"] = path.basename(cfg["secret"]);
    grunt.file.write(configFile, JSON.stringify(cfg, null, 2));
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
