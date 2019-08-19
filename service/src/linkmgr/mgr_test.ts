import * as pack from "@passoa/pack";

export class Test_mgr{
	private pos:any = new pack.unpackStream();
	private pis:any = new pack.packStream();
	private intc:any;
	private link:any;
	private currentStatus:boolean = true;
	constructor() {
		this.pis.on('data', (data: any) => {
			this.intc.write(data);
		});
		this.pos.on('data', (data: any) => {
			this.handleCmd(data);
		});
	}

	private handleCmd(obj: any) {
		switch (obj.type) {
			case 'tolink':
				let web_link = this.link.getLink('web', 'web');
				if(web_link)web_link.sendToWebServer(obj);
				break;
			case 'get_status':
				this.disposedCompleted(obj.type, this.currentStatus);
				break;
			case 'toSer':
				if (obj.job == 'syncRemote') {
					let web_link = this.link.getLink('web', 'web');
					if(web_link)web_link.sendToWebServer(obj);
				}
				break;
			default:
				break;
		}
	};

	private disposedCompleted(type:any, data:any) {
		this.pis.write({ type: type, data: data });
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

	stopTest() {
		this.currentStatus = false;
	}
}
