import { Server } from "./server";
import { ToLink } from "./toLink";

export class App {
    private server = new Server();
    private tolink = new ToLink();
    start(){
      this.server.run(6001,()=>{
        console.log(123);;
      });
      // this.tolink.run();
    }
    static create() {
		new App().start();
	}
}
App.create();