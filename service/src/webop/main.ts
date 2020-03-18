import { Server } from './server';
import * as fs from 'fs';
import * as os from 'os';

export class App {
	private server = new Server();

	start() {
		this.findConfig();
		this.server.run(6001);
	}

	private findConfig() {
		let path = os.homedir() + '/data_store';
		if (!fs.existsSync(path)) fs.mkdirSync(path);
		if (!fs.existsSync(path + '/config.json'))
			fs.writeFileSync(path + '/config.json', JSON.stringify(require('./config')));
	}

	static create() {
		new App().start();
	}
}
App.create();
