# fis3-spriter-fontmin


[![NPM version][npm-image]][npm-url]
[![Downloads][downloads-image]][npm-url]

a plugin for fis3, use fontmin to generate dynamic font files.

用于fis3的动态字体生成插件，基于fontmin，在fis3的打包spriter阶段，根据设置获得相应文字，生成压缩的字体文件，将相应的css插入到原页面中。

## 说明
对用法有疑问的可以查看[fis3](http://fis.baidu.com/fis3/docs/beginning/intro.html)和[fontmin](https://github.com/ecomfe/fontmin)文档

## 用法

`npm install --save-dev fis3-spriter-fontmin`

fis-config.js配置:

~~~
fis.match('::package', {
    spriter: fis.plugin('fontmin', {
        rules: [{ // rules为数组，可设置多个rule,生成多个对应字体
            match: 'pages/*.php', // 必须设置，否则无效 设置将要应用此插件的文件，未设置的文件将被忽略
            baseFile: 'css/fonts/SentyTang.ttf', // 必须设置，否则报错 源ttf字体文件 该插件根据这个ttf字体文件生成相应压缩字体文件
			releaseDir: 'css/fonts', // 默认为baseFile的目录（例如：'css/fonts'）
			text: function(content,file) {
				return content;
			}, // 根据text来生成压缩的字体文件，默认为match到的文件的所有内容，text也可设置为string类型，如text: 'aaa'
            chineseOnly: true, // 是否过滤text,只得到text中的中文
			css: { //用来设置css,来插入到match到的文件中
				fontFamily: 'SentyTang', // 默认为baseFile的文件名
				fontStyle: italic, // 默认为normal
				fontWeight: 200 // 默认为normal
			}
        }]
    })
});

~~~

[downloads-image]: http://img.shields.io/npm/dm/fis3-spriter-fontmin.svg
[npm-url]: https://npmjs.org/package/fis3-spriter-fontmin
[npm-image]: http://img.shields.io/npm/v/fis3-spriter-fontmin.svg
