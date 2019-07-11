import * as net from 'net';
import * as pack from '@passoa/pack';
import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';
import * as os from 'os';
import { Server } from './server';
import { ToLink } from './toLink';

export class ToDB {
	private prjdir: any = path.dirname(path.dirname(process.execPath)) + 'data_store/projects/';
	private pis = new pack.inputStream();
	private pos = new pack.outputStream();
	private inst: any;
	private ser: any;
	private tolink: any;
	constructor() {
		this.pis.on('data', (data: any) => {
			this.inst.write(data);
		});
		this.pos.on('data', (data: any) => {
			this.handle(data);
		});
	}
	connect(ser: Server,toLink:ToLink) {
		return new Promise((resolve) => {
			this.ser = ser;
			this.tolink = toLink;
			let config_info = this.readConfig();
			let that: any = this;
			that.inst = net.connect(config_info.port, config_info.ip, function() {
				that.inst.on('data', function(data: any) {
					that.pos.push(data);
				});
				that.inst.on('close', function() {
					console.info('close DB_Server_connect!!!');
				});
				console.info('connect DB_Server success!!!');
				resolve(true);
			});
			that.inst.on('error', () => {
				resolve(false);
			});
		});
	}
	send(cmd: any) {
		this.pis.push(cmd);
	}
	close() {
		return new Promise((resolve) => {
			console.log('toDB disconnected!!!');
			this.inst.end();
			this.inst.destroy();
			resolve(0);
		});
	}
	private handle(data: any) {
		console.log('toDB_rev:', data);
		if(data.type=='toDB'){
			switch(data.route){
				case 'projects':
					if(data.job == 'add' && data.info.state)fs.mkdirSync(this.prjdir + data.info.name);
					break;
				default:
					break;
			}
			this.ser.send(data);
		}else if(data.type=='startTest'){
			let filename = this.prjdir + data.prjname + '/buttons.json';
			fs.writeFileSync(filename, data.info);
			this.tolink.send({type:data.type,prjname:data.prjname});
		}
	}
	private readConfig() {
		// let cj = new util.TextDecoder().decode(fs.readFileSync(os.homedir()+"/data_store/config.json"));
		// 暂不处理远程服务器
		return { ip: '127.0.0.1', port: 6002 };
	}
}
