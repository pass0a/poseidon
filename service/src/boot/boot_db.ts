import * as cp from '../exec';
import * as path from 'path';
import * as fs from 'fs';

export function start() {
	var db_path = path.dirname(path.dirname(process.execPath)) + '/data_store/DB';
	if (!fs.existsSync(db_path)) fs.mkdirSync(db_path);
	cp.spawn(
		`"${__dirname}/db/mongod.exe"`,
		[ '--dbpath', `"${db_path}"`, '--storageEngine=mmapv1' ],
		cp.defaultSpawnOpt({ detached: true })
	);
}
