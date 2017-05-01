'use strict';
var gulp        = require('gulp');
var pug         = require('gulp-pug');
var sass        = require('gulp-sass');
var watch       = require('gulp-watch');
var imagemin    = require('gulp-imagemin');
var cache       = require('gulp-cache');
var browserSync = require('browser-sync').create();
var del         = require('del');
var concat      = require('gulp-concat');
var uglify      = require('gulp-uglify');
var svgSprite   = require('gulp-svg-sprite');
var svgmin      = require('gulp-svgmin');
var cheerio     = require('gulp-cheerio');
var replace     = require('gulp-replace');

gulp.task('pug', function () {
  return gulp.src(['./source/template/**/*.pug', '!./source/template/includes/*.pug'])
    .pipe(pug({
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
gulp.task('js', function() {
  return gulp.src([
    'source/js/libs/*.js',
    'source/js/custom.js', // Всегда в конце
    ])
  .pipe(concat('scripts.min.js'))
  .pipe(uglify()) // Минимизировать весь js (на выбор)
  .pipe(gulp.dest('./dist/js'))
  .pipe(browserSync.reload({stream: true}));
});
gulp.task('imagemin', function() {
  return gulp.src('./source/images/**/*')
  .pipe(cache(imagemin()))
  .pipe(gulp.dest('./dist/img')); 
});
gulp.task('watch', function () {
  gulp.watch('./source/template/**/*.pug', gulp.series('pug'));
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
    'pug',
    'sass',
    'js',
    'imagemin'
  ),
  gulp.parallel(
    'watch',
    'serve'
  )
));
gulp.task('svgSpriteBuild', function () {
  return gulp.src('./source/images/svg/*.svg')
  // minify svg
    .pipe(svgmin({
      js2svg: {
        pretty: true
      }
    }))
    // remove all fill, style and stroke declarations in out shapes
    .pipe(cheerio({
      run: function ($) {
        $('[fill]').removeAttr('fill');
        $('[stroke]').removeAttr('stroke');
        $('[style]').removeAttr('style');
      },
      parserOptions: {xmlMode: true}
    }))
    // cheerio plugin create unnecessary string '&gt;', so replace it.
    .pipe(replace('&gt;', '>'))
    // build svg sprite
    .pipe(svgSprite({
      mode: {
        symbol: {
          sprite: "../images/sprite.svg",
          render: {
            scss: {
              dest:'../styles/partials/_sprite.scss',
              template: '../idsiS/source/styles/modules/_sprite_template.scss'
            }
          }
        }
      }
    }))
    .pipe(gulp.dest('source/'));
});
gulp.task('clearcache', function (done) { return cache.clearAll(done); });
