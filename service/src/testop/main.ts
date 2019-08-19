import * as fs from "fs";
import * as util from "util";
import * as os from "os";
import logic from "./index";

let prjpath:any=process.argv[2];
let caseInfo:any={};
let endflag=0;
let fileList=new Map([
	["caselist","caselist.json"],
	["stopinfo","stopinfo.json"],
	["buttons","buttons.json"],
	["group","group.json"]
]);
fileList.forEach(function(value,key){
	readFile(key,value,fileList.size);
})

function readFile(name:any,path:any,len:any){
	let isExitst = fs.existsSync(prjpath+"/"+path);
	if(!isExitst){
		endflag++;
		if(endflag==len){
			caseInfo["path"]=prjpath;
			readConfig();
			checkTmpDir();
			readReport(prjpath);
			logic.startTest(caseInfo);
		}
		return;
	}
	let f=fs.createReadStream(prjpath+"/"+path);
	let caseInfoStr="";
	f.on("open",() => {});
	f.on("data",function(data:any){
		let str=new util.TextDecoder().decode(data);
		caseInfoStr+=str;
	})
	f.on("end",function(){
		disposeData(name, JSON.parse(caseInfoStr));
		endflag++;
		if(endflag==len){
			caseInfo["path"]=prjpath;
			readConfig();
			checkTmpDir();
			readReport(prjpath);
			logic.startTest(caseInfo);
		}
	});
	f.on("error",function(){
		console.log("read error!");
	});
}

function readConfig(){
	let path = os.homedir() + "/data_store/config.json";
	caseInfo["config"]=JSON.parse(new util.TextDecoder().decode(fs.readFileSync(path)));
}

function readReport(prjpath:any){
	if(caseInfo["stopinfo"]!=undefined&&caseInfo["stopinfo"].idx>-1){
		caseInfo["report"]=JSON.parse(new util.TextDecoder().decode(fs.readFileSync(prjpath+"/report.json")));
	}
}

function checkTmpDir(){
	let isExitst = fs.existsSync(prjpath+"/tmp");
	if(!isExitst){
		fs.mkdirSync(prjpath+"/tmp");
	}
}

function disposeData(name:any,data:any){
	caseInfo[name] = {};
	switch(name){
		case "buttons":
			for(let i=0;i<data.length;i++){
				caseInfo[name][data[i].id] = {
					content : data[i].content,
					event : data[i].event
				}
			}
			break;
		case "group":
			for(let i=0;i<data.length;i++){
				caseInfo[name][data[i].id] = {
					content : data[i].content
				}
			}
			break;
		default:
			caseInfo[name] = data;
			break;
	}
}

