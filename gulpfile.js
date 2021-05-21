// Requires
const fs = require("fs");
const path = require("path");
const gulp = require("gulp");
const injectfile = require("gulp-inject-file"); // https://www.npmjs.com/package/gulp-inject-file
const rename = require("gulp-rename"); // https://www.npmjs.com/package/gulp-rename
const contents = require("gulp-inject-string"); // https://www.npmjs.com/package/gulp-inject-string
const cfg = require("./plugin.config.json");
const trimlines = require("gulp-trimlines");
const eslint = require("gulp-eslint");
const del = require("del");
const webpack = require("webpack");
const PluginError = require("plugin-error");
const log = require("fancy-log");
const prettier = require("gulp-prettier");

const ensureDirectoryExistence = (filePath) => {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) return;

  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
};

// Config
var status = {
  headers: null,
  mode: null,
};

// status related tasks
gulp.task("set-mode-dev", (cb) => {
  status.mode = "dev";
  cb();
});

gulp.task("set-mode-prod", (cb) => {
  status.mode = "prod";
  cb();
});

gulp.task("clear", (cb) => {
  status.headers = null;
  status.mode = null;
  cb();
});

// build tasks
gulp.task("buildheaders", (cb) => {
  const content = fs.readFileSync(cfg.src.meta, "utf8");

  let newContent = "";
  for (const l of content.split("\n")) {
    let newline = l;
    for (const k of Object.keys(cfg.headers.common)) {
      if (l.indexOf(`@${k} `) == 3) {
        newline = `// @${k} 	 ${cfg.headers.common[k]}`;
        break;
      }
    }
    for (const k of Object.keys(cfg.headers[status.mode])) {
      if (l.indexOf(`@${k} `) == 3) {
        newline = `// @${k} 	 ${cfg.headers[status.mode][k]}`;
        break;
      }
    }
    newContent += newline + "\n";
  }

  // XXX just append to the version rather than overwriting a fixed string now
  const gbd = () => {
    const d = new Date();
    let bd = d.getUTCFullYear();
    let t = ("0" + (d.getUTCMonth() + 1)).substr(-2);
    bd += t;
    t = ("0" + d.getUTCDate()).substr(-2);
    bd += t;
    t = ("0" + d.getUTCHours()).substr(-2);
    bd += t;
    t = ("0" + d.getUTCMinutes()).substr(-2);
    bd += t;
    t = ("0" + d.getUTCSeconds()).substr(-2);
    bd += t;
    return bd;
  };
  newContent = newContent.replace("BUILDDATE", gbd());

  status.headers = newContent;

  cb();
});

gulp.task("webpack", (callback) => {
  const webpackConfig = require("./webpack.config.js");
  if (status.mode === "prod") {
    webpackConfig.mode = "production";
    webpackConfig.devtool = "nosources-source-map";
  }
  if (status.mode === "dev") {
    webpackConfig.mode = "development";
    webpackConfig.devtool = "eval-source-map";
    // webpackConfig.optimization.minimize = true;
  }
  webpack(webpackConfig, function (err, stats) {
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

gulp.task("buildplugin", (cb) => {
  const destination = cfg.releaseFolder[status.mode];

  gulp
    .src(cfg.src.plugin)
    // prepend headers
    .pipe(contents.prepend(status.headers))
    // inject files
    .pipe(
      injectfile({
        pattern: "\\/\\*+\\s*inject:\\s*<filename>\\s*\\*+\\/",
      })
    )
    // trim leading spaces
    .pipe(trimlines({ leading: false }))
    // rename and save
    .pipe(rename(cfg.pluginName))
    .pipe(gulp.dest(destination));
  cb();
});

gulp.task("buildmeta", (cb) => {
  const p = path.join(cfg.releaseFolder[status.mode], cfg.metaName);

  ensureDirectoryExistence(p);
  fs.writeFile(p, status.headers, (err) => {
    cb(err);
  });
});

// ESLint
gulp.task("eslint", (cb) => {
  gulp
    .src([
      "**/*.js",
      "!node_modules/**",
      "!dist/**",
      "!releases/**",
      "!src/lib/**",
    ])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
  cb();
});

gulp.task("eslint-fix", (cb) => {
  gulp
    .src([
      "**/*.js",
      "!node_modules/**",
      "!dist/**",
      "!releases/**",
      "!src/lib/**",
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
      "!src/lib/**",
    ])
    .pipe(prettier())
    .pipe(gulp.dest("."));
});

// eslint at the end to catch unused variables, etc
gulp.task(
  "build",
  gulp.series(["buildheaders", "buildmeta", "webpack", "buildplugin", "eslint"])
);

// eslint-fix too
gulp.task("format", gulp.series(["prettier", "eslint-fix"]));
// gulp.task("format", gulp.series(["prettier"]));

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
