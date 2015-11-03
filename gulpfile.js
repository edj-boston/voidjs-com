// External dependencies
var clean  = require('gulp-clean'),
	del  = require('del'),
    gulp = require('gulp');

// Catchall to copy static files to build
gulp.task('static', ['clean'], function() {
    return gulp.src('static/**')
        .pipe(gulp.dest('build'));
});

// Clean the build dir
gulp.task('clean', function() {
    return del('build');
});

// Perform a build
gulp.task('build', [
    'clean',
    'static'
]);

// What to do when you run `$ gulp`
gulp.task('default', ['build']);