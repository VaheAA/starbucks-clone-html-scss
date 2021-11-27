const { src, dest, watch, parallel, series } = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');


const prod_folder = 'dist';
const dev_folder = 'app';



function browsersync() {
  browserSync.init({
    server: {
      baseDir: dev_folder
    },
    notify: false
  });
}

function cleanDist() {
  return del(prod_folder);
}

function images() {
  return src(`${dev_folder}/images/**/*`)
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.mozjpeg({ quality: 75, progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 }),
      imagemin.svgo({
        plugins: [
          { removeViewBox: true },
          { cleanupIDs: false }
        ]
      })
    ]
    ))
    .pipe(dest(`${prod_folder}/images`));
}

function scripts() {
  return src([
    `${dev_folder}/js/main.js`
  ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest(`${dev_folder}/js`))
    .pipe(browserSync.stream());
}

function styles() {
  return src(`${dev_folder}/scss/style.scss`)
    .pipe(scss({ outputStyle: 'compressed' }))
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 version'],
      grid: true
    }))
    .pipe(dest(`${dev_folder}/css`))
    .pipe(browserSync.stream());
}


function build() {
  return src([
    `${dev_folder}/css/style.min.css`,
    `${dev_folder}/js/main.min.js`,
    `${dev_folder}/*.html`,
  ], { base: dev_folder })
    .pipe(dest(prod_folder));
}


function cb() { }

function watching() {
  watch([`${dev_folder}/scss/**/*.scss`], styles);
  watch([`${dev_folder}/js/**/*.js`, `!${dev_folder}/js/main.min.js`], scripts);
  watch([`${dev_folder}/*.html`]).on('change', browserSync.reload);
}

exports.build = series(cleanDist, images, build);
exports.default = parallel(styles, scripts, browsersync, watching);

exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.images = images;
exports.cleanDist = cleanDist;