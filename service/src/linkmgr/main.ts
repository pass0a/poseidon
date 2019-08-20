import * as net from "net";
import * as pack from "@passoa/pack";
import { Test_mgr } from "./mgr_test";
import { Web_mgr } from "./mgr_web";

class Linkmgr {
	private ints:any;
	private pos:any = new pack.unpackStream();
	private pis:any = new pack.packStream();
	private lk:any = [];
	private app = net.createServer((c:any) =>{
		this.ints = c;
		this.pos.on('data', (data:any) => {
			this.handleCmd(data);
		});
		this.pis.on('data', (data:any) => {
			this.ints.write(data);
		});
		this.ints.on('data', (data:any) => {
			this.pos.write(data);
		});
		this.pis.write({ type: 'init' });
	});

	handleCmd(obj:any){
		if(obj.type != 'info') {
			this.pis.write({ type: 'auth', state: 'fail', msg: 'it is not info cmd!!!' });
			this.ints.end();
		}else{
			if(!this.lk[obj.class])this.lk[obj.class] = [];
			if(this.lk[obj.class][obj.name]){
				this.pis.write({ type: 'auth', state: 'fail', msg: 'your name is already login!!!' });
				this.ints.end();
			}else{
				let link_obj:any;
				switch(obj.class){
					case 'test':
						link_obj = new Test_mgr();
						break;
					case 'web':
						link_obj = new Web_mgr();
						break;
					default:
						this.pis.write({ type: 'auth', state: 'fail', msg: 'Unknow object!!!' });
						return;
				}
				this.lk[obj.class][obj.name] = link_obj;
				this.closeOnData();
				this.lk[obj.class][obj.name].create(this.ints, obj, this);
				console.info('[link create]' + obj.class + '-' + obj.name + ':' + 'success!!!');
			}
		}
	}

	closeOnData(){
		this.pos.removeAllListeners('data');
		this.pis.removeAllListeners('data');
		this.ints.removeAllListeners('data');
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


