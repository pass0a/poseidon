import * as net from "net";
import * as pack from "pack";
import * as path from "path";
import * as fs from "fs";
import * as util from 'util';
import { Server } from "./server";

export class ToDB{
    private prjdir:any=path.dirname(path.dirname(process.execPath))+"data_warehouse/projects/";
    private pis=new pack.inputStream();
    private pos=new pack.outputStream();
    private inst:any;
    private ser:any;
    constructor(){
        this.pis.on("data",(data:any)=>{
            this.inst.write(data);
        });
        this.pos.on("data",(data:any)=>{
            this.handle(data);
        });
    }
    connect(ser: Server){
        return new Promise(resolve=>{
            this.ser = ser;
            let config = this.readConfig();
            let that:any=this;
            that.inst=net.connect(config.port,config.ip,function(){
                that.inst.on("data",function(data:any){
                    that.pos.push(data);
                });
                that.inst.on("close",function(){
                    console.info("close DB_Server_connect!!!");
                });
                console.info("connect DB_Server success!!!");
                resolve(true);
            });
            that.inst.on("error",()=>{resolve(false);});
        });
    }
    send(cmd:any){
        this.pis.push(cmd);
    }
    close(){
        return new Promise(resolve=>{
            console.log("toDB disconnected!!!");
            this.inst.end();
            this.inst.destroy();
            resolve(0);
        });
    }
    private handle(data:any){
        console.log("toDB_rev:",data);
        this.specialHandle(data);
        this.ser.send(data);
    }
    private readConfig(){
        let configPath = path.dirname(process.execPath)+"/config.json";
        let cj = new util.TextDecoder().decode(fs.readFileSync(configPath));
        let config = JSON.parse(cj); // 暂不处理远程服务器
        return {ip:"127.0.0.1",port:6002};
    }
    private specialHandle(data:any){
        if(data.route=="projects"&&data.job=="add"&&data.info.state){
            fs.mkdirSync(this.prjdir+data.info.name);
            console.log(this.prjdir+data.info.name);
        }
    }
}