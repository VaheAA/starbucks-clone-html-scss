const { src, dest, watch, parallel, series } = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');

const fs = require('fs');

const prod_folder = 'dist';
const dev_folder = 'app';



function browsersync() {
  browserSync.init({
    server: {
      baseDir: dev_folder
    }
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

function fonts() {
  src([`${dev_folder}/fonts/*.ttf`, `${dev_folder}/fonts/*.TTF`])
    .pipe(ttf2woff())
    .pipe(dest(`${dev_folder}/fonts`));
  src([`${dev_folder}/fonts/*.ttf`, `${dev_folder}/fonts/*.TTF`])
    .pipe(ttf2woff2())
    .pipe(dest(`${dev_folder}/fonts`));
  return setTimeout(delFonts, 25000);
}

function delFonts() {
  del.sync([`${dev_folder}/fonts/*.ttf`, `${dev_folder}/fonts/*.TTF`]);
}

function build() {
  return src([
    `${dev_folder}/css/style.min.css`,
    `${dev_folder}/fonts/**/*`,
    `${dev_folder}/js/main.min.js`,
    `${dev_folder}/*.html`,
  ], { base: dev_folder })
    .pipe(dest(prod_folder));
}

function fontStyle() {
  let file_content = fs.readFileSync(dev_folder + '/scss/base/_fonts.scss');
  if (file_content == '') {
    fs.writeFile(dev_folder + '/scss/base/_fonts.scss', `@use '../abstracts/mixins';`, cb);
    return fs.readdir(`${dev_folder}/fonts`, function (err, items) {
      if (items) {
        let c_fontname;
        for (let i = 0; i < items.length; i++) {
          let fontname = items[i].split('.'); fontname = fontname[0];
          if (c_fontname != fontname) {
            fs.appendFile(dev_folder + '/scss/base/_fonts.scss', '@include mixins.font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
          } c_fontname = fontname;
        }
      }
    });
  }
}

function cb() { }

function watching() {
  watch([`${dev_folder}/scss/**/*.scss`], styles);
  watch([`${dev_folder}/js/**/*.js`, `!${dev_folder}/js/main.min.js`], scripts);
  watch([`${dev_folder}/*.html`]).on('change', browserSync.reload);
  watch([`${dev_folder}/fonts/*.ttf`, `${dev_folder}/fonts/*.TTF`], fonts);
}

exports.build = series(cleanDist, images, build, fontStyle);
exports.default = parallel(styles, scripts, browsersync, watching, fonts, fontStyle);

exports.fontStyle = fontStyle;
exports.fonts = fonts;
exports.delFonts = delFonts;
exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.images = images;
exports.cleanDist = cleanDist;