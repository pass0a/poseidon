import * as net from 'net';
import * as pack from "pack";

export class ToLink{
    private pis=new pack.inputStream();
    private pos=new pack.outputStream();
    private inst:any;
    constructor(){
        this.pis.on("data",(data:any)=>{
            this.inst.write(data);
        });
        this.pos.on("data",(data:any)=>{
            this.handle(data);
        });
    }
    run(){
        let that:any=this;
        that.inst=net.connect(6000,"127.0.0.1",function(){
            console.info("web_server connect!!!");
            that.inst.on("data",function(data:any){
                that.pos.push(data);
            });
            that.inst.on("close",function(){
                console.info("close web_server!!!");
            });
        });
    }
    private handle(data:any){
        console.log(data);
    }
}