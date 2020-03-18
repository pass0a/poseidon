import * as fs from 'fs';
import * as path from 'path';

let sqlImg_path: string = path.dirname(path.dirname(process.execPath)) + '/data_store/SQL/image';
if (!fs.existsSync(sqlImg_path)) {
	fs.mkdirSync(sqlImg_path);
}

function createTable(db: any) {
	let sql_order =
		'CREATE TABLE IMAGE(ID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,IMG_ID TEXT NOT NULL,PID INTEGER NOT NULL,VID INTEGER NOT NULL,UID INTEGER NOT NULL,DATE TIMESTAMP NOT NULL)';
	db.exec(sql_order);
}

function downloadImage(info: any) {
	let prjDir = sqlImg_path + '/ku';
	if (!fs.existsSync(prjDir)) {
		fs.mkdirSync(prjDir);
	}
	fs.writeFileSync(prjDir + '/' + info.imgId + '.png', info.buffer);
}

function disposeData(data: any, pis: any, db: any) {
	createTable(db);
	let info = data.info;
	switch (data.job) {
		case 'list':
			let list_order = 'SELECT * FROM IMAGE WHERE PID = ' + data.info.pid;
			db.exec(list_order);
			let imgCfg = data.info.imgCfg;
			let list = [];
			if (imgCfg == undefined) imgCfg = {};
			while (db.next()) {
				if (imgCfg[db.value(1)] == undefined || imgCfg[db.value(1)] != db.value(3)) {
					imgCfg[db.value(1)] = db.value(3);
					list.push({ imgId: db.value(1) });
				}
			}
			data.info = { imgCfg: imgCfg, downList: list };
			pis.write(data);
			break;
		case 'add':
			let find_order = 'SELECT * FROM IMAGE WHERE PID = ' + data.info.pid + ' AND IMG_ID = ' + data.info.imgId;
			db.exec(find_order);
			if (db.value(0) == null) {
				let add_order =
					"INSERT INTO IMAGE(ID,IMG_ID,PID,VID,UID,DATE) VALUES (NULL,?,?,1,1,datetime('now','localtime'));";
				db.exec(add_order, info.imgId, info.pid);
			} else {
				let update_order =
					"update image set vid=vid+1,uid=1,date=datetime('now','localtime') where pid=" +
					data.info.pid +
					' and img_id=' +
					data.info.imgId;
				db.exec(update_order);
			}
			downloadImage(info);
			let findvid_order = 'SELECT * FROM IMAGE WHERE PID = ' + data.info.pid + ' AND IMG_ID = ' + data.info.imgId;
			db.exec(findvid_order);
			data.info = db.value(3);
			pis.write(data);
			break;
		case 'downImg':
			let downList = data.info;
			let prjDir = sqlImg_path + '/ku/';
			for (let i = 0; i < downList.length; i++) {
				let buf = fs.readFileSync(prjDir + downList[i].imgId + '.png');
				pis.write({ route: 'image', job: 'downImg', info: { imgId: downList[i].imgId, buffer: buf } });
			}
			break;
		default:
			break;
	}
}
export default { disposeData };
