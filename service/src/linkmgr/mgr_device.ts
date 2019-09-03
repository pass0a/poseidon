import * as pack from "@passoa/pack";
import * as path from 'path';
import * as fs from "fs";
import * as util from "util";
import * as os from "os";
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
				if(await this.startPassoa(data,cfg)){
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
				if(await this.startPassoa(data,data.info.cfg)){
					result = await Remote.sendCmd({type:"cutScreen",info:data.info.screenPath});
				}
				break;
			case "click":
				if(await this.startPassoa(data,data.info.cfg)){
					result = await Remote.sendCmd({type:"click",x:data.info.x,y:data.info.y,click_type:data.info.click_type,time:data.info.time});
				}
				break;
			case "slide":
				if(await this.startPassoa(data,data.info.cfg)){
					result = await Remote.sendCmd({type:"slide",x1:data.info.x1,y1:data.info.y1,x2:data.info.x2,y2:data.info.y2,time:data.info.time});
				}
				break;
			case "checkADB":
				result = await this.checkADB();
				break;
		}
		return new Promise(resolve => {
			resolve(result);
		});
	}
	private async startPassoa(data:any,cfg:any){
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
					let adb_start:any = await ADB.startADB("shell");
					let start_status:boolean = false;
					if(adb_start.ret){
						let p_cmd = cfg.da_server.path + "/passoa " + cfg.da_server.path+"/app.js&";
						if(await ADB.sendByADB(p_cmd,true)){
							start_status = true;
							ADB.endADB();
						}
					}
					if(!start_status){
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
	private wait(w_time:any){
        return new Promise(resolve => {
            setTimeout( () => {
                resolve(0);
            },w_time);
        });
	}
	private async checkADB(){
		let result:number = 0;
		let adb_start:any = await ADB.startADB("shell");
		if(adb_start.ret){
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
