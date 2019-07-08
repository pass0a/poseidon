// console.logmode("rotating","passoa",__dirname+"/passoa.log",1024*1024*5,1);

// var fileList=new Map([["caselist","cmdset.json"],["res","res.json"],["igt","igt.json"],["idbind","idbind.json"],["rule","rule.json"],["report","report.json"]]);
// caseInfo["stopInfo"]=JSON.parse(new util.TextDecoder().decode(fs.readFileSync(__dirname+"/stopInfo.json")));
// if(caseInfo["stopInfo"].idx==-1){
// 	fileList.delete("report");
// }

var fs=require("fs");
var util=require("util");
var logic=require("./index.js");
var prjpath=process.argv[2];
var caseInfo={};
var endflag=0;
var fileList=new Map([
	["caselist","caselist.json"],
	["stopinfo","stopinfo.json"]
]);
fileList.forEach(function(value,key){
	readFile(key,value,fileList.size);
})

function readFile(name,path,len){
	var isExitst = fs.existsSync(prjpath+"/"+path);
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
	var f=new fs.ReadStream(prjpath+"/"+path);
	console.info(prjpath+"/"+path);
	var caseInfoStr="";
	f.on("open",function(){
	});
	f.on("data",function(data){
		var str=new util.TextDecoder().decode(data);
		caseInfoStr+=str;
	})
	f.on("end",function(){
		caseInfo[name]=Duktape.dec('jc',caseInfoStr);
		endflag++;
		if(endflag==len){
			caseInfo["path"]=prjpath;
			readConfig();
			readReport(prjpath);
			logic.startTest(caseInfo);
		}
	});
	f.on("error",function(){
		console.log("read error!");
	});
}

function readConfig(){
	var path = process.env.HOME + "/data_store/config.json";
	caseInfo["config"]=JSON.parse(new util.TextDecoder().decode(fs.readFileSync(path)));
}

function readReport(prjpath){
	if(caseInfo["stopinfo"]!=undefined&&caseInfo["stopinfo"].idx>-1){
		caseInfo["report"]=JSON.parse(new util.TextDecoder().decode(fs.readFileSync(prjpath+"/report.json")));
	}
}

function checkTmpDir(){
	var isExitst = fs.existsSync(prjpath+"/tmp");
	if(!isExitst){
		fs.mkdirSync(prjpath+"/tmp");
	}
}

