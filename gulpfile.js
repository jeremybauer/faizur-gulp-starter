// Initialize modules
const gulp = require("gulp");
const sourcemaps = require("gulp-sourcemaps");
const browsersync = require("browser-sync").create();
const autoprefixer = require("autoprefixer");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const cssnano = require("cssnano");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify-es").default;
const rename = require("gulp-rename");
const del = require("del");
// const replace = require("gulp-replace");
const plumber = require("gulp-plumber");
const twig = require("gulp-twig");
const cache = require("gulp-cache");
// const htmlmin = require("gulp-htmlmin");

// paths
const paths = {
  root: {
    css: "scss/",
    js: "js/",
    template: "templates/",
    appCss: "app/css/",
    appJs: "app/js/",
    bootstrap: "node_modules/bootstrap"
  }
};

// BrowserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: "./app",
      proxy: "localhost:3001"
    },
    notify: false
  });
  done();
}
// BrowserSync Reload
function browserSyncReload(done) {
  cache.clearAll();
  browsersync.reload();
  done();
}

// css
function css() {
  return gulp
    .src(paths.root.css + "style.scss")
    .pipe(sourcemaps.init()) // initialize sourcemaps first
    .pipe(sass()) // compile SCSS to CSS
    .pipe(plumber(function(error) {}))
    .pipe(postcss([autoprefixer(), cssnano()])) // PostCSS plugins
    .pipe(
      rename({
        suffix: ".min"
      })
    )
    .pipe(sourcemaps.write("./")) // write sourcemaps file in current directory
    .pipe(gulp.dest(paths.root.appCss)) // put final CSS in  folder
    .pipe(browsersync.stream());
}

// Entry JS
function js() {
  return gulp
    .src([paths.root.js + "entry.js"])
    .pipe(sourcemaps.init()) // initialize sourcemaps first
    .pipe(concat("index.js"))
    .pipe(plumber(function(error) {}))
    .pipe(uglify())
    .pipe(
      rename({
        suffix: ".min"
      })
    )
    .pipe(sourcemaps.write("./")) // write sourcemaps file in current directory
    .pipe(gulp.dest(paths.root.appJs)) // put final js in folder
    .pipe(browsersync.stream());
}

// html templating
function twigHtml() {
  return gulp
    .src(paths.root.template + "pages/**/*.twig")
    .pipe(twig())
    .pipe(gulp.dest("./app"))
    .pipe(browsersync.stream());
}
function twigBuild() {
  gulp.task(
    "reloadHtml",
    gulp.series([twigHtml], function() {
      gulp.watch(pathss.root.templatePages + "**/*.twig", browserSync.reload);
      gulp.watch("**/*.html", browserSync.reload);
    })
  );
}

// Watch files
function watchFiles() {
  gulp.watch([paths.root.css + "**/*"], css);
  gulp.watch([paths.root.js + "**/*"], gulp.series(js));
  gulp.watch([paths.root.template + "**/*"], gulp.series(twigHtml));
  gulp.watch(
    [
      "**/*.html",
      paths.root.template + "**/*.twig",
      paths.root.css + "**/*.sass",
      paths.root.css + "**/*.scss",
      paths.root.css + "**/*.css",
      paths.root.js + "**/*.js"
    ],
    gulp.series(browserSyncReload)
  );
}

const watch = gulp.series(gulp.parallel(watchFiles, twigBuild, browserSync));
// export tasks
exports.css = css;
exports.js = js;
exports.watch = watch;
exports.default = watch;
