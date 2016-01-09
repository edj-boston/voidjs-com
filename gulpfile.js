var argv    = require('yargs').argv,
    del     = require('del'),
    express = require('express'),
    fs      = require('fs'),
    g       = require('gulp-load-plugins')(),
    gulp    = require('gulp'),
    hb      = require('handlebars'),
    layouts = require('handlebars-layouts'),
    marked  = require('marked'),
    moment  = require('moment'),
    path    = require('path');


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
        .pipe(g.if(/robots\.txt/, g.tap(function(file) {
            if ( process.env.TRAVIS_BRANCH == 'master' )
                file.contents = new Buffer('');
        })))
        .pipe(g.gzip({ append: false }))
        .pipe(gulp.dest('build'));
});


// Copy installed fonts
gulp.task('fonts', ['clean'], function() {
    return gulp.src([
        'node_modules/font-awesome/fonts/*',
        'node_modules/npm-font-open-sans/fonts/Regular/*',
        'node_modules/connect-fonts-sourcecodepro/fonts/default/sourcecodepro-regular.*'
    ])
    .pipe(g.gzip({ append: false }))
    .pipe(gulp.dest('build/fonts'));
});


// Minify and combine all JavaScript
gulp.task('scripts', ['clean'], function() {
    return gulp.src([
        'node_modules/jquery/dist/jquery.js',
        'node_modules/bootstrap/dist/js/bootstrap.js',
        'src/js/*'
    ])
    .pipe(g.concat('all.min.js'))
    .pipe(g.uglify({ preserveComments: 'some' }))
    .pipe(g.gzip({ append: false }))
    .pipe(gulp.dest('build/js'));
});


// Minify and combine all CSS
gulp.task('styles', ['clean'], function() {
    return gulp.src([
        'node_modules/bootstrap/dist/css/bootstrap.css',
        'node_modules/font-awesome/css/font-awesome.css',
        'src/less/custom.less'
    ])
    .pipe(g.if(/[.]less$/, g.less()))
    .pipe(g.cssnano())
    .pipe(g.concat('all.min.css'))
    .pipe(g.gzip({ append: false }))
    .pipe(gulp.dest('build/css'));
});


/* *
 * Build step 2
 */

// Register partials
gulp.task('partials', ['static', 'fonts', 'scripts', 'styles'], function() {
    return gulp.src('src/views/partials/*.html')
        .pipe(g.tap(function(file) {
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
                .pipe(g.tap(function(file) {
                    var template = hb.compile(file.contents.toString());
                    file.contents = new Buffer(template(data));
                }))
                .pipe(g.htmlmin({ collapseWhitespace: true }))
                .pipe(g.gzip({ append: false }))
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
        .pipe(g.mocha({
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
    .pipe(g.eslint())
    .pipe(g.eslint.format());
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
            g.util.log('Server listening on port', port);
            done();
        });
});


// Check deps with David service
gulp.task('deps', function() {
    return gulp.src('package.json')
        .pipe(g.david({ update: true }))
        .pipe(g.david.reporter)
        .pipe(gulp.dest('.'));
});


// Watch files
gulp.task('watch', ['build'], function() {
    return gulp.watch([
        'src/**',
        'test*'
    ], ['build']);
});


// Build macro
gulp.task('build', [
    // Step 0: clean
    // Step 1: static, fonts, scripts, styles
    // Step 2: partials
    // Step 3: views
    // Step 4: test
    'lint'
]);


// What to do when you run `$ gulp`
gulp.task('default', [
    'watch',
    'serve',
    'deps'
]);