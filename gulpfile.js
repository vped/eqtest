"use strict";

const autoprefixer = require("gulp-autoprefixer");
const browsersync = require("browser-sync").create();
const cleanCSS = require("gulp-clean-css");
const del = require("del");
const gulpfile = require("gulp");
const merge = require("merge-stream");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const uglify = require("gulp-uglify");


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
    // jQuery
    var jquery = gulpfile.src([
        './node_modules/jquery/dist/*',
        '!./node_modules/jquery/dist/core.js'
    ])
        .pipe(gulpfile.dest('./vendor/jquery'));
    return merge(bootstrap, jquery);
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
exports.watch = watch;
