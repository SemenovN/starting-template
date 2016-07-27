'use strict';
var gulp        = require('gulp');
var jade        = require('gulp-jade');
var sass        = require('gulp-sass');
var watch       = require('gulp-watch');
var browserSync = require('browser-sync').create();
var del         = require('del');

gulp.task('jade', function () {
  return gulp.src(['./source/template/**/*.jade', '!./source/template/extends|mixins/*.jade'])
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest('./dist/'))
});

gulp.task('sass', function () {
  return gulp.src('./source/styles/main.scss')
    .pipe(sass()).on('error', function (error) {
      console.log(error);
      this.end();
    })
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('watch', function () {
  gulp.watch('./source/template/**/*.jade', gulp.series('jade'));
  gulp.watch('./source/styles/**/*.scss', gulp.series('sass'));
});

gulp.task('serve', function () {
  browserSync.init({
    server: {
      baseDir: "./dist"
    }
  });
 gulp.watch('./dist').on('change', browserSync.reload);
});

gulp.task('clean', function () {
  return del('./dist');
});

gulp.task('default', gulp.series(
  'clean',
  gulp.parallel(
    'jade',
    'sass'
  ),
  gulp.parallel(
    'watch',
    'serve'
  )
));