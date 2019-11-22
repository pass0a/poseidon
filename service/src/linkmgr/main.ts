import { Socket, createServer } from 'net';
import { unpackStream, packStream } from '@passoa/pack';
import { Test_mgr } from './mgr_test';
import { Web_mgr } from './mgr_web';
import { Device_mgr } from './mgr_device';
import { Com_mgr } from './mgr_com';
import { DB_mgr } from './mgr_db';
interface MsgHead {
	[header: string]: any;
}
class Link {
	private pos = new unpackStream();
	private pis = new packStream();
	private c: any;
	private mgr: Linkmgr;
	constructor(c: Socket, mgr: Linkmgr) {
		// c.write('test');
		// this.pis.pipe(this.pos);
		// this.pis.write('hhhh');
		// this.pos.on('data', (data) => {
		// 	console.log(data);
		// });
		// this.pos = new unpackStream();
		// this.pis = new packStream();
		this.mgr = mgr;
		this.c = c;
		this.pos.once('data', (obj: MsgHead) => {
			mgr.handleCmd(obj, this);
		});
		c.pipe(this.pos);
		this.pis.pipe(c);
		this.pis.write({ type: 'init' });
	}
	onData(cb: (obj: any) => void) {
		return this.pos.on('data', cb);
	}
	write(obj: any) {
		return this.pis.write(obj);
	}
	end(obj?: any) {
		return this.pis.end(obj);
	}
	closeOnEnd(a: string, b: string) {
		this.c.on('close', () => {
			this.mgr.closeLink(a, b);
		});
	}
}
class Linkmgr {
	private lk: any = [];
	private app = createServer((c: any) => {
		console.log('CONNECT---->');
		new Link(c, this);
	});
	handleCmd(obj: MsgHead, link: Link) {
		console.info(obj, link);
		if (obj.type != 'info') {
			link.write({ type: 'auth', state: 'fail', msg: 'it is not info cmd!!!' });
			link.end();
		} else {
			if (!this.lk[obj.class]) this.lk[obj.class] = [];
			if (this.lk[obj.class][obj.name]) {
				link.write({ type: 'auth', state: 'fail', msg: 'your name is already login!!!' });
				link.end();
			} else {
				let link_obj: any;
				switch (obj.class) {
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
						link.write({ type: 'auth', state: 'fail', msg: 'Unknow object!!!' });
						return;
				}
				this.lk[obj.class][obj.name] = link_obj;
				this.lk[obj.class][obj.name].create(link, obj, this);
				link.closeOnEnd(obj.class, obj.name);
				console.info('[link create]' + obj.class + '-' + obj.name + ':' + 'success!!!');
			}
		}
	}
	getLink() {
		if (this.lk[arguments[0]]) {
			return this.lk[arguments[0]][arguments[1]];
		}
		return undefined;
	}

	closeLink(link_class: string, link_name: string) {
		this.lk[link_class][link_name] = null;
	}

	start() {
		this.app.listen(6000);
	}
}
new Linkmgr().start();
