var net=require("net");
var pack=require("pack");
var fs=require("fs");
var Uarts_Mgr=require("../uarts/index");
var Cvip=require("../cvip/index");
var Remote=require("../remote/index");
var pos,pis,c,caseInfo,gid=0;
var actionList={
	wait: wait,
	click: click,
	assert_pic : assertPic,
	operate_tool: operateTool
};

async function startTest(data){
	caseInfo=data;
	if(await createdLink()){
		// var stat=await openNeedUarts(data.caselist);
        // if(stat){
        //     runTest(data);
        // }else{
		// 	c.end();
		// }
	}
}

async function runTest(data){
    console.info("Run");
	var stopInfo=await readStopInfo();
    for(var i=0;i<data.caselist.length;i++){
       var ret=await runSteps(data.caselist[i]);
    }
	outputFile(stopInfo);
    endTest();
}

async function runSteps(caseData){
	caseData.briefResl=0;
	caseData.results=[];
    for(var i=0;i<caseData.case_mode;i++){
        for(var j=0;j<caseData.case_steps.length;j++){
            var ret=await disposeStepLoop(j,caseData);
			if(!ret){
				return new Promise(resolve => {resolve(0);});
			}else if(ret&&caseData.briefResl==2){
				caseData.results.push({runNum:i,stepNum:j});
				break;
			}
        }
    }
	return new Promise(resolve => {resolve(1);});
}

async function disposeStepLoop(idx,caseData){
    var cmdStep=caseData.case_steps[idx];
    var stepLoop=cmdStep.loop?cmdStep.loop:1;
    for(var i=0;i<stepLoop;i++){
        var ret=await actionList[cmdStep.action](cmdStep,caseData);
		caseData.briefResl=ret!=1?2:1;
		var stat=await sendInfoByLink({act:"get_status"});
		if(stat.ret){
			if(!stat.data){
				return new Promise(resolve => {resolve(0);});
			}
		}
		defaultDelay(idx,caseData.case_steps);
    }
	return new Promise(resolve => {resolve(1);});
}

async function readStopInfo(){
	var stopInfo={
		idx:0,
		startTime:new Date()
	};
	if(caseInfo.stopInfo.idx>-1){
		stopInfo.idx=caseInfo.stopInfo.idx;
		gid=caseInfo.stopInfo.gid+1;
		caseInfo.caselist=caseInfo.report.caseData;
		stopInfo.startTime=new Date(caseInfo.report.testTime.startTime+"+08:00");
		info={total:caseInfo.caselist.length,tested:stopInfo.idx-1,sts:0};
		// await progressBar(info);
	}
	return new Promise(resolve => {
		resolve(stopInfo);
	});
}

function outputFile(info){
	fs.writeFileSync(caseInfo.path+"/report.json",JSON.stringify({caseData:caseInfo.caselist,testTime:calculateRunTime(info.startTime)}));
	if(info.idx>-1){
		fs.writeFileSync(caseInfo.path+"/stopInfo.json",JSON.stringify({idx:-1,gid:-1}));
	}
}

function calculateRunTime(startTime){
	var endTime=new Date();
	var runtime={
		days:0,
		hours:0,
		minutes:0,
		seconds:0,
		millisecond:0
	}
	var value=endTime.getTime()-startTime.getTime();
	runtime.days=Math.floor(value/(24*3600*1000));
	var value1=value%(24*3600*1000);
	runtime.hours=Math.floor(value1/(3600*1000));
	var value2=value1%(3600*1000);
	runtime.minutes=Math.floor(value2/(60*1000));
	var value3=value2%(60*1000);
	runtime.seconds=Math.floor(value3/1000);
	var value4=value3%1000;
	runtime.millisecond=value4;
	runtime.endTime=endTime.toLocaleString().split("+")[0];
	runtime.startTime=startTime.toLocaleString().split("+")[0];
	return runtime;
}

async function defaultDelay(index,caseSteps){
	if(index<caseSteps.length-1){
		if(caseSteps[index+1].action=="wait"||caseSteps[index].action=="wait"){
			return;//current action or next action is wait,do not wait
		}
	}
	await wait({time:1500});
	return;
}

async function wait(cmd,caseData){
    return new Promise(resolve => {
		setTimeout(function(){
			resolve(1);
		},cmd.time);
    });
}

async function operateTool(cmd,caseData){
    var result=Uarts_Mgr.sendDataForUarts("relay",cmd,0);
    return new Promise(resolve => {
		resolve(result.ret);
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
		result=ret.valid;
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
			var rev;
			if(cmd.lck){
				rev=await Remote.sendCmd({act:"long_click",x:ret.x,y:ret.y,time:cmd.lct});
			}else{
				rev=await Remote.sendCmd({act:cmd.action,x:ret.x,y:ret.y});
			}
			result=rev.ret?1:2;
		}else{
			if(caseData.case_mode==1)await saveScreen(cmd,caseData);
			result=0;
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
		var rev=await Remote.sendCmd({act:"alive"});
		if(rev.ret){
			return new Promise(resolve => {
				resolve(1);
			});
		}
	}
	var num=2;
	while(num){
		var ret=await Remote.connectDev();
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
	var imgPath=caseInfo.path+"/img/"+caseInfo.res[cmd.id].img;
	await Remote.sendCmd({act:"cutScreen",filepath:tmpPath});
	var obj=Cvip.imageMatch(imgPath,tmpPath);
	return new Promise(resolve => {
		resolve(obj);
	});
}

async function saveScreen(cmd,caseData){
	var tmpPath=caseInfo.path+"/tmp/test.png";
	caseData.image=caseInfo.res[cmd.id].img;
	caseData.screen=(gid++)+".png";
	Cvip.imageSave(tmpPath,caseInfo.path+"/tmp/"+caseData.screen,16);
	return new Promise(resolve => {
		resolve(1);
	});
}

function endTest(){
    Uarts_Mgr.closeNeedUarts();
	Remote.disconnectDev();
    c.end();
}

async function openNeedUarts(data){
    var uartsSet=new Set();
    for(var i=0;i<data.length;i++){
        for(var j=0;j<data[i].case_steps.length;j++){
            var act=data[i].case_steps[j].action;
            if(uartsSet.size==3){
                break;
            }
            if(act=="control_pro"||act=="assert_pro"){
                if(!uartsSet.has("da_mcu"))uartsSet.add("da_mcu");
            }else if(act=="operate_tool"){
                if(!uartsSet.has("relay"))uartsSet.add("relay");
            }else if(act=="click"||act=="assert_pic"){
				if(!uartsSet.has("da_arm"))uartsSet.add("da_arm");
			}
        }
    }
    var ret=uartsSet.size?await Uarts_Mgr.openNeedUarts(Array.from(uartsSet)):1;
    return new Promise(resolve => {
        resolve(ret);
    });
}

async function sendInfoByLink(cmd){
    return new Promise(resolve => {
        var flag=1;
		var tm;
        pos.on("data",function(data){
            if(flag){
                if(data.act==cmd.action){
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
            // resolve(0);
        });
    });
}

exports.startTest=function(data){
    return startTest(data);
}