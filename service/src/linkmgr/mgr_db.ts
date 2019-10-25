import * as pack from "@passoa/pack";

export class DB_mgr{
	private pos:any = new pack.unpackStream();
	private pis:any = new pack.packStream();
	private intc:any;
	private link:any;
	constructor() {
		this.pis.on('data', (data: any) => {
			this.intc.write(data);
		});
		this.pos.on('data', (data: any) => {
			this.handleCmd(data);
		});
	}

	private async handleCmd(obj: any) {
		switch (obj.type) {
			case "toDB":
				let test_link = this.link.getLink('test', 'test');
				if(test_link)test_link.sendCmd(obj);
				break;
			default:
				break;
		}
	};

	sendCmd(data:any) {
		this.pis.write(data);
	};

	create(c:any,obj:any,link:any){
		this.intc = c;
		this.link = link;
		this.intc.on('data', (data:any) => {
			this.pos.write(data);
		});
		this.intc.on('close', () => {
			console.info('[link close]' + obj.class + '-' + obj.name + ':' + 'exit!!!');
			this.link.closeLink(obj.class,obj.name);
		});
		this.pis.write({ type: 'auth', state: 'ok' });
	}
}
