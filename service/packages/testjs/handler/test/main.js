// console.logmode("rotating","passoa",__dirname+"/passoa.log",1024*1024*5,1);
var logic=require("./index.js");
// console.log(process.argv);
logic.startTest({});
// var util=require("util");
// var fs=require("fs");
// var caseInfo={};
// var endflag=0;
// var fileList=new Map([["caselist","cmdset.json"],["res","res.json"],["igt","igt.json"],["idbind","idbind.json"],["rule","rule.json"],["report","report.json"]]);

// caseInfo["stopInfo"]=JSON.parse(new util.TextDecoder().decode(fs.readFileSync(__dirname+"/stopInfo.json")));
// if(caseInfo["stopInfo"].idx==-1){
// 	fileList.delete("report");
// }

// fileList.forEach(function(value,key){
// 	readFile(key,value,fileList.size);
// })

function readFile(name,path,len){
	var f=new fs.ReadStream(__dirname+"/"+path);
	console.info(__dirname+"/"+path);
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
			caseInfo["path"]=__dirname;
			logic.startTest(caseInfo);
		}
	});
	f.on("error",function(){
		console.log("read error!");
	});
}