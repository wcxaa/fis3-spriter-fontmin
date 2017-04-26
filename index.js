'use strict';

var path = require('path');
var util = require('util');
var minimatch = require('minimatch');
var Fontmin = require('fontmin');
var deasync = require('deasync');

module.exports = function(ret, conf, settings, opt) {
	var rules = settings.rules;

	rules.forEach(function(rule) {
		dealOneRule(rule, ret);
	});

}

function dealOneRule(rule, ret) {
	fis.util.map(ret.src, function(subpath, file) {
		if (!file.isHtmlLike || !minimatch(file.realpath, fis.project.getProjectPath(rule.match))) {
			return;
		}

		var root = fis.project.getProjectPath();
		var baseFile = fis.file(root, rule.baseFile);

		var text;
		var content = file.getContent();
		if (rule.text) {
			if (typeof rule.text === 'function') {
				text = rule.text(content, file);
			}
			if (typeof rule.text === 'string') {
				text = rule.text
			}
		} else {
			text = content;
		}

		if (text && rule.chineseOnly) {
			text = text.replace(/[^\u4e00-\u9fa5]/g, '')
		}

		var releaseDir = rule.releaseDir;

		var fontFamily = rule.css && rule.css.fontFamily ? rule.css.fontFamily : baseFile.filename;
		var fontStyle = ['normal', 'italic', 'oblique', 'inherit'].includes(rule.css && rule.css.fontStyle || '') ? rule.css.fontStyle : 'normal';
		var fontWeight = ['normal', 'bold', 'bolder', 'lighter', '100', '200', '300', '400', '500', '600', '700', '800', '900', 'inherit'].includes((rule.css && rule.css.fontWeight || '') + '') ? rule.css.fontWeight : 'normal';

		var fontmin = new Fontmin()
			.src(baseFile.realpath)
			.use(Fontmin.glyph({
				text: text
			}))
			.use(Fontmin.ttf2eot())
			.use(Fontmin.ttf2woff())
			.use(Fontmin.ttf2svg());

		var done = false;
		fontmin.run(function(err, files) {
			if (err) {
				throw err;
			}

			var woff, ttf, svg, eot;
			files.forEach(function(f, index) {
				var subpath = f.history[f.history.length - 1].replace(f.cwd, '');
				var subpathFile = fis.file(root, subpath);
				var filename = file.filename + '_' + fontFamily;
				var release = releaseDir ? releaseDir + '/' + filename + subpathFile.ext : subpathFile.subpath.replace(subpathFile.filename, filename);

				var pkg = fis.file(root, release);

				pkg.setContent(f._contents);

				ret.pkg[pkg.subpath] = pkg;

				var url = pkg.getUrl();
				switch (pkg.ext) {
					case '.ttf':
						ttf = url
						break;
					case '.woff':
						woff = url
						break;
					case '.svg':
						svg = url
						break;
					case '.eot':
						eot = url
						break;
				}
			});

			var str = `
				<style>
					@font-face {
    					font-family: "%s";
    					src: url("%s"); /* IE9 */
    					src: local("%s"),
    						 url("%s?#iefix") format("embedded-opentype"), /* IE6-IE8 */
    						 url("%s") format("woff"), /* chrome, firefox */
    						 url("%s") format("truetype"), /* chrome, firefox, opera, Safari, Android, iOS 4.2+ */
    						 url("%s") format("svg"); /* iOS 4.1- */
    					font-style: %s;
    					font-weight: %s;
					}
				</style>
			</head>
			`;
			file.setContent(content.replace('</head>', util.format(str, fontFamily, eot, fontFamily, eot, woff, ttf, svg, fontStyle, fontWeight)));

			done = true;
		});

		deasync.loopWhile(() => {
			return !done;
		});

	});
}