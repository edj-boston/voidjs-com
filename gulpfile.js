'use strict';

const argv  = require('yargs').argv,
    del     = require('del'),
    express = require('express'),
    fs      = require('fs'),
    g       = require('gulp-load-plugins')(),
    gulp    = require('gulp'),
    hb      = require('handlebars'),
    layouts = require('handlebars-layouts'),
    marked  = require('marked'),
    moment  = require('moment'),
    path    = require('path'),
    rules   = require('edj-eslint-rules');


// Configure handlebars
layouts.register(hb);


// Clean the build dir
gulp.task('clean', () => {
    return del([
        'build/**',
        '!build'
    ]);
});


// Catchall to copy static files to build
gulp.task('static', () => {
    return gulp.src('src/static/**')
        .pipe(g.if('robots.txt', g.tap(file => {
            if (process.env.TRAVIS_BRANCH == 'master') {
                file.contents = new Buffer('');
            }
        })))
        .pipe(gulp.dest('build'));
});


// Copy installed fonts
gulp.task('fonts', () => {
    const globs = [
        'node_modules/font-awesome/fonts/*',
        'node_modules/npm-font-open-sans/fonts/Regular/*',
        'node_modules/connect-fonts-sourcecodepro/fonts/default/sourcecodepro-regular.*'
    ];

    return gulp.src(globs)
        .pipe(gulp.dest('build/fonts'));
});


// Minify and combine all JavaScript
gulp.task('scripts', () => {
    const globs = [
        'node_modules/jquery/dist/jquery.js',
        'node_modules/bootstrap/dist/js/bootstrap.js',
        'src/js/*.js'
    ];

    return gulp.src(globs)
        .pipe(g.sourcemaps.init({ loadMaps : true }))
        .pipe(g.babel({
            presets  : [ 'es2015' ],
            comments : true,
            compact  : false
        }))
        .pipe(g.concat('all.min.js'))
        .pipe(g.uglify({ preserveComments : 'some' }))
        .pipe(g.sourcemaps.write('.'))
        .pipe(gulp.dest('build/js'));
});


// Minify and combine all CSS
gulp.task('styles', () => {
    const globs = [
        'node_modules/bootstrap/dist/css/bootstrap.css',
        'node_modules/font-awesome/css/font-awesome.css',
        'src/less/custom.less'
    ];

    return gulp.src(globs)
        .pipe(g.sourcemaps.init({ loadMaps : true }))
        .pipe(g.if('*.less', g.less()))
        .pipe(g.cssnano())
        .pipe(g.concat('all.min.css'))
        .pipe(g.sourcemaps.write('.'))
        .pipe(gulp.dest('build/css'));
});


// Register partials
gulp.task('partials', () => {
    return gulp.src('src/views/partials/*.html')
        .pipe(g.tap(file => {
            hb.registerPartial(path.parse(file.path).name, file.contents.toString());
        }));
});


// Compile HB template
gulp.task('views', done => {
    fs.readFile('./node_modules/void/README.md', 'utf-8', (readmeErr, readme) => {
        if (readmeErr) throw readmeErr;
        fs.readFile('./node_modules/void/package.json', 'utf-8', (pkgErr, pkg) => {
            if (pkgErr) throw pkgErr;

            const data = {
                year      : moment().format('YYYY'),
                timestamp : moment().format('YYYY-MM-DD-HH-mm-ss'),
                readme    : marked(readme),
                version   : JSON.parse(pkg).version
            };

            if (process.env.TRAVIS_BRANCH == undefined) {
                data.env = 'local';
            } else if (process.env.TRAVIS_BRANCH != 'master') {
                data.env = process.env.TRAVIS_BRANCH;
            }

            gulp.src('src/views/*.html')
                .pipe(g.tap(file => {
                    const template = hb.compile(file.contents.toString());
                    file.contents = new Buffer(template(data));
                }))
                .pipe(g.htmlmin({ collapseWhitespace : true }))
                .pipe(gulp.dest('build'))
                .on('end', done);
        });
    });
});


// Run tests
gulp.task('test', () => {
    return gulp.src('test/*')
        .pipe(g.mocha({
            require : [ 'should' ]
        }));
});


// Lint as JS files (including this one)
gulp.task('lint-js', () => {
    const globs = [
        'src/js/*.js',
        'gulpfile.js',
        'test/*.js',
        '!node_modules/**'
    ];

    return gulp.src(globs)
        .pipe(g.eslint({
            extends       : 'eslint:recommended',
            parserOptions : { 'ecmaVersion' : 6 },
            rules
        }))
        .pipe(g.eslint.format());
});


// Lint all LESS files
gulp.task('lint-less', () => {
    return gulp.src('src/less/custom.less')
        .pipe(g.sourcemaps.init())
        .pipe(g.less())
        .pipe(g.csslint({
            'qualified-headings' : false,
            'unique-headings'    : false,
            'adjoining-classes'  : false
        }))
        .pipe(g.csslintLessReporter());
});


// Serve built files
gulp.task('serve', done => {
    const port = argv.p || 3000;

    express()
        .use(express.static('build'))
        .use((req, res) => {
            res.status(404)
                .sendFile(path.join(__dirname, '/build/error.html'));
        })
        .listen(port, () => {
            g.util.log('Server listening on port', port);
            done();
        });
});


// Check deps with David service
gulp.task('deps', () => {
    return gulp.src('package.json')
        .pipe(g.david());
});


// Watch files
gulp.task('watch', () => {
    const globs = [
        'src/**/*',
        'test/*'
    ];

    gulp.watch(globs, [ 'build' ])
        .on('change', e => {
            g.util.log('File', e.type, e.path);
        });
});


// Build macro
gulp.task('build', done => {
    g.sequence(
        'clean',
        [ 'static', 'fonts', 'scripts', 'styles', 'partials' ],
        'views',
        'test',
        [ 'lint-js', 'lint-less' ]
    )(done);
});


// Deploy to AWS S3
gulp.task('deploy', () => {
    const publisher = g.awspublish.create({
        accessKeyId     : process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey : process.env.AWS_SECRET_ACCESS_KEY,
        region          : 'us-west-2',
        params          : { Bucket : argv.b }
    });

    return gulp.src('build/**')
        .pipe(g.awspublish.gzip())
        .pipe(publisher.publish())
        .pipe(publisher.sync())
        .pipe(g.awspublish.reporter());
});


// Examine package.json for unused deps (except for frontend and gulp)
gulp.task('package', g.depcheck({
    ignoreMatches : [
        'babel-preset-es2015',
        'bootstrap',
        'connect-fonts-sourcecodepro',
        'font-awesome',
        'gulp-*',
        'mocha',
        'jquery',
        'npm-font-open-sans',
        'should',
        'void'
    ]
}));


// What to do when you run `$ gulp`
gulp.task('default', done => {
    g.sequence(
        'deps',
        'package',
        'build',
        'watch',
        'serve'
    )(done);
});
