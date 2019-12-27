import * as cp from '../exec';
import * as db from './boot_db';
import * as adb from './boot_adb';
import { logger } from '@passoa/logger';
import * as app from '../main';
// debug = 1;

declare namespace Promise {
	function longStackTraces(): void;
}

process.on('unhandledRejection', function(reason: any, promise) {
	console.log('unhandledRejection', reason.stack);
	// 记录日志、抛出错误、或其他逻辑。
});

Promise.longStackTraces();
let debug = process.env.NODE_DEBUG;
if (1) {
	let browser = cp.exec('"browser/browser" --url=http://127.0.0.1:6003 --enable-media-stream=1', cp.defaultExeOpt());
	//cp.exec('"browser/browser" --url=http://127.0.0.1:6003 --enable-media-stream=1');
	browser.on('exit', () => {
		app.stop();
	});
	db.start();
	adb.start();
	app.start();
} else {
	var execstr = '"' + process.execPath + '" "' + __dirname + '/run.js"';
	console = new console.Console(new logger('test.log', 1024 * 1024 * 100));
	process.env.NODE_DEBUG = 'stream';

	let child = cp.exec(execstr, cp.defaultExeOpt(), (error, stdout, stderr) => {
		if (error) {
			console.error('执行的错误:', error);
			return;
		}
	});
	if (child.stdout) {
		child.stdout.on('data', function(data) {
			console.log(data);
		});
	}
}
