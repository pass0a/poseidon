import bt from '@passoa/libbt';

class BT {
	private init_status: boolean = false;
	private conncet_status: boolean = false;
	init(ping: string) {
		return new Promise((resolve) => {
			if (!this.init_status) {
				this.init_status = true;
				bt.setPin(ping);
				bt.on('init', () => {
					resolve(0);
				});
				bt.run();
			} else resolve(0);
		});
	}
	connect(mac: string) {
		return new Promise((resolve) => {
			if (!this.conncet_status) {
				console.log('into connect !!!!');
				console.log(this.conncet_status);
				let timeout: any;
				bt.once('connected', (code: any) => {
					console.log('connect !!!!!!');
					this.conncet_status = true;
					console.info(code);
					if (timeout) {
						clearTimeout(timeout);
						timeout = null;
					}
					resolve(0);
				});
				bt.hfpConnect(mac);
				timeout = setTimeout(() => {
					resolve(1);
				}, 30000);
			} else resolve(0);
		});
	}
	incomingCall(num: string) {
		bt.incomingCall(num);
	}
	answerCall() {
		bt.answerCall();
	}
	terminateCall() {
		bt.terminateCall();
	}
	disconnect() {
		if (this.conncet_status) {
			this.conncet_status = false;
			bt.disconnect();
		}
	}
}
export default new BT();
