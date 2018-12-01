var gulp = require('gulp');
var uglify = require('gulp-uglify');
var pump = require('pump');
var concat = require('gulp-concat');

gulp.task('default', ['compress'], function() {
    gulp.watch('src/core.js', ['default']);
    return gulp.src(['tmp/core.js',  'tmp/background.js'])
        .pipe(gulp.dest('build'));
});

gulp.task('compress', function () {
    return gulp.src(['src/core.js', 'src/background.js'])
        .pipe(uglify())
        .pipe(gulp.dest('tmp'));
});