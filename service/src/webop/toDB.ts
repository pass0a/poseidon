import * as net from 'net';
import * as pack from '@passoa/pack';
import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';
import * as os from 'os';
import { Server } from './server';
import { ToLink } from './toLink';

export class ToDB {
	private prjdir: any = path.dirname(path.dirname(process.execPath)) + '/data_store/projects/';
	private pis = new pack.packStream();
	private pos = new pack.unpackStream();
	public inst: any;
	private ser: any;
	private tolink: any;
	private req_start_flag : any = 0;
	private ctflag:boolean = false;
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
			this.inst = net.connect(config_info.port, config_info.ip,() => {
				this.inst.on('data', (data: any) => {
					this.pos.write(data);
				});
				console.info('connect DB_Server success!');
				this.ctflag = true;
				resolve(true);
			});
			this.inst.on('close', () => {
				console.info('close DB_Server_connect!');
			});
			this.inst.on('error', () => {
				this.inst = null;
				if(this.ctflag){
					this.ctflag = false;
					this.ser.connect_status.db = 2;
					if(this.ser.inst)this.ser.send({type:'toSer',job:"dbStatus",info:2});
				}
				console.error('DB_Server_connect error!');
				resolve(false);
			});
		});
	}
	send(cmd: any) {
		if(cmd.type=="toSer"&&cmd.job=="startTest")this.req_start_flag = 0;
		this.pis.write(cmd);
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
		// console.log('toDB_rev:', data);
		if(data.type=='toDB'){
			switch(data.route){
				case 'connect':
					this.ser.connect_status.db = data.info;
					data = {type:'toSer',job:"dbStatus",info:data.info};
					break;
				case 'projects':
					if(data.job == 'add' && data.info.state)fs.mkdirSync(this.prjdir + data.info.name);
					break;
				default:
					break;
			}
			if(this.ser.inst)this.ser.send(data);
		}else if(data.type=='toSer'){
			let filename = this.prjdir + data.info.prjname + '/'+ data.route +'.json';
			fs.writeFileSync(filename, data.info.data);
			this.req_start_flag++;
			if(this.req_start_flag==3)this.tolink.send({type:data.type,job:data.job,info:{prjname:data.info.prjname}});
		}
	}
	private readConfig() {
		// let cj = new util.TextDecoder().decode(fs.readFileSync(os.homedir()+"/data_store/config.json"));
		// 暂不处理远程服务器
		return { ip: '127.0.0.1', port: 6002 };
	}
}
