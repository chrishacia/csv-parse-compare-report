/*
----
All plugins between sourcemaps.init() and sourcemaps.write() need to support gulp-sourcemaps.
Check compatibility here:
https://github.com/floridoo/gulp-sourcemaps/wiki/Plugins-with-gulp-sourcemaps-support
----
*/

'use strict';

// Node (built-in)
var os = require('os');

// Modules we'll use
var PrettyError = require('pretty-error'); // Shows nice-looking errors in console
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var minimist = require('minimist');

var prettyError = new PrettyError();
prettyError.start();

var beepError = function (err) {
    $.util.beep();
    console.error(prettyError.render(err));
};

// ----
// Static Variables
// ----

var AUTOPREFIXER_BROWSERS = [
    'ie >= 8',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
];

// ----
// Parse CLI Parameters
// ----

var knownOptions = {
    string: 'env',
    default: { env: 'dev' }
};

// process is a Node global
var options = minimist(process.argv.slice(2), knownOptions);
var IS_PROD = options.env === 'prod';

// Compile and Automatically Prefix Stylesheets
gulp.task('styles', function () {
    // For best performance, don't add Sass partials to `gulp.src`
    return gulp.src('src/styles/*.scss')
        .pipe($.plumber({ errorHandler: beepError }))
        .pipe($.if(IS_PROD, $.sourcemaps.init()))
            .pipe($.sass({
                // Precision required by Bootstrap
                // https://github.com/twbs/bootstrap-sass#sass-number-precision
                precision: 8,
                onError: console.error.bind(console, 'Sass error:'),
                includePaths: ['node_modules/bootstrap-sass/assets/stylesheets']
            }))
            .pipe($.if(IS_PROD, $.autoprefixer({browsers: AUTOPREFIXER_BROWSERS})))

            // Minify and optimize CSS structure. This is excruciatingly slow. Only use in production
            .pipe($.if(IS_PROD, $.minifyCss()))
        .pipe($.if(IS_PROD, $.sourcemaps.write('.')))
        .pipe(gulp.dest('dist/styles'))
        .pipe($.size({title: 'styles'}));
});

// Watch Files For Changes & Reload
gulp.task('watch', ['default'], function () {
    browserSync({
        notify: false,
        logPrefix: 'CHACIA',
        proxy: 'https://' + os.hostname(), // hostname example: sub1.chacia.com
        'ignored': '*systems_safe_save_*.*' // for Transmit: https://panic.com/transmit/
    });

    gulp.watch(['../..//*.html'], reload);
    gulp.watch(['src/styles/**/*.{scss,css}'], ['styles', reload]);
});

// ----
// Images
// ----

// Compile and Automatically Prefix Stylesheets
gulp.task('images', function () {
    return gulp.src('src/images/*')
        .pipe(gulp.dest('dist/images'));
});

// ----
// Default
// ----

// Build Production Files, the Default Task
gulp.task('default', ['styles', 'images']);
