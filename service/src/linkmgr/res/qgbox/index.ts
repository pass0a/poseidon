import * as util from 'util';
import * as http from 'http';
class QG_BOX {
	private boxApiList: any = { freq: [ 'get_init_pow' ] };
	chooseBoxApi(name: any, idx: any, cfg: any) {
		return 'http://' + cfg.ip + ':' + cfg.port + '/?' + this.boxApiList[name][idx];
	}
	sendBoxApi(name: any, idx: any, cfg: any) {
		return new Promise((resolve) => {
			let tm: any = null;
			http
				.get(this.chooseBoxApi(name, idx, cfg), (res) => {
					let body = '';
					res.on('data', (chunk) => {
						body += chunk;
					});
					res.on('end', () => {
						if (tm) {
							clearTimeout(tm);
							tm = null;
						}
						let ret = body.indexOf('Fail') > -1 ? { ret: 1 } : { ret: 0, data: body };
						resolve(ret);
					});
				})
				.on('error', (err) => {
					console.log('Error: ' + err.message);
				});
			tm = setTimeout(function() {
				resolve({ ret: 2 });
			}, 3000);
		});
	}
}
export default new QG_BOX();
