import * as fs from 'fs';
import { Uart } from './res/uart/com';
import { logger } from '@passoa/logger';
import relay from './res/parse/relay';
import da_arm from './res/parse/da_arm';
import power from './res/parse/power';

export class Com_mgr {
	private mgr: any;
	private link: any;
	private uartlist: any = [];
	constructor() {}

	async handleCmd(obj: any) {
		let result: any;
		switch (obj.job) {
			case 'startPassoa':
				result = await this.openNeedUarts([ 'da_arm' ], obj.cfg);
				if (result.ret) {
					result = await this.sendDataByName({
						name: 'da_arm',
						cmd: 'start_arm_server',
						msg: obj.cfg.da_server
					});
					this.uartlist['da_arm'].closeUart();
					this.uartlist['da_arm'] = null;
				}
				break;
			case 'sendData':
				result = await this.sendDataByName(obj.info);
				break;
			case 'openCom':
				result = await this.openNeedUarts(obj.info, obj.cfg);
				break;
			case 'closeCom':
				result = await this.closeAllUarts();
				break;
			case 'openLog':
				result = await this.openComLog(obj.info);
				break;
		}
		return new Promise((resolve) => {
			resolve(result);
		});
	}

	private async openComLog(info: any) {
		let ret: any = { ret: 0 };
		if (this.uartlist[info.id]) {
			let file = fs.createWriteStream(info.filename);
			// let loger = new logger();
			// ret = await this.uartlist[info.id].openLog(loger, file);
		}
		return new Promise((resolve) => {
			resolve(ret);
		});
	}

	private async sendDataByName(info: any) {
		let ret: any = { ret: 0 };
		if (this.uartlist[info.name]) {
			let sd: any;
			let notNeedReturn = 1;
			let needReturn = 0;
			switch (info.name) {
				case 'relay':
					sd = relay.disposeSendData(info.cmd);
					ret = await this.uartlist[info.name].sendData(sd, notNeedReturn);
					break;
				case 'da_arm':
					let skl = info.cmd == 'start_arm_server' ? needReturn : notNeedReturn;
					sd = da_arm.disposeSendData(info.cmd, info.msg);
					let s_t = info.cmd == 'start_arm_server' || info.cmd == 'others';
					if (info.msg.others_flag && s_t) {
						if (info.msg.others_cmd.indexOf(';') > -1) {
							let others_cmd_list = info.msg.others_cmd.split(';');
							if (info.msg.others_cmd.endsWith(';')) others_cmd_list.pop();
							for (let i = 0; i < others_cmd_list.length; i++) {
								await this.uartlist[info.name].sendData(others_cmd_list[i] + ' \n', notNeedReturn);
								await this.wait(200);
							}
						} else {
							let others_cmd = info.msg.others_cmd + ' \n';
							await this.uartlist[info.name].sendData(others_cmd, notNeedReturn);
						}
					}
					ret = info.cmd == 'others' ? 0 : await this.uartlist[info.name].sendData(sd, skl, da_arm, 10000);
					break;
				case 'power':
					sd = power.disposeSendData(info.cmd);
					ret = await this.uartlist[info.name].sendData(sd, notNeedReturn);
					break;
			}
		}
		return new Promise((resolve) => {
			resolve(ret);
		});
	}

	private async wait(t: number) {
		return new Promise((resolve) => {
			setTimeout(function() {
				resolve({ ret: 0 });
			}, t);
		});
	}

	private async closeAllUarts() {
		for (let prop in this.uartlist) {
			if (this.uartlist[prop]) {
				this.uartlist[prop].closeUart();
				this.uartlist[prop] = null;
			}
		}
		return new Promise((resolve) => {
			resolve(1);
		});
	}

	private async openNeedUarts(uartArray: Array<any>, cfg: any) {
		let comNum: Array<any> = [];
		let error: boolean = false;
		for (let i = 0; i < uartArray.length; i++) {
			let uart_name = uartArray[i];
			let uart_info: any = { port: '', info: {} };
			for (let prop in cfg.uarts[uart_name]) {
				if (prop == 'port') {
					uart_info.port = 'COM' + cfg.uarts[uart_name][prop];
					if (comNum.indexOf(uart_info.port) > -1) {
						error = true;
						break;
					} else comNum.push(uart_info.port);
				} else uart_info.info[prop] = cfg.uarts[uart_name][prop];
			}
			let result: any;
			if (!error) {
				uart_info.id = uart_name;
				this.uartlist[uart_name] = new Uart();
				result = await this.uartlist[uart_name].openUart(uart_info, (name: string) => {});
			}
			if (error || !result.ret) {
				i -= 1;
				while (i > -1) {
					await this.uartlist[uartArray[i]].closeUart();
					this.uartlist[uartArray[i]] = null;
					i--;
				}
				return new Promise((resolve) => {
					resolve({ ret: 0 });
				});
			}
		}
		return new Promise((resolve) => {
			resolve({ ret: 1 });
		});
	}

	create(link: any, obj: any, mgr: any) {
		this.link = link;
		this.mgr = mgr;
		this.link.onData(this.handleCmd.bind(this));
		this.link.write({ type: 'auth', state: 'ok' });
	}
}
