import * as ws from 'websocket';
import * as http from 'http';
import * as pack from "pack";
import * as fs from 'fs';
import * as util from 'util';
import * as path from "path";

export class Server{
    private pis=new pack.inputStream();
    private pos=new pack.outputStream();
    private inst:any;
    private wss:any;
    private hp:http.Server;
    private configPath:any=path.dirname(process.execPath)+"/config.json";
    constructor(){
        this.pis.on("data",(data:any)=>{
            this.inst.write(data);
        });
        this.pos.on("data",(data:any)=>{
            this.handle(data);
        });
    }
    run(port:number,fn:()=>void){
        return new Promise(resolve=>{
            this.wss=ws.createServer((c:any)=>{
                this.inst=c;
                c.on("data",(frm:any)=>{
                    this.pos.push(frm.PayloadData);
                });
                fn();
            });
            this.hp=http.createServer((req:any,res:any)=>{
                let body="";
                req.on("data",function(buf:string){
                    if(body==undefined){
                        body=buf;
                    }else{
                        body+=buf;
                    }
                });
                req.on("end",()=>{
                    this.wss.filter(req,res);
                });
            });
            this.hp.listen(port);
        });
    }
    send(obj:any):void{
        this.pis.push(obj);
    }
    private handle(data:any){
        switch(data.type){
            case "readConfig":
                let x=new util.TextDecoder().decode(fs.readFileSync(this.configPath));
                let config=JSON.parse(x);
                this.pis.push({type:data.type,info:config});
                break;
            default:
                break;
        }
    }
}