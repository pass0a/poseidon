var pack=require("@passoa/pack");
var childprs = require("child_process");
var dpath=require("path");
var util=require("util");
var fs=require("fs");
var testcfg = require("../testcfg.json");
var Cvip = require("../handler/cvip/index");

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
        switch(obj.job){
            case "startTest":
                var jsPath = "\"" + dpath.dirname(__dirname) + "/handler/test/main.js\"";
                startJS(obj,jsPath);
                break;
            case "continueTest":
                var jsPath = "\"" + dpath.dirname(__dirname) + "/handler/test/main.js\"";
                startJS(obj,jsPath);
                break;
            case "stopTest":
                var test_link=lk.getLink("test","test");
                test_link.stopTest();
                break;
            case "replayTest":
                var jsPath = "\"" + dpath.dirname(__dirname) + "/handler/test/main.js\"";
                startJS(obj,jsPath);
                break;
            case "syncRemote":
                var jsPath = "\"" + dpath.dirname(__dirname) + "/handler/remote/main.js\"";
                startJS(obj,jsPath);
                break;
            case "saveCutImage":
                var passoaPath=process.execPath;
                var prjPath=dpath.dirname(dpath.dirname(passoaPath)) + 'data_store/projects/'+obj.info.prjname;
                var screenPath = prjPath+"/screen/screen.png";
                var imgPath = prjPath+"/img";
                if(!fs.existsSync(imgPath))fs.mkdirSync(imgPath);
                var icon_info = obj.info.cut_info;
                var iconPath = imgPath+"/"+icon_info.id+".png";
                var ret=Cvip.imageCut(screenPath,iconPath,16,icon_info.info.x1,icon_info.info.y1,icon_info.info.w,icon_info.info.h);
                pis.push({type:obj.type,job:obj.job,ret:ret});
                break;
			default:
				break;
		}
    };
    var startJS=function(obj,jsPath){
        var passoaPath=process.execPath;
        var prjPath=dpath.dirname(dpath.dirname(passoaPath)) + 'data_store/projects/'+obj.info.prjname;
        var path="\""+passoaPath+"\" "+jsPath+" \""+prjPath+"\"";
        console.log(path);
        childprs.exec(path,{windowsHide:testcfg.windowsHide,detached:testcfg.detached});
    }
    this.sendToWebServer = function(data) {
        pis.push(data);
    }
}
exports.create=function(c,obj,l){
    return new Web_mgr(c,obj,l);
}