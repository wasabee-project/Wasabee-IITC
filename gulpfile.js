// Requires
const gulp = require("gulp");
const del = require("del");
const through2 = require("through2");

// locales, key parity
gulp.task("locales", (cb) => {
  const english = require("./src/code/translations/english.json");
  function format(buf, ref) {
    const parsed = JSON.parse(buf.toString("utf8"));
    const result = {};
    for (const key in ref) result[key] = parsed[key] || ref[key];
    return JSON.stringify(result, null, 2) + "\n";
  }

  gulp
    .src("./src/code/translations/*.json")
    .pipe(
      through2.obj(function (file, enc, cb) {
        if (file.isBuffer()) {
          file.contents = Buffer.from(format(file.contents, english));
          cb(null, file);
        } else {
          file.contents.pipe(
            through2(function (contents) {
              file.contents = through2();
              cb(null, file);
              file.contents.write(format(contents, english));
              file.contents.end();
            })
          );
        }
      })
    )
    .pipe(gulp.dest("./src/code/translations/"));
  cb();
});

gulp.task("default", gulp.series(["locales"]));

gulp.task("clean", () => del(["releases/*"]));
