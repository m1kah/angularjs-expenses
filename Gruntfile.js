module.exports = function(grunt) {
  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);
  
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    clean: {
      dev: {
        src: ['build/style.css']
      }
    },
    
    simplemocha: {
      options: {
        globals: ['expect', 'sinon'],
        timeout: 3000,
        ingoreLeaks: false,
        ui: 'bdd',
        reporter: 'tap'
      },
      server: {
        src: ['spec/spechelper.js', 'spec/**/*.test.js']
      }
    },
    
    less: {
      dev: {
        files: {
          'build/style.css': ['client/styles/less/style.less']
        }
      }
    },
    
    copy: {
      dev: {
        files: [{
          src: 'build/style.css',
          dest: 'public/css/style.css'
        }]
      }
    },
    
    watch: {
      less: {
        files: ['client/styles/**/*.less'],
        tasks: ['less:dev', 'copy:dev']
      }
    },
    
    nodemon: {
      dev: {
        script: 'server.js'
      }
    },
    
    concurrent: {
      dev: {
        tasks: ['nodemon:dev', 'watch:less'],
        options: {
          logConcurrentOutput: true
        }
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-contrib-less');
  
  grunt.registerTask('build:dev', ['clean:dev', 'less:dev', 'copy:dev']);
  
  grunt.registerTask('test:server', ['simplemocha:server']);
  
  grunt.registerTask('server', ['build:dev', 'concurrent:dev']);
};
