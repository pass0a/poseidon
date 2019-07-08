var net=require("net");
var pack=require("pack");
var fs=require("fs");
var Uarts_Mgr=require("../uarts/index");
var Cvip=require("../cvip/index");
var Remote=require("../remote/index");
var stepsWaitTime = 1500;
var toWebServerType = "tolink";
var pos,pis,c,caseInfo,gid=0;
var progress_info={current:0,total:0};
var test_log_info={step:{},ret:0};
var result_to_web={ok:0,ng:0};
var actionList={
	home: home,
	wait: wait,
	click: click,
	assert_pic : assertPic,
	operate_tool: operateTool
};

async function startTest(data){
	caseInfo=data;
	if(await createdLink()){
		var toContinue=await readStopInfo(); // 是否继续执行
		var ret=await readyForTest(toContinue);
        if(ret.ret){
			notifyWebView({type:toWebServerType,mode:1,info:ret.runtime});
			notifyWebView({type:toWebServerType,mode:2,info:progress_info});// 进度更新通知
            runTest(data,toContinue);
        }else{
			notifyWebView({type:toWebServerType,mode:0,error_code:ret.error_code});// error 0:串口异常 1:无测试用例
			c.end();
		}
	}
}

async function readyForTest(toContinue){
	if(caseInfo.caselist==undefined||caseInfo.caselist.length==0){
		return new Promise(resolve => {
			resolve({ret:0,error_code:1});
		});
	}
	var uartsSet=new Set();
	var runtime=0;
	progress_info.total=caseInfo.caselist.length;
	var start_idx = toContinue?caseInfo.stopinfo.idx:0;
	for(var i=start_idx;i<caseInfo.caselist.length;i++){
		var data=caseInfo.caselist[i];
		for(var j=0;j<data.case_steps.length;j++){
			var act=data.case_steps[j].action;
			if(uartsSet.size!=2){
				if(act=="operate_tool"){
					if(!uartsSet.has("relay"))uartsSet.add("relay");
				}else if(act=="click"||act=="assert_pic"||act=="home"){
					if(!uartsSet.has("da_arm"))uartsSet.add("da_arm");
				}
			}
			if(act=="wait")runtime+=data.case_steps[j].time;
			else {
				if(j<data.case_steps.length-1){
					var next_act=data.case_steps[j+1].action;
					if(next_act!="wait")runtime+=stepsWaitTime;
				}else runtime+=stepsWaitTime;
			}
		}
		runtime=runtime*data.case_mode;
	}
	var ret=uartsSet.size?await Uarts_Mgr.openNeedUarts(Array.from(uartsSet),caseInfo.config.uarts):1;
	var result = {ret:ret,runtime:runtime};
	if(!ret)result.error_code=0;
    return new Promise(resolve => {
        resolve(result);
    });
}

async function readStopInfo(){
	var toContinue = false;
	if(caseInfo.stopinfo == undefined || caseInfo.stopinfo.idx == -1){
		caseInfo.stopinfo =  { idx:-1, gid:-1, startTime:new Date()};
	}else{
		toContinue = true;
		gid = caseInfo.stopinfo.gid;
		var testInfo = caseInfo.report.testInfo;
		result_to_web.ok = testInfo.okCount;
		result_to_web.ng = testInfo.ngCount;
		progress_info.current = caseInfo.stopinfo.idx;
		caseInfo.caselist=caseInfo.report.caseData;
		caseInfo.stopinfo.startTime=new Date(testInfo.startTime+"+08:00");
	}
	return new Promise(resolve => {
		resolve(toContinue);
	});
}

function notifyWebView(info){
	pis.push(info);// 0: 初始化失败 1:初始化成功 2:开始测试 3: 测试完成 4: 步骤执行结果 5: 步骤开始执行 6: 暂停测试
}

async function runTest(data,toContinue){// 执行用例
    console.info("Run");
	var start_idx = toContinue?caseInfo.stopinfo.idx:0;
	var stopflag=false;
    for(var i=start_idx;i<data.caselist.length;i++){
		var ret=await runSteps(data.caselist[i]);
		if(!ret.ret){
			caseInfo.stopinfo.idx = ret.finish&&i<data.caselist.length-1?i+1:i;
			caseInfo.stopinfo.gid = gid++;
			stopflag = true;
			break;// 暂停退出
		}
	   	progress_info.current++;
	   	notifyWebView({type:toWebServerType,mode:2,info:progress_info});// 进度更新通知
	   	if(data.caselist[i].briefResl==0)result_to_web.ok++;
	   	else if(data.caselist[i].briefResl>0)result_to_web.ng++;
    }
	outputFile(caseInfo.stopinfo,result_to_web,stopflag);
	notifyWebView({type:toWebServerType,mode:stopflag?6:3,info:result_to_web});// 测试完成通知
    endTest();
}

async function runSteps(caseData){ // 执行步骤
	notifyWebView({type:toWebServerType,mode:5,info:caseData.case_id});// 用例开始执行通知
	caseData.briefResl=-1;// 用例结果 -1:未执行 0:成功 1:失败 2:连接错误
	caseData.results=[];// 步骤结果
    for(var i=0;i<caseData.case_mode;i++){ // 执行用例循环
        for(var j=0;j<caseData.case_steps.length;j++){
			var ret=await disposeStepLoop(j,caseData);
			test_log_info.step=caseData.case_steps[j];
			test_log_info.ret=caseData.briefResl;
			notifyWebView({type:toWebServerType,mode:4,info:test_log_info});// 测试步骤执行结果通知
			if(!ret){
				var finish = true;
				if(j<caseData.case_steps.length-1){
					caseData.briefResl=-1;
					finish = false;
				}
				return new Promise(resolve => {resolve({ret:0,finish:finish});});
			}else if(ret&&caseData.briefResl>0){
				caseData.results.push({runNum:i,stepNum:j});
				break;
			}
        }
    }
	return new Promise(resolve => {resolve({ret:1});});
}

async function disposeStepLoop(idx,caseData){ // 执行步骤循环
    var cmdStep=caseData.case_steps[idx];
    var stepLoop=cmdStep.loop?cmdStep.loop:1;
    for(var i=0;i<stepLoop;i++){
		var ret=await actionList[cmdStep.action](cmdStep,caseData); // 0: 成功 1: 失败 2: 连接错误
		caseData.briefResl=ret;
		var stat=await sendInfoByLink({type:"get_status"});
		if(stat.ret){
			if(!stat.data){
				return new Promise(resolve => {resolve(0);});
			}
		}
		if(ret==0)await defaultDelay(idx,caseData.case_steps);
    }
	return new Promise(resolve => {resolve(1);});
}

function outputFile(info,ret,flag){
	var stopInfo = flag?{idx:info.idx,gid:info.gid}:{idx:-1,gid:-1};
	fs.writeFileSync(caseInfo.path+"/stopinfo.json",JSON.stringify(stopInfo));
	fs.writeFileSync(caseInfo.path+"/report.json",JSON.stringify({caseData:caseInfo.caselist,testInfo:calculateRunTime(info.startTime,ret)}));
}

function calculateRunTime(startTime,ret){
	var endTime=new Date();
	var testInfo={
		days:0,
		hours:0,
		minutes:0,
		seconds:0,
		millisecond:0
	}
	var value=endTime.getTime()-startTime.getTime();
	testInfo.days=Math.floor(value/(24*3600*1000));
	var value1=value%(24*3600*1000);
	testInfo.hours=Math.floor(value1/(3600*1000));
	var value2=value1%(3600*1000);
	testInfo.minutes=Math.floor(value2/(60*1000));
	var value3=value2%(60*1000);
	testInfo.seconds=Math.floor(value3/1000);
	var value4=value3%1000;
	testInfo.millisecond=value4;
	testInfo.endTime=endTime.toLocaleString().split("+")[0];
	testInfo.startTime=startTime.toLocaleString().split("+")[0];
	testInfo.okCount=ret.ok;
	testInfo.ngCount=ret.ng;
	return testInfo;
}

async function defaultDelay(index,caseSteps){
	if(index<caseSteps.length-1){
		if(caseSteps[index+1].action=="wait"||caseSteps[index].action=="wait"){
			return;//current action or next action is wait,do not wait
		}
	}
	await wait({time:stepsWaitTime});
	return new Promise(resolve => {resolve(0);});
}

async function home(cmd,caseData){
	for(var i=2;i<6;i++){
		await Uarts_Mgr.sendDataForUarts("da_arm",i,1);
	}
	return new Promise(resolve => {
		resolve(0);
	});
}

async function wait(cmd,caseData){
    return new Promise(resolve => {
		setTimeout(function(){
			resolve(0);
		},cmd.time);
    });
}

async function operateTool(cmd,caseData){
	var result=Uarts_Mgr.sendDataForUarts("relay",cmd,0);
	// var ret = result.ret?0:1;
    return new Promise(resolve => {
		resolve(0);
	});
}

async function assertPic(cmd,caseData){
	var stat=await checkRemoteAlive();
	var result;
	if(stat){
		var ret=await imageMatch(cmd);
		if(!ret.valid){
			if(caseData.case_mode==1)await saveScreen(cmd,caseData);
		}
		result=ret.valid?0:1;
	}else{
		result=2;
	}
	return new Promise(resolve => {
		resolve(result);
	});
}

async function click(cmd,caseData){
	var stat=await checkRemoteAlive();
	var result;
	if(stat){
		var ret=await imageMatch(cmd);
		if(ret.valid){
			var rev=await Remote.sendCmd({type:cmd.action,x:ret.x,y:ret.y});
			result=rev.ret?0:2;
		}else{
			if(caseData.case_mode==1)await saveScreen(cmd,caseData);
			result=1;
		}
	}else{
		result=2;
	}
	return new Promise(resolve => {
		resolve(result);
	});
}

async function checkRemoteAlive(){
	var flag=Remote.getAlive();
	if(flag){
		var rev=await Remote.sendCmd({type:"alive"});
		if(rev.ret){
			return new Promise(resolve => {
				resolve(1);
			});
		}
	}// 目前无法测试以下逻辑, wifi问题
	var num=2;
	while(num){
		var ret=await Remote.connectDev(caseInfo.config.da_server);
		if(ret){
			break;
		}
		for(var i=0;i<2;i++){
			await Uarts_Mgr.sendDataForUarts("da_arm",i,1);
		}
		num--;
	}
	var result=num==0?0:1;
	return new Promise(resolve => {
		resolve(result);
	});
}

async function imageMatch(cmd){
	var tmpPath=caseInfo.path+"/tmp/test.png";
	var imgPath=caseInfo.path+"/img/"+cmd.id+".png";
	await Remote.sendCmd({type:"cutScreen",filepath:tmpPath});
	var obj=Cvip.imageMatch(imgPath,tmpPath);
	return new Promise(resolve => {
		resolve(obj);
	});
}

async function saveScreen(cmd,caseData){
	var tmpPath=caseInfo.path+"/tmp/test.png";
	caseData.image=caseInfo.path+"/img/"+cmd.id+".png";
	caseData.screen=caseInfo.path+"/tmp/"+(gid++)+".png";
	Cvip.imageSave(tmpPath,caseData.screen,16);
	return new Promise(resolve => {
		resolve(1);
	});
}

function endTest(){
    Uarts_Mgr.closeNeedUarts();
	Remote.disconnectDev();
    c.end();
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
                    pis.push({type:"info",class:"test",name:"test"});
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

exports.startTest=function(data){
    return startTest(data);
}