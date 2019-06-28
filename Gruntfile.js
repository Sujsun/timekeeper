
function getPluginBanner () {
  var pluginBanner = '';
  pluginBanner += '/**\n';
  pluginBanner += ' * Plugin: TimeKeeper\n';
  pluginBanner += ' * Author: Sundarasan Natarajan\n';
  pluginBanner += ' * GIT: https://github.com/Sujsun/timekeeper.git\n';
  pluginBanner += ' * Version: 0.0.2\n';
  pluginBanner += ' */\n';
  return pluginBanner;  
}

var pluginBanner = getPluginBanner();

module.exports = function(grunt) {
  grunt.initConfig({

    copy: {

      dist: {
        files: { 'dist/timekeeper.js': './index.js' }
      },

      public_dist: {
        files: [
          { expand: true, src: ['dist/*'], dest: 'public/', filter: 'isFile' },
        ],
      },

    },

    uglify: {
      dist: {
        options: {
          banner: pluginBanner
        },
        files: {
          'dist/timekeeper.min.js': ['dist/timekeeper.js']
        }
      }
    },

    watch: {
      dist: {
        files: ['dist/timekeeper.js', './index.js'],
        tasks: ['build']
      },
    },

  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('start', 'My start task description', function() {
    grunt.util.spawn({
      cmd: 'npm',
      args: ['start']
    });
    console.log('Server running at http://127.0.0.1:8989 (http://localhost:8989)');
    grunt.task.run('watch');
  });

  grunt.registerTask('build', [
    'copy:dist',
    'uglify',
    'copy:public_dist',
  ]);

  grunt.registerTask('default', [
    'build',
    'start',
  ]);
};