function Remote(){
    var net=require("net"),
        pack=require("pack"),
		fs=require("fs"),
        c,pos,pis,platform,
		alive=0;
    this.connectDev=async function(cfg){
        return new Promise(resolve => {
            pos=new pack.outputStream();
            pis=new pack.inputStream();
            console.log(cfg);
            c=net.connect(parseInt(cfg.port),cfg.ip,function(){
                console.info("remote connect!!!");
                pis.push({type:"auth"});
            });
            pos.on("data",function(data){
                switch(data.type){
                    case "auth":
                        platform=data.platform;
						alive=1;
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
				alive=0;
                console.info("close remote socket!!!");
            });
            c.on("error",function(error){
                console.error(error);
				alive=0;
                resolve(0);
            });
        });
    }
    this.disconnectDev=function(){
        if(c){
            c.end();
            c=null;
        }
    }
    this.sendCmd=function(cmd,timeout){
        if(timeout==undefined){
			timeout=3000;
		}
		var tm;
        return new Promise(resolve => {
            pos.on("data",function(data){
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
                    pis.push({type:cmd.type,x:cmd.x,y:cmd.y,time:cmd.time});
                    break;
                case "slide":
                    pis.push({type:cmd.type,x1:cmd.x1,y1:cmd.y1,x2:cmd.x2,y2:cmd.y2,time:cmd.time});
                    break;
                case "cutScreen":
                    pis.push({type:cmd.type});
                    break;
                case "alive":
                    pis.push({type:cmd.type});
                    break;
            }
            tm=setTimeout(()=>{
				resolve({ret:0});
			},timeout);
        });
    }
	this.getAlive=function(){
		return alive;
	}
}

module.exports = new Remote();