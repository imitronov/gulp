const { src, dest, watch, series, parallel } = require('gulp');
const rename = require('gulp-rename');

const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const autoprefixer = require('gulp-autoprefixer');
const csso = require('gulp-csso');

const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");
const webpack = require('webpack-stream');

const twigCompiler = require('gulp-twig');

const browserSync = require('browser-sync').create();

/**
 * Server
 */
const browser = () => {
  browserSync.init({
    server: {
      baseDir: "public"
    }
  });
}

/**
 * SASS => CSS
 */
const css = () => {
  return src('./src/sass/**/*.sass')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(csso())
    .pipe(rename({ suffix: ".min" }))
    .pipe(dest('public/assets/css'))
    .pipe(browserSync.stream());
};

/**
 * TypeScript => ECMAScript 5
 */
const js = () => {
  return tsProject.src()
    .pipe(webpack({
      mode: 'production',
      module: {
        rules: [
          {
            test: /\.(ts|js)$/,
            loader: [
              'babel-loader',
              'ts-loader'
            ],
            exclude: /node_modules/
          }
        ]
      },
      resolve: {
        extensions: [".ts", ".js"]
      }
    }))
    .pipe(rename({ basename: "main", suffix: ".min" }))
    .pipe(dest('public/assets/js'))
    .pipe(browserSync.stream());
}

/**
 * Twig => HTML
 */
const twig = () => {
  return src('src/twig/*.twig')
    .pipe(twigCompiler({
      data: {}
    }))
    .pipe(dest('public'))
    .pipe(browserSync.stream());
}

/**
 * Watchers
 */
const cssWatch = () => watch('./src/sass/**/*.sass', css);
const jsWatch = () => watch('./src/typescript/**/*.ts', js);
const twigWatch = () => watch('./src/twig/**/*.twig', twig);

/**
 * Exports
 */
const compile = () => parallel(css, js, twig);
exports.default = compile();
exports.watch = () => {
  css();
  js();
  twig();
  browser();
  cssWatch();
  jsWatch();
  twigWatch();
}
