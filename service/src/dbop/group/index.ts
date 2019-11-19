import { getModel } from './model';

function getList(data: any, pis: any, GroupModel: any) {
	GroupModel.aggregate(
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
				data.route = 'group';
				data.info.data = JSON.stringify(docs);
				pis.write(data);
			}
		}
	);
}

function add(data: any, pis: any, GroupModel: any) {
	let info: any = data.info.msg;
	let model = new GroupModel({
		id: info.id,
		pid: info.pid,
		content: JSON.parse(info.grouplist)
	});
	model.save(function(err: any, msg: any) {
		if (!err) {
			data.info = true;
			pis.write(data);
		}
	});
}

function modify(data: any, pis: any, GroupModel: any) {
	let info: any = data.info.msg;
	GroupModel.updateOne(
		{ id: info.id },
		{
			$set: {
				content: JSON.parse(info.grouplist)
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

function removeID(data: any, pis: any, GroupModel: any) {
	let info: any = data.info.msg;
	if (info.type) {
		GroupModel.deleteMany({ pid: info.id }, (err: any, msg: any) => {
			if (!err) {
				data.info.status = true;
				pis.write(data);
			}
		});
	} else {
		GroupModel.deleteOne({ id: info.id }, function(err: any) {
			if (!err) {
				data.info.status = true;
				pis.write(data);
			}
		});
	}
}

function copyPrj(data: any, pis: any, GroupModel: any) {
	GroupModel.aggregate([ { $out: data.info.msg.name + '_group' } ], function(err: any) {
		if (!err) {
			data.info = true;
			pis.write(data);
		}
	});
}

function getDoc(data: any, pis: any, GroupModel: any) {
	GroupModel.findOne({ id: data.info.id }, { _id: 0, __v: 0 }, (err: any, msg: any) => {
		if (!err) {
			data.data = JSON.parse(JSON.stringify(msg)).content;
			pis.write(data);
		}
	});
}

function disposeData(data: any, pis: any) {
	let GroupModel = getModel(data.info.prjname + '_group');
	switch (data.job) {
		case 'list':
			getList(data, pis, GroupModel);
			break;
		case 'add':
			add(data, pis, GroupModel);
			break;
		case 'modify':
			modify(data, pis, GroupModel);
			break;
		case 'remove_id':
			removeID(data, pis, GroupModel);
			break;
		case 'copy':
			copyPrj(data, pis, GroupModel);
			break;
		case 'getDoc':
			getDoc(data, pis, GroupModel);
			break;
		default:
			break;
	}
}

export default { disposeData };
