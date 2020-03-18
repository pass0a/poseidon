import { getModel } from './model';
import * as mongodb from 'mongodb';
import { getCaseModel } from '../cases/model';
import { getMrModel } from '../mrecods/model';

function getList(data: any, pis: any, DBModel: any) {
	DBModel.aggregate(
		[
			{
				$match: {
					module: data.info.module
				}
			},
			{
				$project: {
					__v: 0
				}
			},
			{
				$sort: {
					'case_info.case_id': 1
				}
			},
			{ $skip: data.info.skip },
			{ $limit: data.info.limit }
		],
		function(err: any, docs: any) {
			if (!err) {
				data.info = JSON.stringify(docs);
				pis.write(data);
			}
		}
	);
}

function add(data: any, pis: any, DBModel: any) {
	let info: any = data.info.msg;
	let CasesModel = getCaseModel(data.info.prjname + '_cases');
	CasesModel.aggregate(
		[
			{
				$match: {
					_id: createObjectID(info.cid)
				}
			},
			{
				$project: {
					__v: 0,
					_id: 0
				}
			}
		],
		function(err: any, msg1: any) {
			if (!err) {
				let model = new DBModel({
					cid: createObjectID(info.cid),
					module: info.module,
					start_time: info.start_time,
					result: info.result,
					case_info: msg1[0],
					fail_info: info.fail_info,
					tested_mode: info.tested_mode
				});
				model.save(function(err: any, msg2: any) {
					if (!err) {
						data.info = '';
						data.data = true;
						pis.write(data);
					}
				});
			}
		}
	);
}

function clear(data: any, pis: any, DBModel: any) {
	DBModel.deleteMany({}, function(err: any) {
		if (!err) {
			data.data = true;
			pis.write(data);
		}
	});
}

function getTotal(data: any, pis: any, DBModel: any) {
	DBModel.countDocuments({ module: data.info.module }, function(err: any, count: any) {
		if (!err) {
			data.info.count = count;
			pis.write(data);
		}
	});
}

function getInfo(data: any, pis: any, DBModel: any) {
	let end = 3;
	DBModel.aggregate(
		[
			{
				$group: {
					_id: null,
					endTime: { $max: '$end_time' },
					startTime: { $min: '$start_time' }
				}
			}
		],
		function(err: any, docs: any) {
			if (!err && docs.length) {
				data.info.endTime = docs[0].endTime;
				data.info.startTime = docs[0].startTime;
				end--;
				if (!end) pis.write(data);
			}
		}
	);
	DBModel.countDocuments({ result: 0 }, function(err: any, count: any) {
		if (!err) {
			end--;
			data.info.ok = count;
			if (!end) pis.write(data);
		}
	});
	DBModel.countDocuments({ result: { $ne: 0 } }, function(err: any, count: any) {
		if (!err) {
			end--;
			data.info.ng = count;
			if (!end) pis.write(data);
		}
	});
}

function getRet(data: any, pis: any, DBModel: any) {
	let end = 2;
	DBModel.countDocuments({ result: 0 }, function(err: any, count: any) {
		if (!err) {
			end--;
			data.data.ok = count;
			if (!end) pis.write(data);
		}
	});
	DBModel.countDocuments({ result: { $ne: 0 } }, function(err: any, count: any) {
		if (!err) {
			end--;
			data.data.ng = count;
			if (!end) pis.write(data);
		}
	});
}

function modify(data: any, pis: any, DBModel: any) {
	let info: any = data.info.msg;
	DBModel.updateOne(
		{ cid: createObjectID(info.cid) },
		{
			$set: {
				result: info.result,
				fail_info: info.fail_info,
				tested_mode: info.tested_mode
			}
		},
		function(err: any) {
			if (!err) {
				data.info = '';
				data.data = true;
				pis.write(data);
			}
		}
	);
}

function changeRet(data: any, pis: any, DBModel: any) {
	let info: any = data.info;
	DBModel.updateOne(
		{ _id: createObjectID(info.id) },
		{
			$set: {
				result: info.ret
			}
		},
		function(err: any, doc: any) {
			if (!err) {
				pis.write(data);
			}
		}
	);
}

function uploadResult(data: any, pis: any, DBModel: any) {
	let info = data.info;
	let condition: any;
	switch (info.ct) {
		case 0:
			condition = {};
			break;
		case 1:
			condition = { result: 0 };
			break;
		case 2:
			condition = { result: 1 };
			break;
		default:
			break;
	}
	DBModel.aggregate(
		[
			{
				$match: condition
			},
			{
				$project: {
					__v: 0,
					case_info: 0,
					module: 0,
					start_time: 0,
					fail_info: 0,
					end_time: 0,
					tested_mode: 0
				}
			}
		],
		function(err: any, docs: any) {
			if (!err) {
				if (docs.length > 0) {
					let endflag = 0;
					for (let i = 0; i < docs.length; i++) {
						(function(i) {
							let query = { pid: info.pid, vid: info.vid, cid: docs[i].cid };
							let ret = docs[i].result == 0 ? 'OK' : 'NG';
							let MrModel = getMrModel('mrecods');
							MrModel.findOneAndUpdate(query, { $set: { result: ret, test_type: 'auto_test' } }, function(
								err: any,
								msg: any
							) {
								if (msg) {
									endflag++;
									if (endflag == docs.length) {
										data.info = true;
										pis.write(data);
									}
								} else {
									let model = new MrModel({
										pid: info.pid,
										vid: info.vid,
										cid: docs[i].cid,
										result: ret,
										test_type: 'auto_test'
									});
									model.save(function(err: any) {
										if (!err) {
											endflag++;
											if (endflag == docs.length) {
												data.info = true;
												pis.write(data);
											}
										}
									});
								}
							});
						})(i);
					}
				} else {
					data.info = true;
					pis.write(data);
				}
			}
		}
	);
}

function createObjectID(id: string) {
	return mongodb.ObjectId.createFromHexString(id);
}

function disposeData(data: any, pis: any) {
	let DBModel = getModel(data.info.prjname + '_results');
	switch (data.job) {
		case 'list':
			getList(data, pis, DBModel);
			break;
		case 'add':
			add(data, pis, DBModel);
			break;
		case 'clear':
			clear(data, pis, DBModel);
			break;
		case 'total':
			getTotal(data, pis, DBModel);
			break;
		case 'info':
			getInfo(data, pis, DBModel);
			break;
		case 'getRet':
			getRet(data, pis, DBModel);
			break;
		case 'modify':
			modify(data, pis, DBModel);
			break;
		case 'changeRet':
			changeRet(data, pis, DBModel);
			break;
		case 'upload':
			uploadResult(data, pis, DBModel);
			break;
		default:
			break;
	}
}

export default { disposeData };
