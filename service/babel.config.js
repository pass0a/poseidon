module.exports = {
	presets: [ '@babel/preset-env' ],
	plugins: [
		[
			'@babel/plugin-transform-runtime',
			{
				absoluteRuntime: false,
				corejs: false,
				helpers: false,
				regenerator: true,
				useESModules: false
			}
		]
	]
};
