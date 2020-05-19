import QGBox from './res/qgbox/index';
import Pcan from './res/pcan/index';
import DBC from './res/candbc/index';
import BT from './res/bt/index';
import * as fs from 'fs';
import * as util from 'util';

export class Test_mgr {
	private currentStatus: boolean = true;
	private mgr: any;
	private link: any;
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
				// console.log(dbc_data);
				this.disposedCompleted(obj.type, dbc_data);
				break;
			case 'toBT':
				this.disposedBTCmd(obj);
				break;
			case 'toSQL':
				let websql_mgr = this.mgr.getLink('web', 'web');
				if (websql_mgr) websql_mgr.disposedSQL(obj);
				break;
			default:
				break;
		}
	}
	private disposedPcanCmd(obj: any, info: any) {
		let ret: any;
		switch (obj.job) {
			case 'open':
				let dbcInfo: any;
				let web_mgr = this.mgr.getLink('web', 'web');
				if (info.dbc_path && fs.existsSync(info.dbc_path)) {
					dbcInfo = JSON.parse(new util.TextDecoder().decode(fs.readFileSync(info.dbc_path)));
				}
				ret = Pcan.open(info.pcan_info, (ev: string, id: number, type: number, data: Buffer) => {
					if (dbcInfo) {
						for (let prop in dbcInfo.Messages_Info) {
							if (dbcInfo.Messages_Info[prop].id == id) {
								let pcan_log: any = {
									type: 'tolink',
									mode: 8,
									info: {
										type: type,
										id: '0x' + id.toString(16).toUpperCase(),
										signal: prop,
										dlc: 8
									}
								};
								for (let i = 0; i < data.length; i++) {
									let char_s = data[i].toString(16);
									if (char_s.length < 2) char_s = '0' + char_s;
									pcan_log.info['data' + i] = char_s.toUpperCase();
								}
								if (web_mgr) web_mgr.sendToWebServer(pcan_log);
								break;
							}
						}
					}
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
	private async disposedBTCmd(obj: any) {
		let ret: any = 0;
		switch (obj.job) {
			case 'bt_init':
				ret = await BT.init(obj.info.ping);
				break;
			case 'bt_connect':
				ret = await BT.connect(obj.info.mac);
				break;
			case 'bt_disconnect':
				BT.disconnect();
				break;
			case 'bt_incomingCall_1':
				BT.incomingCall('134001002003');
				break;
			case 'bt_incomingCall_2':
				BT.incomingCall('135221222223');
				break;
			case 'bt_answerCall':
				BT.answerCall();
				break;
			case 'bt_terminateCall':
				BT.terminateCall();
				break;
		}
		this.disposedCompleted(obj.type, ret);
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
