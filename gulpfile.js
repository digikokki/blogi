// Require all the things
const gulp 			= require('gulp'),
      sass 			= require('gulp-sass'),
      gutil 		= require('gulp-util'),
      plumber 		= require('gulp-plumber'),
      rename 		= require('gulp-rename'),
      minifyCSS 	= require('gulp-minify-css'),
      prefixer		= require('gulp-autoprefixer'),
      connect 		= require('gulp-connect'),
      cp 			= require('child_process'),
      imagemin 		= require('gulp-imagemin'),
      pngquant     	= require('imagemin-pngquant'),
      sourcemaps 	= require('gulp-sourcemaps'),
      uglify		= require('gulp-uglifyjs'),
      rainbow 	 	= require('rainbow-code');

// Set the path variables
const base_path = './',
      src = base_path + '_dev',
      dist = base_path + 'assets',
      paths = {  
          js: 	[ src + '/js/*.js',
          		  src + '/js/**/*.js',
          		  src + '/js/**/**/*.js',],
          scss: [ src +'/sass/*.scss', 
                  src +'/sass/**/* .scss', 
                  src +'/sass/**/**/*.scss'],
          image:  src +'/images/*',
          jekyll: ['index.html', '_posts/*', '_layouts/*', '_includes/*' , 'assets/*', 'assets/**/*', '*.html']
      };


// Compile sass to css
gulp.task('compile-sass', () => {  
  return gulp.src(paths.scss)
    .pipe(plumber((error) => {
        gutil.log(gutil.colors.red(error.message));
        gulp.task('compile-sass').emit('end');
    }))
    .pipe(sass({
	    outputStyle: 'compressed',
		includePaths: require('node-normalize-scss').includePaths
    }))
    .pipe(prefixer('last 3 versions', 'ie 9'))
    .pipe(sourcemaps.write('.'))
    .pipe(minifyCSS())
    .pipe(rename({dirname: dist + '/css'}))
    .pipe(gulp.dest('./'));
});

/**
*
* Javascript
* - Uglify
*
**/
gulp.task('compile-scripts', function() {
  gulp.src(paths.js)
  .pipe(uglify())
  .pipe(rename({
    dirname: dist + '/js',
    suffix: ".min",
  }))
  .pipe(gulp.dest('./'))
});

/**
*
* Images
* - Compress them!
*
**/
gulp.task('compile-images', function () {
  return gulp.src(paths.image)
  .pipe(imagemin({
    progressive: true,
    svgoPlugins: [{removeViewBox: false}],
    use: [pngquant()]
  }))
  .pipe(gulp.dest(dist + '/images'));
});


// Rebuild Jekyll 
gulp.task('build-jekyll', (code) => {
  return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
    .on('error', (error) => gutil.log(gutil.colors.red(error.message)))
    .on('close', code);
})

// Setup Server
gulp.task('server', () => {
  connect.server({
    root: ['_site'],
    port: 4000
  });
})

// Watch files
gulp.task('watch', () => {  
  gulp.watch(paths.scss, ['compile-sass']);
  gulp.watch(paths.js, ['compile-scripts']);
  gulp.watch(paths.image, ['compile-images']);
  gulp.watch(paths.jekyll, ['build-jekyll']);
});

// Start Everything with the default task
gulp.task('default', [ 'compile-sass', 'compile-scripts', 'compile-images', 'build-jekyll', 'server', 'watch' ]);