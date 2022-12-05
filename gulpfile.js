/**
 * gulp setup
 */ 
const {name, version} = require('./package.json')
const { src, dest, series, parallel, watch } = require("gulp")
const browserSync = require('browser-sync').create()
const nodesass = require("gulp-sass")(require("sass"))
const sourcemaps = require("gulp-sourcemaps")
const autoprefixer = require("gulp-autoprefixer")
const cleancss = require("gulp-clean-css")
const archiver = require("gulp-archiver")
const cleanfiles = require("gulp-clean")
const babel = require("gulp-babel")
const concat = require("gulp-concat")
const plumber = require("gulp-plumber")
const uglify  = require('gulp-uglify')

const versionDate = new Date()

const browserSupport = [
  "last 2 version",
  "safari 5",
  "ie 8",
  "ie 9",
  "opera 12.1",
  "ios 6",
  "android 4",
];

const ASSETS = "assets/",
      NODE_MODULES = "node_modules/",
      DIST = "dist/"

const path = {
  sass: [
    ASSETS + "scss/styles.scss"
  ],
  libs: [
    ASSETS + "libs/highlight.min.js",
    NODE_MODULES + "",
  ],
  scripts: ASSETS + "js/common.js",
  watch: [
      ASSETS + "scss/**/*.scss",
  ]
};

const copyImages = () => {
  return (
    src(`${ASSETS}images/*.*`)
    .pipe(dest(`${DIST}images/`))
  )
}

// Compile JavaScript Files
const libs = () => {
  return (
    src(path.libs)
    .pipe(plumber())
    .pipe(concat("libs.js"))
    .pipe(dest(`${DIST}js/`))
  )
}

 // Compile JavaScript Files
 const scripts = () => {
  return (
    src(path.scripts)
    .pipe(plumber())
    .pipe(concat("common.js"))
    .pipe(
      babel({
        presets: [
          [
            "@babel/env",
            {
              modules: false,
            },
          ],
        ],
      })
    )
    // .pipe(uglify())
    .pipe(dest(`${DIST}js/`))
  )
}

// Compile SCSS into CSS
const sass = () => {
  return (
    src(path.sass)
    .pipe(sourcemaps.init())
    .pipe(nodesass.sync().on("error", nodesass.logError))
    .pipe(autoprefixer(browserSupport))
    .pipe(sourcemaps.write())
    .pipe(dest(`${DIST}css/`))
    .pipe(browserSync.stream())
  )
}

// Compile CSS
const css = () => {
  return (
    src([ASSETS + "scss/styles.scss"])
    .pipe(nodesass.sync().on("error", nodesass.logError))
    .pipe(autoprefixer(browserSupport))
    .pipe(cleancss())
    .pipe(dest(`${DIST}css/`))
  )
}

// SERVER
const server = () => {
  return browserSync.init({
    server: {
      opne: 'external',
      host: `${name}.local"`,
      proxy: `https://${name}.local"`,
    }
  })
}

const serverReload = (done) => {
  browserSync.reload()
  done()
}

// Watch sass
const watching = () => {
  return (
    watch(path.watch, series(sass, serverReload)),
    watch(path.watch, series(css, serverReload)),
    watch(path.scripts, series(scripts, serverReload)),
    watch(ASSETS + "images/**/*.*", series(copyImages, serverReload)),
    watch("./*.html*", serverReload)
  )
}


// Export Watch 
exports.watch = watching;
exports.css = css;

// Tasks Default
exports.default = series(copyImages, sass, css, libs, scripts, server)