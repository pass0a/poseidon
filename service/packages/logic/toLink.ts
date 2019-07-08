import * as net from 'net';
import * as pack from '@passoa/pack';
import { Server } from './server';

export class ToLink {
	private pis = new pack.inputStream();
	private pos = new pack.outputStream();
	private inst: any;
	private proCall:any;
	private ser: any;
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
			let that: any = this;
			that.inst = net.connect(6000, '127.0.0.1', function() {
				console.info('web_server connect!!!');
				that.inst.on('data', function(data: any) {
					that.pos.push(data);
				});
				that.inst.on('close', function() {
					console.info('close web_server!!!');
				});
				that.proCall=resolve;
			});
			that.inst.on('error', () => {
				resolve(false);
			});
		});
	}
	send(obj: any): void {
		this.pis.push(obj);
	}
	private handle(data: any) {
		switch(data.type){
			case "init":
				this.send({type:"info",class:"web",name:"web"});
				break;
			case "auth":
				this.proCall(data.state=="ok");
				break;
			default:
				this.ser.send(data);
				break;
		}
		console.log(data);
	}
}
