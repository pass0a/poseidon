import * as net from "net";
import * as fs from "fs";
import * as pack from "@passoa/pack";

class Remote{
    private pos:any = new pack.unpackStream();
    private pis:any = new pack.packStream();
    private intc:any;
    private timer:any;
    private backCall:any;
    private prjpath:string;
    constructor() {
		this.pis.on('data', (data: any) => {
			this.intc.write(data);
		});
		this.pos.on('data', (data: any) => {
            this.handle(data);
		});
    }
    private handle(data:any){
        console.log(data);
        this.clearTimer();
        switch(data.type){
            case "auth":
                break;
            case "alive":
                this.backCall({ret:1});
                break;
            case "cutScreen":
                if(data.stat&&data.buf){
                    if(data.buf.byteLength){
                        fs.writeFileSync(this.prjpath,data.buf);
                        this.backCall({ret:1});
                    }
                }
                break;
            case "click":
                this.backCall({ret:1});
                break;
            case "slide":
                this.backCall({ret:1});
                break;
        }
    }
    checkAlive(cfg:any){
        return new Promise((resolve) => {
            this.backCall = resolve;
            if(this.intc){
                this.pis.write({type:"alive"});
                this.timeout(5000);
            }else{
                this.createConnect(cfg.da_server);
            }
        });
    }
    sendCmd(data:any){
        return new Promise((resolve) => {
            this.backCall = resolve;
            switch(data.type){
                case "click":
                    this.pis.write({type:data.type,x:data.x,y:data.y,click_type:data.click_type,time:data.time});
                    break;
                case "slide":
                    this.pis.write({type:data.type,x1:data.x1,y1:data.y1,x2:data.x2,y2:data.y2,time:data.time});
                    break;
                case "cutScreen":
                    this.prjpath = data.info;
                    this.pis.write({type:data.type});
                    break;
            }
            this.timeout(5000);
        });
    }
    private timeout(ts:number,fn?:any){
        this.timer = setTimeout(() => {
            if(fn)fn();
            else this.backCall({ret:0,code:0});
		},ts);
    }
    private clearTimer(){
        if(this.timer){
            clearTimeout(this.timer);
            this.timer = null;
        }
    }
    private createConnect(cfg:any){
        this.intc = net.connect(parseInt(cfg.port),cfg.ip,() => {
            this.clearTimer();
            console.info("device connect!!!");
            this.pis.write({type:"auth"});
            this.backCall({ret:1});
        });
        this.intc.on("data",(data:any) => {
            this.pos.write(data);
        });
        this.intc.on("close",() => {
            this.clearTimer();
            console.info("close device socket!!!");
            if(this.intc){
                this.intc.removeAllListeners('data');
                this.intc = null;
                this.backCall({ret:0,code:0});
            }
        });
        this.intc.on("error",(error:any) => {
            this.clearTimer();
            console.info("device error!!!");
            if(this.intc){
                this.intc.removeAllListeners('data');
                this.intc = null;
                this.backCall({ret:0,code:0});
            }
        });
        this.timeout(5000,()=>{
            if(this.intc)this.intc.end();
        });
    }
    disconnectDev(){
        if(this.intc){
            this.intc.end();
            this.intc=null;
        }
    }
}

export default new Remote();