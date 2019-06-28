// Requires
/* global require: true */
const fs = require('fs'),
	path = require('path'),
	gulp = require('gulp'),
	injectfile = require('gulp-inject-file'),	// https://www.npmjs.com/package/gulp-inject-file
	rename = require("gulp-rename"), 			// https://www.npmjs.com/package/gulp-rename
	contents = require('gulp-inject-string'),	// https://www.npmjs.com/package/gulp-inject-string
	cfg = require('./plugin.config.json'),
	trimlines = require('gulp-trimlines'),
	eslint = require('gulp-eslint'),
	del = require('del'),
	sequence = require('gulp-sequence');
	autoFixTask = require('gulp-eslint-auto-fix')

function ensureDirectoryExistence(filePath) {
	var dirname = path.dirname(filePath);
	if (fs.existsSync(dirname)) {
		return true;
	}
	ensureDirectoryExistence(dirname);
	fs.mkdirSync(dirname);
}

// Config
var status = {
	headers: null,
	mode: null
};

// status related tasks
gulp.task('set-mode-dev', function (cb) {
	status.mode = 'dev';
	cb();
});

gulp.task('set-mode-prod', function (cb) {
	status.mode = 'prod';
	cb();
});

gulp.task('clear', function (cb) {
	status.headers = null;
	status.mode = null;
	cb();
});

// build tasks
gulp.task('buildheaders', function(cb) {
	var content = fs.readFileSync(cfg.src.meta, 'utf8'),
		rmHeaders = cfg.headers[status.mode],
		commonHeaders = cfg.headers.common;
	
	// release mode headers
	for (let k in rmHeaders) {
		content = content.replace(new RegExp(`(//\\s*@${k}\\s+){{}}`), `$1${rmHeaders[k]}`);
	}

	// common headers
	for (let k in commonHeaders) {
		content = content.replace(new RegExp(`(//\\s*@${k}\\s+){{}}`), `$1${commonHeaders[k]}`);
	}
	
	status.headers = content;

	cb();
});

gulp.task('buildplugin', function (cb) {
	var destination = cfg.releaseFolder[status.mode];

	gulp.src(cfg.src.plugin)
		// prepend headers
		.pipe(contents.prepend(status.headers))
		// inject files
		.pipe(injectfile({
			pattern: '\\/\\*+\\s*inject:\\s*<filename>\\s*\\*+\\/'
		}))
		// trim leading spaces
		.pipe( trimlines({leading: false}) )
		// rename and save
		.pipe(rename(cfg.pluginName))
		.pipe(gulp.dest(destination));
	cb();
});

gulp.task('buildmeta', function (cb) {
	var	path = cfg.releaseFolder[status.mode] + cfg.metaName;
	
	ensureDirectoryExistence(path);
	fs.writeFile(path, status.headers, (err) => {
		cb(err);
	}); 
});

// ESLint
gulp.task('eslint', function(cb) {
	gulp.src(['**/*.js','!node_modules/**'])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
	cb();
});

gulp.task('build', function(cb) { sequence('buildheaders', 'buildmeta', 'buildplugin', 'eslint', cb); });

gulp.task('build-dev',  sequence('set-mode-dev',  'build', 'clear'));
gulp.task('build-prod', sequence('set-mode-prod', 'build', 'clear'));

gulp.task('default', ['build-dev']);

gulp.task('clean', function() { return del(['releases/*']); });


autoFixTask('fix-js', [
	'src/**/*.js',
])