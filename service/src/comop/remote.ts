import * as net from "net";
import * as fs from "fs";
import * as util from "util";
import * as os from "os";
import * as path from 'path';
import * as childprs from "child_process";
import * as pack from "@passoa/pack";
import { Uart } from "./com";
// 结果 0:失败 1:成功
// 异常代码 code : 0-超时 1-网络异常无法连接设备 2-ADB异常 3-串口异常

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
        switch(data.type){
            case "alive":
                this.backCall({ret:1});
                break;
            case "auth":
                break;
            case "cutScreen":
                if(data.stat&&data.buf){
                    if(data.buf.byteLength){
                        fs.writeFileSync(this.prjpath,data.buf);
                        this.backCall({ret:1});
                    }
                }
                break;
        }
        this.clearTimer();
    }
    checkAlive(alive_uart?:Uart){
        return new Promise((resolve) => {
            this.backCall = resolve;
            if(this.intc){
                this.pis.write({type:"alive"});
                this.timeout(5000);
            }else{
                this.connectDev(alive_uart);
            }
        });
    }
    sendCmd(data:any){
        return new Promise((resolve) => {
            this.backCall = resolve;
            switch(data.type){
                case "click":
                    this.pis.write({type:data.type,x:data.x,y:data.y,time:data.time});
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
    private async connectDev(alive_uart?:Uart){
        let path = os.homedir() + "/data_store/config.json";
        let cfg=JSON.parse(new util.TextDecoder().decode(fs.readFileSync(path)));
        let cnum = 2;
        while(cnum){
            if(await this.createConnect(cfg.da_server))break;
            if(cnum==2){
                if(cfg.da_server.type==0){
                    // 串口启动车机Passoa
                    console.log("rt:",alive_uart);
                    console.log("rt:",typeof alive_uart);
                    let uart_ret = await this.startByUart(cfg,alive_uart);
                    if(!uart_ret){
                        this.backCall({ret:0,code:3});
                        return;
                    }
                    await this.wait(10000);
                }else{
                    // ADB启动车机Passoa
                    let adb_ret = await this.startByADB(cfg);
                    if(!adb_ret){
                        this.backCall({ret:0,code:2});
                        return;
                    }
                }
            }
            cnum--;
        }
        let rt = cnum?{ret:1}:{ret:0,code:1};
        this.backCall(rt);
    }
    private createConnect(cfg:any){
        return new Promise((resolve) => {
            this.backCall = resolve;
            this.intc = net.connect(parseInt(cfg.port),cfg.ip,() => {
                this.clearTimer();
                console.info("device connect!!!");
                this.pis.write({type:"auth"});
                resolve(1);
            });
            this.intc.on("data",(data:any) => {
                console.log("remoteData:",data);
                this.pos.write(data);
            });
            this.intc.on("close",() => {
                console.info("close device socket!!!");
                if(this.intc){
                    this.intc.removeAllListeners('data');
                    this.intc = null
                }
                resolve(0);
            });
            this.intc.on("error",(error:any) => {
                console.info("device error!!!");
                if(this.intc){
                    this.intc.removeAllListeners('data');
                    this.intc = null
                }
                resolve(0);
            });
            this.timeout(5000,() => {
                this.intc.end();
            });
        });
    }
    private async startByUart(cfg:any,alive_uart?:Uart){
        if(alive_uart){
            await alive_uart.sendData(cfg.da_server.path+"/passoa "+cfg.da_server.path+"/app.js& \n",null,1);
            return new Promise((resolve) => {
                resolve(1);
            });
        }else{
            let arm_uart = new Uart();
            let arm_info:any = {port:"",info:{}};
            for(let prop in cfg.uarts.da_arm){
                if(prop == "port")arm_info.port="COM"+cfg.uarts.da_arm[prop];
                else arm_info.info[prop]=cfg.uarts.da_arm[prop];
            }
            let u_ret = await arm_uart.openUart({"port":arm_info.port,"info":arm_info.info});
            if(u_ret){
                await arm_uart.sendData(cfg.da_server.path+"/passoa "+cfg.da_server.path+"/app.js& \n",null,1);
            }
            arm_uart.closeUart();
            return new Promise((resolve) => {
                resolve(u_ret);
            });
        }
    }
    private startByADB(cfg:any){
        return new Promise((resolve) => {
            let once:boolean = true;
            console.log('"'+path.dirname(process.execPath)+'/adb/adb" shell');
            let output:any = childprs.exec('"'+path.dirname(process.execPath)+'/adb/adb" shell', { windowsHide:false }, (error, stdout,stderr) => {
                // console.log('callback', stdout);
            });
            output.stdout.on('data',(data:any) => {
                // console.log('out', data);
                if(once){
                    resolve(1);
                    once=false;
                }
            });
            output.on('close', (data:any) => {
                console.error("ADB OUT");
                resolve(0);
            });
            output.stdin.write(cfg.da_server.path+"/passoa "+cfg.da_server.path+"/app.js&\r\n");
            output.stdin.write("exit\r\n");
        });
    }
    private async wait(w_time:any){
        return new Promise(resolve => {
            setTimeout( () => {
                resolve(0);
            },w_time);
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