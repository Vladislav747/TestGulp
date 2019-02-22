
//Подготовка файлов

var gulp      	       = require('gulp'),
		gutil          = require('gulp-util' ),
		sass           = require('gulp-sass'),
		browserSync    = require('browser-sync'),
		concat         = require('gulp-concat'),
		uglify         = require('gulp-uglify'),
		cleanCSS       = require('gulp-clean-css'),
		rename         = require('gulp-rename'),
		autoprefixer   = require('gulp-autoprefixer'),
		notify         = require("gulp-notify");
		runSequence    = require('run-sequence');
		conventionalChangelog = require('gulp-conventional-changelog');
		conventionalGithubReleaser = require('conventional-github-releaser');
		bump 		    = require('gulp-bump');
		gutil			= require('gulp-util');
		git     		 = require('gulp-git');
		fs 				= require('fs');	

// Сервер и автообновление страницы Browsersync
gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'app'
		},
		notify: false,
		// tunnel: true,
		// tunnel: "projectmane", //Demonstration page: http://projectmane.localtunnel.me
	});
});

// Минификация пользовательских скриптов проекта и JS библиотек в один файл
gulp.task('js', function() {
	//место Хранения всех изначальных файлов 
	//Если появляется дополнительный js то добавляем сюда
	return gulp.src([
		'app/libs/jquery/dist/jquery.min.js',
		'app/js/common.js', // Всегда в конце
		])
		//Склевиваем их вместе
	.pipe(concat('scripts.min.js'))
	.pipe(uglify()) // Минимизировать весь js (на выбор)
	.pipe(gulp.dest('app/js'))
	.pipe(browserSync.reload({stream: true}));
});

//Собираем весь sass
gulp.task('sass', function() {
	return gulp.src('app/sass/**/*.sass')
	.pipe(sass({outputStyle: 'expand'}).on("error", notify.onError()))
	.pipe(rename({suffix: '.min', prefix : ''}))
	.pipe(autoprefixer(['last 15 versions']))
	// Опционально, закомментировать при отладке убрать весь css
	.pipe(cleanCSS()) 
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.reload({stream: true}));
});


//Общий скрипт выволнение всех вышеперечисленных причем переработка только измененных файлов
gulp.task('watch', ['sass', 'js', 'browser-sync'], function() {
	gulp.watch('app/sass/**/*.sass', ['sass']);
	gulp.watch(['libs/**/*.js', 'app/js/common.js'], ['js']);
	gulp.watch('app/*.html', browserSync.reload);
});


/////////////////////////////!!!!!!!!!!!!!!!!
///////////////////////////////////////////////
//Этот Task запускается при команде gulp в консоле
gulp.task('default', ['watch']);




//Выкладка файлов в хранилище

// //Запись файла changelog
// gulp.task('changelog', function () {
// 	return gulp.src('CHANGELOG.md', {
// 	  buffer: false
// 	})
// 	  .pipe(conventionalChangelog({
// 		preset: 'angular' // или по другому соглашению коммита
// 	  }))
// 	  .pipe(gulp.dest('./'));
//   });


  //Выложим файла на гитхаб
  gulp.task('github-release', function(done) {
	conventionalGithubReleaser({
	  type: "oauth",
	  token: '68e9c7ad13f17a2009831ef13d125a1bca570c76 ' // измените это на свой маркер в GitHub
	}, {
	  preset: 'angular' // или по другому соглашению коммита
	}, done);
  });

//   gulp.task('bump-version', function () {
//   // "Зашиваем" в код тип изменения версии как "patch",
//   // но может быть неплохой идеей использование
//   // minimist (bit.ly/2cyPhfa) для определения с помощью
//   // аргумента команды, какой тип изменения вы вносите -
//   // "major", "minor" или "patch"
// 	return gulp.src(['./bower.json', './package.json'])
// 	  .pipe(bump({type: "patch"}).on('error', gutil.log))
// 	  .pipe(gulp.dest('./'));
//   });

  gulp.task('commit-changes', function () {
	return gulp.src('.')
	  .pipe(git.add())
	  .pipe(git.commit('[Prerelease] Bumped version number'));
  });
  
  gulp.task('push-changes', function (cb) {
	git.push('origin_ssh', 'master', cb);
  });
  
  //Комплексная задача full-github-download - загрузка всего на гитхаб
//gulp.series - выполнять задачу поочередно
//gulp.parallels - выполнять задачу параллельно
gulp.task('full-github-download', ['github-release', 'commit-changes', 'push-changes']);
 