import * as childprs from 'child_process';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as net from 'net';
import * as pack from '@passoa/pack';
import ADB from './res/adb/adb';
import { logger } from '@passoa/logger';

export class Web_mgr {
	private mgr: any;
	private link: any;
	private Cvip: any;
	private prjPath: string = '';
	private imgCount = 0;

	private pos: any = new pack.unpackStream();
	private pis: any = new pack.packStream();
	private ints: any;
	constructor() {
		this.pis.on('data', (data: any) => {
			this.ints.write(data);
		});
		this.pos.on('data', (data: any) => {
			switch (data.route) {
				case 'image':
					if (data.job == 'list') {
						fs.writeFileSync(this.prjPath + '/imgCfg.json', JSON.stringify(data.info.imgCfg));
						if (data.info.downList.length) {
							fs.ensureDirSync(this.prjPath + '/img');

							this.imgCount = data.info.downList.length;
							this.pis.write({ route: 'image', job: 'downImg', info: data.info.downList });
						} else {
							let test_link = this.mgr.getLink('test', 'test');
							if (test_link) test_link.sendCmd({ type: 'toSQL', route: 'image', job: 'list' });
						}
					} else if (data.job == 'downImg') {
						fs.writeFileSync(this.prjPath + '/img/' + data.info.imgId + '.png', data.info.buffer);
						this.imgCount--;
						if (this.imgCount == 0) {
							let test_link = this.mgr.getLink('test', 'test');
							if (test_link) test_link.sendCmd({ type: 'toSQL', route: 'image', job: 'list' });
						}
					}
			}
		});
	}

	private async handleCmd(obj: any) {
		switch (obj.job) {
			case 'startTest':
				let jsPath_s = `"${path.join(__dirname, '../testop/main.js')}"`;
				this.startJS(obj, jsPath_s);
				break;
			case 'continueTest':
				let jsPath_c = `"${path.join(__dirname, '../testop/main.js')}"`;
				this.startJS(obj, jsPath_c);
				break;
			case 'stopTest':
				let test_link = this.mgr.getLink('test', 'test');
				if (test_link) test_link.stopTest();
				break;
			case 'replayTest':
				let jsPath_r = `"${path.join(__dirname, '../testop/main.js')}"`;
				this.startJS(obj, jsPath_r);
				break;
			case 'syncRemote':
				let device_link = this.mgr.getLink('device', 'device');
				if (device_link) device_link.handleWebJob(obj);
				break;
			case 'saveCutImage':
				let passoaPath = process.execPath;
				let prjPath = path.dirname(path.dirname(passoaPath)) + '/data_store/projects/' + obj.info.prjname;
				let screenPath = prjPath + '/screen/screen.png';
				let imgPath = prjPath + '/img';
				fs.ensureDirSync(imgPath);
				let icon_info = obj.info.cut_info;
				let iconPath = imgPath + '/' + icon_info.id + '.png';
				if (!this.Cvip) this.Cvip = require('@passoa/cvip');
				let ret = this.Cvip.imageCut(
					screenPath,
					iconPath,
					16,
					icon_info.info.x1,
					icon_info.info.y1,
					icon_info.info.w,
					icon_info.info.h
				);
				let buf = fs.readFileSync(iconPath);
				this.pis.write({ route: 'image', job: 'add', info: { imgId: icon_info.id, pid: 1, buffer: buf } });
				this.link.write({ type: obj.type, job: obj.job, ret: ret });
				break;
			case 'pushPassoa':
				if (obj.info.type == 'adb') {
					let cmd =
						'push "' +
						path.dirname(process.execPath) +
						'/remote/' +
						obj.info.version +
						'/." ' +
						obj.info.path;
					let push_ret: any = await this.pushByADB(cmd, true, 45000);
					if (!push_ret.ret) obj.info = false;
					else {
						let ret_shell: any = await this.pushByADB('shell', false, 3000);
						let ret_chmod: any = await this.pushByADB(
							'chmod 777 ' + obj.info.path + '/passoa',
							false,
							3000
						);
						ADB.endADB();
						obj.info = ret_shell.ret && ret_chmod.ret;
					}
					this.link.write(obj);
				}
				break;
			case 'savePhoto':
				let passoa_path = process.execPath;
				let prj_path = path.dirname(path.dirname(passoa_path)) + '/data_store/projects/' + obj.info.prjname;
				let screen_path = prj_path + '/screen/screen.png';
				let img_path = prj_path + '/img/' + obj.info.id + '.png';
				if (!this.Cvip) this.Cvip = require('@passoa/cvip');
				let img_ret = this.Cvip.imageCut(
					screen_path,
					img_path,
					16,
					obj.info.info.x1,
					obj.info.info.y1,
					obj.info.info.w,
					obj.info.info.h
				);
				let ptobuf = fs.readFileSync(img_path);
				this.pis.write({ route: 'image', job: 'add', info: { imgId: obj.info.id, pid: 1, buffer: ptobuf } });
				obj.info = img_ret ? false : true;
				this.link.write(obj);
				break;
			case 'testPhoto':
				let to_test = this.mgr.getLink('test', 'test');
				if (to_test) to_test.disposedCompleted('toWeb', obj.info);
				break;
			case 'reTakeImg':
				let img_info = obj.info.msg.img_info;
				let binding_info = obj.info.msg.binding_info;
				if (!this.Cvip) this.Cvip = require('@passoa/cvip');
				if (img_info.action == 'assert_pto' && binding_info.content.type == 0) {
					this.Cvip.imageSave(img_info.screen, img_info.image, 16);
					obj.info = true;
					this.link.write(obj);
				} else {
					let ctn = img_info.action == 'assert_pto' ? binding_info.content.info : binding_info.content;
					let img_ret = this.Cvip.imageCut(img_info.screen, img_info.image, 16, ctn.x1, ctn.y1, ctn.w, ctn.h);
					obj.info = img_ret ? false : true;
					this.link.write(obj);
				}
				let rebuf = fs.readFileSync(img_info.image);
				this.pis.write({ route: 'image', job: 'add', info: { imgId: img_info.id, pid: 1, buffer: rebuf } });
				break;
			default:
				break;
		}
	}

	private pushByADB(cmd: string, needReturn: boolean, timeout: number) {
		return new Promise((resolve) => {
			let timer: any;
			ADB.sendData(cmd, (data: any) => {
				switch (data.ret) {
					case 0:
						break;
					case 1:
						data.data[data.data.length - 1] = 0x20;
						this.link.write({ type: 'toSer', job: 'pushLog', info: data.data.toString() });
						break;
					case 2:
						if (timer) {
							clearTimeout(timer);
							timer = null;
						}
						resolve({ ret: data.data ? 0 : 1 });
						break;
					default:
						break;
				}
			});
			timer = setTimeout(() => {
				resolve({ ret: needReturn ? 0 : 1 });
			}, timeout);
		});
	}

	create(link: any, obj: any, mgr: any) {
		this.link = link;
		this.mgr = mgr;
		this.link.onData(this.handleCmd.bind(this));
		this.link.write({ type: 'auth', state: 'ok' });
		this.connectToSQL();
	}

	connectToSQL() {
		this.ints = net.connect(6004, '127.0.0.1', () => {
			console.info('sql-link connect!!!');
		});
		this.ints.on('data', (data: any) => {
			this.pos.write(data);
		});
		this.ints.on('close', () => {
			console.info('close sql-link socket!!!');
		});
		this.ints.on('error', () => {
			console.error('error');
		});
	}

	disposedSQL(obj: any) {
		if (obj.route == 'image' && obj.job == 'list') {
			this.prjPath = obj.info.prjpath;
		}
		this.pis.write(obj);
	}

	startJS(obj: any, jsPath: any) {
		//let testcfg: any = require('./testcfg.json');
		let passoaPath = process.execPath;
		let prjpath = obj.info.prjname;
		let execpath = '"' + passoaPath + '" ' + jsPath + ' "' + prjpath + '"';
		console.log('begin test:', execpath);

		let logDirPath = path.join(path.dirname(path.dirname(passoaPath)), '/data_store/projects/' + prjpath + '/log');
		fs.ensureDirSync(logDirPath);
		//if (!fs.existsSync(logDirPath)) fs.mkdirSync(logDirPath);
		// let loger = new logger();
		// let test_log = fs.createWriteStream(logDirPath + '/testlog.txt');

		let cmd: any = childprs.exec(execpath, (err, stdout, stderr) => {
			console.log('test has end!!!');
		});
		// console.log(logDirPath);
		// cmd.stdout.pipe(loger).pipe(test_log);
		// cmd.stdout.removeAllListeners("data");
		// cmd.stderr.removeAllListeners("data");
		// cmd.removeAllListeners("close");
		// cmd.stdout.on('data',(data:any) => {
		//     console.log('CMD-LOG:', data.toString());
		// });
		// cmd.stderr.on('data',(err:any) => {
		//     console.error('CMD-ERROR', err);
		// });
		cmd.on('close', (code: any) => {
			console.error('CMD-close', code);
		});
	}

	sendToWebServer(data: any) {
		this.link.write(data);
	}
}
