import * as cp from '../exec';
import * as path from 'path';
import * as fs from 'fs';

export function start() {
	var endstr = '';
	var adb_path = path.dirname(process.execPath) + '/adb/adb';
	var output = cp.spawn(adb_path, [ 'devices' ], cp.defaultSpawnOpt());
	if (output.stdout)
		output.stdout.on('data', function(data) {
			console.log('out', data);
			endstr += data;
			if (endstr.indexOf('List of devices attached') > -1) {
				endstr = '';
				output.kill();
			}
		});
	if (output.stderr)
		output.stderr.on('data', function(data) {
			console.log('err', data);
		});
	output.on('exit', function(err) {
		console.log('exit', err);
	});
	output.on('close', function(err) {
		console.log('close', err);
	});
}
