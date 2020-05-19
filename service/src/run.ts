// var debug = process.env.NODE_DEBUG;
// // debug = 1;
// process.on('unhandledRejection', function(reason, promise) {
// 	console.log('unhandledRejection', reason.stack);
// 	// 记录日志、抛出错误、或其他逻辑。
// });
// Promise.longStackTraces();
// if (debug) {
import * as cp from 'child_process';
cp.exec('"browser/browser" --url=http://127.0.0.1:6003 --enable-media-stream=1');
cp.exec('"adb/adb" devices');
require('./db/index.js');
require('./main.js');
// } else {
// 	var execstr = '"' + process.execPath + '" "' + __dirname + '/run.js"';
// 	var fs = require('fs');
// 	console = new console.Console(fs.createWriteStream(__dirname + '/test.log'));
// 	process.env.NODE_DEBUG = 'stream';

// 	var cp = require('child_process').exec(execstr, function(error, stdout, stderr) {
// 		if (error) {
// 			console.error('执行的错误:', error);
// 			return;
// 		}
// 		console.log('stdout:', stdout);
// 		console.error('stderr:', stderr);
// 	});
// 	cp.stdout.on('data', function(data) {
// 		console.log(data);
// 	});
// }
