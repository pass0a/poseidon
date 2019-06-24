var pack=require("pack");
var childprs = require("child_process");
var dpath=require("path");

function Web_mgr(c,obj,lk){
    var pos=new pack.outputStream(),
        pis=new pack.inputStream();
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
            case "startTest":
                var passoaPath=process.execPath;
                var jsPath="\"" + dpath.dirname(__dirname) + "/handler/test/main.js\"";
                var prjPath=dpath.dirname(dpath.dirname(passoaPath)) + 'data_store/projects/'+obj.prjname;
                var path=passoaPath+" "+jsPath+" "+prjPath;
                childprs.exec(path,{windowsHide:false,detached:true});
                break;
			default:
				break;
		}
    };
}
exports.create=function(c,obj,l){
    return new Web_mgr(c,obj,l);
}