import * as net from 'net';
import * as pack from '@passoa/pack';
import { Server } from './server';

export class ToLink {
	private pis = new pack.packStream();
	private pos = new pack.unpackStream();
	private inst: any;
	private proCall: any;
	private ser: any;
	private c_flag: boolean = false;
	constructor() {
		this.pis.on('data', (data: any) => {
			this.inst.write(data);
		});
		this.pos.on('data', (data: any) => {
			this.handle(data);
		});
	}
	connect(ser: Server) {
		return new Promise((resolve) => {
			this.ser = ser;
			this.closeOnEvent();
			this.inst = net.connect(6000, '127.0.0.1', () => {
				console.info('Web_server_connect!');
				this.proCall = resolve;
			});
			this.inst.on('data', (data: any) => {
				this.pos.write(data);
			});
			this.inst.on('close', () => {
				console.info('close Web_server_connect!');
			});
			this.inst.on('error', () => {
				if (this.c_flag) {
					this.c_flag = false;
					if (this.ser.inst) this.ser.send({ type: 'toSer', job: 'linkStatus', info: 2 });
				}
				console.error('Web_server_connect error!');
				resolve(false);
			});
		});
	}
	send(obj: any): void {
		this.pis.write(obj);
	}
	private closeOnEvent() {
		if (this.inst) {
			this.inst.removeAllListeners('data');
			this.inst.removeAllListeners('close');
			this.inst.removeAllListeners('error');
		}
	}
	private handle(data: any) {
		switch (data.type) {
			case 'init':
				this.send({ type: 'info', class: 'web', name: 'web' });
				break;
			case 'auth':
				this.c_flag = true;
				this.proCall(data.state == 'ok');
				break;
			default:
				console.log(data, this.ser.inst);
				if (this.ser.inst) this.ser.send(data);
				break;
		}
	}
}
