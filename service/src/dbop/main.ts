import * as mongoose from 'mongoose';
import * as pack from '@passoa/pack';
import * as net from 'net';
import users from './users/index';
import cases from './cases/index';
import projects from './projects/index';
import res from './res/index';
import rule from './rule/index';
import buttons from './buttons/index';
import status from './status/index';
import group from './group/index';
import binding from './binding/index';
import adb from './adb/index';
import results from './results/index';
import pcan from './pcan/index';
import dbc from './dbc/index';
import versions from './versions/index';

let pis = new pack.packStream();
let pos = new pack.unpackStream();
let sv: any;
let l_pis = new pack.packStream();
let l_pos = new pack.unpackStream();
let ints: any;
let DB_URL = 'mongodb://192.168.19.12/poseidon_data';
let options = { useNewUrlParser: true, ssl: false, useUnifiedTopology: true };
let db_status: number = 0;
let db_ct = mongoose.connection;
let req = { type: 'toDB', route: 'connect', info: 0 };
mongoose.set('useFindAndModify', false); // cases中的findOneAndUpdate

createServer();

function createServer() {
	pis.on('data', (data: any) => {
		sv.write(data);
	});
	pos.on('data', (data: any) => {
		switch (data.type) {
			case 'toDB':
				handle(data);
				break;
			case 'toSer':
				buttons.disposeData(data, pis);
				status.disposeData(data, pis);
				group.disposeData(data, pis);
				binding.disposeData(data, pis);
				adb.disposeData(data, pis);
				break;
		}
	});
	db_ct.on('connected', () => {
		console.info('db connected');
	});
	db_ct.on('disconnected', () => {
		if (sv && db_status == 1) {
			db_status = 2;
			req.info = db_status;
			pis.write(req);
		}
		console.error('db disconnected');
	});
	net
		.createServer(function(c) {
			sv = c;
			sv.on('data', function(data: any) {
				pos.write(data);
			});
			sv.on('end', function(data: any) {
				console.info('db_server end');
			});
			sv.on('error', function(data: any) {
				console.error('db_server error');
			});
		})
		.listen(6002);
	if (db_status != 1) connectDB();
	connectLink();
}

async function connectDB() {
	let num = 10;
	while (num) {
		if (await mongooseConnect()) {
			db_status = 1;
			break;
		}
		num--;
		if (num == 0) {
			db_status = 2;
			break;
		}
		await wait(2000);
	}
	req.info = db_status;
	if (sv) pis.write(req);
}

async function connectLink() {
	l_pis.on('data', (data: any) => {
		ints.write(data);
	});
	l_pos.on('data', (data: any) => {
		switch (data.type) {
			case 'init':
				l_pis.write({ type: 'info', class: 'db', name: 'db' });
				break;
			case 'auth':
				console.log('db_auth success!!!');
				break;
			case 'toDB':
				handleLink(data);
				break;
			default:
				break;
		}
	});
	let num = 10;
	while (num) {
		if (await toLink()) break;
		num--;
		if (num == 0) break;
		await wait(100);
	}
}

async function handleLink(data: any) {
	switch (data.route) {
		case 'results':
			results.disposeData(data, l_pis);
			break;
		case 'status':
			status.disposeData(data, l_pis);
			break;
		case 'binding':
			binding.disposeData(data, l_pis);
			break;
		case 'buttons':
			buttons.disposeData(data, l_pis);
			break;
		case 'adb':
			adb.disposeData(data, l_pis);
			break;
		case 'group':
			group.disposeData(data, l_pis);
			break;
		case 'pcan':
			pcan.disposeData(data, l_pis);
			break;
	}
}

async function toLink() {
	return new Promise((resolve) => {
		closeOnEvent();
		ints = net.connect(6000, '127.0.0.1', () => {
			console.info('db-link connect!!!');
			resolve(1);
		});
		ints.on('data', (data: any) => {
			l_pos.write(data);
		});
		ints.on('close', () => {
			console.info('close db-link socket!!!');
		});
		ints.on('error', () => {
			console.error('db-link error!!!');
			resolve(0);
		});
	});
}

function closeOnEvent() {
	if (ints) {
		ints.removeAllListeners('data');
		ints.removeAllListeners('close');
		ints.removeAllListeners('error');
	}
}

async function wait(time: any) {
	return new Promise((resolve) => {
		setTimeout(function() {
			resolve(0);
		}, time);
	});
}

async function mongooseConnect() {
	return new Promise((resolve) => {
		mongoose.connect(DB_URL, options, (error: any) => {
			if (error) {
				console.error(error);
				resolve(false);
			} else resolve(true);
		});
	});
}

function mongooseDisconnect(ip: string) {
	// mongoose.connection.on('disconnected', function() {
	// 	console.log('Mongoose connection disconnected');
	// });
	// mongoose.disconnect(() => {
	// 	console.log('!!!!!');
	// });
	// mongoose.connection.close();
	db_ct.on('close', () => {
		console.log('222222');
	});
	db_ct.on('disconnected', () => {
		console.log('33333');
	});
	mongoose.disconnect();
	mongoose.connection.close();
	// db_ct.close(() => {
	// 	console.log('1233333');
	// });
	// let newip = 'mongodb:' + ip + '/poseidon_data';
	// console.log(newip);
	// console.log(db_ct);
	// mongoose.connect(newip, options, (error: any) => {
	// 	if (!error) {
	// 		console.log('connected!!!!!');
	// 	}
	// });
	// console.log(db_ct);
}

function handle(data: any) {
	console.log(data.route);
	switch (data.route) {
		case 'connect':
			data.info = db_status;
			pis.write(data);
			break;
		case 'reconnect':
			connectDB();
			break;
		case 'projects':
			projects.disposeData(data, pis);
			break;
		case 'users':
			users.disposeData(data, pis);
			break;
		case 'cases':
			cases.disposeData(data, pis);
			break;
		case 'res':
			res.disposeData(data, pis);
			break;
		case 'rule':
			rule.disposeData(data, pis);
			break;
		case 'buttons':
			buttons.disposeData(data, pis);
			break;
		case 'status':
			status.disposeData(data, pis);
			break;
		case 'group':
			group.disposeData(data, pis);
			break;
		case 'binding':
			binding.disposeData(data, pis);
			break;
		case 'adb':
			adb.disposeData(data, pis);
			break;
		case 'newPrj':
			res.disposeData(data, pis);
			rule.disposeData(data, pis);
			buttons.disposeData(data, pis);
			break;
		case 'removeAll':
			projects.disposeData(data, pis);
			let delete_collection_list = [ 'cases', 'rule', 'res', 'btn', 'group', 'binding', 'status', 'adb', 'dbc' ];
			for (let i = 0; i < delete_collection_list.length; i++) {
				delete_collection_list[i] = data.info.prjname + '_' + delete_collection_list[i];
			}
			mongoose.connection.db.listCollections().toArray(function(err, names) {
				if (!err) {
					names.forEach(function(e, i, a) {
						if (delete_collection_list.indexOf(e.name) > -1) {
							mongoose.connection.db.dropCollection(e.name);
						}
					});
				}
			});
			pis.write(data);
			break;
		case 'copyPrj':
			rule.disposeData(data, pis);
			res.disposeData(data, pis);
			buttons.disposeData(data, pis);
			group.disposeData(data, pis);
			binding.disposeData(data, pis);
			if (!data.info.msg.content) cases.disposeData(data, pis);
			break;
		case 'results':
			results.disposeData(data, pis);
			break;
		case 'pcan':
			pcan.disposeData(data, pis);
			break;
		case 'dbc':
			dbc.disposeData(data, pis);
			break;
		case 'connect_server':
			console.log(data.info);
			mongooseDisconnect(data.info.ip);
			break;
		case 'versions':
			versions.disposeData(data, pis);
			break;
		default:
			break;
	}
}
