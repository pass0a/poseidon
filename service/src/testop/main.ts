import * as pack from '@passoa/pack';
import * as Cvip from '@passoa/cvip';
import * as net from 'net';
import * as path from 'path';
import * as util from 'util';
import * as fs from 'fs';
import * as os from 'os';

let prjname: string = process.argv[2];
let prjpath: string = path.dirname(path.dirname(process.execPath)) + '/data_store/projects/' + prjname;
let pis: any, pos: any, c: any, backCall: any;
let current_type: string = '',
	ToLink = 'tolink',
	ToDB = 'toDB',
	stepsWaitTime = 1500,
	adb_cmd_isExist = false,
	pcan_isExist = false,
	dbc_isExist = false;
let caseInfo: any = { start_idx: 0, img_idx: 0, com_len: 2 };
let progress_info = { current: 0, total: 0 };
let log_info: any = { id: '', status: false, filename: '' };
let saveOneInMode: boolean = false;
let actionList: any = {
	wait: wait,
	click: click,
	assert_pic: assertPic,
	click_poi: clickPoi,
	slide: slide,
	operate_tool: operateTool,
	button: button,
	qg_box: qgBox,
	group: group,
	adb_cmd: adbCmd,
	assert_pto: assertPto,
	pcan: pcan,
	dbc: dbc
};

startTest();

async function startTest() {
	if (await createdLink()) {
		readConfig();
		let list: any = await notifyToLinkMgr({
			type: ToDB,
			route: 'status',
			job: 'getTestCases',
			info: { prjname: prjname }
		});
		caseInfo.caselist = JSON.parse(list);
		let ret: any = await readyForTest();
		if (ret.ret) {
			await readStopInfo();
			await notifyToLinkMgr({ type: ToLink, mode: 1, info: ret.runtime });
			await notifyToLinkMgr({ type: ToLink, mode: 2, info: progress_info }); // 进度更新通知
			await startLog();
			await runTest();
		} else {
			await notifyToLinkMgr({ type: ToLink, mode: 0, error_code: ret.error_code }); // error 0:串口异常 1:无测试用例 2:ADB异常 3:Pcan异常 4:DBC不存在
			await endTest();
		}
	}
}

async function runTest() {
	// 执行用例
	let stopflag = false;
	for (let i = caseInfo.start_idx; i < caseInfo.caselist.length; i++) {
		let result: any = await runSteps(caseInfo.caselist[i]);
		if (result.stop) {
			caseInfo.start_idx = i;
			caseInfo.img_idx = caseInfo.img_idx++;
			stopflag = true;
			break; // 暂停退出
		}
		progress_info.current = i + 1;
		await notifyToLinkMgr({ type: ToLink, mode: 2, info: progress_info }); // 进度更新通知
	}
	outputFile(stopflag);
	let results = await notifyToLinkMgr({
		type: ToDB,
		route: 'results',
		job: 'getRet',
		info: { prjname: prjname },
		data: { ok: 0, ng: 0 }
	}); // 获取测试数据
	await notifyToLinkMgr({ type: ToLink, mode: stopflag ? 6 : 3, info: results }); // 测试完成通知
	await endTest();
}

async function recordResultToDB(data: any, case_info: any, start_time: Date, mode_idx: number) {
	let record_info = {
		prjname: prjname,
		msg: {
			cid: case_info._id,
			module: case_info.case_module,
			start_time: start_time,
			result: data.length ? 1 : 0,
			fail_info: data,
			tested_mode: mode_idx + 1
		}
	};
	let record_job = mode_idx == 0 ? 'add' : 'modify';
	await notifyToLinkMgr({ type: 'toDB', route: 'results', job: record_job, info: record_info });
	return new Promise((resolve) => {
		resolve(0);
	});
}

async function runSteps(caseContent: any) {
	// 执行用例循环
	let start_time = new Date();
	let stopflag = false;
	let caseLoopList: any = [];
	saveOneInMode = false; // 每条用例的循环模式只保留首次失败的图片
	for (let i = 0; i < caseContent.case_mode; i++) {
		await notifyToLinkMgr({ type: ToLink, mode: 5, info: caseContent.case_id, count: i + 1 }); // 用例开始执行通知
		for (let j = 0; j < caseContent.case_steps.length; j++) {
			let step_result: any = await disposeStepLoop(j, caseContent);
			if (step_result.data.length) {
				caseLoopList.push({ case_loop_idx: i, case_idx: j, case_loop_ret: step_result.data });
				break;
			}
			if (step_result.stop) {
				stopflag = true;
				break;
			}
		}
		if (stopflag) break;
		await recordResultToDB(caseLoopList, caseContent, start_time, i);
		if (caseLoopList.length > 0 && !caseInfo.config.test_info.error_exit) break;
	}
	return new Promise((resolve) => {
		resolve({ stop: stopflag });
	});
}

async function disposeStepLoop(idx: any, caseContent: any) {
	// 执行步骤循环
	let cmdStep = caseContent.case_steps[idx];
	let stepLoop = cmdStep.loop != undefined ? cmdStep.loop : 1;
	let stopflag = false;
	let stepLoopList: any = [];
	for (let i = 0; i < stepLoop; i++) {
		if (!await notifyToLinkMgr({ type: 'get_status' })) {
			stopflag = true;
			break;
		}
		let act_ret = await actionList[cmdStep.action](cmdStep, caseContent); // 0: 成功 1: 失败 2: 连接错误 3: 组合步骤进行暂停 4: 摄像头异常 5:无图片
		if (act_ret.ret == 3) {
			if (act_ret.data.length) {
				//
			}
			stopflag = true;
			break;
		}
		await notifyToLinkMgr({ type: ToLink, mode: 4, info: { step: cmdStep, ret: act_ret.ret, count: i + 1 } }); // 测试步骤执行结果通知
		if (act_ret.ret) {
			stepLoopList.push({ step_loop_idx: i, step_loop_ret: act_ret.ret, step_loop_info: act_ret.data });
			if (!caseInfo.config.test_info.error_exit) break;
		} else {
			await defaultDelay(idx, caseContent.case_steps);
		}
	}
	return new Promise((resolve) => {
		resolve({ stop: stopflag, data: stepLoopList });
	});
}

async function defaultDelay(index: any, caseSteps: any) {
	//current action or next action is wait,do not wait
	if (caseSteps[index].action != 'wait') {
		if (index < caseSteps.length - 1) {
			if (caseSteps[index + 1].action != 'wait') {
				await wait({ time: stepsWaitTime });
			}
		} else {
			await wait({ time: stepsWaitTime });
		}
	}
	return new Promise((resolve) => {
		resolve(0);
	});
}

async function wait(cmd: any, caseData?: any) {
	return new Promise((resolve) => {
		setTimeout(function() {
			resolve({ ret: 0 });
		}, cmd.time);
	});
}

async function click(cmd: any, caseData: any) {
	// 0:成功 1:失败 2:超时 5:无图片
	let result: any, note: any;
	let info = { screenPath: prjpath + '/tmp/tmp.png', cfg: caseInfo.config };
	let get_screen: any = await notifyToLinkMgr({ type: 'toDevice', job: 'cutScreen', info: info });
	if (get_screen) {
		let match_ret: any = await imageMatch(cmd);
		if (!match_ret.ret) result = 5;
		else {
			let match_num = Math.floor(match_ret.obj.val * 10000) / 100;
			if (match_ret.obj.valid || match_num >= caseInfo.config.test_info.match) {
				let msg: any = {
					x: match_ret.obj.x,
					y: match_ret.obj.y,
					click_type: cmd.click_type,
					cfg: caseInfo.config
				};
				if (cmd.click_type == '1') msg.time = cmd.click_time;
				let rev: any = await notifyToLinkMgr({ type: 'toDevice', job: 'click', info: msg });
				result = rev ? 0 : 2;
			} else {
				if (cmd.click_skip) result = 0;
				else if (!saveOneInMode || !caseInfo.config.test_info.error_exit) {
					// 点击不判断
					saveOneInMode = true;
					note = { image: '', screen: '', match: '' };
					note.image = prjpath + '/img/' + cmd.id + '.png';
					note.screen = prjpath + '/tmp/' + caseInfo.img_idx++ + '.png';
					note.match = match_num;
					await saveScreen(note.screen);
					result = 1;
				} else result = 1;
			}
		}
	} else result = 2;
	return new Promise((resolve) => {
		resolve({ ret: result, data: note });
	});
}

async function assertPic(cmd: any, caseData: any) {
	let result: any, note: any;
	let info = { screenPath: prjpath + '/tmp/tmp.png', cfg: caseInfo.config };
	let get_screen: any = await notifyToLinkMgr({ type: 'toDevice', job: 'cutScreen', info: info });
	if (get_screen) {
		let match_ret: any = await imageMatch(cmd);
		if (!match_ret.ret) result = 5;
		else {
			let match_num = Math.floor(match_ret.obj.val * 10000) / 100;
			if (match_ret.obj.valid || match_num >= caseInfo.config.test_info.match) result = 0;
			else {
				if (!saveOneInMode || !caseInfo.config.test_info.error_exit) {
					saveOneInMode = true;
					note = { image: '', screen: '', match: '' };
					note.image = prjpath + '/img/' + cmd.id + '.png';
					note.screen = prjpath + '/tmp/' + caseInfo.img_idx++ + '.png';
					note.match = match_num;
					await saveScreen(note.screen);
				}
				result = 1;
			}
		}
	} else result = 2;
	return new Promise((resolve) => {
		resolve({ ret: result, data: note });
	});
}

async function clickPoi(cmd: any, caseData: any) {
	let poi_info: any = await notifyToLinkMgr({
		type: ToDB,
		route: 'binding',
		job: 'getDoc',
		info: { prjname: prjname, id: cmd.id }
	});
	let msg: any = { x: poi_info.x1, y: poi_info.y1, click_type: cmd.click_type, cfg: caseInfo.config };
	if (cmd.click_type == '1') msg.time = cmd.click_time;
	let rev: any = await notifyToLinkMgr({ type: 'toDevice', job: 'click', info: msg });
	let result = rev ? 0 : 2;
	return new Promise((resolve) => {
		resolve({ ret: result });
	});
}

async function slide(cmd: any, caseData: any) {
	let slide_info: any = await notifyToLinkMgr({
		type: ToDB,
		route: 'binding',
		job: 'getDoc',
		info: { prjname: prjname, id: cmd.id }
	});
	let msg: any = {
		x1: slide_info.x1,
		y1: slide_info.y1,
		x2: slide_info.x2,
		y2: slide_info.y2,
		time: cmd.time != undefined ? cmd.time : 1000,
		cfg: caseInfo.config
	};
	let rev: any = await notifyToLinkMgr({ type: 'toDevice', job: 'slide', info: msg });
	let result = rev ? 0 : 2;
	return new Promise((resolve) => {
		resolve({ ret: result });
	});
}

async function button(cmd: any, caseData: any) {
	let buttonCmd: any = await notifyToLinkMgr({
		type: ToDB,
		route: 'buttons',
		job: 'getDoc',
		info: { prjname: prjname, id: cmd.id }
	});
	for (let i = 0; i < buttonCmd.content.length; i++) {
		if (i == 0 && caseInfo.config.da_server.others_flag) {
			await notifyToLinkMgr({
				type: 'toCom',
				job: 'sendData',
				info: { name: 'da_arm', cmd: 'others', msg: caseInfo.config.da_server }
			});
		}
		let ct = buttonCmd.content[i];
		for (let j = 0; j < ct.length; j++) {
			// 暂支持串口发送
			let info = { event: buttonCmd.event, ct: ct[j] };
			await notifyToLinkMgr({
				type: 'toCom',
				job: 'sendData',
				info: { name: 'da_arm', cmd: cmd.action, msg: info }
			});
		}
		if (cmd.click_type == '1') await wait({ time: cmd.click_time });
	}
	return new Promise((resolve) => {
		resolve({ ret: 0 });
	});
}

async function operateTool(cmd: any, caseData: any) {
	await notifyToLinkMgr({ type: 'toCom', job: 'sendData', info: { name: 'relay', cmd: cmd } });
	return new Promise((resolve) => {
		resolve({ ret: 0 });
	});
}

async function assertPto(cmd: any, caseData: any) {
	let get_pto: any = await notifyToLinkMgr({ type: 'toWeb', job: 'takePhoto' }); // 1:摄像头打开成功 0:失败
	let result: any, note: any;
	if (get_pto) {
		let match_ret: any = await imageMatch(cmd);
		if (!match_ret.ret) result = 5;
		else {
			let match_num = Math.floor(match_ret.obj.val * 10000) / 100;
			if (!match_ret.obj.valid && match_num <= caseInfo.config.test_info.match) {
				if (!saveOneInMode || !caseInfo.config.test_info.error_exit) {
					saveOneInMode = true;
					note = { image: '', screen: '', match: '' };
					note.image = prjpath + '/img/' + cmd.id + '.png';
					note.screen = prjpath + '/tmp/' + caseInfo.img_idx++ + '.png';
					note.match = match_num;
					await saveScreen(note.screen);
				}
				result = 1;
			} else result = 0;
		}
	} else result = 4;
	return new Promise((resolve) => {
		resolve({ ret: result, data: note });
	});
}

async function pcan(cmd: any, caseData: any) {
	let pcanCmd: any = await notifyToLinkMgr({
		type: ToDB,
		route: 'pcan',
		job: 'getDoc',
		info: { prjname: prjname, id: cmd.id }
	});
	for (let i = 0; i < pcanCmd.length; i++) {
		let pcan_data: any = [];
		let pcan_id = parseInt(pcanCmd[i].id, 16);
		for (let j = 0; j < pcanCmd[i].data.length; j++) {
			pcan_data.push(parseInt(pcanCmd[i].data[j], 16));
		}
		await notifyToLinkMgr({ type: 'toPcan', job: 'send', data: { data: new Buffer(pcan_data), id: pcan_id } });
		await wait({ time: 100 });
	}
	return new Promise((resolve) => {
		resolve({ ret: 0 });
	});
}

async function adbCmd(cmd: any, caseData: any) {
	let adbInfo = await notifyToLinkMgr({
		type: ToDB,
		route: 'adb',
		job: 'getDoc',
		info: { prjname: prjname, id: cmd.id }
	});
	let result = await notifyToLinkMgr({ type: 'toDevice', job: 'sendADB', info: adbInfo });
	return new Promise((resolve) => {
		resolve(result); // result 为对象
	});
}

async function qgBox(cmd: any, caseData: any) {
	if (cmd.b_type == undefined) cmd.b_type = '0';
	let data: any = await notifyToLinkMgr({
		type: 'toQgBox',
		info: { module: cmd.module, cfg: caseInfo.config.qg_box }
	});
	let result: any, note: any;
	if (!data.ret) {
		result =
			cmd.b_type == '0'
				? parseFloat(data.data) > cmd.b_volt ? 0 : 1
				: parseFloat(data.data) == cmd.b_volt ? 0 : 1;
		if (result) note = parseFloat(data.data);
	} else result = 2;
	return new Promise((resolve) => {
		resolve({ ret: result, data: note });
	});
}

async function group(cmd: any, caseData: any) {
	let groupContent: any = await notifyToLinkMgr({
		type: ToDB,
		route: 'group',
		job: 'getDoc',
		info: { prjname: prjname, id: cmd.id }
	});
	let groupStepLoopList: any = [],
		result: any;
	for (let j = 0; j < groupContent.length; j++) {
		// 0: 成功 1: 失败 2: 连接错误 3: 组合步骤进行暂停 4: 摄像头异常 5:无图片
		let cmdStep = groupContent[j];
		let stepLoop = cmdStep.loop != undefined ? cmdStep.loop : 1;
		for (let i = 0; i < stepLoop; i++) {
			if (!await notifyToLinkMgr({ type: 'get_status' })) {
				return new Promise((resolve) => {
					resolve({ ret: 3, data: groupStepLoopList });
				});
			}
			let act_ret = await actionList[cmdStep.action](cmdStep, caseData);
			if (act_ret.ret) {
				groupStepLoopList.push({
					g_idx: j,
					g_step_loop_idx: i,
					g_step_loop_ret: act_ret.ret,
					g_step_loop_info: act_ret.data
				});
			} else {
				await defaultDelay(j, groupContent);
			}
		}
		if (groupStepLoopList.length) {
			result = 1;
			break;
		} else result = 0;
	}
	return new Promise((resolve) => {
		resolve({ ret: result, data: groupStepLoopList });
	});
}

async function dbc(cmd: any, caseData: any) {
	let ret: number;
	if (caseInfo.dbcInfo.Messages_Info[cmd.module] != undefined) {
		let msg = {
			name: cmd.module,
			id: caseInfo.dbcInfo.Messages_Info[cmd.module].id,
			dlc: caseInfo.dbcInfo.Messages_Info[cmd.module].dlc
		};
		let sgn = caseInfo.dbcInfo.Signals_Info[cmd.id];
		let dbcCmd: any = await notifyToLinkMgr({ type: 'toDBC', info: { msg: msg, sgn: sgn, val: cmd.val } });
		await notifyToLinkMgr({ type: 'toPcan', job: 'send', data: dbcCmd });
		ret = 0;
	} else {
		ret = 1;
	}
	return new Promise((resolve) => {
		resolve({ ret: ret });
	});
}

async function saveScreen(screenPath: string) {
	let tmpPath = prjpath + '/tmp/tmp.png';
	Cvip.imageSave(tmpPath, screenPath, 16);
	return new Promise((resolve) => {
		resolve(1);
	});
}

async function imageMatch(cmd: any) {
	let tmpPath = prjpath + '/tmp/tmp.png';
	let imgPath = prjpath + '/img/' + cmd.id + '.png';
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

function outputFile(flag: any) {
	let stopInfo = flag ? { sid: caseInfo.start_idx, mid: caseInfo.img_idx } : { sid: 0, mid: 0 };
	fs.writeFileSync(prjpath + '/stopInfo.json', JSON.stringify(stopInfo));
}

async function readyForTest() {
	let ready_info: any;
	progress_info.total = caseInfo.caselist.length;
	if (progress_info.total) {
		let tmppath = prjpath + '/tmp';
		if (!fs.existsSync(tmppath)) fs.mkdirSync(tmppath);
		let uartsSet = new Set();
		let runtime = 0;
		LogOpen(uartsSet); // Log
		for (let i = caseInfo.start_idx; i < progress_info.total; i++) {
			let data = caseInfo.caselist[i];
			let case_run_time = 0;
			for (let j = 0; j < data.case_steps.length; j++) {
				if (uartsSet.size != caseInfo.com_len) await checkNeedCom(data.case_steps[j], uartsSet);
				if (data.case_steps[j].action == 'adb_cmd' && !adb_cmd_isExist) adb_cmd_isExist = true;
				else if (data.case_steps[j].action == 'pcan' && !pcan_isExist) pcan_isExist = true;
				else if (data.case_steps[j].action == 'dbc' && !dbc_isExist) {
					pcan_isExist = true;
					dbc_isExist = true;
				}
				if (data.case_steps[j].action == 'wait') case_run_time += data.case_steps[j].time;
				else {
					if (j < data.case_steps.length - 1) {
						let next_act = data.case_steps[j + 1].action;
						if (next_act != 'wait') case_run_time += stepsWaitTime;
					} else case_run_time += stepsWaitTime;
				}
			}
			case_run_time = case_run_time * data.case_mode;
			runtime += case_run_time;
		}
		let ret = uartsSet.size
			? await notifyToLinkMgr({ type: 'toCom', job: 'openCom', info: Array.from(uartsSet), cfg: caseInfo.config })
			: 1;
		ready_info = { ret: ret, runtime: runtime };
		if (!ret) ready_info.error_code = 0;
		else {
			// if ((ret && caseInfo.config.da_server.type == 1)||adb_cmd_isExist){
			// 检测ADB是否打开
			// if(!await notifyToLinkMgr({type:'toDevice',job:'checkADB'})){
			// 	ready_info.ret = 0;
			// 	ready_info.error_code = 2;
			// }
			// }
			if (pcan_isExist) {
				let pcan_status: any = await notifyToLinkMgr({
					type: 'toPcan',
					job: 'open',
					info: caseInfo.config.pcan_info
				});
				if (!pcan_status.ret) {
					ready_info.ret = 0;
					ready_info.error_code = 3;
				}
			}
			if (dbc_isExist) {
				let dbc_path = prjpath + '/dbc.json';
				if (!fs.existsSync(dbc_path)) {
					ready_info.ret = 0;
					ready_info.error_code = 4;
				} else {
					caseInfo.dbcInfo = JSON.parse(new util.TextDecoder().decode(fs.readFileSync(dbc_path)));
				}
			}
		}
	} else {
		ready_info = { ret: 0, error_code: 1 };
	}
	return new Promise((resolve) => {
		resolve(ready_info);
	});
}

function LogOpen(uartsSet: Set<any>) {
	if (caseInfo.config.log_info) {
		log_info.status = caseInfo.config.log_info.open;
		if (log_info.status) {
			if (!fs.existsSync(prjpath + '/log')) fs.mkdirSync(prjpath + '/log');
			if (!caseInfo.config.log_info.type) {
				// 检测Log串口是否共用
				let uartsInfo = caseInfo.config.uarts;
				if (uartsInfo.log.port == uartsInfo.relay.port) {
					log_info.id = 'relay';
					uartsSet.add('relay');
				} else if (uartsInfo.log.port == uartsInfo.da_arm.port) {
					log_info.id = 'da_arm';
					uartsSet.add('da_arm');
				} else {
					log_info.id = 'log';
					uartsSet.add('da_arm');
					caseInfo.com_len = 3;
				}
			} else adb_cmd_isExist = true;
		}
	}
}

async function startLog() {
	if (log_info.status) {
		// Log监听开始
		log_info.filename = prjpath + '/log/log.txt';
		if (!caseInfo.config.log_info.type) await notifyToLinkMgr({ type: 'toCom', job: 'openLog', info: log_info });
		else {
			log_info.adb_cmd = caseInfo.config.log_info.adb_cmd;
			await notifyToLinkMgr({ type: 'toDevice', job: 'openLog', info: log_info });
		}
	}
	return new Promise((resolve) => {
		resolve(1);
	});
}

async function checkNeedCom(cmd: any, uartsSet: Set<any>) {
	switch (cmd.action) {
		case 'operate_tool':
			if (!uartsSet.has('relay')) uartsSet.add('relay');
			break;
		case 'click':
			if (!uartsSet.has('da_arm') && caseInfo.config.da_server.type == 0) uartsSet.add('da_arm');
			break;
		case 'click_poi':
			if (!uartsSet.has('da_arm') && caseInfo.config.da_server.type == 0) uartsSet.add('da_arm');
			break;
		case 'slide':
			if (!uartsSet.has('da_arm') && caseInfo.config.da_server.type == 0) uartsSet.add('da_arm');
			break;
		case 'assert_pic':
			if (!uartsSet.has('da_arm') && caseInfo.config.da_server.type == 0) uartsSet.add('da_arm');
			break;
		case 'button':
			if (!uartsSet.has('da_arm')) uartsSet.add('da_arm');
			break;
		case 'group':
			let groupContent: any = await notifyToLinkMgr({
				type: ToDB,
				route: 'group',
				job: 'getDoc',
				info: { prjname: prjname, id: cmd.id }
			});
			for (let j = 0; j < groupContent.length; j++) {
				if (uartsSet.size != caseInfo.com_len) await checkNeedCom(groupContent[j], uartsSet);
			}
			break;
	}
	return new Promise((resolve) => {
		resolve({ ret: 0 });
	});
}

function readConfig() {
	let path = os.homedir() + '/data_store/config.json';
	caseInfo.config = JSON.parse(new util.TextDecoder().decode(fs.readFileSync(path)));
	if (caseInfo.config.test_info == undefined)
		caseInfo.config.test_info = { error_exit: 0, error_music: 1, match: 90 };
	if (caseInfo.config.pcan_info == undefined)
		caseInfo.config.pcan = { baudrate: 'baud_100k', hardware_type: 'ISA_82C200', io_port: '0100', interrupt: '3' };
}

async function readStopInfo() {
	let file_path = prjpath + '/stopInfo.json';
	if (fs.existsSync(file_path)) {
		let cnt = JSON.parse(new util.TextDecoder().decode(fs.readFileSync(file_path)));
		caseInfo.start_idx = cnt.sid;
		caseInfo.img_idx = cnt.mid;
	}
	if (caseInfo.start_idx == 0) {
		// 清空上次结果数据
		let ret = await notifyToLinkMgr({ type: 'toDB', route: 'results', job: 'clear', info: { prjname: prjname } });
	}
	return new Promise((resolve) => {
		resolve(1);
	});
}

function notifyToLinkMgr(info: any) {
	return new Promise((resolve) => {
		current_type = info.type;
		backCall = (val: any) => {
			resolve(val);
		};
		pis.write(info);
		// 通知界面无需等待返回 0: 初始化失败 1:初始化成功 2:用例开始测试 3: 测试完成 4: 步骤执行结果 5: 步骤开始执行 6: 暂停测试
		if (current_type == ToLink) backCall(1);
	});
}

async function endTest() {
	await notifyToLinkMgr({ type: 'toCom', job: 'closeCom' });
	await notifyToLinkMgr({ type: 'toPcan', job: 'close' });
	await notifyToLinkMgr({ type: 'toDevice', job: 'closeADB' });
	c.end();
	return new Promise((resolve) => {
		resolve(1);
	});
}

async function createdLink() {
	return new Promise((resolve) => {
		pos = new pack.unpackStream();
		pis = new pack.packStream();
		c = net.connect(6000, '127.0.0.1', () => {
			console.info('test_client connect!!!');
		});
		pos.on('data', (data: any) => {
			// console.log(data);
			switch (data.type) {
				case 'init':
					pis.write({ type: 'info', class: 'test', name: 'test' });
					break;
				case 'auth':
					resolve(1);
					break;
				default:
					if (backCall && data.type == current_type) {
						backCall(data.data);
					}
					break;
			}
		});
		pis.on('data', (data: any) => {
			c.write(data);
		});
		c.on('data', (data: any) => {
			pos.write(data);
		});
		c.on('close', () => {
			console.info('close test_client socket!!!');
		});
		c.on('error', () => {
			console.error('error');
			resolve(0);
		});
	});
}
