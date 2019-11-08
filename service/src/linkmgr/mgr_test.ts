import * as pack from "@passoa/pack";
import QGBox from './res/qgbox/index';
import Pcan from './res/pcan/index';
import DBC from '../candbc/index';

export class Test_mgr{
	private pos:any = new pack.unpackStream();
	private pis:any = new pack.packStream();
	private intc:any;
	private link:any;
	private currentStatus:boolean = true;
	constructor() {
		this.pis.on('data', (data: any) => {
			this.intc.write(data);
		});
		this.pos.on('data', (data: any) => {
			this.handleCmd(data);
		});
	}
	private async handleCmd(obj: any) {
		switch (obj.type) {
			case 'tolink':
				let web_link = this.link.getLink('web', 'web');
				if(web_link)web_link.sendToWebServer(obj);
				break;
			case 'toCom':
				let com_link = this.link.getLink('com','com');
				if(com_link){
					let ret = await com_link.handleCmd(obj);
					this.pis.write({ type: obj.type, job:obj.job, data: ret.ret});
				}
				break;
			case 'toDevice':
				let device_link = this.link.getLink('device', 'device');
				if(device_link){
					let ret = await device_link.handleTestJob(obj);
					this.pis.write({ type: obj.type, job:obj.job, data: ret});
				}
				break;
			case 'get_status':
				this.disposedCompleted(obj.type, this.currentStatus);
				break;
			case 'toWeb':
				let to_web = this.link.getLink('web', 'web');
				if(to_web)to_web.sendToWebServer(obj);
				break;
			case 'toDB':
				let to_db = this.link.getLink('db', 'db');
				if(to_db)to_db.sendCmd(obj);
				break;
			case "toQgBox":
				let qbbox_ret = await QGBox.sendBoxApi(obj.info.module, 0, obj.info.cfg);
				this.disposedCompleted(obj.type, qbbox_ret);
				break;
			case "toPcan":
				this.disposedPcanCmd(obj,obj.info);
				break;
			case "toDBC":
				let dbc_data = DBC.getDBC_sendData(obj.info.msg, obj.info.sgn, obj.info.val);
				console.log(dbc_data);
				this.disposedCompleted(obj.type,dbc_data);
				break;
			default:
				break;
		}
	};
	private disposedPcanCmd(obj:any,info:any){
		let ret:any;
		switch(obj.job){
			case "open":
				ret = Pcan.open(info,(ev:any,data:any)=>{
					// console.log(ev,data);
				});
				break;
			case "send":
				Pcan.send(obj.data.data,obj.data.id);
				ret = 1;
				break;
			case "close":
				Pcan.close();
				ret = 1;
				break;
		}
		this.disposedCompleted(obj.type, {ret:ret});
	}
	private disposedCompleted(type:any, data:any) {
		this.pis.write({ type: type, data: data });
	};
	sendCmd(info:any){
		this.pis.write(info);
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
	stopTest() {
		this.currentStatus = false;
	}
}
