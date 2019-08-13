import * as net from "net";
import * as fs from "fs";
import * as pack from "@passoa/pack";

class Remote{
    private pos:any = new pack.unpackStream();
    private pis:any = new pack.packStream();
    private intc:any;
    private platform:any;
    private alive:any = 0;
    private pacall:any;
    constructor() {
		this.pis.on('data', (data: any) => {
			this.intc.write(data);
		});
		this.pos.on('data', (data: any) => {
			switch(data.type){
                case "auth":
                    this.platform=data.platform;
                    this.alive=1;
                    this.pacall(1);
                    break;
            }
		});
	}
    connectDev(cfg:any){
        return new Promise((resolve) => {
            this.pacall = resolve;
            this.intc=net.connect(parseInt(cfg.port),cfg.ip,() => {
                console.info("remote connect!!!");
                this.pis.write({type:"auth"});
            });
            this.intc.on("data",(data:any) => {
                this.pos.write(data);
            });
            this.intc.on("close",() => {
				this.alive=0;
                console.info("close remote socket!!!");
            });
            this.intc.on("error",(error:any) => {
				this.alive=0;
                resolve(0);
            });
        });
    }
    disconnectDev(){
        if(this.intc){
            this.intc.end();
            this.intc=null;
        }
    }
    sendCmd(cmd:any,timeout?:any){
        if(timeout==undefined)timeout=3000;
		let tm:any;
        return new Promise((resolve) => {
            this.pos.on("data",(data:any) =>{
                if(cmd.type==data.type){
                    if(data.stat&&data.buf){
						if(data.buf.byteLength){
							fs.writeFileSync(cmd.filepath,data.buf);
						}
                    }
                    if(tm){
                        clearTimeout(tm);
                        tm=null;
                    }
                    resolve({ret:1,data:data.data!=undefined?data.data:data.stat});
                }
			});
            switch(cmd.type){
                case "click":
                    this.pis.write({type:cmd.type,x:cmd.x,y:cmd.y,time:cmd.time});
                    break;
                case "slide":
                    this.pis.write({type:cmd.type,x1:cmd.x1,y1:cmd.y1,x2:cmd.x2,y2:cmd.y2,time:cmd.time});
                    break;
                case "cutScreen":
                    this.pis.write({type:cmd.type});
                    break;
                case "alive":
                    this.pis.write({type:cmd.type});
                    break;
            }
            tm=setTimeout(()=>{
				resolve({ret:0});
			},timeout);
        });
    }
	getAlive(){
		return this.alive;
	}
}

export default new Remote();