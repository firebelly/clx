const gulp         = require('gulp');
const gulpif       = require('gulp-if');
const sass         = require('gulp-sass');
const uglify       = require('gulp-uglify');
const autoprefixer = require('gulp-autoprefixer');
const cssnano      = require('gulp-cssnano');
const include      = require('gulp-include');
const rev          = require('gulp-rev');
const revdel       = require('gulp-rev-delete-original');
const sourcemaps   = require('gulp-sourcemaps');
const notify       = require('gulp-notify');
const browsersync  = require('browser-sync').create();
const concat       = require('gulp-concat');
const svgstore     = require('gulp-svgstore');
const svgmin       = require('gulp-svgmin');
const rename       = require('gulp-rename');
const argv         = require('minimist')(process.argv.slice(2));
const jshint       = require('gulp-jshint');
const del          = require('del');

// Project config
const conf = {
  siteUrl: 'clx.localhost'
};

// CLI options
const enabled = {
  // Enable static asset revisioning when `--production`
  rev: argv.production,
  // Disable source maps when `--production`
  maps: !argv.production,
  // Fail due to JSHint warnings only when `--production`
  failJSHint: argv.production,
  // Strip debug statments from javascript when `--production`
  stripJSDebug: argv.production
};

// Smash CSS!
function styles() {
  return gulp.src([
      'assets/scss/main.scss',
      'assets/scss/print.scss'
    ])
    .pipe(gulpif(enabled.maps, sourcemaps.init()))
    .pipe(sass())
    .on('error', notify.onError(function(error) {
       return 'Styles error!' + error;
    }))
    .pipe(autoprefixer())
    .pipe(cssnano({
      safe: true
    }))
    .pipe(gulp.dest('web/assets/dist/css'))
    .pipe(gulpif(enabled.maps, sourcemaps.write('maps')))
    .pipe(gulpif(enabled.maps, gulp.dest('web/assets/dist/css')))
    .pipe(browsersync.stream({match: '**/*.css'}))
    .pipe(notify({message: 'Styles smashed.', onLast: true}));
}

// Smash javascript!
function scripts() {
  return gulp.src([
      'assets/js/main.js'
    ])
    .pipe(include())
    .pipe(concat('main.js'))
    .pipe(gulpif(enabled.maps, sourcemaps.init()))
    .pipe(uglify({
      compress: {
        'drop_debugger': enabled.stripJSDebug
      }
    }))
    .on('error', notify.onError(function(error) {
       return 'Scripts error!' + error;
    }))
    .pipe(gulp.dest('web/assets/dist/js'))
    .pipe(gulpif(enabled.maps, sourcemaps.write('maps')))
    .pipe(gulpif(enabled.maps, gulp.dest('web/assets/dist/js')))
    .pipe(browsersync.reload({stream:true}))
    .pipe(notify({message: 'Scripts smashed.', onLast: true}));
}

// Revision files for production assets
function revFiles(cb) {
  if (!enabled.rev) cb();
  else {
    return gulp.src(['web/assets/dist/**/*.{css,js,jpg,png,gif}'])
      .pipe(rev())
      .pipe(revdel())
      .pipe(gulp.dest('web/assets/dist'))
      .pipe(rev.manifest())
      .pipe(gulp.dest('web/assets/dist'));
  }
}

// Copy various files/dirs to dist
function copy() {
  gulp.src(['assets/js/modernizr.custom.js'])
    .pipe(gulp.dest('web/assets/dist/js/'));
  return gulp.src(['assets/images/*'])
    .pipe(gulp.dest('web/assets/dist/images/'));
}

// Folders to watch for changes
function watchFiles() {
  gulp.watch('assets/scss/*.scss', gulp.series(styles));
  gulp.watch('assets/scss/**/*.scss', gulp.series(styles));
  gulp.watch('assets/js/**/*.js', gulp.series(scripts));
}

function browserSync() {
  browsersync.init({
    proxy: conf.siteUrl,
    files: ['./**/*.php', '*.php'],
    notify: false,
    open: false
  });
}

// `gulp jsHint` - Lints configuration JSON and project JS.
function jsHint() {
  return gulp.src([
      'assets/bower.json', 'gulpfile.js', 'assets/js/main.js'
    ])
    .pipe(jsHint())
    .pipe(jsHint.reporter('jshint-stylish'))
    .pipe(gulpif(enabled.failJSHint, jsHint.reporter('fail')));
}

// `gulp clean` - Deletes the build folder entirely.
function clean() {
  return del([ 'web/assets/dist/' ]);
}

// SVGs to defs
function svgs() {
  return gulp.src('assets/svgs/*.svg')
    .pipe(svgmin({
        plugins: [{
            removeViewBox: false
        }, {
            removeEmptyAttrs: false
        },{
            mergePaths: false
        },{
            cleanupIDs: false
        }]
    }))
    .pipe(svgstore({inlineSvg: true}))
    .pipe(rename({suffix: '-defs'}))
    .pipe(gulp.dest('web/assets/dist/'));
}

const build = gulp.series(clean, gulp.parallel(copy, styles, scripts, svgs), revFiles);
const watch = gulp.series(build, gulp.parallel(watchFiles, browserSync));

// export tasks
exports.build = build;
exports.watch = watch;
exports.default = build;
