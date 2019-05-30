"use strict";

const autoprefixer = require("gulp-autoprefixer");
const browsersync = require("browser-sync").create();
const cleanCSS = require("gulp-clean-css");
const del = require("del");
const gulpfile = require("gulp");
const header = require("gulp-header");
const merge = require("merge-stream");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const uglify = require("gulp-uglify");

// Load package.json for banner
const pkg = require('./package.json');

// Set the banner content
const banner = ['/*!\n',
    ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
    ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
    ' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
    ' */\n',
    '\n'
].join('');

// BrowserSync
function browserSync(done) {
    browsersync.init({
        server: {
            baseDir: "./"
        },
        port: 3000
    });
    done();
}

// BrowserSync reload
function browserSyncReload(done) {
    browsersync.reload();
    done();
}

// Clean vendor
function clean() {
    return del(["./vendor/"]);
}

// Bring third party dependencies from node_modules into vendor directory
function modules() {
    // Bootstrap
    var bootstrap = gulpfile.src('./node_modules/bootstrap/dist/**/*')
        .pipe(gulpfile.dest('./vendor/bootstrap'));
    // Font Awesome
    var fontAwesome = gulpfile.src('./node_modules/@fortawesome/**/*')
        .pipe(gulpfile.dest('./vendor'));
    // jQuery Easing
    var jqueryEasing = gulpfile.src('./node_modules/jquery.easing/*.js')
        .pipe(gulpfile.dest('./vendor/jquery-easing'));
    // jQuery
    var jquery = gulpfile.src([
        './node_modules/jquery/dist/*',
        '!./node_modules/jquery/dist/core.js'
    ])
        .pipe(gulpfile.dest('./vendor/jquery'));
    return merge(bootstrap, fontAwesome, jquery, jqueryEasing);
}

// CSS task
function css() {
    return gulpfile
        .src("./scss/**/*.scss")
        .pipe(plumber())
        .pipe(sass({
            outputStyle: "expanded",
            includePaths: "./node_modules",
        }))
        .on("error", sass.logError)
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(header(banner, {
            pkg: pkg
        }))
        .pipe(gulpfile.dest("./css"))
        .pipe(rename({
            suffix: ".min"
        }))
        .pipe(cleanCSS())
        .pipe(gulpfile.dest("./css"))
        .pipe(browsersync.stream());
}

// JS task
function js() {
    return gulpfile
        .src([
            './js/*.js',
            '!./js/*.min.js'
        ])
        .pipe(uglify())
        .pipe(header(banner, {
            pkg: pkg
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulpfile.dest('./js'))
        .pipe(browsersync.stream());
}

// Watch files
function watchFiles() {
    gulpfile.watch("./scss/**/*", css);
    gulpfile.watch("./js/**/*", js);
    gulpfile.watch("./**/*.html", browserSyncReload);
}

// Define complex tasks
const vendor = gulpfile.series(clean, modules);
const build = gulpfile.series(vendor, gulpfile.parallel(css, js));
const watch = gulpfile.series(build, gulpfile.parallel(watchFiles, browserSync));

// Export tasks
exports.css = css;
exports.js = js;
exports.clean = clean;
exports.vendor = vendor;
exports.build = build;
exports.watch = watch;
exports.default = build;
