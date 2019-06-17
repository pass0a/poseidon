import { Server } from './server';
import { ToLink } from './toLink';
import { ToDB } from './toDB';
import { config } from './config';

export class App {
	private server = new Server();
	private tolink = new ToLink();
	private todb = new ToDB();

	async start() {
		// await this.tolink.connect();
		// this.tolink.send({type:123});
		// console.log("1111");
		config.start = 'jjjjj';
		await this.todb.connect(this.server);
		this.server.run(6001, this.todb, () => {});
	}

	static create() {
		new App().start();
	}
}
App.create();
