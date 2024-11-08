//// Usage:
//// Copy this file to gulpfile_config.js to use it.
////
//// gulpfile.js will automatically include gulpfile_config.js if it exists.




//////// SIMPLE OPTIONS

//// When serving everything inlcuding LOWA binaries from one server.
//// E.g. for testing on localhost / 127.0.0.1.
////
//// Load soffice.* files from local public/ folder.
//// Use with "npm run debug". (other tasks clean the public/ folder)
soffice_base_url = '';

//// Disable cleaning the public folder for all tasks.
clean_disabled = true;




//////// ADVANCED OPTIONS

//// You may modify the debug target.
// exports.debug = gulp.series(gulp.parallel(compileHTML, compileJS, copyVendors));

//// Pick a custom browser and launch it automatically.
//custom_browser = "chromium";  // ["google chrome", "firefox"]
//exports.debug = gulp.series(gulp.parallel(compileHTML, compileJS, copyVendors),
//    gulp.parallel(watchFiles, initBrowserSync) );
