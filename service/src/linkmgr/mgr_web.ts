import * as pack from '@passoa/pack';
import * as childprs from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import ADB from "./res/adb/adb";

export class Web_mgr {
	private pos: any = new pack.unpackStream();
	private pis: any = new pack.packStream();
	private intc: any;
	private link: any;
	private cvip: any;
	constructor() {
		this.pis.on('data', (data: any) => {
			this.intc.write(data);
		});
		this.pos.on('data', (data: any) => {
			this.handleCmd(data);
		});
	}

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
				let test_link = this.link.getLink('test', 'test');
				test_link.stopTest();
				break;
			case 'replayTest':
				let jsPath_r = '"' + __dirname + '/test.js"';
				this.startJS(obj, jsPath_r);
				break;
			case 'syncRemote':
				let device_link = this.link.getLink('device', 'device');
				if(device_link)device_link.handleWebJob(obj);
				break;
			case 'saveCutImage':
				if(!this.cvip)this.cvip = require("@passoa/cvip");
				let passoaPath = process.execPath;
				let prjPath = path.dirname(path.dirname(passoaPath)) + '/data_store/projects/' + obj.info.prjname;
				let screenPath = prjPath + '/screen/screen.png';
				let imgPath = prjPath + '/img';
				if (!fs.existsSync(imgPath)) fs.mkdirSync(imgPath);
				let icon_info = obj.info.cut_info;
				let iconPath = imgPath + '/' + icon_info.id + '.png';
				let ret = this.cvip.imageCut(
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
			case "pushPassoa":
				if(obj.info.type=="adb"){
					let cmd = "push \""+path.dirname(process.execPath)+"/remote/"+obj.info.version+"/. \""+obj.info.path;
					let push_ret:any = await this.pushByADB(cmd,true,30000);
					if(!push_ret.ret)obj.info = false;
					else{
						let ret_shell:any = await this.pushByADB("shell",false,3000);
						let ret_chmod:any = await this.pushByADB("chmod 777 "+obj.info.path+"/passoa",false,3000);
						ADB.endADB();
						obj.info = ret_shell.ret&&ret_chmod.ret;
					}
					this.pis.write(obj);
				}
				break;
			case "savePhoto":
				if(!this.cvip)this.cvip = require("@passoa/cvip");
				let passoa_path = process.execPath;
				let prj_path = path.dirname(path.dirname(passoa_path)) + '/data_store/projects/' + obj.info.prjname;
				let screen_path = prj_path + '/screen/screen.png';
				let img_path = prj_path + '/img/' + obj.info.id + ".png";
				let img_ret = this.cvip.imageCut(
					screen_path,
					img_path,
					16,
					obj.info.info.x1,
					obj.info.info.y1,
					obj.info.info.w,
					obj.info.info.h
				);
				obj.info = img_ret?false:true;
				this.pis.write(obj);
				break;
			default:
				break;
		}
	}

	private pushByADB(cmd:string,needReturn:boolean,timeout:number){
		return new Promise(resolve => {
			let timer:any;
			ADB.sendData(cmd,(data:any) => {
				switch(data.ret){
					case 0:
						break;
					case 1:
						break;
					case 2:
						if(timer){
							clearTimeout(timer);
							timer = null;
						}
						resolve({ret:data.data?0:1});
						break;
					default:
						break;
				}
			});
			timer = setTimeout( () => {
                resolve({ret:needReturn?0:1});
            },timeout);
		});
	}

	create(c: any, obj: any, link: any) {
		this.intc = c;
		this.link = link;
		this.intc.on('data', (data: any) => {
			this.pos.write(data);
		});
		this.intc.on('close', () => {
			console.info('[link close]' + obj.class + '-' + obj.name + ':' + 'exit!!!');
			this.link.closeLink(obj.class, obj.name);
		});
		this.pis.write({ type: 'auth', state: 'ok' });
	}

	startJS(obj: any, jsPath: any) {
		let testcfg: any = require('./testcfg.json');
		let passoaPath = process.execPath;
		let prjpath = path.dirname(path.dirname(passoaPath)) + '/data_store/projects/' + obj.info.prjname;
		let execpath = '"' + passoaPath + '" ' + jsPath + ' "' + prjpath + '"';
		console.log(execpath);
		let cmd:any = childprs.exec(execpath, { windowsHide: testcfg.windowsHide });
		// cmd.stdout.removeAllListeners("data");
        // cmd.stderr.removeAllListeners("data");
        // cmd.removeAllListeners("close");
		// cmd.stdout.on('data',(data:any) => {
        //     console.log('CMD-LOG:', data);
		// });
		// cmd.stderr.on('data',(err:any) => {
        //     console.error('CMD-ERROR', err);
        // });
        // cmd.on('close',(code:any) => {
        //     console.error('CMD-close', code);
        // });
	}

	sendToWebServer(data: any) {
		this.pis.write(data);
	}
}
