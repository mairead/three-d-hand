'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var del = require('del');
var uglify = require('gulp-uglify');
var gulpif = require('gulp-if');
var notify = require('gulp-notify');
var argv = require('yargs').argv;
var plumber = require('gulp-plumber');

// sass
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer-core');
var sourcemaps = require('gulp-sourcemaps');
// BrowserSync
var browserSync = require('browser-sync');
// js
var watchify = require('watchify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
// image optimization
var imagemin = require('gulp-imagemin');
// linting
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
//test
var karma = require('gulp-karma');


// gulp build --production
var production = !!argv.production;
// determine if we're doing a build
// and if so, bypass the livereload
var build = argv._.length ? argv._[0] === 'build' : false;
var watch = argv._.length ? argv._[0] === 'watch' : true;
 
// ----------------------------
// Error notification methods
// ----------------------------

var handleError = function(task) {

  return function(err) {
    
      notify.onError({
        message: task + ' failed, check the logs..',
        sound: false
      })(err);
    
    gutil.log(gutil.colors.bgRed(task + ' error:'), gutil.colors.red(err));

  };
};
// --------------------------
// CUSTOM TASK METHODS
// --------------------------
var tasks = {
  // --------------------------
  // Delete build folder
  // --------------------------
  clean: function(cb) {
    del(['build/'], cb);
  },

  // --------------------------
  // Browserify
  // --------------------------
  browserify: function() {
    var bundler = browserify('./src/js/app.js', {
      debug: !production,
      cache: {}
    });
    // determine if we're doing a build
    // and if so, bypass the livereload
    var build = argv._.length ? argv._[0] === 'build' : false;
    if (watch) {
      bundler = watchify(bundler);
    }
    var rebundle = function() {
      console.log("UPDATE method in watchify"); //this is called twice
      tasks.lintjs();
      return bundler.bundle()
        .pipe(plumber({
          errorHandler: handleError
        }))
        // .on('error', function(err){
        //   console.log('err browserify', err);
        //   gutil.log(err);
        //   // handleError('browserify');
        //   this.emit('end');
        // })
        .pipe(source('build.js'))
        .pipe(gulpif(production, buffer()))
        .pipe(gulpif(production, uglify()))
        .pipe(gulp.dest('build/js/'))
        .pipe(browserSync.reload({stream:true}));
    };
    bundler.on('update', rebundle);
    return rebundle();
  },
  // --------------------------
  // linting
  // --------------------------
  lintjs: function() {
    return gulp.src([
        // 'gulpfile.js', //the unused vars in the build flags throw lint errors
        './src/js/app.js',
        './src/js/*.js',
        './src/js/**/*.js',
        './tests/**/*.js'
      ]).pipe(jshint())
      .pipe(jshint.reporter(stylish))
      .pipe(plumber({
        errorHandler: handleError
      }));
      // .on('error', function(err){
      //   gutil.log(err);
      //   console.log('err lint', err);
      //   // handleError('lint');
      //   this.emit('end');
      // });
  },

  test: function(){
    var files = [
        // './src/js/**/*.js',
        './tests/**/*.js'
    ];
    return gulp.src(files)
    .pipe(karma({
      configFile: 'tests/karma.conf.js',
      action: 'run'
    }))
    .pipe(plumber({
      errorHandler: handleError
    }));
  }
 
 
};
 
gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: "./build"
        },
        port: process.env.PORT || 3000
    });
});
 

// gulp.task('reload-js', ['browserify'], function(){
//   browserSync.reload({stream:true});
// });

// --------------------------
// CUSTOMS TASKS
// --------------------------
gulp.task('clean', tasks.clean);
// for production we require the clean method on every individual task
var req = build ? ['clean'] : [];
// individual tasks

gulp.task('browserify', req, tasks.browserify);
gulp.task('lint:js', tasks.lintjs);

gulp.task('test', tasks.test);
 
// --------------------------
// DEV/WATCH TASK
// --------------------------
gulp.task('watch', [ 'browserify', 'browser-sync'], function() {

  // --------------------------
  // watch:js
  // --------------------------
  // gulp.watch('./src/js/**/*.js', ['lint:js']);

  // --------------------------
  // watch:tests
  // --------------------------
  // gulp.watch('./tests/**/*.js', ['lint:js', 'test', 'reload-js']);

  //this isn't coming back on
 
  gutil.log(gutil.colors.bgGreen('Watching for changes...'));
});
 
// build task
gulp.task('build', [
  'clean',
  'browserify'
]);
 
gulp.task('default', ['watch']);
 
// gulp (watch) : for development and livereload
// gulp build : for a one off development build
// gulp build --production : for a minified production build