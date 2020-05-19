import * as WebSocket from 'ws';
import * as pack from '@passoa/pack';
import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';
import * as os from 'os';
import { ToLink } from './toLink';
import { ToDB } from './toDB';
declare function __passoa_auth_getstatus(): any
declare function __passoa_auth_getfn(): any
declare function __passoa_auth_gethwid(): any
declare function __passoa_auth_setsn(authnum: any): any

export class Server {
	private pis = new pack.packStream();
	private pos = new pack.unpackStream();
	private wss: WebSocket.Server;
	public inst: any;
	private tolink = new ToLink();
	private todb = new ToDB();
	public connect_status = { db: 0, link: 0 };
	private configPath: any = os.homedir() + '/data_store/config.json';
	private dirPath: any = path.dirname(path.dirname(process.execPath)) + '/data_store/projects/';
	constructor() {
		this.pis.on('data', (data: any) => {
			this.inst.send(data);
		});
		this.pos.on('data', (data: any) => {
			this.handle(data);
		});
	}
	run(port: number) {
		this.wss = new WebSocket.Server({ port: 6001 });

		this.wss.on('connection', (ws) => {
			ws.on('message', (message) => {
				this.pos.write(message);
			});
			this.inst = ws;
		});
		this.connectLink();
		this.connectDB();
	}
	async connectLink() {
		let link_status = { type: 'toSer', job: 'linkStatus', info: 0 };
		let num = 10;
		while (num) {
			if (await this.tolink.connect(this)) {
				this.connect_status.link = 1;
				link_status.info = 1;
				break;
			} else num--;
			if (num == 0) {
				this.connect_status.link = 2;
				link_status.info = 2;
				break;
			}
			await this.wait(1000);
		}
		if (this.inst) this.send(link_status);
	}
	async connectDB() {
		let db_status = { type: 'toSer', job: 'dbStatus', info: 0 };
		let num = 10;
		while (num) {
			if (this.todb.inst) {
				this.todb.send({ type: 'toDB', route: 'reconnect' });
				break;
			} else if (await this.todb.connect(this, this.tolink)) {
				this.todb.send({ type: 'toDB', route: 'connect' });
				break;
			} else num--;
			if (num == 0) {
				db_status.info = 2;
				this.connect_status.db = 2;
				if (this.inst) this.send(db_status);
				break;
			}
			await this.wait(1000);
		}
	}
	send(obj: any) {
		this.pis.write(obj);
	}
	private wait(time: any) {
		return new Promise((resolve) => {
			setTimeout(function() {
				resolve(0);
			}, time);
		});
	}
	private handle(data: any) {
		// console.log('server_rev:', data);
		switch (data.type) {
			// toThisServer
			case 'toSer':
				this.execJob(data);
				break;
			// toDBserver
			case 'toDB':
				if (data.route == 'copyPrj' && data.job == 'copy') {
					this.todb.copyinfo.end = data.info.end;
					this.todb.copyinfo.pname = data.info.prjname;
					this.todb.copyinfo.cname = data.info.msg.name;
				}
				this.todb.send(data);
				break;
			default:
				break;
		}
	}
	private execJob(data: any) {
		switch (data.job) {
			case 'getAuth':
				let auth: any = {};
				auth.status = true;
				if (!auth.status) {
					auth.fn = __passoa_auth_getfn();
					auth.hwid = __passoa_auth_gethwid();
				}
				data.info = auth;
				this.send(data);
				break;
			case 'setAuth':
				data.info = __passoa_auth_setsn(data.info);
				this.send(data);
				break;
			case 'connectStatus':
				data.info = { db: this.connect_status.db, link: this.connect_status.link };
				this.send(data);
				break;
			case 'reconnect':
				for (let re of data.info) {
					switch (re) {
						case 'db':
							this.connectDB();
							break;
						case 'link':
							this.connectLink();
							break;
					}
				}
				break;
			case 'readConfig':
				let cj = new util.TextDecoder().decode(fs.readFileSync(this.configPath));
				data.info = JSON.parse(cj);
				this.send(data);
				break;
			case 'saveConfig':
				fs.writeFileSync(this.configPath, JSON.stringify(data.info));
				data.info = true;
				this.send(data);
				break;
			case 'readReport':
				let repPath = this.dirPath + data.prjname + '/report.json';
				if (!fs.existsSync(repPath)) {
					data.info = { caseData: [], testInfo: null };
				} else {
					let rj = new util.TextDecoder().decode(fs.readFileSync(repPath));
					data.info = JSON.parse(rj);
				}
				this.send(data);
				break;
			case 'readStopinfo':
				let stopinfoPath = this.dirPath + data.prjname + '/stopInfo.json';
				data.info = false;
				if (fs.existsSync(stopinfoPath)) {
					let rj = new util.TextDecoder().decode(fs.readFileSync(stopinfoPath));
					let stopinfo = JSON.parse(rj);
					if (stopinfo.sid > 0) data.info = true;
				}
				this.send(data);
				break;
			case 'startTest':
				this.tolink.send(data);
				break;
			case 'stopTest':
				this.tolink.send(data);
				break;
			case 'continueTest':
				this.tolink.send(data);
				break;
			case 'replayTest':
				let stopPath = this.dirPath + data.info.prjname + '/stopInfo.json';
				fs.writeFileSync(stopPath, JSON.stringify({ sid: 0, mid: 0 }));
				this.tolink.send(data);
				break;
			case 'clearStopInfo':
				let clearPath = this.dirPath + data.info.prjname + '/stopInfo.json';
				fs.writeFileSync(clearPath, JSON.stringify({ sid: 0, mid: 0 }));
				this.send(data);
				break;
			case 'syncRemote':
				this.tolink.send(data);
				break;
			case 'saveCutImage':
				this.tolink.send(data);
				break;
			case 'pushPassoa':
				this.tolink.send(data);
				break;
			case 'savePhoto':
				let screenPath = this.dirPath + data.info.prjname + '/screen';
				if (!fs.existsSync(screenPath)) fs.mkdirSync(screenPath);
				let imgPath = this.dirPath + data.info.prjname + '/img';
				if (!fs.existsSync(imgPath)) fs.mkdirSync(imgPath);
				fs.writeFileSync(screenPath + '/screen.png', data.info.img_data);
				if (data.info.type) {
					this.tolink.send(data);
				} else {
					fs.writeFileSync(imgPath + '/' + data.info.id + '.png', data.info.img_data);
					data.info = true;
					this.send(data);
				}
				break;
			case 'testPhoto':
				if (data.info.ret) {
					let testPhotoPath = this.dirPath + data.info.prjname + '/tmp';
					if (!fs.existsSync(testPhotoPath)) fs.mkdirSync(testPhotoPath);
					fs.writeFileSync(testPhotoPath + '/tmp.png', data.info.img_data);
				}
				data.info = data.info.ret;
				this.tolink.send(data);
				break;
			case 'reTakeImg':
				this.tolink.send(data);
				break;
			case 'readDbc':
				let dbcPath = this.dirPath + data.prjname + '/dbc.json';
				if (fs.existsSync(dbcPath)) {
					data.data = new util.TextDecoder().decode(fs.readFileSync(dbcPath));
				}
				this.send(data);
				break;
		}
	}
}
