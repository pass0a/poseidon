import * as ws from '@passoa/websocket';
import * as http from 'http';
import * as pack from '@passoa/pack';
import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';
import { ToLink } from './toLink';
import { ToDB } from './toDB';
import { config } from './config';

export class Server {
	private pis = new pack.inputStream();
	private pos = new pack.outputStream();
	private hp: http.Server;
	private inst: any;
	private wss: ws.websocket;
	private tolink: any;
	private todb: any;
	private configPath: any = config.path;
	private dirPath: any = path.dirname(path.dirname(process.execPath)) + 'data_store/projects/';
	constructor() {
		this.pis.on('data', (data: any) => {
			this.inst.write(data);
		});
		this.pos.on('data', (data: any) => {
			this.handle(data);
		});
	}
	run(port: number, tolink: ToLink, todb: ToDB, fn: () => void) {
		return new Promise((resolve) => {
			this.tolink = tolink;
			this.todb = todb;
			this.wss = ws.createServer((c: any) => {
				this.inst = c;
				c.on('data', (frm: any) => {
					this.pos.push(frm.PayloadData);
				});
				fn();
			});
			this.hp = http.createServer((req: any, res: any) => {
				let body = '';
				req.on('data', function(buf: string) {
					if (body == undefined) {
						body = buf;
					} else {
						body += buf;
					}
				});
				req.on('end', () => {
					this.wss.filter(req, res);
				});
			});
			this.hp.listen(port);
		});
	}
	send(obj: any) {
		this.pis.push(obj);
	}
	private handle(data: any) {
		console.log('server_rev:', data);
		switch (data.type) {
			case 'readConfig':
				let cj = new util.TextDecoder().decode(fs.readFileSync(this.configPath));
				let config_info = JSON.parse(cj);
				this.send({ type: data.type, info: config_info });
				break;
			case 'saveConfig':
				fs.writeFileSync(this.configPath, JSON.stringify(data.info));
				this.send({ type: data.type, state: true });
				break;
			case 'readReport':
				let prjPath = this.dirPath + data.prjname + '/report.json';
				let rj = new util.TextDecoder().decode(fs.readFileSync(prjPath));
				let report = JSON.parse(rj);
				this.send({ type: data.type, info: report });
				break;
			case 'downCases':
				let downPath = this.dirPath + data.prjname + '/caselist.json';
				fs.writeFileSync(downPath, JSON.stringify(data.info));
				this.send({ type: data.type, state: true });
				break;
			case 'startTest':
				this.tolink.send(data);
				break;
			// toDBserver
			case 'toDB':
				this.todb.send(data);
				break;
			default:
				break;
		}
	}
}
