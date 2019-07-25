var pack=require("pack");

function Test_mgr(c,obj,lk){
    var pos=new pack.outputStream(),
        pis=new pack.inputStream(),
		currentStatus=true;
    pos.on("data",function(data){
        handleCmd(data);
    });
    pis.on("data",function(data){
        c.write(data);
    });
    c.on("data",function(data){
        pos.push(data);
    });
    pis.push({type:"auth",state:"ok"});
    var handleCmd=function(obj){
        switch(obj.type){
            case "tolink":
                var web_link=lk.getLink("web","web");
                web_link.sendToWebServer(obj);
                break;
			case "get_status":
				disposedCompleted(obj.type,currentStatus);
                break;
            case "toSer":
                if(obj.job == "syncRemote"){
                    var web_link=lk.getLink("web","web");
                    web_link.sendToWebServer(obj);
                }
                break;
			default:
				break;
		}
    };
    var disposedCompleted=function(type,data){
        pis.push({type:type,data:data});
    }
    this.stopTest=function(){
        currentStatus = false;
    }
}
exports.create=function(c,obj,l){
    return new Test_mgr(c,obj,l);
}