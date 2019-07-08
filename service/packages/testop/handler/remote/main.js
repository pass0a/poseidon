var net=require("net");
var pack=require("pack");
var fs=require("fs");
var util=require("util");
var Uarts=require("../uarts/com");
var Cvip=require("../cvip/index");
var Remote=require("./index");
var prjpath=process.argv[2];
var pos,pis,c;

main();

async function main(){
    if(await createdLink()){
        var path = process.env.HOME + "/data_store/config.json";
        var cfg=JSON.parse(new util.TextDecoder().decode(fs.readFileSync(path)));
        var isExitst = fs.existsSync(prjpath+"/screen");
        if(!isExitst){
            fs.mkdirSync(prjpath+"/screen");
        }
        var screenPath = prjpath+"/screen/screen.png";
        var ret=await Remote.connectDev(cfg.da_server);
        if(ret){
            await Remote.sendCmd({type:"cutScreen",filepath:screenPath});
            await sendInfoByLink({type:"syncRemote",status:ret,path:screenPath});
        }else{
            var uarts=Uarts.create();
            var arm_info = {
                port: "COM"+cfg.uarts.da_arm.port,
                info: {
                    baud_rate :  cfg.uarts.da_arm.baud_rate,
                    data_bits : cfg.uarts.da_arm.data_bits,
                    stop_bits : cfg.uarts.da_arm.stop_bits,
                    parity : cfg.uarts.da_arm.parity,
                    flow_control : cfg.uarts.da_arm.flow_control
                }
            }
            var u_ret = await uarts.openUart({"port":arm_info.port,"info":arm_info.info});
            if(u_ret){
                await uarts.sendData("cd /data/app/pack \n",null,1);
                await uarts.sendData("sh run.sh \n",null,1);
                var r_ret=await Remote.connectDev(cfg.da_server);
                if(r_ret){
                    await Remote.sendCmd({type:"cutScreen",filepath:screenPath});
                }
                await sendInfoByLink({type:"syncRemote",status:r_ret,path:screenPath});
                uarts.closeUart();
            }else{
                await sendInfoByLink({type:"syncRemote",status:u_ret,path:screenPath});
            }
        }
        endTest();
    }
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
    // Uarts_Mgr.closeNeedUarts();
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