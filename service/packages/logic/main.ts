import { Server } from './server';
import { ToLink } from './toLink';
import { ToDB } from './toDB';

export class App {
	private server = new Server();
	private tolink = new ToLink();
	private todb = new ToDB();

	async start() {
		await this.tolink.connect(this.server);
		await this.todb.connect(this.server);
		this.server.run(6001, this.tolink, this.todb, () => {});
	}

	static create() {
		new App().start();
	}
}
App.create();
