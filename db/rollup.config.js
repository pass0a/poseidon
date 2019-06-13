// rollup.config.js
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
export default {
	input: 'src/index.js',
	output: {
		file: 'dist/bundle.js',
		format: 'cjs'
	},
	external: [
		'net',
		'querystring',
		'dns',
		'fs',
		'http',
		'path',
		'url',
		'util',
		'tls',
		'tty',
		'module',
		'zlib',
		'buffer',
		'events',
		'assert',
		'stream',
		'crypto',
		'os'
	],
	plugins: [ resolve(), commonjs(), json() ]
};
