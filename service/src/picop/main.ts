import * as net from "net";
import * as fs from "fs";
import * as util from "util";
import * as os from "os";
import * as childprs from "child_process";
import * as pack from "@passoa/pack";
import Remote from "./remote";
import { Uart } from "./com";

let prjpath = process.argv[2];
let pis:any;
let pos:any;
let intc:any;
main();

async function main(){
    if(await createdLink()){
        let path = os.homedir() + "/data_store/config.json";
        let cfg=JSON.parse(new util.TextDecoder().decode(fs.readFileSync(path)));
        let isExitst = fs.existsSync(prjpath+"/screen");
        if(!isExitst)fs.mkdirSync(prjpath+"/screen");
        let screenPath = prjpath+"/screen/screen.png";
        let ret=await Remote.connectDev(cfg.da_server);
        if(ret){
            await Remote.sendCmd({type:"cutScreen",filepath:screenPath});
            await sendInfoByLink({type:"toSer",job:"syncRemote",status:ret,path:screenPath});
        }else{
            if(cfg.da_server.type==0){
                // 串口启动车机Passoa
                let arm_uart = new Uart();
                let arm_info:any = {port:"",info:{}};
                for(let prop in cfg.uarts.da_arm){
                    if(prop == "port")arm_info.port="COM"+cfg.uarts.da_arm[prop];
                    else arm_info.info[prop]=cfg.uarts.da_arm[prop];
                }
                let u_ret = await arm_uart.openUart({"port":arm_info.port,"info":arm_info.info});
                if(u_ret){
                    await arm_uart.sendData(cfg.da_server.path+"/passoa "+cfg.da_server.path+"/app.js& \n",null,1);
                    await wait(10000);
                    let r_ret=await Remote.connectDev(cfg.da_server);
                    if(r_ret){
                        await Remote.sendCmd({type:"cutScreen",filepath:screenPath});
                    }
                    await sendInfoByLink({type:"toSer",job:"syncRemote",status:r_ret,path:screenPath});
                    arm_uart.closeUart();
                }else{
                    await sendInfoByLink({type:"toSer",job:"syncRemote",status:u_ret,path:screenPath});
                }
            }else{
                // ADB启动车机Passoa
                let cmd = "adb/adb shell /data/app/pack/passoa /data/app/pack/app.js& \n";
                childprs.exec(cmd,{windowsHide:true});
                await wait(4000);
                let r_ret=await Remote.connectDev(cfg.da_server);
                if(r_ret){
                    await Remote.sendCmd({type:"cutScreen",filepath:screenPath});
                }
                await sendInfoByLink({type:"toSer",job:"syncRemote",status:r_ret,path:screenPath});
            }
        }
        endTest();
    }
}

async function wait(w_time:any){
    return new Promise(resolve => {
		setTimeout(function(){
			resolve(0);
		},w_time);
    });
}

async function sendInfoByLink(cmd:any){
    return new Promise(resolve => {
        let flag=1;
		let tm:any;
        pos.on("data",(data:any) => {
            if(flag){
                if(data.type==cmd.type){
                    flag=0;
					if(tm){
                        clearTimeout(tm);
                        tm=null;
                    }
                    resolve({ret:1,data:data.data!=undefined?data.data:data.stat});
                }
            }
        });
        pis.write(cmd);
		tm=setTimeout(()=>{
			resolve({ret:0});
		},1500);
    });
}

function endTest(){
    Remote.disconnectDev();
    intc.end();
}

async function createdLink(){
    return new Promise(resolve => {
        pos=new pack.unpackStream();
        pis=new pack.packStream();
        intc=net.connect(6000,"127.0.0.1",() => {
            console.info("pic_client connect!!!");
        });
        pos.on("data",(data:any) => {
            switch(data.type){
                case "init":
                    pis.write({type:"info",class:"test",name:"remote"});
                    break;
                case "auth":
                    resolve(1);
                    break;
            }
        });
        pis.on("data",(data:any) => {
            intc.write(data);
        });
        intc.on("data",(data:any) => {
            pos.write(data);
        });
        intc.on("close",function(){
            console.info("close pic_client socket!!!");
        });
        intc.on("error",function(){
            console.error("error");
            resolve(0);
        });
    });
}