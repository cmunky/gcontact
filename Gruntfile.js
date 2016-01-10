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
      lib_test: {
        src: ['lib/**/*.js', 'test/**/*.js']
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
      lib_test: {
        files: '<%= jshint.lib_test.src %>',
        tasks: ['jshint:lib_test', 'nodeunit']
      }
    },
    exec: {
      gapps_clone: { 
        cmd: function() {
          var fs = require('fs'),
          scriptId = fs.readFileSync('./config/script.id').toString('UTF-8');
          return './node_modules/.bin/gapps clone ' + scriptId;
        }
      },
      gapps_push: { 
        cmd: './node_modules/.bin/gapps push'
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
  grunt.registerTask('default', ['ensure_script_id', 'exec:gapps_clone']);

  grunt.registerTask('ensure_script_id', function() {
    var fs = require('fs'),
    path = './config';
    fs.readdir( path, function( err, files ) {
      files.forEach( function( file, index ) {
        file = path.concat('/', file);
        if (file.endsWith('.id')) {
          console.log(file)
        }
      });
    });
  });

  grunt.registerTask('readme', function() {
      var file = 'README.md',
      path = grunt.config('lib_path');
      grunt.file.write(path.concat(file), grunt.config('readme'));
  });

};
