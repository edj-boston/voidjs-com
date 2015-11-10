// External dependencies
var concat = require('gulp-concat'),
	del  = require('del'),
	fs  = require('fs'),
    gulp = require('gulp'),
    hb     = require('gulp-compile-handlebars'),
    md = require('marked'),
    minifyCSS = require('gulp-minify-css'),
    minifyHTML = require('gulp-minify-html'),
	minifyJS = require('gulp-uglify'),
	mocha = require('gulp-mocha'),
	moment = require('moment');


// Catchall to copy static files to build
gulp.task('static', ['clean'], function() {
    return gulp.src('assets/static/**')
        .pipe(gulp.dest('build'));
});


// Clean the build dir
gulp.task('clean', function() {
    return del('build');
});


// Minify and combine all JavaScript
gulp.task('scripts', ['clean'], function() {
	return gulp.src([
			'assets/js/jquery-1.11.0.min.js',
			'assets/js/bootstrap.min.js',
			'assets/js/custom.js',
			'assets/js/ga.js'
		])
		.pipe(concat('all.min.js'))
		.pipe(minifyJS({preserveComments:'some'}))
		.pipe(gulp.dest('build/js'));
});


// Minify and combine all CSS
gulp.task('styles', ['clean'], function() {
	return gulp.src([
			'assets/css/bootstrap.min.css',
			'assets/css/custom.css',
			'assets/css/font-awesome.min.css'
		])
		.pipe(minifyCSS())
		.pipe(concat('all.min.css'))
		.pipe(gulp.dest('build/css'));
});


// Compile HB template
gulp.task('views', ['clean'], function() {

	md.setOptions({gfm: true});

	var data = {
		year : moment().format('YYYY'),
		timestamp : moment().format('YYYY-MM-DD-HH-mm-ss'),
		readme : md.parse(fs.readFileSync('node_modules/void/README.md', 'utf-8'))
	};

	return gulp.src('assets/views/*.html')
		.pipe(hb(data))
		.pipe(minifyHTML())
		.pipe(gulp.dest('build'));
});


// Run tests
gulp.task('test', ['build'], function() {
    return gulp.src('test/index.js', { read:false })
        .pipe(mocha());
});


// Perform a build
gulp.task('build', [
    'clean',
    'static',
    'scripts',
    'styles',
    'views'
]);

// What to do when you run `$ gulp`
gulp.task('default', ['build']);