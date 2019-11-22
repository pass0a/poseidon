export class DB_mgr {
	private intc: any;
	private mgr: any;
	private link: any;
	constructor() {}

	private async handleCmd(obj: any) {
		switch (obj.type) {
			case 'toDB':
				let test_link = this.mgr.getLink('test', 'test');
				if (test_link) test_link.sendCmd(obj);
				break;
			default:
				break;
		}
	}

	sendCmd(data: any) {
		this.link.write(data);
	}

	create(link: any, obj: any, mgr: any) {
		this.link = link;
		this.mgr = mgr;
		this.link.onData(this.handleCmd.bind(this));
		this.link.write({ type: 'auth', state: 'ok' });
	}
}
