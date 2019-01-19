var gulp = require('gulp');
var uglify = require('gulp-uglify');

gulp.task('compress', function () {
    return gulp.src(['src/core.js', 'src/background.js'])
        .pipe(uglify())
        .pipe(gulp.dest('tmp'))
        .pipe(gulp.dest('build'));
});
