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

class dbop {
	srv: net.Server;
	pis = new pack.packStream();
	pos = new pack.unpackStream();
	sv: any;
	l_pis = new pack.packStream();
	l_pos = new pack.unpackStream();
	ints: any;
	DB_URL = 'mongodb://127.0.0.1/poseidon_data';
	options = { useNewUrlParser: true, ssl: false, useUnifiedTopology: true };
	db_status: number = 0;
	db_ct = mongoose.connection;
	req = { type: 'toDB', route: 'connect', info: 0 };
	constructor() {
		mongoose.set('useFindAndModify', false); // cases中的findOneAndUpdate
	}
	stop() {
		// this.closing = true;
		// if (this.srv) this.srv.close();
		// if (this.ints) this.ints.end();
		// mongoose.disconnect((error?: any) => {
		// 	console.log('!!!!', error);
		// });
	}
	start() {
		console.log('dbop:', this.srv);
		if (this.srv) return;
		this.pis.on('data', (data: any) => {
			this.sv.write(data);
		});
		this.pos.on('data', (data: any) => {
			switch (data.type) {
				case 'toDB':
					this.handle(data);
					break;
				case 'toSer':
					buttons.disposeData(data, this.pis);
					status.disposeData(data, this.pis);
					group.disposeData(data, this.pis);
					binding.disposeData(data, this.pis);
					adb.disposeData(data, this.pis);
					break;
			}
		});
		this.db_ct.on('end', () => {
			console.log('db end!!!!!!!!!!!');
		});
		this.db_ct.on('error', () => {
			console.log('db error!!!!!!!!!!!');
		});
		this.db_ct.on('connected', () => {
			console.info('db connected!!!!');
		});
		this.db_ct.on('disconnected', () => {
			if (this.sv && this.db_status == 1) {
				this.db_status = 2;
				this.req.info = this.db_status;
				this.pis.write(this.req);
			}
			console.error('db disconnected!!!');
		});
		this.srv = net.createServer((c) => {
			this.sv = c;
			this.sv.on('data', (data: any) => {
				this.pos.write(data);
			});
			this.sv.on('close', (data: any) => {
				console.info('db_server end');
			});
			this.sv.on('error', (data: any) => {
				console.error('db_server error');
			});
		});
		this.srv.listen(6002);
		if (this.db_status != 1) this.connectDB();
		this.connectLink();
	}

	async connectDB() {
		let num = 10;
		while (num) {
			if (await this.mongooseConnect()) {
				this.db_status = 1;
				break;
			}
			num--;
			if (num == 0) {
				this.db_status = 2;
				break;
			}
			await this.wait(2000);
		}
		this.req.info = this.db_status;
		if (this.sv) this.pis.write(this.req);
	}

	async connectLink() {
		this.l_pis.on('data', (data: any) => {
			this.ints.write(data);
		});
		this.l_pos.on('data', (data: any) => {
			switch (data.type) {
				case 'init':
					this.l_pis.write({ type: 'info', class: 'db', name: 'db' });
					break;
				case 'auth':
					console.log('db_auth success!!!');
					break;
				case 'toDB':
					this.handleLink(data);
					break;
				default:
					break;
			}
		});
		let num = 10;
		while (num) {
			if (await this.toLink()) break;
			num--;
			if (num == 0) break;
			await this.wait(100);
		}
	}

	async handleLink(data: any) {
		switch (data.route) {
			case 'results':
				results.disposeData(data, this.l_pis);
				break;
			case 'status':
				status.disposeData(data, this.l_pis);
				break;
			case 'binding':
				binding.disposeData(data, this.l_pis);
				break;
			case 'buttons':
				buttons.disposeData(data, this.l_pis);
				break;
			case 'adb':
				adb.disposeData(data, this.l_pis);
				break;
			case 'group':
				group.disposeData(data, this.l_pis);
				break;
			case 'pcan':
				pcan.disposeData(data, this.l_pis);
				break;
		}
	}

	async toLink() {
		return new Promise((resolve) => {
			this.closeOnEvent();
			this.ints = net.connect(6000, '127.0.0.1', () => {
				console.info('db-link connect!!!');
				resolve(1);
			});
			this.ints.on('data', (data: any) => {
				this.l_pos.write(data);
			});
			this.ints.on('close', () => {
				console.info('close db-link socket!!!');
			});
			this.ints.on('error', () => {
				console.error('db-link error!!!');
				resolve(0);
			});
		});
	}

	closeOnEvent() {
		if (this.ints) {
			this.ints.removeAllListeners('data');
			this.ints.removeAllListeners('close');
			this.ints.removeAllListeners('error');
		}
	}

	async wait(time: any) {
		return new Promise((resolve) => {
			setTimeout(function() {
				resolve(0);
			}, time);
		});
	}

	async mongooseConnect() {
		return new Promise((resolve) => {
			mongoose.connect(this.DB_URL, this.options, (error: any) => {
				if (error) {
					console.error(error);
					resolve(false);
				} else resolve(true);
			});
		});
	}

	handle(data: any) {
		// console.log(data.route);
		switch (data.route) {
			case 'connect':
				data.info = this.db_status;
				this.pis.write(data);
				break;
			case 'reconnect':
				this.connectDB();
				break;
			case 'projects':
				projects.disposeData(data, this.pis);
				break;
			case 'users':
				users.disposeData(data, this.pis);
				break;
			case 'cases':
				cases.disposeData(data, this.pis);
				break;
			case 'res':
				res.disposeData(data, this.pis);
				break;
			case 'rule':
				rule.disposeData(data, this.pis);
				break;
			case 'buttons':
				buttons.disposeData(data, this.pis);
				break;
			case 'status':
				status.disposeData(data, this.pis);
				break;
			case 'group':
				group.disposeData(data, this.pis);
				break;
			case 'binding':
				binding.disposeData(data, this.pis);
				break;
			case 'adb':
				adb.disposeData(data, this.pis);
				break;
			case 'newPrj':
				res.disposeData(data, this.pis);
				rule.disposeData(data, this.pis);
				buttons.disposeData(data, this.pis);
				break;
			case 'removeAll':
				projects.disposeData(data, this.pis);
				let delete_collection_list = [
					'cases',
					'rule',
					'res',
					'btn',
					'group',
					'binding',
					'status',
					'adb',
					'dbc'
				];
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
				this.pis.write(data);
				break;
			case 'copyPrj':
				rule.disposeData(data, this.pis);
				res.disposeData(data, this.pis);
				buttons.disposeData(data, this.pis);
				group.disposeData(data, this.pis);
				binding.disposeData(data, this.pis);
				if (!data.info.msg.content) cases.disposeData(data, this.pis);
				break;
			case 'results':
				results.disposeData(data, this.pis);
				break;
			case 'pcan':
				pcan.disposeData(data, this.pis);
				break;
			case 'dbc':
				dbc.disposeData(data, this.pis);
				break;
			default:
				break;
		}
	}
}
let dbsrv = new dbop();
export function start() {
	return dbsrv.start();
}
