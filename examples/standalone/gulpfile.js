"use strict";

// Load Plugins
const browserSync = require("browser-sync").create();
const del = require('del');
const gulp = require('gulp');
const beautify = require('gulp-beautify');
const inject = require('gulp-inject-string');
const mergeStream = require('merge-stream');

/**
 * Set the destination/production directory
 * This is where the project is compiled and exported for production.
 * This folder is auto created and managed by gulp.
 * Do not add/edit/save any files or folders iside this folder. They will be deleted by the gulp tasks.
*/
const distDir = './public/';

// Clean up the dist folder before running any task
function clean() {
  return del(distDir + '**/*');
}

// Task: Compile HTML
function compileHTML() {
  let css_links ='<link href="assets/vendor/bootstrap/bootstrap.min.css" rel="stylesheet">';
  let js_links = '<script src="assets/vendor/bootstrap/bootstrap.bundle.min.js"></script>';

  return gulp.src(['index.html'])
    .pipe( inject.replace('<!-- Vendor CSS Files -->', css_links) )
    .pipe( inject.replace('<!-- Vendor JS Files -->', js_links) )
    .pipe(gulp.dest(distDir))
    .pipe(browserSync.stream());
}

// Task: Compile JS
function compileJS() {
  return gulp.src( './index.js')
    .pipe(beautify.js({ indent_size: 2, max_preserve_newlines: 2}))
    .pipe(gulp.dest(distDir))
    .pipe(browserSync.stream());
}

// Task: Copy Vendors
function copyVendors() {
  let stream = mergeStream();

  stream.add( gulp.src( 'node_modules/zetajs/source/zeta.js' ).pipe( gulp.dest( distDir + 'assets/vendor/zetajs/' ) ) );
  stream.add( gulp.src( 'node_modules/bootstrap/dist/css/bootstrap.min.css' ).pipe( gulp.dest( distDir + 'assets/vendor/bootstrap/' ) ) );
  stream.add( gulp.src( 'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js' ).pipe( gulp.dest( distDir + 'assets/vendor/bootstrap/' ) ) );

  return stream;
}

// Init live server browser sync
function initBrowserSync(done) {
  browserSync.init({
    server: {
      baseDir: distDir,
      middleware: function (req, res, next) {
        // required for WASM (SharedArray support)
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
        next();
      }
    },
    port: 3000,
    notify: false
  });
  done();
}

// Watch files
function watchFiles() {
  gulp.watch('*.html', compileHTML);
  gulp.watch('*.js', compileJS);
}

// Export tasks
const dist = gulp.series(clean, gulp.parallel(compileHTML, compileJS, copyVendors) );

exports.watch = gulp.series(dist, watchFiles);
exports.start = gulp.series(dist, gulp.parallel(watchFiles, initBrowserSync) );
exports.default = dist;
