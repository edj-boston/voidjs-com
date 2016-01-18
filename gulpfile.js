'use strict';

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
gulp.task('clean', (done) => {
    return del([
        'build/**',
        '!build'
    ]);
});


/* *
 * Build step 1
 */

// Catchall to copy static files to build
gulp.task('static', () => {
    return gulp.src('src/static/**')
        .pipe(g.if('robots.txt', g.tap((file) => {
            if ( process.env.TRAVIS_BRANCH == 'master' )
                file.contents = new Buffer('');
        })))
        .pipe(gulp.dest('build'));
});


// Copy installed fonts
gulp.task('fonts', () => {
    return gulp.src([
        'node_modules/font-awesome/fonts/*',
        'node_modules/npm-font-open-sans/fonts/Regular/*',
        'node_modules/connect-fonts-sourcecodepro/fonts/default/sourcecodepro-regular.*'
    ])
    .pipe(gulp.dest('build/fonts'));
});


// Minify and combine all JavaScript
gulp.task('scripts', () => {
    return gulp.src([
        'node_modules/jquery/dist/jquery.js',
        'node_modules/bootstrap/dist/js/bootstrap.js',
        'src/js/*'
    ])
    .pipe(g.concat('all.min.js'))
    .pipe(g.uglify({ preserveComments: 'some' }))
    .pipe(gulp.dest('build/js'));
});


// Minify and combine all CSS
gulp.task('styles', () => {
    return gulp.src([
        'node_modules/bootstrap/dist/css/bootstrap.css',
        'node_modules/font-awesome/css/font-awesome.css',
        'src/less/custom.less'
    ])
    .pipe(g.if(/[.]less$/, g.less()))
    .pipe(g.cssnano())
    .pipe(g.concat('all.min.css'))
    .pipe(gulp.dest('build/css'));
});


/* *
 * Build step 2
 */

// Register partials
gulp.task('partials', () => {
    return gulp.src('src/views/partials/*.html')
        .pipe(g.tap((file) => {
            hb.registerPartial(path.parse(file.path).name, file.contents.toString());
        }));
});


/* *
 * Build step 3
 */

// Compile HB template
gulp.task('views', (done) => {
    fs.readFile('./node_modules/void/README.md', 'utf-8', (err, readme) => {
        if (err) throw err;
        fs.readFile('./node_modules/void/package.json', 'utf-8', (err, pkg) => {
            if (err) throw err;

            var data = {
                year      : moment().format('YYYY'),
                timestamp : moment().format('YYYY-MM-DD-HH-mm-ss'),
                readme    : marked(readme),
                version   : JSON.parse(pkg).version
            };

            gulp.src('src/views/*.html')
                .pipe(g.tap((file) => {
                    var template = hb.compile(file.contents.toString());
                    file.contents = new Buffer(template(data));
                }))
                .pipe(g.htmlmin({ collapseWhitespace: true }))
                .pipe(gulp.dest('build'))
                .on('end', done);
        });
    });
});


/* *
 * Build Step 4
 */

// Run tests
gulp.task('test', () => {
    return gulp.src('test/*')
        .pipe(g.mocha({
            require : ['should']
        }));
});


/* *
 * Build Step 5
 */

// Lint as JS files (including this one)
gulp.task('lint', () => {
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
gulp.task('serve', (done) => {
    var port = argv.p || 3000;

    express()
        .use(express.static('build'))
        .use((req, res) => {
            res.status(404)
                .sendFile(__dirname + '/build/error.html');
        })
        .listen(port, () => {
            g.util.log('Server listening on port', port);
            done();
        });
});


// Check deps with David service
gulp.task('deps', () => {
    return gulp.src('package.json')
        .pipe(g.david({ update: true }))
        .pipe(g.david.reporter)
        .pipe(gulp.dest('.'));
});


// Watch files
gulp.task('watch', () => {
    var globs = [
        'src/**/*',
        'test/*'
    ];

    gulp.watch(globs, ['build'])
        .on('change', (e) => {
            g.util.log('File', e.type, e.path);
        });
});


// Build macro
gulp.task('build', (done) => {
    g.sequence(
        'clean',
        ['static', 'fonts', 'scripts', 'styles'],
        'partials',
        'views',
        'test',
        'lint'
    )(done);
});


// Deploy to AWS S3
gulp.task('deploy', () => {
    var publisher = g.awspublish.create({
        accessKeyId     : process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey : process.env.AWS_SECRET_ACCESS_KEY,
        region          : 'us-west-2',
        params : {
            Bucket : argv.b
        }
    });

    return gulp.src('build/**')
        .pipe(g.awspublish.gzip())
        .pipe(publisher.publish())
        .pipe(publisher.sync())
        .pipe(g.awspublish.reporter());
});


// Examine package.json for unused deps (except for frontend and gulp)
gulp.task('package', g.depcheck({
    ignoreMatches: [
        'bootstrap',
        'connect-fonts-sourcecodepro',
        'font-awesome',
        'gulp-*',
        'jquery',
        'npm-font-open-sans',
        'should',
        'void'
    ]
}));


// What to do when you run `$ gulp`
gulp.task('default', (done) => {
    g.sequence(
        'deps',
        'package',
        'build',
        'watch',
        'serve'
    )(done);
});