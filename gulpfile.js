let gulp = require('gulp');
let babel = require('gulp-babel');
let eslint = require('gulp-eslint');
let excludeGitignore = require('gulp-exclude-gitignore');
let replace = require('gulp-replace');

gulp.task('build', function () {
  return gulp
    .src('lib/**/*.js')
    .pipe(replace(/ENV_BASE_URL/g, process.env.BASE_URL))
    .pipe(babel())
    .pipe(gulp.dest('dist'));
});

gulp.task('lint', function () {
  return gulp
    .src('**/*.js')
    .pipe(excludeGitignore())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('dev-env', function (done) {
  process.env.NODE_ENV = 'development';
  process.env.BASE_URL = 'http://localhost:9031';
  return done();
});

gulp.task('prod-env', function (done) {
  process.env.NODE_ENV = 'production';
  process.env.BASE_URL = 'http://api.epersonate.com';
  return done();
});

gulp.task('prod', gulp.series(['prod-env', 'build']));
gulp.task('dev', gulp.series(['dev-env', 'build']));
