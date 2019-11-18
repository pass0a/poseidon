import * as pack from '@passoa/pack';
import * as childprs from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import ADB from './res/adb/adb';
import { logger } from '@passoa/logger';

export class Web_mgr {
	private mgr: any;
	private link: any;
	private Cvip: any;
	constructor() {}

	private async handleCmd(obj: any) {
		switch (obj.job) {
			case 'startTest':
				let jsPath_s = '"' + __dirname + '/test.js"';
				this.startJS(obj, jsPath_s);
				break;
			case 'continueTest':
				let jsPath_c = '"' + __dirname + '/test.js"';
				this.startJS(obj, jsPath_c);
				break;
			case 'stopTest':
<<<<<<< HEAD
				let test_link = this.link.getLink('test', 'test');
=======
				let test_link = this.mgr.getLink('test', 'test');
>>>>>>> 6f0d274832f6884d1055f2b32bb8d05d7de0c87c
				if (test_link) test_link.stopTest();
				break;
			case 'replayTest':
				let jsPath_r = '"' + __dirname + '/test.js"';
				this.startJS(obj, jsPath_r);
				break;
			case 'syncRemote':
<<<<<<< HEAD
				let device_link = this.link.getLink('device', 'device');
=======
				let device_link = this.mgr.getLink('device', 'device');
>>>>>>> 6f0d274832f6884d1055f2b32bb8d05d7de0c87c
				if (device_link) device_link.handleWebJob(obj);
				break;
			case 'saveCutImage':
				let passoaPath = process.execPath;
				let prjPath = path.dirname(path.dirname(passoaPath)) + '/data_store/projects/' + obj.info.prjname;
				let screenPath = prjPath + '/screen/screen.png';
				let imgPath = prjPath + '/img';
				if (!fs.existsSync(imgPath)) fs.mkdirSync(imgPath);
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
					let push_ret: any = await this.pushByADB(cmd, true, 30000);
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
				obj.info = img_ret ? false : true;
<<<<<<< HEAD
				this.pis.write(obj);
				break;
			case 'testPhoto':
				let to_test = this.link.getLink('test', 'test');
=======
				this.link.write(obj);
				break;
			case 'testPhoto':
				let to_test = this.mgr.getLink('test', 'test');
>>>>>>> 6f0d274832f6884d1055f2b32bb8d05d7de0c87c
				if (to_test) to_test.disposedCompleted('toWeb', obj.info);
				break;
			case 'reTakeImg':
				let img_info = obj.info.msg.img_info;
				let binding_info = obj.info.msg.binding_info;
				if (!this.Cvip) this.Cvip = require('@passoa/cvip');
				if (img_info.action == 'assert_pto' && binding_info.content.type == 0) {
					this.Cvip.imageSave(img_info.screen, img_info.image, 16);
					obj.info = true;
<<<<<<< HEAD
					this.pis.write(obj);
=======
					this.link.write(obj);
>>>>>>> 6f0d274832f6884d1055f2b32bb8d05d7de0c87c
				} else {
					let ctn = img_info.action == 'assert_pto' ? binding_info.content.info : binding_info.content;
					let img_ret = this.Cvip.imageCut(img_info.screen, img_info.image, 16, ctn.x1, ctn.y1, ctn.w, ctn.h);
					obj.info = img_ret ? false : true;
<<<<<<< HEAD
					this.pis.write(obj);
=======
					this.link.write(obj);
>>>>>>> 6f0d274832f6884d1055f2b32bb8d05d7de0c87c
				}
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
<<<<<<< HEAD
						this.pis.write({ type: 'toSer', job: 'pushLog', info: data.data.toString() });
=======
						data.data[data.data.length - 1] = 0x20;
						this.link.write({ type: 'toSer', job: 'pushLog', info: data.data.toString() });
>>>>>>> 6f0d274832f6884d1055f2b32bb8d05d7de0c87c
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
	}

	startJS(obj: any, jsPath: any) {
		let testcfg: any = require('./testcfg.json');
		let passoaPath = process.execPath;
		let prjpath = obj.info.prjname;
		let execpath = '"' + passoaPath + '" ' + jsPath + ' "' + prjpath + '"';
		console.log(execpath);

		let logDirPath = path.dirname(path.dirname(passoaPath)) + '/data_store/projects/' + prjpath + '/log';
		if (!fs.existsSync(logDirPath)) fs.mkdirSync(logDirPath);
		let loger = new logger();
		let test_log = fs.createWriteStream(logDirPath + '/testlog.txt');

		let cmd: any = childprs.exec(execpath, { windowsHide: testcfg.windowsHide });
		cmd.stdout.pipe(loger).pipe(test_log);
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
