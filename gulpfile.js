// Requires
/* global require: true */
const fs = require("fs"),
  path = require("path"),
  gulp = require("gulp"),
  injectfile = require("gulp-inject-file"), // https://www.npmjs.com/package/gulp-inject-file
  rename = require("gulp-rename"), // https://www.npmjs.com/package/gulp-rename
  contents = require("gulp-inject-string"), // https://www.npmjs.com/package/gulp-inject-string
  cfg = require("./plugin.config.json"),
  trimlines = require("gulp-trimlines"),
  eslint = require("gulp-eslint"),
  del = require("del"),
  webpack = require("webpack"),
  PluginError = require("plugin-error"),
  log = require("fancy-log"),
  jest = require("gulp-jest").default,
  prettier = require("gulp-prettier");

const ensureDirectoryExistence = filePath => {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
};

// Config
var status = {
  headers: null,
  mode: null
};

// status related tasks
gulp.task("set-mode-dev", cb => {
  status.mode = "dev";
  cb();
});

gulp.task("set-mode-prod", cb => {
  status.mode = "prod";
  cb();
});

gulp.task("clear", cb => {
  status.headers = null;
  status.mode = null;
  cb();
});

// build tasks
gulp.task("buildheaders", cb => {
  var content = fs.readFileSync(cfg.src.meta, "utf8"),
    rmHeaders = cfg.headers[status.mode],
    commonHeaders = cfg.headers.common;

  // release mode headers
  for (let k in rmHeaders) {
    content = content.replace(
      new RegExp(`(//\\s*@${k}\\s+){{}}`),
      `$1${rmHeaders[k]}`
    );
  }

  // common headers
  for (let k in commonHeaders) {
    content = content.replace(
      new RegExp(`(//\\s*@${k}\\s+){{}}`),
      `$1${commonHeaders[k]}`
    );
  }

  status.headers = content;

  cb();
});

gulp.task("jest", callback => {
  process.env.NODE_ENV = "test";
  gulp.src(cfg.src.test).pipe(
    jest({
      preprocessorIgnorePatterns: [
        "<rootDir>/dist/",
        "<rootDir>/node_modules/"
      ],
      automock: false
    })
  );
  callback();
});

gulp.task("webpack", callback => {
  var webpackConfig = require("./webpack.config.js");
  if (status.mode === "dev") {
    webpackConfig.mode = "development";
  }
  webpack(webpackConfig, function(err, stats) {
    log(
      "[webpack]",
      stats.toString({
        // output options
      })
    );

    if (err) {
      throw new PluginError("webpack", err);
    }

    callback();
  });
});

gulp.task("buildplugin", cb => {
  var destination = cfg.releaseFolder[status.mode];

  gulp
    .src(cfg.src.plugin)
    // prepend headers
    .pipe(contents.prepend(status.headers))
    // inject files
    .pipe(
      injectfile({
        pattern: "\\/\\*+\\s*inject:\\s*<filename>\\s*\\*+\\/"
      })
    )
    // trim leading spaces
    .pipe(trimlines({ leading: false }))
    // rename and save
    .pipe(rename(cfg.pluginName))
    .pipe(gulp.dest(destination));
  cb();
});

gulp.task("buildmeta", cb => {
  var path = cfg.releaseFolder[status.mode] + cfg.metaName;

  ensureDirectoryExistence(path);
  fs.writeFile(path, status.headers, err => {
    cb(err);
  });
});

// ESLint
gulp.task("eslint", cb => {
  gulp
    .src([
      "**/*.js",
      "!node_modules/**",
      "!dist/**",
      "!releases/**",
      "!src/lib/**"
    ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
  cb();
});

gulp.task("eslint-fix", cb => {
  gulp
    .src([
      "**/*.js",
      "!node_modules/**",
      "!dist/**",
      "!releases/**",
      "!src/lib/**"
    ])
    .pipe(eslint({ fix: true }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(gulp.dest("."));
  cb();
});

gulp.task("prettier", () => {
  return gulp
    .src([
      "**/*.js",
      "!node_modules/**",
      "!dist/**",
      "!releases/**",
      "!src/lib/**"
    ])
    .pipe(prettier())
    .pipe(gulp.dest("."));
});

gulp.task(
  "build",
  gulp.series([
    "buildheaders",
    "buildmeta",
    "jest",
    "webpack",
    "buildplugin",
    "eslint"
  ])
);

gulp.task("format", gulp.series(["prettier", "eslint-fix"]));

gulp.task(
  "build-dev",
  gulp.series(["set-mode-dev", "format", "build", "clear"])
);

gulp.task(
  "build-prod",
  gulp.series(["set-mode-prod", "format", "build", "clear"])
);

gulp.task("default", gulp.series(["build-dev"]));

gulp.task("clean", () => del(["releases/*"]));
