import * as net from 'net';
import * as pack from '@passoa/pack';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as childprs from 'child_process';
import * as util from 'util';
import * as os from 'os';
import { Server } from './server';
import { ToLink } from './toLink';
import ConvertDBC from '../linkmgr/res/candbc/convert';

export class ToDB {
	public copyinfo = { end: 0, pname: '', cname: '' };
	private prjdir: any = path.dirname(path.dirname(process.execPath)) + '/data_store/projects/';
	private pis = new pack.packStream();
	private pos = new pack.unpackStream();
	public inst: any;
	private ser: any;
	private tolink: any;
	private ctflag: boolean = false;
	constructor() {
		this.pis.on('data', (data: any) => {
			this.inst.write(data);
		});
		this.pos.on('data', (data: any) => {
			this.handle(data);
		});
	}
	connect(ser: Server, toLink: ToLink) {
		return new Promise((resolve) => {
			this.ser = ser;
			this.tolink = toLink;
			let config_info = this.readConfig();
			this.closeOnEvent();
			this.inst = net.connect(config_info.port, config_info.ip, () => {
				console.info('connect DB_Server success!');
				this.ctflag = true;
				resolve(true);
			});
			this.inst.on('data', (data: any) => {
				this.pos.write(data);
			});
			this.inst.on('close', () => {
				console.info('close DB_Server_connect!');
			});
			this.inst.on('error', () => {
				if (this.ctflag) {
					this.ctflag = false;
					this.ser.connect_status.db = 2;
					if (this.ser.inst) this.ser.send({ type: 'toSer', job: 'dbStatus', info: 2 });
				}
				console.error('DB_Server_connect error!');
				resolve(false);
			});
		});
	}
	send(cmd: any) {
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
	private closeOnEvent() {
		if (this.inst) {
			this.inst.removeAllListeners('data');
			this.inst.removeAllListeners('close');
			this.inst.removeAllListeners('error');
		}
	}
	private async handle(data: any) {
		// console.log('toDB_rev:', data);
		if (data.type == 'toDB') {
			switch (data.route) {
				case 'connect':
					this.ser.connect_status.db = data.info;
					data = { type: 'toSer', job: 'dbStatus', info: data.info };
					break;
				case 'projects':
					if (data.job == 'add' && data.info.state) fs.ensureDirSync(this.prjdir + data.info.msg.name);
					break;
				case 'removeAll': // 删除文件夹
					let remove_dir = '"' + this.prjdir + data.info.prjname + '"';
					if (fs.existsSync(this.prjdir + data.info.prjname)) {
						childprs.exec('rmdir /s/q ' + remove_dir, { windowsHide: true });
					}
					break;
				case 'copyPrj': // 复制文件夹
					this.copyinfo.end--;
					if (this.copyinfo.end == 0) {
						let p_dir = '"' + this.prjdir + this.copyinfo.pname + '/img"';
						let c_dir = '"' + this.prjdir + this.copyinfo.cname + '/img"';
						if (fs.existsSync(this.prjdir + this.copyinfo.pname + '/img')) {
							let copy_cmd = 'xcopy /y/i ' + p_dir + ' ' + c_dir + ' /e';
							childprs.exec(copy_cmd, { windowsHide: true });
						}
					}
					break;
				case 'dbc':
					if (data.job == 'add' || data.job == 'modify') {
						await ConvertDBC.convertFile(data.info.msg.path, this.prjdir + data.info.prjname + '/dbc.json');
					}
					break;
				default:
					break;
			}
			if (this.ser.inst) this.ser.send(data);
		}
	}
	private readConfig() {
		// let cj = new util.TextDecoder().decode(fs.readFileSync(os.homedir()+"/data_store/config.json"));
		// 暂不处理远程服务器
		return { ip: '127.0.0.1', port: 6002 };
	}
}
