var argv       = require('yargs').argv,
    concat     = require('gulp-concat'),
    del        = require('del'),
    express    = require('express'),
    fs         = require('fs'),
    gulp       = require('gulp'),
    gutil      = require('gulp-util'),
    gzip       = require('gulp-gzip'),
    hb         = require('gulp-compile-handlebars'),
    marked     = require('marked'),
    minifyCSS  = require('gulp-minify-css'),
    minifyHTML = require('gulp-minify-html'),
    minifyJS   = require('gulp-uglify'),
    mocha      = require('gulp-mocha'),
    moment     = require('moment');


/* *
 * Build step 0
 */

// Clean the build dir
gulp.task('clean', function(done) {
    del(['build/**', '!build'])
        .then(done());
});


/* *
 * Build step 1
 */

// Catchall to copy static files to build
gulp.task('static', ['clean'], function() {
    return gulp.src('src/static/**')
        .pipe(gzip({ append: false }))
        .pipe(gulp.dest('build'));
});


// Minify and combine all JavaScript
gulp.task('scripts', ['clean'], function() {
    return gulp.src([
            'node_modules/jquery/dist/jquery.js',
            'node_modules/bootstrap/bootstrap.js',
            'src/js/*'
        ])
        .pipe(concat('all.min.js'))
        .pipe(minifyJS({ preserveComments: 'some' }))
        .pipe(gzip({ append: false }))
        .pipe(gulp.dest('build/js'));
});


// Minify and combine all CSS
gulp.task('styles', ['clean'], function() {
    return gulp.src([
            'node_modules/bootstrap/dist/css/bootstrap.css',
            'src/css/custom.css',
            'src/css/font-awesome.min.css'
        ])
        .pipe(minifyCSS())
        .pipe(concat('all.min.css'))
        .pipe(gzip({ append: false }))
        .pipe(gulp.dest('build/css'));
});


// Compile HB template
gulp.task('views', ['clean'], function(done) {
    fs.readFile('./node_modules/void/README.md', 'utf-8', function(err, readme) {
        if (err) throw err;
        fs.readFile('./node_modules/void/package.json', 'utf-8', function(err, pkg) {
            if (err) throw err;

            var data = {
                year      : moment().format('YYYY'),
                timestamp : moment().format('YYYY-MM-DD-HH-mm-ss'),
                readme    : marked(readme),
                version   : JSON.parse(pkg).version
            };

            gulp.src('src/views/*.html')
                .pipe(hb(data))
                .pipe(minifyHTML())
                .pipe(gzip({ append: false }))
                .pipe(gulp.dest('build'))
                .on('end', done);
        });
    });
});


/* *
 * Build Step 2
 */

// Run tests
gulp.task('test', ['static', 'scripts', 'styles', 'views'], function() {
    return gulp.src('test/*')
        .pipe(mocha());
});


/* *
 * Helper tasks
 */

// Serve built files
gulp.task('serve', function(done) {
    var port = argv.p || 3000;

    express()
        .use(function(req, res, next) {
            res.header('Content-Encoding', 'gzip');
            next();
        })
        .use(express.static('build'))
        .use(function(req, res) {
            res.status(404)
                .sendFile(__dirname + '/build/error.html');
        })
        .listen(port, function() {
            gutil.log('Server listening on port', port);
            done();
        });
});

// Watch files
gulp.task('watch', ['build'], function() {
    return gulp.watch('src/**', ['build']);
});

// Perform a build
gulp.task('build', [
    // 'clean',
    // 'static', 'scripts', 'styles', 'views'
    'test'
]);

// What to do when you run `$ gulp`
gulp.task('default', ['watch', 'serve']);