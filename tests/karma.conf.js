'use strict';

module.exports = function(config) {

  config.set({
    basePath : '', //!\\ Ignored through gulp-karma //!\\

    files : [ //!\\ Ignored through gulp-karma //!\\
        './src/js/**/*.js',
        '*.spec.js'
    ],

    // autoWatch : false,
    // singleRun: true,

    frameworks: ['browserify','jasmine'],
    
    preprocessors: {
        '*.spec.js': ['browserify']
    },

    browsers : ['PhantomJS'],
    
    browserify: {
        watch:true,
        debug: true
    },

    plugins : [
        'karma-phantomjs-launcher',
        'karma-jasmine',
        'karma-browserify'
    ]
  });

};
