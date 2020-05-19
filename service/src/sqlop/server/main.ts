import * as pack from '@passoa/pack';
import * as net from 'net';
import * as path from 'path';
import * as fs from 'fs';
// import image from './table/image';

import * as sqlite from "sqlite3"
let pis = new pack.packStream();
let pos = new pack.unpackStream();
let sv: any;
let db: any;
let sql_status = false;
let sql_path: string = path.dirname(path.dirname(process.execPath)) + '/data_store/SQL/poseidon.db';

checkDir();
createServer();

function checkDir() {
	let dataDir = path.dirname(path.dirname(process.execPath)) + '/data_store';
	let sqlDir = path.dirname(path.dirname(process.execPath)) + '/data_store/SQL';
	if (!fs.existsSync(dataDir)) {
		fs.mkdirSync(dataDir);
	} else if (!fs.existsSync(sqlDir)) {
		fs.mkdirSync(sqlDir);
	}
}

function createServer() {
	pis.on('data', (data: any) => {
		sv.write(data);
	});
	pos.on('data', (data: any) => {
		openSQLDB();
		switch (data.route) {
			case 'image':
				//image.disposeData(data, pis, db);
				break;
			default:
				break;
		}
	});
	net
		.createServer(function(c) {
			sv = c;
			sv.on('data', function(data: any) {
				pos.write(data);
			});
			sv.on('end', function(data: any) {
				console.info('sql_server end');
			});
			sv.on('error', function(data: any) {
				console.error('sql_server error');
			});
		})
		.listen(6004);
}

function openSQLDB() {
	if (!sql_status) {
		// db = sqlite.(sql_path, function(code: any, info: any) {});
		// sql_status = true;
	}
}
