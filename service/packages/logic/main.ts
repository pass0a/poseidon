import { Server } from './server';
import { ToLink } from './toLink';
import { ToDB } from './toDB';
import * as fs from 'fs';
import * as os from 'os';

export class App {
	private server = new Server();
	private tolink = new ToLink();
	private todb = new ToDB();

	async start() {
		this.findConfig();
		await this.tolink.connect(this.server);
		await this.todb.connect(this.server,this.tolink);
		this.server.run(6001, this.tolink, this.todb, () => {});
	}

	private findConfig() {
		let path = os.homedir()+"/data_store";
		let flag=fs.existsSync(path);
		if(!flag){
			fs.mkdirSync(path);
			fs.copyFileSync(__dirname+"/config.json",path+"/config.json");
		}
	}

	static create() {
		new App().start();
	}
}
App.create();
