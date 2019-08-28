import * as ws from '@passoa/websocket';
import * as http from 'http';
import * as pack from '@passoa/pack';
import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';
import * as os from 'os';
import { ToLink } from './toLink';
import { ToDB } from './toDB';
declare function __passoa_auth_getstatus(): any;
declare function __passoa_auth_getfn(): any;
declare function __passoa_auth_gethwid(): any;
declare function __passoa_auth_setsn(authnum:any): any;

export class Server {
	private pis = new pack.packStream();
	private pos = new pack.unpackStream();
	private hp: http.Server;
	public inst: any;
	private wss: ws.websocket;
	private tolink = new ToLink();
	private todb = new ToDB();
	public connect_status = {db:0,link:0};
	private configPath: any = os.homedir()+"/data_store/config.json";
	private dirPath: any = path.dirname(path.dirname(process.execPath)) + '/data_store/projects/';
	constructor() {
		this.pis.on('data', (data: any) => {
			this.inst.write(data);
		});
		this.pos.on('data', (data: any) => {
			this.handle(data);
		});
	}
	run(port: number) {
		this.wss = ws.createServer((c: any) => {
			this.inst = c;
			this.inst.on('data', (frm: any) => {
				this.pos.write(frm.PayloadData);
			});
			this.inst.on('close', () => {
			});
		});
		this.hp = http.createServer((req: any, res: any) => {
			let body = '';
			req.on('data', (buf: string) => {
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
		this.connectLink();
		this.connectDB();
	}
	async connectLink(){
		let link_status = {type:'toSer',job:"linkStatus",info:0};
		let num = 10;
		while(num){
			if(await this.tolink.connect(this)){
				this.connect_status.link = 1;
				link_status.info = 1;
				break;
			}
			else num--;
			if(num==0){
				this.connect_status.link = 2;
				link_status.info = 2;
				break;
			}
			await this.wait(1000);
		}
		if(this.inst)this.send(link_status);
	}
	async connectDB(){
		let db_status = {type:'toSer',job:"dbStatus",info:0};
		let num = 10;
		while(num){
			if(this.todb.inst){
				this.todb.send({type:"toDB",route:"reconnect"});
				break;
			}else if(await this.todb.connect(this,this.tolink)){
				this.todb.send({type:"toDB",route:"connect"});
				break;
			}
			else num--;
			if(num==0){
				db_status.info = 2;
				this.connect_status.db = 2;
				if(this.inst)this.send(db_status);
				break;
			}
			await this.wait(1000);
		}
	}
	send(obj: any) {
		this.pis.write(obj);
	}
	private wait(time:any){
        return new Promise((resolve) => {
            setTimeout(function(){
                resolve(0);
            },time);
        });
    }
	private handle(data: any) {
		// console.log('server_rev:', data);
		switch (data.type) {
			// toThisServer
			case 'toSer':
				this.execJob(data);
				break;
			// toDBserver
			case 'toDB':
				this.todb.send(data);
				break;
			default:
				break;
		}
	}
	private execJob(data:any){
		switch(data.job){
			case 'getAuth':
				let auth :any = {};
				auth.status=__passoa_auth_getstatus();
				if(!auth.status){
					auth.fn=__passoa_auth_getfn();
					auth.hwid=__passoa_auth_gethwid();
				}
				data.info = auth;
				this.send(data);
				break;
			case 'setAuth':
				data.info =	__passoa_auth_setsn(data.info);
				this.send(data);
				break;
			case 'connectStatus':
				data.info = {db:this.connect_status.db,link:this.connect_status.link};
				this.send(data);
				break;
			case 'reconnect':
				for(let re of data.info){
					switch(re){
						case 'db':	
							this.connectDB();
							break;
						case 'link':
							this.connectLink();
							break;
					}
				}
				break;
			case 'readConfig':
				let cj = new util.TextDecoder().decode(fs.readFileSync(this.configPath));
				data.info = JSON.parse(cj);
				this.send(data);
				break;
			case 'saveConfig':
				fs.writeFileSync(this.configPath, JSON.stringify(data.info));
				data.info = true;
				this.send(data);
				break;
			case 'readReport':
				let repPath = this.dirPath + data.prjname + '/report.json';
				if(!fs.existsSync(repPath)){
					data.info = {caseData:[],testInfo:null};
				}else{
					let rj = new util.TextDecoder().decode(fs.readFileSync(repPath));
					data.info = JSON.parse(rj);
				}
				this.send(data);
				break;
			case 'readStopinfo':
				let stopinfoPath = this.dirPath + data.prjname + '/stopinfo.json';
				data.info = false;
				if(fs.existsSync(stopinfoPath)){
					let rj = new util.TextDecoder().decode(fs.readFileSync(stopinfoPath));
					let stopinfo = JSON.parse(rj);
					if(stopinfo.idx>-1)data.info = true;
				}
				this.send(data);
				break;
			case 'startTest':
				this.todb.send(data);
				break;
			case 'stopTest':
				this.tolink.send(data);
				break;
			case 'continueTest':
				this.tolink.send(data);
				break;
			case 'replayTest':
				let stopPath = this.dirPath + data.info.prjname + '/stopinfo.json';
				fs.writeFileSync(stopPath, JSON.stringify({idx:-1,gid:-1}));
				this.todb.send(data);
				break;
			case 'syncRemote':
				this.tolink.send(data);
				break;
			case 'saveCutImage':
				this.tolink.send(data);
				break;
		}
	}
}
