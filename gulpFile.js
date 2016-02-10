var versionNumber = '1.11';

var gulp = require('gulp'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    gutil = require("gulp-util"),
    license = require('gulp-header-license');
    replace = require('gulp-replace'),
    gulpDoxx = require('gulp-doxx'),
    clean = require('gulp-clean');

/***** Build  *****/

gulp.task('cleanDist', function () {
    return gulp.src('dist', {read: false}).pipe(clean());
});

gulp.task('minify-js', ['cleanDist'], function() {
  return gulp.src('tradable*.js')
    .pipe(uglify({preserveComments: 'some'})) // keeps comments with @license
	  .pipe(rename(function (path) {
            if(path.extname === '.js') {
                path.basename += '.min';
            }
        }))
    .pipe(gulp.dest('dist'));
});


gulp.task('copy-files', ['minify-js'], function() {
  return gulp.src(['tradable*.js'])
	.pipe(gulp.dest('dist'));
});


gulp.task('compress-copy', ['cleanDist', 'minify-js', 'copy-files']);

gulp.task('replace-version', ['compress-copy'], function(){
  return gulp.src(['dist/**'])
    .pipe(replace('trEmbDevVersionX', versionNumber))
	.pipe(gulp.dest('dist'));
});


/***** Docs generation  *****/

gulp.task('docs', ['replace-version'], function() {
	return gulp.src(['tradable-embed.js'], {base: '.'})
    .pipe(gulpDoxx({
      title: 'tradable-embed ' + versionNumber,
    urlPrefix: ''
    }))
    .pipe(gulp.dest('docs'));
});

gulp.task('replaceDocsCss', ['docs'], function(){
	  return gulp.src(['docs/**'])
		.pipe(replace('</style>', '.language-javascript {display: none;} .bs-docs-sidenav > li > a {font-size: 12px;}</style>'))
		.pipe(replace('</style>', '.bs-docs-sidenav > li > a > span {width: 100%;display: inline-block;text-overflow: ellipsis;overflow: hidden;vertical-align: middle;}</style>'))
		.pipe(replace('</style>', '.alert-success {vertical-align: middle;} .smthingForAccount {display: none !important;} .bs-docs-sidenav > li > a {padding: 0px 15px !important;} .bs-docs-sidenav {margin: 15px 0 0 !important;}</style>'))
		.pipe(replace('</style>', '#overview {background: #2B3641; }</style>'))
		.pipe(replace('</style>', '.bs-docs-sidenav > li > a{border: 0; border-bottom: 1px solid #e5e5e5} li {line-height: 17px;}.bs-docs-sidenav i {width: 3px; height:3px}</style>'))
		.pipe(replace('break-word', 'normal; white-space: nowrap;'))
		.pipe(replace('table-striped', 'table-striped table-condensed'))
		.pipe(replace(new RegExp(/(#)\w+(ForAccount")/g), '#smthingForAccount" class="smthingForAccount"'))
		.pipe(replace('jsFiddle', 'Example'))
		.pipe(replace('http:', ''))
		.pipe(gulp.dest('docs'));
});

gulp.task('generateDocs', ['docs', 'replaceDocsCss']);


gulp.task('license-embed', ['generateDocs'], function () {
    var year = (new Date()).getFullYear();
    return gulp.src('dist/tradable*.js')
            .pipe(license("/******  Copyright ${year} Tradable ApS; @Licensed MIT; v" + versionNumber + "  ******/", {year: year}))
            .pipe(gulp.dest('./dist/'));
});

gulp.task('buildSDK', ['compress-copy', 'replace-version', 'generateDocs', 'license-embed']);

