// plugin
const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const imagemin = require("gulp-imagemin");
const pngquant = require("imagemin-pngquant");
const mozjpeg = require("imagemin-mozjpeg");

// ローカルサーバーの立ち上げ
const browserSyncOption = {
    port: 3000,
    server: {
      baseDir: './',
      index: 'index.html'
    },
    reloadOnRestart: true
};

// リロード関数
function sync(done) {
    browserSync.init(browserSyncOption);
    done();
}

// sassのコンパイル
gulp.task("sass", () => {
    return gulp
        .src('scss/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('css'))
});

// babel (ES5以前にコンパイル)
gulp.task("babel", () => {
    return gulp.src('js/src/*.js')
      .pipe(babel({
        "presets": ["@babel/preset-env"]
      }))
    //minify(圧縮)
      .pipe(uglify())
    // リネーム
      .pipe(rename({
        extname: '.min.js' 
      }))
      .pipe(gulp.dest('js/dist'));
});

// 画像の圧縮
gulp.task("imagemin", () => {
    return gulp.src('img/src/*.{jpg,jpeg,png,gif,svg}')
    .pipe(imagemin(
        [
            pngquant({ quality: '65-80', speed: 1 }),
            mozjpeg({ quality: 80 }),
            imagemin.svgo(),
            imagemin.gifsicle()
        ]
    ))
    .pipe(gulp.dest('img/min'));
});


// 監視プロセス
function watchFiles(done) {
    const browserReload = () => {
      browserSync.reload();
      done();
    };
    gulp.watch('scss/*.scss').on('change', gulp.series("sass", browserReload));
    gulp.watch('js/src/*.js').on('change', gulp.series("babel", browserReload));
    gulp.watch('index.html').on('change', gulp.series(browserReload));
    gulp.watch('img/src/*.{jpg,jpeg,png,gif,svg}').on('change', gulp.series("imagemin", browserReload));
}

// 「npx gulp」にて監視プロセスを実行(sass, babel, 画面リロードを実行)
gulp.task('default', gulp.series(gulp.parallel("sass", "babel", "imagemin"), gulp.series(sync, watchFiles)));
