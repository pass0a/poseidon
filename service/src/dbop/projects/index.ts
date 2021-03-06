import { getModel } from './model';
import * as mongodb from 'mongodb';

function addproject(data: any, pis: any, Projects: any) {
	let model = new Projects({
		name: data.info.msg.name,
		uid: createObjectID(data.info.uid)
	});
	model.save(function(err: any, info: any) {
		if (!err) {
			data.info.state = true;
			pis.write(data);
		}
	});
}

function existInList(data: any, pis: any, Projects: any) {
	Projects.findOne({ name: data.info.msg.name }, { __v: 0, _id: 0 }, function(err: any, info: any) {
		if (info) {
			data.info.state = false;
			pis.write(data);
		} else {
			addproject(data, pis, Projects);
		}
	});
}

function getList(data: any, pis: any, Projects: any) {
	Projects.aggregate(
		[
			{
				$project: {
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

function objectIDtoString(buffer: any) {
	let str: string = '';
	for (let buf of buffer) {
		if (buf < 16) str += '0';
		str += buf.toString(16);
	}
	return str;
}

function deleteProject(data: any, pis: any, Projects: any) {
	Projects.deleteOne({ name: data.info.prjname }, (err: any) => {});
}

function createObjectID(id: string) {
	return mongodb.ObjectId.createFromHexString(id);
}

function disposeData(data: any, pis: any) {
	let Projects = getModel('projects');
	switch (data.job) {
		case 'list':
			getList(data, pis, Projects);
			break;
		case 'add':
			existInList(data, pis, Projects);
			break;
		case 'removeAll':
			deleteProject(data, pis, Projects);
			break;
		default:
			break;
	}
}

export default { disposeData };
