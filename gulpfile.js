// External dependencies
var del  = require('del'),
	fs  = require('fs'),
    gulp = require('gulp'),
    hb     = require('gulp-compile-handlebars'),
    md = require('marked'),
	moment = require('moment');

// Catchall to copy static files to build
gulp.task('static', ['clean'], function() {
    return gulp.src('static/**')
        .pipe(gulp.dest('build'));
});

// Clean the build dir
gulp.task('clean', function() {
    return del('build');
});

// Compile HB template
gulp.task('views', ['clean'], function() {

	md.setOptions({gfm: true});

	var data = {
		title : 'MatchstickJS',
		year : moment().format('YYYY'),
		timestamp : moment().format('YYYY-MM-DD-HH-mm-ss'),
		readme : md.parse(fs.readFileSync('node_modules/void/README.md', 'utf-8'))
	};

	return gulp.src('views/*.html')
		.pipe(hb(data))
		.pipe(gulp.dest('build'));
});

// Perform a build
gulp.task('build', [
    'clean',
    'static',
    'views'
]);

// What to do when you run `$ gulp`
gulp.task('default', ['build']);