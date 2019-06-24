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
    pis.push({act:"auth",state:"ok"});
    var handleCmd=function(obj){
        switch(obj.act){
            case "test":
                console.info("rev!!!!");
                // disposedCompleted(obj.act,1);
                break;
			case "get_status":
				disposedCompleted(obj.act,currentStatus);
				break;
			default:
				break;
		}
    };
    var disposedCompleted=function(action,data){
        pis.push({act:action,data:data});
    }
}
exports.create=function(c,obj,l){
    return new Test_mgr(c,obj,l);
}