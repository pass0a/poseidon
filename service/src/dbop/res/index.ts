import { getModel } from './model';

let latestVersion: any = {
	click: '图片点击',
	assert_pic: '图片判断',
	assert_pto: '拍摄判断',
	click_poi: '坐标点击',
	click_random: '随机点击',
	slide: '轨迹划动',
	wait: '等待',
	operate_tool: '操作工具板',
	button: '硬按键',
	qg_box: 'QG BOX',
	group: '组合步骤',
	adb_cmd: 'ADB指令',
	pcan: 'PCAN',
	dbc: 'DBC',
	bt_op: '操作蓝牙',
	power: '程控电源',
	bt_module: '蓝牙模块',
	freq: 'FREQ',
	bt_connect: '连接蓝牙',
	bt_incomingCall_1: '来电1',
	bt_incomingCall_2: '来电2',
	bt_answerCall: '接听电话',
	bt_terminateCall: '挂断电话',
	bt_disconnect: '断开蓝牙',
	'click_random-1': '屏幕尺寸',
	'operate_tool-1': '打开',
	'operate_tool-2': '关闭',
	'button-1': '面板按键',
	'button-2': '方控按键',
	'button-1-1': 'HOME',
	'module-1': 'System',
	'module-2': 'Radio'
};

function getList(data: any, pis: any, ResModel: any) {
	ResModel.aggregate(
		[
			{
				$project: {
					_id: 0,
					__v: 0
				}
			}
		],
		function(err: any, docs: any) {
			if (!err) {
				data.info = JSON.stringify(docs);
				pis.write(data);
			}
		}
	);
}

function add(data: any, pis: any, ResModel: any) {
	let info: any = data.info.msg;
	let model = new ResModel({
		id: info.id,
		name: info.name
	});
	model.save(function(err: any, msg: any) {
		if (!err) {
			data.info = true;
			pis.write(data);
		}
	});
}

function modify(data: any, pis: any, ResModel: any) {
	let info: any = data.info.msg;
	ResModel.updateOne(
		{ id: info.id },
		{
			$set: {
				name: info.name
			}
		},
		function(err: any) {
			if (!err) {
				data.info = true;
				pis.write(data);
			}
		}
	);
}

function newPrj(data: any, pis: any, ResModel: any) {
	let new_arr: any = [];
	for (let id in latestVersion) {
		new_arr.push({ id: id, name: latestVersion[id] });
	}
	// 工具板
	for (let i = 1; i < 3; i++) {
		for (let j = 1; j < 17; j++) {
			let opt: any = {
				id: 'operate_tool-' + i + '-' + j,
				name: '继电器_' + j
			};
			new_arr.push(opt);
		}
	}
	ResModel.insertMany(new_arr, function(err: any, msg: any) {
		if (!err) {
			data.info = true;
			pis.write(data);
		}
	});
}

function removeID(data: any, pis: any, ResModel: any) {
	let info: any = data.info.msg;
	ResModel.aggregate(
		[
			{
				$lookup: {
					from: data.info.prjname + '_rule',
					localField: 'id',
					foreignField: 'id',
					as: 'rule'
				}
			},
			{
				$match: {
					id: info.id
				}
			},
			{
				$project: {
					__v: 0,
					_id: 0,
					'rule._id': 0,
					'rule.__v': 0
				}
			}
		],
		function(err: any, docs: any) {
			if (!err) {
				if (docs.length && docs[0].rule.length) {
					let content: any = docs[0].rule[0].content;
					content.push(info.id);
					ResModel.deleteMany({ id: { $in: content } }, (err: any, msg: any) => {
						if (!err) {
							data.info.status = true;
							pis.write(data);
						}
					});
				} else {
					ResModel.deleteOne({ id: info.id }, function(err: any) {
						if (!err) {
							data.info.status = true;
							pis.write(data);
						}
					});
				}
			}
		}
	);
}

function updateVersion(data: any, pis: any, ResModel: any) {
	let up_data: any = [];
	for (let act of data.info.udata) {
		up_data.push({ id: act, name: latestVersion[act] });
		if (act == 'qg_box') up_data.push({ id: 'freq', name: 'FREQ' });
		else if (act == 'click_random') up_data.push({ id: 'click_random-1', name: '屏幕尺寸' });
		else if (act == 'bt_op') {
			up_data.push({ id: 'bt_module', name: '蓝牙模块' });
			up_data.push({ id: 'bt_connect', name: '连接蓝牙' });
			up_data.push({ id: 'bt_disconnect', name: '断开蓝牙' });
			up_data.push({ id: 'bt_incomingCall_1', name: '来电1' });
			up_data.push({ id: 'bt_incomingCall_2', name: '来电2' });
			up_data.push({ id: 'bt_answerCall', name: '接听电话' });
			up_data.push({ id: 'bt_terminateCall', name: '挂断电话' });
		}
	}
	ResModel.insertMany(up_data, function(err: any, msg: any) {
		if (!err) {
			pis.write(data);
		}
	});
}

function copyPrj(data: any, pis: any, ResModel: any) {
	ResModel.aggregate([ { $out: data.info.msg.name + '_res' } ], function(err: any) {
		if (!err) {
			data.info = true;
			pis.write(data);
		}
	});
}

function disposeData(data: any, pis: any) {
	let ResModel = getModel(data.info.prjname + '_res');
	switch (data.job) {
		case 'list':
			getList(data, pis, ResModel);
			break;
		case 'add':
			add(data, pis, ResModel);
			break;
		case 'modify':
			modify(data, pis, ResModel);
			break;
		case 'new':
			newPrj(data, pis, ResModel);
			break;
		case 'remove_id':
			removeID(data, pis, ResModel);
			break;
		case 'update_version':
			updateVersion(data, pis, ResModel);
			break;
		case 'copy':
			copyPrj(data, pis, ResModel);
			break;
		default:
			break;
	}
}

export default { disposeData };
