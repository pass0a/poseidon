const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const path = require('path');
const fs = require('fs-extra');
const distfolder = 'dist'; //'../output/node_modules';
fs
	.copy('node_modules/mongodb/package.json', path.resolve(__dirname, distfolder + '/package.json'))
	.then(() => {
		// fs
		// 	.copy('node_modules/core-js-bundle/index.js', path.resolve(__dirname, `${distfolder}/core.js`))
		// 	.then(() => {
		// 		console.log('copy core success!');
		// 	})
		// 	.catch((err) => {
		// 		console.error(err);
		// 	});
		console.log('copy builtin success!');
	})
	.catch((err) => {
		console.error(err);
	});
const nodeConfig = {
	// Change to your "entry-point".
	entry: {
		app: './src/main.js'
	},
	output: {
		path: path.resolve(__dirname, distfolder),
		filename: '[name].js',
		libraryTarget: 'commonjs2'
	},
	resolve: {
		extensions: [ '.js', '.json', '.tsx', '.ts' ]
	},
	module: {
		rules: [
			{
				// Include ts, tsx, js, and jsx files.
				test: /\.(js)x?$/,
				loader: 'babel-loader'
			},
			{
				test: /\.tsx?$/,
				use: 'ts-loader'
			}
		]
	},
	node: {
		// Replace these Node.js native modules with empty objects, Mongoose's
		// browser library does not use them.
		// See https://webpack.js.org/configuration/node/
		fs: false,
		util: false,
		events: false,
		http: false,
		dgram: false,
		net: false,
		buffer: false,
		crypto: false,
		dns: false,
		assert: false,
		stream: false,
		os: false,
		url: false,
		querystring: false,
		tls: false,
		path: false,
		tty: false,
		module: false,
		zlib: false
	},
	externals: {
		'@passoa/img': '@passoa/img',
		'@passoa/cvip': '@passoa/cvip'
	},
	target: 'node',
	mode: 'development' //'production'
};

module.exports = [ nodeConfig ];
