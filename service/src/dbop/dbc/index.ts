import { getModel } from './model';

function add(data: any, pis: any, DbcModel: any) {
	let info: any = data.info.msg;
	let model = new DbcModel({
		path: info.path
	});
	model.save(function(err: any, msg: any) {
		if (!err) {
			pis.write(data);
		}
	});
}

function modify(data: any, pis: any, DbcModel: any) {
	let info: any = data.info.msg;
	DbcModel.updateOne(
		{},
		{
			$set: {
				path: info.path
			}
		},
		function(err: any) {
			if (!err) {
				pis.write(data);
			}
		}
	);
}

function getDoc(data: any, pis: any, DbcModel: any) {
	DbcModel.find({}, { _id: 0, __v: 0 }, (err: any, msg: any) => {
		if (!err) {
			data.info = msg.length ? msg[0].path : '空';
			pis.write(data);
		}
	});
}

function disposeData(data: any, pis: any) {
	let DbcModel = getModel(data.info.prjname + '_dbc');
	switch (data.job) {
		case 'add':
			add(data, pis, DbcModel);
			break;
		case 'modify':
			modify(data, pis, DbcModel);
			break;
		case 'getDoc':
			getDoc(data, pis, DbcModel);
			break;
		default:
			break;
	}
}

export default { disposeData };
