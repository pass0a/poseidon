import * as net from "net";
import * as pack from "@passoa/pack";
import { Test_mgr } from "./mgr_test";
import { Web_mgr } from "./mgr_web";
import { Device_mgr } from "./mgr_device";
import { Com_mgr } from "./mgr_com";
import { DB_mgr } from "./mgr_db";

class Linkmgr {
	private lk:any = [];
	private app = net.createServer((c:any) =>{
		console.log("CONNECT---->");
		let pos:any = new pack.unpackStream();
		let pis:any = new pack.packStream();
		pos.on('data', (data:any) => {
			this.handleCmd(data,pis,pos,c);
		});
		pis.on('data', (data:any) => {
			console.log(data);
			c.write(data);
		});
		c.on('data', (data:any) => {
			console.log(data);
			pos.write(data);
		});
		pis.write({ type: 'init' });
		// console.log(pis);
	});

	handleCmd(obj:any,pis:any,pos:any,c:any){
		console.info(obj);
		if(obj.type != 'info') {
			pis.write({ type: 'auth', state: 'fail', msg: 'it is not info cmd!!!' });
			c.end();
		}else{
			if(!this.lk[obj.class])this.lk[obj.class] = [];
			if(this.lk[obj.class][obj.name]){
				pis.write({ type: 'auth', state: 'fail', msg: 'your name is already login!!!' });
				c.end();
			}else{
				let link_obj:any;
				switch(obj.class){
					case 'test':
						link_obj = new Test_mgr();
						break;
					case 'web':
						link_obj = new Web_mgr();
						break;
					case 'device':
						link_obj = new Device_mgr();
						break;
					case 'com':
						link_obj = new Com_mgr();
						break;
					case 'db':
						link_obj = new DB_mgr();
						break;
					default:
						pis.write({ type: 'auth', state: 'fail', msg: 'Unknow object!!!' });
						return;
				}
				this.lk[obj.class][obj.name] = link_obj;
				this.closeOnData(pis,pos,c);
				this.lk[obj.class][obj.name].create(c, obj, this);
				console.info('[link create]' + obj.class + '-' + obj.name + ':' + 'success!!!');
			}
		}
	}

	closeOnData(pis:any,pos:any,c:any){
		pos.removeAllListeners('data');
		pis.removeAllListeners('data');
		c.removeAllListeners('data');
	}

	getLink(){
		if (this.lk[arguments[0]]) {
			return this.lk[arguments[0]][arguments[1]];
		}
		return undefined;
	}

	closeLink(link_class:string,link_name:string){
		this.lk[link_class][link_name] = null;
	}

	start(){
		this.app.listen(6000);
	}
}
new Linkmgr().start();


