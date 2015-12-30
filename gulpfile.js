var argv       = require('yargs').argv,
    concat     = require('gulp-concat'),
    del        = require('del'),
    eslint     = require('gulp-eslint'),
    express    = require('express'),
    fs         = require('fs'),
    gulp       = require('gulp'),
    gulpif     = require('gulp-if'),
    gutil      = require('gulp-util'),
    gzip       = require('gulp-gzip'),
    hb         = require('handlebars'),
    layouts    = require('handlebars-layouts'),
    less       = require('gulp-less'),
    marked     = require('marked'),
    minifyCSS  = require('gulp-minify-css'),
    minifyHTML = require('gulp-minify-html'),
    minifyJS   = require('gulp-uglify'),
    mocha      = require('gulp-mocha'),
    moment     = require('moment'),
    path       = require('path'),
    tap        = require('gulp-tap');


// Configure handlebars
layouts.register(hb);


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
        .pipe(gulpif(/robots\.txt/, tap(function(file) {
            if ( process.env.TRAVIS_BRANCH == 'master' )
                file.contents = new Buffer('');
        })))
        .pipe(gzip({ append: false }))
        .pipe(gulp.dest('build'));
});


// Copy installed fonts
gulp.task('fonts', ['clean'], function() {
    return gulp.src([
        'node_modules/font-awesome/fonts/*',
        'node_modules/npm-font-open-sans/fonts/Regular/*',
        'node_modules/connect-fonts-sourcecodepro/fonts/default/sourcecodepro-regular.*'
    ])
    .pipe(gzip({ append: false }))
    .pipe(gulp.dest('build/fonts'));
});


// Minify and combine all JavaScript
gulp.task('scripts', ['clean'], function() {
    return gulp.src([
        'node_modules/jquery/dist/jquery.js',
        'node_modules/bootstrap/dist/js/bootstrap.js',
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
        'node_modules/font-awesome/css/font-awesome.css',
        'src/less/*'
    ])
    .pipe(gulpif(/[.]less$/, less()))
    .pipe(minifyCSS())
    .pipe(concat('all.min.css'))
    .pipe(gzip({ append: false }))
    .pipe(gulp.dest('build/css'));
});


/* *
 * Build step 2
 */

// Register partials
gulp.task('partials', ['static', 'fonts', 'scripts', 'styles'], function() {
    return gulp.src('src/views/partials/*.html')
        .pipe(tap(function(file) {
            hb.registerPartial(path.parse(file.path).name, file.contents.toString());
        }));
});


/* *
 * Build step 3
 */

// Compile HB template
gulp.task('views', ['partials'], function(done) {
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
                .pipe(tap(function(file) {
                    var template = hb.compile(file.contents.toString());
                    file.contents = new Buffer(template(data));
                }))
                .pipe(minifyHTML())
                .pipe(gzip({ append: false }))
                .pipe(gulp.dest('build'))
                .on('end', done);
        });
    });
});


/* *
 * Build Step 4
 */

// Run tests
gulp.task('test', ['views'], function() {
    return gulp.src('test/*')
        .pipe(mocha({
            require : ['should']
        }));
});


/* *
 * Build Step 5
 */

// Lint as JS files (including this one)
gulp.task('lint', ['test'], function () {
    return gulp.src([
        'src/js/*.js',
        'gulpfile.js',
        'test/*.js',
        '!node_modules/**'
    ])
    .pipe(eslint())
    .pipe(eslint.format());
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
    // Step 0: clean
    // Step 1: static, fonts, scripts, styles
    // Step 2: partials
    // Step 3: views
    // Step 4: test
    'lint'
]);

// What to do when you run `$ gulp`
gulp.task('default', ['watch', 'serve']);