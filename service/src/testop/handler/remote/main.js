var net=require("net");
var pack=require("@passoa/pack");
var fs=require("fs");
var util=require("util");
var os=require("os");
var Uarts=require("../uarts/com");
import Remote from "./index";
var prjpath=process.argv[2];
var pos,pis,c;

//adb need
var childprs = require("child_process");

main();

async function main(){
    if(await createdLink()){
        var path = os.homedir() + "/data_store/config.json";
        var cfg=JSON.parse(new util.TextDecoder().decode(fs.readFileSync(path)));
        var isExitst = fs.existsSync(prjpath+"/screen");
        if(!isExitst){
            fs.mkdirSync(prjpath+"/screen");
        }
        var screenPath = prjpath+"/screen/screen.png";
        var ret=await Remote.connectDev(cfg.da_server);
        if(ret){
            await Remote.sendCmd({type:"cutScreen",filepath:screenPath});
            await sendInfoByLink({type:"toSer",job:"syncRemote",status:ret,path:screenPath});
        }else{
            if(cfg.da_server.type==0){
                // 串口启动车机Passoa
                var arm_uart=Uarts.create();
                var arm_info={port:"",info:{}};
                for(var prop in cfg.uarts.da_arm){
                    if(prop == "port")arm_info.port="COM"+cfg.uarts.da_arm[prop];
                    else arm_info.info[prop]=cfg.uarts.da_arm[prop];
                }
                var u_ret = await arm_uart.openUart({"port":arm_info.port,"info":arm_info.info});
                if(u_ret){
                    await arm_uart.sendData("export LD_LIBRARY_PATH="+cfg.da_server.path+":$LD_LIBRARY_PATH"+" \n",null,1);
                    await arm_uart.sendData(cfg.da_server.path+"/passoa "+cfg.da_server.path+"/robot/index.js& \n",null,1);
                    await wait(500);
                    var r_ret=await Remote.connectDev(cfg.da_server);
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
                var cmd = "adb/adb shell sh /data/app/pack/run.sh \n";
                childprs.exec(cmd,{windowsHide:true,detached:true});
                await wait(3000);
                var r_ret=await Remote.connectDev(cfg.da_server);
                if(r_ret){
                    await Remote.sendCmd({type:"cutScreen",filepath:screenPath});
                }
                await sendInfoByLink({type:"toSer",job:"syncRemote",status:r_ret,path:screenPath});
            }
        }
        endTest();
    }
}

async function wait(w_time){
    return new Promise(resolve => {
		setTimeout(function(){
			resolve(0);
		},w_time);
    });
}

async function sendInfoByLink(cmd){
    return new Promise(resolve => {
        var flag=1;
		var tm;
        pos.on("data",function(data){
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
        pis.push(cmd);
		tm=setTimeout(()=>{
			resolve({ret:0});
		},1500);
    });
}

function endTest(){
    Remote.disconnectDev();
    c.end();
}

async function createdLink(){
    return new Promise(resolve => {
        pos=new pack.outputStream();
        pis=new pack.inputStream();
        c=net.connect(6000,"127.0.0.1",function(){
            console.info("test_client connect!!!");
        });
        pos.on("data",function(data){
            switch(data.type){
                case "init":
                    pis.push({type:"info",class:"test",name:"remote"});
                    break;
                case "auth":
                    resolve(1);
                    break;
            }
        });
        pis.on("data",function(data){
            c.write(data);
        });
        c.on("data",function(data){
            pos.push(data);
        });
        c.on("close",function(){
            console.info("close test_client socket!!!");
        });
        c.on("error",function(){
            console.error("error");
            resolve(0);
        });
    });
}