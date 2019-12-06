class BT {
	private init_status: boolean = false;
	private bt: any;
	init(ping: string) {
		if (!this.bt) this.bt = require('@passoa/libbt').default;
		return new Promise((resolve) => {
			if (!this.init_status) {
				this.init_status = true;
				this.bt.setPin(ping);
				this.bt.on('init', () => {
					resolve(0);
				});
				this.bt.run();
			} else resolve(0);
		});
	}
	connect(mac: string) {
		return new Promise((resolve) => {
			if (!this.bt.hfpConnected) {
				console.log('into connect !!!!');
				let timeout: any;
				this.bt.once('hfp_connect', (code: any) => {
					console.log(`connect hfp :${code}!!!!!!'`);
					if (timeout) {
						clearTimeout(timeout);
						timeout = null;
					}
					resolve(0);
				});
				this.bt.hfpConnect(mac);
				timeout = setTimeout(() => {
					resolve(1);
				}, 30000);
			} else resolve(0);
		});
	}
	incomingCall(num: string) {
		this.bt.incomingCall(num);
	}
	answerCall() {
		this.bt.answerCall();
	}
	terminateCall() {
		this.bt.terminateCall();
	}
	disconnect() {
		this.bt.disconnect();
	}
}
export default new BT();
