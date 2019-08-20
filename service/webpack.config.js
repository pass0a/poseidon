const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const path = require('path');
const fs = require('fs-extra');
const distfolder = 'dist'; //'../output/node_modules';
fs
	.copy('node_modules/mongodb/package.json', path.resolve(__dirname, distfolder + '/package.json'))
	.then(() => {
		fs
			.copy('src/run.js', path.resolve(__dirname, `${distfolder}/run.js`))
			.then(() => {
				console.log('copy run.js success!');
			})
			.catch((err) => {
				console.error(err);
			});
		console.log('copy builtin success!');
	})
	.catch((err) => {
		console.error(err);
	}); // 调试
const nodeConfig = {
	// Change to your "entry-point".
	entry: {
		app: './src/main.ts',
		test: './src/testop/main.ts',
		pic: './src/picop/main.ts'

		// link: './src/linkmgr/main.ts',
		// server : './src/server/main.ts',
		// db:'./src/dbop/main.ts',
		// http:'./src/httpop/main.ts',
		// test:'./src/testop/main.ts',
		// pic: './src/picop/main.ts'
	},
	output: {
		path: path.resolve(__dirname, distfolder),
		filename: '[name].js',
		libraryTarget: 'commonjs2'
	},
	// plugins: [ new BundleAnalyzerPlugin() ],  // 打包内容
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
		zlib: false,
		__dirname: false,
		__filename: false
	},
	externals: {
		'@passoa/img': '@passoa/img',
		'@passoa/cvip': '@passoa/cvip'
	},
	devtool: 'source-map',
	target: 'node',
	mode: 'development' //'production'
};

module.exports = [ nodeConfig ];
