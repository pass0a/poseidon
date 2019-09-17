import * as pack from "@passoa/pack";
import * as path from 'path';
import * as fs from "fs";
import * as util from "util";
import * as os from "os";
import { logger } from '@passoa/logger';
import Remote from "./res/remote/remote";
import ADB from "./res/adb/adb";

// 异常代码 code : 1-网络异常无法连接设备 2-ADB异常 3-串口异常

export class Device_mgr{
	private pos:any = new pack.unpackStream();
	private pis:any = new pack.packStream();
	private intc:any;
	private link:any;
	private prjDir:string = path.dirname(path.dirname(process.execPath)) + '/data_store/projects/';
	constructor() {
		this.pis.on('data', (data: any) => {
			this.intc.write(data);
		});
		this.pos.on('data', (data: any) => {
		});
	}
	async handleWebJob(data: any) {
		switch(data.job){
			case "syncRemote":
				let prjpath = this.prjDir + data.info.prjname;
				let isExitst = fs.existsSync(prjpath+"/screen");
				if(!isExitst)fs.mkdirSync(prjpath+"/screen");
				let path = os.homedir() + "/data_store/config.json";
				let cfg=JSON.parse(new util.TextDecoder().decode(fs.readFileSync(path)));
				if(await this.startPassoa(data,cfg,true)){
					let screenPath = prjpath + "/screen/screen.png";
					data.info.msg = await Remote.sendCmd({type:"cutScreen",info:screenPath});
					data.info.screen = screenPath;
					this.sendDataByWebLink(data);
				}
				break;
		}
	};
	async handleTestJob(data:any){
		let result:any = {ret:0};
		switch(data.job){
			case "cutScreen":
				if(await this.startPassoa(data,data.info.cfg,false)){
					result = await Remote.sendCmd({type:"cutScreen",info:data.info.screenPath});
				}
				break;
			case "click":
				if(await this.startPassoa(data,data.info.cfg,false)){
					result = await Remote.sendCmd({type:"click",x:data.info.x,y:data.info.y,click_type:data.info.click_type,time:data.info.time});
				}
				break;
			case "slide":
				if(await this.startPassoa(data,data.info.cfg,false)){
					result = await Remote.sendCmd({type:"slide",x1:data.info.x1,y1:data.info.y1,x2:data.info.x2,y2:data.info.y2,time:data.info.time});
				}
				break;
			case "checkADB":
				result = await this.checkADB();
				break;
			case "sendADB":
				result = await this.sendADB(data.info); 
				break;
			case "closeADB":
				ADB.endADB();
				result = 1;
				break;
			case "openLog":
				result = await this.openLogByADB(data.info);
				break;
		}
		return new Promise(resolve => {
			resolve(result);
		});
	}
	private openLogByADB(info:any){
		return new Promise(resolve => {
			let loger = new logger();
			let file = fs.createWriteStream(info.filename);
			let timer:any;
			ADB.openADBLog(info.adb_cmd,loger,file,(data:any)=>{
				if(!data.ret){
					if(timer){
						clearTimeout(timer);
						timer = null;
					}
					resolve(0);
				}
			})
			timer = setTimeout( () => {
                resolve(1);
            },1000);
		});
	}
	private sendADB(adbInfo:any){
		return new Promise(resolve => {
			if(!adbInfo.timeout)adbInfo.timeout = 1000;
			let timer:any;
			ADB.sendData(adbInfo.send_data,(data:any) => {
				switch(data.ret){
					case 0:
						break;
					case 1:
						if(adbInfo.type){
							if(data.data.indexOf(adbInfo.rev_data)>-1)resolve(0);
						}
						break;
					case 2:
						if(timer){
							clearTimeout(timer);
							timer = null;
						}
						resolve(data.data);
						break;
					default:
						break;
				}
			});
			timer = setTimeout( () => {
                resolve(adbInfo.type?2:0);
            },adbInfo.timeout);
		});
	}
	private async startPassoa(data:any,cfg:any,op:boolean){
		let cnum = 2;
		while(cnum){
			let rev:any = await Remote.checkAlive(cfg);
			if(rev.ret)break;
			else if(!rev.ret&&cnum==2){
				if(cfg.da_server.type==0){
					// 串口启动
					let com_link = this.link.getLink('com', 'com');
					if(com_link){
						let ct:any;
						if(data.job == "syncRemote"){
							ct = await com_link.handleCmd({type:"toCom",job:"startPassoa",cfg:cfg});
						}else{
							ct = await com_link.handleCmd({type:"toCom",job:"sendData",info:{name:"da_arm",cmd:"start_arm_server",msg:cfg.da_server}});
						}
						if(!ct.ret){
							data.info.msg = {ret:0,code:3}
							this.sendDataByWebLink(data);
							return new Promise(resolve => {
								resolve(0);
							});
						}
					}
				}else{
					// ADB启动
					let notify = false;
					let enter_shell:any = await this.startByADB("shell",false,3000);
					if(enter_shell.ret){
						let p_cmd = cfg.da_server.path + "/passoa " + cfg.da_server.path+"/app.js&";
						let start_passoa:any = await this.startByADB(p_cmd,true,20000);
						if(start_passoa.ret){
							notify = true;
							if(op)ADB.endADB();
						}
					}
					if(!notify){
						data.info.msg = {ret:0,code:2}
						this.sendDataByWebLink(data);
						return new Promise(resolve => {
							resolve(0);
						});
					}
				}
			}
			cnum --;
		}
		if(!cnum){
			data.info.msg = {ret:0,code:1}
			this.sendDataByWebLink(data);
		}
		return new Promise(resolve => {
			resolve(cnum);
		});
	}
	private async startByADB(cmd:string,needReturn:boolean,timeout:number){
		return new Promise(resolve => {
			let timer:any;
			ADB.sendData(cmd,(data:any) => {
				switch(data.ret){
					case 0:
						break;
					case 1:
						if(needReturn){
							if(data.data.indexOf("passoa success")>-1)resolve({ret:1});
						}
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
	private async checkADB(){
		let result:number = 0;
		let enter_shell:any = await this.startByADB("shell",false,1000);
		if(enter_shell.ret){
			result = 1;
			ADB.endADB();
		}
		return new Promise(resolve => {
			resolve(result);
		});
	}
 	private sendDataByWebLink(info:any){
		let web_link = this.link.getLink('web', 'web');
		if(web_link)web_link.sendToWebServer(info);
	}
	create(c:any,obj:any,link:any){
		this.intc = c;
		this.link = link;
		this.intc.on('data', (data:any) => {
			this.pos.write(data);
		});
		this.intc.on('close', () => {
			console.info('[link close]' + obj.class + '-' + obj.name + ':' + 'exit!!!');
			this.link.closeLink(obj.class,obj.name);
		});
		this.pis.write({ type: 'auth', state: 'ok' });
	}
}
