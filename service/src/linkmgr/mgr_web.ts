import * as pack from '@passoa/pack';
import * as cvip from '@passoa/cvip';
import * as childprs from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export class Web_mgr {
	private pos: any = new pack.unpackStream();
	private pis: any = new pack.packStream();
	private intc: any;
	private link: any;
	constructor() {
		this.pis.on('data', (data: any) => {
			this.intc.write(data);
		});
		this.pos.on('data', (data: any) => {
			this.handleCmd(data);
		});
	}

	private handleCmd(obj: any) {
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
				let test_link = this.link.getLink('test', 'test');
				test_link.stopTest();
				break;
			case 'replayTest':
				let jsPath_r = '"' + __dirname + '/test.js"';
				this.startJS(obj, jsPath_r);
				break;
			case 'syncRemote':
				let jsPath_y = '"' + __dirname + '/pic.js"';
				this.startJS(obj, jsPath_y);
				break;
			case 'saveCutImage':
				let passoaPath = process.execPath;
				let prjPath = path.dirname(path.dirname(passoaPath)) + '/data_store/projects/' + obj.info.prjname;
				let screenPath = prjPath + '/screen/screen.png';
				let imgPath = prjPath + '/img';
				if (!fs.existsSync(imgPath)) fs.mkdirSync(imgPath);
				let icon_info = obj.info.cut_info;
				let iconPath = imgPath + '/' + icon_info.id + '.png';
				console.log(cvip);
				let ret = cvip.imageCut(
					screenPath,
					iconPath,
					16,
					icon_info.info.x1,
					icon_info.info.y1,
					icon_info.info.w,
					icon_info.info.h
				);
				this.pis.write({ type: obj.type, job: obj.job, ret: ret });
				break;
			default:
				break;
		}
	}

	create(c: any, obj: any, link: any) {
		this.intc = c;
		this.link = link;
		this.intc.on('data', (data: any) => {
			this.pos.write(data);
		});
		this.pis.write({ type: 'auth', state: 'ok' });
	}

	startJS(obj: any, jsPath: any) {
		let testcfg: any = require('./testcfg.json');
		let passoaPath = process.execPath;
		let prjpath = path.dirname(path.dirname(passoaPath)) + '/data_store/projects/' + obj.info.prjname;
		let execpath = '"' + passoaPath + '" ' + jsPath + ' "' + prjpath + '"';
		console.log(execpath);
		childprs.exec(execpath, { windowsHide: testcfg.windowsHide });
	}

	sendToWebServer(data: any) {
		this.pis.write(data);
	}
}
