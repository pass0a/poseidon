import * as net from 'net';
import * as fs from 'fs';

import * as pack from '@passoa/pack';
import * as Cvip from '@passoa/cvip';
import QGBox from './qgbox/index';

let stepsWaitTime = 1500;
let toWebServerType = 'tolink';
let caseInfo: any;
let backCall: any;
let pis:any,pos:any,c:any;
let gid = 0;
let progress_info = { current: 0, total: 0 };
let test_log_info = { step: {}, ret: 0 };
let result_to_web = { ok: 0, ng: 0 };
let actionList: any = {
	wait: wait,
	click: click,
	assert_pic: assertPic,
	click_poi: clickPoi,
	slide: slide,
	operate_tool: operateTool,
	button: button,
	qg_box: qgBox,
	group: group
};

async function startTest(data: any) {
	caseInfo = data;
	if (await createdLink()) {
		let toContinue = await readStopInfo(); // 是否继续执行
		let ret:any = await readyForTest(toContinue);
		if (ret.ret) {
			await notifyToLink({ type: toWebServerType, mode: 1, info: ret.runtime });
			await notifyToLink({ type: toWebServerType, mode: 2, info: progress_info }); // 进度更新通知
			runTest(data, toContinue);
		} else {
			await notifyToLink({ type: toWebServerType, mode: 0, error_code: ret.error_code }); // error 0:串口异常 1:无测试用例 2:ADB异常
			c.end();
		}
	}
}

async function readyForTest(toContinue: any) {
	if (caseInfo.caselist == undefined || caseInfo.caselist.length == 0) {
		return new Promise((resolve) => {
			resolve({ ret: 0, error_code: 1 });
		});
	}
	let uartsSet = new Set();
	let runtime = 0;
	progress_info.total = caseInfo.caselist.length;
	let start_idx = toContinue ? caseInfo.stopinfo.idx : 0;
	for (let i = start_idx; i < caseInfo.caselist.length; i++) {
		let data = caseInfo.caselist[i];
		for (let j = 0; j < data.case_steps.length; j++) {
			let act = data.case_steps[j].action;
			if (uartsSet.size != 2) {
				if (act == 'operate_tool') {
					if (!uartsSet.has('relay')) uartsSet.add('relay');
				} else if (act == 'click' || act == 'assert_pic') {
					let tmppath = caseInfo.path + '/tmp';
					if(!fs.existsSync(tmppath))fs.mkdirSync(tmppath);
					if (!uartsSet.has('da_arm') && caseInfo.config.da_server.type == 0) uartsSet.add('da_arm');
				} else if (act == 'button'){
					if (!uartsSet.has('da_arm')) uartsSet.add('da_arm');
				}
			}
			if (act == 'wait') runtime += data.case_steps[j].time;
			else {
				if (j < data.case_steps.length - 1) {
					let next_act = data.case_steps[j + 1].action;
					if (next_act != 'wait') runtime += stepsWaitTime;
				} else runtime += stepsWaitTime;
			}
		}
		runtime = runtime * 2 * data.case_mode;
	}
	let ret = uartsSet.size ? await notifyToLink({type:'toCom',job:'openCom',info:Array.from(uartsSet),cfg:caseInfo.config}) : 1;
	let result: any = { ret: ret, runtime: runtime };
	if (!ret) result.error_code = 0;
	else if (ret && caseInfo.config.da_server.type == 1){
		// 检测ADB是否存在
		// if(!await notifyToLink({type:'toDevice',job:'checkADB'})){
		// 	result.ret = 0;
		// 	result.error_code = 2;
		// }
	}
	return new Promise((resolve) => {
		resolve(result);
	});
}

async function readStopInfo() {
	let toContinue = false;
	if (caseInfo.stopinfo == undefined || caseInfo.stopinfo.idx == -1) {
		caseInfo.stopinfo = { idx: -1, gid: -1, startTime: new Date() };
	} else {
		toContinue = true;
		gid = caseInfo.stopinfo.gid;
		let testInfo = caseInfo.report.testInfo;
		result_to_web.ok = testInfo.okCount;
		result_to_web.ng = testInfo.ngCount;
		progress_info.current = caseInfo.stopinfo.idx;
		caseInfo.caselist = caseInfo.report.caseData;
		caseInfo.stopinfo.startTime = new Date(testInfo.startTime + '+08:00');
	}
	return new Promise((resolve) => {
		resolve(toContinue);
	});
}

function notifyToLink(info: any) {
	// 0: 初始化失败 1:初始化成功 2:用例开始测试 3: 测试完成 4: 步骤执行结果 5: 步骤开始执行 6: 暂停测试
	return new Promise((resolve) => {
		backCall = resolve;
		pis.write(info);
		if(info.type == toWebServerType)backCall(1);
	});
}

async function runTest(data: any, toContinue: any) {
	// 执行用例
	let start_idx = toContinue ? caseInfo.stopinfo.idx : 0;
	let stopflag = false;
	for (let i = start_idx; i < data.caselist.length; i++) {
		let ret: any = await runSteps(data.caselist[i]);
		if (!ret.ret) {
			caseInfo.stopinfo.idx = i;
			caseInfo.stopinfo.gid = gid++;
			stopflag = true;
			break; // 暂停退出
		}
		progress_info.current++;
		await notifyToLink({ type: toWebServerType, mode: 2, info: progress_info }); // 进度更新通知
		if (data.caselist[i].briefResl == 0) result_to_web.ok++;
		else if (data.caselist[i].briefResl > 0) result_to_web.ng++;
	}
	outputFile(caseInfo.stopinfo, result_to_web, stopflag);
	await notifyToLink({ type: toWebServerType, mode: stopflag ? 6 : 3, info: result_to_web }); // 测试完成通知
	endTest();
}

async function runSteps(caseData: any) {
	// 执行步骤
	await notifyToLink({ type: toWebServerType, mode: 5, info: caseData.case_id }); // 用例开始执行通知
	caseData.briefResl = -1; // 用例结果 -1:未执行 0:成功 1:失败 2:连接错误
	caseData.results = []; // 步骤结果
	for (let i = 0; i < caseData.case_mode; i++) {
		// 执行用例循环
		for (let j = 0; j < caseData.case_steps.length; j++) {
			let ret = await disposeStepLoop(j, caseData);
			if (!ret) {
				caseData.briefResl = -1;
				return new Promise((resolve) => {
					resolve({ ret: 0 });
				});
			} else if (ret && caseData.briefResl > 0) {
				caseData.results.push({ runNum: i, stepNum: j });
				break;
			}
		}
	}
	return new Promise((resolve) => {
		resolve({ ret: 1 });
	});
}

async function disposeStepLoop(idx: any, caseData: any) {
	// 执行步骤循环
	let cmdStep = caseData.case_steps[idx];
	let stepLoop = cmdStep.loop != undefined ? cmdStep.loop : 1;
	for (let i = 0; i < stepLoop; i++) {
		let stat: any = await notifyToLink({ type: 'get_status' });
		if (!stat) {
			if (!stat.data) {
				return new Promise((resolve) => {
					resolve(0);
				});
			}
		}
		let ret = await actionList[cmdStep.action](cmdStep, caseData); // 0: 成功 1: 失败 2: 连接错误 3: 组合步骤进行暂停
		if (ret != 3) caseData.briefResl = ret;
		test_log_info.step = cmdStep;
		test_log_info.ret = ret;
		await notifyToLink({ type: toWebServerType, mode: 4, info: test_log_info }); // 测试步骤执行结果通知
		if (stepLoop > 1) {
			let prop = idx.toString();
			if (caseData.loopRet == undefined) caseData.loopRet = {};
			if (caseData.loopRet[prop] == undefined) caseData.loopRet[prop] = [];
			caseData.loopRet[prop].push(i);
		}
		if (ret == 0) await defaultDelay(idx, caseData.case_steps);
	}
	return new Promise((resolve) => {
		resolve(1);
	});
}

function outputFile(info: any, ret: any, flag: any) {
	let stopInfo = flag ? { idx: info.idx, gid: info.gid } : { idx: -1, gid: -1 };
	fs.writeFileSync(caseInfo.path + '/stopinfo.json', JSON.stringify(stopInfo));
	fs.writeFileSync(
		caseInfo.path + '/report.json',
		JSON.stringify({ caseData: caseInfo.caselist, testInfo: calculateRunTime(info.startTime, ret) })
	);
}

function calculateRunTime(startTime: any, ret: any) {
	let endTime = new Date();
	let testInfo: any = {
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
		millisecond: 0
	};
	let value = endTime.getTime() - startTime.getTime();
	testInfo.days = Math.floor(value / (24 * 3600 * 1000));
	let value1 = value % (24 * 3600 * 1000);
	testInfo.hours = Math.floor(value1 / (3600 * 1000));
	let value2 = value1 % (3600 * 1000);
	testInfo.minutes = Math.floor(value2 / (60 * 1000));
	let value3 = value2 % (60 * 1000);
	testInfo.seconds = Math.floor(value3 / 1000);
	let value4 = value3 % 1000;
	testInfo.millisecond = value4;
	testInfo.endTime = endTime.toLocaleString().split('+')[0];
	testInfo.startTime = startTime.toLocaleString().split('+')[0];
	testInfo.okCount = ret.ok;
	testInfo.ngCount = ret.ng;
	return testInfo;
}

async function defaultDelay(index: any, caseSteps: any) {
	//current action or next action is wait,do not wait
	if (caseSteps[index].action != 'wait') {
		if (index < caseSteps.length - 1) {
			if (caseSteps[index + 1].action != 'wait') {
				await wait({ time: stepsWaitTime });
				console.log('wait', stepsWaitTime);
			}
		} else {
			await wait({ time: stepsWaitTime });
			console.log('wait', stepsWaitTime);
		}
	}
	return new Promise((resolve) => {
		resolve(0);
	});
}

async function button(cmd: any, caseData?: any) {
	let buttonCmd = caseInfo.buttons[cmd.id];
	for (let i = 0; i < buttonCmd.content.length; i++) {
		let ct = buttonCmd.content[i];
		for (let j = 0; j < ct.length; j++) {
			// 暂支持串口发送
			let info = { event: buttonCmd.event, ct: ct[j] };
			await notifyToLink({type:'toCom',job:'sendData',info:{name:"da_arm",cmd:cmd.action,msg:info}});
		}
		if (cmd.click_type == '1') await wait({ time: cmd.click_time });
	}
	return new Promise((resolve) => {
		resolve(0);
	});
}

async function group(cmd: any, caseData?: any) {
	let groupContent = caseInfo.group[cmd.id].content;
	for (let j = 0; j < groupContent.length; j++) {
		let cmdStep = groupContent[j];
		let stepLoop = cmdStep.loop != undefined ? cmdStep.loop : 1;
		for (let i = 0; i < stepLoop; i++) {
			let ret = await actionList[cmdStep.action](cmdStep, caseData); // 0: 成功 1: 失败 2: 连接错误 3: 组合步骤进行暂停
			// caseData.briefResl=ret;
			if (ret) {
				return new Promise((resolve) => {
					resolve(ret);
				});
			}
			let stat: any = await notifyToLink({ type: 'get_status' });
			if (stat.ret) {
				if (!stat.data) {
					return new Promise((resolve) => {
						resolve(3);
					});
				}
			}
		}
	}
	return new Promise((resolve) => {
		resolve(0);
	});
}

async function qgBox(cmd: any, caseData?: any) {
	let rev: any = await QGBox.sendBoxApi(cmd.module, 0, caseInfo.config.qg_box);
	let result: any;
	if (!rev.ret) {
		result = parseFloat(rev.data) > cmd.b_volt ? 0 : 1;
	} else {
		result = 2;
	}
	return new Promise((resolve) => {
		resolve(result);
	});
}

async function wait(cmd: any, caseData?: any) {
	return new Promise((resolve) => {
		setTimeout(function() {
			resolve(0);
		}, cmd.time);
	});
}

async function operateTool(cmd: any, caseData?: any) {
	await notifyToLink({type:'toCom',job:'sendData',info:{name:"relay",cmd:cmd}});
	return new Promise((resolve) => {
		resolve(0);
	});
}

async function assertPic(cmd: any, caseData: any) {
	let result: any;
	let info = {screenPath : caseInfo.path+"/tmp/tmp.png", cfg : caseInfo.config};
	let get_screen:any = await notifyToLink({type:"toDevice",job:"cutScreen",info:info});
	if(get_screen.ret){
		let ret: any = await imageMatch(cmd);
		if(ret.ret && !ret.obj.valid){
			if (caseData.case_mode == 1 && cmd.loop == undefined) {
				await saveScreen(cmd, caseData);
				caseData.match = Math.floor(ret.obj.val * 10000) / 100;
			}
		}else if (!ret.ret) caseData.image = '';
		result = ret.ret && ret.obj.valid ? 0 : 1;
	}else result = 2;
	return new Promise((resolve) => {
		resolve(result);
	});
}

async function click(cmd: any, caseData: any) {
	let result: any;
	let info = {screenPath : caseInfo.path+"/tmp/tmp.png", cfg : caseInfo.config};
	let get_screen:any = await notifyToLink({type:"toDevice",job:"cutScreen",info:info});
	if(get_screen.ret){
		let ret: any = await imageMatch(cmd);
		if(ret.ret && ret.obj.valid){
			let msg:any = {x : ret.obj.x, y : ret.obj.y, click_type:cmd.click_type, cfg : caseInfo.config};
			if(cmd.click_type == "1")msg.time = cmd.click_time;
			let rev:any = await notifyToLink({type:"toDevice",job:"click",info:msg});
			result = rev.ret ? 0 : 2;
		}else{
			if (caseData.case_mode == 1 && cmd.loop == undefined && ret.ret) {
				await saveScreen(cmd, caseData);
				caseData.match = Math.floor(ret.obj.val * 10000) / 100;
			} else if (!ret.ret) caseData.image = '';
			result = 1;
		}
	}else result = 2;
	// 点击不判断
	if (result == 1 && cmd.click_skip) result = 0;
	return new Promise((resolve) => {
		resolve(result);
	});
}

async function clickPoi(cmd: any, caseData: any) {
	let poi_info = caseInfo.binding[cmd.id];
	let msg:any = {x : poi_info.x1, y : poi_info.y1,click_type:cmd.click_type, cfg : caseInfo.config};
	if(cmd.click_type == "1")msg.time = cmd.click_time;
	let rev:any = await notifyToLink({type:"toDevice",job:"click",info:msg});
	let result = rev.ret ? 0 : 2;
	return new Promise((resolve) => {
		resolve(result);
	});
}

async function slide(cmd: any, caseData: any) {
	let slide_info = caseInfo.binding[cmd.id];
	let msg:any = {x1 : slide_info.x1, y1 : slide_info.y1, x2:slide_info.x2, y2: slide_info.y2,time:1000, cfg : caseInfo.config};
	let rev:any = await notifyToLink({type:"toDevice",job:"slide",info:msg});
	let result = rev.ret ? 0 : 2;
	return new Promise((resolve) => {
		resolve(result);
	});
}

async function imageMatch(cmd: any) {
	let tmpPath = caseInfo.path + '/tmp/tmp.png';
	let imgPath = caseInfo.path + '/img/' + cmd.id + '.png';
	let info: any;
	if (!fs.existsSync(imgPath)) {
		info = { ret: 0 };
	} else {
		info = { ret: 1, obj: Cvip.imageMatch(imgPath, tmpPath) };
	}
	return new Promise((resolve) => {
		resolve(info);
	});
}

async function saveScreen(cmd: any, caseData: any) {
	let tmpPath = caseInfo.path + '/tmp/tmp.png';
	caseData.image = caseInfo.path + '/img/' + cmd.id + '.png';
	caseData.screen = caseInfo.path + '/tmp/' + gid++ + '.png';
	Cvip.imageSave(tmpPath, caseData.screen, 16);
	return new Promise((resolve) => {
		resolve(1);
	});
}

async function endTest() {
	await notifyToLink({type:'toCom',job:'closeCom'});
	c.end();
}

async function createdLink() {
	return new Promise((resolve) => {
		pos = new pack.unpackStream();
		pis = new pack.packStream();
		c = net.connect(6000, '127.0.0.1', function() {
			console.info('test_client connect!!!');
		});
		pos.on('data', function(data: any) {
			switch (data.type) {
				case 'init':
					pis.write({ type: 'info', class: 'test', name: 'test' });
					break;
				case 'auth':
					resolve(1);
					break;
				default:
					if(backCall)backCall(data.data);
					break;
			}
		});
		pis.on('data', function(data: any) {
			c.write(data);
		});
		c.on('data', function(data: any) {
			pos.write(data);
		});
		c.on('close', function() {
			console.info('close test_client socket!!!');
		});
		c.on('error', function() {
			console.error('error');
			resolve(0);
		});
	});
}

export default { startTest };
