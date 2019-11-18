import * as pack from '@passoa/pack';
import QGBox from './res/qgbox/index';
import Pcan from './res/pcan/index';
import DBC from '../candbc/index';

export class Test_mgr {
	private currentStatus: boolean = true;
	private mgr: any;
	private link: any;
	constructor() {}
	private async handleCmd(obj: any) {
		switch (obj.type) {
			case 'tolink':
				let web_mgr = this.mgr.getLink('web', 'web');
				if (web_mgr) web_mgr.sendToWebServer(obj);
				break;
			case 'toCom':
				let com_mgr = this.mgr.getLink('com', 'com');
				if (com_mgr) {
					let ret = await com_mgr.handleCmd(obj);
					this.link.write({ type: obj.type, job: obj.job, data: ret.ret });
				}
				break;
			case 'toDevice':
				let device_mgr = this.mgr.getLink('device', 'device');
				if (device_mgr) {
					let ret = await device_mgr.handleTestJob(obj);
					this.link.write({ type: obj.type, job: obj.job, data: ret });
				}
				break;
			case 'get_status':
				this.disposedCompleted(obj.type, this.currentStatus);
				break;
			case 'toWeb':
				let to_web = this.mgr.getLink('web', 'web');
				if (to_web) to_web.sendToWebServer(obj);
				break;
			case 'toDB':
				let to_db = this.mgr.getLink('db', 'db');
				if (to_db) to_db.sendCmd(obj);
				break;
			case 'toQgBox':
				let qbbox_ret = await QGBox.sendBoxApi(obj.info.module, 0, obj.info.cfg);
				this.disposedCompleted(obj.type, qbbox_ret);
				break;
			case 'toPcan':
				this.disposedPcanCmd(obj, obj.info);
				break;
			case 'toDBC':
				let dbc_data = DBC.getDBC_sendData(obj.info.msg, obj.info.sgn, obj.info.val);
				console.log(dbc_data);
				this.disposedCompleted(obj.type, dbc_data);
				break;
			default:
				break;
		}
	}
	private disposedPcanCmd(obj: any, info: any) {
		let ret: any;
		switch (obj.job) {
			case 'open':
				ret = Pcan.open(info, (ev: any, data: any) => {
					// console.log(ev,data);
				});
				break;
			case 'send':
				Pcan.send(obj.data.data, obj.data.id);
				ret = 1;
				break;
			case 'close':
				Pcan.close();
				ret = 1;
				break;
		}
		this.disposedCompleted(obj.type, { ret: ret });
	}
	private disposedCompleted(type: any, data: any) {
		this.link.write({ type: type, data: data });
	}
	sendCmd(info: any) {
		this.link.write(info);
	}
	create(link: any, obj: any, mgr: any) {
		this.mgr = mgr;
		this.link = link;
		this.link.onData(this.handleCmd.bind(this));
		this.link.write({ type: 'auth', state: 'ok' });
	}
	stopTest() {
		this.currentStatus = false;
	}
}
