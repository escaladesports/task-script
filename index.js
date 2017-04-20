'use strict'
const notify = require('task-notify')
const error = require('task-error-notify')
const browserify = require('browserify')
const babelify = require('babelify')
const stream = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const sourcemaps = require('gulp-sourcemaps')
const uglify = require('uglifyify')
const saveLicense = require('uglify-save-license')
const plumber = require('gulp-plumber')
const glob = require('glob-all')
const gulp = require('gulp')
const merge = require('merge-stream')
module.exports = (config, cb) => {
	glob([
		`${config.src}/*.js`,
		`!${config.src}/_*.js`
	], (err, files) =>{
		const tasks = files.map(entry => {
			return browserify(entry, {
					debug: true
				})
				.transform(babelify, {
					global: true,
					presets: [ 'es2015' ],
					plugins: [
						'transform-object-assign',
						'es6-promise'
					],
					sourceMaps: true
				})
				.transform(uglify, {
					global: true,
					compress: {
						dead_code: true
					},
					output: {
						comments: saveLicense
					}
				})
				.bundle()
				.on('error', error)
				.pipe(stream(entry.replace(`${config.src}/`, '')))
				.pipe(buffer())
				.pipe(plumber({ errorHandler: error }))
				.pipe(sourcemaps.init({
					loadMaps: true
				}))
				.pipe(sourcemaps.write('./'))
		})
		merge(tasks)
			.pipe(gulp.dest(config.dist))
			.on('end', () => {
				notify('JavaScript processed')
				if(typeof cb === 'function') cb()
			})

	})
}